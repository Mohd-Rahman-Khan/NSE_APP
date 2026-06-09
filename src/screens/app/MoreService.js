import { ScrollView, StyleSheet, View, Animated, Easing } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import WrapperContainer from "../../utils/WrapperContainer";
import CustomHeader from "../../components/CustomHeader";
import ImagePath from "../../utils/ImagePath";
import CustomSearchBox from "../../components/CustomSearchBox";
import {
  moderateScale,
  moderateScaleVertical,
} from "../../utils/responsiveSize";
import SwiperImage from "../../components/SwiperImage";
import BrowseProduct from "./home/BrowseProduct";
import Colors from "../../utils/Colors";
import { getUserData, removeUserData } from "../../utils/Storage";
import { decryptAES, encryptWholeObject } from "../../utils/decryptData";
import { apiRequest } from "../../services/APIRequest";
import { API_ROUTES } from "../../services/APIRoutes";
import { clearUserData } from "../../redux/slice/UserSlice";
import { showSuccessMessage } from "../../utils/HelperFunction";
import { useDispatch } from "react-redux";
import en from "../../constants/en";
import { ROLES } from "../../constants/userRole";
import { useIsFocused } from "@react-navigation/native";

const MoreService = () => {
  const [searchText, setSearchText] = useState("");
  const [userData, setUserData] = useState("");
  const [isLoading, setisLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const headerSlideAnim = useRef(new Animated.Value(-100)).current;
  const searchSlideAnim = useRef(new Animated.Value(100)).current;
  const productOpacityAnim = useRef(new Animated.Value(0)).current;
  const productTranslateAnim = useRef(new Animated.Value(20)).current;
  const dispatch = useDispatch();
  const [browseProductList, setbrowseProductList] = useState([]);

  const isFocused = useIsFocused();

  useEffect(() => {
    // Sequence of animations when component mounts
    Animated.parallel([
      // Header animation
      Animated.timing(headerSlideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }),

      // Search box animation
      Animated.timing(searchSlideAnim, {
        toValue: 0,
        duration: 600,
        delay: 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }),

      // Banner animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          delay: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          delay: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          delay: 200,
          useNativeDriver: true,
        }),
      ]),

      // Product list animation
      Animated.parallel([
        Animated.timing(productOpacityAnim, {
          toValue: 1,
          duration: 1000,
          delay: 400,
          useNativeDriver: true,
        }),
        Animated.timing(productTranslateAnim, {
          toValue: 0,
          duration: 1000,
          delay: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  useEffect(() => {
    if (isFocused) {
      fethchUserprofileData();
    }
  }, [isFocused]);

  const fethchUserprofileData = async () => {
    setisLoading(true);
    const userData = await getUserData();
    console.log("userData", userData);
    setUserData(userData);

    try {
      const payloadData = {
        id: userData?.employeeId,
      };
      const encryptedPayload = encryptWholeObject(payloadData);
      const response = await apiRequest(
        API_ROUTES.PROFILE_DETAILS,
        "post",
        encryptedPayload,
      );
      const decrypted = decryptAES(response);
      const parsedDecrypted = JSON.parse(decrypted);

      if (parsedDecrypted && parsedDecrypted?.statusCode === "401") {
        setTimeout(() => {
          dispatch(clearUserData());
          removeUserData();
          showSuccessMessage(en?.PROFILE.LOGOUT_SUCCESS);
        }, 500);
      }
    } catch (error) {
    } finally {
    }

    updateDashboardOptions(userData);
    //hardCodedDashboardOptions(userData);
  };

  // const hardCodedDashboardOptions = (userData) => {
  //   if (
  //     userData?.roleName?.includes(ROLES.CHAK) ||
  //     userData?.roleName?.includes(ROLES.MECHANICAL_BLOCK_ENGG) ||
  //     userData?.roleName?.includes(ROLES.BLOK)
  //   ) {
  //     setbrowseProductList([
  //       {
  //         id: 2,
  //         name: "Daily Progress Reports",
  //         icon: ImagePath.registrationIcon,
  //         backgroundColor: Colors.bg2,

  //         navigationScreenName: "SquarePlanList",
  //       },
  //       ...browseProductList,
  //     ]);
  //     return;
  //   }
  //   if (userData?.roleName?.includes(ROLES.AO_QC_INCHARGE)) {
  //     setbrowseProductList([
  //       {
  //         id: 1,
  //         name: "Field Inspection Reports",
  //         icon: ImagePath.complaint,
  //         backgroundColor: Colors.bg1,
  //         navigationScreenName: "FieldInspectionReport",
  //       },
  //       ...browseProductList,
  //     ]);
  //     return;
  //   }

  //   if (userData?.roleName?.includes(ROLES.AO_MKT_INCHARGE)) {
  //     setbrowseProductList([
  //       {
  //         id: 3,
  //         name: "Dealer Indent",
  //         icon: ImagePath.complaint,
  //         backgroundColor: Colors.bg3,
  //         navigationScreenName: "DealerIndentsList",
  //       },
  //       ...browseProductList,
  //     ]);
  //     return;
  //   }
  // };

  const updateDashboardOptions = (userData) => {
    const applicationRoles = userData?.applicationRole
      ? JSON.parse(userData.applicationRole)
      : [];

    //console.log("applicationRoles", applicationRoles);

    const hasRole = (role) =>
      applicationRoles?.some((item) => item.applicationRoleName === role);

    const menuList = [];

    if (hasRole("FARM FIR") || hasRole("FARM_FIR")) {
      menuList.push({
        id: 1,
        name: "Field Inspection Reports",
        icon: ImagePath.complaint,
        backgroundColor: Colors.bg1,
        navigationScreenName: "FieldInspectionReport",
      });
    }

    if (
      hasRole("DPR") ||
      hasRole("CROP_DPR_CREATE") ||
      hasRole("DPR_ENG") ||
      hasRole("EPO_DPR_CREATE")
    ) {
      menuList.push({
        id: 2,
        name: "Daily Progress Reports",
        icon: ImagePath.registrationIcon,
        backgroundColor: Colors.bg2,
        navigationScreenName: "SquarePlanList",
      });
    }

    if (hasRole("DEALER_INDENT")) {
      menuList.push({
        id: 3,
        name: "Dealer Indent",
        icon: ImagePath.complaint,
        backgroundColor: Colors.bg3,
        navigationScreenName: "DealerIndentsList",
      });
    }

    let updatedMenu = [
      ...menuList,
      {
        id: 11,
        name: "Scanner",
        icon: ImagePath.qrscanner,
        backgroundColor: "#ffff99",
        navigationScreenName: "ScanQrCode",
      },
    ];

    setbrowseProductList(updatedMenu);
    setisLoading(false);
  };

  return (
    <WrapperContainer isLoading={isLoading}>
      <View style={styles.main}>
        <Animated.View
          style={{
            transform: [{ translateY: headerSlideAnim }],
          }}
        >
          <CustomHeader data={userData} />
        </Animated.View>

        {/* <Animated.View
          style={{
            transform: [{ translateX: searchSlideAnim }],
          }}
        >
          <CustomSearchBox
            value={searchText}
            onChangeText={(text) => setSearchText(text)}
            resetSearchText={() => setSearchText("")}
          />
        </Animated.View> */}

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Banner Images with animation */}
          {/* <Animated.View
            style={{
              height: moderateScale(175),
              marginVertical: moderateScaleVertical(10),
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            }}
          >
            <SwiperImage bannerImageList={bannerImageList} />
          </Animated.View> */}

          {/* Browse Product with animation */}
          <Animated.View
            style={{
              //marginTop: moderateScaleVertical(25),
              marginHorizontal: moderateScale(10),
              opacity: productOpacityAnim,
              transform: [{ translateY: productTranslateAnim }],
            }}
          >
            <BrowseProduct
              browseProductList={browseProductList}
              animated={true}
              userData={userData}
            />
          </Animated.View>
        </ScrollView>

        <View style={{ marginBottom: moderateScaleVertical(80) }}>
          {/* <LowerBanner /> */}
        </View>
      </View>
    </WrapperContainer>
  );
};

export default MoreService;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    gap: moderateScaleVertical(5),
  },
});

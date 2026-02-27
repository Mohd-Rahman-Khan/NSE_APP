import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import {
  moderateScale,
  moderateScaleVertical,
  scale,
  textScale,
} from "../../../utils/responsiveSize";
import FontFamily from "../../../utils/FontFamily";
import Colors from "../../../utils/Colors";
import { useNavigation } from "@react-navigation/native";
import PropTypes from "prop-types";
import CustomBottomSheet from "../../../components/CustomBottomSheet";
import ImagePath from "../../../utils/ImagePath";

const BrowseProduct = ({ browseProductList, userData }) => {
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const navigation = useNavigation();
  return (
    <View style={{ padding: moderateScale(10) }}>
      <Text style={styles.headerText}>Browse Products</Text>
      <CustomBottomSheet
        visible={bottomSheetVisible}
        onRequestClose={() => setBottomSheetVisible(false)}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("OrchardProcessAllocation");
            }}
            style={styles.item}
          >
            <View
              style={[
                styles.imageView,
                {
                  borderColor: Colors.bg2,
                  backgroundColor: Colors.bg2,
                },
              ]}
            >
              <Image
                source={ImagePath.registrationIcon}
                resizeMode="contain"
                style={{
                  width: moderateScale(40),
                  height: moderateScale(40),
                }}
              />
            </View>
            <Text style={styles.nameText}>Orchard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.item}
            onPress={() => {
              navigation.navigate("NurseryProductionPlan");
            }}
          >
            <View
              style={[
                styles.imageView,
                {
                  borderColor: Colors.bg2,
                  backgroundColor: Colors.bg2,
                },
              ]}
            >
              <Image
                source={ImagePath.registrationIcon}
                resizeMode="contain"
                style={{
                  width: moderateScale(40),
                  height: moderateScale(40),
                }}
              />
            </View>
            <Text style={styles.nameText}>Nursery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => {}}>
            <View
              style={[
                styles.imageView,
                {
                  borderColor: Colors.bg2,
                  backgroundColor: Colors.bg2,
                },
              ]}
            >
              <Image
                source={ImagePath.registrationIcon}
                resizeMode="contain"
                style={{
                  width: moderateScale(40),
                  height: moderateScale(40),
                }}
              />
            </View>
            <Text style={styles.nameText}>Flori/Vege Culture</Text>
          </TouchableOpacity>
        </View>
      </CustomBottomSheet>
      <View style={styles.main} showsVerticalScrollIndicator={false}>
        {browseProductList?.map((item) => (
          <View key={item.id} style={styles.itemHolder}>
            <TouchableOpacity
              style={styles.item}
              onPress={() => {
                if (item?.navigationScreenName) {
                  if (item?.name == "Daily Progress Reports") {
                    const findMachenicalRole = userData?.roleName?.includes(
                      "FARM_BLOCK_ENGG_INCHARGE",
                    );
                    const findEPOIncharge =
                      userData?.roleName?.includes("EPO_INCHARGE");

                    //console.log("findRole", findRole);
                    if (findMachenicalRole) {
                      //setBottomSheetVisible(true);
                      navigation.navigate("MechanicalAllocationProcessList");
                      return;
                    }
                    if (findEPOIncharge) {
                      setBottomSheetVisible(true);
                      return;
                    }
                    navigation.navigate(item.navigationScreenName);
                  } else {
                    navigation.navigate(item.navigationScreenName);
                  }
                } else {
                  console.warn(
                    "No navigationScreenName provided for this item",
                  );
                }
              }}
            >
              <View
                style={[
                  styles.imageView,
                  {
                    borderColor: item?.backgroundColor,
                    backgroundColor: item?.backgroundColor,
                  },
                ]}
              >
                <Image
                  source={item?.icon}
                  resizeMode="contain"
                  style={{
                    width: moderateScale(40),
                    height: moderateScale(40),
                  }}
                />
              </View>
              <Text style={styles.nameText}>{item?.name}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

BrowseProduct.propTypes = {
  browseProductList: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      icon: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.shape({ uri: PropTypes.string }),
      ]).isRequired,
      backgroundColor: PropTypes.string.isRequired,
      navigationScreenName: PropTypes.string,
    }),
  ).isRequired,
};

export default BrowseProduct;

const styles = StyleSheet.create({
  headerText: {
    fontFamily: FontFamily.PoppinsMedium,
    fontSize: textScale(14),
    color: Colors.black,
    letterSpacing: scale(0.3),
    textTransform: "capitalize",
  },
  nameText: {
    fontFamily: FontFamily.PoppinsRegular,
    color: Colors.textColor,
    fontSize: textScale(12),
    width: moderateScale(125),
    textAlign: "center",
    textTransform: "capitalize",
    letterSpacing: scale(0.2),
  },
  main: {
    marginTop: moderateScaleVertical(10),
    flexDirection: "row",
    flexWrap: "wrap",
    // alignItems: "center",
    justifyContent: "space-around",
  },
  itemHolder: {
    alignItems: "center",
    margin: moderateScale(10),
  },
  item: {
    gap: moderateScale(10),
    alignItems: "center",
    justifyContent: "center",
  },
  imageView: {
    width: moderateScale(75),
    height: moderateScale(75),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: moderateScale(100),
  },
});

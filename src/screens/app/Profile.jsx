import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import WrapperContainer from "../../utils/WrapperContainer";
import ImagePath from "../../utils/ImagePath";
import CustomHeader from "../../components/CustomHeader";
import Colors from "../../utils/Colors";
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
  scale,
} from "../../utils/responsiveSize";
import FontFamily from "../../utils/FontFamily";
import Ionicons from "react-native-vector-icons/Ionicons";
import { apiRequest } from "../../services/APIRequest";
import { API_ROUTES } from "../../services/APIRoutes";
import { decryptAES, encryptWholeObject } from "../../utils/decryptData";
import { showErrorMessage } from "../../utils/HelperFunction";
import { getUserData } from "../../utils/Storage";
import { useNavigation } from "@react-navigation/native";
import en from "../../constants/en";
import PropTypes from "prop-types";

// Reusable DetailRow component
const DetailRow = ({ label, value, index }) => {
  const rowFadeAnim = useRef(new Animated.Value(0)).current;
  const rowSlideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(rowFadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(rowSlideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, rowFadeAnim, rowSlideAnim]);

  return (
    <Animated.View
      style={[
        styles.row,
        {
          opacity: rowFadeAnim,
          transform: [{ translateY: rowSlideAnim }],
        },
      ]}
    >
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value}</Text>
    </Animated.View>
  );
};

DetailRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  index: PropTypes.number.isRequired,
};

// Reusable NavigationTab component
const NavigationTab = ({
  fadeAnim,
  slideAnim,
  activeSection,
  handleTabChange,
  en,
  styles,
}) => (
  <Animated.View
    style={[
      styles.navContainer,
      {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      },
    ]}
  >
    {["personal", "professional", "contact"].map((section) => (
      <TouchableOpacity
        key={section}
        style={[
          styles.navItem,
          activeSection === section && styles.activeNavItem,
        ]}
        onPress={() => handleTabChange(section)}
        activeOpacity={0.7}
      >
        <Animated.Text
          style={[
            styles.navText,
            activeSection === section && styles.activeNavText,
          ]}
        >
          {en.PROFILE.NAVIGATION[section.toUpperCase()]}
        </Animated.Text>
      </TouchableOpacity>
    ))}
  </Animated.View>
);

NavigationTab.propTypes = {
  fadeAnim: PropTypes.object.isRequired,
  slideAnim: PropTypes.object.isRequired,
  activeSection: PropTypes.string.isRequired,
  handleTabChange: PropTypes.func.isRequired,
  en: PropTypes.object.isRequired,
  styles: PropTypes.object.isRequired,
};

// Reusable SectionCard component
const SectionCard = ({ title, details }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    {details.map((item, index) => (
      <DetailRow
        key={item.id || item.label}
        label={item.label}
        value={item.value}
        index={index}
      />
    ))}
  </View>
);

SectionCard.propTypes = {
  title: PropTypes.string.isRequired,
  details: PropTypes.array.isRequired,
};

// Helper function to create detail items
const createDetailItem = (
  label,
  value,
  profileData,
  fallback = en.PROFILE.NOT_AVAILABLE
) => ({
  label,
  value: profileData?.[value] || fallback,
});

// Helper function to create nested detail items
const createNestedDetailItem = (
  label,
  nestedKeys,
  profileData,
  fallback = en.PROFILE.NOT_AVAILABLE
) => {
  let value = profileData;
  for (const key of nestedKeys) {
    value = value?.[key];
    if (!value) break;
  }
  return {
    label,
    value: value || fallback,
  };
};

const Profile = () => {
  const [activeSection, setActiveSection] = useState("personal");
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const tabScaleAnim = useRef(new Animated.Value(1)).current;
  const navigation = useNavigation();
  console.log(profileData, "profileData");
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const userData = {
    name: "Ashish Ranjan",
    userProfileImage: ImagePath.userProfile,
  };

  useEffect(() => {
    fethchUserprofileData();
  }, []);

  const fethchUserprofileData = async () => {
    const userData = await getUserData();
    try {
      const payloadData = {
        id: userData?.employeeId,
      };
      setLoading(true);
      const encryptedPayload = encryptWholeObject(payloadData);
      const response = await apiRequest(
        API_ROUTES.PROFILE_DETAILS,
        "post",
        encryptedPayload
      );
      const decrypted = decryptAES(response);
      const parsedDecrypted = JSON.parse(decrypted);

      if (
        parsedDecrypted &&
        parsedDecrypted?.status === "SUCCESS" &&
        parsedDecrypted?.statusCode === "200"
      ) {
        setProfileData(parsedDecrypted?.data);
      } else {
        showErrorMessage(en.PROFILE.ERROR);
      }
    } catch (error) {
      console.log(error, "line Error in Catch Bloack");
    } finally {
      setLoading(false);
    }
  };

  // Profile data configuration
  const profileDetailsConfig = [
    { label: en.PROFILE.EMPLOYEE_ID, key: "empCode" },
    { label: en.PROFILE.EMAIL, key: "emailId" },
  ];

  const personalDetailsConfig = [
    { label: en.PROFILE.DETAILS.FULL_NAME, key: "firstName" },
    { label: en.PROFILE.DETAILS.GENDER, key: "gender" },
    { label: en.PROFILE.DETAILS.DATE_OF_BIRTH, key: "dob" },
    { label: en.PROFILE.DETAILS.CONTACT, key: "mobileNo" },
    { label: en.PROFILE.DETAILS.BLOOD_GROUP, key: "bloodGroup" },
    { label: en.PROFILE.DETAILS.RELIGION, key: "religion" },
    { label: en.PROFILE.DETAILS.STATE, nestedKeys: ["state", "name"] },
    {
      label: en.PROFILE.DETAILS.NATIONALITY,
      nestedKeys: ["nationality", "name"],
    },
    { label: en.PROFILE.DETAILS.CATEGORY, key: "empCategory" },
    { label: en.PROFILE.DETAILS.FATHERS_NAME, key: "fatherName" },
    { label: en.PROFILE.DETAILS.SPOUSE_NAME, key: "spouseName" },
    {
      label: en.PROFILE.DETAILS.IDENTIFICATION_MARK_1,
      key: "identificationMarkOne",
    },
    {
      label: en.PROFILE.DETAILS.IDENTIFICATION_MARK_2,
      key: "identificationMarkTwo",
    },
  ];

  const professionalDetailsConfig = [
    { label: en.PROFILE.EMPLOYEE_ID, key: "empCode" },
    { label: en.PROFILE.DETAILS.EMPLOYMENT_TYPE, key: "employmentType" },
    { label: en.PROFILE.DETAILS.GRADE_ID, nestedKeys: ["grade", "id"] },
    { label: en.PROFILE.DETAILS.GRADE_NAME, nestedKeys: ["grade", "name"] },
    { label: en.PROFILE.DETAILS.GRADE_SHORT_NAME, key: "gradeShortName" },
    {
      label: en.PROFILE.DETAILS.DESIGNATION,
      nestedKeys: ["designation", "name"],
    },
    {
      label: en.PROFILE.DETAILS.DEPARTMENT,
      nestedKeys: ["department", "name"],
    },
    { label: en.PROFILE.DETAILS.DATE_OF_APPOINTMENT, key: "dateOfAppointment" },
    { label: en.PROFILE.DETAILS.UNIT_TYPE, key: "unitType" },
    { label: en.PROFILE.DETAILS.OFFICE_PHONE, key: "officePhone" },
    { label: en.PROFILE.DETAILS.DOJ_THE_DESIGNATION, key: "designationDate" },
    { label: en.PROFILE.DETAILS.DOJ_THE_DEPARTMENT, key: "departmentDate" },
    { label: en.PROFILE.DETAILS.UNIT_DATE, key: "unitDate" },
    {
      label: en.PROFILE.DETAILS.RO_NAME,
      nestedKeys: ["regionalOffice", "name"],
    },
    { label: en.PROFILE.DETAILS.AO_NAME, nestedKeys: ["areaOffice", "name"] },
  ];

  const contactDetailsConfig = [
    { label: en.PROFILE.DETAILS.PHONE, key: "mobileNo" },
    { label: en.PROFILE.DETAILS.OFFICE_PHONE, key: "officePhone" },
    { label: en.PROFILE.DETAILS.RESIDENCE_PHONE, key: "residancePhone" },
    { label: en.PROFILE.DETAILS.PERMANENT_ADDRESS, key: "permanentAdd" },
    { label: en.PROFILE.DETAILS.PERMANENT_ADDRESS_PINCODE, key: "pinCode" },
    { label: en.PROFILE.DETAILS.RESIDENTIAL_ADDRESS, key: "temporaryAddress" },
  ];

  // Helper function to generate details array from config
  const generateDetails = (config) => {
    return config.map((item) => {
      if (item.nestedKeys) {
        return createNestedDetailItem(item.label, item.nestedKeys, profileData);
      }
      return createDetailItem(item.label, item.key, profileData);
    });
  };

  // Generate detail arrays
  const profileDetails = generateDetails(profileDetailsConfig);
  const personalDetails = generateDetails(personalDetailsConfig);
  const professionalDetails = generateDetails(professionalDetailsConfig);
  const contactDetails = generateDetails(contactDetailsConfig);

  // Section configuration
  const sectionConfig = {
    personal: {
      title: en.PROFILE.SECTIONS.PERSONAL_DETAILS,
      details: personalDetails,
    },
    professional: {
      title: en.PROFILE.SECTIONS.PROFESSIONAL_DETAILS,
      details: professionalDetails,
    },
    contact: {
      title: en.PROFILE.SECTIONS.CONTACT_DETAILS,
      details: contactDetails,
    },
  };

  const renderSection = () => {
    const section = sectionConfig[activeSection];
    if (!section) return null;

    return <SectionCard title={section.title} details={section.details} />;
  };

  // Handle tab change with animation
  const handleTabChange = (section) => {
    Animated.sequence([
      Animated.timing(tabScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(tabScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActiveSection(section);
    });
  };

  return (
    <WrapperContainer isLoading={loading}>
      <CustomHeader data={userData} />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.profileCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <Animated.Image
            source={ImagePath.userProfile}
            style={[
              styles.profileImage,
              {
                transform: [
                  {
                    rotate: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "360deg"],
                    }),
                  },
                ],
              },
            ]}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>
              {profileData?.firstName || en.PROFILE.NOT_AVAILABLE}{" "}
              {profileData?.lastName || ""}
            </Text>
            {profileDetails.map((item, index) => (
              <Animated.Text
                key={item.label}
                style={[
                  styles.userDetail,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateX: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {item.label}: {item.value}
              </Animated.Text>
            ))}
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate("EditUserProfile")}
          >
            <Ionicons
              name="pencil"
              size={moderateScale(15)}
              color={Colors.white}
            />
          </TouchableOpacity>
        </Animated.View>
        <NavigationTab
          fadeAnim={fadeAnim}
          slideAnim={slideAnim}
          activeSection={activeSection}
          handleTabChange={handleTabChange}
          en={en}
          styles={styles}
        />
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {renderSection()}
        </Animated.View>
      </ScrollView>
    </WrapperContainer>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    padding: moderateScale(10),
    paddingBottom: moderateScaleVertical(80),
  },
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(10),
    padding: moderateScale(8),
    marginBottom: moderateScaleVertical(15),
    shadowColor: Colors.black,
    shadowOpacity: scale(0.1),
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: moderateScale(5),
    elevation: moderateScale(3),
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    marginRight: moderateScale(15),
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: textScale(14),
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.greenColor,
    marginBottom: moderateScaleVertical(4),
    textTransform: "capitalize",
  },
  userDetail: {
    fontSize: textScale(12),
    fontFamily: FontFamily.PoppinsRegular,
    color: Colors.textGray,
    marginBottom: moderateScaleVertical(2),
  },
  editButton: {
    backgroundColor: Colors.greenColor,
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(15),
    justifyContent: "center",
    alignItems: "center",
  },
  navContainer: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),
    marginBottom: moderateScaleVertical(15),
    padding: moderateScale(3),
    shadowColor: Colors.black,
    shadowOpacity: scale(0.1),
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: moderateScale(5),
    elevation: moderateScale(3),
  },
  navItem: {
    flex: 1,
    paddingVertical: moderateScaleVertical(10),
    alignItems: "center",
    borderRadius: moderateScale(6),
  },
  activeNavItem: {
    backgroundColor: Colors.greenColor,
  },
  navText: {
    fontSize: textScale(12),
    fontFamily: FontFamily.PoppinsRegular,
    color: Colors.textGray,
  },
  activeNavText: {
    color: Colors.white,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(10),
    padding: moderateScale(15),
    marginBottom: moderateScaleVertical(15),
    shadowColor: Colors.black,
    shadowOpacity: scale(0.1),
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: moderateScale(5),
    elevation: moderateScale(3),
  },
  cardTitle: {
    fontSize: textScale(14),
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.greenColor,
    marginBottom: moderateScaleVertical(10),
    textTransform: "capitalize",
    letterSpacing: scale(0.2),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: moderateScaleVertical(8),
  },
  label: {
    fontSize: textScale(12),
    color: Colors.gray,
    fontFamily: FontFamily.PoppinsRegular,
    letterSpacing: scale(0.1),
    textTransform: "capitalize",
    flex: 1,
  },
  value: {
    fontSize: textScale(12),
    color: Colors.black,
    fontFamily: FontFamily.PoppinsRegular,
    flex: 1,
    textAlign: "right",
    letterSpacing: scale(0.1),
  },
});

import {
  Image,
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import ImagePath from "../../utils/ImagePath";
import {
  moderateScale,
  moderateScaleVertical,
  scale,
  textScale,
} from "../../utils/responsiveSize";
import CustomTextInoutWithIcon from "../../components/CustomTextInoutWithIcon";
import en from "../../constants/en";
import CustomButton from "../../components/CustomButton";
import Colors from "../../utils/Colors";
import FontFamily from "../../utils/FontFamily";
import { useNavigation } from "@react-navigation/native";
import {
  showErrorMessage,
  showSuccessMessage,
} from "../../utils/HelperFunction";
import { apiRequest } from "../../services/APIRequest";
import { API_ROUTES } from "../../services/APIRoutes";
import { encryptWholeObject } from "../../utils/decryptData";
import Ionicons from "react-native-vector-icons/Ionicons";

const ForgotPassword = () => {
  const navigation = useNavigation();
  const [userId, setuserId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const payloadData = { email: userId };
      console.log(payloadData, "payloadData");
      const encryptionPayload = encryptWholeObject(payloadData);

      const response = await apiRequest(
        API_ROUTES.forgetPassword,
        "POST",
        encryptionPayload
      );
      console.log(response, "response");
      if (response?.status === "Success" && response?.statusCode === "200") {
        showSuccessMessage(response?.message);
        navigation.goBack();
      } else {
        showErrorMessage(response?.message);
      }
    } catch (error) {
      showErrorMessage(error.message);
    } finally {
      setLoading(false);
      setuserId("");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.main}
      keyboardVerticalOffset={Platform.OS === "ios" ? moderateScale(40) : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          <Image
            source={ImagePath.logoBgImage}
            resizeMode="stretch"
            style={{ width: "100%" }}
          />
          <View style={styles.logoImageHolder}>
            <Image
              source={ImagePath.logoImage}
              resizeMode="contain"
              style={styles.imageIcon}
            />
          </View>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="chevron-back"
              size={moderateScale(22)}
              color={Colors.greenColor}
            />
          </TouchableOpacity>

          <View style={styles.formContainer}>
            <Text style={styles.signInText}>{en.LOGIN.FORGOT_PASSWORD}</Text>
            <CustomTextInoutWithIcon
              label={en.LOGIN.EMAIL.LABEL}
              leftIcon={ImagePath.emailIcon}
              placeholder={en.LOGIN.EMAIL.PLACEHOLDER}
              value={userId}
              onChangeText={setuserId}
              keyboardType="email-address"
              rightIcon="close"
              resetvalue={() => setuserId("")}
              secureTextEntry={false}
            />

            <CustomButton
              text={en.FORGOT_PASSWORD.SUBMIT_BUTTON}
              buttonStyle={styles.buttonStyle}
              textStyle={styles.buttonText}
              disabled={loading || userId.length === 0}
              handleAction={handleSubmit}
              isloading={loading}
            />

            <TouchableOpacity
              style={styles.view}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.footerText}>
                {en.FORGOT_PASSWORD.BACK_TO_LOGIN}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  imageHolder: {
    width: "90%",
    height: moderateScale(75),
    alignSelf: "center",
    marginBottom: moderateScaleVertical(50),
  },
  buttonStyle: {
    backgroundColor: Colors.greenColor,
    height: moderateScale(50),
    width: "100%",
    alignSelf: "center",
  },
  buttonText: {
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.white,
    fontSize: textScale(14),
    letterSpacing: scale(0.4),
  },
  view: {
    marginVertical: moderateScaleVertical(10),
    padding: moderateScale(10),
    alignItems: "center",
  },
  footerText: {
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.textColor,
    fontSize: textScale(14),
    letterSpacing: scale(0.3),
  },
  main: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
  },
  formContainer: {
    marginTop: moderateScaleVertical(-100),
    padding: moderateScale(10),
    gap: moderateScale(20),
    paddingBottom: moderateScale(100),
  },
  logoImageHolder: {
    position: "absolute",
    top: moderateScaleVertical(125),
    right: 0,
    left: 0,
    alignItems: "center",
  },
  imageIcon: {
    width: moderateScale(81),
    height: moderateScale(133),
  },
  signInText: {
    fontFamily: FontFamily.RubikRegular,
    fontSize: textScale(14),
    alignSelf: "flex-start",
    padding: moderateScale(5),
    borderBottomWidth: moderateScale(2.5),
    borderColor: Colors.greenColor,
  },
  backButton: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(19),
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    zIndex: 1,
    position: "absolute",
    top: moderateScaleVertical(50),
    left: moderateScale(25),
  },
});

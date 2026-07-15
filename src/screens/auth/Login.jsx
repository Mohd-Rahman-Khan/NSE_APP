import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Modal,
} from "react-native";
import React, { useEffect, useState } from "react";
import Colors from "../../utils/Colors";
import ImagePath from "../../utils/ImagePath";
import {
  moderateScale,
  moderateScaleVertical,
  scale,
  textScale,
} from "../../utils/responsiveSize";
import FontFamily from "../../utils/FontFamily";
import CustomTextInoutWithIcon from "../../components/CustomTextInoutWithIcon";
import { useNavigation } from "@react-navigation/native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import CustomButton from "../../components/CustomButton";
import {
  showErrorMessage,
  showSuccessMessage,
} from "../../utils/HelperFunction";
import en from "../../constants/en";
import { useDispatch } from "react-redux";
import { setUserData } from "../../redux/slice/UserSlice";
import { saveUserData, saveUserToken } from "../../utils/Storage";
import { apiRequest } from "../../services/APIRequest";
import { API_ROUTES } from "../../services/APIRoutes";
import { decryptAES, deepDecryptObject } from "../../utils/decryptData";
import TextTicker from "react-native-text-ticker";
import { getFcmToken } from "../../utils/firebaseNotification";

const Login = () => {
  const [email, setEmail] = useState("11790101309");
  const [password, setPassword] = useState("welcome");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [unitsList, setUnitsList] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const [selectedUnit, setSelectedUnit] = useState(null);

  useEffect(() => {
    getAnnouncement();
  }, []);

  const getAnnouncement = async () => {
    try {
      const response = await apiRequest(API_ROUTES.Announcement, "post");
      console.log("getAnnouncement", response);
      if (
        response &&
        (response?.status === "Success" || response?.status === "SUCCESS") &&
        response?.statusCode === "200"
      ) {
        const activeAnnouncements = response?.data?.filter(
          (item) => item.status === "ACTIVE",
        );

        // ✅ Convert into single scrolling text
        const announcementText = activeAnnouncements
          ?.map((item) => item.name)
          .join("   🔸   ");

        setAnnouncement(announcementText);
      } else {
        //showErrorMessage(response?.errorMsg);
      }
    } catch (error) {
      //showErrorMessage(error?.message);
      console.log(error, "Error In announcement API");
    } finally {
    }
  };

  const handleLogin = async () => {
    let fcmToken = null;
    if (Platform.OS == "android") {
      const fcmToken = await getFcmToken();
    }

    try {
      const payloadData = {
        clientId: email,
        secretKey: password,
        accessToken: fcmToken,
      };
      console.log("payloadData", payloadData);
      setLoading(true);
      const response = await apiRequest(
        API_ROUTES.AUTHORIZE_LOGIN,
        "post",
        payloadData,
      );
      console.log("loginResp", response);
      if (response?.statusCode == "200") {
        const decrypted = decryptAES(response?.data);
        const parsedDecrypted = JSON.parse(decrypted);

        console.log("loginResp", parsedDecrypted);

        const allUnits = Object.values(parsedDecrypted?.units || {}).flat();

        setSessionId(parsedDecrypted?.sessionId);

        // SINGLE UNIT
        if (allUnits.length === 1) {
          console.log("allUnits[0]", allUnits[0]);
          handleSelectedUnitLogin(allUnits[0], parsedDecrypted?.sessionId);
        }

        // MULTIPLE UNITS
        else {
          setLoading(false);
          setUnitsList(allUnits);
          setShowUnitModal(true);
        }
      } else {
        showErrorMessage(response?.message || "Server Error");
      }

      // if (
      //   response &&
      //   response?.status === "Success" &&
      //   response?.statusCode === "200"
      // ) {
      //   saveUserToken(response?.authToken);
      //   try {
      //     const response2 = await apiRequest(
      //       API_ROUTES.GET_PROFILE,
      //       "POST",
      //       null,
      //       response?.authToken,
      //     );
      //     const decrypted = decryptAES(response2);
      //     console.log("decrypted UserData ", decrypted);
      //     const parsedDecrypted = JSON.parse(decrypted);
      //     if (
      //       parsedDecrypted &&
      //       parsedDecrypted?.status === "Success" &&
      //       parsedDecrypted?.statusCode === "200"
      //     ) {
      //       const decryptedData = deepDecryptObject(parsedDecrypted.data);
      //       console.log("decrypted UserData ", decryptedData);
      //       dispatch(setUserData(decryptedData));
      //       saveUserData(decryptedData);
      //     } else {
      //       showErrorMessage("Unable to Fetch User Data");
      //     }
      //   } catch (error) {
      //     console.log(error, "Error in Catch Block");
      //   }
      //   showSuccessMessage("Login Success");
      // } else {
      //   showErrorMessage(response?.errorMsg);
      // }
    } catch (error) {
      showErrorMessage(error?.message);
      console.log(error, "Error In Login API");
    } finally {
      setLoading(false);
      // setEmail("");
      // setPassword("");
    }
  };

  const handleSelectedUnitLogin = async (unit, sessionIdSelected = null) => {
    try {
      setLoading(true);

      const payload = {
        userId: email,
        sessionId: sessionIdSelected ? sessionIdSelected : sessionId,
        unitType: unit.unitType,
        defaultUnit: unit.defaultUnit,
        unitName: unit.unitName,
        unitCode: unit.unitCode,
        unitId: unit.unitId,
      };

      console.log("SELECTED UNIT PAYLOAD", payload);

      const response = await apiRequest(
        API_ROUTES.SELECTED_UNIT_LOGIN,
        "POST",
        payload,
      );

      console.log("selectedUnitLoginResp", response);

      if (
        response &&
        response?.status === "Success" &&
        response?.statusCode === "200"
      ) {
        saveUserToken(response?.data);
        try {
          const response2 = await apiRequest(
            API_ROUTES.GET_PROFILE,
            "POST",
            null,
            response?.data,
          );
          const decrypted = decryptAES(response2);
          console.log("decrypted UserData ", decrypted);
          const parsedDecrypted = JSON.parse(decrypted);
          if (
            parsedDecrypted &&
            parsedDecrypted?.status === "Success" &&
            parsedDecrypted?.statusCode === "200"
          ) {
            const decryptedData = deepDecryptObject(parsedDecrypted.data);
            console.log("decrypted UserData ", decryptedData);
            dispatch(setUserData(decryptedData));
            saveUserData(decryptedData);
          } else {
            showErrorMessage("Unable to Fetch User Data");
          }
        } catch (error) {
          console.log(error, "Error in Catch Block");
        }
        showSuccessMessage("Login Success");
      } else {
        showErrorMessage(response?.errorMsg);
      }
    } catch (error) {
      console.log(error);
      showErrorMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Add this function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.main}
      keyboardVerticalOffset={Platform.OS === "ios" ? moderateScale(40) : 0}
    >
      {announcement && (
        <View
          style={{
            borderColor: Colors.greenColor,
            position: "absolute",
            width: "100%",
            zIndex: 1,
            marginTop:
              Platform.OS === "ios"
                ? moderateScaleVertical(50)
                : moderateScaleVertical(25),
          }}
        >
          <TextTicker
            style={styles.marqueeText}
            duration={15000}
            loop
            bounce={false}
            repeatSpacer={50}
            marqueeDelay={1000}
            scrollSpeed={50}
          >
            {announcement}
          </TextTicker>
        </View>
      )}

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
          <View style={styles.formContainer}>
            <Text style={styles.signInText}>{en.LOGIN.SIGN_IN}</Text>

            <CustomTextInoutWithIcon
              label={en.LOGIN.EMAIL.LABEL}
              leftIcon={ImagePath.emailIcon}
              placeholder={en.LOGIN.EMAIL.PLACEHOLDER}
              value={email}
              onChangeText={(text) => setEmail(text)}
              keyboardType={"email-address"}
              rightIcon={"close"}
              resetvalue={() => setEmail("")}
              secureTextEntry={false}
            />
            <CustomTextInoutWithIcon
              label={en.LOGIN.PASSWORD.LABEL}
              leftIcon={ImagePath.password}
              placeholder={en.LOGIN.PASSWORD.PLACEHOLDER}
              value={password}
              onChangeText={(text) => setPassword(text)}
              keyboardType={"default"}
              rightIcon={showPassword ? "eye" : "eyeo"}
              resetvalue={togglePasswordVisibility}
              secureTextEntry={!showPassword}
              isPasswordField={true}
            />
            <View style={styles.rememberView}>
              <TouchableOpacity
                style={styles.rmView}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={styles.rmIconView}>
                  {rememberMe && (
                    <FontAwesome
                      name="square"
                      color={Colors.greenColor}
                      size={moderateScale(16)}
                    />
                  )}
                </View>
                <Text style={styles.forgotPasswordText}>
                  {en.LOGIN.REMEMBER_ME}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate("ForgotPassword")}
              >
                <Text style={styles.forgotPasswordText}>
                  {en.LOGIN.FORGOT_PASSWORD}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton
            text={en.LOGIN.LOGIN_BUTTON}
            disabled={!email || !password || !rememberMe}
            buttonStyle={styles.buttonHolder}
            textStyle={styles.buttonText}
            handleAction={handleLogin}
            isloading={loading}
          />
          {/* <TouchableOpacity>
            <Text style={styles.dontHaveAccountText}>
              {en.LOGIN.NO_ACCOUNT}
              <Text style={styles.textGreen}>{en.LOGIN.SIGN_UP}</Text>
            </Text>
          </TouchableOpacity> */}
        </View>
      </ScrollView>
      <Modal visible={showUnitModal} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 20,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                marginBottom: 20,
              }}
            >
              Select Unit
            </Text>

            {unitsList.map((item, index) => {
              const isSelected = selectedUnit?.unitId === item.unitId;

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedUnit(item)}
                  style={{
                    borderWidth: 1,
                    borderColor: isSelected ? Colors.greenColor : "#ddd",
                    padding: 15,
                    borderRadius: 8,
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    {item.unitName}
                  </Text>

                  <Text>{item.unitType}</Text>
                </TouchableOpacity>
              );
            })}

            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginTop: 20,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setShowUnitModal(false);
                  setSelectedUnit(null);
                }}
                style={{
                  marginRight: 15,
                }}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={!selectedUnit}
                onPress={() => {
                  setShowUnitModal(false);
                  handleSelectedUnitLogin(selectedUnit);
                }}
                style={{
                  backgroundColor: selectedUnit ? Colors.greenColor : "#ccc",
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: "#fff" }}>Proceed</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default Login;

const styles = StyleSheet.create({
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
    marginTop: moderateScaleVertical(-120),
    padding: moderateScale(10),
    gap: moderateScale(20),
    paddingBottom: moderateScale(100),
  },
  buttonContainer: {
    paddingHorizontal: moderateScale(10),
    paddingBottom: moderateScale(35),
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
  forgotPasswordText: {
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.greenColor,
    fontSize: textScale(13),
  },
  rememberView: {
    width: "95%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rmView: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(10),
  },
  rmIconView: {
    borderWidth: moderateScale(3),
    width: moderateScale(25),
    height: moderateScale(25),
    borderRadius: moderateScale(5),
    borderColor: Colors.greenColor,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonHolder: {
    backgroundColor: Colors.greenColor,
    width: "100%",
    alignSelf: "center",
    height: moderateScale(50),
  },
  buttonText: {
    fontFamily: FontFamily.RubikRegular,
    color: Colors.white,
    textTransform: "capitalize",
    letterSpacing: scale(0.4),
  },
  dontHaveAccountText: {
    fontFamily: FontFamily.RubikRegular,
    color: Colors.unhighlightColor,
    fontSize: textScale(13),
    letterSpacing: scale(0.3),
    textAlign: "center",
    marginTop: moderateScale(10),
  },
  textGreen: {
    color: Colors.greenColor,
    fontFamily: FontFamily.RubikMedium,
  },
  marqueeText: {
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.white,
    fontSize: textScale(13),
    marginTop: moderateScaleVertical(10),
  },
});

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import WrapperContainer from "../../utils/WrapperContainer";
import InnerHeader from "../../components/InnerHeader";
import Colors from "../../utils/Colors";
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from "../../utils/responsiveSize";
import FontFamily from "../../utils/FontFamily";
import {
  showErrorMessage,
  showSuccessMessage,
} from "../../utils/HelperFunction";
import { getUserData, removeUserData } from "../../utils/Storage";
import { encryptWholeObject } from "../../utils/decryptData";
import { apiRequest } from "../../services/APIRequest";
import { API_ROUTES } from "../../services/APIRoutes";
import { useDispatch } from "react-redux";
import { clearUserData } from "../../redux/slice/UserSlice";
import en from "../../constants/en";
import CustomButton from "../../components/CustomButton";

const EditUserProfile = () => {
  const [loading, setLoading] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const dispatch = useDispatch();

  const onSubmit = async () => {
    if (!oldPassword || oldPassword.length === 0) {
      showErrorMessage(en.EDIT_PROFILE.VALIDATION.OLD_PASSWORD_REQUIRED);
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      showErrorMessage(en.EDIT_PROFILE.VALIDATION.PASSWORD_LENGTH);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showErrorMessage(en.EDIT_PROFILE.VALIDATION.PASSWORD_MISMATCH);
      return;
    }

    try {
      setLoading(true);

      const userData = await getUserData();
      const payloadData = {
        newpwdKey: newPassword,
        pwdKey: oldPassword,
        userId: userData?.userId,
      };
      const encryption = encryptWholeObject(payloadData);

      const response = await apiRequest(
        API_ROUTES.CHANGE_PASSWORD,
        "post",
        encryption
      );

      if (response?.statusCode === "200" && response?.status === "Success") {
        showSuccessMessage(en.EDIT_PROFILE.SUCCESS.PASSWORD_CHANGED);
        setTimeout(() => {
          dispatch(clearUserData());
          removeUserData();
        }, 500);
      } else if (
        response?.statusCode === "422" &&
        response?.status === "Error"
      ) {
        showErrorMessage(
          response?.message || en.EDIT_PROFILE.ERROR.SAME_PASSWORD
        );
      } else if (
        response?.statusCode === "404" &&
        response?.status === "Fail"
      ) {
        showErrorMessage(
          response?.message || en.EDIT_PROFILE.ERROR.INVALID_CREDENTIALS
        );
      } else {
        showErrorMessage(response?.message || en.EDIT_PROFILE.ERROR.GENERIC);
      }
    } catch (error) {
      console.log(error, "API Error");
      showErrorMessage(en.EDIT_PROFILE.VALIDATION.UNEXPECTED_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WrapperContainer isLoading={loading}>
      <InnerHeader title={en.EDIT_PROFILE.TITLE} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.main}
        keyboardVerticalOffset={Platform.OS === "ios" ? moderateScale(40) : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Old Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              {en.EDIT_PROFILE.OLD_PASSWORD.LABEL}
            </Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.input}
                value={oldPassword}
                onChangeText={setOldPassword}
                placeholder={en.EDIT_PROFILE.OLD_PASSWORD.PLACEHOLDER}
                secureTextEntry={!showOld}
                autoCapitalize="none"
              />
              {oldPassword.length > 0 && (
                <TouchableOpacity
                  onPress={() => setShowOld(!showOld)}
                  style={styles.eyeIcon}
                >
                  <Icon
                    name={showOld ? "eye-off" : "eye"}
                    size={22}
                    color={Colors.textColor}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* New Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              {en.EDIT_PROFILE.NEW_PASSWORD.LABEL}
            </Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder={en.EDIT_PROFILE.NEW_PASSWORD.PLACEHOLDER}
                secureTextEntry={!showNew}
                autoCapitalize="none"
              />
              {newPassword.length > 0 && (
                <TouchableOpacity
                  onPress={() => setShowNew(!showNew)}
                  style={styles.eyeIcon}
                >
                  <Icon
                    name={showNew ? "eye-off" : "eye"}
                    size={moderateScale(22)}
                    color={Colors.textColor}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Confirm New Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              {en.EDIT_PROFILE.CONFIRM_PASSWORD.LABEL}
            </Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.input}
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                placeholder={en.EDIT_PROFILE.CONFIRM_PASSWORD.PLACEHOLDER}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
              />
              {confirmNewPassword.length > 0 && (
                <TouchableOpacity
                  onPress={() => setShowConfirm(!showConfirm)}
                  style={styles.eyeIcon}
                >
                  <Icon
                    name={showConfirm ? "eye-off" : "eye"}
                    size={22}
                    color={Colors.textColor}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <CustomButton
            text={en.EDIT_PROFILE.SUBMIT_BUTTON}
            handleAction={onSubmit}
            buttonStyle={styles.submitButton}
            disabled={!oldPassword || !newPassword || !confirmNewPassword}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </WrapperContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScaleVertical(20),
    paddingBottom: moderateScaleVertical(40),
  },
  inputContainer: {
    marginBottom: moderateScaleVertical(18),
  },
  label: {
    fontSize: textScale(12),
    color: Colors.textColor,
    marginBottom: moderateScaleVertical(6),
    fontFamily: FontFamily.PoppinsRegular,
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.diabledColor,
    borderRadius: moderateScale(8),
    backgroundColor: Colors.white,
  },
  input: {
    flex: 1,
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScaleVertical(10),
    fontSize: textScale(13),
    fontFamily: FontFamily.PoppinsRegular,
    color: Colors.black,
  },
  eyeIcon: {
    paddingHorizontal: moderateScale(10),
  },
  submitButton: {
    backgroundColor: Colors.greenColor,
    marginTop: moderateScaleVertical(10),
    borderRadius: moderateScale(10),
    paddingVertical: moderateScaleVertical(14),
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: {
    color: Colors.white,
    fontSize: textScale(16),
    fontFamily: FontFamily.PoppinsMedium,
  },
});

export default EditUserProfile;

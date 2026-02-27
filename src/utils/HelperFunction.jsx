import { showMessage } from "react-native-flash-message";

export const showSuccessMessage = (message) => {
  showMessage({
    message: message,
    icon: "success",
    type: "success",
  });
};

export const showErrorMessage = (message) => {
  showMessage({
    message: message,
    icon: "danger",
    type: "danger",
  });
};










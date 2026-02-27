import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import WrapperContainer from "../utils/WrapperContainer";
import InnerHeader from "./InnerHeader";
import WebView from "react-native-webview";
import { moderateScale, scale, textScale } from "../utils/responsiveSize";
import Colors from "../utils/Colors";
import FontFamily from "../utils/FontFamily";
import PropTypes from "prop-types";

const WebViewPreview = ({ route }) => {
  const { title, url } = route.params;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <WrapperContainer isLoading={loading}>
      <InnerHeader title={title} />
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Failed to load page. Please try again later.
          </Text>
        </View>
      ) : (
        <WebView
          source={{ uri: url }}
          style={styles.webview}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      )}
    </WrapperContainer>
  );
};

WebViewPreview.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      title: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default WebViewPreview;

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: moderateScale(16),
  },
  errorText: {
    fontSize: textScale(15),
    color: Colors.red,
    textAlign: "center",
    fontFamily:FontFamily.PoppinsRegular,
    letterSpacing:scale(0.3),
    textTransform:'capitalize',
    width:'90%'
  },
});

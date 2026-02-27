import { StatusBar, StyleSheet } from "react-native";
import React from "react";
import PropTypes from "prop-types";
import Colors from "./Colors";
import Loader from "./Loader";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const WrapperContainer = ({ children, isLoading }) => {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.main}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <Loader isLoading={isLoading} />
        {children}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

WrapperContainer.propTypes = {
  children: PropTypes.node,
  isLoading: PropTypes.bool,
};

WrapperContainer.defaultProps = {
  isLoading: false,
};

export default WrapperContainer;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: Colors.white,
  },
});

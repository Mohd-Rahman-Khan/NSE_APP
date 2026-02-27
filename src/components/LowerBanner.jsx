import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Foundation from "react-native-vector-icons/Foundation";
import Colors from "../utils/Colors";
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from "../utils/responsiveSize";
import FontFamily from "../utils/FontFamily";
import Feather from "react-native-vector-icons/Feather";

const LowerBanner = () => {
  const bannerData = [
    {
      heading: "NSCL Updates",
      subHeading: "!! Investors are advised to mention Mobile ...",
    },
    {
      heading: "NSCL Updates2",
      subHeading: "!! Investors are advised to mention Mobile2 ...",
    },
    {
      heading: "NSCL Updates3",
      subHeading: "!! Investors are advised to mention Mobile3...",
    },
    {
      heading: "NSCL Updates4",
      subHeading: "!! Investors are advised to mention Mobile4 ...",
    },
    {
      heading: "NSCL Updatess5",
      subHeading: "!! Investors are advised to mention Mobile5...",
    },
    {
      heading: "NSCL Updates6",
      subHeading: "!! Investors are advised to mention Mobile6...",
    },
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleArrowClick = (direction) => {
    if (direction === "right") {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % bannerData.length);
    } else if (direction === "left") {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? bannerData.length - 1 : prevIndex - 1
      );
    }
  };

  const currentBanner = bannerData[currentIndex];

  return (
    <View style={styles.main}>
      <View style={styles.UpperView}>
        <View
          style={[
            styles.UpperView,
            { justifyContent: "none", gap: moderateScale(10), width: "50%" },
          ]}
        >
          <FontAwesome
            name="bullhorn"
            size={moderateScale(30)}
            color={Colors.greenColor}
          />
          <Text style={styles.text}>{currentBanner.heading}</Text>
        </View>
        <View
          style={[
            styles.UpperView,
            {
              justifyContent: "space-between",
              gap: moderateScale(10),
              width: "30%",
            },
          ]}
        >
          <Foundation
            name="pause"
            size={moderateScale(30)}
            color={Colors.greenColor}
          />
          <TouchableOpacity
            onPress={() => handleArrowClick("left")}
            style={styles.iconHolder}
          >
            <Feather
              name="chevron-left"
              size={moderateScale(25)}
              color={Colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleArrowClick("right")}
            style={styles.iconHolder}
          >
            <Feather
              name="chevron-right"
              size={moderateScale(25)}
              color={Colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.textHolder}>
        <Text style={styles.subHeading}>{currentBanner.subHeading}</Text>
      </View>
    </View>
  );
};

export default LowerBanner;

const styles = StyleSheet.create({
  main: {
    borderWidth: moderateScale(2),
    width: "95%",
    alignSelf: "center",
    borderRadius: moderateScale(10),
    padding: moderateScale(10),
    borderColor: Colors.black,
    gap: moderateScaleVertical(5),
    borderStyle:'dashed'
  },
  UpperView: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "95%",
    alignSelf: "center",
    alignItems: "center",
  },
  text: {
    fontSize: textScale(14),
    color: Colors.greenColor,
    fontFamily: FontFamily.PoppinsMedium,
  },
  subHeading: {
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.black,
    fontSize: textScale(12),
  },
  iconHolder: {
    borderWidth: 2,
    backgroundColor: Colors.diabledColor,
    borderColor: Colors.diabledColor,
    borderRadius: moderateScale(5),
    padding: moderateScale(2),
  },
});

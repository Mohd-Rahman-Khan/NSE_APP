import {Dimensions, Platform, StatusBar} from 'react-native';
const {width, height} = Dimensions.get('window');

const X_WIDTH = 375;
const X_HEIGHT = 812;

const XSMAX_WIDTH = 414;
const XSMAX_HEIGHT = 896;

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const sliderWidth = width - 20;
const itemWidth = width - 20;

const isIPhoneX = () =>
  Platform.OS === 'ios' && !Platform.isPad && !Platform.isTVOS
    ? (width === X_WIDTH && height === X_HEIGHT) ||
      (width === XSMAX_WIDTH && height === XSMAX_HEIGHT)
    : false;

const StatusBarHeight = Platform.select({
  ios: 44, // fixed after removing unnecessary ternary
  android: 44, // can be StatusBar.currentHeight if needed
  default: 0,
});

const StatusBarHeightSecond = Platform.select({
  ios: isIPhoneX() ? 44 : 20,
  android: StatusBar.currentHeight,
  default: 0,
});

const scale = size => (width / guidelineBaseWidth) * size;
const verticalScale = size => (height / guidelineBaseHeight) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;
const moderateScaleVertical = (size, factor = 0.5) =>
  size + (verticalScale(size) - size) * factor;

const textScale = percent => {
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;
  const ratio = screenHeight / screenWidth;

  const guidelineFactor = ratio > 1.8 ? 0.14 : 0.15;
  const deviceHeight = screenHeight * guidelineFactor;

  const heightPercent = (percent * deviceHeight) / 100;
  return Math.round(heightPercent);
};

export {
  scale,
  verticalScale,
  textScale,
  moderateScale,
  moderateScaleVertical,
  width,
  height,
  sliderWidth,
  itemWidth,
  StatusBarHeight,
  StatusBarHeightSecond,
};

import { StyleSheet, Text, View, ScrollView } from "react-native";
import React from "react";
import WrapperContainer from "../../../../utils/WrapperContainer";
import InnerHeader from "../../../../components/InnerHeader";
import { useNavigation } from "@react-navigation/native";
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from "../../../../utils/responsiveSize";
import Colors from "../../../../utils/Colors";
import FontFamily from "../../../../utils/FontFamily";
import CustomButton from "../../../../components/CustomButton";
import PropTypes from "prop-types";


const CropDetails = ({ route }) => {
  const { item } = route.params;
  const navigation = useNavigation();
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString.replace(" ", "T"));
    if (Number.isNaN(d)) return dateString;
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const details = [
    { label: "Seed Crop Name", value: item?.seedCropName },
    { label: "Crop Group", value: item?.cropGroupName },
    { label: "Status", value: item?.status },
    { label: "Advance Tag Required", value: item?.advTagRequired },
    { label: "Advance Payable", value: item?.advancePayableFlag },
    { label: "Field Process", value: item?.fieldProcess },
    { label: "Guarantee Required", value: item?.guaranteeRequired },
    { label: "Testing Charge", value: item?.testingCharge },
    { label: "Got Charge", value: item?.gotCharge },
    { label: "Wheat Basis", value: item?.wheatBasis },
    { label: "Lot Size", value: item?.lotSize },
    { label: "Min Sample Qty", value: item?.minSampleQty },
    { label: "Mul Ratio", value: item?.mulRatio },
    { label: "HSN Short Name", value: item?.hsnShortName },
    { label: "UOM Short Name", value: item?.uomShortName },
    { label: "Inspection Checklist", value: item?.inspectionCheckList },
    { label: "Gunny Bag Rebate Flag", value: item?.gunnyBagsRebateFlag },
    { label: "Gunny Bag Rebate Rate", value: item?.gunnyBagRebateRate },
    { label: "Trans Rebate Flag", value: item?.transRebateFlag },
    { label: "Created By", value: item?.createdBy },
    { label: "Created On", value: formatDate(item?.createdOn) },
    { label: "Updated By", value: item?.updatedBy },
    { label: "Updated On", value: formatDate(item?.updatedOn) },
  ];

  return (
    <WrapperContainer>
      <InnerHeader title={`${item?.seedCropName} Crop Details`} />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {details?.map((detail) => (
          <View key={detail?.id} style={styles.row}>
            <Text style={styles.label}>{detail.label}</Text>
            <Text style={styles.value}>{detail.value ?? "-"}</Text>
          </View>
        ))}

        {/* Seasons (array data) */}
        {item?.seasons?.length > 0 && (
          <View style={{ marginTop: moderateScale(15) }}>
            <Text style={styles.sectionTitle}>Seasons</Text>
            <ScrollView
              horizontal
              contentContainerStyle={{
                flexDirection: "row",
                gap: moderateScale(10),
                flexWrap: "wrap",
              }}
            >
              {item.seasons.map((season) => (
                <View key={season?.id} style={styles.seasonCard}>
                  <Text style={styles.seasonTitle}>
                    {season.seasonType} ({season.seasonShortName})
                  </Text>
                  <Text style={styles.seasonDate}>
                    From: {season.monthFrom}
                  </Text>
                  <Text style={styles.seasonDate}>To: {season.monthTo}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
        <CustomButton
          text={"Edit Details"}
          buttonStyle={styles.buttonStyle}
          handleAction={() =>
            navigation.navigate("EditCropDetails", { item: item })
          }
        />
      </ScrollView>
    </WrapperContainer>
  );
};

CropDetails.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.object.isRequired,
  }).isRequired,
};

export default CropDetails;

const styles = StyleSheet.create({
  container: {
    padding: moderateScale(15),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: moderateScale(10),
    borderBottomWidth: 0.5,
    borderColor: Colors.lightBackground,
    paddingBottom: moderateScale(5),
  },
  label: {
    fontSize: textScale(13),
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.black,
  },
  value: {
    fontSize: textScale(13),
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.textColor,
    maxWidth: "60%",
    textAlign: "right",
  },
  sectionTitle: {
    fontSize: textScale(14),
    fontFamily: FontFamily.PoppinsSemiBold,
    color: Colors.greenColor,
    marginBottom: moderateScaleVertical(6),
    borderLeftWidth: moderateScale(2),
    paddingVertical: moderateScale(2),
    paddingHorizontal: moderateScale(10),
    borderColor: Colors.primary,
  },
  seasonCard: {
    backgroundColor: Colors.lightBackground,
    padding: moderateScale(12),
    borderRadius: moderateScale(10),
    marginBottom: moderateScale(10),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  seasonTitle: {
    fontSize: textScale(13),
    fontFamily: FontFamily.PoppinsSemiBold,
    color: Colors.black,
    marginBottom: moderateScale(4),
    textAlign: "left",
  },

  seasonDate: {
    fontSize: textScale(12),
    fontFamily: FontFamily.PoppinsRegular,
    color: Colors.textColor,
    marginTop: moderateScale(2),
  },
  buttonStyle: {
    backgroundColor: Colors.greenColor,
    marginVertical: moderateScaleVertical(10),
    height: moderateScaleVertical(45),
  },
});

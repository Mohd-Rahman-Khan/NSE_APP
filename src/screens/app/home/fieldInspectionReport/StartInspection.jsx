import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import WrapperContainer from "../../../../utils/WrapperContainer";
import InnerHeader from "../../../../components/InnerHeader";
import {
  moderateScale,
  moderateScaleVertical,
  scale,
  textScale,
} from "../../../../utils/responsiveSize";
import Colors from "../../../../utils/Colors";
import FontFamily from "../../../../utils/FontFamily";
import CustomButton from "../../../../components/CustomButton";
import Octicons from "react-native-vector-icons/Octicons";
import { useNavigation } from "@react-navigation/native";
import PropTypes from "prop-types";

const DataShownView = ({ label, value }) => {
  return (
    <View style={styles.cardRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.valueText}>{value || "N/A"}</Text>
    </View>
  );
};

DataShownView.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const StartInspection = ({ route }) => {
  const { data } = route.params;
  console.log("StartInspection", data);
  const navigation = useNavigation();
  const [selectedLands, setSelectedLands] = useState([]);

  // Calculate total inspected area
  const totalInspectedArea = selectedLands.reduce((total, land) => {
    return total + (Number.parseFloat(land.landArea) || 0);
  }, 0);

  const toggleLandSelection = (land) => {
    // Check if the land is already selected
    const isSelected = selectedLands.some(
      (selectedLand) => selectedLand.id === land.id
    );

    if (isSelected) {
      // Remove from selection
      setSelectedLands(
        selectedLands.filter((selectedLand) => selectedLand.id !== land.id)
      );
    } else {
      // Add to selection
      setSelectedLands([...selectedLands, land]);
    }
  };

  return (
    <WrapperContainer>
      <InnerHeader title={"Verify Inspection Details"} />
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.headerText}>Grower Details</Text>
          <DataShownView
            label={"Grower"}
            value={`${data?.grower?.entityRegNo?.firstName} ${
              data?.grower?.entityRegNo?.lastName || ""
            } `}
          />
          <DataShownView
            label={"State"}
            value={data?.grower?.entityRegNo?.stateId?.stateName}
          />
          <DataShownView
            label={"District"}
            value={data?.grower?.entityRegNo?.districtId?.districtName}
          />
          <DataShownView
            label={"Taluqs"}
            value={data?.grower?.entityRegNo?.block?.taluqs?.talukaName}
          />
          <DataShownView
            label={"Block"}
            value={data?.grower?.entityRegNo?.block?.blockName}
          />
          <DataShownView
            label={"Village"}
            value={data?.grower?.entityRegNo?.villageId?.villageName}
          />
        </View>
        {/*Crop Land  Details  */}
        <View style={styles.card}>
          <Text style={styles.headerText}>Crop Details</Text>
          <DataShownView
            label={"Crop"}
            value={data?.inspection?.crop?.seedCropName}
          />
          <DataShownView
            label={"Seed Variety"}
            value={data?.inspection?.productionPlan?.seedVariety}
          />
          <DataShownView
            label={"Season"}
            value={data?.inspection?.productionPlan?.season}
          />
          <DataShownView
            label={"Seed Class"}
            value={`${data?.inspection?.productionPlan?.toSeedClass} | ${data?.inspection?.productionPlan?.toSeedStage}`}
          />
          <DataShownView
            label={"Total acres under seed production of this hybrid/variety"}
            value={data?.grower?.landDetails[0]?.landArea}
          />
          <DataShownView
            label={"Inspected Area"}
            value={totalInspectedArea.toFixed(2)}
          />
        </View>
        {/* Select the Land which is going to be inspected */}
        {data?.grower?.landDetails?.map((item, index) => {
          const isSelected = selectedLands.some(
            (selectedLand) => selectedLand.id === item.id
          );

          return (
            <View
              style={[
                styles.card,
                {
                  backgroundColor: isSelected
                    ? Colors.lightBackground
                    : Colors.white,
                },
              ]}
              key={item?.id}
            >
              <Text style={styles.headerText}>Select the land {index + 1}</Text>
              <DataShownView label={"Land Address"} value={item?.landAddress} />
              <DataShownView label={"Type"} value={item?.typeOfLand} />
              <DataShownView label={"Soil Type"} value={item?.soilType} />
              <DataShownView label={"Area (Hectare)"} value={item?.landArea} />
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: moderateScale(10),
                }}
              >
                <View style={{ width: "25%", alignItems: "center" }}>
                  <Octicons
                    name={isSelected ? "check-circle" : "circle"}
                    size={moderateScale(35)}
                    color={Colors.greenColor}
                  />
                </View>
                <CustomButton
                  text={isSelected ? "Deselect Land" : "Select this Land"}
                  buttonStyle={[
                    styles.buttonStyle,
                    isSelected && { backgroundColor: Colors.red },
                  ]}
                  textStyle={styles.textStyle}
                  handleAction={() => toggleLandSelection(item)}
                />
              </View>
            </View>
          );
        })}
      </ScrollView>
      <CustomButton
        text={`Continue Inspection for ${totalInspectedArea}`}
        buttonStyle={styles.buttonStyle2}
        textStyle={styles.textStyle}
        disabled={totalInspectedArea === 0}
        handleAction={() =>
          navigation.navigate("InspectionForm", {
            data: {
              ...data,
              selectedLands,
              totalInspectedArea,
              cropFirTypeId: data?.inspection?.crop?.cropFirType?.cropFirTypeId,
            },
          })
        }
      />
    </WrapperContainer>
  );
};

// Prop Types validation
StartInspection.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      data: PropTypes.shape({
        grower: PropTypes.shape({
          partyName: PropTypes.string,
          entityRegNo: PropTypes.shape({
            stateId: PropTypes.shape({
              stateName: PropTypes.string,
            }),
            districtId: PropTypes.shape({
              districtName: PropTypes.string,
            }),
            block: PropTypes.shape({
              taluqs: PropTypes.shape({
                talukaName: PropTypes.string,
              }),
              blockName: PropTypes.string,
            }),
            villageId: PropTypes.shape({
              villageName: PropTypes.string,
            }),
            firstName: PropTypes.string,
            lastName: PropTypes.string,
          }),
          landDetails: PropTypes.arrayOf(
            PropTypes.shape({
              id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
              landAddress: PropTypes.string,
              typeOfLand: PropTypes.string,
              soilType: PropTypes.string,
              landArea: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number,
              ]),
            })
          ),
        }),
        inspection: PropTypes.shape({
          crop: PropTypes.shape({
            seedCropName: PropTypes.string,
            cropFirType: PropTypes.shape({
              cropFirTypeId: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number,
              ]),
            }),
          }),
          productionPlan: PropTypes.shape({
            seedVariety: PropTypes.string,
            season: PropTypes.string,
            toSeedClass: PropTypes.string,
            toSeedStage: PropTypes.string,
          }),
        }),
      }).isRequired,
    }).isRequired,
  }).isRequired,
};

export default StartInspection;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(10),
    marginHorizontal: moderateScale(15),
    margin: moderateScaleVertical(10),
    padding: moderateScale(10),
    elevation: moderateScale(5),
    shadowColor: Colors.greenColor,
    shadowOpacity: scale(0.09),
    shadowRadius: moderateScale(5),
    shadowOffset: { width: 0, height: 3 },
    gap: moderateScaleVertical(5),
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: moderateScale(5),
  },
  label: {
    flex: 1,
    fontFamily: FontFamily.PoppinsRegular,
    color: Colors.gray,
    fontSize: textScale(12),
    textAlign: "left",
  },
  valueText: {
    flex: 1,
    fontFamily: FontFamily.PoppinsRegular,
    fontSize: textScale(13),
    color: Colors.textColor,
    textAlign: "right",
    textTransform: "capitalize",
  },
  headerText: {
    fontSize: textScale(13),
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.greenColor,
    marginBottom: moderateScaleVertical(4),
    borderLeftWidth: moderateScale(2),
    paddingHorizontal: moderateScale(10),
    borderColor: Colors.primary,
  },
  buttonStyle: {
    backgroundColor: Colors.greenColor,
    width: "70%",
    height: moderateScale(45),
  },
  textStyle: {
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.white,
    fontSize: textScale(14),
    letterSpacing: scale(0.2),
  },
  buttonStyle2: {
    backgroundColor: Colors.greenColor,
    height: moderateScale(45),
    margin: moderateScaleVertical(5),
    width: "95%",
    alignSelf: "center",
  },
});

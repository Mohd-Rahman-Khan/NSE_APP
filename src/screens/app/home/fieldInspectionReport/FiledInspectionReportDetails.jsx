import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  FlatList,
  Alert,
} from "react-native";
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
import { decryptAES, encryptWholeObject } from "../../../../utils/decryptData";
import { apiRequest } from "../../../../services/APIRequest";
import { API_ROUTES } from "../../../../services/APIRoutes";
import { showErrorMessage } from "../../../../utils/HelperFunction";
import CustomButton from "../../../../components/CustomButton";
import { useNavigation } from "@react-navigation/native";
import PropTypes from "prop-types";

const Details = ({ label, value }) => {
  return (
    <View style={styles.detailsHolderView}>
      <Text style={styles.labelText}>{label}</Text>
      <Text style={styles.valueText}>{value}</Text>
    </View>
  );
};

Details.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.node,
  ]),
};

const FiledInspectionReportDetails = ({ route }) => {
  const { item } = route.params;
  // console.log(detailsData?.grower?.landDetails)
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [detailsData, setDetailsData] = useState();
  console.log(detailsData, "detailsData");
  const [cropFirTypeId, setCropFirTypeId] = useState(null);
  useEffect(() => {
    fethcProgramListDetails();
  }, []);

  const fethcProgramListDetails = async () => {
    try {
      setLoading(true);
      const programDetails = await fetchProgramDetails();

      if (!programDetails) {
        showErrorMessage("Error");
        return;
      }

      const inspectionLandIds = extractInspectionLandIds(programDetails);

      try {
        const growerData = await fetchGrowerData(programDetails.data.growerId);
        await fetchInspectionData(
          programDetails,
          growerData,
          inspectionLandIds
        );
      } catch (error) {
        console.log(error, "Error in Getting Grower Data");
        setDetailsData({
          inspection: programDetails.data,
          grower: null,
          productionInspection: null,
        });
      }
    } catch (error) {
      console.log(error, "line 133");
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const fetchProgramDetails = async () => {
    const payloadData = { id: item?.id };
    const encryptedPayload = encryptWholeObject(payloadData);
    const response = await apiRequest(
      API_ROUTES.PROGRAMME_LIST_DETAILS,
      "post",
      encryptedPayload
    );
    const decrypted = decryptAES(response);
    const parsedDecrypted = JSON.parse(decrypted);

    return isSuccessResponse(parsedDecrypted) ? parsedDecrypted : null;
  };

  const extractInspectionLandIds = (programDetails) => {
    return Array.isArray(programDetails?.data?.schedule?.landDetails)
      ? programDetails.data.schedule.landDetails.map((ld) => ld.landId)
      : [];
  };

  const fetchGrowerData = async (growerId) => {
    const payloadData2 = { id: growerId };
    const encryptedPayload2 = encryptWholeObject(payloadData2);
    const growerResponse = await apiRequest(
      API_ROUTES.GROWER_DETAILS,
      "post",
      encryptedPayload2
    );
    const growerDecrypted = decryptAES(growerResponse);
    const growerParsedDecrypted = JSON.parse(growerDecrypted);

    if (!isSuccessResponse(growerParsedDecrypted)) {
      throw new Error("Error in Getting Grower Data");
    }

    return growerParsedDecrypted;
  };

  const fetchInspectionData = async (
    programDetails,
    growerData,
    inspectionLandIds
  ) => {
    const cropFirId = programDetails?.data?.crop?.cropFirType?.id;
    const scheduleId = programDetails?.data?.schedule?.id;
    const inspectionPayloadData = { scheduleId };
    const encryptedInspectionPayloadData = encryptWholeObject(
      inspectionPayloadData
    );

    const inspectionEndpoint = getInspectionEndpoint(cropFirId);
    const inspectionResponseData = await apiRequest(
      inspectionEndpoint,
      "post",
      encryptedInspectionPayloadData
    );

    const inspectionDecrypted = decryptAES(inspectionResponseData);
    const inspectionParsedDecrypted = JSON.parse(inspectionDecrypted);

    if (!isSuccessResponse(inspectionParsedDecrypted)) {
      showErrorMessage("Error in getting Inspection Data");
      return;
    }

    const processedGrowerData = processGrowerData(
      growerData,
      inspectionLandIds
    );

    setDetailsData({
      inspection: programDetails.data,
      grower: processedGrowerData,
      productionInspection: inspectionParsedDecrypted.data,
    });

    setCropFirTypeId(programDetails.data?.crop?.cropFirType?.cropFirTypeId);
  };

  const getInspectionEndpoint = (cropFirId) => {
    const endpointMap = {
      1: API_ROUTES.PRODUCTION_INSPECTION_A,
      2: API_ROUTES.PRODUCTION_INSPECTION_B,
      3: API_ROUTES.PRODUCTION_INSPECTION_C,
    };
    return endpointMap[cropFirId] || API_ROUTES.PRODUCTION_INSPECTION_A;
  };

  const processGrowerData = (growerData, inspectionLandIds) => {
    let processedData =
      growerData?.data && Array.isArray(growerData.data)
        ? growerData.data[0]
        : growerData.data;

    if (
      processedData &&
      Array.isArray(processedData.landDetails) &&
      inspectionLandIds.length > 0
    ) {
      processedData = {
        ...processedData,
        landDetails: processedData.landDetails.filter((ld) =>
          inspectionLandIds.includes(ld.id)
        ),
      };
    }

    return processedData;
  };

  const isSuccessResponse = (response) => {
    return response?.status === "SUCCESS" && response?.statusCode === "200";
  };

  const renderItem = ({ item }) => {
    Alert.alert("Render MEthod");
    return (
      <View>
        <Text>Ashish Ranjan</Text>
      </View>
    );
  };

  return (
    <WrapperContainer isLoading={loading}>
      <InnerHeader title={"Program Inspection"} />
      {Array.isArray(detailsData) ? (
        <FlatList
          data={detailsData}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{
            padding: moderateScale(14),
            paddingBottom: moderateScaleVertical(20),
          }}
          renderItem={renderItem}
        />
      ) : (
        <ScrollView style={styles.main} showsVerticalScrollIndicator={false}>
          {/* Grower Programm Details */}
          <View style={styles.containerStyle}>
            <Text style={styles.headerText}>Program Details</Text>
            <Details
              label={"Programme Id"}
              value={detailsData?.inspection?.productionPlan?.planId || "N/A"}
            />
            <Details
              label={"Grower Name"}
              value={detailsData?.inspection?.schedule?.growerName || "N/A"}
            />
            <Details
              label={"Area to be planted (ha)"}
              value={
                detailsData?.inspection?.schedule?.areaToBePlanted || "N/A"
              }
            />
            <Details
              label={"GOT Required"}
              value={detailsData?.inspection?.schedule?.gotRequired || "N/A"}
            />
            <Details
              label={"Qty Raw Seed (Kg)"}
              value={
                detailsData?.inspection?.schedule?.estimatedRawSeed || "N/A"
              }
            />
            <Details
              label={"Qty Good Seed (Kg)"}
              value={
                detailsData?.inspection?.schedule?.estimatedGoodSeed || "N/A"
              }
            />
          </View>
          {/* Grower Loaction Details */}
          <View style={styles.containerStyle}>
            <Text style={styles.headerText}>Grower Location Details</Text>
            <ScrollView
              horizontal
              style={{ flex: 1, borderWidth: 1, borderColor: Colors.white }}
            >
              <View>
                {/* Table Headers */}
                <View style={styles.tableRowHeader}>
                  <Text style={[styles.tableCell, styles.cellSerial]}>
                    Sl. No.
                  </Text>
                  <Text style={[styles.tableCell, styles.cellAddress]}>
                    Address
                  </Text>
                  <Text style={[styles.tableCell, styles.cellType]}>Type</Text>
                  <Text style={[styles.tableCell, styles.cellArea]}>
                    Area (Ha)
                  </Text>
                </View>

                {/* Table Rows */}
                {detailsData?.grower?.landDetails?.map((item, index) => (
                  <View style={styles.tableRow} key={item.id || index}>
                    <Text style={[styles.tableCell, styles.cellSerial]}>
                      {index + 1}
                    </Text>
                    <Text style={[styles.tableCell, styles.cellAddress]}>
                      {item.landAddress}
                    </Text>
                    <Text style={[styles.tableCell, styles.cellType]}>
                      {item.typeOfLand}
                    </Text>
                    <Text style={[styles.tableCell, styles.cellArea]}>
                      {item.landArea}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
          {/* Inspection Details */}
          {detailsData?.productionInspection?.map((item, index) => (
            <View style={styles.containerStyle} key={item?.id}>
              <Text style={styles.headerText}>
                Inspection Details {index + 1}
              </Text>

              {/* Common fields for all types */}
              <Details
                label={"Name of the Producer/Grower"}
                value={item.growerName || "N/A"}
              />
              <Details
                label={"Village"}
                value={
                  detailsData?.grower?.entityRegNo?.villageId?.villageName ||
                  "NA"
                }
              />
              <Details
                label={"Taluqs"}
                value={
                  detailsData?.grower?.entityRegNo?.block?.taluqs?.talukaName ||
                  "NA"
                }
              />
              <Details
                label={"District"}
                value={
                  detailsData?.grower?.entityRegNo?.districtId?.districtName ||
                  "NA"
                }
              />
              <Details
                label={"State"}
                value={
                  detailsData?.grower?.entityRegNo?.stateId?.stateName || "NA"
                }
              />
              <Details
                label={"Inspection Status"}
                value={item?.inspectionStatus || "N/A"}
              />
              <Details label={"Season"} value={item?.season || "N/A"} />
              <Details label={"Seed Class"} value={item?.seedClass || "N/A"} />
              <Details
                label={"Inspected Area"}
                value={item?.areaOfInspectionField || "N/A"}
              />
              <Details
                label={
                  "Total acres under seed production of this hybrid/variety"
                }
                value={item?.totalAcreUnderSeedProd || "N/A"}
              />
              <Details
                label={"Date of Inspection"}
                value={item?.dateOfInspection || "N/A"}
              />

              {/* Type-specific fields */}
              {cropFirTypeId == 1 && (
                <>
                  <Details
                    label={"Seed Source"}
                    value={item?.seedSource || "N/A"}
                  />
                  <Details
                    label={"Female Parent"}
                    value={item?.femaleParent || "N/A"}
                  />
                  <Details
                    label={"Male Parent"}
                    value={item?.maleParent || "N/A"}
                  />
                  <Details
                    label={"Code / Hybrid Designation"}
                    value={item?.hybridCodeDesignation || "N/A"}
                  />
                  <Details
                    label={"Date of Sowing"}
                    value={item?.dateOfSowing || "N/A"}
                  />
                  <Details
                    label={"Expected Date of Harvest"}
                    value={item?.expectedDateOfHarvest || "N/A"}
                  />
                  <Details
                    label={"Report Number"}
                    value={item?.reportNo || "N/A"}
                  />
                  <Details
                    label={"Time From"}
                    value={item?.timeFrom || "N/A"}
                  />
                  <Details label={"Time To"} value={item?.timeTo || "N/A"} />
                  <Details
                    label={"Planting Ratio"}
                    value={item?.plantingRatio || "N/A"}
                  />
                  <Details
                    label={"Previous Crop"}
                    value={item?.previousCrop || "N/A"}
                  />
                  <Details
                    label={"Are Both End Marked"}
                    value={item?.areBothEndMarked || "N/A"}
                  />
                  <Details
                    label={"Method of marking male rows"}
                    value={item?.methodOfMarkingMaleRows || "N/A"}
                  />
                  <Details
                    label={"Stage of crop growth at this inspection"}
                    value={item?.stageOfGrowthOfAtTheInspection || "N/A"}
                  />
                  <Details
                    label={"Stage Of Growth Of Contaminant"}
                    value={item?.stageOfGrowthOfContaminant || "N/A"}
                  />
                  <Details
                    label={"North"}
                    value={item?.isolationDistanceNorth || "N/A"}
                  />
                  <Details
                    label={"South"}
                    value={item?.isolationDistanceSouth || "N/A"}
                  />
                  <Details
                    label={"East"}
                    value={item?.isolationDistanceEast || "N/A"}
                  />
                  <Details
                    label={"West"}
                    value={item?.isolationDistanceWest || "N/A"}
                  />
                  <Details
                    label={"No of Border Row"}
                    value={item?.noOfBorderRows || "N/A"}
                  />
                  <Details
                    label={"Crop Condition"}
                    value={item?.cropCondition || "N/A"}
                  />
                  <Details
                    label={"No of times Pollen Shedders"}
                    value={item?.noOfTimesPollenShedders || "N/A"}
                  />
                  <Details
                    label={"Frequency of Pollen Shedders"}
                    value={item?.frequencyOfPollenShedders || "N/A"}
                  />
                  <Details
                    label={"Was it done at inspection time?"}
                    value={item?.wasItDoneAtInspectionTime || "N/A"}
                  />
                  <Details
                    label={
                      "Does this crop conform to the standards for certification"
                    }
                    value={item?.doesThisCropConfirmToStandard || "N/A"}
                  />
                  <Details
                    label={"Estimated seed yield (Kgs/ Hect.)"}
                    value={item?.estimatedSeedYield || "N/A"}
                  />
                  <Details
                    label={
                      "Was the Grower or his representatives present at inspection time?"
                    }
                    value={item?.wasTheGrowerPresent || "N/A"}
                  />
                  <Details
                    label={"Is this the final report?"}
                    value={item?.isFinal || "N/A"}
                  />
                  <Details
                    label={"Area rejected (in Ha)"}
                    value={item?.areaRejected || "N/A"}
                  />
                  <Details
                    label={"Area certified (in Ha)"}
                    value={item?.areaCertified || "N/A"}
                  />
                  <Details label={"Name"} value={item?.name || "N/A"} />
                  <Details
                    label={"Designation"}
                    value={item?.designation || "N/A"}
                  />
                  <Details label={"Address"} value={item?.address || "N/A"} />
                  <Details label={"Remarks"} value={item?.remarks || "N/A"} />
                </>
              )}

              {cropFirTypeId == 2 && (
                <>
                  <Details
                    label={"Nature of Programme"}
                    value={item?.natureOfProgramme || "N/A"}
                  />
                  <Details
                    label={"Report Number"}
                    value={item?.reportNo || "N/A"}
                  />
                  <Details
                    label={"Location of Farm"}
                    value={item?.locationOfFarm || "N/A"}
                  />
                  <Details
                    label={"Source of Seed"}
                    value={item?.sourceOfSeed || "N/A"}
                  />
                  <Details
                    label={"Total Acreage under Production"}
                    value={item?.totalAcreageUnderProduction || "N/A"}
                  />
                  <Details
                    label={"Acreage of Field Inspected"}
                    value={item?.acreageOfFieldInspected || "N/A"}
                  />
                  <Details
                    label={"Previous Crop"}
                    value={item?.previousCrop || "N/A"}
                  />
                  <Details
                    label={"Isolation Distance"}
                    value={item?.isolationDistance || "N/A"}
                  />
                  <Details
                    label={"Stage of Contaminant"}
                    value={item?.stageOfContaminant || "N/A"}
                  />
                  <Details
                    label={"Stage of Seed Crop at Time Inspection"}
                    value={item?.stageOfSeedCropAtTimeInspection || "N/A"}
                  />
                  <Details
                    label={"Date of Sowing"}
                    value={item?.dateOfSowing || "N/A"}
                  />
                  <Details
                    label={"Expected Date of Harvest From"}
                    value={item?.expectedDateOfHarvestFrom || "N/A"}
                  />
                  <Details
                    label={"Expected Date of Harvest To"}
                    value={item?.expectedDateOfHarvestTo || "N/A"}
                  />
                  <Details
                    label={"Percentage of Off-Types"}
                    value={item?.percentageOffTypes || "N/A"}
                  />
                  <Details
                    label={"Percentage of Inseparable Crops"}
                    value={item?.percentageInseparableCrops || "N/A"}
                  />
                  <Details
                    label={"Percentage of Objectionable Weeds"}
                    value={item?.percentageObjectionableWeeds || "N/A"}
                  />
                  <Details
                    label={"Percentage of Seed-borne Diseases"}
                    value={item?.percentageSeedBorneDiseases || "N/A"}
                  />
                  <Details
                    label={"Inseparable Crop Plants"}
                    value={item?.inseparableCropPlants || "N/A"}
                  />
                  <Details
                    label={"Objectionable Weed Plants"}
                    value={item?.objectionableWeedPlants || "N/A"}
                  />
                  <Details
                    label={"Seed-borne Diseases"}
                    value={item?.seedBorneDiseases || "N/A"}
                  />
                  <Details
                    label={"Non-seed Borne Diseases"}
                    value={item?.nonSeedBorneDiseases || "N/A"}
                  />
                  <Details
                    label={"Condition of Crop"}
                    value={item?.conditionOfCrop || "N/A"}
                  />
                  <Details
                    label={"Confirm Standard"}
                    value={item?.confirmStandard || "N/A"}
                  />
                  <Details
                    label={"Production Quality"}
                    value={item?.productionQuality || "N/A"}
                  />
                  <Details label={"Is Final"} value={item?.isFinal || "N/A"} />
                  <Details
                    label={"Estimated Raw Seed Yield"}
                    value={item?.estimatedRawSeedYield || "N/A"}
                  />
                  <Details
                    label={"Grower Present"}
                    value={item?.growerPresent || "N/A"}
                  />
                  <Details
                    label={"Submitted For"}
                    value={item?.submittedFor || "N/A"}
                  />
                  <Details
                    label={"Submitted By"}
                    value={item?.submittedBy || "N/A"}
                  />
                  <Details
                    label={"Designation"}
                    value={item?.designation || "N/A"}
                  />
                  <Details label={"Remarks"} value={item?.remarks || "N/A"} />
                  <Details label={"Variety"} value={item?.variety || "N/A"} />
                </>
              )}

              {cropFirTypeId == 3 && (
                <>
                  <Details
                    label={"Source of Seed"}
                    value={item?.sourceOfSeed || "N/A"}
                  />
                  <Details
                    label={"Female Parent"}
                    value={item?.femaleParent || "N/A"}
                  />
                  <Details
                    label={"Male Parent"}
                    value={item?.maleParent || "N/A"}
                  />
                  <Details
                    label={"Hybrid Code Designation"}
                    value={item?.hybridCodeDesignation || "N/A"}
                  />
                  <Details
                    label={"Planting Ratio"}
                    value={item?.plantingRatio || "N/A"}
                  />
                  <Details
                    label={"Are Both End Male Rows Marked"}
                    value={item?.areBothEndMaleRowsMarked || "N/A"}
                  />
                  <Details
                    label={"Method of Marking Male Rows"}
                    value={item?.methodOfMarkingMaleRows || "N/A"}
                  />
                  <Details
                    label={"Isolation Distance Meters"}
                    value={item?.isolationDistanceMeters || "N/A"}
                  />
                  <Details
                    label={"Stage of Growth Coteminant"}
                    value={item?.stageOfGrowthCoteminant || "N/A"}
                  />
                  <Details
                    label={"Stage of Seed Crop at Inspection"}
                    value={item?.stageOfSeedCropAtInspection || "N/A"}
                  />
                  <Details
                    label={"Side of Field From Which Inspection Started"}
                    value={item?.sideOfFieldFromWhichInspectionStarted || "N/A"}
                  />
                  <Details
                    label={"Crop Condition"}
                    value={item?.cropCondition || "N/A"}
                  />
                  <Details
                    label={"Number of Times Detasselled"}
                    value={item?.numberOfTimesDetasselled || "N/A"}
                  />
                  <Details
                    label={"Frequency of Detasselling"}
                    value={item?.frequencyOfDetasselling || "N/A"}
                  />
                  <Details
                    label={"Detasselling Done at Inspection Time"}
                    value={item?.detassellingDoneAtInspectionTime || "N/A"}
                  />
                  <Details
                    label={"Quality of Seed Production Work"}
                    value={item?.qualityOfSeedProductionWork || "N/A"}
                  />
                  <Details
                    label={"Does Crop Conform to Standards"}
                    value={item?.doesCropConformToStandards || "N/A"}
                  />
                  <Details
                    label={"Estimated Seed Yield Qtls or Acres"}
                    value={item?.estimatedSeedYieldQtlsOrAcres || "N/A"}
                  />
                  <Details
                    label={"Was Grower Present at Inspection"}
                    value={item?.wasGrowerPresentAtInspection || "N/A"}
                  />
                  <Details
                    label={"Number of Border Row"}
                    value={item?.numberOfBorderRow || "N/A"}
                  />
                  <Details
                    label={"Is Final Report"}
                    value={item?.isFinalReport || "N/A"}
                  />
                  <Details
                    label={"Area Certified Hect"}
                    value={item?.areaCertifiedHect || "N/A"}
                  />
                  <Details
                    label={"Area Rejected Hect"}
                    value={item?.areaRejectedHect || "N/A"}
                  />
                  <Details label={"Remarks"} value={item?.remarks || "N/A"} />
                </>
              )}
            </View>
          ))}
        </ScrollView>
      )}
      {(item?.productionStatus === "ISSUED" ||
        item?.productionStatus === "INSPECTED") && (
        <CustomButton
          text={"Start Inspection"}
          buttonStyle={styles.buttonStyle}
          textStyle={styles.buttonText}
          disabled={loading}
          handleAction={() =>
            navigation.navigate("StartInspection", { data: detailsData })
          }
        />
      )}
    </WrapperContainer>
  );
};
FiledInspectionReportDetails.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      item: PropTypes.object.isRequired,
    }).isRequired,
  }).isRequired,
};

export default FiledInspectionReportDetails;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  containerStyle: {
    borderWidth: 2,
    backgroundColor: Colors.white,
    width: "95%",
    alignSelf: "center",
    marginVertical: moderateScaleVertical(10),
    borderRadius: moderateScale(5),
    borderColor: Colors.white,
    padding: moderateScale(10),
    elevation: moderateScale(5),
    shadowColor: Colors.greenColor,
    shadowOpacity: scale(0.09),
    shadowRadius: moderateScale(5),
    shadowOffset: { width: 0, height: 3 },
  },
  labelText: {
    fontFamily: FontFamily.PoppinsRegular,
    color: Colors.gray,
    fontSize: textScale(12),
    letterSpacing: scale(0.2),
    textTransform: "capitalize",
    flex: 1,
    textAlign: "left",
  },
  valueText: {
    fontFamily: FontFamily.PoppinsRegular,
    color: Colors.textColor,
    fontSize: textScale(13),
    letterSpacing: scale(0.2),
    flex: 1,
    textAlign: "right",
  },
  detailsHolderView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: moderateScale(5),
    borderBottomColor: Colors.diabledColor,
    flex: 1,
  },
  headerText: {
    fontSize: textScale(13),
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.greenColor,
    marginBottom: moderateScaleVertical(4),
    borderLeftWidth: moderateScale(2),
    padding: moderateScale(5),
    paddingHorizontal: moderateScale(10),
    borderColor: Colors.primary,
  },
  tableRowHeader: {
    flexDirection: "row",
    backgroundColor: Colors.lightBackground,
    paddingVertical: moderateScaleVertical(8),
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: moderateScale(1),
    borderColor: Colors.white,
    paddingVertical: moderateScaleVertical(8),
  },
  tableCell: {
    paddingHorizontal: moderateScale(12),
    fontSize: textScale(12),
    color: Colors.gray,
    textAlign: "centers",
    textTransform: "capitalize",
    fontFamily: FontFamily.PoppinsRegular,
  },
  cellSerial: {
    minWidth: moderateScale(75),
    textAlign: "centers",
    fontFamily: FontFamily.PoppinsMedium,
  },
  cellAddress: {
    minWidth: moderateScale(150),
  },
  cellType: {
    minWidth: moderateScale(100),
    textAlign: "center",
  },
  cellArea: {
    minWidth: moderateScale(90),
    textAlign: "right",
  },
  buttonStyle: {
    backgroundColor: Colors.greenColor,
    width: "95%",
    alignSelf: "center",
    marginVertical: moderateScaleVertical(10),
    height: moderateScale(50),
  },
  buttonText: {
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.white,
    fontSize: textScale(14),
    letterSpacing: scale(0.2),
    textTransform: "capitalize",
  },
});

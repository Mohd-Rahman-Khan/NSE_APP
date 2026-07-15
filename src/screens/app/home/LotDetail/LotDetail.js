import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import WrapperContainer from "../../../../utils/WrapperContainer";
import InnerHeader from "../../../../components/InnerHeader";
import Colors from "../../../../utils/Colors";
import { moderateScale, textScale } from "../../../../utils/responsiveSize";
import FontFamily from "../../../../utils/FontFamily";
import { decryptAES, encryptWholeObject } from "../../../../utils/decryptData";
import { apiRequest } from "../../../../services/APIRequest";
import { API_ROUTES } from "../../../../services/APIRoutes";
import { showErrorMessage } from "../../../../utils/HelperFunction";

export default function LotDetail() {
  const [loading, setLoading] = useState(false);
  const [lotNumber, setLotNumber] = useState(
    // "2026-2027 | Rabi | Coriander | Badami | FS | I | GRW-7485-1",
    "",
  );
  const [lotDetails, setLotDetails] = useState("");
  const getLotDetail = async () => {
    setLoading(true);
    try {
      const payloadData = {
        lotBatchNo: lotNumber,
        //lotBatchNo: "2026-2027 | Rabi | Coriander | Badami | FS | I | GRW-7485-1",
      };

      const encryptedPayload = encryptWholeObject(payloadData);
      const response = await apiRequest(
        API_ROUTES.GET_LOT_DETAIL,
        "post",
        encryptedPayload,
      );
      const decrypted = decryptAES(response);
      const parsedDecrypted = JSON.parse(decrypted);
      console.log(parsedDecrypted, "getLotDetail");
      if (
        (parsedDecrypted?.statusCode == 200 ||
          parsedDecrypted?.statusCode == 201) &&
        parsedDecrypted?.data
      ) {
        let deta = {
          id: 25,
          lotBatchNo:
            "2026-2027 | Rabi | Coriander | Badami | FS | I | GRW-7485-1",
          prLotNumber:
            "2026-2027 | Rabi | Coriander | Badami | FS | I | GRW-7485-101",
          quantity: 200,
          noOfBags: 0,
          uom: "Kg",
          packingSize: null,
          sourceType: "SEED_INTAKE",
          sourceReferenceId: null,
          transactionNo: "SDINTK/029/2026-2027/05/03673",
          materialType: "SEED",
          transactionStage: "PROCESSED",
          stageCompleted: false,
          unitId: 43,
          unitType: "AO",
          aoId: 43,
          roId: 40,
          subUnitId: 16,
          subUnitType: "PROCESSING_CENTER",
          subUnitName: "PROCESSING_CENTER",
          godownId: null,
          godownName: null,
          itemName: "Coriander | Badami | FS | I",
          itemCode: null,
          itemId: null,
          crop: "Coriander",
          cropId: 39,
          seedVariety: "Badami",
          seedVarietyId: 58,
          seedType: "GRADED",
          itemStatus: null,
          fromSeedClass: "BS",
          toSeedClass: "FS",
          fromStage: "",
          toStage: "I",
          season: "Rabi",
          seasonId: 4,
          growerId: 52,
          growerName: "Nitesh Farmer",
          growerCode: "GRW-7485",
          processingCenterId: 16,
          processingCenterName: "PC LKO",
          processingDate: "2026-05-20",
          moisture: 12,
          packagingCenterId: null,
          packagingCenterName: null,
          bagSize: null,
          bagType: null,
          packingDate: null,
          packagingDate: null,
          isBulkPackaging: null,
          isFinalPackaging: null,
          tagFrom: null,
          tagTo: null,
          labelFrom: null,
          labelTo: null,
          tagNumber: null,
          noOfLabel: null,
          qcCompleted: null,
          germinationPercentage: null,
          labType: "NSC",
          couponNo: "Coupon-No-20052026-03683",
          productionSeedTempLotId: 114,
          scheduleId: 29,
          planId: 101,
          finYearId: 19,
          movementDate: null,
          expiryDate: null,
          expiryMonth: null,
          remarks: null,
          status: "ACTIVE",
          currentOpenQty: 194,
          currentOpenBags: null,
          currentOpenType: "GRADED",
          rawSeed: 200,
          gradedSeed: 194,
          underSizeQty: 3,
          overSizeQty: 2,
          processingShortageQty: 1,
          totalUndersizeQty: null,
          totalOversizeQty: null,
          totalShortageQty: 1,
          packedQty: null,
          packagingShortageQty: null,
          unpackedQty: null,
          totalPackagingShortageQty: null,
          history: [
            {
              srNo: 2,
              stage: "RETURNED",
              inputQty: null,
              inputBags: null,
              gradedQty: null,
              gradedBags: null,
              gradedPercentage: null,
              undersizeQty: 3,
              undersizeBags: null,
              undersizePercentage: null,
              oversizeQty: 2,
              oversizeBags: null,
              oversizePercentage: null,
              processingShortageQty: null,
              processingShortagePercentage: null,
              packedQty: null,
              packedBags: null,
              packedPercentage: null,
              packagingShortageQty: null,
              packagingShortagePercentage: null,
              unpackedQty: null,
              unpackedPercentage: null,
              qcSampleQty: null,
              isClosed: true,
              eventDate: null,
            },
            {
              srNo: 1,
              stage: "PROCESSED",
              inputQty: null,
              inputBags: null,
              gradedQty: 194,
              gradedBags: null,
              gradedPercentage: null,
              undersizeQty: 3,
              undersizeBags: null,
              undersizePercentage: null,
              oversizeQty: 2,
              oversizeBags: null,
              oversizePercentage: null,
              processingShortageQty: 1,
              processingShortagePercentage: null,
              packedQty: null,
              packedBags: null,
              packedPercentage: null,
              packagingShortageQty: null,
              packagingShortagePercentage: null,
              unpackedQty: null,
              unpackedPercentage: null,
              qcSampleQty: null,
              isClosed: false,
              eventDate: "2026-05-20",
            },
            {
              srNo: 0,
              stage: null,
              inputQty: 200,
              inputBags: 0,
              gradedQty: null,
              gradedBags: null,
              gradedPercentage: null,
              undersizeQty: null,
              undersizeBags: null,
              undersizePercentage: null,
              oversizeQty: null,
              oversizeBags: null,
              oversizePercentage: null,
              processingShortageQty: null,
              processingShortagePercentage: null,
              packedQty: null,
              packedBags: null,
              packedPercentage: null,
              packagingShortageQty: null,
              packagingShortagePercentage: null,
              unpackedQty: null,
              unpackedPercentage: null,
              qcSampleQty: null,
              isClosed: true,
              eventDate: null,
            },
          ],
          packingDetails: null,
          scheduleGrowerName: "Nitesh Farmer",
          scheduleGrowerCode: "GRW-7485",
          scheduleProgrammeId:
            "2026-2027 | Rabi | Coriander | Badami | FS | I | GRW-7485",
          scheduleAreaPlanted: 5,
          scheduleEstimatedRawSeed: 100,
          scheduleEstimatedGoodSeed: 100,
          tempLotRawSeed: null,
          tempLotGradedSeed: 194,
          tempLotPackedSeed: null,
          tempLotProcessingShortage: null,
          tempLotPackagingShortage: null,
          tempLotUndersizeQty: 0,
          tempLotOversizeQty: 0,
        };
        setLotDetails(parsedDecrypted?.data);
      } else {
        showErrorMessage(parsedDecrypted?.message || "Details not found.");
      }
    } catch (err) {
      showErrorMessage(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <WrapperContainer isLoading={loading}>
      <InnerHeader title="LOT Details" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Search */}

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            value={lotNumber}
            onChangeText={setLotNumber}
            placeholder="Enter Lot Number"
            placeholderTextColor="#888"
          />

          <TouchableOpacity style={styles.searchBtn} onPress={getLotDetail}>
            <Text style={styles.searchText}>Search</Text>
          </TouchableOpacity>
        </View>

        {!!lotDetails && (
          <>
            {/* Summary */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Progress Summary</Text>

              <View style={styles.summaryGrid}>
                <View
                  style={[styles.smallCard, { backgroundColor: "#E8F5E9" }]}
                >
                  <Text style={styles.smallValue}>{lotDetails.rawSeed}</Text>

                  <Text style={styles.smallLabel}>Raw Seed</Text>
                </View>

                <View
                  style={[styles.smallCard, { backgroundColor: "#E3F2FD" }]}
                >
                  <Text style={styles.smallValue}>{lotDetails.gradedSeed}</Text>

                  <Text style={styles.smallLabel}>Graded</Text>
                </View>

                <View
                  style={[styles.smallCard, { backgroundColor: "#FFF8E1" }]}
                >
                  <Text style={styles.smallValue}>
                    {lotDetails.currentOpenQty}
                  </Text>

                  <Text style={styles.smallLabel}>Open Qty</Text>
                </View>

                <View
                  style={[styles.smallCard, { backgroundColor: "#FBE9E7" }]}
                >
                  <Text style={styles.smallValue}>
                    {lotDetails.processingShortageQty}
                  </Text>

                  <Text style={styles.smallLabel}>Shortage</Text>
                </View>
              </View>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.lotNumber}>{lotDetails.lotBatchNo}</Text>

              <View style={styles.summaryRow}>
                <View>
                  <Text style={styles.label}>Current Stage</Text>
                  <Text style={styles.value}>
                    {lotDetails.transactionStage}
                  </Text>
                </View>

                <View>
                  <Text style={styles.label}>Status</Text>
                  <Text
                    style={[
                      styles.status,
                      {
                        color: lotDetails.status === "ACTIVE" ? "green" : "red",
                      },
                    ]}
                  >
                    {lotDetails.status}
                  </Text>
                </View>
              </View>
            </View>

            {/* Basic Information */}

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Basic Information</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>PR Lot Number</Text>

                <Text style={styles.infoValue}>
                  {lotDetails.prLotNumber || "-"}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Transaction No</Text>

                <Text style={styles.infoValue}>{lotDetails.transactionNo}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Material Type</Text>

                <Text style={styles.infoValue}>{lotDetails.materialType}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Source Type</Text>

                <Text style={styles.infoValue}>{lotDetails.sourceType}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Unit Type</Text>

                <Text style={styles.infoValue}>{lotDetails.unitType}</Text>
              </View>
            </View>

            {/* Crop Information */}

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Crop Information</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Crop</Text>

                <Text style={styles.infoValue}>{lotDetails.crop}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Variety</Text>

                <Text style={styles.infoValue}>{lotDetails.seedVariety}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Seed Type</Text>

                <Text style={styles.infoValue}>{lotDetails.seedType}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>From Class</Text>

                <Text style={styles.infoValue}>{lotDetails.fromSeedClass}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>To Class</Text>

                <Text style={styles.infoValue}>{lotDetails.toSeedClass}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Season</Text>

                <Text style={styles.infoValue}>{lotDetails.season}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>UOM</Text>

                <Text style={styles.infoValue}>{lotDetails.uom}</Text>
              </View>
            </View>
            {/* Quantity Details */}

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Quantity Details</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Quantity</Text>
                <Text style={styles.infoValue}>
                  {lotDetails.quantity} {lotDetails.uom}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Current Open Qty</Text>
                <Text style={styles.infoValue}>
                  {lotDetails.currentOpenQty} {lotDetails.uom}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Raw Seed</Text>
                <Text style={styles.infoValue}>
                  {lotDetails.rawSeed} {lotDetails.uom}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Graded Seed</Text>
                <Text style={styles.infoValue}>
                  {lotDetails.gradedSeed} {lotDetails.uom}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Under Size Qty</Text>
                <Text style={styles.infoValue}>
                  {lotDetails.underSizeQty} {lotDetails.uom}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Over Size Qty</Text>
                <Text style={styles.infoValue}>
                  {lotDetails.overSizeQty} {lotDetails.uom}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Processing Shortage</Text>
                <Text style={styles.infoValue}>
                  {lotDetails.processingShortageQty} {lotDetails.uom}
                </Text>
              </View>
            </View>

            {/* Location Details */}

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Location Details</Text>

              {/* <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>RO Id</Text>
                <Text style={styles.infoValue}>{lotDetails.roId}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>AO Id</Text>
                <Text style={styles.infoValue}>{lotDetails.aoId}</Text>
              </View> */}

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Unit Type</Text>
                <Text style={styles.infoValue}>{lotDetails.unitType}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Processing Center</Text>
                <Text style={styles.infoValue}>
                  {lotDetails.processingCenterName || "-"}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Sub Unit</Text>
                <Text style={styles.infoValue}>
                  {lotDetails.subUnitName || "-"}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Godown</Text>
                <Text style={styles.infoValue}>
                  {lotDetails.godownName || "-"}
                </Text>
              </View>
            </View>

            {/* Grower Details */}

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Grower Details</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Grower Name</Text>
                <Text style={styles.infoValue}>{lotDetails.growerName}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Grower Code</Text>
                <Text style={styles.infoValue}>{lotDetails.growerCode}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Programme Id</Text>
                <Text style={styles.infoValue}>
                  {lotDetails.scheduleProgrammeId}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Area Planted</Text>
                <Text style={styles.infoValue}>
                  {lotDetails.scheduleAreaPlanted}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Estimated Raw Seed</Text>
                <Text style={styles.infoValue}>
                  {lotDetails.scheduleEstimatedRawSeed}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Estimated Good Seed</Text>
                <Text style={styles.infoValue}>
                  {lotDetails.scheduleEstimatedGoodSeed}
                </Text>
              </View>
            </View>

            {/* Processing Details */}

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Processing Details</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Processing Date</Text>
                <Text style={styles.infoValue}>
                  {lotDetails.processingDate || "-"}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Moisture</Text>
                <Text style={styles.infoValue}>
                  {lotDetails.moisture ?? "-"} %
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Coupon No</Text>
                <Text style={styles.infoValue}>{lotDetails.couponNo}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Lab Type</Text>
                <Text style={styles.infoValue}>{lotDetails.labType}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Current Open Type</Text>
                <Text style={styles.infoValue}>
                  {lotDetails.currentOpenType}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Transaction Stage</Text>
                <Text style={styles.infoValue}>
                  {lotDetails.transactionStage}
                </Text>
              </View>
            </View>
            {/* ================= Packaging Details ================= */}

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Packaging Details</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Packaging Center</Text>
                <Text style={styles.infoValue}>
                  {lotDetails.packagingCenterName || "-"}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Packing Date</Text>
                <Text style={styles.infoValue}>
                  {lotDetails.packingDate || "-"}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Packaging Date</Text>
                <Text style={styles.infoValue}>
                  {lotDetails.packagingDate || "-"}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Bag Size</Text>
                <Text style={styles.infoValue}>
                  {lotDetails.bagSize || "-"}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Bag Type</Text>
                <Text style={styles.infoValue}>
                  {lotDetails.bagType || "-"}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>No Of Bags</Text>
                <Text style={styles.infoValue}>
                  {lotDetails.noOfBags ?? "-"}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Packed Qty</Text>
                <Text style={styles.infoValue}>
                  {lotDetails.packedQty || "-"}
                </Text>
              </View>
            </View>

            {/* ================= Temporary Lot Details ================= */}

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Temporary Lot Details</Text>

              {/* <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Temp Lot Id</Text>
                <Text style={styles.infoValue}>
                  {lotDetails.productionSeedTempLotId}
                </Text>
              </View> */}

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Raw Seed</Text>
                <Text style={styles.infoValue}>
                  {lotDetails.tempLotRawSeed || "-"}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Graded Seed</Text>
                <Text style={styles.infoValue}>
                  {lotDetails.tempLotGradedSeed || "-"}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Packed Seed</Text>
                <Text style={styles.infoValue}>
                  {lotDetails.tempLotPackedSeed || "-"}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Processing Shortage</Text>
                <Text style={styles.infoValue}>
                  {lotDetails.tempLotProcessingShortage || "-"}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Packaging Shortage</Text>
                <Text style={styles.infoValue}>
                  {lotDetails.tempLotPackagingShortage || "-"}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Under Size Qty</Text>
                <Text style={styles.infoValue}>
                  {lotDetails.tempLotUndersizeQty || 0}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Over Size Qty</Text>
                <Text style={styles.infoValue}>
                  {lotDetails.tempLotOversizeQty || 0}
                </Text>
              </View>
            </View>

            {/* ================= History Timeline ================= */}

            <View style={styles.card}>
              <Text style={styles.cardTitle}>History</Text>

              {lotDetails?.history?.map((item, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.timelineDot,
                        {
                          backgroundColor: item.isClosed
                            ? "#4CAF50"
                            : "#FF9800",
                        },
                      ]}
                    />

                    {index !== lotDetails.history.length - 1 && (
                      <View style={styles.timelineLine} />
                    )}
                  </View>

                  <View style={styles.timelineRight}>
                    <View style={styles.stageHeader}>
                      <Text style={styles.stageTitle}>
                        {item.stage || "INPUT"}
                      </Text>

                      <View
                        style={[
                          styles.statusChip,
                          {
                            backgroundColor: item.isClosed
                              ? "#E8F5E9"
                              : "#FFF3E0",
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: item.isClosed ? "#2E7D32" : "#F57C00",
                            fontWeight: "700",
                          }}
                        >
                          {item.isClosed ? "Closed" : "Open"}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.historyDate}>
                      {item.eventDate || "-"}
                    </Text>

                    <View style={styles.historyGrid}>
                      <Text style={styles.historyText}>
                        Input Qty : {item.inputQty ?? "-"}
                      </Text>

                      <Text style={styles.historyText}>
                        Graded Qty : {item.gradedQty ?? "-"}
                      </Text>

                      <Text style={styles.historyText}>
                        Under Size : {item.undersizeQty ?? "-"}
                      </Text>

                      <Text style={styles.historyText}>
                        Over Size : {item.oversizeQty ?? "-"}
                      </Text>

                      <Text style={styles.historyText}>
                        Packed Qty : {item.packedQty ?? "-"}
                      </Text>

                      <Text style={styles.historyText}>
                        QC Sample : {item.qcSampleQty ?? "-"}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
            {/* ================= History Table ================= */}

            <View style={styles.card}>
              <Text style={styles.cardTitle}>History Summary</Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.th, { width: 80 }]}>Stage</Text>
                    <Text style={[styles.th, { width: 70 }]}>Input</Text>
                    <Text style={[styles.th, { width: 70 }]}>Graded</Text>
                    <Text style={[styles.th, { width: 70 }]}>Under</Text>
                    <Text style={[styles.th, { width: 70 }]}>Over</Text>
                    <Text style={[styles.th, { width: 70 }]}>Packed</Text>
                    <Text style={[styles.th, { width: 70 }]}>QC</Text>
                  </View>

                  {lotDetails?.history?.map((item, index) => (
                    <View
                      key={index}
                      style={[
                        styles.tableRow,
                        {
                          backgroundColor:
                            index % 2 === 0 ? "#FAFAFA" : "#FFFFFF",
                        },
                      ]}
                    >
                      <Text style={[styles.td, { width: 80 }]}>
                        {item.stage || "INPUT"}
                      </Text>

                      <Text style={[styles.td, { width: 70 }]}>
                        {item.inputQty ?? "-"}
                      </Text>

                      <Text style={[styles.td, { width: 70 }]}>
                        {item.gradedQty ?? "-"}
                      </Text>

                      <Text style={[styles.td, { width: 70 }]}>
                        {item.undersizeQty ?? "-"}
                      </Text>

                      <Text style={[styles.td, { width: 70 }]}>
                        {item.oversizeQty ?? "-"}
                      </Text>

                      <Text style={[styles.td, { width: 70 }]}>
                        {item.packedQty ?? "-"}
                      </Text>

                      <Text style={[styles.td, { width: 70 }]}>
                        {item.qcSampleQty ?? "-"}
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Remarks</Text>

              <Text style={styles.remarkText}>
                {lotDetails.remarks || "No Remarks Available"}
              </Text>
            </View>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: "#E8F5E9",
                  alignItems: "center",
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "700",
                  color: "#2E7D32",
                }}
              >
                {lotDetails.status}
              </Text>

              <Text
                style={{
                  marginTop: 6,
                  color: "#555",
                }}
              >
                Current Transaction Stage
              </Text>

              <Text
                style={{
                  fontWeight: "700",
                  marginTop: 5,
                  fontSize: 18,
                }}
              >
                {lotDetails.transactionStage}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </WrapperContainer>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: moderateScale(1),
    borderColor: Colors.lightBackground,
    backgroundColor: Colors.lightBackground,
    borderRadius: moderateScale(5),
    padding: moderateScale(10),
    marginVertical: moderateScale(8),
    fontSize: textScale(13),
    color: Colors.black,
    fontFamily: FontFamily.PoppinsRegular,
    width: "70%",
  },
  container: {
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  primaryBtn: {
    backgroundColor: Colors.greenColor,
    //height: moderateScale(40),
    padding: moderateScale(10),
    width: "25%",
    borderRadius: moderateScale(6),
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: Colors.white,
    fontFamily: FontFamily.PoppinsMedium,
    fontSize: textScale(12),
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },

  searchContainer: {
    flexDirection: "row",
    padding: 15,
    alignItems: "center",
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    height: 48,
  },

  searchBtn: {
    marginLeft: 10,
    backgroundColor: Colors.greenColor,
    paddingHorizontal: 18,
    height: 48,
    justifyContent: "center",
    borderRadius: 10,
  },

  searchText: {
    color: "#fff",
    fontWeight: "600",
  },

  summaryCard: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    marginBottom: 15,
  },

  lotNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },

  label: {
    color: "#777",
    fontSize: 12,
  },

  value: {
    fontWeight: "700",
    fontSize: 15,
    marginTop: 4,
  },

  status: {
    fontWeight: "700",
    fontSize: 15,
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    padding: 15,
    elevation: 2,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    color: "#1E293B",
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 10,
  },

  infoLabel: {
    color: "#666",
    flex: 1,
  },

  infoValue: {
    flex: 1,
    textAlign: "right",
    color: "#111",
    fontWeight: "600",
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 20,
  },

  timelineLeft: {
    width: 35,
    alignItems: "center",
  },

  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },

  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#D1D5DB",
    marginTop: 2,
  },

  timelineRight: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 12,
  },

  stageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  stageTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },

  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  historyDate: {
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 10,
    fontSize: 12,
  },

  historyGrid: {
    gap: 5,
  },

  historyText: {
    fontSize: 13,
    color: "#374151",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#4CAF50",
  },

  th: {
    color: "#fff",
    fontWeight: "700",
    padding: 10,
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
  },

  td: {
    padding: 10,
    color: "#333",
  },

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  smallCard: {
    width: "48%",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  smallValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },

  smallLabel: {
    color: "#666",
    marginTop: 4,
  },

  remarkText: {
    color: "#444",
    lineHeight: 22,
    fontSize: 14,
  },
});

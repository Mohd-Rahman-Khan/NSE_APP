import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import DropDown from "../../components/DropDown";
import { decryptAES, encryptWholeObject } from "../../utils/decryptData";
import { apiRequest } from "../../services/APIRequest";
import { showErrorMessage } from "../../utils/HelperFunction";
import { API_ROUTES } from "../../services/APIRoutes";

export default function ProductionFilterComp({
  applyFilter,
  season,
  financialYear,
  onCLose = () => {},
}) {
  const [selectedFinancialYear, setselectedFinancialYear] = useState(
    financialYear[0],
  );
  const [selectedSeason, setselectedSeason] = useState("");
  const [cropListData, setCropListData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCrop, setselectedCrop] = useState("");
  const [seedVariety, setseedVariety] = useState([]);
  const [selectedVariety, setselectedVariety] = useState("");
  const [classes, setclasses] = useState([
    { id: 1, name: "NS" },
    { id: 2, name: "BS" },
    { id: 3, name: "FS" },
    { id: 4, name: "CS" },
    { id: 5, name: "TL" },
  ]);
  const [selectedClass, setselectedClass] = useState("");

  const getCropList = async (selectedSeasonId) => {
    try {
      const payloadData = { seasons: [selectedSeasonId] };
      const encryptedPayload = encryptWholeObject(payloadData);
      const cropListResp = await apiRequest(
        API_ROUTES.CROP_MASTER_DD,
        "POST",
        encryptedPayload,
      );
      const decryptedCropListData = decryptAES(cropListResp);
      const parsedDecryptedCropListData = JSON.parse(decryptedCropListData);
      if (
        parsedDecryptedCropListData?.status === "SUCCESS" &&
        parsedDecryptedCropListData?.statusCode === "200"
      ) {
        setCropListData(parsedDecryptedCropListData?.data || []);
      } else {
        showErrorMessage("Unable to get the crop List Data");
        setCropListData([]);
      }
    } catch (error) {
      console.log(error, "line error");
      showErrorMessage("something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const getSeedVariety = async (selectedCropId) => {
    try {
      const payloadData = { cropId: selectedCropId };
      const encryptedPayload = encryptWholeObject(payloadData);
      const cropListResp = await apiRequest(
        API_ROUTES.SEED_VARIETY_MASTER,
        "POST",
        encryptedPayload,
      );
      const decryptedCropListData = decryptAES(cropListResp);
      const parsedDecryptedCropListData = JSON.parse(decryptedCropListData);
      if (
        parsedDecryptedCropListData?.status === "SUCCESS" &&
        parsedDecryptedCropListData?.statusCode === "200"
      ) {
        setseedVariety(parsedDecryptedCropListData?.data || []);
      } else {
        showErrorMessage("Unable to get the crop List Data");
        setseedVariety([]);
      }
    } catch (error) {
      console.log(error, "line error");
      showErrorMessage("something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <View>
      <DropDown
        label="Financial Year"
        data={financialYear}
        value={selectedFinancialYear?.finYearShortName}
        selectItem={(item) => setselectedFinancialYear(item)}
      />
      <DropDown
        label="Season"
        data={season}
        value={selectedSeason?.seasonType}
        selectItem={(item) => {
          setselectedSeason(item);
          getCropList(item?.id);
        }}
      />
      <DropDown
        label="Crop"
        data={cropListData}
        value={selectedCrop?.seedCropName}
        selectItem={(item) => {
          setselectedCrop(item);
          getSeedVariety(item?.id);
        }}
      />
      <DropDown
        label="Variety"
        data={seedVariety}
        value={selectedVariety?.seedVarietyName}
        selectItem={(item) => {
          setselectedVariety(item);
        }}
      />
      <DropDown
        label="Class"
        data={classes}
        value={selectedClass?.name}
        selectItem={(item) => {
          setselectedClass(item);
        }}
      />
      <View style={styles.bottomBtns}>
        <TouchableOpacity onPress={onCLose} style={styles.resetBtn}>
          <Text style={{ color: "#6b4caf" }}>Calncel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            applyFilter(
              selectedFinancialYear,
              selectedSeason,
              selectedCrop,
              selectedVariety,
              selectedClass,
            );
          }}
          style={styles.applyBtn}
        >
          <Text style={{ color: "#fff" }}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  bottomBtns: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  resetBtn: {
    width: "48%",
    backgroundColor: "#e0f2f1",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  applyBtn: {
    width: "48%",
    backgroundColor: "#2e7d32",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
});

import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import DropDown from "../../components/DropDown";
import { decryptAES, encryptWholeObject } from "../../utils/decryptData";
import { apiRequest } from "../../services/APIRequest";
import { showErrorMessage } from "../../utils/HelperFunction";
import { API_ROUTES } from "../../services/APIRoutes";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function MachanicalFilterComp({
  applyFilter = [],
  onCLose = () => {},
  userData,
  chukList = [],
  operationActivityList,
}) {
  const [loading, setLoading] = useState(false);
  const [selectedChak, setselectedChak] = useState("");
  const [squareList, setSquareList] = useState([]);
  const [selectedSquare, setselectedSquare] = useState("");
  const [planList, setPlanList] = useState([]);
  const [selectedPlan, setselectedPlan] = useState("");
  const [selectedActivity, setselectedActivity] = useState("");
  const [selectedStatus, setselectedStatus] = useState({
    id: 1,
    label: "Approved",
    value: "APPROVED",
  });

  const [planDate, setPlanDate] = useState(null);
  const [actualDate, setActualDate] = useState(null);

  const [showPlanDatePicker, setShowPlanDatePicker] = useState(false);
  const [showActualDatePicker, setShowActualDatePicker] = useState(false);
  const drpStatus = [
    {
      id: 1,
      label: "Approved",
      value: "APPROVED",
    },
    {
      id: 2,
      label: "Rejected",
      value: "REJECTED",
    },
    {
      id: 3,
      label: "Submitted",
      value: "SUBMITTED",
    },
  ];

  const formatDisplayDate = (date) => {
    if (!date) return "";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const formatApiDate = (date) => {
    if (!date) return null;

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${year}-${month}-${day}`;
  };

  const getSquareList = async (selectedChak) => {
    setLoading(true);

    try {
      const payloadData = {
        chakId: selectedChak?.id,
      };
      console.log("parsed", payloadData);

      const encryptedPayload = encryptWholeObject(payloadData);

      const response = await apiRequest(
        API_ROUTES.SQUARE_MASTER_DD,
        "post",
        encryptedPayload,
      );

      const decrypted = decryptAES(response);
      const parsed = JSON.parse(decrypted);

      console.log("parsed", parsed);

      if (parsed?.status === "SUCCESS" && parsed?.statusCode === "200") {
        const newData = parsed?.data;

        setSquareList(newData);
      } else {
        showErrorMessage(parsed?.message || "Invalid response");
      }
    } catch (err) {
      console.log("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const getPlanList = async (selectedSquare) => {
    setLoading(true);

    try {
      const payloadData = {
        squareId: selectedSquare?.id,
      };
      console.log("parsed", payloadData);

      const encryptedPayload = encryptWholeObject(payloadData);

      const response = await apiRequest(
        API_ROUTES.PLAN_LIST,
        "post",
        encryptedPayload,
      );

      const decrypted = decryptAES(response);
      const parsed = JSON.parse(decrypted);

      console.log("parsed", parsed);

      if (parsed?.status === "SUCCESS" && parsed?.statusCode === "200") {
        const newData = parsed?.data;

        setPlanList(newData);
      } else {
        showErrorMessage(parsed?.message || "Invalid response");
      }
    } catch (err) {
      console.log("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <DropDown
        label="Chak"
        data={chukList}
        value={selectedChak?.chakName}
        selectItem={(item) => {
          setselectedChak(item);
          getSquareList(item);
        }}
        fieldName="chakName"
      />
      <DropDown
        fieldName="squareName"
        label="Square"
        data={squareList}
        value={selectedSquare?.squareName}
        selectItem={(item) => {
          setselectedSquare(item);
          getPlanList(item);
        }}
      />
      <DropDown
        fieldName="planId"
        label="Plan"
        data={planList}
        value={selectedPlan?.planId}
        selectItem={(item) => {
          setselectedPlan(item);
        }}
      />
      <Text style={styles.label}>DPR Plan Date</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowPlanDatePicker(true)}
      >
        <Text
          style={[styles.dateButtonText, !planDate && styles.placeholderText]}
        >
          {planDate ? formatDisplayDate(planDate) : "Select Plan Date"}
        </Text>
      </TouchableOpacity>

      {showPlanDatePicker && (
        <DateTimePicker
          value={planDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            setShowPlanDatePicker(false);

            if (selectedDate) {
              setPlanDate(selectedDate);
            }
          }}
        />
      )}
      <Text style={styles.label}>DPR Actual Date</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowActualDatePicker(true)}
      >
        <Text
          style={[styles.dateButtonText, !actualDate && styles.placeholderText]}
        >
          {actualDate ? formatDisplayDate(actualDate) : "Select Actual Date"}
        </Text>
      </TouchableOpacity>

      {showActualDatePicker && (
        <DateTimePicker
          value={actualDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            setShowActualDatePicker(false);

            if (selectedDate) {
              setActualDate(selectedDate);
            }
          }}
        />
      )}
      <DropDown
        fieldName="operationName"
        label="DPR Activity"
        data={operationActivityList}
        value={selectedActivity?.operationName}
        selectItem={(item) => {
          setselectedActivity(item);
        }}
      />
      <DropDown
        fieldName="label"
        label="DPR Status"
        data={drpStatus}
        value={selectedStatus?.label}
        selectItem={(item) => {
          setselectedStatus(item);
        }}
      />

      <View style={styles.bottomBtns}>
        <TouchableOpacity onPress={onCLose} style={styles.resetBtn}>
          <Text style={{ color: "#6b4caf" }}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            applyFilter({
              selectedChak,
              selectedSquare,
              selectedPlan,
              selectedActivity,
              selectedStatus,
              actualDate: formatApiDate(actualDate),
              planDate: formatApiDate(planDate),
            });
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
  label: {
    fontSize: 14,
    color: "#000",
    marginBottom: 4,
    fontWeight: "700",
  },

  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#D6D6D6",
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    height: 50,
    marginBottom: 15,
  },

  dateButtonText: {
    flex: 1,
    fontSize: 14,
    color: "#000",
  },

  placeholderText: {
    color: "#8A8A8A",
  },
});

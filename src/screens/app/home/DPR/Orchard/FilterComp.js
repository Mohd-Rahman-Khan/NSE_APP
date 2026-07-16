import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";

import {
  decryptAES,
  encryptWholeObject,
} from "../../../../../utils/decryptData";
import { apiRequest } from "../../../../../services/APIRequest";
import { showErrorMessage } from "../../../../../utils/HelperFunction";
import DateTimePicker from "@react-native-community/datetimepicker";
import DropDown from "../../../../../components/DropDown";
import { API_ROUTES } from "../../../../../services/APIRoutes";

export default function FilterComp({
  applyFilter = [],
  onCLose = () => {},
  userData,
  operationActivityList,
}) {
  const [loading, setLoading] = useState(false);
  const [selectedActivity, setselectedActivity] = useState("");
  const [selectedDprType, setselectedDprType] = useState({
    id: 2,
    name: "Nursery",
    value: "NURSERY",
  });
  const [selectedStatus, setselectedStatus] = useState({
    id: 11,
    label: "All",
    value: "ALL",
  });

  const [planDate, setPlanDate] = useState(null);
  const [actualDate, setActualDate] = useState(null);

  const [showPlanDatePicker, setShowPlanDatePicker] = useState(false);
  const [showActualDatePicker, setShowActualDatePicker] = useState(false);
  const [orchardList, setOrchardList] = useState([]);
  const [selectedOrchard, setselectedOrchard] = useState("");
  const [nurseryList, setnurseryList] = useState([]);
  const [selectedNursery, setselectedNursery] = useState("");
  const [plotList, setPlotList] = useState([]);
  const [selectedPlot, setselectedPlot] = useState("");
  const [planList, setPlanList] = useState([]);
  const [selectedPlan, setselectedPlan] = useState("");
  const drpStatus = [
    {
      id: 11,
      label: "All",
      value: "ALL",
    },
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

  useEffect(() => {
    getOrchardList();
    getNurseryList();
    getPlotList();
    getPlanList();
  }, []);

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

  const getOrchardList = async () => {
    setLoading(true);

    try {
      const payloadData = { epoId: userData?.epoId };

      const encryptedPayload = encryptWholeObject(payloadData);

      const response = await apiRequest(
        API_ROUTES.ORCHARD_MASTER,
        "post",
        encryptedPayload,
      );

      const decrypted = decryptAES(response);
      const parsed = JSON.parse(decrypted);

      console.log("parsed", parsed);

      if (parsed?.status === "SUCCESS" && parsed?.statusCode === "200") {
        const newData = parsed?.data;

        setOrchardList(newData);
      } else {
        setOrchardList([]);
        showErrorMessage(parsed?.message || "Something went wrong");
      }
    } catch (err) {
      console.log("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };
  const getNurseryList = async () => {
    setLoading(true);

    try {
      const payloadData = { epoId: userData?.epoId };

      const encryptedPayload = encryptWholeObject(payloadData);

      const response = await apiRequest(
        API_ROUTES.NURSERY_MASTER,
        "post",
        encryptedPayload,
      );

      const decrypted = decryptAES(response);
      const parsed = JSON.parse(decrypted);

      console.log("parsed", parsed);

      if (parsed?.status === "SUCCESS" && parsed?.statusCode === "200") {
        const newData = parsed?.data;

        setnurseryList(newData);
      } else {
        setnurseryList([]);
        showErrorMessage(parsed?.message || "Something went wrong");
      }
    } catch (err) {
      console.log("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };
  const getPlotList = async () => {
    setLoading(true);

    try {
      const payloadData = { epoId: userData?.epoId };

      const encryptedPayload = encryptWholeObject(payloadData);

      const response = await apiRequest(
        API_ROUTES.EPO_PLOT_MASTER,
        "post",
        encryptedPayload,
      );

      const decrypted = decryptAES(response);
      const parsed = JSON.parse(decrypted);

      console.log("parsed", parsed);

      if (parsed?.status === "SUCCESS" && parsed?.statusCode === "200") {
        const newData = parsed?.data;

        setPlotList(newData);
      } else {
        setPlotList([]);
        showErrorMessage(parsed?.message || "Something went wrong");
      }
    } catch (err) {
      console.log("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };
  const getPlanList = async () => {
    setLoading(true);

    try {
      const payloadData = { epoId: userData?.epoId, status: "ACTIVE" };

      const encryptedPayload = encryptWholeObject(payloadData);

      const response = await apiRequest(
        API_ROUTES.PRODUCTION_PLAN_MASTER,
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
        setPlanList([]);
        showErrorMessage(parsed?.message || "Something went wrong");
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
        fieldName="name"
        label="Plots"
        data={plotList}
        value={selectedPlot?.name}
        selectItem={(item) => {
          setselectedPlot(item);
        }}
      />

      {/* <DropDown
        //fieldName="name"
        label="Plans"
        data={planList}
        value={selectedPlan}
        selectItem={(item) => {
          setselectedPlan(item);
        }}
      /> */}

      {/* <Text style={styles.label}>DPR Plan Date</Text>
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
      )} */}
      <DropDown
        fieldName="operationName"
        label="Last Activity"
        data={operationActivityList}
        value={selectedActivity?.operationName}
        selectItem={(item) => {
          setselectedActivity(item);
        }}
      />
      <DropDown
        fieldName="label"
        label="Last Activity Status"
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
              selectedActivity,
              selectedStatus,
              //actualDate: formatApiDate(actualDate),
              //planDate: formatApiDate(planDate),
              //selectedDprType,
              //selectedNursery,
              //selectedPlan,
              //selectedOrchard,
              selectedPlot,
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
    marginBottom: 20,
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

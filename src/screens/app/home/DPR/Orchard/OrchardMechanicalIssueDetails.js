import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Switch,
  Modal,
} from "react-native";
import React, { useEffect, useState } from "react";
import Colors from "../../../../../utils/Colors";
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from "../../../../../utils/responsiveSize";
import WrapperContainer from "../../../../../utils/WrapperContainer";
import InnerHeader from "../../../../../components/InnerHeader";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import {
  decryptAES,
  encryptWholeObject,
} from "../../../../../utils/decryptData";
import { apiRequest } from "../../../../../services/APIRequest";
import { API_ROUTES } from "../../../../../services/APIRoutes";
import { showErrorMessage } from "../../../../../utils/HelperFunction";
import DropDown from "../../../../../components/DropDown";
import FontFamily from "../../../../../utils/FontFamily";
import { getUserData } from "../../../../../utils/Storage";
import DateTimePicker from "@react-native-community/datetimepicker";

/* ================= MATERIAL TYPE ================= */

const materialTypeList = [
  { id: 1, name: "SEED" },
  { id: 2, name: "VALUE_ADDED" },
  { id: 3, name: "PACKAGING_MATERIAL" },
  { id: 4, name: "AGRO_CHEMICAL" },
  { id: 5, name: "SAPLING" },
  { id: 6, name: "FIXED" },
  { id: 7, name: "CONSUMABLE_PARTS" },
];

/* ================= COMPONENT ================= */

export default function OrchardMechanicalIssueDetails({ route }) {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const dprId = route?.params?.item?.id;

  const [loading, setLoading] = useState(false);
  const [dprData, setDprData] = useState(null);
  const [activityGroups, setActivityGroups] = useState([]);
  const [expandedActivityId, setExpandedActivityId] = useState(null);
  const [selectedEqupment, setselectedEqupment] = useState("");
  const [farmBlokList, setFarmBlokList] = useState([]);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [selectedForwardBlock, setSelectedForwardBlock] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState(null);
  const [selectedTimeField, setSelectedTimeField] = useState("outTime");

  useEffect(() => {
    if (isFocused && dprId) {
      fetchDprDetail();
    }
  }, [isFocused, dprId]);

  useEffect(() => {
    if (!activityGroups.length || !dprData) return;

    activityGroups.forEach((act) => {
      act.mechanicals?.forEach((macItem) => {
        fetchCpList(macItem);
      });
    });
  }, [activityGroups.length]); // 👈 ONLY LENGTH

  /* ================= API ================= */

  const fetchDprDetail = async () => {
    try {
      setLoading(true);
      const payload = encryptWholeObject({ id: dprId });
      const res = await apiRequest(API_ROUTES.DPR_FIND_BY_ID, "POST", payload);
      const parsed = JSON.parse(decryptAES(res));

      if (parsed?.status === "SUCCESS") {
        setDprData(parsed.data);
        groupByActivity(parsed.data);
      } else {
        showErrorMessage(parsed?.message || "Failed to load DPR");
      }
    } catch (e) {
      console.log("DPR Error", e);
      showErrorMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ================= GROUP DATA ================= */

  const groupByActivity = (data) => {
    const map = {};

    data.activities.forEach((a) => {
      const existingLabour =
        data.dprLabour?.filter((l) => l.activityId === a.activityId) || [];

      const labours =
        existingLabour.length > 0
          ? existingLabour.map((l) => ({
              id: l.id,
              activityId: a.activityId,
              labourName: l.labourName || "",
              workingHours: l.workingHours || "",
            }))
          : Array.from({ length: a.noOfLabour || 0 }).map((_, i) => ({
              id: `${a.id}-${i}`, // 🔥 use a.id
              activityId: a.activityId,
              labourName: "",
              workingHours: "",
            }));

      map[a.id] = {
        id: a.id, // 🔥 UNIQUE
        activityId: a.activityId,
        activityName: a.activityName,
        basic: a,
        agricultures: [],
        mechanicals: [],
        labours,
      };
    });

    data.dprAgricultures?.forEach((ag) => {
      const act = Object.values(map).find(
        (x) => x.activityId === ag.activityId,
      );
      act?.agricultures.push(ag);
    });

    data.dprMechanicals?.forEach((me) => {
      const act = Object.values(map).find(
        (x) => x.activityId === me.activityId,
      );
      act?.mechanicals.push({
        ...me,
        isIdleLocked: me.mechIdleTime,
        isRunningLocked: me.mechRunningTime,
        enableInTime: me?.inTime ? false : true,
      });
    });

    setActivityGroups(Object.values(map));
  };

  const updateLabourField = (activityId, labourId, key, value) => {
    setActivityGroups((prev) =>
      prev.map((act) =>
        act.activityId === activityId
          ? {
              ...act,
              labours: act.labours.map((l) =>
                l.id === labourId ? { ...l, [key]: value } : l,
              ),
            }
          : act,
      ),
    );
  };

  /* ================= LABOUR GENERATOR ================= */

  const getLabourRows = (activity) => {
    if (activity.labours?.length > 0) return activity.labours;

    const count = activity.basic?.noOfLabour || 0;
    return Array.from({ length: count }).map((_, i) => ({
      id: `${activity.activityId}-${i}`,
      labourName: "",
      workingHours: "",
    }));
  };

  /* ================= RENDER ACTIVITY ================= */

  // const renderActivity = ({ item, index }) => {
  //   const isOpen = expandedActivityId === item.activityId;

  //   console.log("renderActivity", item);

  //   return (
  //     <View style={styles.activityCard}>
  //       <TouchableOpacity
  //         style={styles.activityHeader}
  //         onPress={() => setExpandedActivityId(isOpen ? null : item.activityId)}
  //       >
  //         <Text style={styles.activityTitle}>
  //           Activity {index + 1} · {item.activityName}
  //         </Text>
  //         <Icon
  //           name={isOpen ? "expand-less" : "expand-more"}
  //           size={26}
  //           color={Colors.greenColor}
  //         />
  //       </TouchableOpacity>

  //       {isOpen && (
  //         <View style={styles.activityBody}>
  //           {/* BASIC */}
  //           {item?.mechanicals?.length > 0 &&
  //             item?.mechanicals?.map((macItem) => {
  //               return (
  //                 <View
  //                   style={[
  //                     styles.activityBody,
  //                     {
  //                       borderTopLeftRadius: 8,
  //                       borderTopRightRadius: 8,
  //                       borderTopWidth: 1,
  //                       marginBottom: 8,
  //                     },
  //                   ]}
  //                 >
  //                   {/* <TextInput
  //                     editable={false}
  //                     style={styles.disabledInput}
  //                     placeholder="Est. Hours"
  //                     keyboardType="numeric"
  //                     value={""}
  //                   /> */}
  //                   <View style={styles.itemRow}>
  //                     <View style={styles.itemColumn}>
  //                       <Text style={styles.itemLabel}>Equipment Name</Text>
  //                       <Text style={styles.itemValue}>
  //                         {macItem?.subGroupName}({macItem?.equipmentName})
  //                       </Text>
  //                     </View>
  //                   </View>
  //                   <View style={styles.itemRow}>
  //                     <View style={styles.itemColumn}>
  //                       <Text style={styles.itemLabel}>Estimate Hours</Text>
  //                       <Text style={styles.itemValue}>
  //                         {macItem?.estimatedHours || "NA"}
  //                       </Text>
  //                     </View>

  //                     <View style={styles.itemColumn}>
  //                       <Text style={styles.itemLabel}>
  //                         Is Operator Required
  //                       </Text>
  //                       <Text style={styles.itemValue}>
  //                         {macItem?.operatorRequired ? "YES" : "NO" || "N/A"}
  //                       </Text>
  //                     </View>
  //                   </View>

  //                   <View
  //                     style={{
  //                       flexDirection: "row",
  //                       alignItems: "center",
  //                       justifyContent: "space-around",
  //                     }}
  //                   >
  //                     <View style={{ width: "40%" }}>
  //                       <CustomButton
  //                         text="Approve"
  //                         buttonStyle={styles.buttonStyle}
  //                         textStyle={styles.buttonTextStyle}
  //                         handleAction={() => {}}
  //                       />
  //                     </View>

  //                     <View style={{ width: "40%" }}>
  //                       <CustomButton
  //                         text="Approve"
  //                         buttonStyle={styles.buttonStyle}
  //                         textStyle={styles.buttonTextStyle}
  //                         handleAction={() => {}}
  //                       />
  //                     </View>
  //                   </View>
  //                 </View>
  //               );
  //             })}

  //           {/* <DropDown disabled label="Activity" value={item.activityName} />
  //           <DropDown
  //             disabled
  //             label="Contractor Type"
  //             value={item.basic?.contractorType}
  //           /> */}
  //         </View>
  //       )}
  //     </View>
  //   );
  // };

  const approveMechanical = async (macItem, status) => {
    try {
      setLoading(true);

      const userData = await getUserData();

      // const payload = {

      //   id: macItem.id,

      //   equipmentId: macItem.equipmentId,
      //   equipmentName: macItem.equipmentName,

      //   subGroupId: macItem.subGroupId,
      //   subGroupName: macItem.subGroupName,

      //   operatorRequired: macItem.operatorRequired,
      //   operatorName: macItem.operatorRequired ? macItem.operatorName : "",

      //   cpNumber: macItem.cpNumber.cpNo,

      //   remarks: null,

      //   estimatedHours: macItem.estimatedHours || 0,
      //   actualHours: macItem.actualHours || 0,
      //   actualMechHour: macItem.actualMechHour || 0,

      //   mechIdleTime: macItem.mechIdleTime || 0,
      //   mechRunningTime: macItem.mechRunningTime || 0,

      //   subUnitId: null,
      //   subUnitName: null,

      //   area: macItem.area || 0,

      //   activityId: macItem.activityId,
      //   activityName: macItem.activityName,

      //   dprMechStatus: "ISSUE", // ✅ APPROVE STATUS
      //   dprId: dprData.id,

      //   engineerId: userData?.userId,
      //   engineerName: userData?.username,
      // };

      const payload = {
        id: macItem.id,

        equipmentId: macItem.equipmentId,
        equipmentName: macItem.equipmentName,

        subGroupId: macItem.subGroupId,
        subGroupName: macItem.subGroupName,

        operatorRequired: macItem.operatorRequired,
        operatorName: macItem.operatorRequired ? macItem.operatorName : "",

        cpNumber:
          typeof macItem.cpNumber === "object"
            ? macItem.cpNumber.cpNo
            : macItem.cpNumber,

        outTime: macItem?.outTime || "",
        inTime: macItem.inTime || "",
        remarks: macItem.remarks || "",

        estimatedHours: Number(macItem.estimatedHours || 0),
        actualHours: Number(macItem.actualHours || 0),
        actualMechHour: Number(macItem.actualMechHour || 0),

        mechIdleTime: Number(macItem.mechIdleTime || 0),
        mechRunningTime: Number(macItem.mechRunningTime || 0),

        subUnitId: null,
        subUnitName: null,

        area: Number(macItem.area || 0),

        activityId: macItem.activityId,
        activityName: macItem.activityName,

        dprMechStatus: status,
        dprId: dprData.id,

        engineeringId: dprData?.epoId,
        engineeringName: dprData?.epoName,
      };

      console.log("APPROVE PAYLOAD", payload);
      return;

      const encryptedPayload = encryptWholeObject(payload);

      const res = await apiRequest(
        API_ROUTES.DPR_MECHANICAL_UPDATE,
        "POST",
        encryptedPayload,
      );

      const parsed = JSON.parse(decryptAES(res));
      console.log("✅ APPROVE RESPONSE", parsed);

      if (parsed?.status === "SUCCESS") {
        alert("Mechanical Approved Successfully ✅");
        fetchDprDetail(); // 🔁 reload updated status
      } else {
        showErrorMessage(parsed?.message || "Approve failed");
      }
    } catch (err) {
      console.log("❌ Approve error", err);
      showErrorMessage("Something went wrong while approving");
    } finally {
      setLoading(false);
    }
  };

  const forwardEquipment = async () => {
    try {
      setLoading(true);

      const userData = await getUserData();

      const payload = {
        dprId: dprData?.id,
        id: selectedEqupment.id,
        dprMechStatus: "FORWARD",
        engineeringId: selectedForwardBlock?.id,
        engineeringName: selectedForwardBlock?.epoName,
        forwardedFarmEngineeringBlockId: selectedForwardBlock?.id,
        forwardedFarmEngineeringBlockName: selectedForwardBlock?.epoName,
      };

      const encryptedPayload = encryptWholeObject(payload);

      const res = await apiRequest(
        API_ROUTES.DPR_MECHANICAL_UPDATE,
        "POST",
        encryptedPayload,
      );

      const parsed = JSON.parse(decryptAES(res));
      console.log("✅ APPROVE RESPONSE", parsed);

      if (parsed?.status === "SUCCESS") {
        alert("Mechanical Approved Successfully ✅");
        fetchDprDetail(); // 🔁 reload updated status
      } else {
        showErrorMessage(parsed?.message || "Approve failed");
      }
    } catch (err) {
      console.log("❌ Approve error", err);
      showErrorMessage("Something went wrong while approving");
    } finally {
      setLoading(false);
    }
  };

  const getFarmBlokList = async (macItem) => {
    try {
      setLoading(true);

      const userData = await getUserData();

      const payload = {
        farmId: userData?.farmId,
      };

      const encryptedPayload = encryptWholeObject(payload);

      const res = await apiRequest(
        API_ROUTES.EPO_MASTER,
        "POST",
        encryptedPayload,
      );

      const parsed = JSON.parse(decryptAES(res));
      console.log("getFarmBlokList", parsed);

      if (parsed?.status === "SUCCESS") {
        const blocks =
          parsed?.data?.filter((item) => item?.id != userData?.epoId) || [];
        console.log("getFarmBlokList", blocks);

        setFarmBlokList(blocks);
        setselectedEqupment(macItem);

        // Modal Open
        setShowForwardModal(true);
      } else {
        showErrorMessage(parsed?.message || "Request failed");
      }
    } catch (err) {
      showErrorMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const renderActivity = ({ item, index }) => {
    const isOpen = expandedActivityId === item.activityId;

    return (
      <View style={styles.activityCard}>
        {/* HEADER */}
        <TouchableOpacity
          style={styles.activityHeader}
          onPress={() => setExpandedActivityId(isOpen ? null : item.activityId)}
        >
          <View>
            <Text style={styles.activityTitle}>
              {index + 1}. {item.activityName}
            </Text>
            <Text style={styles.subText}>
              Labour Required: {item.labours?.length || 0}
            </Text>
          </View>

          <Icon
            name={isOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={28}
            color={Colors.greenColor}
          />
        </TouchableOpacity>

        {/* BODY */}
        {isOpen &&
          item.mechanicals.map((macItem) => (
            <View key={macItem.id} style={styles.machineCard}>
              {/* EQUIPMENT */}
              <Text style={styles.machineTitle}>
                {macItem.subGroupName} ({macItem.equipmentName})
              </Text>

              {/* DETAILS */}
              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.label}>Est. Hours</Text>
                  <Text style={styles.value}>
                    {macItem.estimatedHours || "NA"}
                  </Text>
                </View>

                <View style={styles.col}>
                  <Text style={styles.label}>Is Operator Required</Text>
                  <Text style={styles.value}>
                    {macItem.operatorRequired ? "Yes" : "No"}
                  </Text>
                </View>
              </View>
              {/* CP & OPERATOR */}
              <View style={styles.dropdownContainer}>
                <DropDown
                  disabled={
                    macItem?.dprMechStatus == "PENDING" ||
                    macItem?.dprMechStatus == "FORWARD"
                      ? false
                      : true
                  }
                  label="CP Number"
                  placeholder="Select CP Number"
                  data={macItem?.cpList || []}
                  value={macItem?.cpNumber}
                  selectItem={(val) => {
                    setActivityGroups((prev) =>
                      prev.map((act) => ({
                        ...act,
                        mechanicals: act.mechanicals.map((m) =>
                          m.id === macItem.id
                            ? { ...m, cpNumber: val?.cpNumber || val }
                            : m,
                        ),
                      })),
                    );
                  }}
                />
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Out Time</Text>

                  <TouchableOpacity
                    disabled={
                      macItem?.dprMechStatus !== "PENDING" ||
                      macItem?.dprMechStatus == "FORWARD"
                    }
                    style={
                      macItem?.dprMechStatus === "PENDING" ||
                      macItem?.dprMechStatus == "FORWARD"
                        ? styles.timeInput
                        : styles.disabledInput
                    }
                    onPress={() => {
                      setSelectedMachineId(macItem.id);
                      setSelectedTimeField("outTime");
                      setShowTimePicker(true);
                    }}
                  >
                    <Text>{macItem?.outTime || "Select Out Time"}</Text>

                    {!macItem?.outTime && (
                      <Icon
                        name="access-time"
                        size={20}
                        color={Colors.greenColor}
                      />
                    )}
                  </TouchableOpacity>
                </View>

                {dprData?.dprStatus == "SUBMITTED" && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>In Time</Text>

                    <TouchableOpacity
                      disabled={!macItem?.enableInTime}
                      style={
                        macItem?.enableInTime
                          ? styles.timeInput
                          : styles.disabledInput
                      }
                      //style={styles.timeInput}
                      onPress={() => {
                        setSelectedMachineId(macItem.id);
                        setSelectedTimeField("inTime");
                        setShowTimePicker(true);
                      }}
                    >
                      <Text>{macItem?.inTime || "Select In Time"}</Text>

                      {!macItem?.inTime && (
                        <Icon
                          name="access-time"
                          size={20}
                          color={Colors.greenColor}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Remark</Text>

                  <TextInput
                    //editable={macItem?.dprMechStatus == "PENDING"}
                    value={macItem?.remarks || ""}
                    style={styles.input}
                    placeholder="Enter Remark"
                    multiline
                    onChangeText={(text) => {
                      setActivityGroups((prev) =>
                        prev.map((act) => ({
                          ...act,
                          mechanicals: act.mechanicals.map((m) =>
                            m.id === macItem.id ? { ...m, remarks: text } : m,
                          ),
                        })),
                      );
                    }}
                  />
                </View>

                {macItem?.operatorRequired && (
                  // <DropDown
                  //   label="Operator Name"
                  //   placeholder="Select Operator"
                  //   data={macItem?.operatorList || []}
                  //   value={macItem?.operatorName}
                  //   onChange={(val) => {
                  //     console.log("Selected Operator:", val);
                  //   }}
                  // />
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Operator Name</Text>
                    <TextInput
                      editable={
                        macItem?.dprMechStatus == "PENDING" ||
                        macItem?.dprMechStatus == "FORWARD"
                          ? true
                          : false
                      }
                      value={macItem?.operatorName || ""}
                      style={
                        macItem?.dprMechStatus == "PENDING" ||
                        macItem?.dprMechStatus == "FORWARD"
                          ? styles.input
                          : styles.disabledInput
                      }
                      placeholder="Operator Name"
                      onChangeText={(text) => {
                        setActivityGroups((prev) =>
                          prev.map((act) => ({
                            ...act,
                            mechanicals: act.mechanicals.map((m) =>
                              m.id === macItem.id
                                ? { ...m, operatorName: text }
                                : m,
                            ),
                          })),
                        );
                      }}
                    />
                  </View>
                )}

                {dprData?.dprStatus == "SUBMITTED" && (
                  <>
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Idle Hours</Text>
                      <TextInput
                        editable={!macItem.isIdleLocked}
                        style={
                          macItem.isIdleLocked
                            ? styles.disabledInput
                            : styles.input
                        }
                        placeholder="Idle Hours"
                        keyboardType="decimal-pad"
                        value={String(macItem?.mechIdleTime || "")}
                        onChangeText={(val) => {
                          if (/^\d*\.?\d{0,2}$/.test(val)) {
                            setActivityGroups((prev) =>
                              prev.map((act) => ({
                                ...act,
                                mechanicals: act.mechanicals.map((m) =>
                                  m.id === macItem.id
                                    ? { ...m, mechIdleTime: val }
                                    : m,
                                ),
                              })),
                            );
                          }
                        }}
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Fuel Consumption (Lit)</Text>
                      <TextInput
                        //editable={macItem.fuelConsumptionInLit ? false : true}
                        style={
                          macItem.isIdleLocked
                            ? styles.disabledInput
                            : styles.input
                        }
                        placeholder="Fuel Consumption (Lit)"
                        keyboardType="decimal-pad"
                        value={String(macItem?.fuelConsumptionInLit || "")}
                        onChangeText={(val) => {
                          if (/^\d*\.?\d{0,2}$/.test(val)) {
                            setActivityGroups((prev) =>
                              prev.map((act) => ({
                                ...act,
                                mechanicals: act.mechanicals.map((m) =>
                                  m.id === macItem.id
                                    ? { ...m, fuelConsumptionInLit: val }
                                    : m,
                                ),
                              })),
                            );
                          }
                        }}
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Walking Hours</Text>
                      <TextInput
                        editable={!macItem.isRunningLocked}
                        style={
                          !macItem?.isRunningLocked
                            ? styles.input
                            : styles.disabledInput
                        }
                        placeholder="Walking Hours"
                        keyboardType="number-pad"
                        value={String(macItem?.mechRunningTime || "")}
                        onChangeText={(val) => {
                          const numericValue = val.replace(/[^0-9]/g, "");
                          setActivityGroups((prev) =>
                            prev.map((act) => ({
                              ...act,
                              mechanicals: act.mechanicals.map((m) =>
                                m.id === macItem.id
                                  ? { ...m, mechRunningTime: numericValue }
                                  : m,
                              ),
                            })),
                          );
                        }}
                      />
                    </View>
                  </>
                )}
              </View>

              {/* STATUS */}
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: "#fff3cd",
                  },
                ]}
              >
                <Text style={styles.statusText}>{macItem?.dprMechStatus}</Text>
              </View>

              {/* ACTIONS */}

              {dprData?.currentDprStatus == "PENDING"
                ? null
                : (macItem?.dprMechStatus == "PENDING" ||
                    macItem?.dprMechStatus == "FORWARD") && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        onPress={() => {
                          // 🔒 VALIDATIONS
                          if (!macItem.cpNumber) {
                            showErrorMessage("Please select CP Number");
                            return;
                          }

                          if (
                            macItem.operatorRequired &&
                            !macItem.operatorName?.trim()
                          ) {
                            showErrorMessage("Please enter Operator Name");
                            return;
                          }

                          if (!macItem?.outTime) {
                            showErrorMessage("Please enter out time.");
                            return;
                          }

                          if (!macItem?.remarks) {
                            showErrorMessage("Please enter remark.");
                            return;
                          }
                          approveMechanical(macItem, "ISSUE");
                        }}
                        style={styles.approveBtn}
                      >
                        <Icon name="check-circle" size={18} color="#fff" />
                        <Text style={styles.actionText}>Approve</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => approveMechanical(macItem, "REJECTED")}
                        style={styles.rejectBtn}
                      >
                        <Icon name="cancel" size={18} color="#fff" />
                        <Text style={styles.actionText}>Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setselectedEqupment(macItem);
                          getFarmBlokList(macItem);
                        }}
                        style={styles.forwardBtn}
                      >
                        <Icon name="sms" size={18} color="#856404" />
                        <Text style={[styles.actionText, { color: "#856404" }]}>
                          Forward
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

              {!macItem.isIdleLocked &&
                !macItem.isRunningLocked &&
                dprData?.dprLabour?.length > 0 && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      onPress={() => {
                        if (
                          !macItem.mechIdleTime ||
                          !macItem.mechRunningTime ||
                          !macItem?.fuelConsumptionInLit ||
                          !macItem?.inTime
                        ) {
                          showErrorMessage("Please fill all fields.");
                          return;
                        }
                        approveMechanical(macItem, "UPDATE");
                      }}
                      style={styles.approveBtn}
                    >
                      <Icon name="check-circle" size={18} color="#fff" />
                      <Text style={styles.actionText}>Approve</Text>
                    </TouchableOpacity>

                    {/* <TouchableOpacity
                      onPress={() => rejectMechanical(macItem)}
                      style={styles.rejectBtn}
                    >
                      <Icon name="cancel" size={18} color="#fff" />
                      <Text style={styles.actionText}>Reject</Text>
                    </TouchableOpacity> */}
                  </View>
                )}
            </View>
          ))}
      </View>
    );
  };

  const fetchCpList = async (macItem) => {
    try {
      if (!dprData?.epoId) {
        console.log("❌ farmBlockId missing");
        return;
      }

      const payload = {
        assetGroupId: macItem.equipmentId,
        assetSubGroupId: macItem.subGroupId,
        //equipmentAllotmentStatus: "ALLOTTED",
        unitType: "EPO",
        unitId: dprData.epoId,
        assetCategoryId: macItem.categoryId,
      };

      console.log("🚀 CP API PAYLOAD", payload);

      const encryptedPayload = encryptWholeObject(payload);

      const res = await apiRequest(
        API_ROUTES.CP_NUMBER_LIST,
        "POST",
        encryptedPayload,
      );

      const parsed = JSON.parse(decryptAES(res));

      console.log("✅ CP API RESPONSE", parsed);

      if (parsed?.status === "SUCCESS") {
        setActivityGroups((prev) =>
          prev.map((act) => ({
            ...act,
            mechanicals: act.mechanicals.map((m) =>
              m.id === macItem.id ? { ...m, cpList: parsed.data || [] } : m,
            ),
          })),
        );
      }
    } catch (e) {
      console.log("❌ CP API ERROR", e);
    }
  };

  const rejectMechanical = async (macItem) => {
    try {
      setLoading(true);

      const payload = {
        id: macItem.id,
        equipmentId: macItem.equipmentId,
        equipmentName: macItem.equipmentName,
        subGroupId: macItem.subGroupId,
        subGroupName: macItem.subGroupName,

        operatorRequired: macItem.operatorRequired,
        operatorName: macItem.operatorName || "",
        cpNo: macItem.cpNo || "",

        remarks: macItem.remarks || null,

        estimatedHours: macItem.estimatedHours || 0,
        actualHours: macItem.actualHours || 0,
        actualMechHour: macItem.actualMechHour || 0,
        mechIdleTime: macItem.mechIdleTime || 0,
        mechRunningTime: macItem.mechRunningTime || 0,

        subUnitId: macItem.subUnitId || null,
        subUnitName: macItem.subUnitName || null,
        area: macItem.area || 0,

        activityId: macItem.activityId,
        activityName: macItem.activityName,

        dprMechStatus: "REJECT",
        dprId: dprData?.id,

        engineerId: dprData?.engineerId,
        engineerName: dprData?.engineerName,
      };

      console.log("REJECT PAYLOAD", payload);

      const encryptedPayload = encryptWholeObject(payload);

      const res = await apiRequest(
        API_ROUTES.DPR_MECHANICAL_UPDATE,
        "POST",
        encryptedPayload,
      );

      const parsed = JSON.parse(decryptAES(res));

      if (parsed?.status === "SUCCESS") {
        alert("Mechanical rejected successfully ❌");
        fetchDprDetail(); // 🔁 refresh list
      } else {
        showErrorMessage(parsed?.message || "Reject failed");
      }
    } catch (err) {
      console.log("Reject error", err);
      showErrorMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <WrapperContainer isLoading={loading}>
      <InnerHeader title="Mechanical Issue Details" />
      {showTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          is24Hour={true}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            setShowTimePicker(false);

            if (!selectedDate) return;

            const hours = String(selectedDate.getHours()).padStart(2, "0");
            const minutes = String(selectedDate.getMinutes()).padStart(2, "0");

            const formattedTime = `${hours}:${minutes}`;
            console.log(formattedTime);

            setActivityGroups((prev) =>
              prev.map((act) => ({
                ...act,
                mechanicals: act.mechanicals.map((m) =>
                  m.id === selectedMachineId
                    ? {
                        ...m,
                        [selectedTimeField]: formattedTime,
                      }
                    : m,
                ),
              })),
            );
          }}
        />
      )}
      <Modal visible={showForwardModal} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                marginBottom: 15,
              }}
            >
              Forward Equipment
            </Text>

            <DropDown
              fieldName="epoName"
              label="Farm Block"
              placeholder="Select Farm Block"
              data={farmBlokList}
              value={selectedForwardBlock?.epoName || ""}
              selectItem={(item) => {
                console.log(item);
                setSelectedForwardBlock(item);
              }}
            />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 20,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setShowForwardModal(false);
                  setSelectedForwardBlock(null);
                }}
                style={{
                  padding: 12,
                  backgroundColor: "#ddd",
                  borderRadius: 8,
                  width: "45%",
                  alignItems: "center",
                }}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (!selectedForwardBlock) {
                    showErrorMessage("Please select Farm Block");
                    return;
                  }

                  console.log("Selected Block", selectedForwardBlock);

                  // Forward API Call Here
                  forwardEquipment();

                  setShowForwardModal(false);
                }}
                style={{
                  padding: 12,
                  backgroundColor: Colors.greenColor,
                  borderRadius: 8,
                  width: "45%",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff" }}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={moderateScaleVertical(
          Platform.OS === "ios" ? 80 : 10,
        )}
      >
        <ScrollView style={styles.container}>
          {dprData && (
            <View style={styles.basicCard}>
              <Text style={styles.basicTitle}>Basic Details</Text>
              <Text>Process Date: {dprData.planDate}</Text>
              <Text>EPO Name: {dprData.epoName}</Text>
              <Text>
                Contractor Name: {dprData.contractorName}(
                {dprData.contractorType})
              </Text>
              <Text>Orchard Name: {dprData.orchardName}</Text>
              <Text>Plot: {dprData.plotName}</Text>
            </View>
          )}

          <FlatList
            data={activityGroups}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderActivity}
          />

          {/* <CustomButton
            text="Submit"
            buttonStyle={styles.buttonStyle}
            textStyle={styles.buttonTextStyle}
            handleAction={() => navigation.goBack()}
          /> */}
        </ScrollView>
      </KeyboardAvoidingView>
    </WrapperContainer>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { padding: moderateScale(10) },

  basicCard: {
    backgroundColor: "#e8f5e9",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#2e7d32",
  },
  basicTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.greenColor,
    marginBottom: 8,
  },

  activityCard: { marginBottom: 12 },
  activityHeader: {
    backgroundColor: "#f1f8e9",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#c8e6c9",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  activityTitle: {
    fontSize: textScale(14),
    fontWeight: "700",
    color: Colors.greenColor,
  },
  activityBody: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTopWidth: 0,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.disableFieldColor,
    //backgroundColor: Colors.disableFieldColor,
    borderRadius: 6,
    padding: 8,
    marginVertical: 6,
  },

  disabledInput: {
    borderWidth: 1,
    borderColor: Colors.disableFieldColor,
    backgroundColor: Colors.disableFieldColor,
    borderRadius: 6,
    padding: 8,
    marginVertical: 6,
  },
  sectionHeader: {
    marginTop: 12,
    marginBottom: 6,
  },
  sectionTitle: {
    fontWeight: "700",
    fontSize: textScale(14),
    color: Colors.greenColor,
  },
  rowBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 8,
    marginVertical: 6,
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 6,
  },
  serial: {
    fontWeight: "700",
    color: "#000",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonStyle: {
    backgroundColor: Colors.greenColor,
    padding: moderateScaleVertical(12),
    borderRadius: moderateScale(8),
    marginVertical: 20,
  },
  buttonTextStyle: {
    color: Colors.white,
    fontSize: textScale(14),
    fontFamily: FontFamily.PoppinsMedium,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: moderateScaleVertical(12),
  },
  itemColumn: {
    flex: 1,
    marginRight: moderateScale(8),
  },
  itemLabel: {
    fontSize: textScale(12),
    fontFamily: FontFamily.PoppinsRegular,
    color: Colors.gray,
  },
  itemValue: {
    fontSize: textScale(14),
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.textColor,
  },

  // render card
  activityCard: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#f9f9f9",
    overflow: "hidden",
  },

  activityHeader: {
    padding: 14,
    backgroundColor: "#e8f5e9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  subText: {
    fontSize: 12,
    color: "#555",
    marginTop: 2,
  },

  machineCard: {
    backgroundColor: "#fff",
    margin: 12,
    padding: 14,
    borderRadius: 10,
    elevation: 2,
  },

  machineTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
    color: Colors.textColor,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  col: {
    flex: 1,
  },

  value: {
    fontSize: 14,
    fontWeight: "600",
  },

  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginVertical: 10,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#856404",
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  approveBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2e7d32",
    padding: 10,
    borderRadius: 8,
    width: "32%",
    justifyContent: "center",
  },

  rejectBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#c62828",
    padding: 10,
    borderRadius: 8,
    width: "32%",
    justifyContent: "center",
  },
  forwardBtn: {
    backgroundColor: "#fff3cd",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    width: "32%",
    justifyContent: "center",
  },

  actionText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
  },
  dropdownContainer: {
    marginTop: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.disableFieldColor,
    //backgroundColor: Colors.disableFieldColor,
    borderRadius: 6,
    padding: 8,
    marginVertical: 6,
  },

  disabledInput: {
    borderWidth: 1,
    borderColor: Colors.disableFieldColor,
    backgroundColor: Colors.disableFieldColor,
    borderRadius: 6,
    padding: 8,
    marginVertical: 6,
    paddingVertical: 12,
  },
  inputContainer: {
    flex: 1,
    marginRight: 8,
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    color: Colors.grey,
    marginBottom: 2,
    fontWeight: "700",
  },
  timeInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});

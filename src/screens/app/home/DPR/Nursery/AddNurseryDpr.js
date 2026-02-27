import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Modal,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";

import WrapperContainer from "../../../../../utils/WrapperContainer";
import InnerHeader from "../../../../../components/InnerHeader";
import DropDown from "../../../../../components/DropDown";
import Colors from "../../../../../utils/Colors";
import { moderateScale, textScale } from "../../../../../utils/responsiveSize";
import FontFamily from "../../../../../utils/FontFamily";
import {
  decryptAES,
  encryptWholeObject,
} from "../../../../../utils/decryptData";
import { apiRequest } from "../../../../../services/APIRequest";
import { API_ROUTES } from "../../../../../services/APIRoutes";
import {
  showErrorMessage,
  showSuccessMessage,
} from "../../../../../utils/HelperFunction";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { getUserData } from "../../../../../utils/Storage";

export default function AddNurseryDpr({ route }) {
  const navigation = useNavigation();
  const landData = route?.params?.landData;
  console.log("landData", landData);

  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [operationList, setoperationList] = useState([]);
  const [contractorNameList, setcontractorNameList] = useState([]);
  const [equipmentList, setequipmentList] = useState([]);
  const [equipmentSubGroupList, setequipmentSubGroupList] = useState([]);
  const [materialList, setmaterialList] = useState([]);
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [materialTableData, setMaterialTableData] = useState([]);
  const [userData, setUserData] = useState("");
  const [categoryList, setCategoryList] = useState();

  /* ================= MASTER LISTS ================= */

  const contractorTypeList = [
    {
      id: 1,
      name: "Activity Wise Contractor",
      agreementType: "ACTIVITY_WISE_CONTRACTOR",
    },
    { id: 2, name: "Sharing Basis", agreementType: "SHARING_BASIS" },
    {
      id: 2,
      name: "Piece Works Contractor",
      agreementType: "PIECE_WORKS_CONTRACTOR",
    },
  ];

  const materialTypeList = [
    { id: 1, name: "SEED" },
    { id: 2, name: "VALUE_ADDED" },
    { id: 3, name: "PACKAGING_MATERIAL" },
    { id: 4, name: "AGRO_CHEMICAL" },
    { id: 5, name: "SAPLING" },
    { id: 6, name: "FIXED" },
    { id: 7, name: "CONSUMABLE_PARTS" },
  ];

  const NONE_PLAN_OPTION = {
    id: null,
    planCode: "None",
    planName: "None",
  };

  useEffect(() => {
    getActivityList();
    getEquipmentList();
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setSelectedPlan(null);
    setLoading(true);
    const userData = await getUserData();
    setUserData(userData);
  };

  const getEquipmentList = async () => {
    try {
      const equipmentPayloadData = {};
      const encryptedEquipmentPayload =
        encryptWholeObject(equipmentPayloadData);
      const equipmentListResponse = await apiRequest(
        API_ROUTES.EQUIPMENT_LIST,
        "POST",
        encryptedEquipmentPayload,
      );
      const decryptedEquipmentListData = decryptAES(equipmentListResponse);
      const parsedDecryptedEquipmentListData = JSON.parse(
        decryptedEquipmentListData,
      );

      console.log(
        "parsedDecryptedEquipmentListData",
        parsedDecryptedEquipmentListData,
      );
      if (
        (parsedDecryptedEquipmentListData?.status === "SUCCESS" &&
          parsedDecryptedEquipmentListData?.statusCode === "200") ||
        (parsedDecryptedEquipmentListData?.status === "200" &&
          parsedDecryptedEquipmentListData?.statusCode === "SUCCESS")
      ) {
        setequipmentList(parsedDecryptedEquipmentListData?.data || []);
      } else {
        showErrorMessage("Unable to get the Equipment List Data");
      }
    } catch (error) {
      console.log(error, "line error");
      showErrorMessage("Error fetching dropdown data");
    } finally {
      setLoading(false);
    }
  };

  const getActivityList = async () => {
    setLoading(true);
    try {
      const operationPayloadData = {};
      const encryptedOperationPayload =
        encryptWholeObject(operationPayloadData);
      const operationListResponse = await apiRequest(
        API_ROUTES.OPERATION_MASTER_DD,
        "POST",
        encryptedOperationPayload,
      );
      const decryptedOperationListData = decryptAES(operationListResponse);
      const parsedDecryptedOperationListData = JSON.parse(
        decryptedOperationListData,
      );
      if (
        parsedDecryptedOperationListData?.status === "SUCCESS" &&
        parsedDecryptedOperationListData?.statusCode === "200"
      ) {
        setoperationList(parsedDecryptedOperationListData?.data || []);
      } else {
        showErrorMessage("Unable to get the Operation List Data");
      }
    } catch (error) {
      console.log(error, "line error");
      showErrorMessage("Error fetching dropdown data");
    } finally {
      setLoading(false);
    }
  };

  /* ================= STATE ================= */
  const [entries, setEntries] = useState([
    {
      id: Date.now(),
      expanded: true,
      activities: [
        {
          id: Date.now() + 1,
          activity: null,
          contractorType: null,
          contractorName: null,
          noOfLabour: "",

          agricultures: [
            {
              id: Date.now() + 2,
              materialType: "",
              material: null,
            },
          ],

          equipments: [
            {
              id: Date.now() + 3,
              equipment: null,
              subGroup: null,
              estHours: "",
              operatorRequired: false,
              categoryId: null,
              categoryName: "",
            },
          ],
        },
      ],
    },
  ]);

  /* ================= HELPERS ================= */
  const updateActivity = (entryId, actId, updater) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? {
              ...e,
              activities: e.activities.map((a) =>
                a.id === actId ? updater(a) : a,
              ),
            }
          : e,
      ),
    );
  };

  const deleteEntry = (entryId) => {
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
  };

  /* ================= ENTRY ================= */
  // const addEntry = () => {
  //   setEntries((prev) => [
  //     ...prev,
  //     { id: Date.now(), expanded: true, activities: [] },
  //   ]);
  // };

  const addEntry = () => {
    setEntries((prev) => [
      ...prev,
      {
        id: Date.now(),
        expanded: true,
        activities: [
          {
            id: Date.now() + 1,
            activity: null,
            contractorType: null,
            contractorName: null,
            noOfLabour: "",
            agricultures: [
              {
                id: Date.now() + 2,
                materialType: "",
                material: null,
              },
            ],
            equipments: [
              {
                id: Date.now() + 3,
                equipment: null,
                subGroup: null,
                estHours: "",
                operatorRequired: false,
              },
            ],
          },
        ],
      },
    ]);
  };

  const toggleEntry = (id) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, expanded: !e.expanded } : e)),
    );
  };

  const onChangeDate = (event, selectedDate) => {
    setShow(false); // hide after selection
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  /* ================= ACTIVITY ================= */
  const addActivity = (entryId) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? {
              ...e,
              activities: [
                ...e.activities,
                {
                  id: Date.now(),
                  activity: null,
                  contractorType: null,
                  contractorName: null,
                  noOfLabour: "",
                  agricultures: [],
                  equipments: [],
                },
              ],
            }
          : e,
      ),
    );
  };

  /* ================= AGRICULTURE ================= */
  const addAgriculture = (entryId, actId) => {
    updateActivity(entryId, actId, (a) => ({
      ...a,
      agricultures: [
        ...a.agricultures,
        { id: Date.now(), materialType: "", material: null },
      ],
    }));
  };

  const removeAgriculture = (entryId, actId, agId) => {
    updateActivity(entryId, actId, (a) => ({
      ...a,
      agricultures: a.agricultures.filter((ag) => ag.id !== agId),
    }));
  };

  /* ================= EQUIPMENT ================= */
  const addEquipment = (entryId, actId) => {
    updateActivity(entryId, actId, (a) => ({
      ...a,
      equipments: [
        ...a.equipments,
        {
          id: Date.now(),
          equipment: null,
          subGroup: null,
          estHours: "",
          operatorRequired: false,
          categoryId: null,
          categoryName: "",
        },
      ],
    }));
  };

  const removeEquipment = (entryId, actId, eqId) => {
    updateActivity(entryId, actId, (a) => ({
      ...a,
      equipments: a.equipments.filter((eq) => eq.id !== eqId),
    }));
  };

  const getContractorName = async (id) => {
    setLoading(true);
    try {
      const payloadData = {
        squareId: null,
        epoId: null,
        activityId: id,
        agreementType: "ACTIVITY_WISE_CONTRACTOR",
      };
      const encryptPayloadData = encryptWholeObject(payloadData);
      const getContractorList = await apiRequest(
        API_ROUTES.CONTRACTOR,
        "POST",
        encryptPayloadData,
      );
      const decryptedContractorList = decryptAES(getContractorList);
      const parsedDecryptedContractorList = JSON.parse(decryptedContractorList);

      console.log(
        "parsedDecryptedContractorList",
        parsedDecryptedContractorList,
      );
      if (
        parsedDecryptedContractorList?.status === "SUCCESS" &&
        parsedDecryptedContractorList?.statusCode === "200"
      ) {
        setcontractorNameList(parsedDecryptedContractorList?.data || []);
      } else {
        showErrorMessage("Unable to get the Operation List Data");
      }
    } catch (error) {
      console.log(error, "line error");
      showErrorMessage("Error fetching dropdown data");
    } finally {
      setLoading(false);
    }
  };

  const getSubGroup = async (id) => {
    setLoading(true);
    try {
      const payloadData = {
        assetGroupId: id,
      };
      const encryptPayloadData = encryptWholeObject(payloadData);
      const getSubGroupList = await apiRequest(
        API_ROUTES.GET_EQUIPMENT_SUB_GROUP,
        "POST",
        encryptPayloadData,
      );
      const decryptedSubGroupList = decryptAES(getSubGroupList);
      const parsedDecryptedSubGroupList = JSON.parse(decryptedSubGroupList);

      console.log("parsedDecryptedSubGroupList", parsedDecryptedSubGroupList);
      if (
        (parsedDecryptedSubGroupList?.status === "SUCCESS" &&
          parsedDecryptedSubGroupList?.statusCode === "200") ||
        (parsedDecryptedSubGroupList?.status === "200" &&
          parsedDecryptedSubGroupList?.statusCode === "200")
      ) {
        setequipmentSubGroupList(parsedDecryptedSubGroupList?.data || []);
      } else {
        showErrorMessage("Unable to get the Subgroup List Data");
      }
    } catch (error) {
      console.log(error, "line error");
      showErrorMessage("Error fetching dropdown data");
    } finally {
      setLoading(false);
    }
  };

  const getMaterialItem = async (val) => {
    setLoading(true);
    try {
      const payloadData = {
        materialType: val.name,
      };
      const encryptPayloadData = encryptWholeObject(payloadData);
      const getMaterialItem = await apiRequest(
        API_ROUTES.MATERIAL_LIST,
        "POST",
        encryptPayloadData,
      );
      const decryptedMaterialItemList = decryptAES(getMaterialItem);
      const parsedDecryptedMaterialItemList = JSON.parse(
        decryptedMaterialItemList,
      );

      console.log(
        "parsedDecryptedMaterialItemList",
        parsedDecryptedMaterialItemList,
      );
      if (
        (parsedDecryptedMaterialItemList?.status === "SUCCESS" &&
          parsedDecryptedMaterialItemList?.statusCode === "200") ||
        (parsedDecryptedMaterialItemList?.status === "200" &&
          parsedDecryptedMaterialItemList?.statusCode === "200")
      ) {
        setmaterialList(parsedDecryptedMaterialItemList?.data || []);
      } else {
        showErrorMessage("Unable to get the Subgroup List Data");
      }
    } catch (error) {
      console.log(error, "line error");
      showErrorMessage("Error fetching dropdown data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  const buildDprPayload = () => {
    const planDate = formatDate(date);

    return [
      {
        planDate,

        /* ================= BASIC ================= */
        chakId: null,
        chakName: null,

        farmBlockId: null,
        farmBlockName: null,

        farmPlanId: null,

        farmId: String(landData?.farmId),
        farmName: landData?.farmName,

        epoId: String(userData?.epoId),
        epoName: userData?.epoName,

        dprType: "NURSERY",
        dprStatus: "APPROVED",
        currentDprStatus: "APPROVED",
        dprMechanicalSubmit: false,

        /* ================= ACTIVITIES ================= */
        activities: entries.flatMap((entry) =>
          entry.activities
            .filter((act) => act.activity)
            .map((act) => ({
              activityId: act.activity.id,
              activityName: act.activity.operationName,
              noOfLabour: Number(act.noOfLabour || 0),
              actualNoOfLabour: "",
              contractorType: act.contractorType?.agreementType,
              contractorId: act.contractorName?.contractorId || null,
              contractorName: act.contractorName?.name || "",
            })),
        ),

        /* ================= AGRICULTURE ================= */
        dprAgricultures: entries.flatMap((entry) =>
          entry.activities.flatMap((act) =>
            act.agricultures
              .filter((ag) => ag.material && ag.materialType)
              .map((ag) => ({
                activityId: act.activity.id,
                activityName: act.activity.operationName,
                itemCode: ag.material.itemCode,
                cashMemoDto: {
                  materialType: ag.materialType.name,
                  activityId: act.activity.id,
                  activityName: act.activity.operationName,
                  cashMemoItems: materialTableData
                    .filter((m) => m.selected)
                    .map((m) => ({
                      runningInventoryId: m.runningInventoryId,
                      itemName: m.itemName,
                      lotBatchNo: m.lotNo,
                      uom: m.uom,
                      packingSize: m.packingSize,
                      noOfBags: m.noOfBags,
                      availableQty: m.availableQty,
                      requestedQty: Number(m.issueQty || 0),
                    })),
                },
              })),
          ),
        ),

        /* ================= MECHANICAL ================= */
        dprMechanicals: entries.flatMap((entry) =>
          entry.activities.flatMap((act) =>
            act.equipments
              .filter((eq) => eq.equipment && eq.subGroup && eq.categoryId)
              .map((eq) => ({
                equipmentId: eq.equipment.id,
                equipmentName: eq.equipment.assetGroupName,
                categoryId: eq.categoryId,
                categoryName: eq.categoryName,
                subGroupId: eq.subGroup.id,
                subGroupName: eq.subGroup.assetSubGroupName,
                estimatedHours: eq.estHours,
                actualHours: "",
                operatorRequired: eq.operatorRequired,
                operatorName: "",
                cpNumber: "",
                mechIdleHours: "",
                mechWalkingTime: "",
                activityId: act.activity.id,
                activityName: act.activity.operationName,
              })),
          ),
        ),

        /* ================= LABOUR ================= */
        dprLabour: [],
      },
    ];
  };

  const submitDPR = async () => {
    try {
      setLoading(true);

      const payload = buildDprPayload();

      console.log(
        "🚀 FINAL NURSERY DPR PAYLOAD",
        JSON.stringify(payload, null, 2),
      );

      const encryptedPayload = encryptWholeObject(payload);

      const response = await apiRequest(
        API_ROUTES.SAVE_DPR,
        "POST",
        encryptedPayload,
      );

      const decrypted = decryptAES(response);
      const parsed = JSON.parse(decrypted);

      console.log("✅ NURSERY DPR SAVE RESPONSE", parsed);

      if (parsed?.status === "SUCCESS") {
        showSuccessMessage("Nursery DPR submitted successfully ✅");
        navigation.goBack();
      } else {
        showErrorMessage(parsed?.message || "Nursery DPR submit failed");
      }
    } catch (error) {
      console.log("❌ Submit Nursery DPR Error", error);
      showErrorMessage("Something went wrong while submitting Nursery DPR");
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterialList = async (item) => {
    setLoading(true);
    try {
      const payloadData = {
        itemCode: item?.itemCode,
        itemSubType: item?.itemSubType,
      };
      const encryptPayloadData = encryptWholeObject(payloadData);
      const getMaterialItem = await apiRequest(
        API_ROUTES.MATERIAL_LIST_DPR,
        "POST",
        encryptPayloadData,
      );
      const decryptedMaterialItemList = decryptAES(getMaterialItem);
      const parsedDecryptedMaterialItemList = JSON.parse(
        decryptedMaterialItemList,
      );

      console.log(
        "parsedDecryptedMaterialList",
        parsedDecryptedMaterialItemList,
      );
      if (
        (parsedDecryptedMaterialItemList?.status === "SUCCESS" &&
          parsedDecryptedMaterialItemList?.statusCode === "200") ||
        (parsedDecryptedMaterialItemList?.status === "200" &&
          parsedDecryptedMaterialItemList?.statusCode === "200")
      ) {
        setMaterialTableData(parsedDecryptedMaterialItemList?.data || []);
      } else {
        showErrorMessage("Unable to get the Subgroup List Data");
      }
    } catch (error) {
      console.log(error, "line error");
      showErrorMessage("Error fetching dropdown data");
    } finally {
      setLoading(false);
    }
  };

  const getCategory = async (item) => {
    setLoading(true);
    try {
      const payloadData = {
        assetSubGroupId: item?.id,
      };
      const encryptPayloadData = encryptWholeObject(payloadData);
      const getCategoryList = await apiRequest(
        API_ROUTES.GET_EQUIPMENT_SUBGROUP_CATEGORY,
        "POST",
        encryptPayloadData,
      );
      const decryptedCategoryList = decryptAES(getCategoryList);
      const parsedDecrypteCategoryList = JSON.parse(decryptedCategoryList);

      console.log("parsedDecryptedMaterialList", parsedDecrypteCategoryList);
      if (
        (parsedDecrypteCategoryList?.status === "SUCCESS" &&
          parsedDecrypteCategoryList?.statusCode === "200") ||
        (parsedDecrypteCategoryList?.status === "200" &&
          parsedDecrypteCategoryList?.statusCode === "200")
      ) {
        setCategoryList(parsedDecrypteCategoryList?.data || []);
      } else {
        showErrorMessage("Unable to get the Subgroup List Data");
      }
    } catch (error) {
      console.log(error, "line error");
      showErrorMessage("Error fetching dropdown data");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <WrapperContainer isLoading={loading}>
      <InnerHeader title="Nursery DPR" />
      {showMaterialModal && (
        <Modal visible={showMaterialModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {/* HEADER */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Materials</Text>
                <TouchableOpacity onPress={() => setShowMaterialModal(false)}>
                  <Icon name="close" size={24} />
                </TouchableOpacity>
              </View>

              {/* BODY */}
              <ScrollView contentContainerStyle={{ padding: 10 }}>
                {materialTableData.map((item, index) => (
                  <View key={index} style={styles.materialCard}>
                    {/* TOP ROW */}
                    <View style={styles.cardHeader}>
                      <Switch
                        value={item.selected}
                        onValueChange={(v) => {
                          const copy = [...materialTableData];
                          copy[index].selected = v;
                          if (!v) copy[index].issueQty = "";
                          setMaterialTableData(copy);
                        }}
                      />

                      <Text style={styles.materialTitle}>
                        {item.materialName}
                      </Text>
                    </View>

                    {/* DETAILS */}
                    <View style={styles.cardRow}>
                      <Text style={styles.label}>Lot No:</Text>
                      <Text style={styles.value}>{item.lotNo}</Text>
                    </View>

                    <View style={styles.cardRow}>
                      <Text style={styles.label}>Packing Size:</Text>
                      <Text style={styles.value}>{item.packingSize}</Text>
                    </View>

                    <View style={styles.cardRow}>
                      <Text style={styles.label}>No. of Bags:</Text>
                      <Text style={styles.value}>{item.noOfBags}</Text>
                    </View>

                    <View style={styles.cardRow}>
                      <Text style={styles.label}>Available Qty:</Text>
                      <Text style={styles.value}>{item.availableQty}</Text>
                    </View>

                    {/* ISSUE QTY */}
                    <TextInput
                      style={[
                        styles.issueInput,
                        { backgroundColor: item.selected ? "#fff" : "#eee" },
                      ]}
                      placeholder="Enter Issue Qty"
                      keyboardType="numeric"
                      editable={item.selected}
                      value={item.issueQty}
                      onChangeText={(v) => {
                        const copy = [...materialTableData];
                        copy[index].issueQty = v;
                        setMaterialTableData(copy);
                      }}
                    />
                  </View>
                ))}
              </ScrollView>

              {/* FOOTER */}
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setShowMaterialModal(false)}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={() => {
                    setShowMaterialModal(false);
                    console.log("Selected Materials", materialTableData);
                  }}
                >
                  <Text style={{ color: "#fff" }}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView style={{ padding: 10 }}>
          {/* ADD ENTRY */}
          <TouchableOpacity style={styles.addEntryBtn} onPress={addEntry}>
            <Icon name="add" size={24} color="#fff" />
            <Text style={styles.addEntryText}>Add New Entry</Text>
          </TouchableOpacity>

          {Platform.OS === "android" && show && (
            <DateTimePicker
              value={date}
              mode="date" // "time" or "datetime"
              display="default"
              onChange={onChangeDate}
              maximumDate={new Date(2030, 11, 31)}
              minimumDate={new Date(2020, 0, 1)}
            />
          )}

          {Platform.OS === "ios" && show && (
            <Modal transparent={true} animationType="slide">
              <View
                style={{
                  flex: 1,
                  justifyContent: "flex-end",
                  backgroundColor: "rgba(0,0,0,0.3)",
                }}
              >
                <View
                  style={{
                    backgroundColor: "#fff",
                    padding: 20,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                  }}
                >
                  <View style={{ alignItems: "flex-end" }}>
                    <TouchableOpacity onPress={() => setShow(false)}>
                      <Text
                        style={{
                          fontSize: 16,
                          color: "blue",
                          marginBottom: 10,
                        }}
                      >
                        Done
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                      if (selectedDate) {
                        setDate(selectedDate);
                      }
                    }}
                    style={{ width: "100%" }}
                    maximumDate={new Date(2030, 11, 31)}
                    minimumDate={new Date(2020, 0, 1)}
                  />
                </View>
              </View>
            </Modal>
          )}

          <View
            style={{
              backgroundColor: "#f1f8e9",
              padding: 10,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: "#2e7d32",
              borderStyle: "dotted",
              marginTop: 10,
            }}
          >
            <View style={styles.row}>
              <Text
                style={{
                  color: Colors.black,
                  fontSize: 18,
                  marginBottom: 10,
                }}
              >
                Basic Detail
              </Text>
            </View>
            <View style={styles.row}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Plan ID</Text>

                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={landData?.planCode}
                  editable={false}
                />
              </View>
              <TouchableOpacity
                onPress={() => setShow(true)}
                style={styles.inputContainer}
              >
                <Text style={styles.label}>Report Date</Text>
                <View style={styles.input}>
                  <Text>{date.toLocaleDateString()}</Text>
                </View>
              </TouchableOpacity>
              {/* <DropDown
                label="Plan"
                data={[NONE_PLAN_OPTION, ...(landData?.plans || [])]}
                value={selectedPlan?.planCode || ""}
                selectItem={(item) => {
                  if (item.id === null) {
                    // NONE selected
                    setSelectedPlan(null);
                  } else {
                    setSelectedPlan(item);
                  }
                }}
              /> */}
            </View>
          </View>

          {entries.map((entry, ei) => (
            <View key={entry.id} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                  }}
                  onPress={() => toggleEntry(entry.id)}
                >
                  <Text style={styles.entryTitle}>Entry #{ei + 1}</Text>
                </TouchableOpacity>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {/* ❌ DELETE ENTRY (hide for first entry if you want) */}
                  {entries.length > 1 && (
                    <TouchableOpacity
                      onPress={() => deleteEntry(entry.id)}
                      style={{ marginRight: 8 }}
                    >
                      <Icon name="delete" size={22} color="red" />
                    </TouchableOpacity>
                  )}

                  <Icon
                    name={entry.expanded ? "expand-less" : "expand-more"}
                    size={28}
                  />
                </View>
              </View>

              {entry.expanded &&
                entry.activities.map((act) => (
                  <View key={act.id} style={styles.activityCard}>
                    {/* ACTIVITY */}
                    <DropDown
                      label="Activity"
                      data={operationList}
                      value={act.activity?.operationName || ""}
                      selectItem={(item) => {
                        getContractorName(item.id);
                        updateActivity(entry.id, act.id, (a) => ({
                          ...a,
                          activity: item,
                          contractorType: {
                            id: 1,
                            name: "Activity Wise Contractor",
                            agreementType: "ACTIVITY_WISE_CONTRACTOR",
                          },
                        }));
                      }}
                    />

                    <DropDown
                      label="Contractor Type"
                      data={contractorTypeList}
                      value={act.contractorType?.name || ""}
                      selectItem={(item) => {
                        console.log(item);
                        updateActivity(entry.id, act.id, (a) => ({
                          ...a,
                          contractorType: item,
                          contractorName: null,
                        }));
                      }}
                    />

                    <DropDown
                      label="Contractor Name"
                      data={contractorNameList}
                      value={act.contractorName?.name || ""}
                      selectItem={(item) =>
                        updateActivity(entry.id, act.id, (a) => ({
                          ...a,
                          contractorName: item,
                        }))
                      }
                    />

                    <TextInput
                      style={styles.input}
                      placeholder="No of Labour"
                      keyboardType="numeric"
                      value={act.noOfLabour}
                      onChangeText={(v) =>
                        updateActivity(entry.id, act.id, (a) => ({
                          ...a,
                          noOfLabour: v,
                        }))
                      }
                    />

                    {/* AGRICULTURE */}
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>
                        Agriculture Inputs
                      </Text>
                      <TouchableOpacity
                        onPress={() => addAgriculture(entry.id, act.id)}
                      >
                        <Text style={styles.addText}>+ Add New</Text>
                      </TouchableOpacity>
                    </View>

                    {act.agricultures.map((ag, index) => (
                      <View key={ag.id} style={styles.rowBox}>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "bold",
                              color: "black",
                            }}
                          >
                            S.N. {index + 1}
                          </Text>
                          <TouchableOpacity
                            onPress={() =>
                              removeAgriculture(entry.id, act.id, ag.id)
                            }
                          >
                            <Icon name="delete" size={20} color="red" />
                          </TouchableOpacity>
                        </View>
                        <View style={styles.divider} />
                        <DropDown
                          label="Material Type"
                          data={materialTypeList}
                          value={ag.materialType || ""}
                          selectItem={(val) => {
                            getMaterialItem(val);
                            updateActivity(entry.id, act.id, (a) => ({
                              ...a,
                              agricultures: a.agricultures.map((x) =>
                                x.id === ag.id
                                  ? { ...x, materialType: val }
                                  : x,
                              ),
                            }));
                          }}
                        />

                        <DropDown
                          label="Item"
                          data={materialList}
                          value={ag.material?.itemName || ""}
                          selectItem={(item) => {
                            fetchMaterialList(item);
                            updateActivity(entry.id, act.id, (a) => ({
                              ...a,
                              agricultures: a.agricultures.map((x) =>
                                x.id === ag.id ? { ...x, material: item } : x,
                              ),
                            }));
                          }}
                        />
                        <TouchableOpacity
                          style={styles.selectMaterialBtn}
                          onPress={() => {
                            setShowMaterialModal(true);
                          }}
                        >
                          <Text style={styles.selectMaterialText}>
                            Select / View Material(s)
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}

                    {/* EQUIPMENT */}
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>
                        Equipment & Mechanical Details
                      </Text>
                      <TouchableOpacity
                        onPress={() => addEquipment(entry.id, act.id)}
                      >
                        <Text style={styles.addText}>+ Add New</Text>
                      </TouchableOpacity>
                    </View>

                    {act.equipments.map((eq, index) => (
                      <View>
                        <View key={eq.id} style={styles.rowBox}>
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 14,
                                fontWeight: "bold",
                                color: "black",
                              }}
                            >
                              S.N. {index + 1}
                            </Text>
                            <TouchableOpacity
                              onPress={() =>
                                removeEquipment(entry.id, act.id, eq.id)
                              }
                            >
                              <Icon name="delete" size={20} color="red" />
                            </TouchableOpacity>
                          </View>
                          <View style={styles.divider} />
                          <DropDown
                            label="Equipment"
                            data={equipmentList}
                            value={eq.equipment}
                            selectItem={(item) => {
                              getSubGroup(item.id);
                              updateActivity(entry.id, act.id, (a) => ({
                                ...a,
                                equipments: a.equipments.map((x) =>
                                  x.id === eq.id
                                    ? { ...x, equipment: item }
                                    : x,
                                ),
                              }));
                            }}
                          />

                          <DropDown
                            label="Sub Group"
                            data={equipmentSubGroupList}
                            value={eq.subGroup}
                            selectItem={(item) => {
                              getCategory(item);
                              updateActivity(entry.id, act.id, (a) => ({
                                ...a,
                                equipments: a.equipments.map((x) =>
                                  x.id === eq.id
                                    ? {
                                        ...x,
                                        subGroup: item,
                                        categoryId: null,
                                        categoryName: "", // 🔥 RESET
                                      }
                                    : x,
                                ),
                              }));
                            }}
                          />

                          <DropDown
                            label="Category"
                            data={categoryList}
                            value={eq.categoryName || ""}
                            selectItem={(item) => {
                              updateActivity(entry.id, act.id, (a) => ({
                                ...a,
                                equipments: a.equipments.map((x) =>
                                  x.id === eq.id
                                    ? {
                                        ...x,
                                        categoryId: item.id,
                                        categoryName: item.assetCategoryName,
                                      }
                                    : x,
                                ),
                              }));
                            }}
                          />

                          <TextInput
                            style={styles.input}
                            placeholder="Estimated Hours"
                            value={eq.estHours}
                            onChangeText={(v) =>
                              updateActivity(entry.id, act.id, (a) => ({
                                ...a,
                                equipments: a.equipments.map((x) =>
                                  x.id === eq.id ? { ...x, estHours: v } : x,
                                ),
                              }))
                            }
                          />

                          <View style={styles.switchRow}>
                            <Text>Operator Required</Text>
                            <Switch
                              value={eq.operatorRequired}
                              onValueChange={(v) =>
                                updateActivity(entry.id, act.id, (a) => ({
                                  ...a,
                                  equipments: a.equipments.map((x) =>
                                    x.id === eq.id
                                      ? { ...x, operatorRequired: v }
                                      : x,
                                  ),
                                }))
                              }
                            />
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                ))}
            </View>
          ))}

          <TouchableOpacity style={styles.submitBtn} onPress={submitDPR}>
            <Text style={styles.addEntryText}>Submit</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </WrapperContainer>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  addEntryBtn: {
    backgroundColor: Colors.greenColor,
    padding: 14,
    borderRadius: 6,
    flexDirection: "row",
    justifyContent: "center",
  },
  submitBtn: {
    backgroundColor: Colors.greenColor,
    padding: 14,
    borderRadius: 6,
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  addEntryText: { color: "#fff", marginLeft: 8 },

  entryCard: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginTop: 15,
    backgroundColor: "#fff",
  },
  entryHeader: {
    padding: 10,
    backgroundColor: "#f1f8e9",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  entryTitle: { fontSize: 16, fontWeight: "700" },

  activityCard: {
    borderWidth: 1,
    borderColor: "#eee",
    margin: 10,
    padding: 10,
    borderRadius: 8,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    alignItems: "center",
  },
  sectionTitle: {
    fontWeight: "700",
    borderLeftWidth: moderateScale(3),
    borderColor: Colors.primary,
    fontSize: textScale(14),
    fontFamily: FontFamily.PoppinsSemiBold,
    color: Colors.greenColor,
    paddingLeft: 5,
  },
  addText: { color: Colors.green },

  rowBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    marginVertical: 6,
    borderRadius: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginVertical: 6,
  },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "700" },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginTop: 8,
    marginBottom: 8,
  },

  // materialvactivity style
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 10,
  },

  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    maxHeight: "85%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },

  materialCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  materialTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 8,
    flex: 1,
  },

  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },

  label: {
    fontSize: 12,
    color: "#555",
  },

  value: {
    fontSize: 12,
    fontWeight: "600",
    color: "#000",
  },

  issueInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginTop: 10,
    textAlign: "center",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
  },

  cancelBtn: {
    padding: 10,
  },

  saveBtn: {
    backgroundColor: Colors.greenColor,
    padding: 10,
    borderRadius: 6,
  },
  inputContainer: {
    flex: 1,
    marginRight: 8,
    marginBottom: 10,
  },
});

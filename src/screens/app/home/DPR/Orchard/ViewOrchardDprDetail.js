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
import CustomButton from "../../../../../components/CustomButton";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { ROLES } from "../../../../../constants/userRole";

/* ================= MATERIAL TYPE ================= */

const materialTypeList = [
  { id: 1, name: "SEED" },
  { id: 2, name: "VALUE_ADDED_PRODUCTS" },
  { id: 3, name: "CERTIFICATION_AND_PACKAGING_MATERIAL" },
  { id: 4, name: "AGRO_CHEMICAL" },
  { id: 5, name: "SAPLING_ETC" },
  { id: 6, name: "FIXED" },
  { id: 7, name: "CONSUMABLE_PARTS" },
  { id: 8, name: "MISCELLANEOUS" },
  { id: 9, name: "MINIKIT" },
  { id: 10, name: "COMBO" },
];

/* ================= COMPONENT ================= */

export default function ViewOrchardDprDetail({ route }) {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const dprId = route?.params?.item?.id;
  const userData = route?.params?.userData;

  const [loading, setLoading] = useState(false);
  const [dprData, setDprData] = useState(null);
  const [activityGroups, setActivityGroups] = useState([]);
  const [expandedActivityId, setExpandedActivityId] = useState(null);
  const [materialList, setmaterialList] = useState([]);
  const [materialTableData, setMaterialTableData] = useState([]);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState(null);

  const [selectedAgricultureId, setSelectedAgricultureId] = useState(null);
  const [contractortList, setcontractortList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [showOutTimePicker, setShowOutTimePicker] = useState(false);
  const [selectedOutTime, setSelectedOutTime] = useState({
    activityId: null,
    mechId: null,
  });

  const landData = route?.params?.landData;

  const categoryList = [
    { id: 1, name: "PRW" },
    { id: 2, name: "RW" },
  ];

  useEffect(() => {
    if (isFocused && dprId) {
      fetchDprDetail();
      fetchcontractortList();
      fetchEmployeeList();
    }
  }, [isFocused, dprId]);

  const fetchcontractortList = async () => {
    try {
      setLoading(true);

      const payload = encryptWholeObject({
        farmId: landData?.farmId,
      });

      const res = await apiRequest(API_ROUTES.CONTRACTOR_LIST, "POST", payload);

      const parsed = JSON.parse(decryptAES(res));

      console.log("fetchcontractortList", parsed);

      if (parsed?.status === "SUCCESS") {
        setcontractortList(parsed?.data || []);
      }
    } catch (e) {
      console.log("fetchcontractortList", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeList = async () => {
    try {
      setLoading(true);

      const payload = encryptWholeObject({
        unitType: "FARM",
      });

      const res = await apiRequest(API_ROUTES.EMPLOYEE_LIST, "POST", payload);

      const parsed = JSON.parse(decryptAES(res));

      console.log("fetchEmployeeList", parsed);

      if (parsed?.status === "SUCCESS") {
        setEmployeeList(parsed?.data || []);
      }
    } catch (e) {
      console.log("fetchEmployeeList", e);
    } finally {
      setLoading(false);
    }
  };

  /* ================= API ================= */

  const onChangeDate = (event, selectedDate) => {
    setShow(false); // hide after selection
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const fetchDprDetail = async () => {
    try {
      setLoading(true);
      const payload = encryptWholeObject({ id: dprId });
      const res = await apiRequest(API_ROUTES.DPR_FIND_BY_ID, "POST", payload);
      const parsed = JSON.parse(decryptAES(res));

      console.log("dprDetail", parsed);

      if (parsed?.status === "SUCCESS") {
        setDprData(parsed.data);
        groupByActivity(parsed.data);
        setTimeout(() => {
          parsed.data.dprAgricultures?.forEach((ag) => {
            preloadMaterialForAgriculture(
              ag.activityId,
              ag.id,
              ag.cashMemoDto?.materialType,
              ag.itemCode,
            );
          });
        }, 0);
        if (parsed?.data?.actualDate) {
          setDate(new Date(parsed.data.actualDate));
        }
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

  const openOutTimePicker = (activityId, mechId) => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: new Date(),
        mode: "time",
        is24Hour: true,
        onChange: (event, selectedTime) => {
          if (!selectedTime) return;

          const hours = String(selectedTime.getHours()).padStart(2, "0");
          const minutes = String(selectedTime.getMinutes()).padStart(2, "0");

          updateMechanicalField(
            activityId,
            mechId,
            "outTime",
            `${hours}:${minutes}`,
          );
        },
      });
    } else {
      setSelectedOutTime({ activityId, mechId });
      setShowOutTimePicker(true);
    }
  };

  const fetchMaterialListByItemCode = async (materialType) => {
    try {
      setLoading(true);

      // const payloadData = {
      //   itemCode: itemCode,
      //   itemSubType: "STANDARD",
      // };
      const payloadData = {
        inventoryType: "RUNNING",
        materialType: materialType,
        unitType: "FARM",
        farmId: String(landData?.farmId),
        aoId: userData?.aoId,
        roId: userData?.roId,
        farmBlockId: String(landData?.farmBlockId),
        subUnitId: String(landData?.farmBlockId),
        subUnitName: "",
        subUnitType: "FARM_BLOCK",
      };
      console.log("parsed___", payloadData);
      //console.log("parsed___", itemCode);
      //return;

      const encryptedPayload = encryptWholeObject(payloadData);

      const res = await apiRequest(
        API_ROUTES.MATERIAL_LIST_DPR,
        "POST",
        encryptedPayload,
      );

      const parsed = JSON.parse(decryptAES(res));

      console.log("parsed___", parsed);

      if (parsed?.status === "SUCCESS" || parsed?.statusCode === "200") {
        // 🔥 prefill selected materials

        const prefilled = (parsed.data || []).map((m) => ({
          ...m,
          selected: m.requestedQty ? true : false,
          issueQty: m.requestedQty ? String(m.requestedQty) : "",
        }));

        console.log("Prefilled Materials", prefilled);

        setMaterialTableData(prefilled);
      }
    } catch (e) {
      console.log("Prefill material error", e);
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
      console.log("existingLabour", existingLabour);

      const labours =
        existingLabour.length > 0
          ? existingLabour.map((l) => ({
              id: l.id,
              activityId: a.activityId,
              labourName: l.labourName || "",
              actualHours: l.actualHours || "",
              agreementType: l.agreementType || "",
              worker: l.worker || null,
              workerList: [],
              category: l.category,
            }))
          : Array.from({ length: a.noOfLabour || 0 }).map((_, i) => ({
              id: `${a.id}-${i}`, // 🔥 use a.id
              activityId: a.activityId,
              labourName: "",
              actualHours: "",
              agreementType: "",
              worker: null,
              workerList: [],
              category: "",
            }));

      map[a.id] = {
        id: a.id,
        activityId: a.activityId,
        activityName: a.activityName,
        basic: {
          ...a,
          actualNoOfLabour:
            a.actualNoOfLabour ??
            data.dprLabour?.filter((l) => l.activityId === a.activityId)
              .length ??
            0,
        },
        agricultures: [],
        mechanicals: [],
        labours,
      };
    });

    data.dprAgricultures?.forEach((ag) => {
      const act = Object.values(map).find(
        (x) => x.activityId === ag.activityId,
      );

      if (!act) return;

      const matchedMaterialType = materialTypeList.find(
        (m) => m.name === ag.cashMemoDto?.materialType,
      );

      act.agricultures.push({
        id: ag.id,
        activityId: ag.activityId,
        activityName: ag.activityName,

        //materialType: matchedMaterialType || null,
        materialType: ag.materialType || null,
        materialList: [],
        material: null,
        itemCode: ag.itemCode,
      });
    });

    data.dprMechanicals?.forEach((me) => {
      const act = Object.values(map).find(
        (x) => x.activityId === me.activityId,
      );
      act?.mechanicals.push(me);
    });

    setActivityGroups(Object.values(map));
  };

  const preloadMaterialForAgriculture = async (
    activityId,
    agId,
    materialType,
    itemCode,
  ) => {
    try {
      const payload = encryptWholeObject({
        materialType: materialType,
      });

      const res = await apiRequest(API_ROUTES.MATERIAL_LIST, "POST", payload);

      const parsed = JSON.parse(decryptAES(res));

      if (parsed?.status !== "SUCCESS") return;

      const materialList = parsed.data || [];

      // 🔥 MATCH itemCode
      const matchedItem = materialList.find((m) => m.itemCode === itemCode);

      setActivityGroups((prev) =>
        prev.map((act) =>
          act.activityId === activityId
            ? {
                ...act,
                agricultures: act.agricultures.map((ag) =>
                  ag.id === agId
                    ? {
                        ...ag,
                        materialList,
                        material: matchedItem || null, // 🔥 preselect
                      }
                    : ag,
                ),
              }
            : act,
        ),
      );

      if (matchedItem?.itemCode) {
        console.log("matchedItem___", matchedItem);
        fetchMaterialListByItemCode(matchedItem.materialType);
      }
    } catch (e) {
      console.log("Material preload error", e);
    }
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

  const addAgriculture = (activityId) => {
    setActivityGroups((prev) =>
      prev.map((act) =>
        act.activityId === activityId
          ? {
              ...act,
              agricultures: [
                ...act.agricultures,
                {
                  id: `new-${Date.now()}`,
                  activityId: act.activityId,
                  materialType: "",
                  materialList: [],
                  itemCode: "",
                  qty: "",
                },
              ],
            }
          : act,
      ),
    );
  };

  const removeAgriculture = (activityId, agId) => {
    setActivityGroups((prev) =>
      prev.map((act) =>
        act.activityId === activityId
          ? {
              ...act,
              agricultures: act.agricultures.filter((ag) => ag.id !== agId),
            }
          : act,
      ),
    );
  };

  const getMaterialItem = async (activityId, agId, val) => {
    setLoading(true);
    try {
      const payloadData = { materialType: val.name };
      const encryptPayloadData = encryptWholeObject(payloadData);
      const res = await apiRequest(
        API_ROUTES.MATERIAL_LIST,
        "POST",
        encryptPayloadData,
      );

      const parsed = JSON.parse(decryptAES(res));
      console.log(parsed);

      if (parsed?.status === "SUCCESS") {
        setActivityGroups((prev) =>
          prev.map((act) =>
            act.activityId === activityId
              ? {
                  ...act,
                  agricultures: act.agricultures.map((x) =>
                    x.id === agId
                      ? {
                          ...x,
                          materialType: val.name,
                          materialList: parsed.data || [],
                          material: null, // reset item
                        }
                      : x,
                  ),
                }
              : act,
          ),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterialList = async (item) => {
    //console.log("parsedDecryptedMaterialList", item);
    setLoading(true);
    try {
      // const payloadData = {
      //   itemCode: item?.itemCode,
      //   itemSubType: "STANDARD",
      // };
      const payloadData = {
        inventoryType: "RUNNING",
        materialType: item?.materialType,
        unitType: "FARM",
        farmId: String(landData?.farmId),
        aoId: userData?.aoId,
        roId: userData?.roId,
        farmBlockId: String(landData?.farmBlockId),
        subUnitId: String(landData?.farmBlockId),
        subUnitName: "",
        subUnitType: "FARM_BLOCK",
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

      console.log("parsedDecryptedMaterialList", payloadData);

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
      showErrorMessage("Material list is empty.");
    } finally {
      setLoading(false);
    }
  };

  const updateActualNoOfLabour = (activityId, newCount) => {
    if (
      typeof newCount !== "number" ||
      Number.isNaN(newCount) ||
      newCount < 0
    ) {
      return;
    }

    setActivityGroups((prev) =>
      prev.map((act) => {
        if (act.activityId !== activityId) return act;

        const currentLabours = Array.isArray(act.labours)
          ? [...act.labours]
          : [];

        const diff = newCount - currentLabours.length;

        let updatedLabours = [...currentLabours];

        // ➕ add rows
        if (diff > 0) {
          const newLabours = Array.from({ length: diff }, (_, i) => ({
            id: `lab-${activityId}-${Date.now()}-${i}`,
            activityId,
            labourName: "",
            actualHours: "",
            agreementType: "",
            worker: null,
            workerList: [],
            category: "",
          }));
          updatedLabours = [...currentLabours, ...newLabours];
        }

        // ➖ remove rows
        if (diff < 0) {
          updatedLabours = currentLabours.slice(0, newCount);
        }

        return {
          ...act,
          basic: {
            ...act.basic,
            actualNoOfLabour: newCount, // ✅ ONLY ACTUAL
          },
          labours: updatedLabours,
        };
      }),
    );
  };

  const updateMechanicalField = (activityId, mechId, key, value) => {
    setActivityGroups((prev) =>
      prev.map((act) =>
        act.activityId === activityId
          ? {
              ...act,
              mechanicals: act.mechanicals.map((m) =>
                m.id === mechId ? { ...m, [key]: value } : m,
              ),
            }
          : act,
      ),
    );
  };

  /* ================= RENDER ACTIVITY ================= */

  const renderActivity = ({ item, index }) => {
    const isOpen = expandedActivityId === item.activityId;

    return (
      <View style={styles.activityCard}>
        <TouchableOpacity
          style={styles.activityHeader}
          onPress={() => setExpandedActivityId(isOpen ? null : item.activityId)}
        >
          <Text style={styles.activityTitle}>
            Activity {index + 1} · {item.activityName}
          </Text>
          <Icon
            name={isOpen ? "expand-less" : "expand-more"}
            size={26}
            color={Colors.greenColor}
          />
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.activityBody}>
            {/* BASIC */}
            <DropDown disabled label="Activity" value={item.activityName} />
            <DropDown
              disabled
              label="Contractor Type"
              value={item.basic?.contractorType}
            />
            <DropDown
              disabled
              label="Contractor Name"
              value={item.basic?.contractorName}
            />
            <View style={styles.inputContainer}>
              <Text style={styles.label}>No of Labour</Text>
              <TextInput
                maxLength={2}
                editable={false}
                style={styles.disabledInput}
                keyboardType="numeric"
                value={String(item.basic?.noOfLabour || "")}
                onChangeText={(val) => {
                  // allow empty typing
                  if (val === "") {
                    updateNoOfLabour(item.activityId, 0);
                    return;
                  }

                  const parsed = parseInt(val, 10);

                  if (Number.isNaN(parsed)) return;

                  updateNoOfLabour(item.activityId, parsed);
                }}
              />
            </View>

            {dprData?.currentDprStatus == "APPROVED" && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Actual No of Labour</Text>
                <TextInput
                  maxLength={2}
                  keyboardType="number-pad"
                  editable={
                    dprData?.currentDprStatus === "APPROVED" &&
                    userData?.roleName?.includes(ROLES.EPO_EMPLOYEE)
                  }
                  style={
                    dprData?.currentDprStatus === "APPROVED" &&
                    userData?.roleName?.includes(ROLES.EPO_EMPLOYEE)
                      ? styles.input
                      : styles.disabledInput
                  }
                  value={String(item.basic?.actualNoOfLabour || "")}
                  onChangeText={(val) => {
                    if (val === "") {
                      updateActualNoOfLabour(item.activityId, 0);
                      return;
                    }

                    const parsed = parseInt(val, 10);
                    if (Number.isNaN(parsed)) return;

                    updateActualNoOfLabour(item.activityId, parsed);
                  }}
                />
              </View>
            )}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Area</Text>
              <TextInput
                editable={false}
                style={styles.disabledInput}
                value={String(item.basic?.area || "")}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>No Of Iteration</Text>
              <TextInput
                editable={false}
                style={styles.disabledInput}
                value={String(item.basic?.noOfIteration || "")}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Total Output</Text>
              <TextInput
                editable={false}
                style={styles.disabledInput}
                value={String(item.basic?.totalOutput || "")}
              />
            </View>

            {/* AGRICULTURE */}
            {item.agricultures.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Agriculture Inputs</Text>
                  {/* {userData?.unitType == "CHAK"
                    ? null
                    : dprData?.currentDprStatus == "PENDING" && (
                        <TouchableOpacity
                          onPress={() => addAgriculture(item.activityId)}
                        >
                          <Text style={styles.addText}>+ Add New</Text>
                        </TouchableOpacity>
                      )} */}
                </View>

                {item.agricultures.map((ag, i) => (
                  <View key={ag.id} style={styles.rowBox}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text style={styles.serial}>S.N. {i + 1}</Text>
                      {/* {userData?.unitType == "CHAK"
                        ? null
                        : dprData?.currentDprStatus == "PENDING" &&
                          item.agricultures?.length > i && (
                            <TouchableOpacity
                              onPress={() =>
                                removeAgriculture(item.activityId, ag.id)
                              }
                            >
                              <Icon name="delete" size={20} color="red" />
                            </TouchableOpacity>
                          )} */}
                    </View>

                    <View style={styles.divider} />
                    <DropDown
                      disabled={
                        userData?.roleName?.includes(ROLES.EPO_EMPLOYEE)
                          ? true
                          : dprData?.currentDprStatus == "PENDING"
                          ? false
                          : true
                      }
                      label="Material Type"
                      data={materialTypeList}
                      // value={ag.materialType?.name || ""}
                      value={ag.materialType || ""}
                      selectItem={(val) => {
                        getMaterialItem(item.activityId, ag.id, val);
                        setActivityGroups((prev) =>
                          prev.map((act) =>
                            act.activityId === item.activityId
                              ? {
                                  ...act,
                                  agricultures: act.agricultures.map((x) =>
                                    x.id === ag.id
                                      ? { ...x, materialType: val.name }
                                      : x,
                                  ),
                                }
                              : act,
                          ),
                        );
                      }}
                    />

                    <DropDown
                      disabled={
                        userData?.roleName?.includes(ROLES.EPO_EMPLOYEE)
                          ? true
                          : dprData?.currentDprStatus == "PENDING"
                          ? false
                          : true
                      }
                      label="Item"
                      data={ag.materialList || []}
                      value={ag.material?.itemName || ""}
                      selectItem={(selectedItem) => {
                        fetchMaterialList(selectedItem);
                        setActivityGroups((prev) =>
                          prev.map((act) =>
                            act.activityId === item.activityId
                              ? {
                                  ...act,
                                  agricultures: act.agricultures.map((x) =>
                                    x.id === ag.id
                                      ? { ...x, material: selectedItem }
                                      : x,
                                  ),
                                }
                              : act,
                          ),
                        );
                      }}
                    />
                    <TouchableOpacity
                      style={styles.selectMaterialBtn}
                      // onPress={() => {
                      //   setShowMaterialModal(true);
                      // }}

                      onPress={async () => {
                        // if (userData?.unitType == "CHAK") {
                        // } else {
                        if (!ag?.material?.itemCode) {
                          alert("Please select item first");
                          return;
                        }

                        // await fetchMaterialListByItemCode(
                        //   ag.material.materialType,
                        // );

                        setSelectedActivityId(item.activityId);

                        setSelectedAgricultureId(ag.id);

                        setShowMaterialModal(true);
                        // }
                      }}
                    >
                      <Text style={styles.selectMaterialText}>
                        Select / View Material(s)
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}

            {/* MECHANICAL */}
            {item.mechanicals.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    Equipment & Mechanical Details
                  </Text>
                </View>

                {item.mechanicals.map((eq, i) => (
                  <View key={eq.id} style={styles.rowBox}>
                    <Text style={styles.serial}>S.N. {i + 1}</Text>
                    <View style={styles.divider} />
                    <DropDown disabled label="Group" value={eq.equipmentName} />
                    <DropDown
                      disabled
                      label="Sub Group"
                      value={eq.subGroupName}
                    />
                    <DropDown
                      disabled
                      label="Category"
                      value={eq.categoryName}
                    />
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Estimated Hours</Text>
                      <TextInput
                        editable={false}
                        style={styles.disabledInput}
                        value={String(eq.estimatedHours || "")}
                        placeholder="Estimated Hours"
                      />
                    </View>

                    {dprData?.dprStatus == "PENDING" &&
                    userData?.roleName?.includes(ROLES.EPO_INCHARGE) ? null : (
                      <View style={styles.inputContainer}>
                        <Text style={styles.label}>Actual Hours</Text>
                        <TextInput
                          maxLength={2}
                          keyboardType="numeric"
                          value={String(eq.actualHours || "")}
                          placeholder="Actual Hours"
                          editable={
                            dprData?.currentDprStatus == "APPROVED" &&
                            userData?.roleName?.includes(ROLES.EPO_EMPLOYEE)
                          }
                          style={
                            dprData?.currentDprStatus == "APPROVED" &&
                            userData?.roleName?.includes(ROLES.EPO_EMPLOYEE)
                              ? styles.input
                              : styles.disabledInput
                          }
                          onChangeText={(val) =>
                            updateMechanicalField(
                              item.activityId,
                              eq.id,
                              "actualHours",
                              val,
                            )
                          }
                        />
                      </View>
                    )}

                    {(dprData?.dprStatus == "APPROVED" ||
                      dprData?.dprStatus == "SUBMITTED" ||
                      dprData?.dprStatus == "DONE") &&
                      eq.operatorName && (
                        <View style={styles.inputContainer}>
                          <Text style={styles.label}>Operator Name</Text>
                          <TextInput
                            editable={false}
                            style={styles.disabledInput}
                            value={String(eq.operatorName || "")}
                            placeholder="Operator Name"
                          />
                        </View>
                      )}

                    {(dprData?.dprStatus == "APPROVED" ||
                      dprData?.dprStatus == "SUBMITTED" ||
                      dprData?.dprStatus == "DONE") && (
                      <View style={styles.inputContainer}>
                        <Text style={styles.label}>CP Number</Text>
                        <TextInput
                          editable={false}
                          style={styles.disabledInput}
                          value={String(eq.cpNumber || "")}
                          placeholder="CP Number"
                        />
                      </View>
                    )}

                    {(dprData?.dprStatus == "APPROVED" ||
                      dprData?.dprStatus == "SUBMITTED" ||
                      dprData?.dprStatus == "DONE") && (
                      <View style={styles.inputContainer}>
                        <Text style={styles.label}>Out Time</Text>

                        <TouchableOpacity
                          disabled
                          // style={
                          //   eq.outTime
                          //     ? styles.disabledInput
                          //     : styles.timeContainer
                          // }
                          style={styles.disabledInput}
                          onPress={() => {
                            if (!eq.outTime) {
                              openOutTimePicker(item.activityId, eq.id);
                            }
                          }}
                        >
                          <Text>{eq.outTime || "- - : - -"}</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {(dprData?.dprStatus == "APPROVED" ||
                      dprData?.dprStatus == "SUBMITTED" ||
                      dprData?.dprStatus == "DONE") &&
                      eq.inTime && (
                        <View style={styles.inputContainer}>
                          <Text style={styles.label}>In Time</Text>

                          <TouchableOpacity
                            disabled
                            style={styles.disabledInput}
                          >
                            <Text>{eq.inTime || "- - : - -"}</Text>
                          </TouchableOpacity>
                        </View>
                      )}

                    {(dprData?.dprStatus == "APPROVED" ||
                      dprData?.dprStatus == "SUBMITTED" ||
                      dprData?.dprStatus == "DONE") &&
                      eq.mechIdleTime && (
                        <View style={styles.inputContainer}>
                          <Text style={styles.label}>Idle Hours</Text>

                          <TouchableOpacity
                            disabled
                            style={styles.disabledInput}
                          >
                            <Text>{eq.mechIdleTime || ""}</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    {(dprData?.dprStatus == "APPROVED" ||
                      dprData?.dprStatus == "SUBMITTED" ||
                      dprData?.dprStatus == "DONE") &&
                      eq.mechRunningTime && (
                        <View style={styles.inputContainer}>
                          <Text style={styles.label}>Walking Time</Text>

                          <TouchableOpacity
                            disabled
                            style={styles.disabledInput}
                          >
                            <Text>{eq.mechRunningTime || ""}</Text>
                          </TouchableOpacity>
                        </View>
                      )}

                    <View style={styles.switchRow}>
                      <Text>Operator Required</Text>
                      <Switch
                        trackColor={{ false: "#ccc", true: Colors.greenColor }} // 👈 background
                        thumbColor={
                          Platform.OS === "android"
                            ? item.selected
                              ? Colors.greenColor
                              : "#f4f3f4"
                            : undefined
                        }
                        value={eq.operatorRequired}
                        disabled
                      />
                    </View>
                  </View>
                ))}
              </>
            )}

            {/* LABOUR */}
            {item.labours.length > 0 &&
              (dprData?.currentDprStatus == "APPROVED" ||
                dprData?.currentDprStatus == "SUBMITTED") &&
              userData?.roleName?.includes(ROLES.EPO_EMPLOYEE) && (
                <>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Labour Details</Text>
                  </View>

                  {item.labours.map((lab, i) => (
                    <View key={lab.id} style={styles.rowBox}>
                      <Text style={styles.serial}>S.N. {i + 1}</Text>
                      <View style={styles.divider} />

                      <DropDown
                        label="Category"
                        data={categoryList}
                        value={lab.category || ""}
                        disabled={dprData?.currentDprStatus != "APPROVED"}
                        selectItem={(selectedCategory) => {
                          setActivityGroups((prev) =>
                            prev.map((act) =>
                              act.activityId === item.activityId
                                ? {
                                    ...act,
                                    labours: act.labours.map((l) =>
                                      l.id === lab.id
                                        ? {
                                            ...l,
                                            category: selectedCategory.name,

                                            // reset values
                                            selectedAgreement: null,
                                            worker: null,

                                            // RW -> employee list
                                            workerList:
                                              selectedCategory.name === "RW"
                                                ? employeeList.map((emp) => ({
                                                    ...emp,
                                                    workerName: `${
                                                      emp.firstName || ""
                                                    }`,
                                                  }))
                                                : [],
                                          }
                                        : l,
                                    ),
                                  }
                                : act,
                            ),
                          );
                          updateLabourField(
                            item.activityId,
                            lab.id,
                            "labourName",
                            "",
                          );
                          updateLabourField(
                            item.activityId,
                            lab.id,
                            "id",
                            null,
                          );
                          setActivityGroups((prev) =>
                            prev.map((act) =>
                              act.activityId === item.activityId
                                ? {
                                    ...act,
                                    labours: act.labours.map((l) =>
                                      l.id === lab.id
                                        ? {
                                            ...l,

                                            selectedAgreement: "",

                                            agreementType: "",

                                            agreementId: "",

                                            workerList: [],

                                            worker: null,
                                          }
                                        : l,
                                    ),
                                  }
                                : act,
                            ),
                          );
                        }}
                      />

                      <DropDown
                        label="Contractor"
                        data={contractortList || []}
                        value={
                          lab.selectedAgreement
                            ? `${lab.selectedAgreement.contractorName} (${lab.selectedAgreement.agreementType})`
                            : ""
                        }
                        disabled={
                          dprData?.currentDprStatus != "APPROVED" ||
                          lab.category === "RW"
                        }
                        selectItem={(selectedAgreement) => {
                          setActivityGroups((prev) =>
                            prev.map((act) =>
                              act.activityId === item.activityId
                                ? {
                                    ...act,
                                    labours: act.labours.map((l) =>
                                      l.id === lab.id
                                        ? {
                                            ...l,

                                            selectedAgreement:
                                              selectedAgreement,

                                            agreementType:
                                              selectedAgreement?.agreementType ||
                                              "",

                                            agreementId: selectedAgreement?.id,

                                            workerList:
                                              selectedAgreement?.workers?.map(
                                                (w) => ({
                                                  ...w,
                                                  workerName: w.workerName,
                                                }),
                                              ) || [],

                                            worker: null,
                                          }
                                        : l,
                                    ),
                                  }
                                : act,
                            ),
                          );
                        }}
                      />

                      <DropDown
                        label="Labour/Employee"
                        fieldName={
                          lab.category === "RW" ? "firstName" : "workerName"
                        }
                        data={lab.workerList || []}
                        value={lab.labourName || ""}
                        disabled={dprData?.currentDprStatus != "APPROVED"}
                        selectItem={(selectedWorker) => {
                          //console.log("selectedWorker", selectedWorker);
                          updateLabourField(
                            item.activityId,
                            lab.id,
                            "labourName",
                            selectedWorker?.firstName ||
                              selectedWorker?.workerName,
                          );
                          updateLabourField(
                            item.activityId,
                            lab.id,
                            "id",
                            selectedWorker?.id,
                          );
                        }}
                        // selectItem={(selectedWorker) => {
                        //   setActivityGroups((prev) =>
                        //     prev.map((act) =>
                        //       act.activityId === item.activityId
                        //         ? {
                        //             ...act,
                        //             labours: act.labours.map((l) =>
                        //               l.id === lab.id
                        //                 ? {
                        //                     ...l,
                        //                     worker: selectedWorker,
                        //                     labourName:
                        //                       selectedWorker?.workerName ||
                        //                       `${
                        //                         selectedWorker?.firstName || ""
                        //                       } ${
                        //                         selectedWorker?.lastName || ""
                        //                       }`,
                        //                   }
                        //                 : l,
                        //             ),
                        //           }
                        //         : act,
                        //     ),
                        //   );
                        // }}
                      />

                      {/* <View style={styles.inputContainer}>
                        <Text style={styles.label}>Labour Name</Text>
                        <TextInput
                          editable={dprData?.currentDprStatus == "APPROVED"}
                          style={
                            dprData?.currentDprStatus == "APPROVED"
                              ? styles.input
                              : styles.disabledInput
                          }
                          placeholder="Labour Name"
                          value={lab.labourName}
                          // onChangeText={(val) =>
                          //   updateLabourField(
                          //     item.activityId,
                          //     lab.id,
                          //     "labourName",
                          //     val,
                          //   )
                          // }
                          onChangeText={(val) => {
                            const formatted = val.replace(/[^a-zA-Z\s]/g, ""); // allow only letters + space
                            updateLabourField(
                              item.activityId,
                              lab.id,
                              "labourName",
                              formatted,
                            );
                          }}
                        />
                      </View> */}

                      <View style={styles.inputContainer}>
                        <Text style={styles.label}>Working Hours</Text>
                        <TextInput
                          maxLength={2}
                          editable={dprData?.currentDprStatus == "APPROVED"}
                          style={
                            dprData?.currentDprStatus == "APPROVED"
                              ? styles.input
                              : styles.disabledInput
                          }
                          placeholder="Working Hours"
                          keyboardType="numeric"
                          value={lab.actualHours.toString()}
                          onChangeText={(val) =>
                            updateLabourField(
                              item.activityId,
                              lab.id,
                              "actualHours",
                              val,
                            )
                          }
                        />
                      </View>
                    </View>
                  ))}
                </>
              )}
            {userData?.roleName?.includes(ROLES.EPO_EMPLOYEE)
              ? null
              : dprData?.currentDprStatus == "PENDING" && (
                  <>
                    <CustomButton
                      text="Approve"
                      buttonStyle={styles.buttonStyle}
                      textStyle={styles.buttonTextStyle}
                      handleAction={() => {
                        submitUpdateDpr("APPROVED");
                      }}
                    />
                    <CustomButton
                      text="Reject"
                      buttonStyle={[styles.buttonStyle, { marginTop: 0 }]}
                      textStyle={styles.buttonTextStyle}
                      handleAction={() => {
                        submitUpdateDpr("REJECTED");
                      }}
                    />
                  </>
                )}

            {dprData?.currentDprStatus == "APPROVED" &&
              userData?.roleName?.includes(ROLES.EPO_EMPLOYEE) && (
                <CustomButton
                  text="Create DPR"
                  buttonStyle={styles.buttonStyle}
                  textStyle={styles.buttonTextStyle}
                  handleAction={handleUpdateDpr}
                />
              )}
          </View>
        )}
      </View>
    );
  };

  const handleUpdateDpr = async () => {
    try {
      // ✅ Validation Start
      for (const act of activityGroups) {
        // Actual No Of Labour
        console.log(act);
        if (
          act?.basic?.actualNoOfLabour === "" ||
          act?.basic?.actualNoOfLabour === null ||
          act?.basic?.actualNoOfLabour === undefined ||
          Number(act?.basic?.actualNoOfLabour) <= 0
        ) {
          showErrorMessage(`Please enter Actual No Of Labour`);
          return;
        }

        for (const mac of act.mechanicals || []) {
          if (mac?.actualHours == 0) {
            showErrorMessage(`Please enter actual number of hours.`);
            return;
          }
        }

        // Labour Details
        for (const lab of act.labours || []) {
          if (!lab?.category) {
            showErrorMessage(`Please select Category in Labour detail`);
            return;
          }

          if (!lab?.labourName?.trim()) {
            showErrorMessage(`Please select Labour/Employee Name.`);
            return;
          }

          if (
            lab?.actualHours === "" ||
            lab?.actualHours === null ||
            lab?.actualHours === undefined ||
            Number(lab?.actualHours) <= 0
          ) {
            showErrorMessage(`Please enter Working Hours for Labour`);
            return;
          }
        }
      }

      setLoading(true);

      // const payload = [
      //   {
      //     id: dprData?.id,
      //     actualDate: dprData?.actualDate,

      //     activities: activityGroups?.map((activity) => ({
      //       id: activity?.id,
      //       activityId: activity?.activityId,
      //       activityName: activity?.activityName,
      //       noOfLabour: activity?.noOfLabour,
      //       actualNoOfLabour: activity?.actualNoOfLabour,
      //       area: activity?.area,
      //       noOfIteration: activity?.noOfIteration,
      //       totalOutput: activity?.totalOutput,
      //       contractorType: activity?.contractorType,
      //       contractorId: activity?.contractorId,
      //       contractorName: activity?.contractorName,
      //     })),

      //     chakId: dprData?.chakId,
      //     farmBlockId: dprData?.farmBlockId,
      //     chakName: dprData?.chakName,
      //     farmBlockName: dprData?.farmBlockName,
      //     farmPlanId: dprData?.farmPlanId,
      //     dprType: dprData?.dprType,
      //     dprMechanicalSubmit: dprData?.dprMechanicalSubmit,
      //     farmId: dprData?.farmId,
      //     engineeringId: dprData?.farmBlockId,
      //     engineeringName: dprData?.farmBlockName,
      //     farmName: dprData?.farmName,
      //     epoId: dprData?.epoId,
      //     epoName: dprData?.epoName,
      //     squareId: dprData?.squareId,
      //     squareName: dprData?.squareName,
      //     allowMultiple: dprData?.allowMultiple,
      //     dprStatus: "SUBMITTED",
      //     currentDprStatus: "SUBMITTED",

      //     dprAgricultures: materialTableData?.map((item) => ({
      //       id: item?.id,
      //       activityId: item?.activityId,
      //       activityName: item?.activityName,
      //       itemCode: item?.itemCode,
      //       itemName: item?.itemName,
      //       itemId: item?.itemId,
      //       materialType: item?.materialType,
      //       uom: item?.uom,
      //       qty: item?.qty,
      //       noOfItems: item?.noOfItems,
      //       requiredBags: item?.requiredBags,

      //       runningInventoryDto: {
      //         lotBatchNo: item?.runningInventoryDto?.lotBatchNo,
      //         materialType: item?.runningInventoryDto?.materialType,
      //         uom: item?.runningInventoryDto?.uom,
      //         availableQty: item?.runningInventoryDto?.availableQty,
      //         requestedQty: item?.runningInventoryDto?.requestedQty,
      //         noOfBags: item?.runningInventoryDto?.noOfBags,
      //         requiredBags: item?.runningInventoryDto?.requiredBags,
      //         itemName: item?.runningInventoryDto?.itemName,
      //         transactionMethod: item?.runningInventoryDto?.transactionMethod,
      //       },
      //     })),

      //     dprMechanicals: dprData?.dprMechanicals?.map((item) => ({
      //       id: item?.id,
      //       equipmentId: item?.equipmentId,
      //       equipmentName: item?.equipmentName,
      //       categoryId: item?.categoryId,
      //       categoryName: item?.categoryName,
      //       subGroupId: item?.subGroupId,
      //       subGroupName: item?.subGroupName,
      //       estimatedHours: item?.estimatedHours,
      //       actualHours: item?.actualHours,
      //       operatorRequired: item?.operatorRequired,
      //       operatorName: item?.operatorName,
      //       cpNumber: item?.cpNumber,
      //       mechIdleHours: item?.mechIdleHours,
      //       mechWalkingTime: item?.mechWalkingTime,
      //       outTime: item?.outTime,
      //       inTime: item?.inTime,
      //       activityId: item?.activityId,
      //       activityName: item?.activityName,
      //     })),

      //     dprLabour: dprData?.dprLabour?.map((item) => ({
      //       category: item?.category,
      //       contractorId: item?.category === "RW" ? null : item?.contractorId,
      //       labourId: item?.labourId,
      //       labourName: item?.labourName,
      //       actualHours: item?.actualHours,
      //       activityId: item?.activityId,
      //       activityName: item?.activityName,
      //     })),
      //   },
      // ];

      const payload = [
        {
          id: dprData?.id,
          actualDate: dprData?.actualDate,

          activities: activityGroups.map((act) => ({
            id: act?.basic?.id,
            activityId: act?.activityId,
            activityName: act?.activityName,
            noOfLabour: Number(act?.basic?.noOfLabour || 0),
            actualNoOfLabour: Number(act?.basic?.actualNoOfLabour || 0),
            area: Number(act?.basic?.area || 0),
            noOfIteration: Number(act?.basic?.noOfIteration || 0),
            totalOutput: Number(act?.basic?.totalOutput || 0),
            contractorType: act?.basic?.contractorType || "",
            contractorId: act?.basic?.contractorId || null,
            contractorName: act?.basic?.contractorName || "",
          })),

          chakId: dprData?.chakId,
          farmBlockId: dprData?.farmBlockId,
          chakName: dprData?.chakName,
          farmBlockName: dprData?.farmBlockName,
          farmPlanId: dprData?.farmPlanId,
          dprType: dprData?.dprType,
          dprMechanicalSubmit: dprData?.dprMechanicalSubmit,
          farmId: dprData?.farmId,
          engineeringId: dprData?.epoId,
          engineeringName: dprData?.epoName,
          farmName: dprData?.farmName,
          epoId: dprData?.epoId,
          epoName: dprData?.epoName,
          squareId: dprData?.squareId,
          squareName: dprData?.squareName,
          allowMultiple: dprData?.allowMultiple,
          plotId: dprData?.plotId,
          plotName: dprData?.plotName,
          orchardId: dprData?.orchardId,
          orchardName: dprData?.orchardName,
          dprStatus: "SUBMITTED",
          currentDprStatus: "SUBMITTED",

          dprAgricultures: dprData?.dprAgricultures,

          dprMechanicals: activityGroups.flatMap((act) =>
            act.mechanicals.map((eq) => ({
              id: eq?.id,

              equipmentId: eq?.equipmentId,

              equipmentName: eq?.equipmentName,

              categoryId: eq?.categoryId,

              categoryName: eq?.categoryName,

              subGroupId: eq?.subGroupId,

              subGroupName: eq?.subGroupName,

              estimatedHours: Number(eq?.estimatedHours || 0),

              actualHours: eq?.actualHours || "",

              operatorRequired: eq?.operatorRequired || false,

              operatorName: eq?.operatorName || "",

              cpNumber: eq?.cpNumber || "",

              mechIdleHours: eq?.mechIdleHours || "",

              mechWalkingTime: eq?.mechWalkingTime || "",

              outTime: eq?.outTime || "",

              inTime: eq?.inTime || "",

              remarks: eq?.remarks || "",

              activityId: act?.activityId,

              activityName: act?.activityName,
            })),
          ),

          dprLabour: activityGroups.flatMap((act) =>
            act.labours.map((lab) => ({
              category: lab?.category || "",

              contractorId:
                lab?.category === "RW"
                  ? null
                  : lab?.selectedAgreement?.id ||
                    lab?.agreementId ||
                    lab?.contractorId ||
                    null,

              labourId: lab?.id || null,

              labourName: lab?.labourName || "",

              actualHours: Number(lab?.actualHours || 0),

              activityId: act?.activityId,

              activityName: act?.activityName,
            })),
          ),
        },
      ];

      const encryptedPayload = encryptWholeObject(payload);

      const response = await apiRequest(
        API_ROUTES.DPR_UPDATE,
        "POST",
        encryptedPayload,
      );

      const parsed = JSON.parse(decryptAES(response));

      if (parsed?.status === "SUCCESS") {
        alert("DPR updated successfully ✅");
        navigation.goBack();
      } else {
        showErrorMessage(parsed?.message || "Update failed");
      }
    } catch (err) {
      console.log("Update DPR Error", err);
      showErrorMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}-${date.getFullYear()}`;
  };

  const validateMaterialSelection = () => {
    let isValid = true;

    activityGroups.forEach((act) => {
      act.agricultures.forEach((ag) => {
        // check item selected
        if (ag.material?.itemCode) {
          //const selectedMaterials = materialTableData.filter((m) => m.selected);

          // if (selectedMaterials.length === 0) {
          //   alert(
          //     `Please select at least one material for ${act.activityName}`,
          //   );
          //   isValid = false;
          //   return;
          // }

          for (let m of selectedMaterials) {
            if (!m.issueQty || m.issueQty.trim() === "") {
              alert(`Please enter Issue Qty for ${m.itemName}`);
              isValid = false;
              return;
            }
          }
        }
      });
    });

    return isValid;
  };

  const submitUpdateDpr = async (status) => {
    // if (!validateMaterialSelection()) {
    //   return;
    // }
    try {
      setLoading(true);
      let payload;

      const selectedMaterials = materialTableData.filter((m) => m.selected);

      if (selectedMaterials.length === 0) {
        payload = [
          {
            id: dprData?.id,

            planDate: dprData?.planDate || "",

            actualDate: dprData?.actualDate || "",

            /* ================= ACTIVITIES ================= */

            activities: activityGroups.map((act) => ({
              id: act?.basic?.id,

              activityId: act?.activityId,

              activityName: act?.activityName,

              noOfLabour: Number(act?.basic?.noOfLabour || 0),

              actualNoOfLabour: act?.basic?.actualNoOfLabour || null,

              area: Number(act?.basic?.area || 0),

              noOfIteration: Number(act?.basic?.noOfIteration || 0),

              totalOutput: Number(act?.basic?.totalOutput || 0),

              contractorType: act?.basic?.contractorType || "",

              contractorId: act?.basic?.contractorId || null,

              contractorName: act?.basic?.contractorName || "",
            })),

            chakId: dprData?.chakId || null,

            farmBlockId: dprData?.farmBlockId || "",

            chakName: dprData?.chakName || null,

            farmBlockName: dprData?.farmBlockName || "",

            engineeringId: dprData?.epoId || "",

            engineeringName: dprData?.epoName || "",

            farmPlanId: dprData?.farmPlanId || null,

            dprType: dprData?.dprType || "ORCHARD",

            dprMechanicalSubmit: false,

            farmId: dprData?.farmId || "",

            farmName: dprData?.farmName || null,

            epoId: dprData?.epoId || "",

            epoName: dprData?.epoName || "",
            plotId: dprData?.plotId,
            plotName: dprData?.plotName,
            orchardId: dprData?.orchardId,
            orchardName: dprData?.orchardName,

            squareId: dprData?.squareId || null,

            squareName: dprData?.squareName || "",

            allowMultiple: dprData?.allowMultiple || false,

            // dprStatus: "APPROVED",

            // currentDprStatus: "APPROVED",
            dprStatus: status,

            currentDprStatus: status,

            /* ================= AGRICULTURE ================= */

            dprAgricultures: activityGroups.flatMap((act) =>
              act.agricultures.map((ag) => ({
                id: ag?.id || null,

                activityId: act?.activityId,

                activityName: act?.activityName,

                itemCode: ag?.material?.itemCode || ag?.itemCode || "",

                itemName: ag?.material?.itemName || ag?.itemName || "",

                itemId: Number(ag?.material?.id || ag?.itemId || 0),

                materialType: ag?.materialType || "",
              })),
            ),

            /* ================= MECHANICAL ================= */

            dprMechanicals: activityGroups.flatMap((act) =>
              act.mechanicals.map((eq) => ({
                id: eq?.id,

                equipmentId: eq?.equipmentId,

                equipmentName: eq?.equipmentName || "",

                categoryId: eq?.categoryId,

                categoryName: eq?.categoryName || "",

                subGroupId: eq?.subGroupId,

                subGroupName: eq?.subGroupName || "",

                estimatedHours: Number(eq?.estimatedHours || 0),

                actualHours: eq?.actualHours || "",

                operatorRequired: eq?.operatorRequired || false,

                operatorName: eq?.operatorName || "",

                cpNumber: eq?.cpNumber || "",

                mechIdleHours: eq?.mechIdleHours || "",

                mechWalkingTime: eq?.mechWalkingTime || "",

                outTime: eq?.outTime || "",

                inTime: eq?.inTime || "",

                remarks: eq?.remarks || "",

                activityId: act?.activityId,

                activityName: act?.activityName || "",
              })),
            ),

            /* ================= LABOUR ================= */

            dprLabour: [],
          },
        ];
      } else {
        payload = [
          {
            id: dprData?.id,

            planDate: dprData?.planDate || "",

            actualDate: dprData?.actualDate || "",

            /* ================= ACTIVITIES ================= */

            activities: activityGroups.map((act) => ({
              id: act?.basic?.id,

              activityId: act?.activityId,

              activityName: act?.activityName,

              noOfLabour: Number(act?.basic?.noOfLabour || 0),

              actualNoOfLabour: act?.basic?.actualNoOfLabour || null,

              area: Number(act?.basic?.area || 0),

              noOfIteration: Number(act?.basic?.noOfIteration || 0),

              totalOutput: Number(act?.basic?.totalOutput || 0),

              contractorType: act?.basic?.contractorType || "",

              contractorId: act?.basic?.contractorId || null,

              contractorName: act?.basic?.contractorName || "",
            })),

            chakId: dprData?.chakId || null,

            farmBlockId: dprData?.farmBlockId || "",

            chakName: dprData?.chakName || null,

            farmBlockName: dprData?.farmBlockName || "",

            engineeringId: dprData?.epoId || "",

            engineeringName: dprData?.epoName || "",

            farmPlanId: dprData?.farmPlanId || null,

            dprType: dprData?.dprType || "ORCHARD",

            dprMechanicalSubmit: false,

            farmId: dprData?.farmId || "",

            farmName: dprData?.farmName || null,

            epoId: dprData?.epoId || "",

            epoName: dprData?.epoName || "",
            plotId: dprData?.plotId,
            plotName: dprData?.plotName,
            orchardId: dprData?.orchardId,
            orchardName: dprData?.orchardName,

            squareId: dprData?.squareId || null,

            squareName: dprData?.squareName || "",

            allowMultiple: dprData?.allowMultiple || false,

            dprStatus: status,

            currentDprStatus: status,

            /* ================= AGRICULTURE ================= */

            dprAgricultures: activityGroups.flatMap((act) =>
              act.agricultures.map((ag) => ({
                id: ag?.id || null,

                activityId: act?.activityId,

                activityName: act?.activityName,

                itemCode: ag?.material?.itemCode || ag?.itemCode || "",

                itemName: ag?.material?.itemName || ag?.itemName || "",

                itemId: Number(ag?.material?.id || ag?.itemId || 0),

                materialType: ag?.materialType || "",

                uom: ag?.selectedMaterial?.uom || "Kg",

                qty: Number(ag?.selectedMaterial?.issueQty || 0),

                noOfItems: Number(ag?.selectedMaterial?.noOfBags || 0),

                requiredBags: String(ag?.selectedMaterial?.noOfBagsInput || ""),

                runningInventoryDto: {
                  lotBatchNo:
                    ag?.selectedMaterial?.lotBatchNo ||
                    ag?.selectedMaterial?.lotNo ||
                    "",

                  materialType: ag?.materialType || "",

                  uom: ag?.selectedMaterial?.uom || "Kg",

                  availableQty: Number(ag?.selectedMaterial?.availableQty || 0),

                  requestedQty: Number(ag?.selectedMaterial?.issueQty || 0),

                  noOfBags: Number(ag?.selectedMaterial?.noOfBags || 0),

                  requiredBags: String(
                    ag?.selectedMaterial?.noOfBagsInput || "",
                  ),

                  itemName: ag?.material?.itemName || "",

                  transactionMethod: "DPR_AGRICULTURE",
                },
              })),
            ),

            /* ================= MECHANICAL ================= */

            dprMechanicals: activityGroups.flatMap((act) =>
              act.mechanicals.map((eq) => ({
                id: eq?.id,

                equipmentId: eq?.equipmentId,

                equipmentName: eq?.equipmentName || "",

                categoryId: eq?.categoryId,

                categoryName: eq?.categoryName || "",

                subGroupId: eq?.subGroupId,

                subGroupName: eq?.subGroupName || "",

                estimatedHours: Number(eq?.estimatedHours || 0),

                actualHours: eq?.actualHours || "",

                operatorRequired: eq?.operatorRequired || false,

                operatorName: eq?.operatorName || "",

                cpNumber: eq?.cpNumber || "",

                mechIdleHours: eq?.mechIdleHours || "",

                mechWalkingTime: eq?.mechWalkingTime || "",

                outTime: eq?.outTime || "",

                inTime: eq?.inTime || "",

                remarks: eq?.remarks || "",

                activityId: act?.activityId,

                activityName: act?.activityName || "",
              })),
            ),

            /* ================= LABOUR ================= */

            dprLabour: [],
          },
        ];
      }

      console.log("UPDATE DPR PAYLOAD", payload);
      return;

      /* ================= API CALL ================= */

      const encryptedPayload = encryptWholeObject(payload);

      const response = await apiRequest(
        API_ROUTES.DPR_UPDATE,
        "POST",
        encryptedPayload,
      );

      const decrypted = decryptAES(response);
      const parsed = JSON.parse(decrypted);

      console.log("✅ UPDATE DPR RESPONSE", parsed);

      if (parsed?.status === "SUCCESS") {
        alert("Data saved successfully");
        navigation.goBack();
      } else {
        showErrorMessage(parsed?.message || "DPR update failed");
      }
    } catch (error) {
      console.log("❌ Update DPR Error", error);
      showErrorMessage("Something went wrong while updating DPR");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <WrapperContainer isLoading={loading}>
      <InnerHeader title="Crop DPR" />

      {Platform.OS === "ios" && showOutTimePicker && (
        <Modal transparent animationType="slide">
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              backgroundColor: "rgba(0,0,0,0.4)",
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
              <TouchableOpacity
                style={{ alignSelf: "flex-end", marginBottom: 10 }}
                onPress={() => setShowOutTimePicker(false)}
              >
                <Text style={{ color: Colors.greenColor }}>Done</Text>
              </TouchableOpacity>

              <DateTimePicker
                value={new Date()}
                mode="time"
                display="spinner"
                onChange={(event, selectedTime) => {
                  if (!selectedTime) return;

                  const hours = String(selectedTime.getHours()).padStart(
                    2,
                    "0",
                  );
                  const minutes = String(selectedTime.getMinutes()).padStart(
                    2,
                    "0",
                  );

                  updateMechanicalField(
                    selectedOutTime.activityId,
                    selectedOutTime.mechId,
                    "outTime",
                    `${hours}:${minutes}`,
                  );
                }}
              />
            </View>
          </View>
        </Modal>
      )}

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

                      <Text style={styles.materialTitle}>{item.itemName}</Text>
                    </View>

                    {/* DETAILS */}
                    <View style={styles.cardRow}>
                      <Text style={styles.label}>Lot No:</Text>
                      <Text style={styles.value}>
                        {item.lotBatchNo || item.lotNo || "-"}
                      </Text>
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

                    {/* NO OF BAGS */}
                    <TextInput
                      style={[
                        styles.issueInput,
                        {
                          backgroundColor: item.selected ? "#fff" : "#eee",
                        },
                      ]}
                      placeholder="Enter No. Of Bags"
                      keyboardType="numeric"
                      editable={item.selected}
                      value={item.noOfBagsInput || ""}
                      onChangeText={(v) => {
                        const copy = [...materialTableData];

                        copy[index].noOfBagsInput = v;

                        // AUTO CALCULATE ISSUE QTY
                        const bags = Number(v || 0);
                        const packingSize = Number(item.packingSize || 0);

                        copy[index].issueQty = String(bags * packingSize);

                        setMaterialTableData(copy);
                      }}
                    />

                    {/* ISSUE QUANTITY */}
                    <TextInput
                      style={[
                        styles.issueInput,
                        {
                          backgroundColor: "#eee",
                          color: "#000",
                        },
                      ]}
                      placeholder="Issue Quantity"
                      editable={false}
                      value={String(item.issueQty || "")}
                    />
                  </View>
                ))}
              </ScrollView>

              {/* FOOTER */}
              {userData?.roleName?.includes(ROLES.EPO_INCHARGE) && (
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
                      const selectedItem = materialTableData.find(
                        (x) => x.selected,
                      );

                      setActivityGroups((prev) =>
                        prev.map((activity) =>
                          activity.activityId === selectedActivityId
                            ? {
                                ...activity,
                                agricultures: activity.agricultures.map((ag) =>
                                  ag.id === selectedAgricultureId
                                    ? {
                                        ...ag,
                                        selectedMaterial: selectedItem,
                                      }
                                    : ag,
                                ),
                              }
                            : activity,
                        ),
                      );

                      setShowMaterialModal(false);
                    }}
                  >
                    <Text style={{ color: "#fff" }}>Save</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}

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
              <Text>Square: {dprData.squareName}</Text>
              <Text>Status: {dprData.currentDprStatus}</Text>
              <Text>DPR Type: {dprData.dprType}</Text>
              <TouchableOpacity
                style={[styles.inputContainer, { marginTop: 10 }]}
              >
                <Text style={styles.label}>Plan Report Date</Text>
                <View style={styles.input}>
                  <Text>{formatDate(dprData?.actualDate)}</Text>
                </View>
              </TouchableOpacity>
              {dprData?.dprStatus == "PENDING" ? null : (
                <TouchableOpacity
                  disabled={
                    (dprData?.dprStatus == "APPROVED" ||
                      dprData?.dprStatus == "SUBMITTED") &&
                    userData?.roleName?.includes(ROLES.EPO_INCHARGE)
                      ? true
                      : dprData?.dprStatus == "SUBMITTED"
                      ? true
                      : false
                  }
                  onPress={() => setShow(true)}
                  style={[styles.inputContainer]}
                >
                  <Text style={styles.label}>Report Completion Date</Text>
                  <View style={styles.input}>
                    {/* <Text>{date.toLocaleDateString()}</Text> */}
                    <Text>{formatDate(date)}</Text>
                  </View>
                </TouchableOpacity>
              )}

              {console.log("dprData_____", dprData)}

              {dprData?.remarks && (
                <TouchableOpacity
                  disabled={true}
                  style={[styles.inputContainer]}
                >
                  <Text style={styles.label}>Remark</Text>
                  <View style={styles.input}>
                    <Text>{dprData?.remarks}</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}

          <FlatList
            data={activityGroups}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderActivity}
          />

          {userData?.roleName?.includes(ROLES.EPO_INCHARGE) &&
            dprData?.currentDprStatus == "PENDING" &&
            activityGroups?.length == 0 && (
              <>
                <CustomButton
                  text="Approve"
                  buttonStyle={styles.buttonStyle}
                  textStyle={styles.buttonTextStyle}
                  handleAction={() => {
                    submitUpdateDpr("APPROVED");
                  }}
                />
                <CustomButton
                  text="Reject"
                  buttonStyle={[styles.buttonStyle, { marginTop: 0 }]}
                  textStyle={styles.buttonTextStyle}
                  handleAction={() => {
                    submitUpdateDpr("REJECTED");
                  }}
                />
              </>
            )}
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
    paddingVertical: 12,
    color: "black",
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
    fontSize: 14,
    color: Colors.grey,
    marginBottom: 2,
    fontWeight: "700",
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
    marginBottom: 5,
  },
  timeContainer: {
    borderWidth: 1,
    borderColor: Colors.disableFieldColor,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    backgroundColor: "#fff",
  },
});

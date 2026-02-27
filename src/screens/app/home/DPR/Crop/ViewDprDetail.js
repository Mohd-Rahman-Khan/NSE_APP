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

export default function ViewDprDetail({ route }) {
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

  //console.log("userData", userData);

  //const USER_ROLE = userData?.roleName?.includes("FARM_BLOCK_ENGG_INCHARGE");
  const USER_ROLE = userData?.unitType == "FARM_BLOCK";

  useEffect(() => {
    if (isFocused && dprId) {
      fetchDprDetail();
    }
  }, [isFocused, dprId]);

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

  const fetchMaterialListByItemCode = async (itemCode) => {
    try {
      setLoading(true);

      const payloadData = {
        itemCode: itemCode,
        itemSubType: "STANDARD",
      };

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

        const prefilled = (parsed.data || []).map((m) => {
          // const matchedLot = dprData?.dprAgricultures?.lotUsages?.find((lu) => {
          //   console.log("dpr____", lu);
          //   console.log("dpr____", m.id);
          //   //lu.runningInventoryId === m.id,
          // });

          return {
            ...m,
            // selected: m.requestedQty > 0, // ya backend flag
            selected: !!matchedLot,
            issueQty: m.requestedQty?.toString() || "",
          };
        });

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

      const labours =
        existingLabour.length > 0
          ? existingLabour.map((l) => ({
              id: l.id,
              activityId: a.activityId,
              labourName: l.labourName || "",
              actualHours: l.actualHours || "",
            }))
          : Array.from({ length: a.noOfLabour || 0 }).map((_, i) => ({
              id: `${a.id}-${i}`, // 🔥 use a.id
              activityId: a.activityId,
              labourName: "",
              actualHours: "",
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
        fetchMaterialListByItemCode(matchedItem.itemCode);
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
    console.log("parsedDecryptedMaterialList", item);
    setLoading(true);
    try {
      const payloadData = {
        itemCode: item?.itemCode,
        itemSubType: "STANDARD",
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
      showErrorMessage("Error fetching dropdown data");
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
    // console.log("renderActivity", item);

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
                  editable={dprData?.currentDprStatus === "APPROVED"}
                  style={
                    dprData?.currentDprStatus === "APPROVED"
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

            {/* AGRICULTURE */}
            {item.agricultures.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Agriculture Inputs</Text>
                  {dprData?.currentDprStatus == "PENDING" && (
                    <TouchableOpacity
                      onPress={() => addAgriculture(item.activityId)}
                    >
                      <Text style={styles.addText}>+ Add New</Text>
                    </TouchableOpacity>
                  )}
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
                      {dprData?.currentDprStatus == "PENDING" &&
                        item.agricultures?.length > i && (
                          <TouchableOpacity
                            onPress={() =>
                              removeAgriculture(item.activityId, ag.id)
                            }
                          >
                            <Icon name="delete" size={20} color="red" />
                          </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.divider} />
                    <DropDown
                      disabled={
                        dprData?.currentDprStatus == "PENDING" ? false : true
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
                        dprData?.currentDprStatus == "PENDING" ? false : true
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

                      onPress={() => {
                        if (ag.material?.itemCode) {
                          fetchMaterialListByItemCode(ag.material.itemCode);
                        }
                        setShowMaterialModal(true);
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
                    <DropDown
                      disabled
                      label="Equipment"
                      value={eq.equipmentName}
                    />
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

                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Actual Hours</Text>
                      <TextInput
                        keyboardType="numeric"
                        value={String(eq.actualHours || "")}
                        placeholder="Actual Hours"
                        editable={dprData?.currentDprStatus == "APPROVED"}
                        style={
                          dprData?.currentDprStatus == "APPROVED"
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

                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Operator Name</Text>
                      <TextInput
                        editable={false}
                        style={styles.disabledInput}
                        value={String(eq.operatorName || "")}
                        placeholder="Operator Name"
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>CP Number</Text>
                      <TextInput
                        editable={false}
                        style={styles.disabledInput}
                        value={String(eq.cpNumber || "")}
                        placeholder="CP Number"
                      />
                    </View>

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
                dprData?.currentDprStatus == "SUBMITTED") && (
                <>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Labour Details</Text>
                  </View>

                  {item.labours.map((lab, i) => (
                    <View key={lab.id} style={styles.rowBox}>
                      <Text style={styles.serial}>S.N. {i + 1}</Text>
                      <View style={styles.divider} />

                      <View style={styles.inputContainer}>
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
                          onChangeText={(val) =>
                            updateLabourField(
                              item.activityId,
                              lab.id,
                              "labourName",
                              val,
                            )
                          }
                        />
                      </View>

                      <View style={styles.inputContainer}>
                        <Text style={styles.label}>Working Hours</Text>
                        <TextInput
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
          </View>
        )}
      </View>
    );
  };

  const handleUpdateDpr = async () => {
    try {
      setLoading(true);

      const payload = [
        {
          id: dprData?.id,

          /* ================= ACTIVITIES ================= */
          activities: activityGroups.map((act) => ({
            id: act.basic?.id,
            activityId: act.activityId,
            activityName: act.activityName,
            noOfLabour: act.basic?.noOfLabour || 0,
            actualNoOfLabour: act.basic?.actualNoOfLabour || 0,
            contractorType: act.basic?.contractorType,
            contractorId: act.basic?.contractorId,
            contractorName: act.basic?.contractorName,
          })),

          actualDate: "2026-02-08",

          chakId: dprData?.chakId,
          chakName: dprData?.chakName,

          farmId: dprData?.farmId,
          farmName: dprData?.farmName,

          farmBlockId: dprData?.farmBlockId,
          farmBlockName: null,

          squareId: dprData?.squareId,
          squareName: dprData?.squareName,

          farmPlanId: dprData?.farmPlanId || null,

          dprType: dprData?.dprType,
          dprStatus: "SUBMITTED",
          currentDprStatus: "SUBMITTED",
          dprMechanicalSubmit: false,

          /* ================= AGRICULTURE ================= */
          dprAgricultures: activityGroups.flatMap((act) =>
            act.agricultures.map((ag) => ({
              id: ag.id,
              activityId: act.activityId,
              activityName: act.activityName,
              itemCode: ag.material?.itemCode,
              cashMemoDto: {
                materialType: ag.materialType,
                activityId: act.activityId,
                activityName: act.activityName,
                cashMemoItems: [],
              },
            })),
          ),

          /* ================= MECHANICAL ================= */
          dprMechanicals: activityGroups.flatMap((act) =>
            act.mechanicals.map((eq) => ({
              id: eq.id,
              equipmentId: eq.equipmentId,
              equipmentName: eq.equipmentName,
              categoryId: eq.categoryId,
              categoryName: eq.categoryName,
              subGroupId: eq.subGroupId,
              subGroupName: eq.subGroupName,
              estimatedHours: eq.estimatedHours,
              actualHours: eq.actualHours,
              operatorRequired: eq.operatorRequired,
              operatorName: eq.operatorName,
              cpNumber: eq.cpNumber,
              mechIdleHours: eq.mechIdleHours || "",
              mechWalkingTime: eq.mechWalkingTime || "",
              activityId: act.activityId,
              activityName: act.activityName,
            })),
          ),

          /* ================= LABOUR ================= */
          dprLabour: activityGroups.flatMap((act) =>
            act.labours.map((l) => ({
              labourName: l.labourName,
              actualHours: Number(l.actualHours || 0),
              activityId: act.activityId,
              activityName: act.activityName,
            })),
          ),

          epoId: null,
          epoName: null,
        },
      ];

      console.log("UPDATE DPR SUBMIT PAYLOAD", payload);

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

  const submitUpdateDpr = async () => {
    try {
      setLoading(true);

      /* ================= BUILD PAYLOAD ================= */

      const payload = [
        {
          id: dprData?.id, // 🔥 DPR ID (MANDATORY)

          /* ================= ACTIVITIES ================= */
          activities: activityGroups.map((act) => ({
            id: act.basic?.id,
            activityId: act.activityId,
            activityName: act.activityName,
            noOfLabour: act.basic?.noOfLabour || 0,
            actualNoOfLabour: 0,
            contractorType: act.basic?.contractorType,
            contractorId: act.basic?.contractorId,
            contractorName: act.basic?.contractorName,
          })),

          chakId: dprData?.chakId || null,
          chakName: dprData?.chakName || null,

          farmId: dprData?.farmId,
          farmName: dprData?.farmName,

          farmBlockId: dprData?.farmBlockId,
          farmBlockName: null,

          squareId: dprData?.squareId,
          squareName: dprData?.squareName,

          farmPlanId: dprData?.farmPlanId || null,

          dprType: dprData?.dprType,
          dprStatus: "APPROVED", // 🔥 as per curl
          currentDprStatus: "APPROVED", // 🔥 as per curl
          dprMechanicalSubmit: false,

          /* ================= AGRICULTURE ================= */
          dprAgricultures: activityGroups.flatMap((act) =>
            act.agricultures.map((ag) => ({
              id: ag.id?.toString().startsWith("new") ? null : ag.id,
              activityId: act.activityId,
              activityName: act.activityName,
              itemCode: ag.material?.itemCode,
              cashMemoDto: {
                materialType: ag.materialType,
                activityId: act.activityId,
                activityName: act.activityName,
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

          /* ================= MECHANICAL ================= */
          dprMechanicals: activityGroups.flatMap((act) =>
            act.mechanicals.map((eq) => ({
              id: eq.id,
              equipmentId: eq.equipmentId,
              equipmentName: eq.equipmentName,
              categoryId: eq.categoryId,
              categoryName: eq.categoryName,
              subGroupId: eq.subGroupId,
              subGroupName: eq.subGroupName,
              estimatedHours: eq.estimatedHours,
              actualHours: eq.actualHours || "",
              operatorRequired: eq.operatorRequired,
              operatorName: eq.operatorName || "",
              cpNumber: eq.cpNumber || "",
              mechIdleHours: eq.mechIdleHours || "",
              mechWalkingTime: eq.mechWalkingTime || "",
              activityId: act.activityId,
              activityName: act.activityName,
            })),
          ),

          dprLabour: [],
          epoId: null,
          epoName: null,
        },
      ];

      console.log("UPDATE DPR PAYLOAD", payload);

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
        alert("DPR updated successfully ✅");
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
                  <Text>{dprData?.actualDate}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={dprData?.dprLabour?.length > 0}
                onPress={() => setShow(true)}
                style={[styles.inputContainer]}
              >
                <Text style={styles.label}>Report Completion Date</Text>
                <View style={styles.input}>
                  <Text>{date.toLocaleDateString()}</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          <FlatList
            data={activityGroups}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderActivity}
          />

          {dprData?.currentDprStatus == "PENDING" && (
            <CustomButton
              text="Submit"
              buttonStyle={styles.buttonStyle}
              textStyle={styles.buttonTextStyle}
              handleAction={submitUpdateDpr}
            />
          )}

          {dprData?.currentDprStatus == "APPROVED" && (
            <CustomButton
              text="Update"
              buttonStyle={styles.buttonStyle}
              textStyle={styles.buttonTextStyle}
              handleAction={handleUpdateDpr}
            />
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
});

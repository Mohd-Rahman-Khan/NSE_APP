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

export default function AddOrchardDpr({ route }) {
  const navigation = useNavigation();
  const landData = route?.params?.landData;
  const draftData = route?.params?.draftData || null;

  const isDraftEdit =
    draftData?.currentDprStatus === "DRAFT" || draftData?.dprStatus === "DRAFT";

  const [loading, setLoading] = useState(false);
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
  const [errors, setErrors] = useState({});
  const [dprType, setdprType] = useState({ id: 1, name: "Indent Request" });
  const [noActivity, setnoActivity] = useState(false);
  const [remark, setremark] = useState("");

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

  useEffect(() => {
    if (draftData) {
      prefillDraftData(draftData);
    }
  }, [draftData]);
  useEffect(() => {
    getActivityList();
    getEquipmentList();
    fetchUserData();
  }, []);

  const prefillDraftData = (data) => {
    try {
      if (data?.planDate) {
        setDate(new Date(data.planDate));
      }

      const mappedEntries = [
        {
          id: data?.id,
          expanded: true,
          activities: data.activities.map((activity) => {
            const agricultures =
              data.dprAgricultures
                ?.filter((x) => x.activityId === activity.activityId)
                ?.map((ag) => ({
                  id: ag.id,
                  materialType: {
                    id: Date.now(),
                    name: ag.materialType,
                  },
                  material: {
                    id: ag.itemId,
                    itemCode: ag.itemCode,
                    itemName: ag.itemName,
                  },
                })) || [];

            const equipments =
              data.dprMechanicals
                ?.filter((x) => x.activityId === activity.activityId)
                ?.map((eq) => ({
                  id: eq.id,
                  equipment: {
                    id: eq.equipmentId,
                    assetGroupName: eq.equipmentName,
                  },
                  subGroup: {
                    id: eq.subGroupId,
                    assetSubGroupName: eq.subGroupName,
                  },
                  categoryId: eq.categoryId,
                  categoryName: eq.categoryName,
                  estHours: String(eq.estimatedHours || ""),
                  operatorRequired: eq.operatorRequired,
                })) || [];

            return {
              id: activity.id || Date.now(),

              activity: {
                id: activity.activityId,
                operationName: activity.activityName,
              },

              contractorType: {
                agreementType: activity.contractorType,
                name: activity.contractorType,
              },

              contractorName: {
                contractorId: activity.contractorId,
                name: activity.contractorName,
              },

              noOfLabour: String(activity.noOfLabour || ""),
              area: String(activity.area || ""),
              noOfIteration: String(activity.noOfIteration || ""),
              total: String(activity.totalOutput || ""),

              agricultures,
              equipments,
            };
          }),
        },
      ];

      if (mappedEntries[0].activities?.length == 0) {
        //console.log("mappedEntries", mappedEntries);
        setnoActivity(true);
      }
      setremark(data?.remarks || data?.remark || "");

      setEntries(mappedEntries);
    } catch (error) {
      console.log("Prefill Error", error);
    }
  };

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
          area: "",
          noOfIteration: "",
          total: "",

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
            area: "",
            noOfIteration: "",
            total: "",
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

  const buildUpdateDprPayload = (status) => {
    const planDate = formatDate(date);

    return [
      {
        id: draftData?.id,
        remarks: remark,
        planDate: draftData?.planDate || planDate,
        actualDate: planDate,

        chakId: draftData?.chakId,
        chakName: draftData?.chakName,

        farmBlockId: draftData?.farmBlockId,
        farmBlockName: draftData?.farmBlockName,

        engineeringId: draftData?.engineeringId,
        engineeringName: draftData?.engineeringName,

        farmPlanId: draftData?.farmPlanId,

        dprType: draftData?.dprType || "CROP",
        dprMechanicalSubmit: false,

        farmId: draftData?.farmId,
        farmName: draftData?.farmName,

        epoId: draftData?.epoId,
        epoName: draftData?.epoName,

        squareId: draftData?.squareId,
        squareName: draftData?.squareName,

        allowMultiple: draftData?.allowMultiple,

        dprStatus: status,
        currentDprStatus: status,

        activities: entries.flatMap((entry) =>
          entry.activities
            .filter((act) => act.activity)
            .map((act) => ({
              id: act.id, // existing activity id

              activityId: act.activity.id,
              activityName: act.activity.operationName,

              noOfLabour: Number(act.noOfLabour || 0),
              actualNoOfLabour: null,

              area: Number(act.area || 0),
              noOfIteration: Number(act.noOfIteration || 0),

              totalOutput: Number(act.total || 0),

              contractorType: act.contractorType?.agreementType || "",

              contractorId: act.contractorName?.contractorId || null,

              contractorName: act.contractorName?.name || "",
            })),
        ),

        dprAgricultures: entries.flatMap((entry) =>
          entry.activities.flatMap((act) =>
            act.agricultures
              .filter((ag) => ag.material && ag.materialType)
              .map((ag) => ({
                id: ag.id, // existing agriculture id

                activityId: act.activity.id,
                activityName: act.activity.operationName,

                itemCode: ag.material.itemCode,
                itemName: ag.material.itemName,
                itemId: ag.material.id,

                materialType: ag.materialType.name,
              })),
          ),
        ),

        dprMechanicals: entries.flatMap((entry) =>
          entry.activities.flatMap((act) =>
            act.equipments
              .filter((eq) => eq.equipment && eq.subGroup)
              .map((eq) => ({
                id: eq.id, // existing mechanical id

                equipmentId: eq.equipment.id,
                equipmentName: eq.equipment.assetGroupName,

                categoryId: eq.categoryId,
                categoryName: eq.categoryName,

                subGroupId: eq.subGroup.id,
                subGroupName: eq.subGroup.assetSubGroupName,

                estimatedHours: Number(eq.estHours || 0),

                actualHours: "",
                operatorRequired: eq.operatorRequired,

                operatorName: "",
                cpNumber: "",
                mechIdleHours: "",
                mechWalkingTime: "",
                outTime: "",
                inTime: "",

                activityId: act.activity.id,
                activityName: act.activity.operationName,
              })),
          ),
        ),

        dprLabour: [],
      },
    ];
  };

  const updateDpr = async (status) => {
    try {
      setLoading(true);

      const payload = buildUpdateDprPayload(status);

      console.log("🚀 UPDATE DPR PAYLOAD", payload);

      const encryptedPayload = encryptWholeObject(payload);

      const response = await apiRequest(
        API_ROUTES.DPR_UPDATE,
        "POST",
        encryptedPayload,
      );

      const decrypted = decryptAES(response);
      const parsed = JSON.parse(decrypted);
      console.log(parsed);

      if (parsed?.status === "SUCCESS") {
        showSuccessMessage("DPR updated successfully");
        navigation.goBack();
      } else {
        showErrorMessage(parsed?.message || "Update failed");
      }
    } catch (error) {
      console.log("Update DPR Error", error);
      showErrorMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ================= ACTIVITY ================= */
  // const addActivity = (entryId) => {
  //   setEntries((prev) =>
  //     prev.map((e) =>
  //       e.id === entryId
  //         ? {
  //             ...e,
  //             activities: [
  //               ...e.activities,
  //               {
  //                 id: Date.now(),
  //                 activity: null,
  //                 contractorType: null,
  //                 contractorName: null,
  //                 noOfLabour: "",
  //                 agricultures: [],
  //                 equipments: [],
  //               },
  //             ],
  //           }
  //         : e,
  //     ),
  //   );
  // };

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

  const getContractorName = async (
    id,
    agreementType = "ACTIVITY_WISE_CONTRACTOR",
  ) => {
    setLoading(true);
    try {
      const payloadData = {
        squareId: null,
        epoId: null,
        activityId: id,
        agreementType: agreementType,
      };
      const encryptPayloadData = encryptWholeObject(payloadData);
      const getContractorList = await apiRequest(
        API_ROUTES.CONTRACTOR,
        "POST",
        encryptPayloadData,
      );
      const decryptedContractorList = decryptAES(getContractorList);
      const parsedDecryptedContractorList = JSON.parse(decryptedContractorList);

      console.log("getContractorName", payloadData);

      console.log("getContractorName", parsedDecryptedContractorList);
      if (
        parsedDecryptedContractorList?.status === "SUCCESS" &&
        parsedDecryptedContractorList?.statusCode === "200"
      ) {
        setcontractorNameList(parsedDecryptedContractorList?.data || []);
      } else {
        setcontractorNameList([]);
        showErrorMessage("Unable to get the Contractor List.");
      }
    } catch (error) {
      console.log(error, "line error");
      showErrorMessage("Contractor not found.");
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
      showErrorMessage("Error fetching Subgroup data");
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
        //showErrorMessage("Unable to get the Subgroup List Data");
        setmaterialList([]);
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

  // const buildDprPayload = (status) => {
  //   const planDate = formatDate(date);

  //   return [
  //     {
  //       planDate,
  //       actualDate: planDate,

  //       chakId: String(userData?.chakId),
  //       chakName: userData?.chakName,

  //       farmId: String(landData?.farmId),
  //       farmName: landData?.farmName,

  //       farmBlockId: String(landData?.farmBlockId),
  //       farmBlockName: landData?.farmBlockName,
  //       allowMultiple: false,

  //       squareId: landData?.squareId,
  //       squareName: landData?.squareName,

  //       farmPlanId: landData?.planId || null,
  //       farmPlanCode: selectedPlan?.planCode || null,

  //       dprType: "CROP",
  //       dprStatus: status,
  //       currentDprStatus: status,
  //       dprMechanicalSubmit: false,

  //       /* ================= ACTIVITIES ================= */
  //       // activities: entries.flatMap((entry) =>
  //       //   entry.activities
  //       //     .filter((act) => act.activity)
  //       //     .map((act) => ({
  //       //       activityId: act.activity.id,
  //       //       activityName: act.activity.operationName,
  //       //       noOfLabour: Number(act.noOfLabour || 0),
  //       //       area: Number(act.area || 0),
  //       //       noOfIteration: Number(act.noOfIteration || 0),
  //       //       total: Number(act.total || 0),
  //       //       actualNoOfLabour: "",
  //       //       contractorType: act.contractorType?.agreementType,
  //       //       contractorId: act.contractorName?.contractorId,
  //       //       contractorName: act.contractorName?.name,
  //       //     })),
  //       // ),
  //       activities: entries.flatMap((entry) =>
  //         entry.activities
  //           .filter((act) => act.activity)
  //           .map((act) => ({
  //             activityId: act.activity.id,

  //             activityName: act.activity.operationName,

  //             noOfLabour: String(act.noOfLabour || ""),

  //             actualNoOfLabour: "",

  //             area: String(act.area || ""),

  //             noOfIteration: String(act.noOfIteration || ""),

  //             totalOutput: Number(act.total || 0).toFixed(2),

  //             contractorType: act.contractorType?.agreementType,

  //             contractorId: String(act.contractorName?.contractorId || ""),

  //             contractorName: act.contractorName?.name,
  //           })),
  //       ),

  //       // dprAgricultures: entries.flatMap((entry) =>
  //       //   entry.activities.flatMap((act) =>
  //       //     act.agricultures
  //       //       .filter((ag) => ag.material && ag.materialType)
  //       //       .map((ag) => ({
  //       //         activityId: act.activity.id,
  //       //         activityName: act.activity.operationName,
  //       //         itemCode: ag.material.itemCode,
  //       //         cashMemoDto: {
  //       //           materialType: ag.materialType.name,
  //       //           activityId: act.activity.id,
  //       //           activityName: act.activity.operationName,
  //       //           cashMemoItems: [],
  //       //         },
  //       //       })),
  //       //   ),
  //       // ),
  //       dprAgricultures: entries.flatMap((entry) =>
  //         entry.activities.flatMap((act) =>
  //           act.agricultures
  //             .filter((ag) => ag.material && ag.materialType)
  //             .map((ag) => ({
  //               activityId: act.activity.id,

  //               activityName: act.activity.operationName,

  //               itemCode: ag.material.itemCode,

  //               itemName: ag.material.itemName || "",

  //               itemId: ag.material.id,

  //               materialType: ag.materialType.name,
  //             })),
  //         ),
  //       ),

  //       /* ================= MECHANICAL ================= */
  //       dprMechanicals: entries.flatMap((entry) =>
  //         entry.activities.flatMap((act) =>
  //           act.equipments
  //             .filter((eq) => eq.equipment && eq.subGroup && eq.categoryId)
  //             .map((eq) => ({
  //               equipmentId: eq.equipment.id,
  //               equipmentName: eq.equipment.assetGroupName,
  //               categoryId: eq.categoryId,
  //               categoryName: eq.categoryName,
  //               subGroupId: eq.subGroup.id,
  //               subGroupName: eq.subGroup.assetSubGroupName,
  //               estimatedHours: eq.estHours,
  //               actualHours: "",
  //               operatorRequired: eq.operatorRequired,
  //               operatorName: "",
  //               cpNumber: "",
  //               mechIdleHours: "",
  //               mechWalkingTime: "",
  //               outTime: "",
  //               inTime: "",
  //               activityId: act.activity.id,
  //               activityName: act.activity.operationName,
  //             })),
  //         ),
  //       ),

  //       dprLabour: [],
  //       epoId: null,
  //       epoName: null,
  //     },
  //   ];
  // };

  const buildDprPayload = (status) => {
    const planDate = formatDate(date);

    return [
      {
        /* ================= BASIC ================= */

        planDate,
        actualDate: planDate,
        remarks: remark,

        chakId: String(userData?.chakId || ""),
        chakName: userData?.chakName || "",

        farmId: userData?.farmId,
        farmName: landData?.farmName || "",

        farmBlockId: String(landData?.farmBlockId || ""),
        farmBlockName: landData?.farmBlockName || "",

        engineeringId: String(landData?.plotId || ""),
        engineeringName: userData?.epoName || "",

        epoId: userData?.epoId,
        epoName: userData?.epoName,

        squareId: landData?.squareId || null,
        squareName: landData?.squareName || "",

        farmPlanId: landData?.planId || null,
        farmPlanCode: selectedPlan?.planCode || null,
        plotId: landData?.plotId,
        plotName: landData?.plotName,
        orchardId: landData?.orchidId,
        orchardName: landData?.orchidName,

        //allowMultiple: false,

        dprType: "ORCHARD",
        allowMultiple: true,

        dprStatus: status,
        currentDprStatus: status,

        dprMechanicalSubmit: false,

        /* ================= ACTIVITIES ================= */

        activities: entries.flatMap((entry) =>
          entry.activities
            .filter((act) => act.activity)
            .map((act) => ({
              activityId: act.activity.id,

              activityName: act.activity.operationName,

              noOfLabour: String(act.noOfLabour || ""),

              actualNoOfLabour: "",

              area: String(act.area || ""),

              noOfIteration: String(act.noOfIteration || ""),

              totalOutput: Number(act.total || 0).toFixed(3),

              contractorType: act.contractorType?.agreementType || "",

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

                itemName: ag.material.itemName || "",

                itemId: ag.material.id,

                materialType: ag.materialType.name,
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

                outTime: "",

                inTime: "",

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
  const validateForm = () => {
    let newErrors = {};

    entries.forEach((entry, ei) => {
      entry.activities.forEach((act, ai) => {
        if (!act.activity) {
          newErrors[`activity_${ei}_${ai}`] = "Activity is required";
        }

        if (!act.contractorType) {
          newErrors[`contractorType_${ei}_${ai}`] = "Contractor Type required";
        }

        // if (!act.contractorName) {
        //   newErrors[`contractorName_${ei}_${ai}`] = "Contractor Name required";
        // }

        if (!act.noOfLabour) {
          newErrors[`labour_${ei}_${ai}`] = "No of labour required";
        }

        act.agricultures.forEach((ag, agi) => {
          if (!ag.materialType) {
            newErrors[`materialType_${ei}_${ai}_${agi}`] =
              "Material Type required";
          }

          if (!ag.material) {
            newErrors[`material_${ei}_${ai}_${agi}`] = "Material Item required";
          }
        });

        act.equipments.forEach((eq, eqi) => {
          if (!eq.equipment) {
            newErrors[`equipment_${ei}_${ai}_${eqi}`] = "Equipment required";
          }

          if (!eq.subGroup) {
            newErrors[`subGroup_${ei}_${ai}_${eqi}`] = "SubGroup required";
          }

          if (!eq.categoryId) {
            newErrors[`category_${ei}_${ai}_${eqi}`] = "Category required";
          }

          if (!eq.estHours) {
            newErrors[`hours_${ei}_${ai}_${eqi}`] = "Estimated hours required";
          }
        });
      });
    });

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const submitDPR = async (status) => {
    if (!noActivity) {
      const valid = validateForm();

      if (!valid) {
        showErrorMessage("Please fill all required fields");
        return;
      }
    }

    try {
      setLoading(true);

      const payload = buildDprPayload(status);

      console.log("🚀 FINAL DPR PAYLOAD", JSON.stringify(payload, null, 2));

      const encryptedPayload = encryptWholeObject(payload);

      const response = await apiRequest(
        API_ROUTES.SAVE_DPR,
        "POST",
        encryptedPayload,
      );

      const decrypted = decryptAES(response);
      const parsed = JSON.parse(decrypted);

      console.log("✅ DPR SAVE RESPONSE", parsed);

      if (parsed?.status === "SUCCESS") {
        showSuccessMessage("DPR submitted successfully ✅");
        navigation.goBack();
      } else {
        showErrorMessage(parsed?.message || "DPR submit failed");
      }
    } catch (error) {
      console.log("❌ Submit DPR Error", error);
      showErrorMessage("Something went wrong while submitting DPR");
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterialList = async (item) => {
    setLoading(true);
    //console.log("parsedDecryptedMaterialList", userData);
    try {
      // const payloadData = {
      //   inventoryType: "RUNNING",
      //   materialType: item?.materialType,
      //   unitType: userData?.unitType,
      //   farmId: String(landData?.farmId),
      //   aoId: userData?.aoId,
      //   roId: userData?.roId,
      //   farmBlockId: String(landData?.farmBlockId),
      //   subUnitId: String(landData?.farmId),
      //   subUnitName: "",
      //   subUnitType: "FARM_BLOCK",
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
      //console.log("parsedDecryptedMaterialList", payloadData);
      //return;
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
      //showErrorMessage("Error fetching dropdown data");
    } finally {
      setLoading(false);
    }
  };
  const formatDateInMDY = (isoString) => {
    const date = new Date(isoString);
    return `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}-${date.getFullYear()}`;
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
      <InnerHeader title={`Plot: ${landData?.plotName}`} />
      {showMaterialModal && (
        <Modal visible={showMaterialModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {/* HEADER */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {materialTableData?.length > 0
                    ? "Select Materials"
                    : "No materials available"}
                </Text>
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
              {/* <View style={styles.modalFooter}>
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
              </View> */}
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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView style={{ padding: 10 }}>
          <DropDown
            disabled
            label="Select Type"
            data={[
              { id: 1, name: "Indent Request" },
              { id: 2, name: "DPR" },
            ]}
            value={dprType?.name || ""}
            selectItem={(item) => {
              setdprType(item);
            }}
          />
          {!draftData && !noActivity && (
            <View style={[styles.switchRow, { marginBottom: 20 }]}>
              <Text style={styles.label}>No Activity</Text>
              <Switch
                value={noActivity}
                onValueChange={(v) => {
                  setnoActivity(v);
                }}
              />
            </View>
          )}

          {!noActivity ? (
            <>
              {/* ADD ENTRY */}

              <TouchableOpacity style={styles.addEntryBtn} onPress={addEntry}>
                <Icon name="add" size={24} color="#fff" />
                <Text style={styles.addEntryText}>Add Activity</Text>
              </TouchableOpacity>

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
                  {/* <View style={styles.inputContainer}>
                <Text style={styles.label}>Plan Id</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={landData?.planId}
                  editable={false}
                />
              </View> */}

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
                  <TouchableOpacity disabled style={styles.inputContainer}>
                    <Text style={styles.label}>Plot</Text>
                    <View style={styles.input}>
                      <Text>{landData?.plotName}</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShow(true)}
                    style={styles.inputContainer}
                  >
                    <Text style={styles.label}>Report Date</Text>
                    <View style={styles.input}>
                      {/* <Text>{date.toLocaleDateString()}</Text> */}
                      <Text>{formatDateInMDY(date)}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {entries.map((entry, ei) => (
                <View key={entry.id} style={styles.entryCard}>
                  {entry?.activities?.length > 0 && (
                    <View style={styles.entryHeader}>
                      <TouchableOpacity
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          flex: 1,
                        }}
                        onPress={() => toggleEntry(entry.id)}
                      >
                        <Text style={styles.entryTitle}>
                          Activity #{ei + 1}
                        </Text>
                      </TouchableOpacity>

                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
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
                  )}

                  {entry.expanded &&
                    entry.activities.map((act, ai) => (
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
                            setErrors((prev) => {
                              const copy = { ...prev };
                              delete copy[`activity_${ei}_${ai}`];
                              return copy;
                            });
                          }}
                          containerStyle={[
                            errors[`activity_${ei}_${ai}`] && {
                              borderColor: "red",
                              borderWidth: 1,
                            },
                          ]}
                        />
                        {errors[`activity_${ei}_${ai}`] && (
                          <Text style={styles.dropdownErrorMessageText}>
                            {errors[`activity_${ei}_${ai}`]}
                          </Text>
                        )}

                        <DropDown
                          label="Contractor Type"
                          data={contractorTypeList}
                          value={act.contractorType?.name || ""}
                          selectItem={(item) => {
                            updateActivity(entry.id, act.id, (a) => ({
                              ...a,
                              contractorType: item,
                              contractorName: null,
                            }));
                            if (act?.activity?.id) {
                              getContractorName(
                                act.activity.id,
                                item.agreementType,
                              );
                            }
                            setErrors((prev) => {
                              const copy = { ...prev };
                              delete copy[`contractorType_${ei}_${ai}`];
                              return copy;
                            });
                          }}
                          containerStyle={[
                            errors[`contractorType_${ei}_${ai}`] && {
                              borderColor: "red",
                              borderWidth: 1,
                            },
                          ]}
                        />
                        {errors[`contractorType_${ei}_${ai}`] && (
                          <Text style={styles.dropdownErrorMessageText}>
                            {errors[`contractorType_${ei}_${ai}`]}
                          </Text>
                        )}

                        <DropDown
                          fieldName="name"
                          label="Contractor Name"
                          data={contractorNameList}
                          value={act.contractorName?.name || ""}
                          selectItem={(item) => {
                            updateActivity(entry.id, act.id, (a) => ({
                              ...a,
                              contractorName: item,
                            }));
                            setErrors((prev) => {
                              const copy = { ...prev };
                              delete copy[`contractorName_${ei}_${ai}`];
                              return copy;
                            });
                          }}
                          containerStyle={[
                            errors[`contractorName_${ei}_${ai}`] && {
                              borderColor: "red",
                              borderWidth: 1,
                            },
                          ]}
                        />
                        {errors[`contractorName_${ei}_${ai}`] && (
                          <Text style={styles.dropdownErrorMessageText}>
                            {errors[`contractorName_${ei}_${ai}`]}
                          </Text>
                        )}

                        <View style={styles.inputContainer}>
                          <Text style={styles.label}>No of Labour</Text>
                          <TextInput
                            style={[
                              styles.input,
                              errors[`labour_${ei}_${ai}`] && {
                                borderColor: "red",
                              },
                            ]}
                            placeholder="No of Labour"
                            keyboardType="number-pad"
                            value={act.noOfLabour}
                            maxLength={4}
                            onChangeText={(v) => {
                              const numericValue = v.replace(/[^0-9]/g, "");
                              updateActivity(entry.id, act.id, (a) => ({
                                ...a,
                                noOfLabour: numericValue,
                              }));
                              setErrors((prev) => {
                                const copy = { ...prev };
                                delete copy[`labour_${ei}_${ai}`];
                                return copy;
                              });
                            }}
                          />
                          {errors[`labour_${ei}_${ai}`] && (
                            <Text style={styles.textInputErrorText}>
                              {errors[`labour_${ei}_${ai}`]}
                            </Text>
                          )}
                        </View>
                        <View style={{ flexDirection: "row", gap: 10 }}>
                          {/* AREA */}
                          <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Area</Text>

                            <TextInput
                              style={styles.input}
                              placeholder="Area"
                              keyboardType="numeric"
                              value={act.area}
                              onChangeText={(v) => {
                                if (/^\d*\.?\d{0,2}$/.test(v)) {
                                  const total =
                                    Number(v || 0) *
                                    Number(act.noOfIteration || 0);

                                  updateActivity(entry.id, act.id, (a) => ({
                                    ...a,
                                    area: v,
                                    total: total.toString(),
                                  }));
                                }
                              }}
                            />
                          </View>

                          {/* NO OF ITERATION */}
                          <View style={{ flex: 1 }}>
                            <Text style={styles.label}>No. of Iteration</Text>

                            <TextInput
                              maxLength={3}
                              style={styles.input}
                              placeholder="0"
                              keyboardType="number-pad"
                              value={act.noOfIteration}
                              onChangeText={(v) => {
                                const numericValue = v.replace(/[^0-9]/g, "");
                                const total =
                                  Number(act.area || 0) *
                                  Number(numericValue || 0);

                                updateActivity(entry.id, act.id, (a) => ({
                                  ...a,
                                  noOfIteration: numericValue,
                                  total: total.toString(),
                                }));
                              }}
                            />
                          </View>
                        </View>

                        {/* TOTAL */}
                        <View style={styles.inputContainer}>
                          <Text style={styles.label}>Total Output</Text>

                          <TextInput
                            style={[
                              styles.input,
                              { backgroundColor: "#f3f3f3" },
                            ]}
                            value={act.total}
                            editable={false}
                            placeholder="Total"
                          />
                        </View>

                        {/* AGRICULTURE */}
                        <View style={styles.sectionHeader}>
                          <Text style={styles.sectionTitle}>
                            Agriculture Inputs
                          </Text>
                          <TouchableOpacity
                            onPress={() => addAgriculture(entry.id, act.id)}
                            style={styles.addNewButton}
                          >
                            <Text style={styles.addText}>+ Add</Text>
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
                                setErrors((prev) => {
                                  const copy = { ...prev };
                                  delete copy[
                                    `materialType_${ei}_${ai}_${index}`
                                  ];
                                  return copy;
                                });
                              }}
                              containerStyle={[
                                errors[`materialType_${ei}_${ai}_${index}`] && {
                                  borderColor: "red",
                                  borderWidth: 1,
                                },
                              ]}
                            />
                            {errors[`materialType_${ei}_${ai}_${index}`] && (
                              <Text style={styles.dropdownErrorMessageText}>
                                {errors[`materialType_${ei}_${ai}_${index}`]}
                              </Text>
                            )}

                            <DropDown
                              label="Item"
                              data={materialList}
                              value={ag.material?.itemName || ""}
                              selectItem={(item) => {
                                fetchMaterialList(item);
                                updateActivity(entry.id, act.id, (a) => ({
                                  ...a,
                                  agricultures: a.agricultures.map((x) =>
                                    x.id === ag.id
                                      ? { ...x, material: item }
                                      : x,
                                  ),
                                }));
                                setErrors((prev) => {
                                  const copy = { ...prev };
                                  delete copy[`material_${ei}_${ai}_${index}`];
                                  return copy;
                                });
                              }}
                              containerStyle={[
                                errors[`material_${ei}_${ai}_${index}`] && {
                                  borderColor: "red",
                                  borderWidth: 1,
                                },
                              ]}
                            />
                            {errors[`material_${ei}_${ai}_${index}`] && (
                              <Text style={styles.dropdownErrorMessageText}>
                                {errors[`material_${ei}_${ai}_${index}`]}
                              </Text>
                            )}
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
                          <View style={{ width: "70%" }}>
                            <Text style={styles.sectionTitle}>
                              Equipment & Mechanical Details
                            </Text>
                          </View>
                          <View style={{ width: "25%" }}>
                            <TouchableOpacity
                              onPress={() => addEquipment(entry.id, act.id)}
                              style={styles.addNewButton}
                            >
                              <Text style={styles.addText}>+ Add</Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        {act.equipments.map((eq, eqi) => (
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
                                  S.N. {eqi + 1}
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
                                label="Group"
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
                                  setErrors((prev) => {
                                    const copy = { ...prev };
                                    delete copy[`equipment_${ei}_${ai}_${eqi}`];
                                    return copy;
                                  });
                                }}
                                containerStyle={[
                                  errors[`equipment_${ei}_${ai}_${eqi}`] && {
                                    borderColor: "red",
                                    borderWidth: 1,
                                  },
                                ]}
                              />
                              {errors[`equipment_${ei}_${ai}_${eqi}`] && (
                                <Text style={styles.dropdownErrorMessageText}>
                                  {errors[`equipment_${ei}_${ai}_${eqi}`]}
                                </Text>
                              )}

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
                                  setErrors((prev) => {
                                    const copy = { ...prev };
                                    delete copy[`subGroup_${ei}_${ai}_${eqi}`];
                                    return copy;
                                  });
                                }}
                                containerStyle={[
                                  errors[`subGroup_${ei}_${ai}_${eqi}`] && {
                                    borderColor: "red",
                                    borderWidth: 1,
                                  },
                                ]}
                              />
                              {errors[`subGroup_${ei}_${ai}_${eqi}`] && (
                                <Text style={styles.dropdownErrorMessageText}>
                                  {errors[`subGroup_${ei}_${ai}_${eqi}`]}
                                </Text>
                              )}

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
                                            categoryName:
                                              item.assetCategoryName,
                                          }
                                        : x,
                                    ),
                                  }));
                                  setErrors((prev) => {
                                    const copy = { ...prev };
                                    delete copy[`category_${ei}_${ai}_${eqi}`];
                                    return copy;
                                  });
                                }}
                                containerStyle={[
                                  errors[`category_${ei}_${ai}_${eqi}`] && {
                                    borderColor: "red",
                                    borderWidth: 1,
                                  },
                                ]}
                              />
                              {errors[`category_${ei}_${ai}_${eqi}`] && (
                                <Text style={styles.dropdownErrorMessageText}>
                                  {errors[`category_${ei}_${ai}_${eqi}`]}
                                </Text>
                              )}

                              <View style={styles.inputContainer}>
                                <Text style={styles.label}>
                                  Estimated Hours
                                </Text>
                                <TextInput
                                  style={[
                                    styles.input,
                                    errors[`hours_${ei}_${ai}_${eqi}`] && {
                                      borderColor: "red",
                                    },
                                  ]}
                                  placeholder="Estimated Hours"
                                  value={eq.estHours}
                                  keyboardType="decimal-pad"
                                  // onChangeText={(v) => {
                                  //   setErrors((prev) => {
                                  //     const copy = { ...prev };
                                  //     delete copy[`hours_${ei}_${ai}_${eqi}`];
                                  //     return copy;
                                  //   });
                                  //   updateActivity(entry.id, act.id, (a) => ({
                                  //     ...a,
                                  //     equipments: a.equipments.map((x) =>
                                  //       x.id === eq.id
                                  //         ? { ...x, estHours: v }
                                  //         : x,
                                  //     ),
                                  //   }));
                                  // }}
                                  onChangeText={(v) => {
                                    if (/^\d*\.?\d{0,2}$/.test(v)) {
                                      setErrors((prev) => {
                                        const copy = { ...prev };
                                        delete copy[`hours_${ei}_${ai}_${eqi}`];
                                        return copy;
                                      });

                                      updateActivity(entry.id, act.id, (a) => ({
                                        ...a,
                                        equipments: a.equipments.map((x) =>
                                          x.id === eq.id
                                            ? { ...x, estHours: v }
                                            : x,
                                        ),
                                      }));
                                    }
                                  }}
                                />
                                {errors[`hours_${ei}_${ai}_${eqi}`] && (
                                  <Text style={styles.textInputErrorText}>
                                    {errors[`hours_${ei}_${ai}_${eqi}`]}
                                  </Text>
                                )}
                              </View>

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
            </>
          ) : (
            <>
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
                  <TouchableOpacity
                    onPress={() => setShow(true)}
                    style={styles.inputContainer}
                  >
                    <Text style={styles.label}>Report Date</Text>
                    <View style={styles.input}>
                      {/* <Text>{date.toLocaleDateString()}</Text> */}
                      <Text>{formatDateInMDY(date)}</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity disabled style={styles.inputContainer}>
                    <Text style={styles.label}>Plot</Text>
                    <View style={styles.input}>
                      <Text>{landData?.plotName}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={[styles.inputContainer, { marginTop: 20 }]}>
                <Text style={styles.label}>Remark</Text>
                <TextInput
                  style={[styles.input]}
                  placeholder="Remark"
                  value={remark}
                  onChangeText={(v) => {
                    setremark(v);
                  }}
                />
              </View>
              {/* {!draftData && (
                <View style={[styles.inputContainer, { marginTop: 20 }]}>
                  <Text style={styles.label}>Remark</Text>
                  <TextInput
                    style={[styles.input]}
                    placeholder="Remark"
                    value={remark}
                    onChangeText={(v) => {
                      setremark(v);
                    }}
                  />
                </View>
              )} */}
            </>
          )}

          {!draftData && (
            <>
              <TouchableOpacity
                style={[styles.submitBtn, { marginBottom: 0 }]}
                onPress={() => {
                  submitDPR("PENDING");
                }}
              >
                <Text style={styles.addEntryText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn]}
                onPress={() => {
                  submitDPR("DRAFT");
                }}
              >
                <Text style={styles.addEntryText}>Save As Draft</Text>
              </TouchableOpacity>
            </>
          )}

          {draftData &&
            userData?.unitType == "EPO" &&
            draftData?.dprStatus == "PENDING" && (
              <TouchableOpacity
                style={[styles.submitBtn, { marginBottom: 30 }]}
                onPress={() => {
                  updateDpr("PENDING");
                }}
              >
                <Text style={styles.addEntryText}>Update</Text>
              </TouchableOpacity>
            )}

          {draftData && draftData?.dprStatus == "DRAFT" && (
            <>
              <TouchableOpacity
                style={[styles.submitBtn, { marginBottom: 0 }]}
                onPress={() => {
                  updateDpr("PENDING");
                }}
              >
                <Text style={styles.addEntryText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn]}
                onPress={() => {
                  updateDpr("DRAFT");
                }}
              >
                <Text style={styles.addEntryText}>Save As Draft</Text>
              </TouchableOpacity>
            </>
          )}
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
    marginTop: 15,
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
  addNewButton: {
    borderWidth: 1,
    borderColor: Colors.greenColor,
    padding: 5,
    borderRadius: 5,
  },
  addText: { color: Colors.greenColor, fontWeight: "bold" },

  rowBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    marginVertical: 6,
    borderRadius: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: Colors.disableFieldColor,
    //backgroundColor: Colors.disableFieldColor,
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
    marginBottom: 10,
  },
  selectMaterialBtn: {
    alignItems: "flex-end",
  },
  selectMaterialText: {
    //borderWidth: 1,
    padding: 5,
    borderRadius: 5,
    color: Colors.greenColor,
    fontWeight: "bold",
  },
  dropdownErrorMessageText: {
    color: "red",
    fontSize: 12,
    marginTop: -10,
    marginLeft: 5,
    marginBottom: 10,
  },
  textInputErrorText: {
    color: "red",
    fontSize: 12,
    marginTop: -3,
    marginLeft: 8,
    marginBottom: 10,
  },
});

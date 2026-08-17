import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Animated,
  TextInput,
  Image,
  Alert,
} from "react-native";
import WrapperContainer from "../../utils/WrapperContainer";
import CustomHeader from "../../components/CustomHeader";
import { getUserData, removeUserData } from "../../utils/Storage";
import { decryptAES, encryptWholeObject } from "../../utils/decryptData";
import { apiRequest } from "../../services/APIRequest";
import { API_ROUTES } from "../../services/APIRoutes";
import {
  showErrorMessage,
  showSuccessMessage,
} from "../../utils/HelperFunction";
import { useDispatch } from "react-redux";
import { useIsFocused } from "@react-navigation/native";
import { clearUserData } from "../../redux/slice/UserSlice";
import {
  height,
  moderateScale,
  moderateScaleVertical,
  scale,
  textScale,
  width,
} from "../../utils/responsiveSize";
import CustomBottomSheet from "../../components/CustomBottomSheet";
import CustomButton from "../../components/CustomButton";
import Colors from "../../utils/Colors";
import FontFamily from "../../utils/FontFamily";
import DropDown from "../../components/DropDown";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { BarChart } from "react-native-gifted-charts";
import PlanListComp from "./PlanListComp";
import RejectedPlanList from "./RejectedPlanList";
import en from "../../constants/en";
import AnimatedNumbers from "react-native-animated-numbers";
import ProductionFilterComp from "./ProductionFilterComp";
import { PieChart } from "react-native-gifted-charts";
import { getCurrentFinancialYearObj } from "../../utils/getCurrentFinancialYearObj";
import ImagePath from "../../utils/ImagePath";
import InventoryDashboard from "./InventoryDashboard";
import FarmDashboard from "./FarmDashboard";

const screenWidth = Dimensions.get("window").width;

export default function Home({ navigation }) {
  const [selectedTab, setSelectedTab] = useState("Production");
  const [userData, setUserData] = useState("");
  const [loading, setLoading] = useState(false);
  const [showFilterSheet, setshowFilterSheet] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [unit, setUnit] = useState(null);
  const [crop, setCrop] = useState(null);
  const [unitType, setunitType] = useState(null);
  const [selectedQC, setselectedQC] = useState({ id: 1, name: "SSCA Seed" });
  const [totalSaleByMonth, setTotalSaleByMonth] = useState([]);
  const [dashbooardData, setdashbooardData] = useState({});
  const [graphData, setGraphData] = useState({});
  const [planDetailsList, setPlanDetailsList] = useState([]);
  const [qcDashboardData, setqcDashboardData] = useState("");
  const [marketingDashData, setmarketingDashData] = useState();
  const [topDealer, settopDealer] = useState([]);
  const [financialYear, setfinancialYear] = useState([]);
  const [season, setseason] = useState([]);
  const [selectedSlice, setSelectedSlice] = useState(null);
  const [qcComplaintList, setqcComplaintList] = useState([]);
  const [godownData, setgodownData] = useState("");
  const [availableSeed, setavailableSeed] = useState("");
  const [expireSeeds, setexpireSeeds] = useState("");
  const [condemnSeeds, setcondemnSeeds] = useState("");
  const [regionalOffice, setregionalOffice] = useState([]);
  const [selectedRegional, setselectedRegional] = useState("");
  const [cropListData, setCropListData] = useState([]);
  const [selectedCrop, setselectedCrop] = useState("");
  const [selectedClass, setselectedClass] = useState("");
  const [selectedSeedType, setselectedSeedType] = useState("");
  const [seedVariety, setseedVariety] = useState([]);
  const [selectedSeedVariety, setselectedSeedVariety] = useState("");
  const [areaOffice, setareaOffice] = useState([]);
  const [selectedAreaOffice, setselectedAreaOffice] = useState("");
  const [farmList, setfarmList] = useState([]);
  const [selectedFarm, setselectedFarm] = useState("");
  const [farmExecutiveData, setFarmExecutiveData] = useState({});
  const [farmActivities, setFarmActivities] = useState([]);
  const [farmYieldData, setFarmYieldData] = useState([]);
  const [farmProductionSummary, setFarmProductionSummary] = useState({});
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fethchUserprofileData();
    }
  }, [isFocused]);

  useEffect(() => {
    if (userData) {
      switch (selectedTab) {
        case "Production":
          if (financialYear?.length > 0) {
            getProductionDashboardSummary();
            getProductionGraphData();
            getProductionPlanDetail();
          }

          break;

        case "Marketing":
          getMarketingData();
          getTopDealer();
          getTotalSalesByMonth();
          break;

        case "Inventory":
          getGodownCount();
          getAvailableSeed();
          getExpSeeds();
          getCondemnSeeds();
          getRegionalOffice();
          getCropList();
          getFarmList();
          break;

        case "QC":
          getQCData();
          getComplaintDashboardData();
          break;
        case "Farm":
          getFarmExecutiveSummary();
          getFarmActivities();
          getYieldComparison();
          getFarmProductionSummary();
          break;

        default:
          break;
      }
    }
  }, [selectedTab, userData, financialYear]);
  useEffect(() => {
    getFinacialYears();
    getSeasonList();
  }, []);

  useEffect(() => {
    if (userData) {
      const tabs = getTabsByRole();

      if (tabs.length > 0) {
        setSelectedTab(tabs[0]); // first allowed tab
      }
    }
  }, [userData]);
  const getFinacialYears = async () => {
    try {
      const payloadData = {};
      const encryptedPayload = encryptWholeObject(payloadData);
      const response = await apiRequest(
        API_ROUTES.FINANCIAL_YEAR,
        "post",
        encryptedPayload,
      );
      const decrypted = decryptAES(response);
      const parsedDecrypted = JSON.parse(decrypted);
      console.log("getFinacialYears", parsedDecrypted);

      if (
        parsedDecrypted &&
        (parsedDecrypted?.statusCode === "200" ||
          parsedDecrypted?.statusCode === "201")
      ) {
        setfinancialYear(parsedDecrypted?.data);
      } else {
        showErrorMessage(parsedDecrypted?.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error, "line error");
      showErrorMessage("something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const getSeasonList = async () => {
    try {
      const payloadData = {};
      const encryptedPayload = encryptWholeObject(payloadData);
      const response = await apiRequest(
        API_ROUTES.SEASON_MASTER_DD,
        "post",
        encryptedPayload,
      );
      const decrypted = decryptAES(response);
      const parsedDecrypted = JSON.parse(decrypted);

      if (
        parsedDecrypted &&
        (parsedDecrypted?.statusCode === "200" ||
          parsedDecrypted?.statusCode === "201")
      ) {
        setseason(parsedDecrypted?.data);
      } else {
        showErrorMessage(parsedDecrypted?.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error, "line error");
      showErrorMessage("something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getMarketingData = async (filter = {}) => {
    setLoading(true);
    try {
      const payloadData = {
        unit: {
          unitId: userData?.unitId,
          unitName: userData?.unitName,
        },
        unitType: userData?.unitType,
        startDate: filter.startDate || formatDate(fromDate),
        endDate: filter.endDate || formatDate(toDate),
      };

      console.log("getMarketingData", payloadData);

      const encryptedPayload = encryptWholeObject(payloadData);

      const response = await apiRequest(
        API_ROUTES.INVENTORY_DASHBOARD,
        "post",
        encryptedPayload,
      );

      const decrypted = decryptAES(response);
      const parsedDecrypted = JSON.parse(decrypted);
      console.log("getMarketingData", parsedDecrypted);

      if (
        parsedDecrypted &&
        (parsedDecrypted?.statusCode === "200" ||
          parsedDecrypted?.statusCode === "201")
      ) {
        setmarketingDashData(parsedDecrypted?.data);
      } else {
        showErrorMessage(parsedDecrypted?.message || "Something went wrong");
      }
    } catch (error) {
      showErrorMessage("something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const getTopDealer = async (filter = {}) => {
    setLoading(true);
    try {
      const payloadData = {
        startDate: filter.startDate || formatDate(fromDate),
        endDate: filter.endDate || formatDate(toDate),
        hoId: userData?.hoId,
        aoId: [userData?.aoId],
        roId: [userData?.roId],
      };

      const encryptedPayload = encryptWholeObject(payloadData);

      const response = await apiRequest(
        API_ROUTES.TOP_DEALER,
        "post",
        encryptedPayload,
      );

      const decrypted = decryptAES(response);
      const parsedDecrypted = JSON.parse(decrypted);

      console.log("getTopDealer payload", payloadData);

      if (
        parsedDecrypted &&
        (parsedDecrypted?.statusCode === "200" ||
          parsedDecrypted?.statusCode === "201")
      ) {
        settopDealer(parsedDecrypted?.data || []);
      } else {
        showErrorMessage(parsedDecrypted?.message || "Something went wrong");
      }
    } catch (error) {
      showErrorMessage("something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getTotalSalesByMonth = async () => {
    setLoading(true);
    try {
      const payloadData = {
        unit: {
          unitId: userData?.unitId,
          unitName: userData?.unitName,
        },
        unitType: userData?.unitType,
      };
      const encryptedPayload = encryptWholeObject(payloadData);
      const response = await apiRequest(
        API_ROUTES.TOTAL_SALES_BY_MONTH,
        "post",
        encryptedPayload,
      );
      const decrypted = decryptAES(response);
      const parsedDecrypted = JSON.parse(decrypted);
      console.log("getTotalSalesByMonth", payloadData);
      console.log("getTotalSalesByMonth", parsedDecrypted);

      if (
        parsedDecrypted &&
        (parsedDecrypted?.statusCode === "200" ||
          parsedDecrypted?.statusCode === "201")
      ) {
        setTotalSaleByMonth(parsedDecrypted?.data);
      } else {
        showErrorMessage(parsedDecrypted?.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error, "line error");
      showErrorMessage("something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getQCData = async () => {
    setLoading(true);
    try {
      let url = API_ROUTES.QC_DASHBOARD_DATA;
      const payloadData = {
        roId: userData?.roId,
        aoId: userData?.aoId,
        toUnitId: userData?.labId,
        // startDate: "string",
        // endDate: "string",
        // cropId: 9007199254740991,
        // varietyId: 9007199254740991,
        // labType: "string",
      };
      const encryptedPayload = encryptWholeObject(payloadData);
      const response = await apiRequest(url, "post", encryptedPayload);
      const decrypted = decryptAES(response);
      const parsedDecrypted = JSON.parse(decrypted);
      console.log("getQCData", payloadData);
      console.log("getQCData", parsedDecrypted);
      if (
        parsedDecrypted &&
        (parsedDecrypted?.statusCode === "200" ||
          parsedDecrypted?.statusCode === "201")
      ) {
        setqcDashboardData(parsedDecrypted?.data);
      } else {
        showErrorMessage(parsedDecrypted?.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error, "line error");
      showErrorMessage("something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getComplaintDashboardData = async () => {
    setLoading(true);
    try {
      let url = API_ROUTES.QC_COMPLAINT_DASHBOARD;
      const payloadData = {
        roId: userData?.roId,
        aoId: userData?.aoId,
        //cropId: 9007199254740991,
        //varietyId: 9007199254740991,
        // startDate: "2026-04-27",
        // endDate: "2026-04-27",
      };
      const encryptedPayload = encryptWholeObject(payloadData);
      const response = await apiRequest(url, "post", encryptedPayload);
      const decrypted = decryptAES(response);
      const parsedDecrypted = JSON.parse(decrypted);
      console.log("getComplaintDashboardData", payloadData);
      console.log("getComplaintDashboardData", parsedDecrypted);
      if (
        parsedDecrypted &&
        (parsedDecrypted?.statusCode === "200" ||
          parsedDecrypted?.statusCode === "201")
      ) {
        setqcComplaintList(parsedDecrypted?.data);
      } else {
        showErrorMessage(parsedDecrypted?.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error, "line error");
      showErrorMessage("something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getFarmExecutiveSummary = async (filter = {}) => {
    try {
      setLoading(true);

      const payloadData = {
        roId: userData?.roId,
        aoId: userData?.aoId,
        farmId: userData?.farmId,
        unitId: userData?.unitId,
        unitType: userData?.unitType,
        hoId: userData?.hoId,
        farmBlockId: userData?.farmBlockId,
        unitName: userData?.unitName,
        unit: {
          unitId: userData?.unitId,
          unitName: userData?.unitName,
        },
        startDate: fromDate,
        endDate: toDate,
      };

      console.log("Farm Executive Summary Payload =>", payloadData);

      const encryptedPayload = encryptWholeObject(payloadData);

      const response = await apiRequest(
        API_ROUTES.FARM_EXECUTIVE_SUMMARY,
        "post",
        encryptedPayload,
      );

      const decrypted = decryptAES(response);

      const parsedDecrypted = JSON.parse(decrypted);

      console.log("Farm Executive Summary Response =>", parsedDecrypted);

      const result = parsedDecrypted?.data || {};

      console.log("Farm Executive Final Data =>", result);

      setFarmExecutiveData(result);
    } catch (error) {
      console.log("Farm Executive Summary Error =>", error);

      setFarmExecutiveData({});
    } finally {
      setLoading(false);
    }
  };
  const getFarmActivities = async (filter = {}) => {
    try {
      setLoading(true);

      const payloadData = {
        roId: userData?.roId,
        aoId: userData?.aoId,
        farmId: userData?.farmId,
        unitId: userData?.unitId,
        unitType: userData?.unitType,
        ...filter,
      };

      console.log("Farm Activities Payload =>", payloadData);

      const encryptedPayload = encryptWholeObject(payloadData);

      const response = await apiRequest(
        API_ROUTES.FARM_ACTIVITIES,
        "post",
        encryptedPayload,
      );

      const decrypted = decryptAES(response);

      const parsedDecrypted = JSON.parse(decrypted);

      console.log("Farm Activities Response =>", parsedDecrypted);

      const result = parsedDecrypted?.data || {};

      console.log("Farm Activities Final Data =>", result);

      setFarmActivities(result?.activities || []);
    } catch (error) {
      console.log("Farm Activities Error =>", error);

      setFarmActivities([]);
    } finally {
      setLoading(false);
    }
  };
  const getYieldComparison = async (filter = {}) => {
    try {
      setLoading(true);

      const payloadData = {
        roId: userData?.roId,
        aoId: userData?.aoId,
        farmId: userData?.farmId,
        unitId: userData?.unitId,
        unitType: userData?.unitType,
        hoId: userData?.hoId,
        ...filter,
      };

      console.log("Farm Activities Payload =>", payloadData);

      const encryptedPayload = encryptWholeObject(payloadData);

      const response = await apiRequest(
        API_ROUTES.YIELD_COMPARISON,
        "post",
        encryptedPayload,
      );

      const decrypted = decryptAES(response);

      const parsedDecrypted = JSON.parse(decrypted);

      console.log("Farm Activities Response =>", parsedDecrypted);

      const result = parsedDecrypted?.data || [];

      console.log("Farm Activities Final Data =>", result);

      setFarmYieldData(result || []);
    } catch (error) {
      console.log("Farm Activities Error =>", error);

      setFarmYieldData([]);
    } finally {
      setLoading(false);
    }
  };
  const getFarmProductionSummary = async (filter = {}) => {
    try {
      setLoading(true);

      const payloadData = {
        roId: userData?.roId,
        aoId: userData?.aoId,
        farmId: userData?.farmId,
        unitId: userData?.unitId,
        unitType: userData?.unitType,
        hoId: userData?.hoId,
        ...filter,
      };

      console.log("Farm Activities Payload =>", payloadData);

      const encryptedPayload = encryptWholeObject(payloadData);

      const response = await apiRequest(
        API_ROUTES.FARM_PRODUCTION_SUMMARY,
        "post",
        encryptedPayload,
      );

      const decrypted = decryptAES(response);

      const parsedDecrypted = JSON.parse(decrypted);

      console.log("Farm Production Summary Response =>", parsedDecrypted);

      const result = parsedDecrypted?.data || {};

      console.log("Farm Production Summary Data =>", result);

      setFarmProductionSummary(result || []);
    } catch (error) {
      console.log("Farm Production Summary Error =>", error);

      setFarmProductionSummary([]);
    } finally {
      setLoading(false);
    }
  };

  const applyInventoryFilter = () => {
    const payload = {
      roId: selectedRegional?.id || null,
      roName: selectedRegional?.name || "",
      aoId:
        unitType?.value === "AREA OFFICE" ? selectedAreaOffice?.id || "" : "",
      aoName:
        unitType?.value === "AREA OFFICE" ? selectedAreaOffice?.name || "" : "",
      farmId: unitType?.value === "FARM" ? selectedFarm?.id || "" : "",
      farmName: unitType?.value === "FARM" ? selectedFarm?.name || "" : "",
      unitType: userData?.unitType,
      cropId: selectedCrop?.id || null,
      cropName: selectedCrop?.seedCropName,
      varietyId: selectedSeedVariety?.id || null,
      cropClass: selectedClass?.value || null,
      materialType: selectedCrop?.cropGroupName,
      inventoryType: "MAIN",
      itemStatus: selectedSeedType?.value,
      variety: selectedSeedVariety?.id || null,
    };

    //console.log("Inventory Filter Payload", payload);

    getGodownCount(payload);
    getAvailableSeed(payload);
    getExpSeeds(payload);
    getCondemnSeeds(payload);

    // setshowFilterSheet(false);
  };

  const getGodownCount = async (filter = {}) => {
    try {
      let url = API_ROUTES.INVT_GODOWN_COUNT;

      const payloadData = {
        hoId: userData?.hoId,
        roId: userData?.roId,
        aoId: userData?.aoId,
        farmId: userData?.farmId,
        farmBlockId: userData?.farmBlockId,
        unitName: userData?.unitName,
        unitType: userData?.unitType,
        unit: {
          unitId: userData?.unitId,
          unitName: userData?.unitName,
        },
        startDate: formatDate(fromDate),
        endDate: formatDate(toDate),
        ...filter,
      };

      const encryptedPayload = encryptWholeObject(payloadData);
      const response = await apiRequest(url, "post", encryptedPayload);
      const decrypted = decryptAES(response);
      const parsedDecrypted = JSON.parse(decrypted);
      console.log("Inventory Filter Payload", payloadData);
      //console.log("getGodownCount", parsedDecrypted);
      //console.log("getGodownCount", userData);
      if (
        parsedDecrypted &&
        (parsedDecrypted?.statusCode === "200" ||
          parsedDecrypted?.statusCode === "201")
      ) {
        setgodownData(parsedDecrypted?.data);
      } else {
        setgodownData([]);
        showErrorMessage(parsedDecrypted?.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error, "line error");
      showErrorMessage("something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const getAvailableSeed = async (filter) => {
    try {
      let url = API_ROUTES.INVT_AVAIL_SEEDS_COUNT;
      const payloadData = {
        hoId: userData?.hoId,
        roId: userData?.roId,
        aoId: userData?.aoId,
        farmId: userData?.farmId,
        farmBlockId: userData?.farmBlockId,
        unitName: userData?.unitName,
        unitType: userData?.unitType,
        materialType: "SEED",
        inventoryType: "MAIN",
        itemStatus: "STANDARD",
        unit: {
          unitId: userData?.unitId,
          unitName: userData?.unitName,
        },
        startDate: formatDate(fromDate),
        endDate: formatDate(toDate),
        ...filter,
      };
      const encryptedPayload = encryptWholeObject(payloadData);
      const response = await apiRequest(url, "post", encryptedPayload);
      const decrypted = decryptAES(response);
      const parsedDecrypted = JSON.parse(decrypted);
      console.log("Inventory Filter Payload", payloadData);
      console.log("getAvailableSeed", parsedDecrypted);
      if (
        parsedDecrypted &&
        (parsedDecrypted?.statusCode === "200" ||
          parsedDecrypted?.statusCode === "201")
      ) {
        setavailableSeed(parsedDecrypted?.data);
      } else {
        setavailableSeed([]);
        showErrorMessage(parsedDecrypted?.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error, "line error");
      showErrorMessage("something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const getExpSeeds = async (filter) => {
    try {
      let url = API_ROUTES.INVT_SEEDS_NEAR_EXP_COUNT;
      const payloadData = {
        hoId: userData?.hoId,
        roId: userData?.roId,
        aoId: userData?.aoId,
        farmId: userData?.farmId,
        farmBlockId: userData?.farmBlockId,
        unitName: userData?.unitName,
        unitType: userData?.unitType,
        materialType: "SEED",
        inventoryType: "MAIN",
        itemStatus: "STANDARD",
        startDate: formatDate(fromDate),
        endDate: formatDate(toDate),
        ...filter,
      };
      const encryptedPayload = encryptWholeObject(payloadData);
      const response = await apiRequest(url, "post", encryptedPayload);
      const decrypted = decryptAES(response);
      const parsedDecrypted = JSON.parse(decrypted);
      console.log("Inventory Filter Payload", payloadData);
      if (
        parsedDecrypted &&
        (parsedDecrypted?.statusCode === "200" ||
          parsedDecrypted?.statusCode === "201")
      ) {
        setexpireSeeds(parsedDecrypted?.data);
      } else {
        setexpireSeeds([]);
        showErrorMessage(parsedDecrypted?.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error, "line error");
      showErrorMessage("something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const getCondemnSeeds = async (filter) => {
    try {
      let url = API_ROUTES.INVT_CONDEMN_COUNT;
      const payloadData = {
        hoId: userData?.hoId,
        roId: userData?.roId,
        aoId: userData?.aoId,
        farmId: userData?.farmId,
        farmBlockId: userData?.farmBlockId,
        unitName: userData?.unitName,
        unitType: userData?.unitType,
        materialType: "SEED",
        inventoryType: "MAIN",
        itemStatus: "CONDEMN",
        startDate: formatDate(fromDate),
        endDate: formatDate(toDate),
        ...filter,
      };
      const encryptedPayload = encryptWholeObject(payloadData);
      const response = await apiRequest(url, "post", encryptedPayload);
      const decrypted = decryptAES(response);
      const parsedDecrypted = JSON.parse(decrypted);
      console.log("Inventory Filter Payload", payloadData);
      if (
        parsedDecrypted &&
        (parsedDecrypted?.statusCode === "200" ||
          parsedDecrypted?.statusCode === "201")
      ) {
        setcondemnSeeds(parsedDecrypted?.data);
      } else {
        setcondemnSeeds([]);
        showErrorMessage(parsedDecrypted?.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error, "line error");
      showErrorMessage("something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getRegionalOffice = async () => {
    try {
      let url = API_ROUTES.REGIONAL_OFFICE;
      const payloadData = {};
      const encryptedPayload = encryptWholeObject(payloadData);
      const response = await apiRequest(url, "post", encryptedPayload);
      const decrypted = decryptAES(response);
      const parsedDecrypted = JSON.parse(decrypted);
      //console.log("seedData___", payloadData);
      console.log("getRegionalOffice", parsedDecrypted);
      if (
        parsedDecrypted &&
        (parsedDecrypted?.statusCode === "200" ||
          parsedDecrypted?.statusCode === "201")
      ) {
        setregionalOffice(parsedDecrypted?.data);
      } else {
        setregionalOffice([]);
        showErrorMessage(parsedDecrypted?.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error, "line error");
      showErrorMessage("something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getFarmList = async () => {
    try {
      let url = API_ROUTES.FARM_MASTER;
      const payloadData = {};
      const encryptedPayload = encryptWholeObject(payloadData);
      const response = await apiRequest(url, "post", encryptedPayload);
      const decrypted = decryptAES(response);
      const parsedDecrypted = JSON.parse(decrypted);
      //console.log("seedData___", payloadData);
      console.log("getRegionalOffice", parsedDecrypted);
      if (
        parsedDecrypted &&
        (parsedDecrypted?.statusCode === "200" ||
          parsedDecrypted?.statusCode === "201")
      ) {
        setfarmList(parsedDecrypted?.data);
      } else {
        setfarmList([]);
        showErrorMessage(parsedDecrypted?.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error, "line error");
      showErrorMessage("something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const getAreaOffice = async (selectedRegOfficeId) => {
    setLoading(true);
    try {
      let url = API_ROUTES.AREA_OFFICE;
      const payloadData = { regionalOfficeId: selectedRegOfficeId };
      const encryptedPayload = encryptWholeObject(payloadData);
      const response = await apiRequest(url, "post", encryptedPayload);
      const decrypted = decryptAES(response);
      const parsedDecrypted = JSON.parse(decrypted);
      //console.log("seedData___", payloadData);
      console.log("getAreaOffice", parsedDecrypted);
      if (
        parsedDecrypted &&
        (parsedDecrypted?.statusCode === "200" ||
          parsedDecrypted?.statusCode === "201")
      ) {
        setareaOffice(parsedDecrypted?.data);
      } else {
        setareaOffice([]);
        showErrorMessage(parsedDecrypted?.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error, "line error");
      showErrorMessage("something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getSeedVariety = async (selectedCropId) => {
    setLoading(true);
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
      console.log("parsedDecryptedCropListData", parsedDecryptedCropListData);
      console.log("parsedDecryptedCropListData", payloadData);
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

  const getCropList = async () => {
    try {
      const payloadData = {};
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

  const QCTable = ({ data }) => {
    const tableData = (data || []).filter((item) => item.parameter);

    return (
      <View style={styles.tableContainer}>
        {/* HEADER */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, { flex: 2, borderRightWidth: 2 }]}>
            Parameter
          </Text>
          <Text style={[styles.tableCell, { borderRightWidth: 2 }]}>
            Received
          </Text>
          <Text style={[styles.tableCell, { borderRightWidth: 2 }]}>
            Settled
          </Text>
          <Text style={[styles.tableCell, { borderRightWidth: 0 }]}>
            In Progress
          </Text>
        </View>

        {/* DATA */}
        {tableData.map((item, index) => (
          <View
            key={index}
            style={[
              styles.tableRow,
              index % 2 === 0 ? styles.rowEven : styles.rowOdd,
            ]}
          >
            <Text style={[styles.tableCell, { flex: 2 }]}>
              {item.parameter}
            </Text>
            <Text style={styles.tableCell}>{item.received}</Text>
            <Text style={styles.tableCell}>{item.settled}</Text>
            <Text style={[styles.tableCell, { borderRightWidth: 0 }]}>
              {item.inProgress}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const fethchUserprofileData = async () => {
    setLoading(true);
    const userData = await getUserData();
    console.log("userData", userData);
    setUserData(userData);

    try {
      const payloadData = {
        id: userData?.employeeId,
      };
      const encryptedPayload = encryptWholeObject(payloadData);
      const response = await apiRequest(
        API_ROUTES.PROFILE_DETAILS,
        "post",
        encryptedPayload,
      );
      const decrypted = decryptAES(response);
      const parsedDecrypted = JSON.parse(decrypted);

      if (parsedDecrypted && parsedDecrypted?.statusCode === "401") {
        setTimeout(() => {
          dispatch(clearUserData());
          removeUserData();
          showSuccessMessage(en?.PROFILE.LOGOUT_SUCCESS);
        }, 500);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const getProductionDashboardSummary = async (filter = {}) => {
    setLoading(true);
    try {
      const currentFY = getCurrentFinancialYearObj(financialYear);
      console.log("currentFY", currentFY);
      const payloadData = {
        roId: userData?.roId,
        finYearId: currentFY?.id,
        unitType: userData?.unitType,
        ...filter,
      };
      const encryptedPayload = encryptWholeObject(payloadData);
      const response = await apiRequest(
        API_ROUTES.DASHBOARD_SUMMARY,
        "post",
        encryptedPayload,
      );
      const decrypted = decryptAES(response);
      const parsedDecrypted = JSON.parse(decrypted);
      //console.log("getProductionDashboardSummary___", userData);
      console.log("getProductionDashboardSummary___", payloadData);
      console.log("getProductionDashboardSummary___", parsedDecrypted);

      if (
        parsedDecrypted &&
        (parsedDecrypted?.statusCode === "200" ||
          parsedDecrypted?.statusCode === "201")
      ) {
        setdashbooardData(parsedDecrypted?.data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const getProductionGraphData = async (filter = {}) => {
    setLoading(true);
    try {
      const currentFY = getCurrentFinancialYearObj(financialYear);
      const payloadData = {
        finYearId: currentFY?.id,
        unitId: userData?.unitId,
        unitType: userData?.unitType,
        page: 0,
        pageSize: 100,
        ...filter,
      };
      const encryptedPayload = encryptWholeObject(payloadData);
      const response = await apiRequest(
        API_ROUTES.DASHBOARD_GRAPH_DATA,
        "post",
        encryptedPayload,
      );
      const decrypted = decryptAES(response);
      const parsedDecrypted = JSON.parse(decrypted);
      //console.log("getProductionGraphData__", userData);
      console.log("getProductionGraphData__", payloadData);
      console.log("getProductionGraphData__", parsedDecrypted);

      if (
        parsedDecrypted &&
        (parsedDecrypted?.statusCode === "200" ||
          parsedDecrypted?.statusCode === "201")
      ) {
        setGraphData(parsedDecrypted?.data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const getProductionPlanDetail = async (filter = {}) => {
    setLoading(true);
    try {
      const currentFY = getCurrentFinancialYearObj(financialYear);
      const payloadData = {
        finYearId: currentFY?.id,
        roId: userData?.roId,
        aoId: userData?.aoId,
        pcId: userData?.pcId,
        page: 0,
        pageSize: 100,
        unitType: userData?.unitType,
        ...filter,
      };
      const encryptedPayload = encryptWholeObject(payloadData);
      const response = await apiRequest(
        API_ROUTES.PLAN_DETAILS,
        "post",
        encryptedPayload,
      );
      const decrypted = decryptAES(response);
      const parsedDecrypted = JSON.parse(decrypted);
      console.log("getProductionPlanDetail_______", parsedDecrypted);
      console.log("getProductionPlanDetail_______", payloadData);
      if (
        parsedDecrypted &&
        (parsedDecrypted?.statusCode === "200" ||
          parsedDecrypted?.statusCode === "201")
      ) {
        //const top5Data = parsedDecrypted?.data.slice(0, 5);
        setPlanDetailsList(parsedDecrypted?.data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const COLORS = [
    "#3b82f6",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#14b8a6",
    "#ec4899",
    "#f97316",
    "#06b6d4",
    "#84cc16",
  ];

  const getRegionPieData = () => {
    const data = marketingDashData?.reagionWiseContribution || {};
    const total = Object.values(data).reduce((a, b) => a + b, 0);

    return Object.keys(data)
      .filter((key) => data[key] > 0)
      .map((key, index) => {
        const cleanKey = key.trim();
        let value = data[key];

        const percent = (value / total) * 100;
        if (percent < 3) {
          value = total * 0.03;
        }

        return {
          value,
          originalValue: data[key],
          label: cleanKey,
          color: COLORS[index % COLORS.length],
        };
      });
  };

  const apllyProductionFillterCallback = useCallback(
    (selectedFinancialYear, selectedSeason, selectedCrop) => {
      if (userData) {
        const filterData = {
          finYearId: selectedFinancialYear?.id || null,
          seasonId: selectedSeason?.id || null,
          cropId: selectedCrop?.id || null,
          varietyId: null,
          class: null,
        };
        getProductionDashboardSummary(filterData);
        getProductionGraphData(filterData);
        getProductionPlanDetail(filterData);

        setshowFilterSheet(false);
      }
    },
    [userData],
  );
  const getQtyChartData = () => {
    return totalSaleByMonth.map((item) => ({
      value: item.total || 0,
      label: item.month,
      frontColor: "#4f6bdc",
      onPress: () => {
        //alert(`Month: ${item.month}\nQty: ${item.total} qtl`);

        Alert.alert(
          "Detail",
          `Month: ${item.month}\nQty: ${item.total} qtl`[
            { text: "OK", onPress: () => console.log("OK Pressed") }
          ],
        );
      },
    }));
  };

  const getRevenueChartData = () => {
    return totalSaleByMonth.map((item) => ({
      value: (item.totalAmount || 0) / 100000,
      label: item.month,
      frontColor: "#22c55e",
      onPress: () => {
        //alert(`Month: ${item.month}\nRevenue: ₹${item.totalAmount}`);
        Alert.alert(
          "Detail",
          `Month: ${item.month}\nRevenue: ₹${item.totalAmount}`[
            { text: "OK", onPress: () => console.log("OK Pressed") }
          ],
        );
      },
    }));
  };

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const applyMarketingFilter = () => {
    if (fromDate > toDate) {
      showErrorMessage("From Date cannot be greater than To Date");
      return;
    }
    const filterData = {
      startDate: formatDate(fromDate),
      endDate: formatDate(toDate),
    };

    getMarketingData(filterData);
    getTopDealer(filterData);
    getTotalSalesByMonth(filterData);

    setshowFilterSheet(false);
  };

  const totalComplaints = (qcComplaintList || []).reduce(
    (acc, item) => {
      if (!item.parameter) return acc;

      acc.received += item.received || 0;
      acc.resolved += item.settled || 0;

      return acc;
    },
    { received: 0, resolved: 0 },
  );

  const role = (() => {
    const rawRole = userData?.roleName;

    console.log("rawRole", rawRole);

    if (!rawRole) return [];

    if (Array.isArray(rawRole)) return rawRole;

    if (typeof rawRole === "string") {
      try {
        return JSON.parse(rawRole);
      } catch (e) {
        return rawRole.split(",").map((r) => r.trim());
      }
    }

    return [];
  })();

  const hasAccess = (key) =>
    Array.isArray(role) && role.some((r) => r?.toUpperCase?.().includes(key));

  const hasMKT = hasAccess("MKT");
  const hasINV = hasAccess("INV");
  const hasPROD = hasAccess("PROD");
  const hasFARM = hasAccess("FARM");
  const hasQC = hasAccess("QC");

  const getTabsByRole = () => {
    const tabs = [];

    if (hasPROD) tabs.push("Production");
    if (hasMKT) tabs.push("Marketing");
    if (hasINV) tabs.push("Inventory");
    if (hasQC) tabs.push("QC");
    if (hasFARM) tabs.push("Farm");

    console.log("getTabsByRole", tabs);

    return tabs;
  };

  const roleTabs = getTabsByRole();

  return (
    <WrapperContainer isLoading={loading}>
      <CustomHeader
        data={userData}
        clickOnFilter={() => {
          if (roleTabs.length > 0) {
            if (
              selectedTab == "Production" ||
              selectedTab == "Marketing" ||
              selectedTab == "Inventory"
            ) {
              setshowFilterSheet(true);
            }
          }
        }}
        bgColor="#eef3e8"
        showFilter={roleTabs.length > 0 ? true : false}
        //showNotf={true}
      />
      {showFromPicker && (
        <DateTimePicker
          value={fromDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowFromPicker(false);
            if (selectedDate) setFromDate(selectedDate);
          }}
        />
      )}

      {showToPicker && (
        <DateTimePicker
          value={toDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowToPicker(false);
            if (selectedDate) setToDate(selectedDate);
          }}
        />
      )}
      {showFilterSheet && (
        <CustomBottomSheet
          visible={showFilterSheet}
          onRequestClose={() => setshowFilterSheet(false)}
        >
          <ScrollView style={styles.sheetContainer}>
            {selectedTab == "Production" && (
              <ProductionFilterComp
                applyFilter={apllyProductionFillterCallback}
                financialYear={financialYear}
                season={season}
                onCLose={() => {
                  setshowFilterSheet(false);
                }}
              />
            )}
            {selectedTab == "Marketing" && (
              <View style={{}}>
                <TouchableOpacity
                  onPress={() => {
                    setShowFromPicker(true);
                  }}
                >
                  <Input
                    label="From Date"
                    placeholder="DD/MM/YYYY"
                    value={fromDate.toLocaleDateString()}
                    editable={false}
                    style={[styles.input]}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowToPicker(true);
                  }}
                >
                  <Input
                    label="To Date"
                    placeholder="DD/MM/YYYY"
                    value={toDate.toLocaleDateString()}
                    editable={false}
                    style={[styles.input]}
                  />
                </TouchableOpacity>
                <View style={styles.bottomBtns}>
                  <TouchableOpacity
                    onPress={() => {
                      setshowFilterSheet(false);
                    }}
                    style={styles.resetBtn}
                  >
                    <Text style={{ color: "#6b4caf" }}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={applyMarketingFilter}
                    style={styles.applyBtn}
                  >
                    <Text style={{ color: "#fff" }}>Apply Filters</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {selectedTab == "Inventory" && (
              <>
                <View style={styles.section}>
                  <DropDown
                    label="Unit Type"
                    data={[
                      {
                        id: 1,
                        name: "Regional Office",
                        value: "REGIONAL OFFICE",
                      },
                      { id: 2, name: "Area Office", value: "AREA OFFICE" },
                      { id: 3, name: "Farm", value: "FARM" },
                    ]}
                    value={unitType?.name}
                    selectItem={(item) => setunitType(item)}
                  />
                </View>
                {(unitType?.value == "REGIONAL OFFICE" ||
                  unitType?.value == "AREA OFFICE") && (
                  <View style={styles.section}>
                    <DropDown
                      fieldName={"name"}
                      label="Regional Office"
                      data={regionalOffice}
                      value={
                        selectedRegional
                          ? selectedRegional?.name +
                            `(${selectedRegional?.roShortName})`
                          : ""
                      }
                      selectItem={(item) => {
                        setselectedRegional(item);
                        getAreaOffice(item?.id);
                        setselectedAreaOffice("");
                      }}
                    />
                  </View>
                )}
                {unitType?.value == "AREA OFFICE" && (
                  <View style={styles.section}>
                    <DropDown
                      fieldName={"name"}
                      label="Area Office"
                      data={areaOffice}
                      value={
                        selectedAreaOffice
                          ? selectedAreaOffice?.name +
                            `(${selectedAreaOffice?.shortName})`
                          : ""
                      }
                      selectItem={(item) => {
                        setselectedAreaOffice(item);
                      }}
                    />
                  </View>
                )}
                {unitType?.value == "FARM" && (
                  <View style={styles.section}>
                    <DropDown
                      fieldName={"name"}
                      label="Farm"
                      data={farmList}
                      value={selectedFarm?.name}
                      selectItem={(item) => {
                        setselectedFarm(item);
                      }}
                    />
                  </View>
                )}

                <View style={styles.section}>
                  <TouchableOpacity onPress={() => setShowFromPicker(true)}>
                    <Input
                      label="From Date"
                      placeholder="DD/MM/YYYY"
                      value={fromDate?.toLocaleDateString()}
                      editable={false}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.section}>
                  <TouchableOpacity onPress={() => setShowToPicker(true)}>
                    <Input
                      label="To Date"
                      placeholder="DD/MM/YYYY"
                      value={toDate?.toLocaleDateString()}
                      editable={false}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.section}>
                  <DropDown
                    fieldName={"seedCropName"}
                    label="Crop"
                    data={cropListData}
                    value={selectedCrop?.seedCropName}
                    selectItem={(item) => {
                      setselectedCrop(item);
                      getSeedVariety(item?.id);
                      setselectedSeedVariety("");
                    }}
                  />
                </View>
                <View style={styles.section}>
                  <DropDown
                    fieldName={"seedVarietyName"}
                    label="Variety"
                    data={seedVariety}
                    value={selectedSeedVariety?.seedVarietyName}
                    selectItem={(item) => {
                      setselectedSeedVariety(item);
                    }}
                  />
                </View>
                <View style={styles.section}>
                  <DropDown
                    fieldName={"value"}
                    label="Class"
                    data={[
                      {
                        id: 1,
                        name: "NS",
                        value: "NS",
                      },
                      { id: 2, name: "BS", value: "BS" },
                      { id: 3, name: "FS", value: "FS" },
                      { id: 4, name: "CS", value: "CS" },
                      { id: 5, name: "TL", value: "FS" },
                    ]}
                    value={selectedClass?.name}
                    selectItem={(item) => setselectedClass(item)}
                  />
                </View>
                <View style={styles.section}>
                  <DropDown
                    fieldName={"name"}
                    label="Seed Type"
                    data={[
                      {
                        id: 1,
                        name: "Standard",
                        value: "STANDARD",
                      },
                      { id: 2, name: "Sub Standard ", value: " SUB STANDARD" },
                    ]}
                    value={selectedSeedType?.name}
                    selectItem={(item) => setselectedSeedType(item)}
                  />
                </View>
                <View style={styles.bottomBtns}>
                  <TouchableOpacity
                    onPress={() => {
                      setshowFilterSheet(false);
                    }}
                    style={styles.resetBtn}
                  >
                    <Text style={{ color: "#6b4caf" }}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={applyInventoryFilter}
                    style={styles.applyBtn}
                  >
                    <Text style={{ color: "#fff" }}>Apply Filters</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </CustomBottomSheet>
      )}

      <View style={{}}>
        <Tabs
          selected={selectedTab}
          setSelected={setSelectedTab}
          tabs={roleTabs}
        />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 80 }}
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {selectedTab === "Production" && hasPROD && (
          <>
            <View style={styles.grid}>
              <StatCard
                title="ACTIVE DEALERS"
                value={dashbooardData?.growers?.totalDealers}
                subtitle="Done"
                color="#2e7d32"
              />
              <StatCard
                title="GROWERS"
                value={[
                  { label: "FPO", value: dashbooardData?.growers?.fpoGrowers },
                  { label: "NSC", value: dashbooardData?.growers?.selfGrowers },
                ]}
                subtitle="Verified"
                color="#1565c0"
              />
              <StatCard
                title="Total Area"
                value={dashbooardData?.productionPlan?.totalArea}
                subtitle="Mapped"
                color="#c62828"
              />
              <StatCard
                title="SEED INTAKE"
                value={dashbooardData?.seedIntake?.totalSeed}
                subtitle="Raw"
                color="#2e7d32"
              />
            </View>

            <ProductionOverview graphData={graphData} />
            {planDetailsList?.length > 0 && (
              <PlanListComp
                data={planDetailsList?.slice(0, 5)}
                viewMore={() => {
                  navigation.navigate("ViewMorePlansList", {
                    planDetailsList,
                  });
                }}
              />
            )}

            {graphData?.rejectedPlansList?.length > 0 && (
              <RejectedPlanList
                data={graphData?.rejectedPlansList?.slice(0, 5)}
                viewMore={() => {
                  navigation.navigate("ViewMoreRejectedPlan", {
                    planDetailsList: graphData?.rejectedPlansList,
                  });
                }}
              />
            )}
          </>
        )}

        {selectedTab === "Marketing" && hasMKT && (
          <View style={{ marginTop: 10 }}>
            <View style={styles.grid}>
              <StatCard
                title={"Active Dealers"}
                value={marketingDashData?.activeDealer || 0}
              />
              <StatCard
                title={"Pending Order"}
                value={marketingDashData?.pendingOrder || 0}
              />
              <StatCard
                title={"Total Revenue"}
                value={marketingDashData?.totalRevenue || 0}
              />
              <StatCard
                title={"Total Sale Qty"}
                value={marketingDashData?.totalSaleQty || 0}
              />
            </View>
            {/* 🔹 Quantity Chart */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>
                Monthly Quantity Sold (qtls)
              </Text>

              <BarChart
                data={getQtyChartData()}
                height={240}
                width={screenWidth - 100}
                barWidth={20}
                spacing={25}
                initialSpacing={20}
                endSpacing={20}
                roundedTop
                /* 🔥 AXIS CONTROL */
                noOfSections={4} // 4 sections → 5 labels (0–180)
                maxValue={180} // 🔥 FIXED MAX (like web)
                yAxisThickness={1}
                xAxisThickness={1}
                rulesColor="#e5e7eb"
                yAxisTextStyle={{ fontSize: 11 }}
                /* 🔥 GRID STYLE */
                dashWidth={4}
                dashGap={6}
                isAnimated
              />
            </View>

            {/* 🔹 Revenue Chart */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Monthly Revenue (₹)</Text>

              <BarChart
                data={getRevenueChartData()}
                height={240}
                width={screenWidth - 100}
                barWidth={18}
                spacing={25}
                initialSpacing={20}
                endSpacing={20}
                roundedTop
                /* 🔥 AXIS CONTROL */
                noOfSections={5} // 0–10L → 5 parts
                yAxisThickness={1}
                xAxisThickness={1}
                rulesColor="#e5e7eb"
                /* 🔥 LABEL FORMAT */
                maxValue={50}
                yAxisLabelSuffix="L"
                dashWidth={4}
                dashGap={6}
                isAnimated
              />
            </View>
            <View
              style={{
                marginTop: 10,
                backgroundColor: "#fff",
                padding: 15,
                borderRadius: 12,
                elevation: 1,
                marginHorizontal: 10,
              }}
            >
              <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                Region Wise Contribution
              </Text>

              {/* <View
                style={{
                  alignItems: "center", // 🔥 center horizontally
                  justifyContent: "center",
                }}
              >
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {getRegionPieData().map((item, index) => (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedSlice(item);
                      }}
                      key={index}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "#f1f5f9",
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 20,
                        marginRight: 8,
                      }}
                    >
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          backgroundColor: item.color,
                          marginRight: 6,
                          borderRadius: 4,
                        }}
                      />
                      <Text style={{ fontSize: 12 }}>{item.label}</Text>
                      <Text style={{ fontSize: 12, fontWeight: "bold" }}>
                        - {item.originalValue}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <PieChart
                  data={getRegionPieData()}
                  donut
                  radius={120}
                  innerRadius={70}
                  //focusOnPress
                  sectionAutoFocus
                  isAnimated
                  animationDuration={1200}
                  onPress={(item) => {
                    setSelectedSlice(item);
                  }} // 🔥 important
                />
                <View
                  style={{
                    position: "absolute",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontWeight: "bold", fontSize: 14 }}>
                    {selectedSlice?.label || "Total"}
                  </Text>

                  <Text style={{ fontSize: 12, color: "#555" }}>
                    ₹
                    {selectedSlice
                      ? selectedSlice.originalValue?.toLocaleString()
                      : marketingDashData?.totalRevenue?.toLocaleString()}
                  </Text>
                </View>
              </View> */}
            </View>

            {topDealer?.length > 0 && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginHorizontal: 10,
                  marginTop: 15,
                  marginBottom: 15,
                }}
              >
                <Text style={styles.heading}>Top 5 Dealer</Text>
                {/* <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("ViewMoreDealerList", {
                      dealerList: topDealer,
                    });
                  }}
                >
                  <Text
                    style={[styles.heading, { color: Colors.blueThemeColor }]}
                  >
                    View More
                  </Text>
                </TouchableOpacity> */}
              </View>
            )}

            <FlatList
              data={topDealer.slice(0, 5)}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View
                  style={{
                    backgroundColor: "#fff",
                    padding: 12,
                    borderRadius: 10,
                    marginBottom: 10,
                    elevation: 1,
                    marginHorizontal: 10,
                  }}
                >
                  <Text style={{ fontWeight: "bold" }}>
                    Name: {item.dealerName}
                  </Text>
                  <Text>Region: {item.region}</Text>
                  <Text>Sales: {item.totalSales}</Text>
                  <Text>Qty: {item.totalQty}</Text>
                </View>
              )}
            />
          </View>
        )}

        {selectedTab === "Inventory" && hasINV && (
          <InventoryDashboard
            godownData={godownData}
            availableSeed={availableSeed}
            expireSeeds={expireSeeds}
            condemnSeeds={condemnSeeds}
          />
        )}

        {selectedTab === "QC" && hasQC && (
          <ScrollView style={{ marginTop: 20 }}>
            <View style={{ marginHorizontal: 15 }}>
              <Text style={styles.qcHeader}>Complaint Summary</Text>

              <View style={[styles.grid, { paddingHorizontal: 0 }]}>
                <StatCard
                  title="Total Received Complaints"
                  value={totalComplaints.received}
                />

                <StatCard
                  title="Total Resolved Complaints"
                  value={totalComplaints.resolved}
                />
              </View>

              {qcComplaintList?.length && <QCTable data={qcComplaintList} />}
            </View>

            <View style={{ paddingHorizontal: 20, marginTop: 15 }}>
              {/* 🔹 SECTION 1 */}
              <Text style={styles.qcHeader}>
                Sample coupon tracking — QCL vs SSCA
              </Text>

              <View style={styles.qcCard}>
                <QCComparisonRow
                  label="Total / sent"
                  qclValue={qcDashboardData?.count?.qcl?.totalReceived || 0}
                  sscaValue={qcDashboardData?.count?.ssca?.totalReceived || 0}
                  color="#3b82f6"
                />

                <View style={styles.divider} />

                <QCComparisonRow
                  label="Tested / result received"
                  qclValue={qcDashboardData?.count?.qcl?.totalTested || 0}
                  sscaValue={qcDashboardData?.count?.ssca?.totalTested || 0}
                  color="#10b981"
                />

                <View style={styles.divider} />

                <QCComparisonRow
                  label="Not tested / awaited"
                  qclValue={qcDashboardData?.count?.qcl?.totalToBeTested || 0}
                  sscaValue={qcDashboardData?.count?.ssca?.totalToBeTested || 0}
                  color="#ef4444"
                />
              </View>

              {/* 🔹 SECTION 2 */}
              <Text style={styles.qcHeader}>
                Quantity wise tracking — QCL vs SSCA
              </Text>

              <View style={styles.qcCard}>
                <QCComparisonRow
                  label="Total qty sent"
                  qclValue={qcDashboardData?.quantity?.qcl?.totalQtySent || 0}
                  sscaValue={qcDashboardData?.quantity?.ssca?.totalQtySent || 0}
                  color="#3b82f6"
                />

                <View style={styles.divider} />

                <QCComparisonRow
                  label="Result received"
                  qclValue={
                    qcDashboardData?.quantity?.qcl?.totalQtyResultReceived || 0
                  }
                  sscaValue={
                    qcDashboardData?.quantity?.ssca?.totalQtyResultReceived || 0
                  }
                  color="#10b981"
                />

                <View style={styles.divider} />

                <QCComparisonRow
                  label="Results awaited"
                  qclValue={
                    qcDashboardData?.quantity?.qcl?.totalQtyResultsAwaited || 0
                  }
                  sscaValue={
                    qcDashboardData?.quantity?.ssca?.totalQtyResultsAwaited || 0
                  }
                  color="#f59e0b"
                />
              </View>
            </View>
          </ScrollView>
        )}
        {selectedTab === "Farm" && hasFARM && (
          <FarmDashboard
            executiveData={farmExecutiveData}
            activities={farmActivities}
            farmYieldData={farmYieldData}
            productionSummary={farmProductionSummary}
          />
        )}

        {roleTabs.length === 0 && (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Image
              style={{
                width: width,
                height: 300,
                backgroundColor: Colors.white,
                //marginTop: 30,
              }}
              source={ImagePath?.bannerImg}
              resizeMode="cover"
            />
          </View>
        )}
      </ScrollView>
    </WrapperContainer>
  );
}

const StatCard = ({ title, value, subtitle, color }) => {
  const isMultiple = Array.isArray(value);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>

      {isMultiple ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 7,
            }}
          >
            <View style={{ width: "49%" }}>
              <Text style={[styles.cardTitle, { marginBottom: -10 }]}>FPO</Text>
              <Text style={styles.cardValue}>{value[0]?.value || 0}</Text>
            </View>
            <View
              style={{ width: 1, backgroundColor: "#777", height: "100%" }}
            />
            <View
              style={{
                width: "49%",
                //marginLeft: 10,
                alignItems: "flex-end",
              }}
            >
              <Text style={[styles.cardTitle, { marginBottom: -10 }]}>NSC</Text>
              <Text style={styles.cardValue}>{value[1]?.value || 0}</Text>
            </View>
          </View>
        </View>
      ) : (
        // <Text style={styles.cardValue}>{value}</Text>
        // <AnimatedNumbers
        //   includeComma
        //   animateToNumber={Number(value) || 0}
        //   fontStyle={{
        //     fontSize: 22,
        //     fontWeight: "bold",
        //   }}
        //   animationDuration={1000}
        //   decimalPlaces={2}
        // />
        <Text style={styles.cardValue}>{Number(value || 0).toFixed(2)}</Text>
      )}

      {/* <Text style={styles.cardSub}>{subtitle}</Text> */}
    </View>
  );
};

const QCComparisonRow = React.memo(({ label, qclValue, sscaValue, color }) => {
  const max = Math.max(qclValue, sscaValue, 1);

  const qclAnim = useRef(new Animated.Value(0)).current;
  const sscaAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(qclAnim, {
      toValue: (qclValue / max) * 100,
      duration: 800,
      useNativeDriver: false,
    }).start();

    Animated.timing(sscaAnim, {
      toValue: (sscaValue / max) * 100,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [qclValue, sscaValue]); // 🔥 ONLY DATA CHANGE

  return (
    <View style={{ marginBottom: 15 }}>
      <Text style={{ fontWeight: "600", marginBottom: 6 }}>{label}</Text>

      {/* 🔹 QCL */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={{ width: 40 }}>QCL</Text>

        <View
          style={{
            flex: 1,
            backgroundColor: "#eee",
            height: 8,
            borderRadius: 5,
            overflow: "hidden",
          }}
        >
          <Animated.View
            style={{
              width: qclAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
              backgroundColor: color,
              height: 8,
              borderRadius: 5,
            }}
          />
        </View>

        <Text style={{ width: 50, textAlign: "right" }}>{qclValue}</Text>
      </View>

      {/* 🔹 SSCA */}
      <View
        style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}
      >
        <Text style={{ width: 40 }}>SSCA</Text>

        <View
          style={{
            flex: 1,
            backgroundColor: "#eee",
            height: 8,
            borderRadius: 5,
            overflow: "hidden",
          }}
        >
          <Animated.View
            style={{
              width: sscaAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
              backgroundColor: "#8b5cf6",
              height: 8,
              borderRadius: 5,
            }}
          />
        </View>

        <Text style={{ width: 50, textAlign: "right" }}>{sscaValue}</Text>
      </View>
    </View>
  );
});

const Tabs = ({ selected, setSelected, tabs }) => {
  if (!tabs || tabs.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabContainer}
    >
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() => setSelected(tab)}
          style={[styles.tab, selected === tab && styles.activeTab]}
        >
          <Text
            style={{
              color: selected === tab ? "#fff" : "#333",
              fontWeight: "600",
            }}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const ProductionOverview = ({ graphData }) => {
  const getAreaChartData = () => {
    let data =
      graphData?.roGroupData ||
      graphData?.aoGroupData ||
      graphData?.pcGroupData ||
      [];
    return data?.flatMap((item) => [
      {
        value: item.area || 0,
        frontColor: "#2b6cb0",
        spacing: 4,
        onPress: () => {
          // alert(
          //   `RO: ${item.roName || item?.aoName || item?.pcName}\nArea: ${
          //     item.area
          //   }`,
          // );

          Alert.alert(
            "Detail",
            `RO: ${
              item.roName || item?.aoName || item?.pcName
            }\nArea: ${item.area.toFixed(2)} Ha`,
            [{ text: "OK", onPress: () => console.log("OK Pressed") }],
          );
        },
      },
      {
        value: item.assignedArea || 0,
        frontColor: "#f59e0b",
        label: item.roName || item?.aoName || item?.pcName?.trim(),
        labelTextStyle: {
          textAlign: "center",
          width: 90,
          marginLeft: -20, // 👈 🔥 center align hack
          fontSize: 11,
        },
        spacing: 28, // 👈 🔥 BIG GAP between groups
        onPress: () => {
          // alert(
          //   `RO: ${
          //     item.roName || item?.aoName || item?.pcName
          //   }\nAssigned Area: ${item.assignedArea}`,
          // );

          Alert.alert(
            "Detail",
            `RO: ${
              item.roName || item?.aoName || item?.pcName
            }\nAssigned Area: ${item.assignedArea.toFixed(2)} Ha`,
            [{ text: "OK", onPress: () => console.log("OK Pressed") }],
          );
        },
      },
    ]);
  };

  const getSeedChartData = () => {
    let data =
      graphData?.roGroupData ||
      graphData?.aoGroupData ||
      graphData?.pcGroupData ||
      [];
    return data?.flatMap((item) => [
      {
        value: item.rawSeed,
        frontColor: "#2f855a",
        spacing: 4,
        onPress: () => {
          // alert(
          //   `RO: ${item.roName || item?.aoName || item?.pcName}\nRaw Seed: ${
          //     item.rawSeed
          //   }`,
          // );

          Alert.alert(
            "Detail",
            `RO: ${
              item.roName || item?.aoName || item?.pcName
            }\nRaw Seed: ${item.rawSeed.toFixed(2)} Kg`,
            [{ text: "OK", onPress: () => console.log("OK Pressed") }],
          );
        },
      },
      {
        value: Number(item.receivedRawSeed || 0),
        frontColor: "#e53e3e",
        label: item.roName || item?.aoName || item?.pcName?.trim(),
        labelTextStyle: {
          textAlign: "center",
          width: 90,
          marginLeft: -20,
          fontSize: 11,
        },
        spacing: 28,
        onPress: () => {
          // alert(
          //   `RO: ${
          //     item.roName || item?.aoName || item?.pcName
          //   }\nReceived Seed: ${item.receivedRawSeed}`,
          // );

          Alert.alert(
            "Detail",
            `RO: ${
              item.roName || item?.aoName || item?.pcName
            }\nReceived Seed: ${item.receivedRawSeed.toFixed(2)} Kg`,
            [{ text: "OK", onPress: () => console.log("OK Pressed") }],
          );
        },
      },
    ]);
  };
  return (
    <View style={styles.overview}>
      <Text style={styles.heading}>Production Overview</Text>
      {/* 🔹 Area vs Assigned */}
      <Text style={{ fontWeight: "bold", marginTop: 10 }}>
        Area vs Assigned Area
      </Text>

      {/* Legend */}
      <View
        style={{
          flexDirection: "row",
          marginTop: 8,
          alignItems: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            marginRight: 15,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 10,
              height: 10,
              backgroundColor: "#2b6cb0",
              marginRight: 5,
            }}
          />
          <Text>Area(Ha)</Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 10,
              height: 10,
              backgroundColor: "#f59e0b",
              marginRight: 5,
            }}
          />
          <Text>Assigned(Ha)</Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ width: "5%", alignItems: "center" }}>
          <Text
            style={{ fontWeight: "bold", transform: [{ rotate: "-90deg" }] }}
          >
            Ha
          </Text>
        </View>
        <View style={{ width: "93%" }}>
          <BarChart
            data={getAreaChartData()}
            height={220}
            width={width - 130}
            barWidth={18}
            spacing={12}
            initialSpacing={25}
            endSpacing={25}
            roundedTop
            noOfSections={5}
            xAxisThickness={1}
            yAxisThickness={1}
            hideRules={false}
            rulesColor="#e5e7eb"
            xAxisLabelTextStyle={{
              textAlign: "center",
              width: 90,
            }}
          />
        </View>
      </View>

      {/* 🔹 Raw Seed vs Received */}
      <Text style={{ fontWeight: "bold", marginTop: 15 }}>
        Raw Seed vs Received Raw Seed
      </Text>

      {/* Legend */}
      <View
        style={{ flexDirection: "row", marginTop: 8, alignItems: "center" }}
      >
        <View
          style={{
            flexDirection: "row",
            marginRight: 15,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 10,
              height: 10,
              backgroundColor: "#2f855a",
              marginRight: 5,
            }}
          />
          <Text>Raw Seed(Kg)</Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 10,
              height: 10,
              backgroundColor: "#e53e3e",
              marginRight: 5,
            }}
          />
          <Text>Received(Kg)</Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ width: "5%", alignItems: "center" }}>
          <Text
            style={{ fontWeight: "bold", transform: [{ rotate: "-90deg" }] }}
          >
            Kg
          </Text>
        </View>
        <View style={{ width: "93%" }}>
          <BarChart
            data={getSeedChartData()}
            height={250}
            width={width - 100}
            barWidth={22}
            roundedTop
            noOfSections={8}
            spacing={20}
            initialSpacing={20}
            endSpacing={20}
            xAxisThickness={1}
            yAxisThickness={1}
            xAxisLabelTextStyle={{
              textAlign: "center",
              width: 70,
            }}
            maxValue={20000}
          />
        </View>
      </View>
    </View>
  );
};
const Input = ({ label, ...props }) => (
  <View style={styles.inputBox}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} {...props} />
  </View>
);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#eef3e8",
    backgroundColor: "#F8FAFC",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginTop: 10,
  },

  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 12,
    color: "#777",
  },

  cardValue: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 5,
  },

  progressBar: {
    height: 6,
    backgroundColor: "#eee",
    borderRadius: 10,
  },

  progressFill: {
    width: "70%",
    height: 6,
    borderRadius: 10,
  },

  cardSub: {
    fontSize: 10,
    color: "#777",
    marginTop: 5,
  },

  tabContainer: {
    flexDirection: "row",
    // backgroundColor: "#e0e0e0",
    backgroundColor: "white",
    borderRadius: 10,
    marginHorizontal: 10,
  },

  // tab: {
  //   //flex: 1,
  //   //padding: 10,
  //   alignItems: "center",
  // },

  activeTab: {
    backgroundColor: "#2e7d32",
    borderRadius: 10,
  },

  overview: {
    backgroundColor: "#fff",
    //margin: 10,
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 12,
    elevation: 3,
    marginTop: 5,
  },

  heading: {
    fontSize: 16,
    fontWeight: "bold",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  label: {
    fontSize: 10,
    color: "#777",
  },

  value: {
    fontSize: 16,
    fontWeight: "bold",
  },

  chartBox: {
    height: 160,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginTop: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  placeholder: {
    padding: 20,
    alignItems: "center",
  },
  marketingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 10,
  },

  marketingTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },

  badge: {
    backgroundColor: "#1e88e5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },

  badgeText: {
    color: "#fff",
    fontSize: 12,
  },

  viewReports: {
    color: "#2e7d32",
    fontSize: 12,
  },

  marketingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 10,
  },

  circleCard: {
    width: "45%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
  },

  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 8,
    borderColor: "#1565c0",
    justifyContent: "center",
    alignItems: "center",
  },

  circleText: {
    fontWeight: "bold",
  },

  circleLabel: {
    marginTop: 10,
    fontSize: 12,
    color: "#777",
  },

  salesCard: {
    width: "50%",
    backgroundColor: "#1565c0",
    borderRadius: 12,
    padding: 15,
    justifyContent: "center",
  },

  salesTitle: {
    color: "#fff",
    fontSize: 12,
  },

  salesValue: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 5,
  },

  logsContainer: {
    backgroundColor: "#fff",
    margin: 10,
    borderRadius: 12,
    padding: 15,
  },

  logsTitle: {
    fontWeight: "bold",
    marginBottom: 10,
  },

  logItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  logTitle: {
    fontWeight: "600",
  },

  logSub: {
    fontSize: 12,
    color: "#777",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  // tabContainer: {
  //   paddingHorizontal: 10,
  // },

  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
    marginRight: 10,
  },

  activeTab: {
    backgroundColor: "#2e7d32",
  },
  sheetContainer: {
    padding: 15,
  },

  filterTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },

  section: {
    marginVertical: 10,
  },

  sectionTitle: {
    fontWeight: "600",
  },

  resetText: {
    color: "#6b4caf",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  // inputBox: {
  //   width: "48%",
  //   backgroundColor: "#f5f5f5",
  //   padding: 10,
  //   borderRadius: 10,
  // },

  inputText: {
    color: "#333",
  },

  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  quickBtn: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#f1f1f1",
  },

  dropdown: {
    width: "48%",
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },

  dropdownFull: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 10,
    marginTop: 5,
  },

  dropdownValue: {
    fontWeight: "600",
  },

  bottomBtns: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
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
  qcCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 15,
    marginBottom: 15,
    marginTop: 10,

    // Shadow (iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,

    // Elevation (Android)
    elevation: 3,
  },
  qcHeader: {
    fontSize: 16,
    fontWeight: "700",
    //marginBottom: 10,
    color: "#1f2937",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 10,
  },
  inputBox: {
    marginBottom: 10,
  },

  label: {
    fontSize: 14,
    color: Colors.grey,
    marginBottom: 2,
    fontWeight: "700",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
  },
  chartCard: {
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 12,
    padding: 10,
    elevation: 2,
  },

  chartTitle: {
    fontWeight: "bold",
    marginBottom: 10,
    fontSize: 14,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },

  tableHeader: {
    backgroundColor: "#e5e7eb",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },

  tableCell: {
    flex: 1,
    padding: 10,
    fontSize: 12,
    textAlign: "center",
    borderRightWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },

  rowEven: {
    backgroundColor: "#fff",
  },

  rowOdd: {
    backgroundColor: "#f9fafb",
  },
  tableContainer: {
    marginTop: 10,
    borderWidth: 1, // 🔥 FULL BORDER (left + right + top + bottom)
    borderColor: "#ddd",
  },
});

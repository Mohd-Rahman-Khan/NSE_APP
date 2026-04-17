import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
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

const screenWidth = Dimensions.get("window").width;

export default function Home() {
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
  const [variety, setVariety] = useState(null);
  const [selectedQC, setselectedQC] = useState({ id: 1, name: "SSCA Seed" });
  const [dashbooardData, setdashbooardData] = useState({
    // growers: {
    //   totalGrowers: 27,
    //   fpoGrowers: 2,
    //   selfGrowers: 25,
    //   totalDealers: 14,
    // },
    // productionPlan: {
    //   level: "HO",
    //   totalPlans: 63,
    //   totalArea: 80217.13,
    //   totalRawSeed: 255189.35,
    //   totalGoodSeed: 226524.287,
    //   mappedRoAndFarm: 6,
    //   mappedArea: 28254.72,
    // },
    // seedIntake: {
    //   totalSeed: 123517.0,
    // },
    // productionOverview: {
    //   targetArea: 80217.13,
    //   targetRawSeed: 255189.35,
    //   totalSeedIntake: 123517.0,
    //   achievementPercentage: 48.4,
    //   quarterlyData: {
    //     Q1: { target: 63797, achieved: 0 },
    //     Q2: { target: 63797, achieved: 0 },
    //     Q3: { target: 63797, achieved: 63570 },
    //     Q4: { target: 63797, achieved: 59947 },
    //   },
    // },
  });
  const [graphData, setGraphData] = useState({
    // status: null,
    // page: 0,
    // pageSize: 10,
    // id: null,
    // roId: null,
    // roName: null,
    // aoId: null,
    // aoName: null,
    // pcId: null,
    // pcName: null,
    // growerId: null,
    // growerName: null,
    // scheduleId: null,
    // planId: null,
    // totalPlan: null,
    // totalTargetRawSeed: null,
    // totalTargetGoodSeed: null,
    // registeredGrower: null,
    // cultivatedArea: null,
    // growerArea: null,
    // rejectedLandArea: null,
    // area: null,
    // rawSeed: null,
    // goodSeed: null,
    // plantingMaterial: null,
    // totalProgramme: null,
    // totalPlantingMaterialIssued: null,
    // totalFinalIntake: null,
    // achievement: null,
    // planType: null,
    // totalSeedIntake: null,
    // month: null,
    // year: null,
    // unitType: "HO",
    // unitId: null,
    // selfGrowers: null,
    // fpoGrowers: null,
    // expiredGrowers: null,
    // activeGrowers: null,
    // totalPlanCompleted: null,
    // totalPlanInProgress: null,
    // totalPlanRejected: null,
    // totalScheduleCompleted: null,
    // totalScheduleRejected: null,
    // totalScheduleInProgress: null,
    // roGroupData: [
    //   {
    //     aoGroupData: [],
    //     roId: 40,
    //     roName: "LUCKNOW ",
    //     rawSeed: 4200.454,
    //     goodSeed: 3700.4539999999997,
    //     area: 55.45,
    //     assignedArea: 1243,
    //     receivedRawSeed: 3000.0,
    //   },
    //   {
    //     aoGroupData: [],
    //     roId: 46,
    //     roName: "CHANDIGARH ",
    //     rawSeed: 100.0,
    //     goodSeed: 30.0,
    //     area: 100.0,
    //     assignedArea: 1243,
    //     receivedRawSeed: 0.0,
    //   },
    //   {
    //     aoGroupData: [],
    //     roId: 40,
    //     roName: "LUCKNOW ",
    //     rawSeed: 4200.454,
    //     goodSeed: 3700.4539999999997,
    //     area: 55.45,
    //     assignedArea: 1243,
    //     receivedRawSeed: 3000.0,
    //   },
    //   {
    //     aoGroupData: [],
    //     roId: 46,
    //     roName: "CHANDIGARH ",
    //     rawSeed: 100.0,
    //     goodSeed: 30.0,
    //     area: 100.0,
    //     assignedArea: 1243,
    //     receivedRawSeed: 0.0,
    //   },
    //   {
    //     aoGroupData: [],
    //     roId: 40,
    //     roName: "LUCKNOW ",
    //     rawSeed: 4200.454,
    //     goodSeed: 3700.4539999999997,
    //     area: 55.45,
    //     assignedArea: 1243,
    //     receivedRawSeed: 3000.0,
    //   },
    //   {
    //     aoGroupData: [],
    //     roId: 46,
    //     roName: "CHANDIGARH ",
    //     rawSeed: 100.0,
    //     goodSeed: 30.0,
    //     area: 100.0,
    //     assignedArea: 1243,
    //     receivedRawSeed: 0.0,
    //   },
    // ],
    // aoGroupData: null,
    // pcGroupData: null,
    // finYear: null,
    // finYearId: 19,
    // seedVariety: null,
    // seedVarietyId: null,
    // fromSeedClass: null,
    // fromSeedStage: null,
    // toSeedClass: null,
    // toSeedStage: null,
    // season: null,
    // seasonId: null,
    // crop: null,
    // cropId: null,
    // rejectedPlansList: [
    //   {
    //     id: 1,
    //     name: "2026-2027 | Rabi | Spinach | Arka Anupama | FS I",
    //     programme: "BS - FS I",
    //     area: 9,
    //     rawSeed: 1000,
    //     goodSeed: 900,
    //     pm: 800,
    //     status: "ACTIVE",
    //   },
    //   {
    //     id: 2,
    //     name: "2026-2027 | Rabi | Mustard | RH-749 | CS I",
    //     programme: "FS III - CS I",
    //     area: 5,
    //     rawSeed: 656,
    //     goodSeed: 654,
    //     pm: 434,
    //     status: "ACTIVE",
    //   },
    // ],
  });
  const [planDetailsList, setPlanDetailsList] = useState([]);
  const [qcDashboardData, setqcDashboardData] = useState("");
  const [marketingDashData, setmarketingDashData] = useState("");
  const [topDealer, settopDealer] = useState([]);
  const [financialYear, setfinancialYear] = useState([]);
  const [season, setseason] = useState([]);
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
          getProductionDashboardSummary();
          getProductionGraphData();
          getProductionPlanDetail();
          break;

        case "Marketing":
          getMarketingData();
          getTopDealer();
          break;

        case "Inventory":
          break;

        case "QC":
          getQCData("SSCA Seed");
          break;

        default:
          break;
      }
    }
  }, [selectedTab, userData]);
  useEffect(() => {
    getFinacialYears();
    getSeasonList();
  }, []);
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

  const getMarketingData = async () => {
    try {
      const payloadData = {
        unit: {
          unitId: 36,
          unitName: "WARANGAL AO",
        },
        unitType: "AO",
        startDate: "2025-10-16",
        endDate: "2026-04-16",
      };
      const encryptedPayload = encryptWholeObject(payloadData);
      const response = await apiRequest(
        API_ROUTES.INVENTORY_DASHBOARD,
        "post",
        encryptedPayload,
      );
      const decrypted = decryptAES(response);
      const parsedDecrypted = JSON.parse(decrypted);

      console.log("getInventoryData", parsedDecrypted);
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
      console.log(error, "line error");
      showErrorMessage("something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const getTopDealer = async () => {
    try {
      const payloadData = {
        startDate: "2024-10-17",
        endDate: "2026-04-17",
        hoId: "",
        aoId: [36],
        roId: [],
      };
      const encryptedPayload = encryptWholeObject(payloadData);
      const response = await apiRequest(
        API_ROUTES.TOP_DEALER,
        "post",
        encryptedPayload,
      );
      const decrypted = decryptAES(response);
      const parsedDecrypted = JSON.parse(decrypted);

      console.log("getTopDealer", parsedDecrypted);
      if (
        parsedDecrypted &&
        (parsedDecrypted?.statusCode === "200" ||
          parsedDecrypted?.statusCode === "201")
      ) {
        settopDealer(parsedDecrypted?.data);
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

  const getQCData = async (selectedQC) => {
    try {
      let url;
      if (selectedQC == "QTC-QCL Seed") {
        url = API_ROUTES.QTY_QCL_SEED_DASHBOARD;
      } else if (selectedQC == "QCL Seed") {
        url = API_ROUTES.QCL_SEED_DASHBOARD;
      } else {
        url = API_ROUTES.SSCA_SEED_DASHBOARD;
      }
      const payloadData = {};
      const encryptedPayload = encryptWholeObject(payloadData);
      const response = await apiRequest(url, "post", encryptedPayload);
      const decrypted = decryptAES(response);
      const parsedDecrypted = JSON.parse(decrypted);
      console.log("getQCData", url);
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
    //console.log("getProductionDashboardSummary___", userData);
    try {
      const payloadData = {
        roId: userData?.roId,
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
    }
  };

  const getProductionGraphData = async (filter = {}) => {
    try {
      const payloadData = {
        finYearId: financialYear[0]?.id,
        roId: userData?.roId,
        aoId: userData?.aoId,
        pcId: userData?.pcId,
        page: 0,
        pageSize: 25,
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
      console.log("getProductionGraphData__", userData);
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
    }
  };

  const getProductionPlanDetail = async (filter = {}) => {
    try {
      const payloadData = {
        finYearId: financialYear[0]?.id,
        roId: userData?.roId,
        aoId: userData?.aoId,
        pcId: userData?.pcId,
        page: 0,
        pageSize: 25,
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

      if (
        parsedDecrypted &&
        (parsedDecrypted?.statusCode === "200" ||
          parsedDecrypted?.statusCode === "201")
      ) {
        const top5Data = parsedDecrypted?.data.slice(0, 5);
        setPlanDetailsList(top5Data);
      }
    } catch (error) {
    } finally {
    }
  };

  const MarketingSection = () => {
    return (
      <View style={{ marginTop: 10 }}>
        {/* 🔹 Header */}
        <View style={styles.marketingHeader}>
          <Text style={styles.marketingTitle}>Marketing</Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>358 / 309 Hug</Text>
          </View>

          <Text style={styles.viewReports}>View Reports</Text>
        </View>

        {/* 🔹 Cards Row */}
        <View style={styles.marketingRow}>
          {/* Circle Progress */}
          <View style={styles.circleCard}>
            <View style={styles.circle}>
              <Text style={styles.circleText}>72%</Text>
            </View>
            <Text style={styles.circleLabel}>Retail Channel</Text>
          </View>

          {/* Sales Card */}
          <View style={styles.salesCard}>
            <Text style={styles.salesTitle}>TOTAL SALES</Text>
            <Text style={styles.salesValue}>$1.2M</Text>
          </View>
        </View>
      </View>
    );
  };

  const apllyProductionFillterCallback = useCallback(
    (
      selectedFinancialYear,
      selectedSeason,
      selectedCrop,
      selectedVariety,
      selectedClass,
    ) => {
      if (userData) {
        const filterData = {
          finYearId: selectedFinancialYear?.id || null,
          seasonId: selectedSeason?.id || null,
          cropId: selectedCrop?.id || null,
          varietyId: selectedVariety?.id || null,
          class: selectedClass?.name || null,
        };
        getProductionDashboardSummary(filterData);
        getProductionGraphData(filterData);
        getProductionPlanDetail(filterData);

        setshowFilterSheet(false);
      }
    },
    [userData],
  );

  return (
    <WrapperContainer isLoading={loading}>
      <CustomHeader
        data={userData}
        clickOnFilter={() => {
          setshowFilterSheet(true);
        }}
        bgColor="#eef3e8"
        showFilter={true}
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
          <View style={styles.sheetContainer}>
            {selectedTab == "Production" && (
              <ProductionFilterComp
                applyFilter={apllyProductionFillterCallback}
                financialYear={financialYear}
                season={season}
              />
            )}
            {/* <Text style={styles.filterTitle}>Filter by:</Text>
            Date Range
            <View style={styles.section}>
              <View style={styles.rowBetween}>
                <Text style={styles.sectionTitle}>Date Range</Text>
                <Text style={styles.resetText}>Reset</Text>
              </View>

              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.inputBox}
                  onPress={() => setShowFromPicker(true)}
                >
                  <Text style={styles.inputText}>
                    {fromDate.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.inputBox}
                  onPress={() => setShowToPicker(true)}
                >
                  <Text style={styles.inputText}>
                    {toDate.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.quickRow}>
                {["Today", "This Week", "This Month"].map((item) => (
                  <TouchableOpacity key={item} style={styles.quickBtn}>
                    <Text>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.row}>
              <View style={{ width: "48%" }}>
                <DropDown
                  label="Unit"
                  data={[
                    { id: 1, name: "All" },
                    { id: 2, name: "Unit 1" },
                  ]}
                  value={unit?.name}
                  selectItem={(item) => setUnit(item)}
                />
              </View>

              <View style={{ width: "48%" }}>
                <DropDown
                  label="Crop"
                  data={[
                    { id: 1, name: "All Crops" },
                    { id: 2, name: "Wheat" },
                  ]}
                  value={crop?.name}
                  selectItem={(item) => setCrop(item)}
                />
              </View>
            </View>
            <View style={styles.section}>
              <DropDown
                label="Variety"
                data={[
                  { id: 1, name: "All" },
                  { id: 2, name: "Variety A" },
                ]}
                value={variety?.name}
                selectItem={(item) => setVariety(item)}
              />
              <View style={styles.dropdownFull}>
                <Text>All</Text>
              </View>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Class</Text>
              <View style={styles.dropdownFull}>
                <Text>All</Text>
              </View>
            </View>
            <View style={styles.bottomBtns}>
              <TouchableOpacity style={styles.resetBtn}>
                <Text style={{ color: "#6b4caf" }}>Reset All</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.applyBtn}>
                <Text style={{ color: "#fff" }}>Apply Filters</Text>
              </TouchableOpacity>
            </View> */}
          </View>
        </CustomBottomSheet>
      )}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 80 }}
        style={styles.container}
      >
        {/* 🔹 Top Cards */}
        <Tabs selected={selectedTab} setSelected={setSelectedTab} />
        {selectedTab == "Production" ? (
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
                title="PROD PLAN"
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

            {/* <ProductionOverview dashbooardData={dashbooardData} /> */}
            <ProductionOverview graphData={graphData} />
            <PlanListComp data={planDetailsList} />
            <RejectedPlanList
              data={graphData?.rejectedPlansList?.slice(0, 5)}
            />
          </>
        ) : selectedTab == "Inventory" ? (
          // <MarketingSection />
          <View></View>
        ) : selectedTab == "QC" ? (
          <ScrollView style={{ paddingHorizontal: 20, marginTop: 20 }}>
            <DropDown
              label="Select Seed"
              data={[
                { id: 1, name: "SSCA Seed" },
                { id: 2, name: "QTC-QCL Seed" },
                { id: 3, name: "QCL Seed" },
              ]}
              value={selectedQC?.name || ""}
              selectItem={(item) => {
                setselectedQC(item);
                getQCData(item?.name);
              }}
            />
            <View style={styles.grid}>
              <StatCard
                title={
                  selectedQC?.name == "QTC-QCL Seed"
                    ? "Total Received"
                    : "Total Received"
                }
                value={
                  qcDashboardData?.totalReceived ||
                  qcDashboardData?.totalQtyResultReceived ||
                  0
                }
              />
              <StatCard
                title={
                  selectedQC?.name == "QTC-QCL Seed"
                    ? "Total Awaited"
                    : "Total Tested"
                }
                value={
                  qcDashboardData?.totalTested ||
                  qcDashboardData?.totalQtyResultsAwaited ||
                  0
                }
              />
              <StatCard
                title={
                  selectedQC?.name == "QTC-QCL Seed"
                    ? "Total Sent To QCL"
                    : "Total To Be Tested"
                }
                value={
                  qcDashboardData?.totalToBeTested ||
                  qcDashboardData?.totalQtySentToQcl ||
                  0
                }
              />
            </View>
          </ScrollView>
        ) : selectedTab == "Marketing" ? (
          <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
            <View style={styles.grid}>
              <StatCard
                title={"Cctive Dealer"}
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
            <FlatList
              data={topDealer}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View
                  style={{
                    backgroundColor: "#fff",
                    padding: 12,
                    borderRadius: 10,
                    marginBottom: 10,
                    elevation: 3,
                  }}
                >
                  <Text style={{ fontWeight: "bold" }}>{item.dealerName}</Text>
                  <Text>Region: {item.region}</Text>
                  <Text>Sales: {item.totalSales}</Text>
                  <Text>Qty: {item.totalQty}</Text>
                </View>
              )}
            />
          </View>
        ) : null}
      </ScrollView>
    </WrapperContainer>
  );
}

const StatCard = ({ title, value, subtitle, color }) => {
  const isMultiple = Array.isArray(value);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>

      {/* ✅ Value Section */}
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
              <Text style={styles.cardValue}>{value[0]?.value}</Text>
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
              <Text style={styles.cardValue}>{value[1]?.value}</Text>
            </View>
          </View>
        </View>
      ) : (
        // <Text style={styles.cardValue}>{value}</Text>
        <AnimatedNumbers
          includeComma
          animateToNumber={Number(value) || 0}
          fontStyle={{
            fontSize: 22,
            fontWeight: "bold",
          }}
          animationDuration={1000}
        />
      )}

      {/* <Text style={styles.cardSub}>{subtitle}</Text> */}
    </View>
  );
};

/////////////////////////////////////
// 🔹 Tabs
/////////////////////////////////////

const Tabs = ({ selected, setSelected }) => {
  const tabs = ["Production", "Marketing", "Inventory", "QC"];

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

/////////////////////////////////////
// 🔹 Production Overview
/////////////////////////////////////

const ProductionOverview = ({ graphData }) => {
  const getAreaChartData = () => {
    return graphData?.roGroupData?.flatMap((item) => [
      {
        value: item.area || 0,
        frontColor: "#2b6cb0",
        spacing: 4,
        onPress: () => {
          console.log("Area clicked:", item.roName);
          alert(`Area: ${item.roName} = ${item.area}`);
        },
      },
      {
        value: item.assignedArea || 0,
        frontColor: "#f59e0b",
        label: item.roName?.trim(),
        labelTextStyle: {
          textAlign: "center",
          width: 90,
          marginLeft: -20, // 👈 🔥 center align hack
          fontSize: 11,
        },
        spacing: 28, // 👈 🔥 BIG GAP between groups
        onPress: () => {
          console.log("Assigned clicked:", item.roName);
          alert(`Assigned Area: ${item.roName} = ${item.assignedArea}`);
        },
      },
    ]);
  };

  const getSeedChartData = () => {
    return graphData?.roGroupData?.flatMap((item) => [
      {
        value: item.rawSeed || 10,
        frontColor: "#2f855a",
        spacing: 4,
        onPress: () => {
          console.log("Raw Seed:", item.roName);
          alert(`Raw Seed: ${item.roName} = ${item.rawSeed}`);
        },
      },
      {
        value: item.receivedRawSeed || 10,
        frontColor: "#e53e3e",
        label: item.roName?.trim(),
        labelTextStyle: {
          textAlign: "center",
          width: 90,
          marginLeft: -20,
          fontSize: 11,
        },
        spacing: 28,
        onPress: () => {
          console.log("Received Seed:", item.roName);
          alert(`Received: ${item.roName} = ${item.receivedRawSeed}`);
        },
      },
    ]);
  };
  return (
    <View style={styles.overview}>
      <Text style={styles.heading}>Production Overview</Text>
      {/* 🔹 Area vs Assigned */}
      <Text style={{ fontWeight: "bold", marginTop: 20 }}>
        Area vs Assigned Area
      </Text>

      {/* Legend */}
      <View style={{ flexDirection: "row", marginTop: 8 }}>
        <View style={{ flexDirection: "row", marginRight: 15 }}>
          <View
            style={{
              width: 10,
              height: 10,
              backgroundColor: "#2b6cb0",
              marginRight: 5,
            }}
          />
          <Text>Area</Text>
        </View>

        <View style={{ flexDirection: "row" }}>
          <View
            style={{
              width: 10,
              height: 10,
              backgroundColor: "#f59e0b",
              marginRight: 5,
            }}
          />
          <Text>Assigned</Text>
        </View>
      </View>

      <BarChart
        data={getAreaChartData()}
        height={220}
        width={width - 120}
        barWidth={18} // 👈 thinner bars
        spacing={12} // 👈 overall spacing
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
        isAnimated
      />

      {/* 🔹 Raw Seed vs Received */}
      <Text style={{ fontWeight: "bold", marginTop: 25 }}>
        Raw Seed vs Received Raw Seed
      </Text>

      {/* Legend */}
      <View style={{ flexDirection: "row", marginTop: 8 }}>
        <View style={{ flexDirection: "row", marginRight: 15 }}>
          <View
            style={{
              width: 10,
              height: 10,
              backgroundColor: "#2f855a",
              marginRight: 5,
            }}
          />
          <Text>Raw Seed</Text>
        </View>

        <View style={{ flexDirection: "row" }}>
          <View
            style={{
              width: 10,
              height: 10,
              backgroundColor: "#e53e3e",
              marginRight: 5,
            }}
          />
          <Text>Received</Text>
        </View>
      </View>

      <BarChart
        data={getSeedChartData()}
        height={220}
        width={width - 120}
        barWidth={22}
        roundedTop
        noOfSections={5}
        spacing={20}
        initialSpacing={20}
        endSpacing={20}
        xAxisThickness={1}
        yAxisThickness={1}
        xAxisLabelTextStyle={{
          textAlign: "center",
          width: 70,
        }}
        isAnimated
      />
    </View>
  );
};
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
    padding: 10,
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
    margin: 10,
  },

  tab: {
    flex: 1,
    padding: 10,
    alignItems: "center",
  },

  activeTab: {
    backgroundColor: "#2e7d32",
    borderRadius: 10,
  },

  overview: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 15,
    borderRadius: 12,
  },

  heading: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
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
  tabContainer: {
    paddingHorizontal: 10,
  },

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

  inputBox: {
    width: "48%",
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 10,
  },

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

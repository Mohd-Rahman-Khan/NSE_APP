import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DrawerNav from "./DrawerNav";
import Notification from "../screens/app/Notification";
import UserProfile from "../screens/app/UserProfile";
import FieldInspectionReport from "../screens/app/home/fieldInspectionReport/FieldInspectionReport";
import DailyProgressReport from "../screens/app/home/DailyProgressReport";
import WebViewPreview from "../components/WebViewPreview";
import FiledInspectionReportDetails from "../screens/app/home/fieldInspectionReport/FiledInspectionReportDetails";
import SeedsIntakeHistory from "../screens/app/home/fieldInspectionReport/SeedsIntakeHistory";
import EditUserProfile from "../screens/app/EditUserProfile";
import Crop from "../screens/app/home/crop/Crop";
import CropDetails from "../screens/app/home/crop/CropDetails";
import EditCropDetails from "../screens/app/home/crop/EditCropDetails";
import StartInspection from "../screens/app/home/fieldInspectionReport/StartInspection";
import InspectionForm from "../screens/app/home/fieldInspectionReport/InspectionForm";
import ModifyPlan from "../screens/app/home/DPR/ModifyPlan";
import AssignPlan from "../screens/app/home/DPR/AssignPlan";
import DailyProgressReportList from "../screens/app/home/DPR/DailyProgressReportList";
import DPRDetails from "../screens/app/home/DPR/DPRDetails";
import DPREdit from "../screens/app/home/DPR/DPREdit";
import DPRSubmit from "../screens/app/home/DPR/DPRSubmit";
import DPRRevision from "../screens/app/home/DPR/DPRRevision";
import CreateNew from "../screens/app/home/DPR/CreateNew";
import OrchardProcessAllocation from "../screens/app/home/DPR/Orchard/OrchardProcessAllocation";
import OrchardDPRList from "../screens/app/home/DPR/Orchard/OrchardDPRList";
import NurseryDPRList from "../screens/app/home/DPR/Nursery/NurseryDPRList";
import NurseryProductionPlan from "../screens/app/home/DPR/Nursery/NurseryProductionPlan";
import AddOrchardDpr from "../screens/app/home/DPR/Orchard/AddOrchardDpr";
import AddNurseryDpr from "../screens/app/home/DPR/Nursery/AddNurseryDpr";
import MechanicalIssueDetails from "../screens/app/home/DPR/Crop/MechanicalIssueDetails";
import MechanicalAllocationProcessList from "../screens/app/home/DPR/Crop/MechanicalAllocationProcessList";
import SquarePlanList from "../screens/app/home/DPR/Crop/SquarePlanList";
import DprProcessAllocation from "../screens/app/home/DPR/Crop/DprProcessAllocation";
import ViewDprDetail from "../screens/app/home/DPR/Crop/ViewDprDetail";
import AddNewDpr from "../screens/app/home/DPR/Crop/AddNewDpr";
import DealerIndentsList from "../screens/app/home/DealerIndent/DealerIndentsList";
import DealerIndentDetail from "../screens/app/home/DealerIndent/DealerIndentDetail";
import CreateDealerIndent from "../screens/app/home/DealerIndent/CreateDealerIndent";

const Stack = createNativeStackNavigator();
const AppNavigation = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DrawerNav" component={DrawerNav} />
      <Stack.Screen name="Notification" component={Notification} />
      <Stack.Screen name="UserProfile" component={UserProfile} />
      <Stack.Screen
        name="FieldInspectionReport"
        component={FieldInspectionReport}
      />
      <Stack.Screen
        name="DailyProgressReport"
        component={DailyProgressReport}
      />
      <Stack.Screen name="WebViewPreview" component={WebViewPreview} />
      <Stack.Screen
        name="FiledInspectionReportDetails"
        component={FiledInspectionReportDetails}
      />
      <Stack.Screen name="SeedsIntakeHistory" component={SeedsIntakeHistory} />
      <Stack.Screen name="EditUserProfile" component={EditUserProfile} />
      <Stack.Screen name="Crop" component={Crop} />
      <Stack.Screen name="CropDetails" component={CropDetails} />
      <Stack.Screen name="EditCropDetails" component={EditCropDetails} />
      <Stack.Screen name="StartInspection" component={StartInspection} />
      <Stack.Screen name="InspectionForm" component={InspectionForm} />
      <Stack.Screen name="ModifyPlan" component={ModifyPlan} />
      <Stack.Screen name="AssignPlan" component={AssignPlan} />
      <Stack.Screen
        name="DailyProgressReportList"
        component={DailyProgressReportList}
      />
      <Stack.Screen name="DPRDetails" component={DPRDetails} />
      <Stack.Screen name="DPREdit" component={DPREdit} />
      <Stack.Screen name="DPRSubmit" component={DPRSubmit} />
      <Stack.Screen name="DPRRevision" component={DPRRevision} />
      <Stack.Screen name="CreateNewDPR" component={CreateNew} />
      <Stack.Screen name="SquarePlanList" component={SquarePlanList} />
      <Stack.Screen
        name="DprProcessAllocation"
        component={DprProcessAllocation}
      />
      <Stack.Screen
        name="MechanicalAllocationProcessList"
        component={MechanicalAllocationProcessList}
      />
      <Stack.Screen
        name="MechanicalIssueDetails"
        component={MechanicalIssueDetails}
      />
      <Stack.Screen name="DealerIndentsList" component={DealerIndentsList} />
      <Stack.Screen name="DealerIndentDetail" component={DealerIndentDetail} />
      <Stack.Screen name="CreateDealerIndent" component={CreateDealerIndent} />
      <Stack.Screen name="ViewDprDetail" component={ViewDprDetail} />
      <Stack.Screen name="OrchardDPRList" component={OrchardDPRList} />

      <Stack.Screen name="NurseryDPRList" component={NurseryDPRList} />
      <Stack.Screen
        name="NurseryProductionPlan"
        component={NurseryProductionPlan}
      />

      <Stack.Screen
        name="OrchardProcessAllocation"
        component={OrchardProcessAllocation}
      />
      <Stack.Screen name="AddOrchardDpr" component={AddOrchardDpr} />
      <Stack.Screen name="AddNurseryDpr" component={AddNurseryDpr} />
      <Stack.Screen name="AddNewDpr" component={AddNewDpr} />
    </Stack.Navigator>
  );
};

export default AppNavigation;

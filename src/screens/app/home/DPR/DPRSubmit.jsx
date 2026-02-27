import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import React, { useState, useEffect } from "react";
import WrapperContainer from "../../../../utils/WrapperContainer";
import InnerHeader from "../../../../components/InnerHeader";
import Colors from "../../../../utils/Colors";
import FontFamily from "../../../../utils/FontFamily";
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from "../../../../utils/responsiveSize";
import CustomButton from "../../../../components/CustomButton";
import {
  showErrorMessage,
  showSuccessMessage,
} from "../../../../utils/HelperFunction";
import { apiRequest } from "../../../../services/APIRequest";
import { API_ROUTES } from "../../../../services/APIRoutes";
import { decryptAES, encryptWholeObject } from "../../../../utils/decryptData";
import { getUserData } from "../../../../utils/Storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import PropTypes from "prop-types";

const DPRSubmit = ({ route }) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const { data } = route.params;
  const [userData, setUserData] = useState();
  const [mechanicalData, setMechanicalData] = useState([]);
  const [agricultureData, setAgricultureData] = useState([]);
  const [labourData, setLabourData] = useState([]);
  // Add these states to your component
  const [showMaterialTypeDropdown, setShowMaterialTypeDropdown] =
    useState(false);
  const [showMaterialDropdown, setShowMaterialDropdown] = useState(false);
  const materialTypeList = [
    "VALUE_ADDED",
    "PACKAGING_MATERIAL",
    "AGRO_CHEMICAL",
    "SEED",
    "SAPLING",
  ];
  const [materialList, setMaterialList] = useState([]);
  const [currentAgricultureIndex, setCurrentAgricultureIndex] = useState(0);
  const fetchMaterialList = async (materialType, index) => {
    try {
      setLoading(true);
      const payload = {
        materialType: materialType,
      };

      const encryptedPayload = encryptWholeObject(payload);

      const response = await apiRequest(
        API_ROUTES.MATERIAL_LIST,
        "POST",
        encryptedPayload
      );

      const decryptedResponse = decryptAES(response);
      const parsedResponse = JSON.parse(decryptedResponse);
      if (
        parsedResponse?.status === "SUCCESS" &&
        parsedResponse?.statusCode === "200"
      ) {
        setMaterialList(parsedResponse?.data);
        setCurrentAgricultureIndex(index);
        console.log(parsedResponse?.data, "line 91");
      } else {
        showErrorMessage("Unable to fetch material list");
      }
    } catch (error) {
      console.error("Error fetching material list:", error);
      showErrorMessage("Error fetching material list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const userData = await getUserData();
    setUserData(userData);
  };

  useEffect(() => {
    if (data.dprMechanicals && data.dprMechanicals.length > 0) {
      const initialMechanicalData = data.dprMechanicals.map((mech, index) => ({
        id: mech.id || index,
        operatorName: mech.operatorName || "",
        cpNumber: mech.cpNumber || "",
      }));
      setMechanicalData(initialMechanicalData);
    }

    // Initialize agriculture data with correct structure
    if (data.dprAgricultures && data.dprAgricultures.length > 0) {
      setAgricultureData(data.dprAgricultures);
    } else {
      // Add default agriculture entry with correct structure
      setAgricultureData([
        {
          material: "",
          itemId: "",
          qty: "",
          uom: "",
        },
      ]);
    }

    // Initialize labour data with correct structure
    if (data.dprLabour && data.dprLabour.length > 0) {
      setLabourData(data.dprLabour);
    } else {
      // Add default labour entry with correct structure
      setLabourData([
        {
          operation: data.operationName,
          name: "",
          actualTime: "",
          otTime: "",
          totalHours: "0",
        },
      ]);
    }
  }, [data]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const updateMechanicalField = (index, field, value) => {
    setMechanicalData((prev) => {
      const newData = [...prev];
      newData[index] = {
        ...newData[index],
        [field]: value,
      };
      return newData;
    });
  };

  const updateAgricultureField = (index, field, value) => {
    setAgricultureData((prev) => {
      const newData = [...prev];
      newData[index] = {
        ...newData[index],
        [field]: value,
      };
      return newData;
    });
  };

  const updateLabourField = (index, field, value) => {
    setLabourData((prev) => {
      const newData = [...prev];
      newData[index] = {
        ...newData[index],
        [field]: value,
      };
      return newData;
    });
  };

  const addAgricultureEntry = () => {
    const newId = Math.max(...agricultureData.map((item) => item.id), 0) + 1;
    setAgricultureData((prev) => [
      ...prev,
      {
        id: newId,
        material: "",
        itemId: "",
        qty: "",
        uom: "",
      },
    ]);
  };

  const removeAgricultureEntry = (index) => {
    if (agricultureData.length === 1) {
      showErrorMessage("At least one agriculture entry is required");
      return;
    }
    setAgricultureData((prev) => prev.filter((_, i) => i !== index));
  };

  const addLabourEntry = () => {
    const newId = Math.max(...labourData.map((item) => item.id), 0) + 1;
    setLabourData((prev) => [
      ...prev,
      {
        id: newId,
        name: "",
        actualTime: "",
        otTime: "",
        totalHours: "0",
      },
    ]);
  };

  const removeLabourEntry = (index) => {
    if (labourData.length === 1) {
      showErrorMessage("At least one labour entry is required");
      return;
    }
    setLabourData((prev) => prev.filter((_, i) => i !== index));
  };

  const renderProcessDetails = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Process Details</Text>

      {/* First Row */}
      <View style={styles.row}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>{formatDate(data.reportDate)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Square Name</Text>
          <Text style={styles.detailValue}>{data.squareName || "N/A"}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Operation</Text>
          <Text style={styles.detailValue}>{data.operationName || "N/A"}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Financial Year</Text>
          <Text style={styles.detailValue}>{data.finYear || "N/A"}</Text>
        </View>
      </View>

      {/* Second Row */}
      <View style={styles.row}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Season</Text>
          <Text style={styles.detailValue}>{data.season || "N/A"}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Class</Text>
          <Text style={styles.detailValue}>{data.fromSeedClass || "N/A"}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Stage</Text>
          <Text style={styles.detailValue}>{data.fromSeedStage || "-"}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Required Output (ha)</Text>
          <Text style={styles.detailValue}>
            {data.requiredOutputArea || "N/A"}
          </Text>
        </View>
      </View>

      {/* Additional Info */}
      <View style={styles.additionalInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Crop:</Text>
          <Text style={styles.infoValue}>{data.crop || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Seed Variety:</Text>
          <Text style={styles.infoValue}>{data.seedVariety || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Work Type:</Text>
          <Text style={styles.infoValue}>
            {data.workType
              ? data.workType.charAt(0).toUpperCase() + data.workType.slice(1)
              : "N/A"}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Sub Unit:</Text>
          <Text style={styles.infoValue}>{data.subUnitName || "N/A"}</Text>
        </View>
      </View>
    </View>
  );

  const renderMechanicalSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Mechanical</Text>

      {data?.dprMechanicals.map((mech, index) => {
        const currentMechData = mechanicalData[index] || {};
        return (
          <View key={mech.id || index} style={styles.mechContainer}>
            <View style={styles.serialContainer}>
              <Text style={styles.serialLabel}>Serial No</Text>
              <Text style={styles.serialNumber}>{index + 1}</Text>
            </View>

            <View style={styles.mechDetails}>
              <View style={styles.mechRow}>
                <Text style={styles.mechLabel}>Equipment Name</Text>
                <Text style={styles.mechValue}>
                  {mech.equipmentName || "N/A"}
                </Text>
              </View>

              <View style={styles.mechRow}>
                <Text style={styles.mechLabel}>Est. Hours</Text>
                <Text style={styles.mechValue}>
                  {mech.estimatedHours || "N/A"}
                </Text>
              </View>

              {mech.operator && (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Operator Name</Text>
                    <TextInput
                      style={styles.textInput}
                      value={currentMechData.operatorName || ""}
                      onChangeText={(text) =>
                        updateMechanicalField(index, "operatorName", text)
                      }
                      placeholder="Enter operator name"
                      placeholderTextColor={Colors.grey}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>CP Number *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={currentMechData.cpNumber || ""}
                      onChangeText={(text) =>
                        updateMechanicalField(index, "cpNumber", text)
                      }
                      placeholder="Enter CP number"
                      placeholderTextColor={Colors.grey}
                      keyboardType="numeric"
                    />
                  </View>
                </>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );

  const renderAgricultureSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Agriculture</Text>

      {agricultureData.map((agri, index) => (
        <View key={agri?.id} style={styles.agriContainer}>
          <View style={styles.serialContainer}>
            <Text style={styles.serialLabel}>Serial No</Text>
            <Text style={styles.serialNumber}>{index + 1}</Text>
            {agricultureData.length > 1 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeAgricultureEntry(index)}
              >
                <Icon name="delete" size={20} color={Colors.error} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.agriDetails}>
            {/* <aterial Type Drop Down */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Material Type *</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => {
                  setCurrentAgricultureIndex(index);
                  setShowMaterialTypeDropdown(true);
                }}
              >
                <Text
                  style={[
                    styles.dropdownButtonText,
                    !agri.materialType && styles.dropdownButtonPlaceholder,
                  ]}
                >
                  {agri.materialType || "Select Material Type"}
                </Text>
                <Icon name="arrow-drop-down" size={24} color={Colors.grey} />
              </TouchableOpacity>
            </View>
            {/* Material Dropdown */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Material *</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => {
                  if (!agri.materialType) {
                    showErrorMessage("Please select Material Type first");
                    return;
                  }
                  setCurrentAgricultureIndex(index);
                  setShowMaterialDropdown(true);
                  // Material list will be fetched based on selected materialType
                }}
              >
                <Text
                  style={[
                    styles.dropdownButtonText,
                    !agri.material && styles.dropdownButtonPlaceholder,
                  ]}
                >
                  {agri.material || "Select Material"}
                </Text>
                <Icon name="arrow-drop-down" size={24} color={Colors.grey} />
              </TouchableOpacity>
            </View>

            {agri.uom && <Text style={styles.uomText}>Unit: {agri.uom}</Text>}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Quantity (kg) *</Text>
              <TextInput
                style={styles.textInput}
                value={agri.qty || ""}
                onChangeText={(text) =>
                  updateAgricultureField(index, "qty", text)
                }
                placeholder="Enter quantity"
                placeholderTextColor={Colors.grey}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.addButton} onPress={addAgricultureEntry}>
        <Icon name="add" size={20} color={Colors.white} />
        <Text style={styles.addButtonText}>Add More</Text>
      </TouchableOpacity>

      {/* Material Type Dropdown Modal */}
      <Modal
        visible={showMaterialTypeDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMaterialTypeDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMaterialTypeDropdown(false)}
        >
          <View style={styles.dropdownModal}>
            <FlatList
              data={materialTypeList}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownItem}
                  onPress={async () => {
                    updateAgricultureField(
                      currentAgricultureIndex,
                      "materialType",
                      item
                    );
                    updateAgricultureField(
                      currentAgricultureIndex,
                      "material",
                      ""
                    );
                    setShowMaterialTypeDropdown(false);
                    await fetchMaterialList(item, currentAgricultureIndex);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{item}</Text>
                </TouchableOpacity>
              )}
              style={styles.dropdownList}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Material Dropdown Modal */}
      <Modal
        visible={showMaterialDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMaterialDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMaterialDropdown(false)}
        >
          <View style={styles.dropdownModal}>
            <FlatList
              data={materialList}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  key={index}
                  onPress={() => {
                    updateAgricultureField(
                      currentAgricultureIndex,
                      "material",
                      item.itemName
                    );
                    updateAgricultureField(
                      currentAgricultureIndex,
                      "itemId",
                      item.id.toString() // Convert to string to match your structure
                    );
                    updateAgricultureField(
                      currentAgricultureIndex,
                      "uom",
                      item.uom // Add the UOM field
                    );
                    console.log(item, "selected Item List Material Drop Down");
                    setShowMaterialDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>
                    {item?.itemName || "N/A"}
                  </Text>
                  {item.uom && (
                    <Text style={styles.dropdownItemSubText}>
                      UOM: {item.uom}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
              style={styles.dropdownList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );

  const renderLabourSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Labour Details</Text>

      {labourData.map((labour, index) => (
        <View key={labour?.id} style={styles.labourContainer}>
          <View style={styles.serialContainer}>
            <Text style={styles.serialLabel}>Serial No</Text>
            <Text style={styles.serialNumber}>{index + 1}</Text>
            {labourData.length > 1 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeLabourEntry(index)}
              >
                <Icon name="delete" size={20} color={Colors.error} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.labourDetails}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Operation</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: Colors.lightBackground },
                ]}
                value={data?.operationName || ""}
                editable={false}
                placeholderTextColor={Colors.grey}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Labour Name *</Text>
              <TextInput
                style={styles.textInput}
                value={labour.name || ""}
                onChangeText={(text) => updateLabourField(index, "name", text)}
                placeholder="Enter labour name"
                placeholderTextColor={Colors.grey}
              />
            </View>

            <View style={styles.row}>
              <View
                style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}
              >
                <Text style={styles.inputLabel}>Actual Time *</Text>
                <TextInput
                  style={styles.textInput}
                  value={labour.actualTime || ""}
                  onChangeText={(text) =>
                    updateLabourField(index, "actualTime", text)
                  }
                  placeholder="Actual time"
                  placeholderTextColor={Colors.grey}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>OT Time</Text>
                <TextInput
                  style={styles.textInput}
                  value={labour.otTime || ""}
                  onChangeText={(text) =>
                    updateLabourField(index, "otTime", text)
                  }
                  placeholder="OT time"
                  placeholderTextColor={Colors.grey}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.addButton} onPress={addLabourEntry}>
        <Icon name="add" size={20} color={Colors.white} />
        <Text style={styles.addButtonText}>Add More</Text>
      </TouchableOpacity>
    </View>
  );

  const validateMechanicalEntries = () => {
    if (
      userData?.unitType === "BLOCK" &&
      userData?.subUnitType === "WORKSHOP"
    ) {
      for (let i = 0; i < mechanicalData.length; i++) {
        if (!mechanicalData[i].cpNumber.trim()) {
          showErrorMessage(`Please Enter the CP Number for Equipment ${i + 1}`);
          return false;
        }
      }
    }
    return true;
  };

  const validateAgricultureEntries = () => {
    if (userData?.unitType === "CHAK") {
      for (let i = 0; i < agricultureData.length; i++) {
        const agri = agricultureData[i];
        if (!agri.itemId.trim() || !agri.material.trim() || !agri.qty.trim()) {
          showErrorMessage(
            `Please fill all fields for Agriculture entry ${i + 1}`
          );
          return false;
        }
      }
    }
    return true;
  };

  const validateLabourEntries = () => {
    if (userData?.unitType === "CHAK") {
      for (let i = 0; i < labourData.length; i++) {
        const labour = labourData[i];
        if (!labour.name.trim() || !labour.actualTime.trim()) {
          showErrorMessage(
            `Please fill all required fields for Labour entry ${i + 1}`
          );
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    // Validation
    if (!validateMechanicalEntries()) return;
    if (!validateAgricultureEntries()) return;
    if (!validateLabourEntries()) return;

    try {
      setLoading(true);
      const submitData = {
        ...data,
        unitId:
          userData?.unitType === "BLOCK" ? userData?.blockId : userData?.chakId,
        unitType: userData?.unitType,
        dprStatus:
          userData?.unitType === "BLOCK" && userData?.subUnitType === "WORKSHOP"
            ? "PENDING_WITH_CHAK_INCHARGE"
            : "SUBMITTED",
        dprMechanicals: data.dprMechanicals.map((mech, index) => ({
          ...mech,
          operatorName: mechanicalData[index]?.operatorName || "",
          cpNumber: mechanicalData[index]?.cpNumber || "",
        })),
        dprAgricultures: agricultureData.map((agri) => ({
          material: agri.material,
          itemId: agri.itemId,
          qty: agri.qty,
          uom: agri.uom || "",
        })),
        dprLabour: labourData.map((labour) => ({
          name: labour.name,
          actualTime: labour.actualTime,
          otTime: labour.otTime || "",
          hours:
            (Number.parseFloat(labour.actualTime) || 0) +
            (Number.parseFloat(labour.otTime) || 0),
        })),
      };

      console.log(submitData, "submitData");
      const encryptedPayload = encryptWholeObject(submitData);
      const response = await apiRequest(
        API_ROUTES.DP_REPORT_UPDATE,
        "post",
        encryptedPayload
      );
      const decrypted = decryptAES(response);
      const parsedDecrypted = JSON.parse(decrypted);
      console.log(parsedDecrypted, "line 543");
      if (
        parsedDecrypted?.status === "SUCCESS" &&
        parsedDecrypted?.statusCode === "200"
      ) {
        showSuccessMessage(
          parsedDecrypted?.message || "Success, DPR Updated successfully "
        );
        navigation.goBack();
      } else {
        showErrorMessage(parsedDecrypted?.message || "Error");
      }
    } catch (error) {
      console.log(error, "line error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <WrapperContainer isLoading={loading}>
      <InnerHeader title={"DPR Submit"} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? moderateScale(40) : 0}
      >
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderProcessDetails()}

          {/* Show sections based on user role and data availability */}
          {userData?.unitType === "BLOCK" &&
            userData?.subUnitType === "WORKSHOP" &&
            renderMechanicalSection()}

          {userData?.subUnitType != "WORKSHOP" && renderAgricultureSection()}
          {userData?.subUnitType != "WORKSHOP" && renderLabourSection()}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <CustomButton
              text={"Cancel"}
              buttonStyle={styles.cancelButton}
              textStyle={styles.cancelButtonText}
              handleAction={handleCancel}
            />
            <CustomButton
              text={"Submit"}
              buttonStyle={styles.issueButton}
              textStyle={styles.issueButtonText}
              handleAction={handleSubmit}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </WrapperContainer>
  );
};

DPRSubmit.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.object.isRequired,
  }).isRequired,
};

export default DPRSubmit;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: moderateScale(16),
    paddingBottom: moderateScale(20),
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),
    marginBottom: moderateScaleVertical(16),
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: moderateScale(5),
  },
  sectionTitle: {
    fontSize: textScale(16),
    fontFamily: FontFamily.PoppinsSemiBold,
    color: Colors.greenColor,
    marginBottom: moderateScaleVertical(16),
    borderLeftWidth: moderateScale(3),
    paddingLeft: moderateScale(10),
    borderColor: Colors.primary,
    paddingTop: moderateScale(10),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: moderateScaleVertical(12),
    padding: moderateScale(5),
  },
  detailItem: {
    flex: 1,
    marginHorizontal: moderateScale(4),
  },
  detailLabel: {
    fontSize: textScale(11),
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.textColor,
    marginBottom: moderateScaleVertical(4),
  },
  detailValue: {
    fontSize: textScale(13),
    fontFamily: FontFamily.PoppinsRegular,
    color: Colors.black,
    backgroundColor: Colors.lightBackground,
    padding: moderateScale(10),
    borderRadius: moderateScale(6),
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  additionalInfo: {
    marginTop: moderateScaleVertical(8),
    paddingTop: moderateScaleVertical(12),
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    padding: moderateScale(10),
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: moderateScaleVertical(5),
  },
  infoLabel: {
    fontSize: textScale(12),
    fontFamily: FontFamily.PoppinsRegular,
    color: Colors.textColor,
    flex: 1,
  },
  infoValue: {
    fontSize: textScale(13),
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.black,
    flex: 1,
    textAlign: "right",
  },
  mechContainer: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(6),
    padding: moderateScale(12),
    marginBottom: moderateScaleVertical(8),
  },
  agriContainer: {
    backgroundColor: Colors.lightBackground,
    borderRadius: moderateScale(6),
    padding: moderateScale(12),
    marginBottom: moderateScaleVertical(8),
  },
  labourContainer: {
    backgroundColor: Colors.lightBackground,
    borderRadius: moderateScale(6),
    padding: moderateScale(12),
    marginBottom: moderateScaleVertical(8),
  },
  serialContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: moderateScaleVertical(8),
    paddingBottom: moderateScaleVertical(8),
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  serialLabel: {
    fontSize: textScale(14),
    fontFamily: FontFamily.PoppinsRegular,
    color: Colors.textColor,
  },
  serialNumber: {
    fontSize: textScale(12),
    fontFamily: FontFamily.PoppinsSemiBold,
    color: Colors.textColor,
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(4),
    borderWidth: moderateScale(1),
    borderColor: Colors.textColor,
  },
  removeButton: {
    padding: moderateScale(5),
  },
  mechDetails: {
    paddingHorizontal: moderateScale(4),
    gap: moderateScaleVertical(5),
  },
  agriDetails: {
    paddingHorizontal: moderateScale(4),
    gap: moderateScaleVertical(8),
  },
  labourDetails: {
    paddingHorizontal: moderateScale(4),
    gap: moderateScaleVertical(8),
  },
  mechRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: moderateScaleVertical(8),
  },
  mechLabel: {
    fontSize: textScale(12),
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.textColor,
    flex: 1,
  },
  mechValue: {
    fontSize: textScale(12),
    fontFamily: FontFamily.PoppinsRegular,
    color: Colors.black,
    flex: 1,
    textAlign: "right",
    padding: moderateScale(8),
    borderRadius: moderateScale(4),
  },
  inputContainer: {
    marginBottom: moderateScaleVertical(12),
  },
  inputLabel: {
    fontSize: textScale(12),
    fontFamily: FontFamily.PoppinsMedium,
    color: Colors.textColor,
    marginBottom: moderateScaleVertical(4),
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: moderateScale(6),
    padding: moderateScale(12),
    fontSize: textScale(14),
    color: Colors.black,
    backgroundColor: Colors.white,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.greenColor,
    padding: moderateScale(12),
    borderRadius: moderateScale(6),
    marginTop: moderateScaleVertical(8),
  },
  addButtonText: {
    color: Colors.white,
    fontSize: textScale(14),
    fontFamily: FontFamily.PoppinsMedium,
    marginLeft: moderateScale(8),
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: moderateScale(10),
  },
  cancelButton: {
    backgroundColor: Colors.white,
    width: "48%",
    borderRadius: moderateScale(8),
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.gray,
    padding: moderateScale(12),
  },
  cancelButtonText: {
    color: Colors.textColor,
    fontSize: textScale(14),
    fontFamily: FontFamily.PoppinsMedium,
  },
  issueButton: {
    backgroundColor: Colors.greenColor,
    width: "48%",
    borderRadius: moderateScale(8),
    alignItems: "center",
    padding: moderateScale(12),
  },
  issueButtonText: {
    color: Colors.white,
    fontSize: textScale(14),
    fontFamily: FontFamily.PoppinsMedium,
  },

  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: moderateScale(6),
    padding: moderateScale(12),
    backgroundColor: Colors.white,
    minHeight: moderateScale(48),
  },
  dropdownButtonText: {
    fontSize: textScale(14),
    color: Colors.black,
    flex: 1,
  },
  dropdownButtonPlaceholder: {
    color: Colors.grey,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownModal: {
    width: "80%",
    maxHeight: "60%",
    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),
    padding: moderateScale(10),
  },
  dropdownList: {
    maxHeight: moderateScaleVertical(300),
  },
  dropdownItem: {
    padding: moderateScale(12),
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  dropdownItemText: {
    fontSize: textScale(14),
    color: Colors.black,
    fontFamily: FontFamily.PoppinsRegular,
  },
  dropdownItemSubText: {
    fontSize: textScale(10),
    color: Colors.grey,
    fontFamily: FontFamily.PoppinsRegular,
    marginTop: moderateScaleVertical(2),
  },
  uomText: {
    fontSize: textScale(10),
    color: Colors.greenColor,
    fontFamily: FontFamily.PoppinsRegular,
    marginTop: moderateScaleVertical(4),
    fontStyle: "italic",
  },
});

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Platform,
  Modal,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";

import WrapperContainer from "../../../../utils/WrapperContainer";
import InnerHeader from "../../../../components/InnerHeader";
import DropDown from "../../../../components/DropDown";
import Colors from "../../../../utils/Colors";
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from "../../../../utils/responsiveSize";
import FontFamily from "../../../../utils/FontFamily";
import { decryptAES, encryptWholeObject } from "../../../../utils/decryptData";
import { apiRequest } from "../../../../services/APIRequest";
import { API_ROUTES } from "../../../../services/APIRoutes";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { getUserData, getUserToken } from "../../../../utils/Storage";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import {
  showErrorMessage,
  showSuccessMessage,
} from "../../../../utils/HelperFunction";

/* ================= COMPONENT ================= */

const CreateDealerIndent = ({ route }) => {
  const navigation = useNavigation();
  const isEdit = route.params?.isEdit || false;
  const editIndent = route.params?.indent || null;
  const [loading, setLoading] = useState(false);

  /* ================= STATES ================= */

  const [advancedReceived, setAdvancedReceived] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeDateField, setActiveDateField] = useState(null);

  const [indentDateObj, setIndentDateObj] = useState(null);
  const [expectedDateObj, setExpectedDateObj] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [indentFile, setindentFile] = useState([]);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    party: null,
    communication: null,
    communicationValue: "",
    indentDate: "",
    expectedDate: "",
    season: null,
    existingIndent: null,
    materialType: null,
    paymentMode: null,
    paymentDate: "",
    amount: "",
    indentNumber: null,
    txnOrChequeNo: "",
  });

  const [items, setItems] = useState([{ id: Date.now(), item: null, qty: "" }]);

  /* ================= DUMMY DATA ================= */
  const modeList = [
    { id: 1, name: "Phone" },
    { id: 2, name: "Email" },
    { id: 3, name: "Direct" },
  ];
  const materialTypeList = [
    { id: 1, name: "SEED" },
    { id: 2, name: "VALUE_ADDED" },
    { id: 3, name: "SAPLING" },
  ];
  const paymentModeList = [
    { id: 1, name: "CASH" },
    { id: 2, name: "UPI" },
    { id: 3, name: "CHEQUE" },
    { id: 4, name: "CARD" },
    { id: 5, name: "BANK" },
  ];

  const [seasonList, setseasonList] = useState([]);
  const [materialList, setmaterialList] = useState([]);
  const [partyList, setpartyList] = useState([]);
  const [indentNumbers, setIndentNumbers] = useState([]);

  useEffect(() => {
    fetchSeasonList();
    fetchMaterialList();
    fetchPartyList();
  }, []);

  useEffect(() => {
    if (isEdit && editIndent) {
      const partyObj = {
        id: editIndent.dealerId,
        comName: editIndent.dealerName,
        partyCode: editIndent.dealerCode,
      };

      setForm({
        party: partyObj,
        communication: {
          name: editIndent.modeOfCommunication,
        },
        communicationValue: editIndent.communicationValue || "",
        indentDate: formatDate(editIndent.indentDate),
        expectedDate: formatDate(editIndent.deliveryDate),
        season: {
          id: editIndent.seasonId,
          seasonType: editIndent.seasonName,
        },
        materialType: {
          name: editIndent.materialType,
        },
        paymentMode: editIndent.paymentMode
          ? { name: editIndent.paymentMode }
          : null,
        paymentDate: formatDate(editIndent.paymentDate),
        amount: editIndent.receivedAmount || "",
        txnOrChequeNo: editIndent.chequeNo || "",
        indentNumber: {
          dealerIndentNo: editIndent.existingIndentNo,
        },
      });

      setAdvancedReceived(editIndent.advanceReceived);

      // ⭐ IMPORTANT
      getIndentNumber(partyObj);

      setItems(
        editIndent.dealerIndentItems.map((it) => ({
          id: Date.now() + Math.random(),
          item: it,
          qty: String(it.qty),
        })),
      );

      setindentFile(editIndent.indentFile || []);
    }
  }, [isEdit, editIndent]);

  const fetchPartyList = async () => {
    setLoading(true);
    const userData = await getUserData();

    try {
      const payloadData = {
        roId: userData?.roId,
        partyType: "DEALER",
      };

      const encryptedPayload = encryptWholeObject(payloadData);

      const response = await apiRequest(
        API_ROUTES.PARTY_LIST_DEALER_INDENT,
        "post",
        encryptedPayload,
      );

      const decrypted = decryptAES(response);
      const parsed = JSON.parse(decrypted);

      console.log("decrypted", parsed);

      if (parsed?.status === "SUCCESS" && parsed?.statusCode === "200") {
        const newData = parsed?.data;

        setpartyList(newData);
      } else {
        showErrorMessage(parsed?.message || "Invalid response");
      }
    } catch (err) {
      console.log("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterialList = async () => {
    setLoading(true);

    try {
      const payloadData = {
        materialType: "",
      };

      const encryptedPayload = encryptWholeObject(payloadData);

      const response = await apiRequest(
        API_ROUTES.MATERIAL_LIST,
        "post",
        encryptedPayload,
      );

      const decrypted = decryptAES(response);
      const parsed = JSON.parse(decrypted);

      if (parsed?.status === "SUCCESS" && parsed?.statusCode === "200") {
        const newData = parsed?.data;

        setmaterialList(newData);
      } else {
        showErrorMessage(parsed?.message || "Invalid response");
      }
    } catch (err) {
      console.log("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeasonList = async () => {
    setLoading(true);

    try {
      const payloadData = {};

      const encryptedPayload = encryptWholeObject(payloadData);

      const response = await apiRequest(
        API_ROUTES.SEASON,
        "post",
        encryptedPayload,
      );

      const decrypted = decryptAES(response);
      const parsed = JSON.parse(decrypted);

      if (parsed?.status === "SUCCESS" && parsed?.statusCode === "200") {
        const newData = parsed?.data;

        setseasonList(newData);
      } else {
        showErrorMessage(parsed?.message || "Invalid response");
      }
    } catch (err) {
      console.log("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const getIndentNumber = async (item) => {
    setLoading(true);

    try {
      const payloadData = {
        dealerId: item?.id,
      };

      const encryptedPayload = encryptWholeObject(payloadData);

      const response = await apiRequest(
        API_ROUTES.GET_INDENT_NUMBER,
        "post",
        encryptedPayload,
      );

      const decrypted = decryptAES(response);
      const parsed = JSON.parse(decrypted);

      if (parsed?.status === "SUCCESS" && parsed?.statusCode === "200") {
        const newData = parsed?.data;

        setIndentNumbers(newData);
      } else {
        showErrorMessage(parsed?.message || "Invalid response");
      }
    } catch (err) {
      console.log("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);

    if (!selectedDate) return;

    if (activeDateField === "INDENT") {
      setIndentDateObj(selectedDate);
      setForm((p) => ({
        ...p,
        indentDate: formatDate(selectedDate),
      }));
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.indentDate;
        return copy;
      });
    }

    if (activeDateField === "EXPECTED") {
      setExpectedDateObj(selectedDate);
      setForm((p) => ({
        ...p,
        expectedDate: formatDate(selectedDate),
      }));
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.expectedDate;
        return copy;
      });
    }
  };

  /* ================= ITEM HANDLERS ================= */

  const addItem = () => {
    setItems((p) => [...p, { id: Date.now(), item: null, qty: "" }]);
  };

  const removeItem = (id) => {
    setItems((p) => p.filter((i) => i.id !== id));
  };

  const commonOptions = {
    mediaType: "photo",
    quality: 0.7,
  };

  const uploadFileImmediately = async (asset) => {
    try {
      setLoading(true);

      const userData = await getUserData();

      const formData = new FormData();

      formData.append("file", {
        uri:
          Platform.OS === "android"
            ? asset.uri
            : asset.uri.replace("file://", ""),
        name: asset.fileName || "upload.png",
        type: asset.type || "image/png",
      });

      console.log("Uploading file 👉", formData);
      const token = await getUserToken();

      const response = await fetch(
        API_ROUTES.BASE_URL + API_ROUTES.UPLOAD_FILE,
        {
          method: "POST",
          headers: {
            Authorization: `bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        },
      );

      const result = await response.json();
      console.log("UPLOAD RESPONSE", result);

      if (result.statusCode == "200" && result.status == "SUCCESS") {
        showSuccessMessage("File uploaded successfully ✅");
        setUploadedFile(asset);
        setindentFile((pre) => [...pre, result.data[0]]);
      } else {
        showErrorMessage(result?.message || "Upload failed");
      }
    } catch (err) {
      console.log("Upload Error ❌", err);
      showErrorMessage("File upload error");
    } finally {
      setLoading(false);
      setShowFilePicker(false);
    }
  };

  const openCamera = () => {
    launchCamera(
      {
        mediaType: "photo",
        quality: 0.8,
        saveToPhotos: true,
      },
      (res) => {
        if (res.didCancel) return;

        if (res.errorCode) {
          showErrorMessage(res.errorMessage);
          return;
        }

        const asset = res.assets?.[0];
        if (asset) {
          uploadFileImmediately(asset);
        }
      },
    );
  };

  const openGallery = () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        quality: 0.8,
      },
      (res) => {
        if (res.didCancel) return;

        if (res.errorCode) {
          showErrorMessage(res.errorMessage);
          return;
        }

        const asset = res.assets?.[0];
        if (asset) {
          uploadFileImmediately(asset);
        }
      },
    );
  };

  const getCommPlaceholder = () => {
    const type = form.communication?.name?.toUpperCase();

    switch (type) {
      case "PHONE":
        return "Enter phone number";
      case "EMAIL":
        return "Enter email address";
      case "DIRECT":
        return "Enter remarks";
      default:
        return "";
    }
  };

  const getTxnLabel = () => {
    if (!form.paymentMode) return "";

    if (form.paymentMode.name === "CHEQUE") {
      return "Cheque No";
    }

    return "Txn No";
  };

  const validateForm = () => {
    let newErrors = {};

    if (!form.party) {
      newErrors.party = "Party is required";
    }

    if (!form.communication) {
      newErrors.communication = "Communication mode required";
    }

    if (!form.communicationValue) {
      newErrors.communicationValue = "Communication value required";
    }

    if (!form.indentDate) {
      newErrors.indentDate = "Indent date required";
    }

    if (!form.expectedDate) {
      newErrors.expectedDate = "Expected delivery date required";
    }

    if (!form.season) {
      newErrors.season = "Season required";
    }

    if (!form.materialType) {
      newErrors.materialType = "Material type required";
    }

    if (advancedReceived) {
      if (!form.amount) {
        newErrors.amount = "Amount required";
      }

      if (!form.paymentMode) {
        newErrors.paymentMode = "Payment mode required";
      }

      if (!form.paymentDate) {
        newErrors.paymentDate = "Payment date required";
      }

      if (
        form.paymentMode &&
        form.paymentMode.name !== "CASH" &&
        !form.txnOrChequeNo
      ) {
        newErrors.txnOrChequeNo = "Txn / Cheque number required";
      }
    }

    items.forEach((it, index) => {
      if (!it.item) {
        newErrors[`item_${index}`] = "Item required";
      }

      if (!it.qty) {
        newErrors[`qty_${index}`] = "Quantity required";
      }
    });

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const toApiDate = (ddmmyyyy) => {
    if (!ddmmyyyy) return null;
    const [dd, mm, yyyy] = ddmmyyyy.split("/");
    return `${yyyy}-${mm}-${dd}`;
  };

  const buildPayload = async (status = "PENDING") => {
    const userData = await getUserData();

    return {
      materialType: form.materialType?.name || null,

      dealerId: form.party?.id,
      dealerName: form.party?.comName || "",
      dealerCode:
        form.party?.partyRegNo || form.party?.dealerRegistrationNo || "",

      indentDate: toApiDate(form.indentDate),
      deliveryDate: toApiDate(form.expectedDate),
      paymentDate: advancedReceived ? toApiDate(form.paymentDate) : null,

      advanceReceived: advancedReceived,
      paymentMode: advancedReceived ? form.paymentMode?.name : null,

      modeOfCommunication: form.communication?.name?.toUpperCase(),
      communicationValue: form.communicationValue,

      seasonId: form.season?.id,
      seasonName: form.season?.seasonType || "",

      existingIndentNo: form.indentNumber?.dealerIndentNo || null,

      receivedAmount: advancedReceived ? form.amount : null,

      chequeNo:
        advancedReceived && form.paymentMode && form.paymentMode.name !== "CASH"
          ? form.txnOrChequeNo
          : null,

      dealerIndentItems: items.map((it) => ({
        itemName: it.item?.itemName,
        qty: Number(it.qty),
        uom: it.item?.uom || "Kg",
        hsnShortName: it.item?.hsnShortName,
        packingSize: it.item?.packingSize,
        qtyAvailableForInvoice: Number(it.qty),
        itemCode: it.item?.itemCode,
      })),

      aoId: userData?.aoId,
      roId: userData?.roId,

      unitName: userData?.unitName || "Ahemdabad VSPL",
      unitType: userData?.unitType || "AO",

      indentStatus: status,
    };
  };

  const onSubmit = async () => {
    const valid = validateForm();

    if (!valid) {
      showErrorMessage("Please fill required fields");
      return;
    }
    try {
      setLoading(true);

      const payload = await buildPayload("PENDING");
      console.log("onSubmit", payload);

      const encryptedPayload = encryptWholeObject(payload);

      const response = await apiRequest(
        API_ROUTES.SAVE_DEALER_INDENT,
        "POST",
        encryptedPayload,
      );

      const parsed = JSON.parse(decryptAES(response));

      console.log("onSubmit", parsed);

      if (parsed?.status === "SUCCESS") {
        showSuccessMessage("Dealer Indent Created Successfully ✅");
        navigation.goBack();
      } else {
        showErrorMessage(parsed?.message || "Submission failed");
      }
    } catch (e) {
      console.log("Submit error", e);
      showErrorMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const onSaveDraft = async () => {
    const valid = validateForm();

    if (!valid) {
      showErrorMessage("Please fill required fields");
      return;
    }
    try {
      setLoading(true);

      const payload = await buildPayload("DRAFT");

      console.log("SAVE DRAFT PAYLOAD 📝", payload);

      const encryptedPayload = encryptWholeObject(payload);

      const response = await apiRequest(
        API_ROUTES.SAVE_DEALER_INDENT, // SAME API
        "POST",
        encryptedPayload,
      );

      const parsed = JSON.parse(decryptAES(response));

      if (parsed?.status === "SUCCESS") {
        showSuccessMessage("Draft saved successfully");
        navigation.goBack();
      } else {
        showErrorMessage(parsed?.message || "Draft save failed");
      }
    } catch (e) {
      console.log("Save Draft error", e);
      showErrorMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const onUpdate = async () => {
    try {
      setLoading(true);

      // 👇 FIRST await payload properly
      const basePayload = await buildPayload("PENDING");

      // 👇 Then add id for update
      const payload = {
        ...basePayload,
        id: editIndent.id,
      };

      console.log("UPDATE PAYLOAD 👉", payload);

      const encryptedPayload = encryptWholeObject(payload);

      const response = await apiRequest(
        API_ROUTES.SAVE_DEALER_INDENT,
        "POST",
        encryptedPayload,
      );

      const decrypted = decryptAES(response);
      const parsed = JSON.parse(decrypted);

      console.log("UPDATE RESPONSE 👉", parsed);

      if (parsed?.status === "SUCCESS") {
        showSuccessMessage("Dealer Indent Updated Successfully ✅");
        navigation.goBack();
      } else {
        showErrorMessage(parsed?.message || "Update failed");
      }
    } catch (e) {
      console.log("Update error", e);
      showErrorMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <WrapperContainer isLoading={loading}>
      <InnerHeader
        title={isEdit ? "Edit Dealer Indent" : "Create Dealer Indent"}
      />

      {Platform.OS === "android" && showDatePicker && (
        <DateTimePicker
          value={
            activeDateField === "INDENT"
              ? indentDateObj || new Date()
              : expectedDateObj || new Date()
          }
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}

      {Platform.OS === "ios" && showDatePicker && (
        <Modal transparent animationType="slide">
          <View style={styles.iosModalOverlay}>
            <View style={styles.iosModalContainer}>
              <TouchableOpacity
                style={{ alignSelf: "flex-end" }}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>

              <DateTimePicker
                value={
                  activeDateField === "INDENT"
                    ? indentDateObj || new Date()
                    : expectedDateObj || new Date()
                }
                mode="date"
                display="spinner"
                onChange={onChangeDate}
              />
            </View>
          </View>
        </Modal>
      )}

      <Modal
        transparent
        visible={showFilePicker}
        animationType="fade"
        onRequestClose={() => setShowFilePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Upload Using</Text>

            <TouchableOpacity style={styles.modalBtn} onPress={openCamera}>
              <Icon name="photo-camera" size={20} />
              <Text style={styles.modalBtnText}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalBtn} onPress={openGallery}>
              <Icon name="photo-library" size={20} />
              <Text style={styles.modalBtnText}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowFilePicker(false)}>
              <Text style={{ color: "red", marginTop: 10 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.container}>
        {/* BASIC DETAILS */}
        <Card title="Basic Details">
          <DropDown
            label="Party Name"
            data={partyList}
            value={form.party?.comName || ""}
            selectItem={(item) => {
              getIndentNumber(item);
              setForm((p) => ({ ...p, party: item }));
              setErrors((prev) => {
                const copy = { ...prev };
                delete copy.party;
                return copy;
              });
            }}
            containerStyle={[
              errors.party && {
                borderColor: "red",
                borderWidth: 1,
              },
            ]}
          />
          {errors.party && (
            <Text style={styles.dropdownErrorText}>{errors.party}</Text>
          )}

          <DropDown
            label="Mode of Communication"
            data={modeList}
            value={form.communication?.name || ""}
            selectItem={(item) => {
              setForm((p) => ({
                ...p,
                communication: item,
                communicationValue: "", // 👈 reset on change
              }));
              setErrors((prev) => {
                const copy = { ...prev };
                delete copy.communication;
                return copy;
              });
            }}
            containerStyle={[
              errors.communication && {
                borderColor: "red",
                borderWidth: 1,
              },
            ]}
          />
          {errors.communication && (
            <Text style={styles.dropdownErrorText}>{errors.communication}</Text>
          )}
          {form.communication && (
            <Input
              label="Communication Details"
              placeholder={getCommPlaceholder()}
              value={form.communicationValue}
              onChangeText={(v) => {
                setForm((p) => ({ ...p, communicationValue: v }));
                setErrors((prev) => {
                  const copy = { ...prev };
                  delete copy.communicationValue;
                  return copy;
                });
              }}
              style={[
                styles.input,
                errors.communicationValue && { borderColor: "red" },
              ]}
            />
          )}
          {form.communication && errors.communicationValue && (
            <Text style={styles.textInputErrorText}>
              {errors.communicationValue}
            </Text>
          )}

          <TouchableOpacity
            onPress={() => {
              setActiveDateField("INDENT");
              setShowDatePicker(true);
            }}
          >
            <Input
              label="Indent Date"
              placeholder="DD/MM/YYYY"
              value={form.indentDate}
              editable={false}
              style={[
                styles.input,
                errors.indentDate && { borderColor: "red" },
              ]}
            />
            {errors.indentDate && (
              <Text style={styles.textInputErrorText}>{errors.indentDate}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setActiveDateField("EXPECTED");
              setShowDatePicker(true);
            }}
          >
            <Input
              label="Expected Delivery Date"
              placeholder="DD/MM/YYYY"
              value={form.expectedDate}
              editable={false}
              style={[
                styles.input,
                errors.expectedDate && { borderColor: "red" },
              ]}
            />
            {errors.expectedDate && (
              <Text style={styles.textInputErrorText}>
                {errors.expectedDate}
              </Text>
            )}
          </TouchableOpacity>

          <DropDown
            containerStyle={[
              errors.season && {
                borderColor: "red",
                borderWidth: 1,
              },
            ]}
            label="Season"
            data={seasonList}
            value={form.season?.seasonType || ""}
            selectItem={(item) => {
              setForm((p) => ({ ...p, season: item }));
              setErrors((prev) => {
                const copy = { ...prev };
                delete copy.season;
                return copy;
              });
            }}
          />
          {errors.season && (
            <Text style={styles.dropdownErrorText}>{errors.season}</Text>
          )}
          <DropDown
            label="Existing Indent Number"
            data={indentNumbers}
            value={form.indentNumber?.dealerIndentNo || ""}
            selectItem={(item) => {
              setForm((p) => ({ ...p, indentNumber: item }));
            }}
          />

          <DropDown
            label="Material Type"
            data={materialTypeList}
            value={form.materialType?.name || ""}
            containerStyle={[
              errors.materialType && {
                borderColor: "red",
                borderWidth: 1,
              },
            ]}
            selectItem={(item) => {
              setForm((p) => ({ ...p, materialType: item }));
              setErrors((prev) => {
                const copy = { ...prev };
                delete copy.materialType;
                return copy;
              });
            }}
          />
          {errors.materialType && (
            <Text style={styles.dropdownErrorText}>{errors.materialType}</Text>
          )}

          <Card title="Attachment">
            <TouchableOpacity
              onPress={() => setShowFilePicker(true)}
              style={{
                borderWidth: 1,
                borderColor: Colors.greenColor,
                borderRadius: 8,
                padding: 12,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ color: Colors.greenColor, fontWeight: "600" }}>
                Upload File
              </Text>
              <Icon name="upload-file" size={22} color={Colors.greenColor} />
            </TouchableOpacity>

            {uploadedFile && (
              <Text style={{ marginTop: 6, fontSize: 12 }}>
                Selected: {uploadedFile.name}
              </Text>
            )}
          </Card>

          <View style={styles.switchRow}>
            <Switch
              value={advancedReceived}
              onValueChange={setAdvancedReceived}
            />
            <Text style={styles.switchText}>Advanced Received</Text>
          </View>
        </Card>

        {/* PAYMENT DETAILS */}
        {advancedReceived && (
          <Card title="Payment Details">
            <Input
              placeholder="Money Received"
              label="Money Received"
              keyboardType="numeric"
              value={form.amount}
              onChangeText={(v) => {
                setForm((p) => ({ ...p, amount: v }));
                setErrors((prev) => {
                  const copy = { ...prev };
                  delete copy.amount;
                  return copy;
                });
              }}
              style={[styles.input, errors.amount && { borderColor: "red" }]}
            />
            {errors.amount && (
              <Text style={styles.textInputErrorText}>{errors.amount}</Text>
            )}

            <DropDown
              label="Payment Mode"
              data={paymentModeList}
              value={form.paymentMode?.name || ""}
              selectItem={(item) => {
                setForm((p) => ({
                  ...p,
                  paymentMode: item,
                  txnOrChequeNo: "", // 👈 reset on change
                }));
                setErrors((prev) => {
                  const copy = { ...prev };
                  delete copy.paymentMode;
                  return copy;
                });
              }}
              containerStyle={[
                errors.paymentMode && {
                  borderColor: "red",
                  borderWidth: 1,
                },
              ]}
            />
            {errors.paymentMode && (
              <Text style={styles.dropdownErrorText}>{errors.paymentMode}</Text>
            )}

            {/* 🔥 NEW FIELD */}
            {form.paymentMode && form.paymentMode.name !== "CASH" && (
              <Input
                label={getTxnLabel()}
                value={form.txnOrChequeNo}
                style={[
                  styles.input,
                  errors.txnOrChequeNo && { borderColor: "red" },
                ]}
                onChangeText={(v) => {
                  setForm((p) => ({ ...p, txnOrChequeNo: v }));
                  setErrors((prev) => {
                    const copy = { ...prev };
                    delete copy.txnOrChequeNo;
                    return copy;
                  });
                }}
              />
            )}
            {errors.txnOrChequeNo && (
              <Text style={styles.textInputErrorText}>
                {errors.txnOrChequeNo}
              </Text>
            )}

            <Input
              label="Payment Received Date"
              placeholder="DD/MM/YYYY"
              value={form.paymentDate}
              style={[
                styles.input,
                errors.paymentDate && { borderColor: "red" },
              ]}
              onChangeText={(v) => {
                setForm((p) => ({ ...p, paymentDate: v }));
                setErrors((prev) => {
                  const copy = { ...prev };
                  delete copy.paymentDate;
                  return copy;
                });
              }}
            />
            {errors.paymentDate && (
              <Text style={styles.textInputErrorText}>
                {errors.paymentDate}
              </Text>
            )}
          </Card>
        )}

        {/* ITEMS */}
        <Card title="Items" rightIcon onRightPress={addItem}>
          {items.map((it, index) => (
            <View key={it.id} style={styles.itemBox}>
              <Text style={styles.sn}>Item {index + 1}</Text>

              <DropDown
                label="Item"
                data={materialList}
                value={it.item?.itemName || ""}
                containerStyle={
                  errors[`item_${index}`] && {
                    borderColor: "red",
                    borderWidth: 1,
                  }
                }
                selectItem={(item) => {
                  setItems((prev) =>
                    prev.map((x) => (x.id === it.id ? { ...x, item } : x)),
                  );
                  setErrors((prev) => {
                    const copy = { ...prev };
                    delete copy[`item_${index}`];
                    return copy;
                  });
                }}
              />
              {errors[`item_${index}`] && (
                <Text style={styles.dropdownErrorText}>
                  {errors[`item_${index}`]}
                </Text>
              )}

              <Input
                label="Qty"
                placeholder="Qty"
                keyboardType="numeric"
                value={it.qty}
                style={[
                  styles.input,
                  errors[`qty_${index}`] && { borderColor: "red" },
                ]}
                onChangeText={(v) => {
                  setItems((prev) =>
                    prev.map((x) => (x.id === it.id ? { ...x, qty: v } : x)),
                  );
                  setErrors((prev) => {
                    const copy = { ...prev };
                    delete copy[`qty_${index}`];
                    return copy;
                  });
                }}
              />
              {errors[`qty_${index}`] && (
                <Text style={styles.textInputErrorText}>
                  {errors[`qty_${index}`]}
                </Text>
              )}

              {items.length > 1 && (
                <TouchableOpacity
                  onPress={() => removeItem(it.id)}
                  style={styles.removeBtn}
                >
                  <Icon name="remove-circle" size={22} color="red" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </Card>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Btn outline text="Cancel" onPress={navigation.goBack} />
          <Btn outline onPress={onSaveDraft} text="Save Draft" />
          <Btn
            fill
            onPress={isEdit ? onUpdate : onSubmit}
            text={isEdit ? "Submit" : "Submit"}
          />
        </View>
      </ScrollView>
    </WrapperContainer>
  );
};

export default CreateDealerIndent;

/* ================= SMALL COMPONENTS ================= */

const Card = ({ title, children, rightIcon, onRightPress }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{title}</Text>
      {rightIcon && (
        <TouchableOpacity onPress={onRightPress}>
          <Icon name="add-circle" size={26} color={Colors.greenColor} />
        </TouchableOpacity>
      )}
    </View>
    {children}
  </View>
);

const Input = ({ label, ...props }) => (
  <View style={styles.inputBox}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} {...props} />
  </View>
);

const Btn = ({ text, outline, fill, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.btn, outline && styles.outlineBtn, fill && styles.fillBtn]}
  >
    <Text style={[styles.btnText, outline && { color: Colors.greenColor }]}>
      {text}
    </Text>
  </TouchableOpacity>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    padding: moderateScale(12),
    paddingBottom: 30,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  cardTitle: {
    fontSize: textScale(15),
    fontFamily: FontFamily.PoppinsSemiBold,
    color: Colors.greenColor,
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

  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  switchText: {
    marginLeft: 8,
    fontSize: 14,
  },

  itemBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },

  sn: {
    fontWeight: "700",
    marginBottom: 4,
  },

  removeBtn: {
    alignItems: "flex-end",
    marginTop: 4,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  btn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  outlineBtn: {
    borderWidth: 1,
    borderColor: Colors.greenColor,
  },

  fillBtn: {
    backgroundColor: Colors.greenColor,
  },

  btnText: {
    fontWeight: "700",
    color: "#fff",
  },

  iosModalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  iosModalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  doneText: {
    fontSize: 16,
    color: Colors.greenColor,
    marginBottom: 10,
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  modalBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
  },
  modalBtnText: {
    fontSize: 15,
  },
  dropdownErrorText: {
    color: "red",
    fontSize: 12,
    marginTop: -10,
    marginLeft: 5,
    marginBottom: 10,
  },
  textInputErrorText: {
    color: "red",
    fontSize: 12,
    marginTop: -7,
    marginLeft: 8,
    marginBottom: 10,
  },
});

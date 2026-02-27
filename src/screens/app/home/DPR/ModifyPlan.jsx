import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import WrapperContainer from "../../../../utils/WrapperContainer";
import InnerHeader from "../../../../components/InnerHeader";
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from "../../../../utils/responsiveSize";
import Colors from "../../../../utils/Colors";
import FontFamily from "../../../../utils/FontFamily";
import PropTypes from "prop-types";


const ModifyPlan = ({ route }) => {
  const { item } = route.params;
  const [actionType, setActionType] = useState("");
  const [remarks, setRemarks] = useState("");
  console.log(item, "line 8");

  return (
    <WrapperContainer>
      <InnerHeader title={"Plan Update"} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Plan Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plan Information</Text>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Financial Year</Text>
              <Text style={styles.value}>{item.finYear}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Season</Text>
              <Text style={styles.value}>{item.season}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Crop</Text>
              <Text style={styles.value}>{item.crop}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Variety</Text>
              <Text style={styles.value}>{item.seedVariety}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Programme</Text>
              <Text style={styles.value}>{item.programme}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Area (Hectare)</Text>
              <Text style={styles.value}>{item.area}</Text>
            </View>
          </View>
        </View>

        {/* Seed Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seed Details</Text>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Raw Seeds (Kg)</Text>
              <Text style={styles.value}>{item.rowSeed}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Good Seeds (Kg)</Text>
              <Text style={styles.value}>{item.goodSeed}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Planting Material Required (Kg)</Text>
              <Text style={styles.value}>{item.requiredPlanting}</Text>
            </View>
          </View>
        </View>

        {/* Action Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Action</Text>

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                actionType === "Reject" && styles.selectedAction,
              ]}
              onPress={() => setActionType("Reject")}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  actionType === "Reject" && styles.selectedActionText,
                ]}
              >
                Reject
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                actionType === "Revision" && styles.selectedAction,
              ]}
              onPress={() => setActionType("Revision")}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  actionType === "Revision" && styles.selectedActionText,
                ]}
              >
                Revision
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.remarksContainer}>
            <Text style={styles.label}>Remarks</Text>
            <TextInput
              style={styles.remarksInput}
              multiline={true}
              numberOfLines={4}
              placeholder="Enter remarks here..."
              value={remarks}
              onChangeText={setRemarks}
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </WrapperContainer>
  );
};

ModifyPlan.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.object.isRequired,
  }).isRequired,
};

export default ModifyPlan;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: moderateScale(15),
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: moderateScale(8),
    // padding: moderateScale(15),
    marginBottom: moderateScale(15),
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(1),
    elevation: moderateScale(3),
  },
  sectionTitle: {
    fontSize: textScale(14),
    fontFamily: FontFamily.PoppinsSemiBold,
    color: Colors.greenColor,
    marginBottom: moderateScaleVertical(4),
    borderLeftWidth: moderateScale(2),
    padding: moderateScale(5),
    paddingHorizontal: moderateScale(10),
    borderColor: Colors.primary,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: moderateScaleVertical(12),
    paddingHorizontal: moderateScale(10),
  },
  column: {
    flex: 1,
    marginRight: moderateScale(8),
    gap: moderateScaleVertical(2),
  },
  label: {
    fontSize: textScale(12),
    color: Colors.textColor,
    marginBottom: moderateScaleVertical(4),
    fontFamily: FontFamily.PoppinsRegular,
  },
  value: {
    fontSize: textScale(14),
    color: Colors.black,
    fontFamily: FontFamily.PoppinsMedium,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: moderateScaleVertical(16),
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedAction: {
    backgroundColor: "#e74c3c",
    borderColor: "#c0392b",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  selectedActionText: {
    color: "#fff",
  },
  remarksContainer: {
    marginTop: 8,
  },
  remarksInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 12,
    textAlignVertical: "top",
    minHeight: 100,
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: "#3498db",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 24,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

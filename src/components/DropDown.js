// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Modal,
//   FlatList,
// } from "react-native";
// import React, { useState } from "react";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import Colors from "../utils/Colors";

// /* 🔐 SAFE LABEL RESOLVER */
// const getLabel = (val) => {
//   if (!val) return "";
//   if (typeof val === "string") return val;

//   return (
//     val.name ||
//     val.cpNo ||
//     val.itemName ||
//     val.operationName ||
//     val.macName ||
//     val.assetGroupName ||
//     val.assetSubGroupName ||
//     val.planCode ||
//     val.seasonType ||
//     val.payeeName ||
//     val.dealerIndentNo ||
//     val.assetCategoryName ||
//     val.comName ||
//     val.finYearShortName ||
//     val.seedCropName ||
//     val.seedVarietyName ||
//     val.agreementType ||
//     ""
//   );
// };

// export default function DropDown({
//   value,
//   selectItem,
//   data = [],
//   disabled = false,
//   label,
//   containerStyle = {},
// }) {
//   const [visible, setVisible] = useState(false); // ✅ INTERNAL STATE

//   return (
//     <View style={styles.inputContainer}>
//       {label && <Text style={styles.label}>{label}</Text>}

//       <TouchableOpacity
//         disabled={disabled}
//         style={[
//           disabled ? styles.dropdownButtonDisable : styles.dropdownButton,
//           containerStyle,
//         ]}
//         onPress={() => setVisible(true)} // ✅ ONLY opens on click
//       >
//         <Text
//           style={[
//             styles.dropdownButtonText,
//             !value && styles.dropdownButtonPlaceholder,
//             { flex: 1, marginRight: 8 },
//           ]}
//           numberOfLines={1}
//         >
//           {getLabel(value) || "Please Select"}
//         </Text>

//         <Icon name="arrow-drop-down" size={24} color={Colors.grey} />
//       </TouchableOpacity>

//       <Modal
//         visible={visible}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setVisible(false)}
//       >
//         <TouchableOpacity
//           style={styles.modalOverlay}
//           activeOpacity={1}
//           onPress={() => setVisible(false)}
//         >
//           <View style={styles.dropdownModal}>
//             <FlatList
//               data={data}
//               keyExtractor={(item, index) =>
//                 item?.id ? item.id.toString() : index.toString()
//               }
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={styles.dropdownItem}
//                   onPress={() => {
//                     selectItem(item);
//                     setVisible(false); // ✅ close after select
//                   }}
//                 >
//                   <Text>{getLabel(item)}</Text>
//                 </TouchableOpacity>
//               )}
//             />
//           </View>
//         </TouchableOpacity>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   inputContainer: {
//     // flex: 1,
//     // marginBottom: 10,

//     width: "100%", // ✅ instead of flex: 1
//     marginBottom: 10,
//   },
//   label: {
//     fontSize: 14,
//     color: Colors.grey,
//     marginBottom: 4,
//     fontWeight: "700",
//   },
//   dropdownButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: Colors.disableFieldColor,
//     borderRadius: 6,
//     padding: 10,
//   },
//   dropdownButtonDisable: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: Colors.disableFieldColor,
//     borderRadius: 6,
//     padding: 10,
//     backgroundColor: Colors.disableFieldColor,
//   },
//   dropdownButtonText: {
//     color: "#000",
//   },
//   dropdownButtonPlaceholder: {
//     color: Colors.grey,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.3)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   dropdownModal: {
//     backgroundColor: "#fff",
//     width: "80%",
//     borderRadius: 10,
//     paddingVertical: 10,
//   },
//   dropdownItem: {
//     padding: 12,
//     borderBottomWidth: 1,
//     borderColor: "#eee",
//   },
// });

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import React, { useState } from "react";
import Icon from "react-native-vector-icons/MaterialIcons";
import Colors from "../utils/Colors";

/* ================= LABEL RESOLVER ================= */

const getLabel = (val) => {
  if (!val) return "";

  // string
  if (typeof val === "string") return val;

  // contractor + agreementType
  if (val?.contractorName && val?.agreementType) {
    return `${val.contractorName} (${val.agreementType})`;
  }

  return (
    val.name ||
    val.cpNo ||
    val.itemName ||
    val.operationName ||
    val.macName ||
    val.assetGroupName ||
    val.assetSubGroupName ||
    val.planCode ||
    val.seasonType ||
    val.payeeName ||
    val.dealerIndentNo ||
    val.assetCategoryName ||
    val.comName ||
    val.finYearShortName ||
    val.seedCropName ||
    val.seedVarietyName ||
    val.workerName ||
    val.agreementType ||
    ""
  );
};

/* ================= COMPONENT ================= */

export default function DropDown({
  value,
  selectItem,
  data = [],
  disabled = false,
  label,
  containerStyle = {},
}) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.inputContainer}>
      {!!label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        disabled={disabled}
        style={[
          disabled ? styles.dropdownButtonDisable : styles.dropdownButton,
          containerStyle,
        ]}
        onPress={() => setVisible(true)}
      >
        <Text
          style={[
            styles.dropdownButtonText,
            !value && styles.dropdownButtonPlaceholder,
          ]}
          numberOfLines={1}
        >
          {getLabel(value) || "Please Select"}
        </Text>

        <Icon name="arrow-drop-down" size={24} color={Colors.grey} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => setVisible(false)}
        >
          <View style={styles.dropdownModal}>
            <FlatList
              data={data}
              keyboardShouldPersistTaps="handled"
              keyExtractor={(item, index) =>
                item?.id ? item.id.toString() : index.toString()
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    selectItem(item);
                    setVisible(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{getLabel(item)}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No Data Found</Text>
                </View>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  inputContainer: {
    width: "100%",
    marginBottom: 10,
  },

  label: {
    fontSize: 14,
    color: Colors.grey,
    marginBottom: 4,
    fontWeight: "700",
  },

  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border || "#ccc",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },

  dropdownButtonDisable: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.disableFieldColor,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: Colors.disableFieldColor,
  },

  dropdownButtonText: {
    flex: 1,
    color: "#000",
    marginRight: 8,
    fontSize: 14,
  },

  dropdownButtonPlaceholder: {
    color: Colors.grey,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  dropdownModal: {
    width: "100%",
    maxHeight: "60%",
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
  },

  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  dropdownItemText: {
    fontSize: 14,
    color: "#000",
  },

  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },

  emptyText: {
    color: Colors.grey,
    fontSize: 14,
  },
});

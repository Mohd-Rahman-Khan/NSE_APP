// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Modal,
//   FlatList,
// } from "react-native";
// import React from "react";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import Colors from "../utils/Colors";

// export default function DropDown({
//   isVisible,
//   setIsVisible,
//   value,
//   selectItem,
//   data,
//   disabled = false,
//   label,
// }) {
//   return (
//     <View style={styles.inputContainer}>
//       <Text style={styles.label}>{label}</Text>
//       <TouchableOpacity
//         disabled={disabled}
//         style={disabled ? styles.dropdownButtonDisable : styles.dropdownButton}
//         onPress={() => {
//           setIsVisible(!isVisible);
//         }}
//       >
//         <Text
//           style={[
//             styles.dropdownButtonText,
//             !value && styles.dropdownButtonPlaceholder,
//             { flex: 1, marginRight: 8 },
//           ]}
//           numberOfLines={1}
//           ellipsizeMode="tail"
//         >
//           {value || `Please Select`}
//         </Text>
//         <Icon name="arrow-drop-down" size={24} color={Colors.grey} />
//       </TouchableOpacity>

//       <Modal
//         visible={isVisible}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => {
//           setIsVisible(!isVisible);
//         }}
//       >
//         <TouchableOpacity
//           style={styles.modalOverlay}
//           activeOpacity={1}
//           onPress={() => {
//             setIsVisible(!isVisible);
//           }}
//         >
//           <View style={styles.dropdownModal}>
//             <FlatList
//               data={data}
//               keyExtractor={(item, index) => index.toString()}
//               renderItem={({ item }) => {
//                 return (
//                   <TouchableOpacity
//                     style={styles.dropdownItem}
//                     onPress={() => {
//                       selectItem(item);
//                     }}
//                   >
//                     {item?.operationName ? (
//                       <Text>{item?.operationName}</Text>
//                     ) : item?.macName ? (
//                       <Text>{item?.macName}</Text>
//                     ) : item?.itemName ? (
//                       <Text>{item?.itemName}</Text>
//                     ) : (
//                       <Text>{item}</Text>
//                     )}
//                   </TouchableOpacity>
//                 );
//               }}
//               style={styles.dropdownList}
//             />
//           </View>
//         </TouchableOpacity>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   inputContainer: {
//     flex: 1,
//     marginRight: 8,
//     marginBottom: 10,
//   },
//   label: {
//     fontSize: 14,
//     color: Colors.grey,
//     marginBottom: 4,
//     fontWeight: "700",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: Colors.border,
//     borderRadius: 6,
//     padding: 8,
//   },
//   dropdownButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: Colors.border,
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

/* 🔐 SAFE LABEL RESOLVER */
const getLabel = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val;

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
    ""
  );
};

export default function DropDown({
  value,
  selectItem,
  data = [],
  disabled = false,
  label,
}) {
  const [visible, setVisible] = useState(false); // ✅ INTERNAL STATE

  return (
    <View style={styles.inputContainer}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        disabled={disabled}
        style={disabled ? styles.dropdownButtonDisable : styles.dropdownButton}
        onPress={() => setVisible(true)} // ✅ ONLY opens on click
      >
        <Text
          style={[
            styles.dropdownButtonText,
            !value && styles.dropdownButtonPlaceholder,
            { flex: 1, marginRight: 8 },
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
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.dropdownModal}>
            <FlatList
              data={data}
              keyExtractor={(item, index) =>
                item?.id ? item.id.toString() : index.toString()
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    selectItem(item);
                    setVisible(false); // ✅ close after select
                  }}
                >
                  <Text>{getLabel(item)}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    // flex: 1,
    // marginBottom: 10,

    width: "100%", // ✅ instead of flex: 1
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
    borderColor: Colors.disableFieldColor,
    borderRadius: 6,
    padding: 10,
  },
  dropdownButtonDisable: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.disableFieldColor,
    borderRadius: 6,
    padding: 10,
    backgroundColor: Colors.disableFieldColor,
  },
  dropdownButtonText: {
    color: "#000",
  },
  dropdownButtonPlaceholder: {
    color: Colors.grey,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownModal: {
    backgroundColor: "#fff",
    width: "80%",
    borderRadius: 10,
    paddingVertical: 10,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
});

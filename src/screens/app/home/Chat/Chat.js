import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import WrapperContainer from "../../../../utils/WrapperContainer";
import ChatHeader from "./ChatHeader";
import WelcomeScreen from "./WelcomeScreen";
import Colors from "../../../../utils/Colors";
import { API_ROUTES } from "../../../../services/APIRoutes";
import { apiRequest } from "../../../../services/APIRequest";

export default function Chat() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "नमस्ते! 🌱 मैं बीज वाणी हूँ, NSC की AI सहायक। कृपया नीचे दिए गए विकल्पों में से एक चुनें, फिर अपना सवाल पूछें! 🌱",
      type: "bot",
    },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    // const userMsg = {
    //   id: Date.now().toString(),
    //   text: input,
    //   type: "user",
    // };

    // const botMsg = {
    //   id: Date.now().toString() + "bot",
    //   text: "आपका सवाल प्राप्त हुआ ✅",
    //   type: "bot",
    // };

    // setMessages((prev) => [...prev, userMsg, botMsg]);
    // setInput("");
    const payload = {
      question: "what is the today BANK transaction?",
      question_type: "FINANCE",
    };

    const response = await apiRequest(API_ROUTES.SEND_CHAT, "POST", payload);
    // console.log("response+++", response);
    if (response?.status === "SUCCESS" || response?.status == "200") {
      const userMsg = {
        id: Date.now().toString(),
        text: input,
        type: "user",
      };

      const botMsg = {
        id: Date.now().toString() + "bot",
        text: "आपका सवाल प्राप्त हुआ ✅",
        type: "bot",
      };

      setMessages((prev) => [...prev, userMsg, botMsg]);
      setInput("");
    } else {
      const userMsg = {
        id: Date.now().toString(),
        text: input,
        type: "user",
      };

      const botMsg = {
        id: Date.now().toString() + "bot",
        text: "क्षमा करें, कुछ गड़बड़ हो गई। कृपया दोबारा प्रयास करें। 🙏",
        type: "bot",
      };

      setMessages((prev) => [...prev, userMsg, botMsg]);
      setInput("");
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={[styles.message, item.type === "user" ? styles.user : styles.bot]}
    >
      <Text>{item.text}</Text>
    </View>
  );

  return (
    <WrapperContainer>
      <View style={styles.container}>
        {/* Chat List */}
        <ChatHeader
          selectedCategory={selectedCategory}
          onExport={() => console.log("Export clicked")}
          onNewChat={() => setSelectedCategory(null)}
        />
        {!selectedCategory ? (
          <WelcomeScreen
            onSelect={(item) => {
              setSelectedCategory(item);
              const botMsg = {
                id: Date.now().toString() + "bot",
                text:
                  item + " चुना गया। अब आप इस विषय पर अपना सवाल पूछ सकते हैं!",
                type: "bot",
              };

              setMessages((prev) => [...prev, botMsg]);
            }}
          />
        ) : (
          <>
            <FlatList
              data={messages}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              style={{ padding: 10 }}
            />

            {/* Input Box */}
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="अपना सवाल लिखें..."
                value={input}
                onChangeText={setInput}
                style={styles.input}
              />
              <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
                <Text style={{ color: Colors.white }}>➤</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </WrapperContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef3e8",
    //padding: 10,
  },
  message: {
    padding: 12,
    marginVertical: 5,
    borderRadius: 12,
    maxWidth: "80%",
  },
  user: {
    alignSelf: "flex-end",
    backgroundColor: "#d1e7dd",
  },
  bot: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    backgroundColor: Colors.white,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#2e7d32",
    borderRadius: 25,
    paddingHorizontal: 15,
  },
  sendBtn: {
    marginLeft: 10,
    backgroundColor: "#2e7d32",
    height: 40,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
  },
});

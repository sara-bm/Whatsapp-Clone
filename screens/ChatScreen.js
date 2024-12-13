import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Linking,
  Alert,
  Modal,
  ImageBackground
} from "react-native";
import {
  getDatabase,
  ref,
  get,
  set,
  push,
  onChildAdded,
} from "firebase/database";
import { auth } from "./../firebaseConfig";
import * as ImagePicker from "expo-image-picker";
import supabase from "./supabaseClient"; // Import the Supabase client
import * as Location from "expo-location"; // Import Location API
import { Ionicons, MaterialIcons } from "react-native-vector-icons"; // Import vector icons

const uploadImageToSupabase = async (uri) => {
  const fileName = uri.split("/").pop();
  const fileExt = fileName.split(".").pop().toLowerCase();
  const fileType =
    fileExt === "jpg" || fileExt === "jpeg"
      ? "image/jpeg"
      : fileExt === "png"
      ? "image/png"
      : null;

  if (!fileType) {
    Alert.alert("File Error", "Unsupported file type.");
    return null;
  }

  try {
    const response = await fetch(uri);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { data, error } = await supabase.storage
      .from("images")
      .upload(`images/${Date.now()}_${fileName}`, buffer, {
        contentType: fileType,
      });

    if (error) {
      console.error("Upload error:", error);
      Alert.alert("Upload Error", error.message);
      return null;
    }

    const { data: publicData, error: urlError } = supabase.storage
      .from("images")
      .getPublicUrl(data.path);

    if (urlError) {
      console.error("URL Error:", urlError);
      return null;
    }

    return publicData.publicUrl;
  } catch (err) {
    console.error("Unexpected Error:", err);
    Alert.alert("Error", err.message);
    return null;
  }
};

const ChatScreen = ({ other }) => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [file, setFile] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const currentUserId = auth.currentUser?.uid;
  const [locationLoading, setLocationLoading] = useState(false); // State for showing location-loading indicator
  const [backgroundImage, setBackgroundImage] = useState(""); // New state for the background image

  const availableBackgrounds = [
 "https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAzL3JtNjIzLXktYmFja2dyb3VuZC1hZGotMDAyYy5qcGc.jpg",
 "https://marketplace.canva.com/EAFJd1mhO-c/1/0/225w/canva-colorful-watercolor-painting-phone-wallpaper-3-fC4q0GHXU.jpg",
 "https://i.pinimg.com/736x/a3/59/52/a359525eeeaa79e4c0bffd137f3c3dab.jpg",
 "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTS3maWCUo6Ql0M75F7pkbfHamX7VLmrSy23A&s",
 "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRL62OsgiSSXn85vcGnfuZkWT3kp_Oy8P4RZA&s"
    // Add more image URLs as needed
  ];

  const changeBackground = () => {
    const randomIndex = Math.floor(Math.random() * availableBackgrounds.length);
    console.log("background change ",backgroundImage)
    setBackgroundImage(availableBackgrounds[randomIndex]);
  };

  const sendLocation = async () => {
    setLocationLoading(true); // Show loading indicator while fetching location

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "We need location access to share it."
        );
        setLocationLoading(false);
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = coords;

      const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

      const newMessage = {
        senderId: currentUserId,
        text: `📍 Location: ${locationUrl}`,
        timestamp: Date.now(),
        file: null,
      };

      const database = getDatabase();
      const chatKey = [currentUserId, other].sort().join("_");
      const messagesRef = ref(database, `chats/${chatKey}/messages`);

      await set(push(messagesRef), newMessage);
    } catch (error) {
      console.error("Error sharing location:", error);
      Alert.alert("Location Error", error.message);
    } finally {
      setLocationLoading(false); // Hide loading indicator
    }
  };

  useEffect(() => {
    const database = getDatabase();
    const chatKey = [currentUserId, other].sort().join("_");
    const messagesRef = ref(database, `chats/${chatKey}/messages`);
    const messageKeys = new Set();

    const fetchMessages = async () => {
      try {
        const messagesSnapshot = await get(messagesRef);
        if (messagesSnapshot.exists()) {
          const initialMessages = Object.entries(messagesSnapshot.val()).map(
            ([key, message]) => {
              messageKeys.add(key);
              return { id: key, ...message };
            }
          );

          // Sort messages by timestamp in descending order
          const sortedMessages = initialMessages.sort(
            (a, b) => b.timestamp - a.timestamp
          );
          setMessages(sortedMessages);
        }

        onChildAdded(messagesRef, (snapshot) => {
          const messageKey = snapshot.key;
          if (!messageKeys.has(messageKey)) {
            messageKeys.add(messageKey);
            const newMessage = { id: messageKey, ...snapshot.val() };

            // Add the new message and sort again
            setMessages((prev) =>
              [newMessage, ...prev].sort((a, b) => b.timestamp - a.timestamp)
            );
          }
        });
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [currentUserId, other]);

  const pickImageFromGallery = async () => {
    setModalVisible(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need permission to access your library."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setFile({
        uri: result.assets[0].uri,
        name: result.assets[0].fileName,
        type: "image",
      });
    }
  };

  const takePhoto = async () => {
    setModalVisible(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need permission to access camera.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setFile({
        uri: result.assets[0].uri,
        name: result.assets[0].fileName,
        type: "image",
      });
    }
  };

  const sendMessage = async () => {
    if (messageText.trim() === "" && !file) {
      Alert.alert(
        "Validation Error",
        "Please enter a message or select a file."
      );
      return;
    }

    let fileUrl = "";

    if (file && file.type === "image") {
      fileUrl = await uploadImageToSupabase(file.uri);
      if (!fileUrl) return;
    }

    const newMessage = {
      senderId: currentUserId,
      text: messageText.trim(),
      timestamp: Date.now(),
      file: fileUrl ? { uri: fileUrl, type: "image" } : null,
    };

    try {
      const database = getDatabase();
      const chatKey = [currentUserId, other].sort().join("_");
      const messagesRef = ref(database, `chats/${chatKey}/messages`);

      await set(push(messagesRef), newMessage);

      setMessageText("");
      setFile(null);
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Send Error", error.message);
    }
  };
  useEffect(() => {
    changeBackground();
  }, []);

  return (
    <ImageBackground source={{ uri: backgroundImage }} style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => `${item.senderId}_${item.timestamp}`}
        inverted
        renderItem={({ item }) => (
          <View
            style={
              item.senderId === currentUserId
                ? styles.myMessage
                : styles.otherMessage
            }>
            <Text style={styles.messageText}>
              {item.text.includes("https://www.google.com/maps") ? (
                <Text
                  style={{ color: "blue" }}
                  onPress={() =>
                    Linking.openURL(item.text.replace("📍 Location: ", ""))
                  }>
                  {item.text}
                </Text>
              ) : (
                item.text
              )}
            </Text>

            {item.file && item.file.type === "image" && (
              <Image
                source={{ uri: item.file.uri }}
                style={styles.messageImage}
              />
            )}
            <Text style={styles.timestamp}>
              {new Date(item.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={messageText}
          onChangeText={setMessageText}
        />

        <TouchableOpacity
          onPress={pickImageFromGallery}
          style={styles.iconButton}>
          <Ionicons name="image" size={24} color="gray" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={takePhoto}
          style={styles.iconButton}>
          <Ionicons name="camera" size={24} color="gray" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={sendLocation}
          style={styles.iconButton}
          disabled={locationLoading}>
          <MaterialIcons
            name="location-on"
            size={24}
            color={locationLoading ? "lightgray" : "gray"}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={changeBackground} style={[styles.button, { backgroundColor: "transparent" }]}>
  <Image
    source={{ uri: backgroundImage }}
    style={styles.circleButtonImage}
  />
</TouchableOpacity>
        <TouchableOpacity
          onPress={sendMessage}
          style={styles.sendButton}>
          <Ionicons name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade">
        <View style={styles.modal}>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={pickImageFromGallery}>
            <Text style={styles.modalButtonText}>Pick from Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={takePhoto}>
            <Text style={styles.modalButtonText}>Take a Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => setModalVisible(false)}>
            <Text style={styles.modalButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 10,
    justifyContent: "flex-end",
   // backgroundColor: "#fff",
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#d1f3d1",
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    maxWidth: "70%",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f0f0",
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    maxWidth: "70%",
  },
  messageText: {
    fontSize: 16,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginTop: 5,
  },
  timestamp: {
    fontSize: 12,
    color: "gray",
    marginTop: 5,
    textAlign: "right",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    height: 40,
  },
  iconButton: {
    marginLeft: 10,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#007bff",
    borderRadius: 50,
    padding: 10,
  },
  modal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalButton: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    width: "80%",
  },
  modalButtonText: {
    fontSize: 18,
    color: "#007bff",
    textAlign: "center",
  },circleButtonImage: {
    width: 50, // Adjust the size of the circle as needed
    height: 50,
    borderRadius: 25, // This creates the circular effect
    borderWidth: 2, // Optional: adds a border around the circle
    borderColor: '#fff', // Border color (optional)
  },
  button: {
    padding: 10, // Optional padding to ensure the image fits properly inside the button
    alignItems: 'center', // Centers the image inside the button
    justifyContent: 'center',
  },
});

export default ChatScreen;

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  TouchableOpacity,
} from "react-native";
import { ref, get, getDatabase, set, remove } from "firebase/database";
import { auth } from "./../firebaseConfig";

const ChatsContent = ({ setSelectedTab, setOther }) => {
  const [chats, setChats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalSearchTerm, setModalSearchTerm] = useState(""); // Search term for modal
  const [allUsers, setAllUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const currentUserEmail = auth.currentUser?.email;
  const currentUserId = auth.currentUser?.uid; // Get current user ID

  useEffect(() => {
    const fetchUsersAndChats = async () => {
      try {
        const database = getDatabase();

        const usersSnapshot = await get(ref(database, "users"));
        const users = usersSnapshot.exists() ? usersSnapshot.val() : {};

        const filteredUsers = Object.keys(users)
          .filter((userId) => userId !== currentUserId)
          .map((userId) => ({
            id: userId,
            email: users[userId].email,
            fullname: users[userId].fullname,
            phone: users[userId].phone,
            pseudo: users[userId].pseudo,
          }));

        const chatsSnapshot = await get(ref(database, "chats"));
        const existingChats = chatsSnapshot.exists() ? chatsSnapshot.val() : {};

        const usersWithChats = filteredUsers.filter((user) => {
          const chatKey = [currentUserId, user.id].sort().join("_");
          return existingChats[chatKey];
        });
        const usersWithoutChats = filteredUsers.filter((user) => {
          const chatKey = [currentUserId, user.id].sort().join("_");
          return !existingChats[chatKey];
        });

        setAllUsers(usersWithoutChats);
        setChats(usersWithChats);
      } catch (error) {
        console.error("Error fetching users or chats:", error);
      }
    };

    fetchUsersAndChats();
  }, [currentUserId]);

  const handleAddChat = async (userId) => {
    try {
      const chatKey = [currentUserId, userId].sort().join("_");

      const database = getDatabase();
      const chatRef = ref(database, `chats/${chatKey}`);
      const usersRef = ref(database, `users/${userId}`);

      const chatSnapshot = await get(chatRef);
      if (chatSnapshot.exists()) {
        Alert.alert("Info", "Chat already exists!");
        setModalVisible(false);
        return;
      }
      const userSnapshot = await get(usersRef);
      if (!userSnapshot.exists()) {
        Alert.alert("Error", "User not found.");
        return;
      }
      const user = userSnapshot.val();
      const userWithId = { ...user, id: userId };

      await set(chatRef, {
        users: [currentUserId, userId],
        messages: [],
        createdAt: new Date().toISOString(),
      });

      setChats((prevChats) => [...prevChats, userWithId]);
      setAllUsers((prev) => prev.filter((e) => e.id !== userId));
      setModalVisible(false);
      Alert.alert("Success", "Chat added successfully!");
    } catch (error) {
      console.error("Error adding chat:", error);
      Alert.alert("Error", "Failed to add chat.");
    }
  };

  const handleDeleteChat = async (userId) => {
    try {
      const chatKey = [currentUserId, userId].sort().join("_");
      const database = getDatabase();
      const chatRef = ref(database, `chats/${chatKey}`);
      const usersRef = ref(database, `users/${userId}`);

      await remove(chatRef);
      const userSnapshot = await get(usersRef);
      if (!userSnapshot.exists()) {
        Alert.alert("Error", "User not found.");
        return;
      }
      const user = userSnapshot.val();
      const userWithId = { ...user, id: userId };

      setChats((prevChats) => prevChats.filter((chat) => chat.id !== userId));
      setAllUsers((prev) => [...prev, userWithId]);
      Alert.alert("Success", "Chat deleted successfully!");
    } catch (error) {
      console.error("Error deleting chat:", error);
      Alert.alert("Error", "Failed to delete chat.");
    }
  };

  const handleOpenChat = (userId) => {
    const chatKey = [currentUserId, userId].sort().join("_");
    setSelectedTab("Talks");
    setOther(userId);
  };

  const filteredUsers = allUsers.filter(
    (user) =>
      user.email.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
      user.fullname.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
      user.phone.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
      user.pseudo.toLowerCase().includes(modalSearchTerm.toLowerCase())
  );
  const filteredChats = chats.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.pseudo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chats</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Chats"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {filteredChats.map((chat) => (
          <View style={styles.chatItemContainer} key={chat.id}>
            <Text style={styles.chatItem}>{chat.email}</Text>
            <TouchableOpacity
              onPress={() => handleOpenChat(chat.id)}
              style={styles.chatButton}>
              <Text style={styles.chatButtonText}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteChat(chat.id)}
              style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Add New Chat</Text>
            <TextInput
               height="50"
             // style={styles.searchInput}
              placeholder="Search Users"
              value={modalSearchTerm}
              onChangeText={setModalSearchTerm}
            />
              <ScrollView style={styles.scrollView}>
            {filteredUsers.map((user) => (
              <TouchableOpacity
                key={user.id}
                onPress={() => handleAddChat(user.id)}
                style={styles.touchableOpacity}>
                <Text style={styles.userEmail}>
                  {user.email} - {user.fullname}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
            <Button
              title="Close"
              onPress={() => setModalVisible(false)}
              color="#e74c3c"
              marginTop="20px"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 80,
    backgroundColor: "#f8f1f3",
  },
  header: {
    fontSize: 22,
    marginBottom: 20,
    color: "#a8325a",
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderColor: "#a8325a",
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  addButton: {
    height: 50,
    width: 50,
    backgroundColor: "#a8325a",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    elevation: 3,  // Adding shadow effect
  },
  addButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  chatItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1",
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  chatItem: {
    fontSize: 16,
    color: "#333",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    padding: 8,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  chatButton: {
    backgroundColor: "#3498db",
    padding: 8,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  chatButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  modalHeader: {
    fontSize: 18,
    color: "#a8325a",
    fontWeight: "bold",
    marginBottom: 10,
  },
  scrollView: {
   // flex: 1, // Allow ScrollView to take up full height
    padding: 10, 
    backgroundColor: "#f9f9f9", 
    height:"50%"
  },
  touchableOpacity: {
    paddingVertical: 10, 
    paddingHorizontal: 15,
    marginVertical: 5,
    backgroundColor: "#fff", 
    borderRadius: 8, 
    shadowColor: "#000", 
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2, 
  },
  userEmail: {
    fontSize: 16,
    color: "#333",
    
    paddingVertical: 5,
  },
});

export default ChatsContent;

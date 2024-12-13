import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { auth, database } from "./../firebaseConfig";
import { ref, set, get } from "firebase/database";
import supabase from "./supabaseClient";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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
      .upload(`profiles/${auth.currentUser.uid}_${fileName}`, buffer, {
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

const ProfileScreen = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [phone, setPhone] = useState("");

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const snapshot = await get(
        ref(database, `users/${auth.currentUser.uid}`)
      );
      const userData = snapshot.val();

      if (userData) {
        setProfileImage(userData.picture || null);
        setEmail(userData.email || "");
        setFullname(userData.fullname || "");
        setPseudo(userData.pseudo || "");
        setPhone(userData.phone || "");
      }
    } catch (err) {
      console.error("Error fetching profile data:", err);
      Alert.alert("Error", "Could not load profile data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const uid = auth.currentUser.uid;
      await set(ref(database, `users/${uid}`), {
        email,
        fullname,
        pseudo,
        phone,
        picture: profileImage,
      });
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const updateProfileImage = async (uri) => {
    const uploadedImageUrl = await uploadImageToSupabase(uri);
    if (!uploadedImageUrl) return;

    setLoading(true);
    try {
      setProfileImage(uploadedImageUrl);
    } catch (err) {
      console.error("Error updating profile image:", err);
      Alert.alert("Error", "Could not update profile image.");
    } finally {
      setLoading(false);
    }
  };

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need access to your library.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      updateProfileImage(result.assets[0].uri);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#3498db" />
      ) : (
        <Image
          source={
            profileImage ? { uri: profileImage } : require("../assets/logo.png")
          }
          style={styles.profileImage}
        />
      )}

<TouchableOpacity style={styles.button} onPress={pickImageFromGallery}>
        <Icon name="image" size={18} color="#fff" />
        <Text style={styles.buttonText}>Choose from Gallery</Text>
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <Icon name="email" size={20} color="#a8325a" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          editable={false} // Email is not editable
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="account" size={20} color="#a8325a" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={fullname}
          onChangeText={setFullname}
          placeholder="Full Name"
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon
          name="account-edit"
          size={20}
          color="#a8325a"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          value={pseudo}
          onChangeText={setPseudo}
          placeholder="Pseudo"
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="phone" size={20} color="#a8325a" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone"
          keyboardType="phone-pad"
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Icon name="content-save" size={18} color="#fff" />
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //padding: 20,
    width:"100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff5f7", // Light background to complement the theme
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#a8325a",
    marginBottom: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#a8325a", 
    backgroundColor: "#ffe6eb", 
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#a8325a",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    width: "100%",
  },
  icon: {
    marginHorizontal: 8,
  },
  input: {
    height: 50,
    borderColor: "#a8325a",
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#333",
    width: "90%",
  },
  saveButton: {
     flexDirection: "row", alignItems: "center",
    backgroundColor: "#a8325a",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default ProfileScreen;
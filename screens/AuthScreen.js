import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground
} from "react-native";
import { auth, database } from "../firebaseConfig"; // Keep Firebase auth import
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { Raleway_200ExtraLight } from "@expo-google-fonts/raleway"
import { ref, set, get, getDatabase } from "firebase/database";
import * as ImagePicker from "expo-image-picker";
import { useFonts } from "expo-font";
import { Quicksand_300Bold } from "@expo-google-fonts/quicksand";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// const ImagePickerComponent = ({ setProfileImage }) => {
//   // Request permissions when the component mounts
//   useEffect(() => {
//     const requestPermissions = async () => {
//       const { status } =
//         await ImagePicker.requestMediaLibraryPermissionsAsync();
//       if (status!== "granted") {
//         Alert.alert(
//           "Permission Required",
//           "Permission to access the media library is required."
//         );
//       }
//     };
//     requestPermissions();
//   }, []);

//   const pickImage = async () => {
//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: false,
//         quality: 1,
//       });

//       if (!result.canceled) {
//         if(result.assets[0].uri )
//         setProfileImage(result.assets[0].uri  );
//       else setProfileImage("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnCgk2uVMMn9eKR38K4B3pMcoTAPsLdZXmnw&s")
//         console.log("Image selected:", result.assets[0].uri);
//       }
//     } catch (error) {
//       console.error("Error picking image:", error);
//     }
//   };

//   return (
//     <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
//     <Icon name="camera-plus" size={30} color="#fff" />
//   </TouchableOpacity>
//   );
// };

// const AuthScreen = ({
//   email,
//   setEmail,
//   password,
//   setPassword,
//   fullname,
//   setFullname,
//   pseudo,
//   setPseudo,
//   phone,
//   setPhone,
//   isLogin,
//   setIsLogin,
//   handleAuthentication,
//   profileImage,
//   setProfileImage,
// }) => {
//   const [fontsLoaded] = useFonts({
//     Raleway_200ExtraLight,
//     Quicksand_300Bold,
//   });
  
//   return (
//     <ImageBackground
//     source={require("../assets/back.jpg")} // Replace with your background image path
//     style={styles.background}>
//     <View style={styles.authContainer}>
//     <Icon name="home" size={30} color="#900" />
//       <Text style={styles.title}>{isLogin? "Sign In" : "Sign Up"}</Text>
//       <View style={styles.inputContainer}>
//   <Icon name="email" size={20} color="#fff" style={styles.icon} />
//   <TextInput
//     style={styles.input}
//     value={email}
//     onChangeText={setEmail}
//     placeholder="Email"
//     autoCapitalize="none"
//     placeholderTextColor="#fff"
//   />
// </View>
// <View style={styles.inputContainer}>
//   <Icon name="lock" size={20} color="#fff" style={styles.icon} />
//   <TextInput
//     style={styles.input}
//     value={password}
//     onChangeText={setPassword}
//     placeholder="Password"
//     secureTextEntry
//     placeholderTextColor="#fff"
//   />
// </View>
//       {/* New Fields */}
//       {!isLogin && (
//     <>
//       <View style={styles.inputContainer}>
//         <Icon name="account" size={20} color="#fff" style={styles.icon} />
//         <TextInput
//           style={styles.input}
//           value={fullname}
//           onChangeText={setFullname}
//           placeholder="Full Name"
//           placeholderTextColor="#fff"
//         />
//       </View>

//       <View style={styles.inputContainer}>
//         <Icon name="account-circle" size={20} color="#fff" style={styles.icon} />
//         <TextInput
//           style={styles.input}
//           value={pseudo}
//           onChangeText={setPseudo}
//           placeholder="Pseudo"
//           placeholderTextColor="#fff"
//         />
//       </View>

//       <View style={styles.inputContainer}>
//         <Icon name="phone" size={20} color="#fff" style={styles.icon} />
//         <TextInput
//           style={styles.input}
//           value={phone}
//           onChangeText={setPhone}
//           placeholder="Phone Number"
//           keyboardType="phone-pad"
//           placeholderTextColor="#fff"
//         />
//       </View>
//       <ImagePickerComponent setProfileImage={setProfileImage} />
//           {profileImage && (
//             <Image source={{ uri: profileImage }} style={styles.profileImage} />
//           )}
        
//     </>
//   )}
//       <View style={styles.buttonContainer}>
//         <Button
//           title={isLogin? "Sign In" : "Sign Up"}
//           onPress={handleAuthentication}
//           color="#7A288A"
//         />
//       </View>
//       <View style={styles.bottomContainer}>
//         <Text
//           style={styles.toggleText}
//           onPress={() => setIsLogin(!isLogin)}
//         >
//           {isLogin
//            ? "Need an account? Sign Up"
//             : "Already have an account? Sign In"}
//         </Text>
//       </View>
//     </View>
//     </ImageBackground>
//   );
// };




// const styles = StyleSheet.create({
//   authContainer: { 
//     flex: 1, 
//     padding: 16, 
//     justifyContent: "center", 
//     alignItems: "center", 
//     width: '100%', 
//   },
//   background: {
//     flex: 1,
//     resizeMode: "cover", 
//     width: '100%', 
//     height: '100%', 
//   },
//   title: { color: "#ffff", fontSize: 24, marginBottom: 16, textAlign: 'center' },
//   input: { 
//     borderWidth: 1, 
//     marginBottom: 16, 
//     padding: 8, 
//     width: '80%', 
//     color: "#ffff",
//   },
//   buttonContainer: { 
//     marginBottom: 16, 
//     width: '80%', 
//   },
//   bottomContainer: { 
//     marginTop: 16, 
//     width: '100%', 
//     alignItems: 'center', 
//   },
//   toggleText: { 
//     color: "#ffff", 
//     textAlign: "center" 
//   },
//   profileImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     marginVertical: 16,
//   },
//   galleryButton: {
//     backgroundColor: "#3498db",
//     padding: 10,
//     marginTop:10,

//     marginBottom:20,
//     borderRadius: 5,
//     alignItems: "center",
//     width: '80%', // Adjust button width
//   },
//   galleryButtonText: { color: "#fff" },
//   inputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#fff",
//     marginBottom: 16,
//     paddingHorizontal: 8,
//     borderRadius: 5,
//     width: "80%",
//   },
//   icon: {
//     marginRight: 8,
//   },
//   input: {
//     flex: 1, // Allow the input to take up remaining space
//     color: "#fff",
//     padding: 8,
//   },
//   imagePickerButton: {
//     marginVertical: 16,
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: "#7A288A",
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });


// export default AuthScreen;


// const ImagePickerComponent = ({ setProfileImage }) => {
//   // Request permissions when the component mounts
//   useEffect(() => {
//     const requestPermissions = async () => {
//       const { status } =
//         await ImagePicker.requestMediaLibraryPermissionsAsync();
//       if (status !== "granted") {
//         Alert.alert(
//           "Permission Required",
//           "Permission to access the media library is required."
//         );
//       }
//     };
//     requestPermissions();
//   }, []);
//   const pickImage = async () => {
//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: false,
//         quality: 1,
//       });

//       if (!result.canceled) {
//         setProfileImage(result.assets[0].uri);
//         console.log("Image selected:", result.assets[0].uri);
//       }
//     } catch (error) {
//       console.error("Error picking image:", error);
//     }
//   };

//   return (
//     <TouchableOpacity onPress={pickImage} style={styles.galleryButton}>
//       <Text style={styles.galleryButtonText}>Pick Image from Gallery</Text>
//     </TouchableOpacity>
//   );
// };

const ImagePickerComponent = ({ setProfileImage }) => {
  // Request permissions when the component mounts
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status!== "granted") {
        Alert.alert(
          "Permission Required",
          "Permission to access the media library is required."
        );
      }
    };
    requestPermissions();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        if(result.assets[0].uri )
        setProfileImage(result.assets[0].uri  );
      else setProfileImage("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnCgk2uVMMn9eKR38K4B3pMcoTAPsLdZXmnw&s")
        console.log("Image selected:", result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  return (
    <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
    <Icon name="camera-plus" size={30} color="#fff" />
  </TouchableOpacity>
  );
};

const AuthScreen = ({
  email,
  setEmail,
  password,
  setPassword,
  fullname,
  setFullname,
  pseudo,
  setPseudo,
  phone,
  setPhone,
  isLogin,
  setIsLogin,
  handleAuthentication,
  profileImage,
  setProfileImage,
}) => {
  return (
    <ImageBackground
        source={require("../assets/back.jpg")} // Replace with your background image path
        style={styles.background}>
        <View style={styles.authContainer}>
        <Icon name="home" size={30} color="#900" />
          <Text style={styles.title}>{isLogin? "Sign In" : "Sign Up"}</Text>
          <View style={styles.inputContainer}>
      <Icon name="email" size={20} color="#fff" style={styles.icon} />
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
        placeholderTextColor="#fff"
      />
    </View>
    <View style={styles.inputContainer}>
      <Icon name="lock" size={20} color="#fff" style={styles.icon} />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        placeholderTextColor="#fff"
      />
    </View>
          {/* New Fields */}
          {!isLogin && (
        <>
          <View style={styles.inputContainer}>
            <Icon name="account" size={20} color="#fff" style={styles.icon} />
            <TextInput
              style={styles.input}
              value={fullname}
              onChangeText={setFullname}
              placeholder="Full Name"
              placeholderTextColor="#fff"
            />
          </View>
    
          <View style={styles.inputContainer}>
            <Icon name="account-circle" size={20} color="#fff" style={styles.icon} />
            <TextInput
              style={styles.input}
              value={pseudo}
              onChangeText={setPseudo}
              placeholder="Pseudo"
              placeholderTextColor="#fff"
            />
          </View>
    
          <View style={styles.inputContainer}>
            <Icon name="phone" size={20} color="#fff" style={styles.icon} />
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              placeholderTextColor="#fff"
            />
          </View>
          <ImagePickerComponent setProfileImage={setProfileImage} />
              {profileImage && (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              )}
            
        </>
      )}
          <View style={styles.buttonContainer}>
            <Button
              title={isLogin? "Sign In" : "Sign Up"}
              onPress={handleAuthentication}
              color="#7A288A"
            />
          </View>
          <View style={styles.bottomContainer}>
            <Text
              style={styles.toggleText}
              onPress={() => setIsLogin(!isLogin)}
            >
              {isLogin
               ? "Need an account? Sign Up"
                : "Already have an account? Sign In"}
            </Text>
          </View>
        </View>
        </ImageBackground>
  );
};

export default function AuthScreenComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [phone, setPhone] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [profileImage, setProfileImage] = useState(null);

  const handleAuthentication = async () => {
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        const userDataSnapshot = await get(ref(database, `users/${user.uid}`));
        const userData = userDataSnapshot.val();
        setProfileImage(userData.picture || null);

        console.log("User signed in successfully!", userData);
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        await set(ref(database, `users/${user.uid}`), {
          email: user.email,
          fullname: fullname,
          pseudo: pseudo,
          phone: phone,
          picture: profileImage,
          createdAt: new Date().toISOString(),
        });

        console.log("User signed up and data saved to database!");
      }
    } catch (error) {
      console.error("Authentication error:", error.message);
    }
  };

  return (
    <AuthScreen
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      fullname={fullname}
      setFullname={setFullname}
      pseudo={pseudo}
      setPseudo={setPseudo}
      phone={phone}
      setPhone={setPhone}
      isLogin={isLogin}
      setIsLogin={setIsLogin}
      handleAuthentication={handleAuthentication}
      profileImage={profileImage}
      setProfileImage={setProfileImage}
    />
  );
}

const styles = StyleSheet.create({
  authContainer: { 
    flex: 1, 
    padding: 16, 
    justifyContent: "center", 
    alignItems: "center", 
    width: '100%', 
  },
  background: {
    flex: 1,
    resizeMode: "cover", 
    width: '100%', 
    height: '100%', 
  },
  title: { color: "#ffff", fontSize: 24, marginBottom: 16, textAlign: 'center' },
  input: { 
    borderWidth: 1, 
    marginBottom: 16, 
    padding: 8, 
    width: '80%', 
    color: "#ffff",
  },
  buttonContainer: { 
    marginBottom: 16, 
    width: '80%', 
  },
  bottomContainer: { 
    marginTop: 16, 
    width: '100%', 
    alignItems: 'center', 
  },
  toggleText: { 
    color: "#ffff", 
    textAlign: "center" 
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginVertical: 16,
  },
  galleryButton: {
    backgroundColor: "#3498db",
    padding: 10,
    marginTop:10,

    marginBottom:20,
    borderRadius: 5,
    alignItems: "center",
    width: '80%', // Adjust button width
  },
  galleryButtonText: { color: "#fff" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fff",
    marginBottom: 16,
    paddingHorizontal: 8,
    borderRadius: 5,
    width: "80%",
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1, // Allow the input to take up remaining space
    color: "#fff",
    padding: 8,
  },
  imagePickerButton: {
    marginVertical: 16,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#7A288A",
    justifyContent: "center",
    alignItems: "center",
  },
});
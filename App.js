import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from '@firebase/auth';
import app from './firebaseConfig';
import AuthScreen from './screens/AuthScreen';
import AuthenticatedScreen from './screens/AuthenticatedScreen';

const App = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const auth = getAuth(app);

  // Manage user authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  // UseCallback to memoize the handleAuthentication function
  const handleAuthentication = useCallback(async () => {
    try {
      if (user) {
        await signOut(auth);
      } else {
        if (isLogin) {
          await signInWithEmailAndPassword(auth, email, password);
        } else {
          await createUserWithEmailAndPassword(auth, email, password);
        }
      }
    } catch (error) {
      console.error('Authentication error:', error.message);
    }
  }, [auth, email, password, isLogin, user]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {user ? (
        <AuthenticatedScreen 
          user={user} 
          handleAuthentication={handleAuthentication} 
        />
      ) : (
        <AuthScreen
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          profileImage={profileImage}
          setProfileImage={setProfileImage}
          isLogin={isLogin}
          setIsLogin={setIsLogin}
          handleAuthentication={handleAuthentication}
        />
      )}
    </ScrollView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 0,
    marginHorizontal: 0,
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
});

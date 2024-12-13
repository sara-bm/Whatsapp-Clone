// Navbar.js 
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Navbar = ({ setSelectedTab }) => {
  return (
    <View style={styles.navbar}>
      <TouchableOpacity style={styles.navItem} onPress={() => setSelectedTab('Profile')}>
        <Icon name="account" size={24} color="white" />
        <Text style={styles.navText}>My Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => setSelectedTab('Chats')}>
        <Icon name="chat" size={24} color="white" />
        <Text style={styles.navText}>Chats</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => setSelectedTab('Groups')}>
        <Icon name="account-group" size={24} color="white" />
        <Text style={styles.navText}>Groups</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => setSelectedTab('Logout')}>
        <Icon name="logout" size={24} color="#e74c3c" />
        <Text style={[styles.navText, { color: '#e74c3c' }]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    height: 60,
    backgroundColor: '#a8325a',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
    zIndex: 1,
  },
  navItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 12,
    color: 'white',
    marginTop: 4,
  },
});

export default Navbar;

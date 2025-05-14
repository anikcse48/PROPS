import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Text, Button, Alert, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import {
  initDatabase,
  exportDatabaseToStorage,
  getDatabase,
  logoutUser,
} from './database';

import DataCollectionForm from './DataCollectionForm';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';

const Drawer = createDrawerNavigator();

function ExportScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button
        title="Export DB"
        onPress={async () => {
          try {
            await exportDatabaseToStorage();
            Alert.alert('Success', 'Database exported successfully!');
          } catch (e) {
            Alert.alert('Export Failed', e.message);
          }
        }}
      />
    </View>
  );
}

function ImportScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>📥 Import Screen</Text>
    </View>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null means loading
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initDatabase(); // This will create necessary tables if they don't exist
        console.log('Database initialized successfully');
        const userEmail = await SecureStore.getItemAsync('userEmail');
        setIsLoggedIn(!!userEmail); // Auto-login if email exists
      } catch (error) {
        console.error('Error initializing database:', error.message);
        Alert.alert('Database Error', 'Failed to initialize database.');
      } finally {
        setDbReady(true);
      }
    };

    initializeApp();
  }, []);

  const loginHandler = async () => {
    setIsLoggedIn(true);
  };

  const logoutHandler = async () => {
    try {
      await SecureStore.deleteItemAsync('userEmail');
      const db = await getDatabase();
      await db.runAsync('UPDATE users SET is_logged_in = 0');
      setIsLoggedIn(false);
      Alert.alert('Logged Out', 'You have been logged out.');
    } catch (error) {
      console.error('Logout Error:', error);
      Alert.alert('Logout Error', 'Failed to log out. Please try again.');
    }
  };

  if (!dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading database...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        {!isLoggedIn ? (
          <Drawer.Navigator initialRouteName="Login">
            <Drawer.Screen name="Login">
              {(props) => <LoginScreen {...props} loginHandler={loginHandler} />}
            </Drawer.Screen>
            <Drawer.Screen name="Register">
              {(props) => <RegisterScreen {...props} loginHandler={loginHandler} />}
            </Drawer.Screen>
          </Drawer.Navigator>
        ) : (
          <Drawer.Navigator initialRouteName="Home">
            <Drawer.Screen name="Home" component={DataCollectionForm} />
            <Drawer.Screen name="Export" component={ExportScreen} />
            <Drawer.Screen name="Import" component={ImportScreen} />
            <Drawer.Screen name="Logout">
              {() => (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Button title="Logout" onPress={logoutHandler} />
                </View>
              )}
            </Drawer.Screen>
          </Drawer.Navigator>
        )}
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image } from 'react-native';
import * as SecureStore from 'expo-secure-store'; // Secure store for saving user email
import { loginUser } from './database';

export default function LoginScreen({ navigation, loginHandler }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    // Basic validation
    if (!normalizedEmail || !password.trim()) {
      Alert.alert('Input Error', 'Please enter both email and password.');
      return;
    }

    try {
      const result = await loginUser(normalizedEmail, password);
      if (result.success) {
        // Store email securely for later use (if needed)
        await SecureStore.setItemAsync('user_email', normalizedEmail);
        
        // Handle the logged-in state
        loginHandler(); // Sets isLoggedIn = true in App

        // Optionally, navigate to another screen after successful login
        // navigation.navigate('Home'); // Uncomment if needed
      } else {
        Alert.alert('Login Failed', result.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login Error:', error);
      Alert.alert('Login Failed', error.message || 'Unknown error');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('./assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />

      <Button title="Login" onPress={handleLogin} />

      <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
        Don't have an account? Register here
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 16, borderRadius: 6 },
  link: { marginTop: 16, color: 'blue', textAlign: 'center' },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
});

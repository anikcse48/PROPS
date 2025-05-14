import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store'; // Secure store for saving user email
import { registerUser, loginUser } from './database';

export default function RegisterScreen({ navigation, loginHandler }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    // Validate input fields
    if (!normalizedEmail || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);  // Start loading spinner

    try {
      const result = await registerUser(normalizedEmail, password);
      if (result.success) {
        // Optionally auto-login the user after registration
        const loginResult = await loginUser(normalizedEmail, password);
        if (loginResult.success) {
          loginHandler(); // Sets isLoggedIn = true in App
        }
      } else {
        Alert.alert('Registration Failed', result.message);
      }
    } catch (error) {
      console.error("Registration Error:", error);
      Alert.alert('Registration Failed', error.message || 'Unknown error');
    } finally {
      setLoading(false);  // Stop loading spinner
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('./assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Register</Text>

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

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <Button title="Register" onPress={handleRegister} />
      )}

      <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
        Already have an account? Login here
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

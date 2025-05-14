// SecureStoreUtil.js
import * as SecureStore from 'expo-secure-store';

// Save data securely
export const saveToSecureStore = async (key, value) => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error(`Failed to save ${key} to SecureStore`, error);
  }
};

// Retrieve data securely
export const getFromSecureStore = async (key) => {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value || null;
  } catch (error) {
    console.error(`Failed to retrieve ${key} from SecureStore`, error);
    return null;
  }
};

// Delete data securely
export const deleteFromSecureStore = async (key) => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`Failed to delete ${key} from SecureStore`, error);
  }
};

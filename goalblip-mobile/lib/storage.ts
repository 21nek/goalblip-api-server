import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage abstraction for web and native
// For web: uses localStorage
// For native: uses AsyncStorage (persistent storage)

export async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('[Storage] Failed to get item:', error);
      return null;
    }
  }
  // Native: use AsyncStorage
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error('[Storage] Failed to get item:', error);
    return null;
  }
}

export async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('[Storage] Failed to set item:', error);
    }
    return;
  }
  // Native: use AsyncStorage
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error('[Storage] Failed to set item:', error);
  }
}

export async function removeItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('[Storage] Failed to remove item:', error);
    }
    return;
  }
  // Native: use AsyncStorage
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('[Storage] Failed to remove item:', error);
  }
}


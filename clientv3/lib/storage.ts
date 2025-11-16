import { Platform } from 'react-native';

// Simple storage abstraction for web and native
// For web: uses localStorage
// For native: uses a simple in-memory store (can be replaced with AsyncStorage later)

const storage: Record<string, string> = {};

export async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('[Storage] Failed to get item:', error);
      return null;
    }
  }
  // Native: use in-memory storage for now
  return storage[key] || null;
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
  // Native: use in-memory storage for now
  storage[key] = value;
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
  // Native: use in-memory storage for now
  delete storage[key];
}


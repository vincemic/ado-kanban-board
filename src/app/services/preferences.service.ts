import { Injectable } from '@angular/core';

export interface UserCredentials {
  organizationName: string;
  accessToken: string;
  projectName?: string;
}

export interface UserPreferences {
  rememberCredentials: boolean;
  credentials?: UserCredentials;
  // Future preferences can be added here
  theme?: string;
  language?: string;
  notifications?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  private readonly STORAGE_KEY = 'adoKanbanPreferences';
  private readonly CREDENTIALS_KEY = 'adoKanbanCredentials';

  constructor() { }

  /**
   * Save user preferences to localStorage
   */
  savePreferences(preferences: Partial<UserPreferences>): void {
    try {
      const currentPrefs = this.getPreferences();
      const updatedPrefs = { ...currentPrefs, ...preferences };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedPrefs));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }

  /**
   * Get user preferences from localStorage
   */
  getPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
    
    // Return default preferences
    return {
      rememberCredentials: false
    };
  }

  /**
   * Save user credentials to localStorage (encrypted in a real app)
   */
  saveCredentials(credentials: UserCredentials): void {
    try {
      // In a production app, you would encrypt these credentials
      localStorage.setItem(this.CREDENTIALS_KEY, JSON.stringify(credentials));
    } catch (error) {
      console.error('Failed to save credentials:', error);
    }
  }

  /**
   * Get saved credentials from localStorage
   */
  getSavedCredentials(): UserCredentials | null {
    try {
      const stored = localStorage.getItem(this.CREDENTIALS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load credentials:', error);
    }
    return null;
  }

  /**
   * Clear saved credentials
   */
  clearCredentials(): void {
    try {
      localStorage.removeItem(this.CREDENTIALS_KEY);
    } catch (error) {
      console.error('Failed to clear credentials:', error);
    }
  }

  /**
   * Clear all preferences and credentials
   */
  clearAll(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.CREDENTIALS_KEY);
    } catch (error) {
      console.error('Failed to clear preferences:', error);
    }
  }

  /**
   * Check if credentials should be remembered
   */
  shouldRememberCredentials(): boolean {
    const prefs = this.getPreferences();
    return prefs.rememberCredentials;
  }
}
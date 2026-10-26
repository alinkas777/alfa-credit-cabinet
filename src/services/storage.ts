import { CreditApplication } from '../types';

const STORAGE_KEY = 'credit_applications';

export const StorageService = {
  saveApplications(applications: CreditApplication[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
    } catch (error) {
      console.error('Failed to save applications to localStorage:', error);
    }
  },

  loadApplications(): CreditApplication[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load applications from localStorage:', error);
      return [];
    }
  },

  clearApplications(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear applications from localStorage:', error);
    }
  }
};

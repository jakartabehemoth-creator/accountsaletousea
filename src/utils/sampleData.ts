import { GameAccount } from '@/types';

export const initializeSampleData = () => {
  // Initialize empty accounts array if doesn't exist
  const existingAccounts = localStorage.getItem('gameAccounts');
  if (!existingAccounts) {
    localStorage.setItem('gameAccounts', JSON.stringify([]));
  }
  
  // Initialize default game icons if they don't exist
  const existingIcons = localStorage.getItem('gameIcons');
  if (!existingIcons) {
    const defaultIcons = {
      valorant: null,
      bloodstrike: null,
      'knives-out': null,
      farlight: null
    };
    localStorage.setItem('gameIcons', JSON.stringify(defaultIcons));
  }
};
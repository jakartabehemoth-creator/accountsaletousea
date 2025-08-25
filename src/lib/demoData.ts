import { GameAccount } from '@/types';
import { getGames, getAccounts, setAccounts } from './localStorage';

export const createDemoAccounts = () => {
  const games = getGames();
  const existingAccounts = getAccounts();
  
  // Only create demo accounts if none exist
  if (existingAccounts.length > 0) return;

  const demoAccounts: GameAccount[] = [
    // Valorant Accounts
    {
      id: 'val1',
      gameId: '1',
      gameName: 'Valorant',
      level: 45,
      rank: 'Diamond 2',
      status: 'Fresh',
      price: 89.99,
      description: 'Fresh Valorant account with Diamond 2 rank. All agents unlocked, good weapon skins collection.',
      screenshots: [],
      createdAt: new Date().toISOString(),
      createdBy: '1'
    },
    {
      id: 'val2',
      gameId: '1',
      gameName: 'Valorant',
      level: 78,
      rank: 'Immortal 1',
      status: 'First Owner',
      price: 149.99,
      description: 'High-rank Valorant account with premium battle pass completed. Rare skins included.',
      screenshots: [],
      createdAt: new Date().toISOString(),
      createdBy: '1'
    },
    {
      id: 'val3',
      gameId: '1',
      gameName: 'Valorant',
      level: 32,
      rank: 'Platinum 3',
      status: 'Fresh',
      price: 59.99,
      description: 'Solid mid-tier account perfect for competitive play.',
      screenshots: [],
      createdAt: new Date().toISOString(),
      createdBy: '1'
    },
    // Farlight Accounts
    {
      id: 'far1',
      gameId: '2',
      gameName: 'Farlight',
      level: 25,
      rank: 'Gold III',
      status: 'Fresh',
      price: 39.99,
      description: 'Well-maintained Farlight account with good progression.',
      screenshots: [],
      createdAt: new Date().toISOString(),
      createdBy: '1'
    },
    {
      id: 'far2',
      gameId: '2',
      gameName: 'Farlight',
      level: 56,
      rank: 'Diamond I',
      status: 'First Owner',
      price: 79.99,
      description: 'High-level Farlight account with exclusive items and skins.',
      screenshots: [],
      createdAt: new Date().toISOString(),
      createdBy: '1'
    },
    // Bloodstrike Accounts
    {
      id: 'blood1',
      gameId: '3',
      gameName: 'Bloodstrike',
      level: 18,
      rank: 'Silver II',
      status: 'Fresh',
      price: 24.99,
      description: 'Entry-level Bloodstrike account, great for beginners.',
      screenshots: [],
      createdAt: new Date().toISOString(),
      createdBy: '1'
    },
    {
      id: 'blood2',
      gameId: '3',
      gameName: 'Bloodstrike',
      level: 67,
      rank: 'Master',
      status: 'First Owner',
      price: 119.99,
      description: 'Master tier account with extensive weapon collection and achievements.',
      screenshots: [],
      createdAt: new Date().toISOString(),
      createdBy: '1'
    },
    // Knives Out Accounts
    {
      id: 'knives1',
      gameId: '4',
      gameName: 'Knives Out',
      level: 42,
      rank: 'Elite V',
      status: 'Fresh',
      price: 69.99,
      description: 'High-tier Knives Out account with rare cosmetics.',
      screenshots: [],
      createdAt: new Date().toISOString(),
      createdBy: '1'
    },
    {
      id: 'knives2',
      gameId: '4',
      gameName: 'Knives Out',
      level: 35,
      rank: 'Pro III',
      status: 'Cheated',
      price: 29.99,
      description: 'Account with some history but still functional. Discounted price.',
      screenshots: [],
      createdAt: new Date().toISOString(),
      createdBy: '1'
    }
  ];

  setAccounts(demoAccounts);
};
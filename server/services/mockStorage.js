const fs = require('fs');
const path = require('path');

const MOCK_DB_PATH = path.join(__dirname, '../data/mock_db.json');

// Memory fallback for read-only environments (like Vercel)
let memoryDB = { users: [], locations: [] };
let useMemory = false;

try {
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(MOCK_DB_PATH)) {
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(memoryDB));
  }
} catch (err) {
  console.log('⚠️ Running in read-only mode (Vercel). Switching to in-memory mock storage.');
  useMemory = true;
}

const getDB = () => {
  if (useMemory) return memoryDB;
  try {
    return JSON.parse(fs.readFileSync(MOCK_DB_PATH, 'utf8'));
  } catch (err) {
    return memoryDB;
  }
};

const saveDB = (data) => {
  if (useMemory) {
    memoryDB = data;
    return;
  }
  try {
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    memoryDB = data;
    useMemory = true;
  }
};

const mockStorage = {
  users: {
    find: async (query) => {
      const db = getDB();
      return db.users.filter(u => Object.keys(query).every(k => u[k] === query[k]));
    },
    findOne: async (query) => {
      const db = getDB();
      return db.users.find(u => Object.keys(query).every(k => u[k] === query[k])) || null;
    },
    findById: async (id) => {
      const db = getDB();
      return db.users.find(u => u._id === id) || null;
    },
    create: async (userData) => {
      const db = getDB();
      const newUser = { 
        ...userData, 
        _id: 'mock_' + Date.now(),
        createdAt: new Date(),
        toPublicJSON: function() {
          const { passwordHash, ...rest } = this;
          return rest;
        },
        comparePassword: async (p) => p === userData.passwordHash
      };
      db.users.push(newUser);
      saveDB(db);
      return newUser;
    },
    findByIdAndUpdate: async (id, updates) => {
      const db = getDB();
      const idx = db.users.findIndex(u => u._id === id);
      if (idx === -1) return null;
      db.users[idx] = { ...db.users[idx], ...updates };
      saveDB(db);
      return db.users[idx];
    }
  }
};

module.exports = mockStorage;

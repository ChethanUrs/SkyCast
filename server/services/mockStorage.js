const fs = require('fs');
const path = require('path');

const MOCK_DB_PATH = path.join(__dirname, '../data/mock_db.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Initial structure
if (!fs.existsSync(MOCK_DB_PATH)) {
  fs.writeFileSync(MOCK_DB_PATH, JSON.stringify({ users: [], locations: [] }));
}

const getDB = () => JSON.parse(fs.readFileSync(MOCK_DB_PATH, 'utf8'));
const saveDB = (data) => fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(data, null, 2));

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
        // Mocking methods
        toPublicJSON: function() {
          const { passwordHash, ...rest } = this;
          return rest;
        },
        comparePassword: async (p) => p === userData.passwordHash // Very simple mock
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

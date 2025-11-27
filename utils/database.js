const fs = require('fs');
const path = require('path');
const DB_PATH = path.join(__dirname, '../users.db.json');

class Database {
  static load() {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify({ users: [] }, null, 2));
    }
    return JSON.parse(fs.readFileSync(DB_PATH));
  }

  static save(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  }

  static findUserByDiscordId(id) {
    const db = this.load();
    return db.users.find(u => u.discordId === id);
  }

  static addUser(userData) {
    const db = this.load();
    db.users.push(userData);
    this.save(db);
  }
}

module.exports = Database;

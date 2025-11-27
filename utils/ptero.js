require('dotenv').config();
const axios = require('axios');

const api = axios.create({
  baseURL: `${process.env.PTERO_URL}/api/application`,
  headers: {
    'Authorization': `Bearer ${process.env.PTERO_API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'Application/vnd.pterodactyl.v1+json'
  },
  timeout: 15000
});

class PteroAPI {
  static async createUser(email, username, firstName = "User", lastName = "Bot") {
    const password = require('crypto').randomBytes(10).toString('hex') + "A1!";
    const res = await api.post('/users', {
      email, username, first_name: firstName, last_name: lastName, password
    });
    return { ...res.data.attributes, password };
  }

  static async createServer(payload) {
    const res = await api.post('/servers', payload);
    return res.data.attributes;
  }
}

module.exports = PteroAPI;

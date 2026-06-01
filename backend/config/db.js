const mongoose = require('mongoose');
const dns = require('node:dns');
require('dotenv').config();

// System DNS SRV resolve nahi kar pa raha, custom DNS use kar rahe hain
const dnsServers = process.env.DNS_SERVERS ? process.env.DNS_SERVERS.split(',') : ['8.8.8.8', '8.8.4.4']; // NOSONAR
dns.setServers(dnsServers);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB se connection ho gaya!');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

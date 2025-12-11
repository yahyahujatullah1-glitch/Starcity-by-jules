const mongoose = require('mongoose');

// YOUR CONNECTION STRING
const MONGO_URI = "mongodb+srv://yahyabaloch:Baloch*123*@cluster0.zkxkenx.mongodb.net/?appName=Cluster0";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;

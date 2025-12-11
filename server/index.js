const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { User, Task, Message, Log, Role } = require('./models/Schemas');

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. CONNECT TO MONGODB ---
// ✅ YOUR EXACT CREDENTIALS
const MONGO_URI = "mongodb+srv://yahyabaloch:Baloch*123*@cluster0.zkxkenx.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// --- 2. ROUTES ---

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (user) res.json(user);
    else res.status(401).json({ error: "Invalid credentials" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Staff
app.get('/api/staff', async (req, res) => {
  try {
    const staff = await User.find();
    const roles = await Role.find();
    const merged = staff.map(u => {
      const r = roles.find(role => role.name === u.role);
      return { ...u._doc, roles: r || { name: u.role, color: 'bg-gray-500' } };
    });
    res.json(merged);
  } catch (e) { res.json([]); }
});

app.post('/api/staff', async (req, res) => {
  const newUser = new User({ ...req.body, avatar_url: `https://i.pravatar.cc/150?u=${Date.now()}` });
  await newUser.save();
  res.json(newUser);
});

app.delete('/api/staff/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().populate('assigned_to').sort({ created_at: -1 });
    const formatted = tasks.map(t => ({
      ...t._doc,
      id: t._id,
      profiles: t.assigned_to
    }));
    res.json(formatted);
  } catch (e) { res.json([]); }
});

app.post('/api/tasks', async (req, res) => {
  const newTask = new Task(req.body);
  await newTask.save();
  res.json(newTask);
});

// Chat
app.get('/api/chat', async (req, res) => {
  try {
    const messages = await Message.find().populate('sender_id').sort({ created_at: 1 });
    const formatted = messages.map(m => ({
      id: m._id,
      content: m.content,
      profiles: m.sender_id
    }));
    res.json(formatted);
  } catch (e) { res.json([]); }
});

app.post('/api/chat', async (req, res) => {
  const msg = new Message(req.body);
  await msg.save();
  res.json(msg);
});

// SEED (Run this once to create your Admin User)
app.get('/api/seed', async (req, res) => {
  try {
    await User.deleteMany({});
    await Role.deleteMany({});
    
    await Role.create({ name: 'Admin', color: 'bg-red-600' });
    await Role.create({ name: 'Staff', color: 'bg-blue-600' });

    await User.create({
      full_name: 'Admin User',
      email: 'admin@staffnet.com',
      password: 'password123',
      role: 'Admin',
      avatar_url: 'https://i.pravatar.cc/150?u=admin'
    });
    
    res.send("✅ Database Seeded! Login with admin@staffnet.com / password123");
  } catch (e) {
    res.status(500).send("Error seeding: " + e.message);
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

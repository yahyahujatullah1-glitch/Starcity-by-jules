const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  full_name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  avatar_url: String,
  status: { type: String, default: 'Active' }
});

const TaskSchema = new mongoose.Schema({
  title: String,
  status: { type: String, default: 'Todo' },
  priority: { type: String, default: 'Medium' },
  due_date: String,
  proof_url: String,
  proof_status: { type: String, default: 'none' },
  assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  created_at: { type: Date, default: Date.now }
});

const MessageSchema = new mongoose.Schema({
  content: String,
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  created_at: { type: Date, default: Date.now }
});

const RoleSchema = new mongoose.Schema({
  name: String,
  color: String
});

// Prevent model overwrite error in serverless
module.exports = {
  User: mongoose.models.User || mongoose.model('User', UserSchema),
  Task: mongoose.models.Task || mongoose.model('Task', TaskSchema),
  Message: mongoose.models.Message || mongoose.model('Message', MessageSchema),
  Role: mongoose.models.Role || mongoose.model('Role', RoleSchema)
};

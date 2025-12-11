const connectDB = require('./_db');
const { User, Role } = require('./_models');

module.exports = async (req, res) => {
  await connectDB();

  if (req.method === 'GET') {
    const staff = await User.find();
    const roles = await Role.find();
    const merged = staff.map(u => {
      const r = roles.find(role => role.name === u.role);
      return { ...u._doc, roles: r || { name: u.role, color: 'bg-gray-500' } };
    });
    return res.json(merged);
  }

  if (req.method === 'POST') {
    const newUser = new User({ ...req.body, avatar_url: `https://i.pravatar.cc/150?u=${Date.now()}` });
    await newUser.save();
    return res.json(newUser);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query; // Vercel passes query params
    // If ID is not in query, check body or path parsing (Vercel specific)
    // For simplicity in this setup, we might need to parse ID from body if query fails
    await User.findByIdAndDelete(req.body.id || id); 
    return res.json({ success: true });
  }
};

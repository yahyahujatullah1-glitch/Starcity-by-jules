const connectDB = require('./_db');
const { Task } = require('./_models');

module.exports = async (req, res) => {
  await connectDB();

  if (req.method === 'GET') {
    const tasks = await Task.find().populate('assigned_to').sort({ created_at: -1 });
    const formatted = tasks.map(t => ({
      ...t._doc,
      id: t._id,
      profiles: t.assigned_to
    }));
    return res.json(formatted);
  }

  if (req.method === 'POST') {
    const newTask = new Task(req.body);
    await newTask.save();
    return res.json(newTask);
  }
};

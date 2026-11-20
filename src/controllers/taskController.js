const Task = require('../models/Task');
const AppError = require('../utils/AppError');

// Every query is scoped to the logged-in user (owner) so users never see each other's data
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    const task = await Task.create({
      title, description, status, priority, dueDate, owner: req.user._id,
    });
    res.status(201).json({ status: 'success', data: { task } });
  } catch (err) {
    next(err);
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
    const filter = { owner: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.search) {
      const escaped = String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.title = { $regex: escaped, $options: 'i' };
    }

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(limit),
      Task.countDocuments(filter),
    ]);

    res.json({
      status: 'success',
      results: tasks.length,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      data: { tasks },
    });
  } catch (err) {
    next(err);
  }
};

exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
    if (!task) throw new AppError('Task not found.', 404);
    res.json({ status: 'success', data: { task } });
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const allowed = ['title', 'description', 'status', 'priority', 'dueDate'];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      updates,
      { new: true, runValidators: true }
    );
    if (!task) throw new AppError('Task not found.', 404);
    res.json({ status: 'success', data: { task } });
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!task) throw new AppError('Task not found.', 404);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

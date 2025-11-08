import Notice from "../models/notification.js";
import Task from "../models/task.js";
import User from "../models/user.js";

// CREATE TASK
export const createTask = async (req, res) => {
  try {
    const { userId } = req.user;
    const { title, team, stage, date, priority, assets } = req.body;

    let text = "New task has been assigned to you";
    if (team?.length > 1) text += ` and ${team.length - 1} others.`;

    text += ` The task priority is set at ${priority} priority, so check and act accordingly. The task date is ${new Date(
      date
    ).toDateString()}. Thank you!`;

    const activity = {
      type: "assigned",
      activity: text,
      by: userId,
    };

    const task = await Task.create({
      title,
      team,
      stage: stage.toLowerCase(),
      date,
      priority: priority.toLowerCase(),
      assets,
      activities: [activity], // ✅ FIXED
    });

    await Notice.create({
      team,
      text,
      task: task._id,
    });

    res.status(200).json({
      status: true,
      task,
      message: "Task created successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

// DUPLICATE TASK
export const duplicateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const original = await Task.findById(id).lean(); // ✅ prevents model garbage copy

    const newTask = await Task.create({
      title: original.title + " - Duplicate",
      team: original.team,
      subTasks: original.subTasks,
      assets: original.assets,
      priority: original.priority,
      stage: original.stage,
      date: original.date,
      activities: original.activities, // ✅ keep existing history
    });

    let text = "New task has been assigned to you";
    if (original.team.length > 1) text += ` and ${original.team.length - 1} others.`;

    text += ` The task priority is set at ${original.priority} priority, so act accordingly. The task date is ${original.date.toDateString()}.`;

    await Notice.create({
      team: original.team,
      text,
      task: newTask._id,
    });

    res.status(200).json({
      status: true,
      message: "Task duplicated successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

// POST ACTIVITY (TIMELINE LOG)
export const postTaskActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const { type, activity } = req.body;

    const task = await Task.findById(id);
    task.activities.push({ type, activity, by: userId });
    await task.save();

    res.status(200).json({
      status: true,
      message: "Activity posted successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

// DASHBOARD
export const dashboardStatistics = async (req, res) => {
  try {
    const { userId, isAdmin } = req.user;

    const tasks = isAdmin
      ? await Task.find({ isTrashed: false })
          .populate("team", "name role title email")
          .sort({ _id: -1 })
      : await Task.find({
          isTrashed: false,
          team: { $all: [userId] },
        })
          .populate("team", "name role title email")
          .sort({ _id: -1 });

    const users = isAdmin
      ? await User.find({ isActive: true })
          .select("name title role isAdmin createdAt")
          .limit(10)
          .sort({ _id: -1 })
      : [];

    const tasksByStage = tasks.reduce((obj, t) => {
      obj[t.stage] = (obj[t.stage] || 0) + 1;
      return obj;
    }, {});

    const graphData = Object.entries(
      tasks.reduce((obj, t) => {
        obj[t.priority] = (obj[t.priority] || 0) + 1;
        return obj;
      }, {})
    ).map(([name, total]) => ({ name, total }));

    res.status(200).json({
      status: true,
      totalTasks: tasks.length,
      last10Task: tasks.slice(0, 10),
      users,
      tasks: tasksByStage,
      graphData,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

// GET ALL TASKS
export const getTasks = async (req, res) => {
  try {
    const { stage, isTrashed } = req.query;

    const query = { isTrashed: isTrashed || false };
    if (stage) query.stage = stage;

    const tasks = await Task.find(query)
      .populate("team", "name title email")
      .sort({ _id: -1 });

    res.status(200).json({ status: true, tasks });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

// GET SINGLE TASK
export const getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id)
      .populate("team", "name title role email")
      .populate("activities.by", "name"); // ✅ show actor name
    res.status(200).json({ status: true, task });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

// CREATE SUBTASK
export const createSubTask = async (req, res) => {
  try {
    const { title, tag, date } = req.body;
    const task = await Task.findById(req.params.id);

    task.subTasks.push({ title, tag, date });
    await task.save();

    res.status(200).json({ status: true, message: "SubTask added successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

// UPDATE TASK
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, team, stage, priority, assets } = req.body;

    const task = await Task.findById(id);

    task.title = title;
    task.date = date;
    task.priority = priority.toLowerCase();
    task.assets = assets;
    task.stage = stage.toLowerCase();
    task.team = team;

    await task.save();

    res.status(200).json({ status: true, message: "Task updated successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

// TRASH TASK
export const trashTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    task.isTrashed = true;
    await task.save();

    res.status(200).json({ status: true, message: "Task trashed successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

// DELETE / RESTORE TASK
export const deleteRestoreTask = async (req, res) => {
  try {
    const { actionType } = req.query;
    const { id } = req.params;

    if (actionType === "delete") await Task.findByIdAndDelete(id);
    else if (actionType === "deleteAll") await Task.deleteMany({ isTrashed: true });
    else if (actionType === "restore") await Task.findByIdAndUpdate(id, { isTrashed: false });
    else if (actionType === "restoreAll") await Task.updateMany({ isTrashed: true }, { $set: { isTrashed: false } });

    res.status(200).json({ status: true, message: "Operation performed successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

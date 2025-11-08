import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema(
  {
    title: { type: String, required: true },

    // When task was created (optional because timestamps exist)
    date: { type: Date, default: Date.now },

    // ✅ Improved priority naming
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    // ✅ Project / sprint visibility
    stage: {
      type: String,
      enum: ["todo", "in progress", "completed"],
      default: "todo",
    },

    // ✅ New field for deadlines
    deadline: { type: Date },

    // ✅ Activity log (kept intact, but formatted)
    activities: [
      {
        type: {
          type: String,
          enum: ["assigned", "started", "in progress", "bug", "completed", "commented"],
          default: "assigned",
        },
        activity: String,
        date: { type: Date, default: Date.now },
        by: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],

    // ✅ Subtasks unchanged
    subTasks: [
      {
        title: String,
        date: Date,
        tag: String,
      },
    ],

    // ✅ Attachments / links
    assets: [String],

    // ✅ Task can be assigned to multiple team members
    team: [{ type: Schema.Types.ObjectId, ref: "User" }],

    // ✅ Soft delete support
    isTrashed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;

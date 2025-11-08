import clsx from "clsx";
import moment from "moment";
import React from "react";
import { FaNewspaper } from "react-icons/fa";
import { FaArrowsToDot } from "react-icons/fa6";
import { LuClipboardEdit } from "react-icons/lu";
import { MdAdminPanelSettings, MdKeyboardArrowDown, MdKeyboardArrowUp, MdKeyboardDoubleArrowUp } from "react-icons/md";

import Loading from "../components/Loader";
import UserInfo from "../components/UserInfo";
import { useGetDashboardStatsQuery } from "../redux/slices/api/taskApiSlice";
import { BGS, PRIOTITYSTYELS, TASK_TYPE, getInitials } from "../utils";
import TaskPriorityChart from "../components/Charts/TaskPriorityChart";
import TaskStageBarChart from "../components/Charts/TaskStageBarChart";

const TaskTable = ({ tasks }) => {
  const ICONS = {
    high: <MdKeyboardDoubleArrowUp />,
    medium: <MdKeyboardArrowUp />,
    low: <MdKeyboardArrowDown />,
  };

  return (
    <div className="w-full md:w-2/3 bg-white px-4 py-4 shadow-md rounded">
      <table className="w-full">
        <thead className="border-b border-gray-300">
          <tr className="text-black text-left">
            <th className="py-2">Task Title</th>
            <th className="py-2">Priority</th>
            <th className="py-2">Team</th>
            <th className="py-2 hidden md:block">Created At</th>
          </tr>
        </thead>

        <tbody>
          {tasks?.map((task, id) => (
            <tr key={id} className="border-b border-gray-300 text-gray-600 hover:bg-gray-200/30">
              <td className="py-2">
                <div className="flex items-center gap-2">
                  <div className={clsx("w-4 h-4 rounded-full", TASK_TYPE[task.stage])} />
                  <p className="text-black">{task.title}</p>
                </div>
              </td>

              <td className="py-2">
                <div className="flex items-center gap-1">
                  <span className={clsx("text-lg", PRIOTITYSTYELS[task.priority])}>
                    {ICONS[task.priority]}
                  </span>
                  <span className="capitalize">{task.priority}</span>
                </div>
              </td>

              <td className="py-2">
                <div className="flex">
                  {task.team.map((m, index) => (
                    <div
                      key={index}
                      className={clsx(
                        "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1",
                        BGS[index % BGS.length]
                      )}
                    >
                      <UserInfo user={m} />
                    </div>
                  ))}
                </div>
              </td>

              <td className="py-2 hidden md:block">
                <span className="text-sm">{moment(task.date).fromNow()}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const UserTable = ({ users }) => (
  <div className="w-full md:w-1/3 bg-white h-fit px-6 py-4 shadow-md rounded">
    <table className="w-full mb-5">
      <thead className="border-b border-gray-300">
        <tr className="text-black text-left">
          <th className="py-2">Full Name</th>
          <th className="py-2">Status</th>
          <th className="py-2">Created At</th>
        </tr>
      </thead>

      <tbody>
        {users?.map((user, index) => (
          <tr key={index} className="border-b text-gray-600 hover:bg-gray-200/30">
            <td className="py-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full text-white bg-violet-700 flex items-center justify-center">
                  {getInitials(user.name)}
                </div>

                <div>
                  <p>{user.name}</p>
                  <span className="text-xs text-black">{user.role}</span>
                </div>
              </div>
            </td>

            <td>
              <p className={clsx("w-fit px-3 py-1 rounded-full text-sm",
                  user.isActive ? "bg-blue-200" : "bg-yellow-100"
              )}>
                {user.isActive ? "Active" : "Disabled"}
              </p>
            </td>

            <td className="py-2 text-sm">{moment(user.createdAt).fromNow()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Dashboard = () => {
  const { data, isLoading } = useGetDashboardStatsQuery();

  if (isLoading) return <div className="py-10"><Loading /></div>;

  const totals = data?.tasks || {};

  const stats = [
    { label: "TOTAL TASK", total: data?.totalTasks || 0, icon: <FaNewspaper />, bg: "bg-blue-600" },
    { label: "COMPLETED TASK", total: totals["completed"] || 0, icon: <MdAdminPanelSettings />, bg: "bg-green-600" },
    { label: "IN PROGRESS", total: totals["in progress"] || 0, icon: <LuClipboardEdit />, bg: "bg-yellow-500" },
    { label: "TODOS", total: totals["todo"] || 0, icon: <FaArrowsToDot />, bg: "bg-pink-600" },
  ];

  return (
    <div className="min-h-screen w-full bg-gray-50 py-6 px-2 md:px-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {stats.map(({ icon, bg, label, total }, index) => (
          <div key={index} className="bg-white h-32 p-5 shadow-md rounded-md flex items-center justify-between">
            <div>
              <p className="text-gray-600">{label}</p>
              <h2 className="text-2xl font-semibold">{total}</h2>
            </div>
            <div className={clsx("w-12 h-12 rounded-full text-white flex items-center justify-center", bg)}>
              {icon}
            </div>
          </div>
        ))}
      </div>

      {/* Priority Chart */}
      <div className="w-full mt-10">
        <TaskPriorityChart data={data?.graphData} />
      </div>

      {/* Stage Chart */}
      <div className="w-full mt-10">
        <TaskStageBarChart data={data?.tasks} />
      </div>

      {/* Tables */}
      <div className="w-full flex flex-col md:flex-row gap-6 mt-12">
        <TaskTable tasks={data?.last10Task} />
        <UserTable users={data?.users} />
      </div>

    </div>
  );
};

export default Dashboard;

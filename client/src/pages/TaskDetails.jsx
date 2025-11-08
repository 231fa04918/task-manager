import clsx from "clsx";
import moment from "moment";
import React, { useState } from "react";
import { FaTasks } from "react-icons/fa";
import { RxActivityLog } from "react-icons/rx";
import { MdTaskAlt } from "react-icons/md";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import Tabs from "../components/Tabs";
import { PRIOTITYSTYELS, TASK_TYPE, getInitials } from "../utils";
import Loading from "../components/Loader";
import Button from "../components/Button";
import {
  useGetSingleTaskQuery,
  usePostTaskActivityMutation,
} from "../redux/slices/api/taskApiSlice";

const TABS = [
  { title: "Task Detail", icon: <FaTasks /> },
  { title: "Activities / Timeline", icon: <RxActivityLog /> },
];

const ACTIVITY_TYPES = [
  "Started",
  "Completed",
  "In Progress",
  "Commented",
  "Bug",
  "Assigned",
];

const TaskDetails = () => {
  const { id } = useParams();
  const { data, isLoading, refetch } = useGetSingleTaskQuery(id);

  const [selected, setSelected] = useState(0);
  const task = data?.task;

  if (isLoading)
    return (
      <div className="py-10">
        <Loading />
      </div>
    );

  return (
    <div className="w-full flex flex-col gap-3 mb-4 overflow-y-hidden">
      <h1 className="text-2xl text-gray-600 font-bold">{task?.title}</h1>

      <Tabs tabs={TABS} setSelected={setSelected}>
        {selected === 0 ? (
          <TaskDetailsView task={task} />
        ) : (
          <ActivitiesView activities={task?.activities} id={id} refetch={refetch} />
        )}
      </Tabs>
    </div>
  );
};

const TaskDetailsView = ({ task }) => {
  return (
    <div className="w-full flex flex-col md:flex-row gap-5 2xl:gap-8 bg-white shadow-md p-8 overflow-y-auto">
      {/* LEFT */}
      <div className="w-full md:w-1/2 space-y-8">
        <div className="flex items-center gap-5">
          <div
            className={clsx(
              "flex gap-1 items-center text-base font-semibold px-3 py-1 rounded-full",
              PRIOTITYSTYELS[task?.priority]
            )}
          >
            <span className="uppercase">{task?.priority} Priority</span>
          </div>

          <div className="flex items-center gap-2">
            <div className={clsx("w-4 h-4 rounded-full", TASK_TYPE[task.stage])} />
            <span className="text-black uppercase">{task?.stage}</span>
          </div>
        </div>

        <p className="text-gray-500">
          Created At: {new Date(task?.date).toDateString()}
        </p>

        <div className="flex items-center gap-8 p-4 border-y border-gray-200">
          <span>
            <strong>Assets:</strong> {task?.assets?.length}
          </span>
          <span className="text-gray-400">|</span>
          <span>
            <strong>Sub-Tasks:</strong> {task?.subTasks?.length}
          </span>
        </div>

        {/* TEAM */}
        <div className="space-y-4 py-6">
          <p className="text-gray-600 font-semibold text-sm">TASK TEAM</p>
          <div className="space-y-3">
            {task?.team?.map((m, i) => (
              <div key={i} className="flex gap-4 py-2 items-center border-t">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">
                  {getInitials(m?.name)}
                </div>
                <div>
                  <p className="text-lg font-semibold">{m?.name}</p>
                  <span className="text-gray-500">{m?.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SUBTASKS */}
        <div className="space-y-4 py-6">
          <p className="text-gray-500 font-semibold text-sm">SUB-TASKS</p>
          <div className="space-y-8">
            {task?.subTasks?.map((el, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-violet-100">
                  <MdTaskAlt className="text-violet-600" size={26} />
                </div>
                <div>
                  <span className="text-sm text-gray-500">
                    {new Date(el?.date).toDateString()}
                  </span>
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold">
                    {el?.tag}
                  </span>
                  <p className="text-gray-700">{el?.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT ASSET GRID */}
      <div className="w-full md:w-1/2 space-y-8">
        <p className="text-lg font-semibold">ASSETS</p>
        <div className="w-full grid grid-cols-2 gap-4">
          {task?.assets?.map((src, i) => (
            <img
              key={i}
              src={src}
              className="w-full rounded h-36 object-cover hover:scale-110 transition"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const ActivitiesView = ({ activities, id, refetch }) => {
  const [selected, setSelected] = useState(ACTIVITY_TYPES[0]);
  const [text, setText] = useState("");

  const [postActivity, { isLoading }] = usePostTaskActivityMutation();

  const submit = async () => {
    try {
      await postActivity({
        id,
        data: { type: selected.toLowerCase(), activity: text },
      }).unwrap();

      toast.success("Activity added");
      setText("");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.message);
    }
  };

  return (
    <div className="w-full flex gap-10 min-h-screen px-10 py-8 bg-white shadow rounded-md">
      {/* TIMELINE LIST */}
      <div className="w-full md:w-1/2">
        <h4 className="text-gray-600 font-semibold text-lg mb-5">Timeline</h4>

        {activities?.map((a, i) => (
          <div key={i} className="flex gap-4 mb-6 relative">
            <div className="w-3 h-3 bg-blue-600 rounded-full mt-1 absolute -left-5"></div>
            <div className="ml-2">
              <p className="font-semibold capitalize">
                {a?.type} {a?.by?.name && `• ${a.by.name}`}
              </p>
              <p className="text-gray-500 text-sm">{moment(a.date).fromNow()}</p>
              {a.activity && (
                <p className="text-gray-700 mt-1">{a.activity}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ADD ACTIVITY */}
      <div className="w-full md:w-1/3">
        <h4 className="text-gray-600 font-semibold text-lg mb-5">Add Activity</h4>

        <div className="space-y-4">
          {ACTIVITY_TYPES.map((t) => (
            <label key={t} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="act-type"
                checked={selected === t}
                onChange={() => setSelected(t)}
              />
              {t}
            </label>
          ))}

          <textarea
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="border border-gray-300 w-full p-3 rounded-md"
            placeholder="Describe activity..."
          ></textarea>

          <Button
            label="Submit"
            onClick={submit}
            className="bg-blue-600 text-white rounded-md"
          />
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;

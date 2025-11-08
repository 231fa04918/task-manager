import React from "react";
import { dateFormatter } from "../../utils";

const Timeline = ({ activities = [] }) => {
  if (!activities || activities.length === 0) {
    return (
      <p className="text-center text-sm text-gray-500 mt-4">
        No activity yet.
      </p>
    );
  }

  return (
    <div className="mt-6 pl-6 border-l border-gray-300 space-y-6">
      {activities.map((item, index) => (
        <div key={index} className="relative">
          {/* Dot */}
          <span className="absolute -left-3 top-1 w-3 h-3 bg-blue-600 rounded-full"></span>

          <div className="flex flex-col gap-1">
            <p className="font-semibold text-gray-800 capitalize">
              {item.type}
            </p>

            {item.activity && (
              <p className="text-sm text-gray-700 leading-tight">
                {item.activity}
              </p>
            )}

            <p className="text-xs text-gray-500">
              {dateFormatter(item.date)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;

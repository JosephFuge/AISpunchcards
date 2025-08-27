import React, { useEffect, useState } from "react";
import {
  Compass,
  Link as LinkIcon,
  Users,
  GraduationCap,
  Heart,
} from "phosphor-react";

interface Attendance {
  eventType: string;
  attended: boolean;
}

const PunchCard: React.FC = () => {
  const [attendance, setAttendance] = useState<Attendance[]>([]);

  useEffect(() => {
    // 🔹 Replace with your actual API endpoint & userId
    fetch("/api/attendance?userId=123")
      .then((res) => res.json())
      .then((data: Attendance[]) => setAttendance(data));
  }, []);

  // All possible activities
  const activities = [
    { id: "compass", label: "Compass", icon: <Compass size={40} /> },
    { id: "link", label: "Link", icon: <LinkIcon size={40} /> },
    { id: "person", label: "Person", icon: <Users size={40} /> },
    { id: "gradcap", label: "Graduation", icon: <GraduationCap size={40} /> },
    { id: "heart", label: "Heart", icon: <Heart size={40} /> },
  ];

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg w-fit mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">Punch Card</h2>
      <div className="grid grid-cols-5 gap-6">
        {activities.map((activity) => {
          const attended = attendance.some(
            (a) => a.eventType === activity.id && a.attended
          );

          return (
            <div
              key={activity.id}
              className={`relative flex flex-col items-center justify-center p-3 rounded-full transition-all ${
                attended ? "opacity-30 grayscale" : ""
              }`}
            >
              {activity.icon}
              <span className="text-xs mt-1">{activity.label}</span>

              {/* "Hole punch" effect if attended */}
              {attended && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-400 shadow-inner"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PunchCard;

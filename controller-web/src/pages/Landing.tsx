import { useState } from "react";
import { useNavigate } from "react-router";

import { whoami } from "../features/whoami";
const my = whoami();

export const Landing = () => {
  const [showDevTools, setShowDevTools] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [axis, setAxis] = useState<"pitch" | "roll" | "none">("none");
  const navigate = useNavigate();
  const toggleDevTools = () => setShowDevTools((prev) => !prev);

  return (
    <div className="max-w-sm mx-auto my-8 p-4 border border-gray-200 rounded-lg shadow-lg bg-white">
      <h1 className="text-4xl font-bold text-center mb-2">Gyro Drop</h1>
      <h2 className="text-xl text-center text-gray-800">Web Gyro Controller</h2>
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Join Room</h3>
        <div className="mb-2">
          <label htmlFor="roomId" className="block text-sm font-medium mb-1">
            Room ID
          </label>
          <input
            id="roomId"
            type="text"
            className="w-full border border-gray-300 rounded px-2 py-1"
            placeholder="Enter room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="mb-2">
          <label htmlFor="axis" className="block text-sm font-medium mb-1">
            Axis
          </label>
          <select
            id="axis"
            className="w-full border border-gray-300 rounded px-2 py-1"
            value={axis}
            onChange={(e) => setAxis(e.target.value as "none" | "pitch" | "roll")}
          >
            <option value="none">Select...</option>
            <option value="pitch">Pitch</option>
            <option value="roll">Roll</option>
          </select>
        </div>
        <button
          onClick={() => {
            if (roomId && axis !== "none") {
              navigate(`/c?roomId=${roomId}&axis=${axis}`);
            } else {
              alert("Please enter a valid room ID and select an axis.");
            }
          }}
          className="w-full bg-blue-500 not-disabled:hover:bg-blue-600 text-white rounded px-4 py-2 mt-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          disabled={!roomId || axis === "none"}
        >
          Join
        </button>
      </div>

      <div className="mt-4">
        <button onClick={toggleDevTools} className="text-sm text-blue-500 hover:underline cursor-pointer">
          {showDevTools ? "Hide Developer Tools" : "Show Developer Tools"}
        </button>

        {showDevTools && (
          <div className="mt-2 px-4 py-2 border border-gray-200 rounded bg-gray-50">
            <div>
              <h3 className="font-semibold mb-1">Agent Information</h3>
              <ul className="text-xs">
                <li>
                  <strong>Your ID:</strong> {my.id}
                </li>
                <li>
                  <strong>OS:</strong> {my.os}
                </li>
                <li>
                  <strong>Browser:</strong> {my.browser}
                </li>
              </ul>
            </div>
            <div className="my-2">
              <h3 className="font-semibold mb-1">More Actions</h3>
              <p className="text-xs text-gray-600">Coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

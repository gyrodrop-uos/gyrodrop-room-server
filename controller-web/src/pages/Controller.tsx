import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";

import { createGameRoomConnection, GameRoomEvent } from "../features/game-room/connection";
import { createGyroController } from "../features/gyro/utils";

import { whoami } from "../features/whoami";
const my = whoami();

export const Controller = () => {
  const [searchParams] = useSearchParams();
  const [gameRoomEvent, setGameRoomEvent] = useState<GameRoomEvent | null>(null);
  const [gyroInterval, setGyroInterval] = useState<number | null>(null);

  const roomId = searchParams.get("roomId");
  const axis = searchParams.get("axis") as "pitch" | "roll";

  useEffect(() => {
    if (!roomId || !axis) return;

    const gameRoom = createGameRoomConnection(roomId, my.id, axis);
    const removeListener = gameRoom.addListener((e) => {
      setGameRoomEvent(e);
    });

    gameRoom.join();

    return removeListener;
  }, [roomId, axis]);

  useEffect(() => {
    if (gameRoomEvent) {
      if (gameRoomEvent.state !== "joined" && gyroInterval) {
        window.clearInterval(gyroInterval);
        setGyroInterval(null);
      }
    }
  }, [gameRoomEvent, gyroInterval]);

  if (!roomId || !axis) {
    window.alert("Invalid room ID or axis.");
    window.location.href = "/";
    return null;
  }

  return (
    <div className="max-w-sm mx-auto my-8 p-4 border border-gray-200 rounded-lg shadow-lg bg-white">
      <h1 className="text-2xl font-bold mb-1 tracking-tighter">Gyro Drop</h1>
      <h2 className="text-lg text-gray-800 tracking-tight">Web Gyro Controller</h2>

      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">Room Status</h2>
        <ul>
          <li>State: {gameRoomEvent?.state}</li>
          <li>Message: {gameRoomEvent?.message}</li>
        </ul>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">Controller Info</h2>
        {gyroInterval && <div>Gyro is active</div>}
        <button
          className="w-full bg-green-600 not-disabled:hover:bg-green-700 text-white rounded px-4 py-2 mt-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          onClick={async () => {
            if (gyroInterval) {
              window.clearInterval(gyroInterval);
              setGyroInterval(null);
            }

            const gyro = createGyroController(my.os, my.browser, true);
            await gyro.initialize();

            setGyroInterval(
              window.setInterval(async () => {
                const gyroData = gyro.getGyro();
                if (gameRoomEvent?.connection) {
                  await gameRoomEvent.connection.updateGyro(gyroData);
                }
              }, 1000 / 10)
            );
          }}
          disabled={gameRoomEvent?.state !== "joined" || !!gyroInterval}
        >
          Activate Gyro
        </button>
      </div>
    </div>
  );
};

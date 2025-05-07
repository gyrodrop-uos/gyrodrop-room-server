import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSearchParams } from "react-router";

import { gameRoomApiClient } from "../features/game-room";
import { createGyroController } from "../features/gyro/utils";

import { whoami } from "../features/whoami";
const my = whoami();

export const Controller = () => {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");
  const axis = searchParams.get("axis") as "pitch" | "roll";

  const currentGyro = useQuery({
    queryKey: ["currentGyro"],
    queryFn: async () => {
      if (!roomId) {
        throw new Error("roomId is null");
      }
      return await gameRoomApiClient.getCurrentGyro(roomId);
    },
    refetchInterval: 1000,
    enabled: !!roomId,
  });

  useEffect(() => {
    (async function () {
      if (roomId === null || axis === null) {
        console.error("Missing roomId or axis in URL");
        return;
      }

      console.log("Joining room with ID:", roomId);
      await gameRoomApiClient.joinRoom(roomId, my.id, axis);

      console.log("Creating GyroController");
      const gyroController = createGyroController(my.os, my.browser);
      await gyroController.initialize();

      setInterval(async () => {
        const gyro = gyroController.getGyro();
        await gameRoomApiClient.updateGyro(roomId, my.id, gyro);
      }, 1000);
    })();
  }, [roomId, axis]);

  return (
    <div>
      GyroController Page
      {currentGyro.data && (
        <div>
          <h2>Gyro</h2>
          <ul>
            <li>Pitch: {currentGyro.data.pitch}</li>
            <li>Yaw: {currentGyro.data.yaw}</li>
            <li>Roll: {currentGyro.data.roll}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

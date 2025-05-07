import { useState, useRef } from "react";
import { GyroIOSController } from "./features/gyro/gyro-ios";
import { useQuery } from "@tanstack/react-query";
import { io } from "socket.io-client";

const BACKEND_URL = "https://gyrodrop-backend.shscript.com";
const socket = io(BACKEND_URL);

type GameRoomDto = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: "waiting" | "playing" | "finished";
  stageId: string;
  playerIds: string[];
};

type Gyro = {
  pitch: number;
  yaw: number;
  roll: number;
};

type GameStateDto = {
  id: string;
  gameRoomId: string;
  pitchHolderId: string | null;
  rollHolderId: string | null;
  currentGyro: Gyro;
};

export default function App() {
  const gyroController = useRef(new GyroIOSController());

  const [playerId, setPlayerId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [dedicatedGyroAxis, setDedicatedGyroAxis] = useState<"pitch" | "roll">(
    "pitch"
  );

  const [gameRoomConnected, setGameRoomConnected] = useState(false);

  const gameRoom = useQuery<GameRoomDto>({
    queryKey: ["gameRoom", roomId],
    queryFn: async () => {
      const res = await fetch(
        `${BACKEND_URL}/rooms/${roomId}?playerId=${playerId}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch game room");
      }
      return res.json();
    },
    enabled: gameRoomConnected,
    refetchInterval: 1000,
  });

  const gameState = useQuery<GameStateDto>({
    queryKey: ["gameState", roomId],
    queryFn: async () => {
      const res = await fetch(
        `${BACKEND_URL}/rooms/${roomId}/state?playerId=${playerId}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch game state");
      }
      return res.json();
    },
    enabled:
      gameRoomConnected && gameRoom.data && gameRoom.data.status === "playing",
    refetchInterval: 1000,
  });

  const takeGyroAxis = async () =>
    await fetch(
      `${BACKEND_URL}/rooms/${roomId}/take-gyro?playerId=${playerId}&axis=${dedicatedGyroAxis}`,
      {
        method: "POST",
      }
    );

  return (
    <div>
      <h1>Gyro Controller</h1>
      {gameRoom.data && (
        <div>
          <h3>Game Room</h3>
          <ul>
            <li>Room ID: {gameRoom.data.id}</li>
            <li>Created At: {gameRoom.data.createdAt}</li>
            <li>Updated At: {gameRoom.data.updatedAt}</li>
            <li>Status: {gameRoom.data.status}</li>
            <li>Stage ID: {gameRoom.data.stageId}</li>
            <li>Player IDs: {gameRoom.data.playerIds.join(", ")}</li>
          </ul>
        </div>
      )}
      {gameState.data && (
        <div>
          <h3>Game State</h3>
          <ul>
            <li>Pitch Holder ID: {gameState.data.pitchHolderId}</li>
            <li>Roll Holder ID: {gameState.data.rollHolderId}</li>
            <li>Current Gyro: {JSON.stringify(gameState.data.currentGyro)}</li>
          </ul>
        </div>
      )}

      <div>
        <label>
          Room ID:
          <input
            type="text"
            placeholder="Room ID"
            onChange={(e) => {
              setRoomId(e.target.value);
            }}
          />
        </label>
      </div>
      <div>
        <label>
          Player ID:
          <input
            type="text"
            placeholder="Player ID"
            onChange={(e) => {
              setPlayerId(e.target.value);
            }}
          />
        </label>
      </div>
      <button
        onClick={() => {
          setGameRoomConnected(true);
        }}
        disabled={gameRoomConnected}
      >
        연결하기
      </button>
      {gameRoomConnected && (
        <div>
          <label>
            Dedicated Gyro Axis:
            <select
              onChange={(e) =>
                setDedicatedGyroAxis(e.target.value as "pitch" | "roll")
              }
              value={dedicatedGyroAxis}
            >
              <option value="pitch">Pitch</option>
              <option value="roll">Roll</option>
            </select>
          </label>
          <button onClick={() => takeGyroAxis()}>자이로 축 변경</button>
        </div>
      )}
      <div>
        <button
          onClick={async () => {
            try {
              await gyroController.current.initialize();
              alert("Gyro initialized");
            } catch (err) {
              console.error("Failed to initialize gyro", err);
              alert("Failed to initialize gyro");
            }
          }}
        >
          자이로센서 권한 취득
        </button>{" "}
        <button
          onClick={() => {
            const updateGyroData = async () => {
              try {
                const rawData = await gyroController.current.getRaw();
                socket.emit("update-gyro", {
                  playerId: playerId,
                  roomId: roomId,
                  gyro: rawData,
                });
              } catch (err) {
                console.error("Failed to get gyro data", err);
              }
            };

            setInterval(updateGyroData, 100);
            alert("start to send gyro data");
          }}
        >
          자이로 데이터 전송(웹 소켓)
        </button>
      </div>
    </div>
  );
}

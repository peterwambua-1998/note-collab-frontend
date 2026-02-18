import { useEffect, useRef, useState } from "react";
import { getSocket } from "~/lib/socket";
import type { Socket } from "~/lib/socket";

export interface UserData {
  id: string;
  username: string;
  userId: string;
  color: string;
  joinedAt: string;
}

export interface UseSocketOptions {
  roomId: string;
  username: string;
}

export interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  isJoined: boolean;
  users: UserData[];
  myUserData: UserData | null;
  error: string | null;
}

export function useSocket({ roomId, username }: UseSocketOptions): UseSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [myUserData, setMyUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    const onConnect = () => {
      setIsConnected(true);
      setError(null);
      socket.emit("join-room", { roomId, username });
    };

    const onDisconnect = () => {
      setIsConnected(false);
      setIsJoined(false);
    };

    const onConnectError = (err: Error) => {
      setError(`Connection failed: ${err.message}`);
    };

    const onJoinSuccess = ({ userData }: { userData: UserData }) => {
      setMyUserData(userData);
      setIsJoined(true);
    };

    const onRoomUsers = (roomUsers: UserData[]) => {
      setUsers(roomUsers);
    };

    const onUserJoined = (user: UserData) => {
      setUsers((prev) => {
        if (prev.some((u) => u.id === user.id)) return prev;
        return [...prev, user];
      });
    };

    const onUserLeft = ({ userId }: { userId: string }) => {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    };

    const onError = ({ message }: { message: string }) => {
      setError(message);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("join-success", onJoinSuccess);
    socket.on("room-users", onRoomUsers);
    socket.on("user-joined", onUserJoined);
    socket.on("user-left", onUserLeft);
    socket.on("error", onError);

    if (!socket.connected) {
      socket.connect();
    } else {
      socket.emit("join-room", { roomId, username });
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("join-success", onJoinSuccess);
      socket.off("room-users", onRoomUsers);
      socket.off("user-joined", onUserJoined);
      socket.off("user-left", onUserLeft);
      socket.off("error", onError);
      socket.emit("leave-room", { roomId });
    };
  }, [roomId, username]);

  return {
    socket: socketRef.current,
    isConnected,
    isJoined,
    users,
    myUserData,
    error,
  };
}

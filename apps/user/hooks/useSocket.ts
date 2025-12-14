import { useEffect, useState } from "react";

const WS_URL = "ws://localhost:8080/realtime";

export const useSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log("> hook: useSocket: connected");
      setSocket(ws);
    };

    ws.onclose = () => {
      console.log("> hook: useSocket: disconnected");
      setSocket(null);
    };

    return () => {
      console.log("> hook: useSocket: gracefully disconnected");
      ws.close();
    };
  }, []);

  return socket;
};

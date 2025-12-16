import { useEffect, useState } from "react";

export const useSocket = (url: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(url);

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

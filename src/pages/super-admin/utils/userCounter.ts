import { useState, useEffect } from "react";

export const useUserCounter = () => {
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let isMounted = true;

    // Prevent duplicate connections in Strict Mode
    if (!ws) {
      ws = new WebSocket("ws://localhost:8000/users/ws/count-users");

      ws.onopen = () => {
        if (isMounted) console.log("Connected to user count WebSocket");
      };

      ws.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const data = JSON.parse(event.data);
          if (data.total_users !== undefined) {
            setUserCount(data.total_users);
          }
        } catch (err) {
          console.error("Error parsing WebSocket message", err);
        }
      };

      ws.onerror = (err) => {
        if (isMounted) console.error("WebSocket error", err);
      };

      ws.onclose = () => {
        if (isMounted) console.log("User count WebSocket disconnected");
      };
    }

    return () => {
      isMounted = false;
      ws?.close();
    };
  }, []);

  return userCount;
};
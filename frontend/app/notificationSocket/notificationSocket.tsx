import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";

type NotificationSocketProps = {
  onNotification?: (data: any) => void;
};

export default function NotificationSocket({
  onNotification,
}: NotificationSocketProps) {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const manuallyClosed = useRef(false);
  const everConnected = useRef(false);
  const reconnectDelay = useRef(2000);

  const connect = () => {
    console.log("🔌 Attempting to connect to notification server...");

    socketRef.current = new WebSocket(
      "ws://localhost:8000/notifications/ws/notify"
    );

    socketRef.current.onopen = () => {
      console.log("✅ Connected to notification server");
      everConnected.current = true;
      reconnectDelay.current = 2000;
    };

    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (onNotification) onNotification(data);
      } catch {
        console.log("🔔 Notification received (raw):", event.data);
        if (onNotification) onNotification(event.data);
      }
    };

    socketRef.current.onerror = (error) => {
      console.error("❗ WebSocket error:", error);
    };

    socketRef.current.onclose = () => {
      if (manuallyClosed.current) {
        console.log("🔌 WebSocket closed intentionally, not reconnecting.");
        return;
      }

      if (!everConnected.current) {
        console.warn(
          `❌ Could not connect. Retrying in ${
            reconnectDelay.current / 1000
          }s...`
        );
        if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
        reconnectTimer.current = setTimeout(() => {
          reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000);
          connect();
        }, reconnectDelay.current);
      } else {
        console.warn(
          "⚠️ Connection lost after being established. Not reconnecting."
        );
      }
    };
  };

  useEffect(() => {
    manuallyClosed.current = false;
    connect();

    return () => {
      manuallyClosed.current = true;
      if (socketRef.current) socketRef.current.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, []);

  return null;
}

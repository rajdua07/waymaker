"use client";

import { useEffect, useCallback, useRef } from "react";
import type { RoomEvent } from "@/types";

export function useRoomEvents(
  roomId: string,
  onUpdate: (data: RoomEvent) => void
) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const connect = useCallback(() => {
    const eventSource = new EventSource(`/api/rooms/${roomId}/events`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as RoomEvent;
        onUpdateRef.current(data);
      } catch {
        // ignore parse errors
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      // Reconnect after 5 seconds
      setTimeout(connect, 5000);
    };

    return eventSource;
  }, [roomId]);

  useEffect(() => {
    const eventSource = connect();
    return () => eventSource.close();
  }, [connect]);
}

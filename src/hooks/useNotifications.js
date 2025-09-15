import { useContext } from "react";
import { NotificationsContext } from "../providers/NotificationsProvider";

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}

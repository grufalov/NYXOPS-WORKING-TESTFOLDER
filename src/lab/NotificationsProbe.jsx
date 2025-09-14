import React from "react";
import { useNotifications } from "../hooks/useNotifications";

export default function NotificationsProbe() {
  const { notifySuccess, notifyDanger } = useNotifications();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[var(--surface-bg)]">
      <h1 className="text-2xl font-bold mb-4">Notifications Probe</h1>
      <div className="flex gap-4">
        <button
  className="px-5 py-2 rounded-xl bg-[var(--success)] text-white font-semibold shadow-md hover:bg-green-600 transition"
  onClick={() =>
    notifySuccess("Your changes have been synced.", {
      id: "autosave",
      title: "Saved",
      description: "Everything is up to date.",
    })
  }
>
  Trigger success auto-save
</button>

<button
  className="px-5 py-2 rounded-xl bg-[var(--danger)] text-white font-semibold shadow-md hover:bg-red-700 transition"
  onClick={() =>
    notifyDanger("We couldn’t reach Supabase.", {
      id: "db-offline",
      title: "Connection Error",
      description: "Database not connected. Please retry.",
      sticky: true,
    })
  }
>
  Trigger DB disconnected
</button>
      </div>
      <p className="text-gray-500 mt-8">Check ARIA live, dedupe, reduced motion, and close behaviors.</p>
    </div>
  );
}

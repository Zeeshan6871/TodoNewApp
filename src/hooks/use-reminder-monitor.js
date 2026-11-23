"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/ui/toast";
import { useAudioChime } from "@/hooks/use-audio-chime";

export function useReminderMonitor(onReminderTriggered) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { playChime } = useAudioChime();
  const alertedIdsRef = useRef(new Set());

  useEffect(() => {
    if (!user) return;

    const checkReminders = async () => {
      try {
        const res = await fetch("/api/reminders/check");
        if (!res.ok) return;

        const data = await res.json();
        if (!data.success || !data.reminders || data.reminders.length === 0) return;

        for (const reminder of data.reminders) {
          if (alertedIdsRef.current.has(reminder.id)) {
            continue;
          }

          alertedIdsRef.current.add(reminder.id);

          // Play Web Audio Synthesizer Chime
          playChime(reminder.isOverdue ? "urgent" : "melodic");

          // Trigger In-App Toast
          toast({
            title: reminder.isOverdue ? "🚨 Task Overdue!" : "⏰ Task Due Reminder",
            description: `"${reminder.title}" requires your attention`,
            variant: "reminder",
            duration: 10000,
            action: "Snooze 5m",
            onAction: async () => {
              try {
                await fetch("/api/reminders/check", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ taskId: reminder.id, action: "snooze", snoozeMinutes: 5 }),
                });
                alertedIdsRef.current.delete(reminder.id);
              } catch (e) {
                console.error("Snooze error:", e);
              }
            },
          });

          if (onReminderTriggered) {
            onReminderTriggered(reminder);
          }
        }
      } catch (err) {
        console.warn("Reminder monitor tick error:", err);
      }
    };

    // Initial check
    checkReminders();

    // Interval check every 15 seconds
    const interval = setInterval(checkReminders, 15000);

    return () => clearInterval(interval);
  }, [user, toast, playChime, onReminderTriggered]);
}


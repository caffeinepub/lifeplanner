import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { LogEntry } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function DayCell({
  date,
  isToday,
  isSelected,
  hasLog,
  onClick,
}: {
  date: number;
  isToday: boolean;
  isSelected: boolean;
  hasLog: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all ${
        isSelected
          ? "bg-coral text-white shadow-warm"
          : isToday
            ? "bg-secondary text-foreground ring-2 ring-coral/40"
            : hasLog
              ? "bg-peach-light text-foreground"
              : "text-foreground hover:bg-secondary"
      }`}
      data-ocid="monthly.button"
    >
      {date}
      {hasLog && !isSelected && (
        <span className="w-1 h-1 rounded-full bg-coral mt-0.5" />
      )}
    </button>
  );
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MonthlyTab() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate());

  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const { data: monthLogs = {} } = useQuery({
    queryKey: ["monthLogs", year, month, identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return {} as Record<string, LogEntry | null>;
      const dates = Array.from({ length: daysInMonth }, (_, i) =>
        toDateStr(year, month, i + 1),
      );
      const results = await Promise.all(
        dates.map((d) => actor.getLogEntry(identity.getPrincipal(), d)),
      );
      const map: Record<string, LogEntry | null> = {};
      dates.forEach((d, i) => {
        map[d] = results[i];
      });
      return map;
    },
    enabled: !!actor && !isFetching && !!identity,
  });

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;

  const selectedDateStr = selectedDay
    ? toDateStr(year, month, selectedDay)
    : null;
  const selectedLog = selectedDateStr ? monthLogs[selectedDateStr] : null;

  // Pre-generate stable keys for empty placeholder slots
  const emptySlotKeys = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  }

  const monthName = new Date(year, month).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-2xl mx-auto"
      data-ocid="monthly.section"
    >
      <div className="bg-card rounded-2xl p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevMonth}
            className="rounded-full hover:bg-secondary"
            data-ocid="monthly.pagination_prev"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-display text-xl font-bold text-foreground">
            {monthName}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={nextMonth}
            className="rounded-full hover:bg-secondary"
            data-ocid="monthly.pagination_next"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAY_NAMES.map((d) => (
            <div
              key={d}
              className="text-center text-xs text-muted-foreground font-medium py-1"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {emptySlotKeys.map((slot) => (
            <div key={`empty-${slot}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const dateStr = toDateStr(year, month, day);
            const hasLog = !!monthLogs[dateStr];
            const isToday = isCurrentMonth && today.getDate() === day;
            return (
              <DayCell
                key={day}
                date={day}
                isToday={isToday}
                isSelected={selectedDay === day}
                hasLog={hasLog}
                onClick={() => setSelectedDay(day)}
              />
            );
          })}
        </div>

        <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-peach-light border border-coral/30" />
            Logged
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-coral" />
            Selected
          </div>
        </div>
      </div>

      {selectedDay && selectedDateStr && (
        <div className="bg-card rounded-2xl p-5 shadow-card space-y-3">
          <h3 className="font-semibold text-foreground">
            {new Date(year, month, selectedDay).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h3>

          {selectedLog ? (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-secondary rounded-xl p-3">
                <p className="text-muted-foreground text-xs">Mood</p>
                <p className="font-medium text-foreground mt-1">
                  {["😔", "😐", "🙂", "😊", "🤩"][Number(selectedLog.mood)] ??
                    "—"}
                </p>
              </div>
              <div className="bg-secondary rounded-xl p-3">
                <p className="text-muted-foreground text-xs">Energy</p>
                <p className="font-medium text-foreground mt-1">
                  {Number(selectedLog.energy) + 1}/5
                </p>
              </div>
              <div className="bg-secondary rounded-xl p-3">
                <p className="text-muted-foreground text-xs">😴 Sleep</p>
                <p className="font-medium text-foreground mt-1">
                  {selectedLog.sleepHours} hrs
                </p>
              </div>
              <div className="bg-secondary rounded-xl p-3">
                <p className="text-muted-foreground text-xs">📚 Study</p>
                <p className="font-medium text-foreground mt-1">
                  {selectedLog.studyHours} hrs
                </p>
              </div>
              {selectedLog.notes && (
                <div className="col-span-2 bg-secondary rounded-xl p-3">
                  <p className="text-muted-foreground text-xs">📝 Notes</p>
                  <p className="text-foreground mt-1 text-sm">
                    {selectedLog.notes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              No log for this day.
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}

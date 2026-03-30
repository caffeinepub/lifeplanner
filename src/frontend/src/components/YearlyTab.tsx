import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import type { LogEntry } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function getDaysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}

interface YearlyTabProps {
  year?: number;
}

export function YearlyTab({ year = new Date().getFullYear() }: YearlyTabProps) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  const { data: yearData, isLoading } = useQuery({
    queryKey: ["yearlyLogs", year, identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return {} as Record<string, LogEntry | null>;
      const allDates: string[] = [];
      for (let m = 0; m < 12; m++) {
        const days = getDaysInMonth(year, m);
        for (let d = 1; d <= days; d++) {
          allDates.push(toDateStr(year, m, d));
        }
      }
      const results = await Promise.all(
        allDates.map((d) => actor.getLogEntry(identity.getPrincipal(), d)),
      );
      const map: Record<string, LogEntry | null> = {};
      allDates.forEach((d, i) => {
        map[d] = results[i];
      });
      return map;
    },
    enabled: !!actor && !isFetching && !!identity,
    staleTime: 1000 * 60 * 5,
  });

  const allEntries = Object.values(yearData ?? {}).filter(
    Boolean,
  ) as LogEntry[];
  const totalLogged = allEntries.length;
  const avgSleep =
    totalLogged > 0
      ? (
          allEntries.reduce((s, e) => s + e.sleepHours, 0) / totalLogged
        ).toFixed(1)
      : "—";
  const totalStudy = allEntries.reduce((s, e) => s + e.studyHours, 0);

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-16"
        data-ocid="yearly.loading_state"
      >
        <Loader2 className="h-8 w-8 animate-spin text-coral" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-3xl mx-auto"
      data-ocid="yearly.section"
    >
      <div className="gradient-card rounded-2xl p-5 shadow-card">
        <h2 className="font-display text-2xl font-bold text-foreground">
          Year at a Glance 🗓️
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          {year} — Your wellness journey
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl p-4 shadow-card text-center">
          <p className="font-display text-3xl font-bold text-coral">
            {totalLogged}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Days Logged</p>
        </div>
        <div className="bg-card rounded-2xl p-4 shadow-card text-center">
          <p className="font-display text-3xl font-bold text-coral">
            {avgSleep}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Avg Sleep (hrs)</p>
        </div>
        <div className="bg-card rounded-2xl p-4 shadow-card text-center">
          <p className="font-display text-3xl font-bold text-coral">
            {totalStudy.toFixed(0)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Study Hours</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MONTHS.map((monthName, mIdx) => {
          const days = getDaysInMonth(year, mIdx);
          const firstDay = new Date(year, mIdx, 1).getDay();
          const today = new Date();
          const isCurrentMonth =
            today.getFullYear() === year && today.getMonth() === mIdx;
          // Generate stable empty slot keys
          const emptySlots = Array.from({ length: firstDay }, (_, i) => i);
          // Generate day numbers as stable keys
          const dayNumbers = Array.from({ length: days }, (_, i) => i + 1);

          return (
            <div
              key={monthName}
              className="bg-card rounded-2xl p-4 shadow-card"
              data-ocid={`yearly.item.${mIdx + 1}`}
            >
              <p className="font-semibold text-foreground text-sm mb-3">
                {monthName}
              </p>
              <div className="grid grid-cols-7 gap-0.5">
                {emptySlots.map((slot) => (
                  <div key={`empty-${monthName}-${slot}`} />
                ))}
                {dayNumbers.map((day) => {
                  const ds = toDateStr(year, mIdx, day);
                  const entry = yearData?.[ds];
                  const isToday = isCurrentMonth && today.getDate() === day;
                  return (
                    <div
                      key={day}
                      title={ds}
                      className={`aspect-square rounded-sm flex items-center justify-center transition-all ${
                        isToday ? "ring-1 ring-coral" : ""
                      } ${entry ? "bg-coral/70" : "bg-secondary"}`}
                    />
                  );
                })}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {
                  Object.entries(yearData ?? {}).filter(
                    ([d, v]) =>
                      v !== null &&
                      d.startsWith(
                        `${year}-${String(mIdx + 1).padStart(2, "0")}`,
                      ),
                  ).length
                }{" "}
                / {days} days
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 text-xs text-muted-foreground px-1">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-coral/70" /> Logged
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-secondary border border-border" />{" "}
          No log
        </div>
      </div>
    </motion.div>
  );
}

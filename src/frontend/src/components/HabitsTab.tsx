import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Flame, Loader2, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Habit } from "../backend.d";
import {
  useAddHabit,
  useHabitCompletions,
  useHabits,
  useMarkHabitComplete,
  useRemoveHabit,
  useUnmarkHabitComplete,
} from "../hooks/useQueries";

function toDateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

function HabitItem({ habit, today }: { habit: Habit; today: string }) {
  const { data: completions = [] } = useHabitCompletions(habit.id);
  const markComplete = useMarkHabitComplete();
  const unmark = useUnmarkHabitComplete();
  const removeHabit = useRemoveHabit();

  const isCheckedToday = completions.some((c) => c.date === today);

  // Calculate streak: consecutive days up to today
  const streak = (() => {
    const sortedDates = [...completions]
      .map((c) => c.date)
      .sort((a, b) => b.localeCompare(a));
    let count = 0;
    let d = new Date();
    for (const ds of sortedDates) {
      const expected = toDateStr(d);
      if (ds === expected) {
        count++;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    return count;
  })();

  async function toggle() {
    if (isCheckedToday) {
      await unmark.mutateAsync({ date: today, habitId: habit.id });
    } else {
      await markComplete.mutateAsync({ date: today, habitId: habit.id });
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 ${
        isCheckedToday
          ? "border-coral bg-peach-light shadow-warm"
          : "border-border bg-card"
      }`}
      data-ocid="habits.item.1"
    >
      <button
        type="button"
        onClick={toggle}
        disabled={markComplete.isPending || unmark.isPending}
        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
          isCheckedToday
            ? "bg-coral border-coral text-white"
            : "border-border bg-background"
        }`}
        data-ocid="habits.checkbox.1"
      >
        {isCheckedToday && "✓"}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`font-medium truncate ${
            isCheckedToday
              ? "line-through text-muted-foreground"
              : "text-foreground"
          }`}
        >
          {habit.name}
        </p>
        {streak > 0 && (
          <p className="text-xs text-coral flex items-center gap-1 mt-0.5">
            <Flame className="h-3 w-3" /> {streak} day streak!
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={async () => {
          await removeHabit.mutateAsync(habit.id);
          toast.success("Habit removed");
        }}
        className="text-muted-foreground hover:text-destructive transition-colors p-1"
        data-ocid="habits.delete_button.1"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

interface HabitsTabProps {
  userName: string;
}

export function HabitsTab({ userName }: HabitsTabProps) {
  const today = toDateStr(new Date());
  const { data: habits = [], isLoading } = useHabits();
  const addHabit = useAddHabit();
  const [newHabit, setNewHabit] = useState("");

  const checkedCount = 0; // simplified - tracks across all habits
  const allDone = habits.length > 0 && checkedCount === habits.length;

  async function handleAdd() {
    if (!newHabit.trim()) return;
    await addHabit.mutateAsync(newHabit.trim());
    setNewHabit("");
    toast.success("New habit added! 🌱");
  }

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-16"
        data-ocid="habits.loading_state"
      >
        <Loader2 className="h-8 w-8 animate-spin text-coral" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-2xl mx-auto"
      data-ocid="habits.section"
    >
      {/* Header */}
      <div className="gradient-card rounded-2xl p-5 shadow-card">
        <h2 className="font-display text-2xl font-bold text-foreground">
          Daily Habits 🌱
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          {habits.length === 0
            ? `Start building your routine, ${userName}! Add your first habit.`
            : `${habits.length} habit${habits.length > 1 ? "s" : ""} to track today.`}
        </p>
      </div>

      {/* Motivational message when all done */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-peach-mid text-white rounded-2xl p-5 text-center shadow-warm"
          >
            <p className="text-2xl mb-1">🎉</p>
            <p className="font-bold text-lg">All habits complete!</p>
            <p className="text-sm opacity-90">
              You're crushing it today, {userName}! 💪
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add new habit */}
      <div className="flex gap-2">
        <Input
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="e.g. Morning meditation, 30 min workout..."
          className="flex-1 border-border bg-card rounded-xl"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          data-ocid="habits.input"
        />
        <Button
          onClick={handleAdd}
          disabled={addHabit.isPending || !newHabit.trim()}
          className="rounded-xl bg-coral text-accent-foreground hover:opacity-90 px-4"
          data-ocid="habits.primary_button"
        >
          {addHabit.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Habit list */}
      {habits.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="habits.empty_state"
        >
          <p className="text-4xl mb-3">🌱</p>
          <p className="font-medium">No habits yet</p>
          <p className="text-sm mt-1">
            Add your first habit above and start your streak!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {habits.map((habit, idx) => (
              <div
                key={habit.id.toString()}
                data-ocid={`habits.item.${idx + 1}`}
              >
                <HabitItem habit={habit} today={today} />
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Tips */}
      <div className="p-4 rounded-2xl bg-secondary">
        <p className="text-sm text-secondary-foreground">
          🔥 <strong>Habit tip:</strong> It takes about 21 days to form a habit.
          Track your streak and don't break the chain!
        </p>
      </div>
    </motion.div>
  );
}

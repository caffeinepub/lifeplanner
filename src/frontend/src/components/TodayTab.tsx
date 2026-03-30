import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useLogEntry,
  useMotivationalQuote,
  useSaveLogEntry,
} from "../hooks/useQueries";

const MOODS = ["😔", "😐", "🙂", "😊", "🤩"];
const MOOD_LABELS = ["Low", "Okay", "Good", "Great", "Amazing"];

function toDateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

interface TodayTabProps {
  userName: string;
}

// Pre-generated stable arrays to avoid index-as-key issues
const WATER_CUP_SLOTS = Array.from({ length: 12 }, (_, i) => i + 1);
const ENERGY_SLOTS = [1, 2, 3, 4, 5];

export function TodayTab({ userName }: TodayTabProps) {
  const today = toDateStr(new Date());
  const { data: savedEntry, isLoading } = useLogEntry(today);
  const saveEntry = useSaveLogEntry();
  const { data: quote } = useMotivationalQuote();

  const [mood, setMood] = useState(2);
  const [energy, setEnergy] = useState(2);
  const [sleepHours, setSleepHours] = useState(7);
  const [studyHours, setStudyHours] = useState(2);
  const [waterCups, setWaterCups] = useState(6);
  const [notes, setNotes] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (savedEntry && !hydrated) {
      setMood(Number(savedEntry.mood));
      setEnergy(Number(savedEntry.energy));
      setSleepHours(savedEntry.sleepHours);
      setStudyHours(savedEntry.studyHours);
      setWaterCups(Number(savedEntry.waterCups));
      setNotes(savedEntry.notes);
      setHydrated(true);
    }
  }, [savedEntry, hydrated]);

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  async function handleSave() {
    await saveEntry.mutateAsync({
      date: today,
      entry: {
        mood: BigInt(mood),
        energy: BigInt(energy),
        sleepHours,
        studyHours,
        waterCups: BigInt(waterCups),
        notes,
      },
    });
    toast.success("Daily log saved! 🌸");
  }

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-16"
        data-ocid="today.loading_state"
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
      data-ocid="today.section"
    >
      {/* Date + Quote */}
      <div className="gradient-card rounded-2xl p-5 shadow-card">
        <p className="text-muted-foreground text-sm font-medium">
          {formattedDate}
        </p>
        <h2 className="font-display text-2xl font-bold text-foreground mt-1">
          Good day, {userName}! 🌞
        </h2>
        {quote && <p className="text-coral text-sm mt-2 italic">✨ {quote}</p>}
      </div>

      {/* Mood */}
      <div className="bg-card rounded-2xl p-5 shadow-card">
        <h3 className="font-semibold text-foreground mb-3">
          How are you feeling today? 💭
        </h3>
        <div className="flex justify-between gap-2">
          {MOODS.map((emoji, i) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setMood(i)}
              className={`mood-btn flex-1 flex-col gap-1 h-auto py-2 ${
                mood === i ? "active" : "bg-secondary"
              }`}
              title={MOOD_LABELS[i]}
              data-ocid="today.toggle"
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-xs text-muted-foreground">
                {MOOD_LABELS[i]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Energy */}
      <div className="bg-card rounded-2xl p-5 shadow-card">
        <h3 className="font-semibold text-foreground mb-3">
          Energy level today? ⚡
        </h3>
        <div className="flex gap-2">
          {ENERGY_SLOTS.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setEnergy(lvl - 1)}
              className={`flex-1 h-10 rounded-xl transition-all duration-200 font-bold text-sm ${
                lvl - 1 <= energy
                  ? "bg-coral text-accent-foreground shadow-sm"
                  : "bg-secondary text-muted-foreground"
              }`}
              data-ocid="today.toggle"
            >
              {lvl}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {["Very Low", "Low", "Moderate", "High", "Very High"][energy]}
        </p>
      </div>

      {/* Sleep + Study */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl p-5 shadow-card">
          <h3 className="font-semibold text-foreground mb-3">😴 Sleep</h3>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="stepper-btn"
              onClick={() => setSleepHours((h) => Math.max(0, h - 0.5))}
              data-ocid="today.button"
            >
              −
            </button>
            <div className="flex-1 text-center">
              <span className="font-display text-3xl font-bold text-foreground">
                {sleepHours}
              </span>
              <span className="text-muted-foreground text-sm ml-1">hrs</span>
            </div>
            <button
              type="button"
              className="stepper-btn"
              onClick={() => setSleepHours((h) => Math.min(24, h + 0.5))}
              data-ocid="today.button"
            >
              +
            </button>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 shadow-card">
          <h3 className="font-semibold text-foreground mb-3">📚 Study</h3>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="stepper-btn"
              onClick={() => setStudyHours((h) => Math.max(0, h - 0.5))}
              data-ocid="today.button"
            >
              −
            </button>
            <div className="flex-1 text-center">
              <span className="font-display text-3xl font-bold text-foreground">
                {studyHours}
              </span>
              <span className="text-muted-foreground text-sm ml-1">hrs</span>
            </div>
            <button
              type="button"
              className="stepper-btn"
              onClick={() => setStudyHours((h) => Math.min(24, h + 0.5))}
              data-ocid="today.button"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Water */}
      <div className="bg-card rounded-2xl p-5 shadow-card">
        <h3 className="font-semibold text-foreground mb-3">💧 Water intake</h3>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="stepper-btn w-11 h-11 text-xl"
            onClick={() => setWaterCups((c) => Math.max(0, c - 1))}
            data-ocid="today.button"
          >
            −
          </button>
          <div className="flex-1">
            <div className="flex gap-1 flex-wrap">
              {WATER_CUP_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setWaterCups(slot)}
                  className={`text-xl transition-all ${
                    slot <= waterCups ? "opacity-100" : "opacity-25"
                  }`}
                  data-ocid="today.toggle"
                >
                  💧
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {waterCups} cups today
            </p>
          </div>
          <button
            type="button"
            className="stepper-btn w-11 h-11 text-xl"
            onClick={() => setWaterCups((c) => Math.min(20, c + 1))}
            data-ocid="today.button"
          >
            +
          </button>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-card rounded-2xl p-5 shadow-card">
        <h3 className="font-semibold text-foreground mb-3">📝 Journal notes</h3>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How was your day? Any thoughts, reflections, or gratitude... 🌿"
          className="min-h-[120px] resize-none border-border bg-background rounded-xl"
          data-ocid="today.textarea"
        />
      </div>

      {/* Save */}
      <Button
        onClick={handleSave}
        disabled={saveEntry.isPending}
        className="w-full py-6 text-lg rounded-full bg-coral text-accent-foreground hover:opacity-90 shadow-warm"
        data-ocid="today.submit_button"
      >
        {saveEntry.isPending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...
          </>
        ) : (
          "Save Today's Log 🌸"
        )}
      </Button>
    </motion.div>
  );
}

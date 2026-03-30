import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAddPeriodEntry, usePeriodEntries } from "../hooks/useQueries";

const FLOW_OPTIONS = [
  { value: 1n, label: "Light 🌸", color: "bg-peach-light border-coral/30" },
  { value: 2n, label: "Medium 💧", color: "bg-peach-mid border-coral/60" },
  { value: 3n, label: "Heavy 🌊", color: "bg-coral border-coral" },
];

export function PeriodsTab() {
  const { data: entries = [], isLoading } = usePeriodEntries();
  const addEntry = useAddPeriodEntry();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [flow, setFlow] = useState(2n);
  const [symptoms, setSymptoms] = useState("");
  const [showForm, setShowForm] = useState(false);

  async function handleSubmit() {
    if (!startDate) return;
    await addEntry.mutateAsync({
      startDate,
      endDate: endDate || startDate,
      flow,
      symptoms,
    });
    setStartDate("");
    setEndDate("");
    setFlow(2n);
    setSymptoms("");
    setShowForm(false);
    toast.success("Period entry logged! 🌸");
  }

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-16"
        data-ocid="periods.loading_state"
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
      data-ocid="periods.section"
    >
      <div className="gradient-card rounded-2xl p-5 shadow-card">
        <h2 className="font-display text-2xl font-bold text-foreground">
          Period Tracker 🌸
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Track your cycle and understand your body better.
        </p>
      </div>

      {!showForm && (
        <Button
          onClick={() => setShowForm(true)}
          className="w-full py-5 rounded-2xl bg-coral text-accent-foreground hover:opacity-90 shadow-warm"
          data-ocid="periods.open_modal_button"
        >
          + Log New Period Entry
        </Button>
      )}

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-5 shadow-card space-y-4"
          data-ocid="periods.panel"
        >
          <h3 className="font-semibold text-foreground">New Period Entry</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Start Date 📅</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-border bg-background rounded-xl"
                data-ocid="periods.input"
              />
            </div>
            <div className="space-y-1">
              <Label>End Date 📅</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-border bg-background rounded-xl"
                data-ocid="periods.input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Flow Intensity</Label>
            <div className="grid grid-cols-3 gap-2">
              {FLOW_OPTIONS.map((opt) => (
                <button
                  key={opt.value.toString()}
                  type="button"
                  onClick={() => setFlow(opt.value)}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    flow === opt.value
                      ? `${opt.color} text-white shadow-sm`
                      : "border-border bg-background text-foreground hover:border-coral/40"
                  }`}
                  data-ocid="periods.radio"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label>Symptoms (optional) 💊</Label>
            <Input
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. cramps, headache, bloating..."
              className="border-border bg-background rounded-xl"
              data-ocid="periods.input"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
              className="flex-1 rounded-xl"
              data-ocid="periods.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={addEntry.isPending || !startDate}
              className="flex-1 rounded-xl bg-coral text-accent-foreground hover:opacity-90"
              data-ocid="periods.submit_button"
            >
              {addEntry.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Entry"
              )}
            </Button>
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">History 📋</h3>
        {entries.length === 0 ? (
          <div
            className="text-center py-10 text-muted-foreground"
            data-ocid="periods.empty_state"
          >
            <p className="text-4xl mb-3">🌸</p>
            <p className="font-medium">No entries yet</p>
            <p className="text-sm mt-1">
              Start logging to track your cycle patterns.
            </p>
          </div>
        ) : (
          entries.map((e, i) => (
            <div
              key={`${e.startDate}-${e.endDate}`}
              className="bg-card rounded-2xl p-4 shadow-card border-l-4 border-coral"
              data-ocid={`periods.item.${i + 1}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-foreground">
                    {new Date(e.startDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {e.endDate && e.endDate !== e.startDate && (
                      <span className="text-muted-foreground">
                        {" "}
                        &rarr;{" "}
                        {new Date(e.endDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </p>
                  {e.symptoms && (
                    <p className="text-sm text-muted-foreground mt-1">
                      💊 {e.symptoms}
                    </p>
                  )}
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    Number(e.flow) === 1
                      ? "bg-peach-light text-foreground"
                      : Number(e.flow) === 2
                        ? "bg-peach-mid text-white"
                        : "bg-coral text-white"
                  }`}
                >
                  {["Light", "Medium", "Heavy"][Number(e.flow) - 1]}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

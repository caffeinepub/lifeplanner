import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Flower2, LogOut } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { HabitsTab } from "./components/HabitsTab";
import { MonthlyTab } from "./components/MonthlyTab";
import { Onboarding } from "./components/Onboarding";
import { PeriodsTab } from "./components/PeriodsTab";
import { TodayTab } from "./components/TodayTab";
import { YearlyTab } from "./components/YearlyTab";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useCheckProfileCompletion } from "./hooks/useQueries";

const queryClient = new QueryClient();

type Tab = "today" | "habits" | "periods" | "monthly" | "yearly";

function AppInner() {
  const { identity, clear } = useInternetIdentity();
  const { isFetching } = useActor();
  const { data: profileComplete, isLoading: profileLoading } =
    useCheckProfileCompletion();

  const [userName, setUserName] = useState(
    () => localStorage.getItem("bloom_name") || "",
  );
  const [gender, setGender] = useState(
    () => localStorage.getItem("bloom_gender") || "",
  );
  const [activeTab, setActiveTab] = useState<Tab>("today");
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem("bloom_name");
    const storedGender = localStorage.getItem("bloom_gender");
    if (storedName && storedGender && identity) {
      setUserName(storedName);
      setGender(storedGender);
      setAppReady(true);
    } else if (profileComplete && !storedName) {
      setAppReady(false);
    } else if (profileComplete && storedName) {
      setAppReady(true);
    }
  }, [identity, profileComplete]);

  function handleOnboardingComplete(name: string, g: string) {
    setUserName(name);
    setGender(g);
    setAppReady(true);
  }

  if (isFetching || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full gradient-hero flex items-center justify-center text-3xl mx-auto animate-pulse">
            🌸
          </div>
          <p className="text-muted-foreground font-medium">
            Loading your planner...
          </p>
        </div>
      </div>
    );
  }

  if (!appReady || !identity) {
    return (
      <>
        <Onboarding onComplete={handleOnboardingComplete} />
        <Toaster />
      </>
    );
  }

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: "today", label: "Today", emoji: "☀️" },
    { id: "habits", label: "Habits", emoji: "🌱" },
    ...(gender === "woman"
      ? [{ id: "periods" as Tab, label: "Periods", emoji: "🌸" }]
      : []),
    { id: "monthly", label: "Monthly", emoji: "📅" },
    { id: "yearly", label: "Yearly", emoji: "🗓️" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-sm border-b border-border shadow-xs">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center">
              <Flower2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg font-semibold text-foreground">
              Bloom
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-muted-foreground">
              Hi, <strong className="text-foreground">{userName}</strong>! 👋
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clear();
                localStorage.removeItem("bloom_name");
                localStorage.removeItem("bloom_gender");
                setAppReady(false);
                setUserName("");
                setGender("");
              }}
              className="text-muted-foreground hover:text-foreground rounded-full"
              data-ocid="nav.button"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <nav className="border-t border-border">
          <div className="max-w-3xl mx-auto px-4 flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-coral text-coral"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                data-ocid="nav.tab"
              >
                <span>{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === "today" && (
            <motion.div
              key="today"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <TodayTab userName={userName} />
            </motion.div>
          )}
          {activeTab === "habits" && (
            <motion.div
              key="habits"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <HabitsTab userName={userName} />
            </motion.div>
          )}
          {activeTab === "periods" && gender === "woman" && (
            <motion.div
              key="periods"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PeriodsTab />
            </motion.div>
          )}
          {activeTab === "monthly" && (
            <motion.div
              key="monthly"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <MonthlyTab />
            </motion.div>
          )}
          {activeTab === "yearly" && (
            <motion.div
              key="yearly"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <YearlyTab />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-6 text-center text-xs text-muted-foreground border-t border-border">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-coral transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}

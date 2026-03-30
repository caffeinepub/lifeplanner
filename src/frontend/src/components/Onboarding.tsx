import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSaveProfile } from "../hooks/useQueries";

interface OnboardingProps {
  onComplete: (name: string, gender: string) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"woman" | "man" | "">("");
  const [step, setStep] = useState<"welcome" | "form">("welcome");
  const { login, loginStatus, identity } = useInternetIdentity();
  const saveProfile = useSaveProfile();

  const isLoggingIn = loginStatus === "logging-in";
  const isLoggedIn = !!identity;

  async function handleStart() {
    if (!name.trim() || !gender) return;
    if (!isLoggedIn) {
      await login();
      return;
    }
    await saveProfile.mutateAsync({ gender });
    localStorage.setItem("bloom_name", name.trim());
    localStorage.setItem("bloom_gender", gender);
    onComplete(name.trim(), gender);
  }

  async function handleLoginAndContinue() {
    await login();
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left: Form side */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-16 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center gap-2 mb-10">
            <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center text-xl">
              🌸
            </div>
            <span className="font-display text-2xl font-semibold text-foreground">
              Bloom
            </span>
          </div>

          {step === "welcome" ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
                Your Journey to Wellness
                <span className="text-coral"> Starts Here.</span>
              </h1>
              <p className="text-muted-foreground text-lg mb-8">
                Personalize your Bloom Planner. Enter your details to begin your
                daily wellness ritual.
              </p>
              <Button
                onClick={() => setStep("form")}
                className="w-full py-6 text-lg rounded-full bg-coral text-accent-foreground hover:opacity-90 shadow-warm transition-all"
                data-ocid="onboarding.primary_button"
              >
                Let's Get Started ✨
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div>
                <h2 className="font-display text-3xl font-bold text-foreground mb-1">
                  Hello there! 👋
                </h2>
                <p className="text-muted-foreground">
                  What should we call you?
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground font-medium">
                  Your Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aria, Sam, Luna..."
                  className="text-lg py-5 border-border bg-card rounded-xl focus:ring-2 focus:ring-coral"
                  data-ocid="onboarding.input"
                  onKeyDown={(e) =>
                    e.key === "Enter" && name && setGender(gender || "woman")
                  }
                />
              </div>

              {name.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <p className="text-foreground font-medium">
                    Nice to meet you, {name}! How do you identify?
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setGender("woman")}
                      className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-200 ${
                        gender === "woman"
                          ? "border-coral bg-peach-light shadow-warm"
                          : "border-border bg-card hover:border-coral/50"
                      }`}
                      data-ocid="onboarding.radio"
                    >
                      <span className="text-4xl">🌸</span>
                      <span className="font-semibold text-foreground">
                        Woman
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender("man")}
                      className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-200 ${
                        gender === "man"
                          ? "border-coral bg-peach-light shadow-warm"
                          : "border-border bg-card hover:border-coral/50"
                      }`}
                      data-ocid="onboarding.radio"
                    >
                      <span className="text-4xl">🌿</span>
                      <span className="font-semibold text-foreground">Man</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {name.trim() && gender && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-2xl bg-secondary text-secondary-foreground text-sm">
                    💪{" "}
                    <strong>
                      Let's build the best version of you, {name}!
                    </strong>{" "}
                    Small consistent actions create extraordinary results.
                  </div>

                  {!isLoggedIn ? (
                    <Button
                      onClick={handleLoginAndContinue}
                      disabled={isLoggingIn}
                      className="w-full py-6 text-lg rounded-full bg-coral text-accent-foreground hover:opacity-90 shadow-warm"
                      data-ocid="onboarding.submit_button"
                    >
                      {isLoggingIn ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                          Connecting...
                        </>
                      ) : (
                        "Sign In to Start Planning 🚀"
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleStart}
                      disabled={saveProfile.isPending}
                      className="w-full py-6 text-lg rounded-full bg-coral text-accent-foreground hover:opacity-90 shadow-warm"
                      data-ocid="onboarding.submit_button"
                    >
                      {saveProfile.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                          Setting up...
                        </>
                      ) : (
                        "Start Planning 🌸"
                      )}
                    </Button>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Right: Hero image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <img
          src="/assets/generated/hero-planner.dim_800x600.jpg"
          alt="Cozy planner lifestyle"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-background/30" />
        <div className="absolute bottom-8 left-8 right-8">
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-5 shadow-warm">
            <p className="font-display text-xl font-semibold text-foreground">
              "The secret of getting ahead is getting started."
            </p>
            <p className="text-muted-foreground mt-1 text-sm">— Mark Twain</p>
          </div>
        </div>
      </div>
    </div>
  );
}

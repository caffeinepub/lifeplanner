import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Habit,
  HabitDay,
  LogEntry,
  PeriodEntry,
  Profile,
} from "../backend.d";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useProfile() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["profile", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return null;
      return actor.getProfile(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useCheckProfileCompletion() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["profileComplete", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return false;
      return actor.checkProfileCompletion(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: Profile) => {
      if (!actor) throw new Error("No actor");
      return actor.saveProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["profileComplete"] });
    },
  });
}

export function useLogEntry(date: string) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["logEntry", date, identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return null;
      return actor.getLogEntry(identity.getPrincipal(), date);
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useSaveLogEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ date, entry }: { date: string; entry: LogEntry }) => {
      if (!actor) throw new Error("No actor");
      return actor.saveLogEntry(date, entry);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["logEntry", vars.date] });
      queryClient.invalidateQueries({ queryKey: ["yearlyLogs"] });
    },
  });
}

export function useHabits() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["habits", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [] as Habit[];
      return actor.getHabits(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useAddHabit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("No actor");
      return actor.addHabit(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}

export function useRemoveHabit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (habitId: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.removeHabit(habitId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      queryClient.invalidateQueries({ queryKey: ["habitCompletions"] });
    },
  });
}

export function useMarkHabitComplete() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (habitDay: HabitDay) => {
      if (!actor) throw new Error("No actor");
      return actor.markHabitComplete(habitDay);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["habitCompletions", vars.habitId],
      });
    },
  });
}

export function useUnmarkHabitComplete() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (habitDay: HabitDay) => {
      if (!actor) throw new Error("No actor");
      return actor.unmarkHabitCompletion(habitDay);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["habitCompletions", vars.habitId],
      });
    },
  });
}

export function useHabitCompletions(habitId: bigint | undefined) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: [
      "habitCompletions",
      habitId?.toString(),
      identity?.getPrincipal().toString(),
    ],
    queryFn: async () => {
      if (!actor || !identity || habitId === undefined) return [] as HabitDay[];
      const result = await actor.getHabitCompletions(
        identity.getPrincipal(),
        habitId,
      );
      return result ?? [];
    },
    enabled: !!actor && !isFetching && !!identity && habitId !== undefined,
  });
}

export function usePeriodEntries() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["periodEntries", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [] as PeriodEntry[];
      return actor.getPeriodEntries(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useAddPeriodEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entry: PeriodEntry) => {
      if (!actor) throw new Error("No actor");
      return actor.addPeriodEntry(entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["periodEntries"] });
    },
  });
}

export function useMotivationalQuote() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["motivationalQuote"],
    queryFn: async () => {
      if (!actor) return "Every day is a new beginning. 🌸";
      return actor.getMotivationalQuote();
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 60,
  });
}

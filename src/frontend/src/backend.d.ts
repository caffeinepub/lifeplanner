import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface LogEntry {
    mood: bigint;
    studyHours: number;
    notes: string;
    waterCups: bigint;
    sleepHours: number;
    energy: bigint;
}
export type Date_ = string;
export interface HabitDay {
    date: Date_;
    habitId: HabitId;
}
export type HabitId = bigint;
export interface Habit {
    id: bigint;
    name: string;
}
export interface Profile {
    gender: string;
}
export interface PeriodEntry {
    endDate: Date_;
    flow: bigint;
    symptoms: string;
    startDate: Date_;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addHabit(name: string): Promise<bigint>;
    addPeriodEntry(periodEntry: PeriodEntry): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkProfileCompletion(user: Principal): Promise<boolean>;
    clearHabits(): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    getHabitCompletions(user: Principal, habitId: bigint): Promise<Array<HabitDay> | null>;
    getHabits(user: Principal): Promise<Array<Habit>>;
    getLogEntry(user: Principal, date: string): Promise<LogEntry | null>;
    getMotivationalQuote(): Promise<string>;
    getPeriodEntries(user: Principal): Promise<Array<PeriodEntry>>;
    getProfile(user: Principal): Promise<Profile>;
    incrementMotivationalQuoteCount(): Promise<bigint>;
    isCallerAdmin(): Promise<boolean>;
    markHabitComplete(habitDay: HabitDay): Promise<void>;
    removeHabit(habitId: bigint): Promise<boolean>;
    saveLogEntry(date: string, logEntry: LogEntry): Promise<void>;
    saveProfile(profile: Profile): Promise<void>;
    unmarkHabitCompletion(habitDay: HabitDay): Promise<boolean>;
}

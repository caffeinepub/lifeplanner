import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Iter "mo:core/Iter";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  module LogEntry {
    public func merge(existing : LogEntry, newData : LogEntry) : LogEntry {
      {
        mood = newData.mood;
        energy = newData.energy;
        sleepHours = newData.sleepHours;
        studyHours = newData.studyHours;
        waterCups = newData.waterCups;
        notes = newData.notes;
      };
    };
  };

  type Profile = {
    gender : Text;
  };

  module Profile {
    public func compare(profile1 : Profile, profile2 : Profile) : { #greater; #less; #equal } {
      Text.compare(profile1.gender, profile2.gender);
    };
  };

  type LogEntry = {
    mood : Nat;
    energy : Nat;
    sleepHours : Float;
    studyHours : Float;
    waterCups : Nat;
    notes : Text;
  };

  module Log {
    public func compare(log1 : LogEntry, log2 : LogEntry) : { #greater; #less; #equal } {
      Text.compare(log1.notes, log2.notes);
    };
  };

  type Habit = {
    name : Text;
    id : Nat;
  };

  module Habit {
    public func compare(habit1 : Habit, habit2 : Habit) : { #greater; #less; #equal } {
      switch (Nat.compare(habit1.id, habit2.id)) {
        case (#equal) { Text.compare(habit1.name, habit2.name) };
        case (order) { order };
      };
    };
  };

  type HabitId = Nat;
  type Date = Text;

  type HabitDay = {
    date : Date;
    habitId : HabitId;
  };

  module HabitDay {
    public func compare(habitDay1 : HabitDay, habitDay2 : HabitDay) : { #greater; #less; #equal } {
      switch (Text.compare(habitDay1.date, habitDay2.date)) {
        case (#equal) { Nat.compare(habitDay1.habitId, habitDay2.habitId) };
        case (order) { order };
      };
    };
  };

  type PeriodEntry = {
    startDate : Date;
    endDate : Date;
    flow : Nat;
    symptoms : Text;
  };

  module PeriodEntry {
    public func compare(periodEntry1 : PeriodEntry, periodEntry2 : PeriodEntry) : { #greater; #less; #equal } {
      switch (Text.compare(periodEntry1.startDate, periodEntry2.startDate)) {
        case (#equal) { Text.compare(periodEntry1.endDate, periodEntry2.endDate) };
        case (order) { order };
      };
    };
  };

  let profiles = Map.empty<Principal, Profile>();
  let logEntries = Map.empty<Principal, Map.Map<Text, LogEntry>>();
  let nextHabitId = Map.empty<Principal, Nat>();
  let habits = Map.empty<Principal, Map.Map<Nat, Habit>>();
  let habitCompletions = Map.empty<Principal, Map.Map<Nat, [HabitDay]>>();
  let periodEntries = Map.empty<Principal, [PeriodEntry]>();

  let motivationalQuotes = [
    "Keep pushing forward!",
    "You are stronger than you think.",
    "Every day is a new opportunity.",
    "Healthy habits lead to a healthy life.",
    "Believe in yourself and all that you are.",
    "Take care of your body, it's the only place you have to live.",
    "Consistency is key to success.",
    "Focus on progress, not perfection.",
    "Make your health a priority.",
    "Small steps every day lead to big results.",
    "Your only limit is your mind.",
    "Stay positive, work hard, make it happen.",
    "Self-care is not selfish, it's necessary.",
    "Success starts with self-discipline.",
    "You are capable of amazing things.",
    "Don't give up, great things take time.",
    "Your health is your greatest wealth.",
    "Be kind to yourself on your journey.",
    "Celebrate your small victories.",
    "Choose happiness every day.",
    "You have the power to change your life.",
    "Healthy mind, healthy body.",
  ];

  var motivationalQuoteCount = 0;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  func addHabitToUser(user : Principal, habit : Habit) {
    let userHabits = switch (habits.get(user)) {
      case (null) { Map.empty<Nat, Habit>() };
      case (?existingHabits) { existingHabits };
    };
    userHabits.add(habit.id, habit);
    habits.add(user, userHabits);
  };

  public shared ({ caller }) func saveProfile(profile : Profile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    profiles.add(caller, profile);
  };

  public query ({ caller }) func getProfile(user : Principal) : async Profile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (profiles.get(user)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?profile) { profile };
    };
  };

  public query ({ caller }) func checkProfileCompletion(user : Principal) : async Bool {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only check your own profile completion");
    };
    profiles.containsKey(user);
  };

  public shared ({ caller }) func saveLogEntry(date : Text, logEntry : LogEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save log entries");
    };
    let userEntries = switch (logEntries.get(caller)) {
      case (null) { Map.empty<Text, LogEntry>() };
      case (?existingEntries) { existingEntries };
    };
    let updatedEntry = switch (userEntries.get(date)) {
      case (null) { logEntry };
      case (?existingEntry) { LogEntry.merge(existingEntry, logEntry) };
    };
    userEntries.add(date, updatedEntry);
    logEntries.add(caller, userEntries);
  };

  public query ({ caller }) func getLogEntry(user : Principal, date : Text) : async ?LogEntry {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own log entries");
    };
    switch (logEntries.get(user)) {
      case (null) { null };
      case (?userEntries) { userEntries.get(date) };
    };
  };

  public shared ({ caller }) func addHabit(name : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add habits");
    };
    let habitId = switch (nextHabitId.get(caller)) {
      case (null) { 1 };
      case (?existingNextId) { existingNextId };
    };
    let newHabit = {
      name;
      id = habitId;
    };
    addHabitToUser(caller, newHabit);
    nextHabitId.add(caller, habitId + 1);
    habitId;
  };

  public query ({ caller }) func getHabits(user : Principal) : async [Habit] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own habits");
    };
    switch (habits.get(user)) {
      case (null) { [] };
      case (?userHabits) { userHabits.values().toArray().sort() };
    };
  };

  public shared ({ caller }) func markHabitComplete(habitDay : HabitDay) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark habits complete");
    };
    let userCompletions = switch (habitCompletions.get(caller)) {
      case (null) { Map.empty<Nat, [HabitDay]>() };
      case (?existingCompletions) { existingCompletions };
    };
    let currentDays = switch (userCompletions.get(habitDay.habitId)) {
      case (null) { [] };
      case (?days) {
        if (days.find(func(existingDay) { existingDay.date == habitDay.date }) != null) { return () };
        days;
      };
    };
    userCompletions.add(habitDay.habitId, currentDays.concat([habitDay]));
    habitCompletions.add(caller, userCompletions);
  };

  public shared ({ caller }) func unmarkHabitCompletion(habitDay : HabitDay) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unmark habit completions");
    };
    let userCompletions = switch (habitCompletions.get(caller)) {
      case (null) { return false };
      case (?completions) { completions };
    };
    let currentDays = switch (userCompletions.get(habitDay.habitId)) {
      case (null) { return false };
      case (?days) { days };
    };
    let dayIndex = currentDays.findIndex(
      func(existingDay) { existingDay.date == habitDay.date }
    );
    switch (dayIndex) {
      case (null) { false };
      case (?index) {
        let newDays = currentDays.sliceToArray(0, index).concat(currentDays.sliceToArray(index + 1, currentDays.size()));
        userCompletions.add(habitDay.habitId, newDays);
        habitCompletions.add(caller, userCompletions);
        true;
      };
    };
  };

  public query ({ caller }) func getHabitCompletions(user : Principal, habitId : Nat) : async ?[HabitDay] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own habit completions");
    };
    switch (habitCompletions.get(user)) {
      case (null) { null };
      case (?userCompletions) { userCompletions.get(habitId) };
    };
  };

  public shared ({ caller }) func addPeriodEntry(periodEntry : PeriodEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add period entries");
    };
    let currentPeriods = switch (periodEntries.get(caller)) {
      case (null) { [periodEntry] };
      case (?periods) { periods.concat([periodEntry]) };
    };
    periodEntries.add(caller, currentPeriods);
  };

  public query ({ caller }) func getPeriodEntries(user : Principal) : async [PeriodEntry] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own period entries");
    };
    switch (periodEntries.get(user)) {
      case (null) { [] };
      case (?entries) { entries.sort() };
    };
  };

  public shared ({ caller }) func removeHabit(habitId : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove habits");
    };
    switch (habits.get(caller)) {
      case (null) { false };
      case (?userHabits) {
        if (not userHabits.containsKey(habitId)) { return false };
        userHabits.remove(habitId);
        habits.add(caller, userHabits);
        true;
      };
    };
  };

  public shared ({ caller }) func clearHabits() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear habits");
    };
    habits.add(caller, Map.empty<Nat, Habit>());
  };

  public query ({ caller }) func getMotivationalQuote() : async Text {
    let quote = motivationalQuotes[motivationalQuoteCount % motivationalQuotes.size()];
    quote;
  };

  public shared ({ caller }) func incrementMotivationalQuoteCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can increment quote count");
    };
    motivationalQuoteCount += 1;
    motivationalQuoteCount;
  };
};

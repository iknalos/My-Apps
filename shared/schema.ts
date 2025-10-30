import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  gender: text("gender").notNull(),
  club: text("club"),
  singlesRating: integer("singles_rating"),
  mensDoublesRating: integer("mens_doubles_rating"),
  womensDoublesRating: integer("womens_doubles_rating"),
  mixedDoublesRating: integer("mixed_doubles_rating"),
  preferredCategories: text("preferred_categories").array().notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  createdAt: true,
});

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  date: timestamp("date").notNull(),
  sessionTypes: text("session_types").array().notNull(),
  capacity: integer("capacity").notNull(),
  courtsAvailable: integer("courts_available").notNull(),
  numberOfRounds: integer("number_of_rounds").notNull(),
  maxSkillGap: integer("max_skill_gap"),
  minGamesPerPlayer: integer("min_games_per_player"),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
});

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

export const registrations = pgTable("registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  playerId: varchar("player_id").notNull(),
  selectedEvents: text("selected_events").array().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRegistrationSchema = createInsertSchema(registrations).omit({
  id: true,
  createdAt: true,
});

export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrations.$inferSelect;

export const matches = pgTable("matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  eventType: text("event_type").notNull().default('singles'),
  courtNumber: integer("court_number").notNull(),
  roundNumber: integer("round_number").notNull(),
  team1Player1Id: varchar("team1_player1_id").notNull(),
  team1Player2Id: varchar("team1_player2_id"),
  team2Player1Id: varchar("team2_player1_id").notNull(),
  team2Player2Id: varchar("team2_player2_id"),
  team1Set1: integer("team1_set1"),
  team1Set2: integer("team1_set2"),
  team1Set3: integer("team1_set3"),
  team2Set1: integer("team2_set1"),
  team2Set2: integer("team2_set2"),
  team2Set3: integer("team2_set3"),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  createdAt: true,
});

export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;

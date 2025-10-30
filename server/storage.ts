import { type User, type InsertUser, type Player, type InsertPlayer, type Session, type InsertSession, type Registration, type InsertRegistration, type Match, type InsertMatch, type RatingHistory, type InsertRatingHistory, users, players, sessions, registrations, matches, ratingHistories } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllPlayers(): Promise<Player[]>;
  getPlayer(id: string): Promise<Player | undefined>;
  getPlayerByUserId(userId: string): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: string, player: Partial<InsertPlayer>): Promise<Player | undefined>;
  deletePlayer(id: string): Promise<boolean>;

  getAllSessions(): Promise<Session[]>;
  getSession(id: string): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: string, session: Partial<InsertSession>): Promise<Session | undefined>;
  deleteSession(id: string): Promise<boolean>;

  getRegistrationsBySession(sessionId: string): Promise<Registration[]>;
  getRegistrationByPlayerAndSession(playerId: string, sessionId: string): Promise<Registration | undefined>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  deleteRegistration(id: string): Promise<boolean>;

  getMatchesBySession(sessionId: string): Promise<Match[]>;
  getMatchesByPlayer(playerId: string): Promise<Match[]>;
  getMatch(id: string): Promise<Match | undefined>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: string, match: Partial<InsertMatch>): Promise<Match | undefined>;
  deleteMatchesBySession(sessionId: string): Promise<number>;

  getRatingHistoriesByPlayer(playerId: string): Promise<RatingHistory[]>;
  getRatingHistoriesByMatch(matchId: string): Promise<RatingHistory[]>;
  createRatingHistory(ratingHistory: InsertRatingHistory): Promise<RatingHistory>;
  deleteRatingHistoriesByMatch(matchId: string): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private players: Map<string, Player>;
  private sessions: Map<string, Session>;
  private registrations: Map<string, Registration>;
  private matches: Map<string, Match>;
  private ratingHistories: Map<string, RatingHistory>;

  constructor() {
    this.users = new Map();
    this.players = new Map();
    this.sessions = new Map();
    this.registrations = new Map();
    this.matches = new Map();
    this.ratingHistories = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password,
      role: insertUser.role || 'player'
    };
    this.users.set(id, user);
    return user;
  }

  async getAllPlayers(): Promise<Player[]> {
    return Array.from(this.players.values());
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async getPlayerByUserId(userId: string): Promise<Player | undefined> {
    return Array.from(this.players.values()).find(p => p.userId === userId);
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = randomUUID();
    const player: Player = {
      id,
      userId: insertPlayer.userId ?? null,
      name: insertPlayer.name,
      gender: insertPlayer.gender,
      club: insertPlayer.club ?? null,
      singlesRating: insertPlayer.singlesRating ?? null,
      mensDoublesRating: insertPlayer.mensDoublesRating ?? null,
      womensDoublesRating: insertPlayer.womensDoublesRating ?? null,
      mixedDoublesRating: insertPlayer.mixedDoublesRating ?? null,
      preferredCategories: insertPlayer.preferredCategories,
      notes: insertPlayer.notes ?? null,
      createdAt: new Date(),
    };
    this.players.set(id, player);
    return player;
  }

  async updatePlayer(id: string, updates: Partial<InsertPlayer>): Promise<Player | undefined> {
    const player = this.players.get(id);
    if (!player) return undefined;
    
    const updatedPlayer = { ...player, ...updates };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }

  async deletePlayer(id: string): Promise<boolean> {
    return this.players.delete(id);
  }

  async getAllSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async getSession(id: string): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = randomUUID();
    const session: Session = {
      id,
      name: insertSession.name,
      date: insertSession.date,
      sessionTypes: insertSession.sessionTypes,
      capacity: insertSession.capacity,
      courtsAvailable: insertSession.courtsAvailable,
      numberOfRounds: insertSession.numberOfRounds,
      maxSkillGap: insertSession.maxSkillGap ?? null,
      minGamesPerPlayer: insertSession.minGamesPerPlayer ?? null,
      status: insertSession.status,
      createdAt: new Date(),
    };
    this.sessions.set(id, session);
    return session;
  }

  async updateSession(id: string, updates: Partial<InsertSession>): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  async deleteSession(id: string): Promise<boolean> {
    return this.sessions.delete(id);
  }

  async getRegistrationsBySession(sessionId: string): Promise<Registration[]> {
    return Array.from(this.registrations.values()).filter(
      (reg) => reg.sessionId === sessionId
    );
  }

  async getRegistrationByPlayerAndSession(playerId: string, sessionId: string): Promise<Registration | undefined> {
    return Array.from(this.registrations.values()).find(
      (reg) => reg.playerId === playerId && reg.sessionId === sessionId
    );
  }

  async createRegistration(insertRegistration: InsertRegistration): Promise<Registration> {
    const id = randomUUID();
    const registration: Registration = {
      id,
      sessionId: insertRegistration.sessionId,
      playerId: insertRegistration.playerId,
      selectedEvents: insertRegistration.selectedEvents,
      createdAt: new Date(),
    };
    this.registrations.set(id, registration);
    return registration;
  }

  async deleteRegistration(id: string): Promise<boolean> {
    return this.registrations.delete(id);
  }

  async getMatchesBySession(sessionId: string): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(
      (match) => match.sessionId === sessionId
    ).sort((a, b) => a.roundNumber - b.roundNumber || a.courtNumber - b.courtNumber);
  }

  async getMatchesByPlayer(playerId: string): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(
      (match) => 
        match.team1Player1Id === playerId ||
        match.team1Player2Id === playerId ||
        match.team2Player1Id === playerId ||
        match.team2Player2Id === playerId
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getMatch(id: string): Promise<Match | undefined> {
    return this.matches.get(id);
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const id = randomUUID();
    const match: Match = {
      id,
      sessionId: insertMatch.sessionId,
      eventType: insertMatch.eventType || "singles",
      courtNumber: insertMatch.courtNumber,
      roundNumber: insertMatch.roundNumber,
      team1Player1Id: insertMatch.team1Player1Id,
      team1Player2Id: insertMatch.team1Player2Id ?? null,
      team2Player1Id: insertMatch.team2Player1Id,
      team2Player2Id: insertMatch.team2Player2Id ?? null,
      team1Set1: insertMatch.team1Set1 ?? null,
      team1Set2: insertMatch.team1Set2 ?? null,
      team1Set3: insertMatch.team1Set3 ?? null,
      team2Set1: insertMatch.team2Set1 ?? null,
      team2Set2: insertMatch.team2Set2 ?? null,
      team2Set3: insertMatch.team2Set3 ?? null,
      status: insertMatch.status,
      createdAt: new Date(),
    };
    this.matches.set(id, match);
    return match;
  }

  async updateMatch(id: string, updates: Partial<InsertMatch>): Promise<Match | undefined> {
    const match = this.matches.get(id);
    if (!match) return undefined;
    
    const updatedMatch = { ...match, ...updates };
    this.matches.set(id, updatedMatch);
    return updatedMatch;
  }

  async deleteMatchesBySession(sessionId: string): Promise<number> {
    const matchesToDelete = Array.from(this.matches.values()).filter(m => m.sessionId === sessionId);
    for (const match of matchesToDelete) {
      this.matches.delete(match.id);
    }
    return matchesToDelete.length;
  }

  async getRatingHistoriesByPlayer(playerId: string): Promise<RatingHistory[]> {
    return Array.from(this.ratingHistories.values())
      .filter(h => h.playerId === playerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getRatingHistoriesByMatch(matchId: string): Promise<RatingHistory[]> {
    return Array.from(this.ratingHistories.values())
      .filter(h => h.matchId === matchId);
  }

  async createRatingHistory(insertRatingHistory: InsertRatingHistory): Promise<RatingHistory> {
    const id = randomUUID();
    const ratingHistory: RatingHistory = {
      id,
      playerId: insertRatingHistory.playerId,
      eventType: insertRatingHistory.eventType,
      oldRating: insertRatingHistory.oldRating,
      newRating: insertRatingHistory.newRating,
      ratingChange: insertRatingHistory.ratingChange,
      matchId: insertRatingHistory.matchId,
      opponentIds: insertRatingHistory.opponentIds,
      result: insertRatingHistory.result,
      expectedOutcome: insertRatingHistory.expectedOutcome,
      createdAt: new Date(),
    };
    this.ratingHistories.set(id, ratingHistory);
    return ratingHistory;
  }

  async deleteRatingHistoriesByMatch(matchId: string): Promise<number> {
    const historiesToDelete = Array.from(this.ratingHistories.values()).filter(h => h.matchId === matchId);
    for (const history of historiesToDelete) {
      this.ratingHistories.delete(history.id);
    }
    return historiesToDelete.length;
  }
}

// DatabaseStorage implementation using Drizzle ORM
export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllPlayers(): Promise<Player[]> {
    return await db.select().from(players);
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player || undefined;
  }

  async getPlayerByUserId(userId: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.userId, userId));
    return player || undefined;
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const [player] = await db.insert(players).values(insertPlayer).returning();
    return player;
  }

  async updatePlayer(id: string, updates: Partial<InsertPlayer>): Promise<Player | undefined> {
    const [player] = await db.update(players).set(updates).where(eq(players.id, id)).returning();
    return player || undefined;
  }

  async deletePlayer(id: string): Promise<boolean> {
    const result = await db.delete(players).where(eq(players.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getAllSessions(): Promise<Session[]> {
    return await db.select().from(sessions).orderBy(desc(sessions.date));
  }

  async getSession(id: string): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session || undefined;
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const [session] = await db.insert(sessions).values(insertSession).returning();
    return session;
  }

  async updateSession(id: string, updates: Partial<InsertSession>): Promise<Session | undefined> {
    const [session] = await db.update(sessions).set(updates).where(eq(sessions.id, id)).returning();
    return session || undefined;
  }

  async deleteSession(id: string): Promise<boolean> {
    const result = await db.delete(sessions).where(eq(sessions.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getRegistrationsBySession(sessionId: string): Promise<Registration[]> {
    return await db.select().from(registrations).where(eq(registrations.sessionId, sessionId));
  }

  async getRegistrationByPlayerAndSession(playerId: string, sessionId: string): Promise<Registration | undefined> {
    const [registration] = await db.select().from(registrations)
      .where(and(
        eq(registrations.playerId, playerId),
        eq(registrations.sessionId, sessionId)
      ));
    return registration || undefined;
  }

  async createRegistration(insertRegistration: InsertRegistration): Promise<Registration> {
    const [registration] = await db.insert(registrations).values(insertRegistration).returning();
    return registration;
  }

  async deleteRegistration(id: string): Promise<boolean> {
    const result = await db.delete(registrations).where(eq(registrations.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getMatchesBySession(sessionId: string): Promise<Match[]> {
    return await db.select().from(matches)
      .where(eq(matches.sessionId, sessionId))
      .orderBy(matches.roundNumber, matches.courtNumber);
  }

  async getMatchesByPlayer(playerId: string): Promise<Match[]> {
    const allMatches = await db.select().from(matches);
    return allMatches.filter(
      (match) =>
        match.team1Player1Id === playerId ||
        match.team1Player2Id === playerId ||
        match.team2Player1Id === playerId ||
        match.team2Player2Id === playerId
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getMatch(id: string): Promise<Match | undefined> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    return match || undefined;
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const [match] = await db.insert(matches).values(insertMatch).returning();
    return match;
  }

  async updateMatch(id: string, updates: Partial<InsertMatch>): Promise<Match | undefined> {
    const [match] = await db.update(matches).set(updates).where(eq(matches.id, id)).returning();
    return match || undefined;
  }

  async deleteMatchesBySession(sessionId: string): Promise<number> {
    const deleted = await db.delete(matches).where(eq(matches.sessionId, sessionId)).returning();
    return deleted.length;
  }

  async getRatingHistoriesByPlayer(playerId: string): Promise<RatingHistory[]> {
    return await db.select().from(ratingHistories)
      .where(eq(ratingHistories.playerId, playerId))
      .orderBy(desc(ratingHistories.createdAt));
  }

  async getRatingHistoriesByMatch(matchId: string): Promise<RatingHistory[]> {
    return await db.select().from(ratingHistories)
      .where(eq(ratingHistories.matchId, matchId));
  }

  async createRatingHistory(insertRatingHistory: InsertRatingHistory): Promise<RatingHistory> {
    const [ratingHistory] = await db.insert(ratingHistories).values(insertRatingHistory).returning();
    return ratingHistory;
  }

  async deleteRatingHistoriesByMatch(matchId: string): Promise<number> {
    const deleted = await db.delete(ratingHistories).where(eq(ratingHistories.matchId, matchId)).returning();
    return deleted.length;
  }
}

export const storage = new DatabaseStorage();

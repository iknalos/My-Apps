import { type User, type InsertUser, type Player, type InsertPlayer, type Session, type InsertSession, type Registration, type InsertRegistration, type Match, type InsertMatch } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllPlayers(): Promise<Player[]>;
  getPlayer(id: string): Promise<Player | undefined>;
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
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: string, match: Partial<InsertMatch>): Promise<Match | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private players: Map<string, Player>;
  private sessions: Map<string, Session>;
  private registrations: Map<string, Registration>;
  private matches: Map<string, Match>;

  constructor() {
    this.users = new Map();
    this.players = new Map();
    this.sessions = new Map();
    this.registrations = new Map();
    this.matches = new Map();
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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllPlayers(): Promise<Player[]> {
    return Array.from(this.players.values());
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = randomUUID();
    const player: Player = {
      id,
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

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const id = randomUUID();
    const match: Match = {
      id,
      sessionId: insertMatch.sessionId,
      courtNumber: insertMatch.courtNumber,
      roundNumber: insertMatch.roundNumber,
      team1Player1Id: insertMatch.team1Player1Id,
      team1Player2Id: insertMatch.team1Player2Id ?? null,
      team2Player1Id: insertMatch.team2Player1Id,
      team2Player2Id: insertMatch.team2Player2Id ?? null,
      team1Score: insertMatch.team1Score ?? null,
      team2Score: insertMatch.team2Score ?? null,
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
}

export const storage = new MemStorage();

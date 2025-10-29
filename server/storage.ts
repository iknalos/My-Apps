import { type User, type InsertUser, type Player, type InsertPlayer, type Session, type InsertSession, type Registration, type InsertRegistration } from "@shared/schema";
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private players: Map<string, Player>;
  private sessions: Map<string, Session>;
  private registrations: Map<string, Registration>;

  constructor() {
    this.users = new Map();
    this.players = new Map();
    this.sessions = new Map();
    this.registrations = new Map();
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
}

export const storage = new MemStorage();

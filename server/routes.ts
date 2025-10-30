import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPlayerSchema, insertSessionSchema, insertRegistrationSchema, insertUserSchema } from "@shared/schema";
import bcrypt from "bcrypt";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password } = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({ username, password: hashedPassword });
      
      req.session.userId = user.id;
      
      res.status(201).json({ id: user.id, username: user.username });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ error: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      req.session.userId = user.id;
      
      res.json({ id: user.id, username: user.username });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to log in" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      
      res.json({ id: user.id, username: user.username });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Player routes
  app.get("/api/players", async (req, res) => {
    try {
      const players = await storage.getAllPlayers();
      res.json(players);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch players" });
    }
  });

  app.get("/api/players/:id", async (req, res) => {
    try {
      const player = await storage.getPlayer(req.params.id);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      res.json(player);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch player" });
    }
  });

  app.get("/api/players/:id/rating-history", async (req, res) => {
    try {
      const ratingHistory = await storage.getRatingHistoriesByPlayer(req.params.id);
      res.json(ratingHistory);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rating history" });
    }
  });

  app.get("/api/players/:id/matches", async (req, res) => {
    try {
      const matches = await storage.getMatchesByPlayer(req.params.id);
      res.json(matches);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch player matches" });
    }
  });

  app.post("/api/players", async (req, res) => {
    try {
      const validatedData = insertPlayerSchema.parse(req.body);
      const player = await storage.createPlayer(validatedData);
      res.status(201).json(player);
    } catch (error) {
      console.error("Player creation error:", error);
      res.status(400).json({ error: "Invalid player data" });
    }
  });

  app.patch("/api/players/:id", async (req, res) => {
    try {
      const player = await storage.updatePlayer(req.params.id, req.body);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      res.json(player);
    } catch (error) {
      res.status(400).json({ error: "Failed to update player" });
    }
  });

  app.delete("/api/players/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePlayer(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Player not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete player" });
    }
  });

  // Session routes
  app.get("/api/sessions", async (req, res) => {
    try {
      const sessions = await storage.getAllSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  app.post("/api/sessions", async (req, res) => {
    try {
      // Convert date string to Date object
      const sessionData = {
        ...req.body,
        date: new Date(req.body.date),
      };
      
      const validatedData = insertSessionSchema.parse(sessionData);
      const session = await storage.createSession(validatedData);
      res.status(201).json(session);
    } catch (error) {
      console.error("Session creation error:", error);
      res.status(400).json({ error: "Invalid session data" });
    }
  });

  app.patch("/api/sessions/:id", async (req, res) => {
    try {
      // Convert date string to Date object if present
      const updates = req.body.date
        ? { ...req.body, date: new Date(req.body.date) }
        : req.body;
      
      const session = await storage.updateSession(req.params.id, updates);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Failed to update session" });
    }
  });

  app.delete("/api/sessions/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSession(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete session" });
    }
  });

  // Registration routes
  app.get("/api/sessions/:sessionId/registrations", async (req, res) => {
    try {
      const registrations = await storage.getRegistrationsBySession(req.params.sessionId);
      res.json(registrations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch registrations" });
    }
  });

  app.post("/api/sessions/:sessionId/registrations", async (req, res) => {
    try {
      const { playerId, selectedEvents } = req.body;
      
      // Check if player is already registered
      const existing = await storage.getRegistrationByPlayerAndSession(playerId, req.params.sessionId);
      if (existing) {
        return res.status(400).json({ error: "Player already registered" });
      }

      // Check session capacity
      const session = await storage.getSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const registrations = await storage.getRegistrationsBySession(req.params.sessionId);
      if (registrations.length >= session.capacity) {
        return res.status(400).json({ error: "Session is full" });
      }

      const registrationData = {
        sessionId: req.params.sessionId,
        playerId,
        selectedEvents,
      };

      const validatedData = insertRegistrationSchema.parse(registrationData);
      const registration = await storage.createRegistration(validatedData);
      res.status(201).json(registration);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ error: "Failed to register for session" });
    }
  });

  app.delete("/api/registrations/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteRegistration(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Registration not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete registration" });
    }
  });

  // Draw generation routes
  app.post("/api/sessions/:sessionId/draws", async (req, res) => {
    try {
      const session = await storage.getSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const registrations = await storage.getRegistrationsBySession(req.params.sessionId);
      if (registrations.length === 0) {
        return res.status(400).json({ error: "No registered players" });
      }

      // DELETE OLD MATCHES - Clear any existing draws for this session
      const deletedCount = await storage.deleteMatchesBySession(req.params.sessionId);
      console.log(`Deleted ${deletedCount} existing matches for session ${req.params.sessionId}`);

      // Get all players
      const players = await storage.getAllPlayers();
      const playerMap = new Map(players.map(p => [p.id, p]));

      // Import draw generation logic
      const { generateDraws } = await import("./drawGenerator");
      const matches = generateDraws(session, registrations, playerMap);

      // Save matches to storage
      for (const match of matches) {
        await storage.createMatch(match);
      }

      res.status(201).json({ 
        message: "Draws generated successfully",
        matchCount: matches.length,
        matches
      });
    } catch (error) {
      console.error("Draw generation error:", error);
      res.status(500).json({ error: "Failed to generate draws" });
    }
  });

  app.get("/api/sessions/:sessionId/matches", async (req, res) => {
    try {
      const matches = await storage.getMatchesBySession(req.params.sessionId);
      res.json(matches);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch matches" });
    }
  });

  app.patch("/api/matches/:id", async (req, res) => {
    try {
      const { team1Set1, team1Set2, team1Set3, team2Set1, team2Set2, team2Set3, status } = req.body;
      
      // Get the existing match to check if it was already completed
      const existingMatch = await storage.getMatch(req.params.id);
      if (!existingMatch) {
        return res.status(404).json({ error: "Match not found" });
      }
      
      const wasCompleted = existingMatch.status === "completed";
      
      const updates = {
        team1Set1: team1Set1 ?? undefined,
        team1Set2: team1Set2 ?? undefined,
        team1Set3: team1Set3 ?? undefined,
        team2Set1: team2Set1 ?? undefined,
        team2Set2: team2Set2 ?? undefined,
        team2Set3: team2Set3 ?? undefined,
        status: status ?? undefined,
      };
      
      const match = await storage.updateMatch(req.params.id, updates);
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }
      
      // Trigger rating updates if match is completed and has scores
      // Also recalculate if match was already completed and scores changed (editing scores)
      const isCompleted = match.status === "completed";
      const hasScores = match.team1Set1 !== null && match.team2Set1 !== null;
      
      if (isCompleted && hasScores) {
        try {
          const { applyMatchRatingChanges } = await import("./ratingSystem");
          await applyMatchRatingChanges(match.id);
        } catch (ratingError) {
          console.error("Rating update error:", ratingError);
          // Don't fail the entire request if rating update fails
        }
      }
      
      res.json(match);
    } catch (error) {
      console.error("Match update error:", error);
      res.status(500).json({ error: "Failed to update match" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

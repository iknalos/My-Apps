import type { Player, Match, InsertRatingHistory } from "@shared/schema";
import { storage } from "./storage";

// ELO-style rating system for badminton
// Based on expected outcome vs actual outcome

interface RatingUpdate {
  playerId: string;
  eventType: string;
  oldRating: number;
  newRating: number;
  ratingChange: number;
  opponentIds: string[];
  result: "win" | "loss";
  expectedOutcome: "win" | "loss" | "even";
}

/**
 * Calculate expected win probability based on rating difference
 * Uses standard ELO formula: E_A = 1 / (1 + 10^((R_B - R_A) / 400))
 */
function calculateExpectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Calculate rating change using modified ELO system
 * K-factor varies based on rating:
 * - 40 for players below 1500 (faster movement for new/lower-rated players)
 * - 32 for players 1500-1800
 * - 24 for players above 1800 (slower movement for established players)
 */
function getKFactor(rating: number): number {
  if (rating < 1500) return 40;
  if (rating < 1800) return 32;
  return 24;
}

/**
 * Normalize event type to handle both formats
 */
function normalizeEventType(eventType: string): string {
  return eventType.toLowerCase().replace(/['\s]/g, '');
}

/**
 * Get player's rating for a specific event type
 */
function getPlayerRating(player: Player, eventType: string): number {
  const normalized = normalizeEventType(eventType);
  
  switch (normalized) {
    case "singles":
      return player.singlesRating || 1500;
    case "mensdoubles":
      return player.mensDoublesRating || 1500;
    case "womensdoubles":
      return player.womensDoublesRating || 1500;
    case "mixeddoubles":
      return player.mixedDoublesRating || 1500;
    default:
      return 1500;
  }
}

/**
 * Update player's rating for a specific event type
 */
async function updatePlayerRating(playerId: string, eventType: string, newRating: number): Promise<void> {
  const normalized = normalizeEventType(eventType);
  const updates: Partial<Player> = {};
  
  switch (normalized) {
    case "singles":
      updates.singlesRating = newRating;
      break;
    case "mensdoubles":
      updates.mensDoublesRating = newRating;
      break;
    case "womensdoubles":
      updates.womensDoublesRating = newRating;
      break;
    case "mixeddoubles":
      updates.mixedDoublesRating = newRating;
      break;
  }
  
  await storage.updatePlayer(playerId, updates);
}

/**
 * Calculate rating changes for all players in a match
 * Returns array of rating updates to be saved
 */
export async function calculateMatchRatingChanges(match: Match): Promise<RatingUpdate[]> {
  // Check if match is completed
  if (match.status !== "completed") {
    return [];
  }
  
  // Check if match has scores
  if (match.team1Set1 === null || match.team2Set1 === null) {
    return [];
  }
  
  // Get all players
  const playerIds = [
    match.team1Player1Id,
    match.team1Player2Id,
    match.team2Player1Id,
    match.team2Player2Id,
  ].filter(id => id !== null) as string[];
  
  const players = await Promise.all(
    playerIds.map(id => storage.getPlayer(id))
  );
  
  const playerMap = new Map<string, Player>();
  players.forEach(p => {
    if (p) playerMap.set(p.id, p);
  });
  
  // Calculate team ratings (average for doubles, direct for singles)
  const team1Player1 = playerMap.get(match.team1Player1Id);
  const team1Player2 = match.team1Player2Id ? playerMap.get(match.team1Player2Id) : null;
  const team2Player1 = playerMap.get(match.team2Player1Id);
  const team2Player2 = match.team2Player2Id ? playerMap.get(match.team2Player2Id) : null;
  
  if (!team1Player1 || !team2Player1) {
    return [];
  }
  
  const team1Player1Rating = getPlayerRating(team1Player1, match.eventType);
  const team1Player2Rating = team1Player2 ? getPlayerRating(team1Player2, match.eventType) : 0;
  const team2Player1Rating = getPlayerRating(team2Player1, match.eventType);
  const team2Player2Rating = team2Player2 ? getPlayerRating(team2Player2, match.eventType) : 0;
  
  const team1Rating = team1Player2
    ? (team1Player1Rating + team1Player2Rating) / 2
    : team1Player1Rating;
  const team2Rating = team2Player2
    ? (team2Player1Rating + team2Player2Rating) / 2
    : team2Player1Rating;
  
  // Determine winner
  const team1Sets = [match.team1Set1, match.team1Set2, match.team1Set3].filter(s => s !== null);
  const team2Sets = [match.team2Set1, match.team2Set2, match.team2Set3].filter(s => s !== null);
  
  let team1SetsWon = 0;
  let team2SetsWon = 0;
  
  for (let i = 0; i < Math.min(team1Sets.length, team2Sets.length); i++) {
    if (team1Sets[i]! > team2Sets[i]!) team1SetsWon++;
    else team2SetsWon++;
  }
  
  const team1Won = team1SetsWon > team2SetsWon;
  
  // Calculate expected outcomes
  const team1ExpectedScore = calculateExpectedScore(team1Rating, team2Rating);
  const team2ExpectedScore = 1 - team1ExpectedScore;
  
  const team1ExpectedOutcome = team1ExpectedScore > 0.6 ? "win" : team1ExpectedScore < 0.4 ? "loss" : "even";
  const team2ExpectedOutcome = team2ExpectedScore > 0.6 ? "win" : team2ExpectedScore < 0.4 ? "loss" : "even";
  
  // Calculate rating changes
  const updates: RatingUpdate[] = [];
  
  // Team 1 players
  const team1ActualScore = team1Won ? 1 : 0;
  const team1Players = [
    { id: match.team1Player1Id, player: team1Player1, rating: team1Player1Rating },
    ...(team1Player2 ? [{ id: match.team1Player2Id!, player: team1Player2, rating: team1Player2Rating }] : [])
  ];
  
  for (const { id, player, rating } of team1Players) {
    const kFactor = getKFactor(rating);
    const ratingChange = Math.round(kFactor * (team1ActualScore - team1ExpectedScore));
    const newRating = Math.max(1000, Math.min(2000, rating + ratingChange)); // Clamp between 1000-2000
    
    updates.push({
      playerId: id,
      eventType: match.eventType,
      oldRating: rating,
      newRating,
      ratingChange,
      opponentIds: [match.team2Player1Id, match.team2Player2Id].filter(id => id !== null) as string[],
      result: team1Won ? "win" : "loss",
      expectedOutcome: team1ExpectedOutcome,
    });
  }
  
  // Team 2 players
  const team2ActualScore = team1Won ? 0 : 1;
  const team2Players = [
    { id: match.team2Player1Id, player: team2Player1, rating: team2Player1Rating },
    ...(team2Player2 ? [{ id: match.team2Player2Id!, player: team2Player2, rating: team2Player2Rating }] : [])
  ];
  
  for (const { id, player, rating } of team2Players) {
    const kFactor = getKFactor(rating);
    const ratingChange = Math.round(kFactor * (team2ActualScore - team2ExpectedScore));
    const newRating = Math.max(1000, Math.min(2000, rating + ratingChange)); // Clamp between 1000-2000
    
    updates.push({
      playerId: id,
      eventType: match.eventType,
      oldRating: rating,
      newRating,
      ratingChange,
      opponentIds: [match.team1Player1Id, match.team1Player2Id].filter(id => id !== null) as string[],
      result: team1Won ? "loss" : "win",
      expectedOutcome: team2ExpectedOutcome,
    });
  }
  
  return updates;
}

/**
 * Rollback previous rating changes for a match
 * This allows us to recalculate ratings when scores are edited
 */
async function rollbackMatchRatings(matchId: string): Promise<void> {
  // Get all rating histories for this match
  const matchHistories = await storage.getRatingHistoriesByMatch(matchId);
  
  // Restore old ratings for all affected players
  for (const history of matchHistories) {
    await updatePlayerRating(history.playerId, history.eventType, history.oldRating);
  }
  
  // Delete the old history entries
  await storage.deleteRatingHistoriesByMatch(matchId);
}

/**
 * Apply rating changes after a match is completed
 * This is the main function to call when match scores are entered
 * IDEMPOTENT: Can be called multiple times for the same match (e.g., when scores are edited)
 */
export async function applyMatchRatingChanges(matchId: string): Promise<void> {
  const match = await storage.updateMatch(matchId, { status: "completed" });
  if (!match) {
    throw new Error("Match not found");
  }
  
  // Check if rating changes already exist for this match
  const existingHistories = await storage.getRatingHistoriesByMatch(matchId);
  
  // If histories exist, roll back the previous rating changes first
  // This ensures idempotency - editing scores multiple times produces the same result
  if (existingHistories.length > 0) {
    await rollbackMatchRatings(matchId);
  }
  
  const ratingUpdates = await calculateMatchRatingChanges(match);
  
  // Update player ratings and create history entries
  for (const update of ratingUpdates) {
    await updatePlayerRating(update.playerId, update.eventType, update.newRating);
    
    const historyEntry: InsertRatingHistory = {
      playerId: update.playerId,
      eventType: update.eventType,
      oldRating: update.oldRating,
      newRating: update.newRating,
      ratingChange: update.ratingChange,
      matchId: match.id,
      opponentIds: update.opponentIds,
      result: update.result,
      expectedOutcome: update.expectedOutcome,
    };
    
    await storage.createRatingHistory(historyEntry);
  }
}

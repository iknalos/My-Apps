import type { Session, Registration, Player, InsertMatch } from "@shared/schema";

interface PlayerWithRating {
  id: string;
  rating: number;
  gender: string;
}

export function generateDraws(
  session: Session,
  registrations: Registration[],
  playerMap: Map<string, Player>
): InsertMatch[] {
  const matches: InsertMatch[] = [];
  
  // Group players by event type
  const eventGroups = new Map<string, string[]>();
  
  for (const reg of registrations) {
    for (const eventType of reg.selectedEvents) {
      if (!eventGroups.has(eventType)) {
        eventGroups.set(eventType, []);
      }
      eventGroups.get(eventType)!.push(reg.playerId);
    }
  }

  // Generate matches for each event type
  for (const [eventType, playerIds] of Array.from(eventGroups.entries())) {
    const eventMatches = generateEventMatches(
      session,
      eventType,
      playerIds,
      playerMap
    );
    matches.push(...eventMatches);
  }

  // Assign courts to matches
  assignCourts(matches, session.courtsAvailable);

  return matches;
}

function generateEventMatches(
  session: Session,
  eventType: string,
  playerIds: string[],
  playerMap: Map<string, Player>
): InsertMatch[] {
  const matches: InsertMatch[] = [];
  const isDoubles = eventType.includes("Doubles");

  if (isDoubles) {
    matches.push(...generateDoublesMatches(session, eventType, playerIds, playerMap));
  } else {
    matches.push(...generateSinglesMatches(session, eventType, playerIds, playerMap));
  }

  return matches;
}

function generateSinglesMatches(
  session: Session,
  eventType: string,
  playerIds: string[],
  playerMap: Map<string, Player>
): InsertMatch[] {
  const matches: InsertMatch[] = [];
  
  // Get player ratings
  const playersWithRatings = playerIds.map(id => {
    const player = playerMap.get(id)!;
    return {
      id,
      rating: player.singlesRating || 1500,
      gender: player.gender
    };
  }).sort((a, b) => b.rating - a.rating);

  // Generate matches for each round
  for (let round = 1; round <= session.numberOfRounds; round++) {
    const roundMatches = createSinglesRoundMatches(
      session.id,
      round,
      playersWithRatings,
      eventType
    );
    matches.push(...roundMatches);
  }

  return matches;
}

function createSinglesRoundMatches(
  sessionId: string,
  roundNumber: number,
  players: PlayerWithRating[],
  eventType: string
): InsertMatch[] {
  const matches: InsertMatch[] = [];
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < shuffled.length - 1; i += 2) {
    matches.push({
      sessionId,
      courtNumber: 0,
      roundNumber,
      team1Player1Id: shuffled[i].id,
      team1Player2Id: null,
      team2Player1Id: shuffled[i + 1].id,
      team2Player2Id: null,
      team1Score: null,
      team2Score: null,
      status: "scheduled",
    });
  }

  return matches;
}

function generateDoublesMatches(
  session: Session,
  eventType: string,
  playerIds: string[],
  playerMap: Map<string, Player>
): InsertMatch[] {
  const matches: InsertMatch[] = [];
  
  // Get player ratings for the specific event type
  const playersWithRatings = playerIds.map(id => {
    const player = playerMap.get(id)!;
    let rating = 1500;
    
    if (eventType === "Men's Doubles") {
      rating = player.mensDoublesRating || 1500;
    } else if (eventType === "Women's Doubles") {
      rating = player.womensDoublesRating || 1500;
    } else if (eventType === "Mixed Doubles") {
      rating = player.mixedDoublesRating || 1500;
    }
    
    return {
      id,
      rating,
      gender: player.gender
    };
  }).sort((a, b) => b.rating - a.rating);

  // Need at least 4 players for doubles
  if (playersWithRatings.length < 4) {
    return matches;
  }

  // Generate matches for each round
  for (let round = 1; round <= session.numberOfRounds; round++) {
    const roundMatches = createDoublesRoundMatches(
      session.id,
      round,
      playersWithRatings,
      eventType
    );
    matches.push(...roundMatches);
  }

  return matches;
}

function createDoublesRoundMatches(
  sessionId: string,
  roundNumber: number,
  players: PlayerWithRating[],
  eventType: string
): InsertMatch[] {
  const matches: InsertMatch[] = [];

  if (eventType === "Mixed Doubles") {
    return createMixedDoublesMatches(sessionId, roundNumber, players);
  }

  // For Men's/Women's Doubles, create balanced teams
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < shuffled.length - 3; i += 4) {
    matches.push({
      sessionId,
      courtNumber: 0,
      roundNumber,
      team1Player1Id: shuffled[i].id,
      team1Player2Id: shuffled[i + 1].id,
      team2Player1Id: shuffled[i + 2].id,
      team2Player2Id: shuffled[i + 3].id,
      team1Score: null,
      team2Score: null,
      status: "scheduled",
    });
  }

  return matches;
}

function createMixedDoublesMatches(
  sessionId: string,
  roundNumber: number,
  players: PlayerWithRating[]
): InsertMatch[] {
  const matches: InsertMatch[] = [];
  
  // Separate by gender
  const males = players.filter(p => p.gender === "Male");
  const females = players.filter(p => p.gender === "Female");
  
  // Need at least 2 males and 2 females
  if (males.length < 2 || females.length < 2) {
    return matches;
  }

  // Shuffle for variety
  const shuffledMales = [...males].sort(() => Math.random() - 0.5);
  const shuffledFemales = [...females].sort(() => Math.random() - 0.5);
  
  const pairsCount = Math.min(shuffledMales.length, shuffledFemales.length);
  const matchCount = Math.floor(pairsCount / 2);
  
  for (let i = 0; i < matchCount; i++) {
    const idx = i * 2;
    matches.push({
      sessionId,
      courtNumber: 0,
      roundNumber,
      team1Player1Id: shuffledMales[idx].id,
      team1Player2Id: shuffledFemales[idx].id,
      team2Player1Id: shuffledMales[idx + 1].id,
      team2Player2Id: shuffledFemales[idx + 1].id,
      team1Score: null,
      team2Score: null,
      status: "scheduled",
    });
  }

  return matches;
}

function assignCourts(matches: InsertMatch[], courtsAvailable: number): void {
  // Group matches by round
  const roundGroups = new Map<number, InsertMatch[]>();
  
  for (const match of matches) {
    if (!roundGroups.has(match.roundNumber)) {
      roundGroups.set(match.roundNumber, []);
    }
    roundGroups.get(match.roundNumber)!.push(match);
  }

  // Assign courts for each round
  for (const [round, roundMatches] of Array.from(roundGroups.entries())) {
    roundMatches.forEach((match: InsertMatch, index: number) => {
      match.courtNumber = (index % courtsAvailable) + 1;
    });
  }
}

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
  
  // Get player ratings and create stable sorted list
  const playersWithRatings = playerIds.map(id => {
    const player = playerMap.get(id)!;
    return {
      id,
      rating: player.singlesRating || 1500,
      gender: player.gender
    };
  }).sort((a, b) => b.rating - a.rating);

  const n = playersWithRatings.length;
  const isOddCount = n % 2 === 1;

  // Generate matches for each round with proper bye rotation
  for (let round = 1; round <= session.numberOfRounds; round++) {
    // Calculate which player gets bye this round (if odd number)
    // Rotate through all players: round 1 -> player 0 sits, round 2 -> player 1 sits, etc.
    let playersThisRound = playersWithRatings;
    if (isOddCount) {
      const byePlayerIndex = (round - 1) % n;
      playersThisRound = playersWithRatings.filter((_, idx) => idx !== byePlayerIndex);
    }
    
    const roundMatches = createSinglesRoundMatches(
      session.id,
      round,
      playersThisRound,
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
  
  // Use round-robin rotation for opponent variety
  // Circle method: fix one player, rotate others
  const pairings = generateRoundRobinPairings(players, roundNumber);
  
  for (const pairing of pairings) {
    matches.push({
      sessionId,
      courtNumber: 0,
      roundNumber,
      team1Player1Id: pairing[0].id,
      team1Player2Id: null,
      team2Player1Id: pairing[1].id,
      team2Player2Id: null,
      team1Score: null,
      team2Score: null,
      status: "scheduled",
    });
  }

  return matches;
}

function generateRoundRobinPairings(
  players: PlayerWithRating[],
  roundNumber: number
): Array<[PlayerWithRating, PlayerWithRating]> {
  const pairings: Array<[PlayerWithRating, PlayerWithRating]> = [];
  const n = players.length;
  
  if (n < 2) return pairings;
  
  // Circle/round-robin algorithm for opponent variety
  // Create rotation array: fix first player, rotate others
  const rotation = [...players];
  
  // Rotate based on round number (skip round 1 for natural pairing)
  const rotations = (roundNumber - 1) % (n - 1);
  for (let r = 0; r < rotations; r++) {
    // Rotate all except first element
    const temp = rotation[n - 1];
    for (let i = n - 1; i > 1; i--) {
      rotation[i] = rotation[i - 1];
    }
    rotation[1] = temp;
  }
  
  // Pair players: first with last, second with second-last, etc.
  const half = Math.floor(n / 2);
  for (let i = 0; i < half; i++) {
    pairings.push([rotation[i], rotation[n - 1 - i]]);
  }
  
  return pairings;
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

  // Create balanced partnerships once (these stay consistent across rounds)
  const partnerships = createBalancedPartnerships(playersWithRatings, eventType);
  const partnershipCount = partnerships.length;
  const isOddPartnershipCount = partnershipCount % 2 === 1;

  // Generate matches for each round with bye rotation
  for (let round = 1; round <= session.numberOfRounds; round++) {
    // Rotate which partnership gets bye (if odd number)
    let partnershipsThisRound = partnerships;
    if (isOddPartnershipCount) {
      const byePartnershipIndex = (round - 1) % partnershipCount;
      partnershipsThisRound = partnerships.filter((_, idx) => idx !== byePartnershipIndex);
    }
    
    const roundMatches = createDoublesRoundMatches(
      session.id,
      round,
      partnershipsThisRound,
      eventType
    );
    matches.push(...roundMatches);
  }

  return matches;
}

function createBalancedPartnerships(
  players: PlayerWithRating[],
  eventType: string
): Array<{ players: [PlayerWithRating, PlayerWithRating]; totalRating: number; }> | Array<{ male: PlayerWithRating; female: PlayerWithRating; totalRating: number; }> {
  if (eventType === "Mixed Doubles") {
    return createMixedPartnerships(players);
  }
  
  // For Men's/Women's Doubles, create balanced partnerships
  const partnerships: Array<{
    players: [PlayerWithRating, PlayerWithRating];
    totalRating: number;
  }> = [];
  
  const n = players.length;
  const half = Math.floor(n / 2);
  
  // Snake draft: pair high with low
  for (let i = 0; i < half; i++) {
    const p1 = players[i];
    const p2 = players[n - 1 - i];
    partnerships.push({
      players: [p1, p2],
      totalRating: p1.rating + p2.rating
    });
  }
  
  // Sort by total rating for balanced matching
  partnerships.sort((a, b) => b.totalRating - a.totalRating);
  
  return partnerships;
}

function createMixedPartnerships(
  players: PlayerWithRating[]
): Array<{ male: PlayerWithRating; female: PlayerWithRating; totalRating: number; }> {
  const males = players.filter(p => p.gender === "Male").sort((a, b) => b.rating - a.rating);
  const females = players.filter(p => p.gender === "Female").sort((a, b) => b.rating - a.rating);
  
  const partnerships: Array<{
    male: PlayerWithRating;
    female: PlayerWithRating;
    totalRating: number;
  }> = [];
  
  const pairCount = Math.min(males.length, females.length);
  
  for (let i = 0; i < pairCount; i++) {
    partnerships.push({
      male: males[i],
      female: females[i],
      totalRating: males[i].rating + females[i].rating
    });
  }
  
  // Sort by total rating for balanced matching
  partnerships.sort((a, b) => b.totalRating - a.totalRating);
  
  return partnerships;
}

function createDoublesRoundMatches(
  sessionId: string,
  roundNumber: number,
  partnerships: Array<any>,
  eventType: string
): InsertMatch[] {
  const matches: InsertMatch[] = [];

  if (partnerships.length < 2) return matches;

  // Apply round-robin rotation to partnerships for opponent variety
  const rotatedPartnerships = rotatePartnerships(partnerships, roundNumber);

  // Match adjacent partnerships after rotation
  for (let i = 0; i < rotatedPartnerships.length - 1; i += 2) {
    if (eventType === "Mixed Doubles") {
      // Mixed doubles partnerships have male/female properties
      matches.push({
        sessionId,
        courtNumber: 0,
        roundNumber,
        team1Player1Id: rotatedPartnerships[i].male.id,
        team1Player2Id: rotatedPartnerships[i].female.id,
        team2Player1Id: rotatedPartnerships[i + 1].male.id,
        team2Player2Id: rotatedPartnerships[i + 1].female.id,
        team1Score: null,
        team2Score: null,
        status: "scheduled",
      });
    } else {
      // Men's/Women's doubles have players array property
      const team1 = rotatedPartnerships[i].players;
      const team2 = rotatedPartnerships[i + 1].players;
      
      matches.push({
        sessionId,
        courtNumber: 0,
        roundNumber,
        team1Player1Id: team1[0].id,
        team1Player2Id: team1[1].id,
        team2Player1Id: team2[0].id,
        team2Player2Id: team2[1].id,
        team1Score: null,
        team2Score: null,
        status: "scheduled",
      });
    }
  }

  return matches;
}

function rotatePartnerships(partnerships: Array<any>, roundNumber: number): Array<any> {
  const n = partnerships.length;
  if (n < 2) return partnerships;
  
  // Circle/round-robin rotation for doubles
  // Fix first partnership, rotate others
  const rotation = [...partnerships];
  const rotations = (roundNumber - 1) % (n - 1);
  
  for (let r = 0; r < rotations; r++) {
    const temp = rotation[n - 1];
    for (let i = n - 1; i > 1; i--) {
      rotation[i] = rotation[i - 1];
    }
    rotation[1] = temp;
  }
  
  return rotation;
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

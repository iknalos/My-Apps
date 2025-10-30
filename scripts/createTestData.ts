const BASE_URL = 'http://localhost:5000';

interface Player {
  name: string;
  gender: 'Male' | 'Female';
  mensDoublesRating: number;
  mixedDoublesRating: number;
}

async function createPlayer(player: Player) {
  const response = await fetch(`${BASE_URL}/api/players`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(player),
  });
  return response.json();
}

async function createSession(session: any) {
  const response = await fetch(`${BASE_URL}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(session),
  });
  return response.json();
}

async function registerPlayer(sessionId: string, playerId: string, selectedEvents: string[]) {
  const response = await fetch(`${BASE_URL}/api/sessions/${sessionId}/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId, selectedEvents }),
  });
  return response.json();
}

async function main() {
  console.log('🏸 Creating BadmintonPro test data...\n');

  // Create 8 male players
  const malePlayers = [
    { name: 'John Smith', gender: 'Male' as const, mensDoublesRating: 1800, mixedDoublesRating: 1750 },
    { name: 'Mike Johnson', gender: 'Male' as const, mensDoublesRating: 1700, mixedDoublesRating: 1650 },
    { name: 'David Lee', gender: 'Male' as const, mensDoublesRating: 1600, mixedDoublesRating: 1550 },
    { name: 'Chris Wong', gender: 'Male' as const, mensDoublesRating: 1500, mixedDoublesRating: 1450 },
    { name: 'Tom Anderson', gender: 'Male' as const, mensDoublesRating: 1750, mixedDoublesRating: 1700 },
    { name: 'James Chen', gender: 'Male' as const, mensDoublesRating: 1650, mixedDoublesRating: 1600 },
    { name: 'Robert Kim', gender: 'Male' as const, mensDoublesRating: 1550, mixedDoublesRating: 1500 },
    { name: 'Alex Martinez', gender: 'Male' as const, mensDoublesRating: 1450, mixedDoublesRating: 1400 },
  ];

  // Create 4 female players
  const femalePlayers = [
    { name: 'Sarah Williams', gender: 'Female' as const, mensDoublesRating: 0, mixedDoublesRating: 1700 },
    { name: 'Emma Davis', gender: 'Female' as const, mensDoublesRating: 0, mixedDoublesRating: 1600 },
    { name: 'Lisa Zhang', gender: 'Female' as const, mensDoublesRating: 0, mixedDoublesRating: 1550 },
    { name: 'Maria Garcia', gender: 'Female' as const, mensDoublesRating: 0, mixedDoublesRating: 1500 },
  ];

  console.log('Creating 12 players...');
  const createdMales = await Promise.all(malePlayers.map(p => createPlayer(p)));
  const createdFemales = await Promise.all(femalePlayers.map(p => createPlayer(p)));
  console.log(`✅ Created ${createdMales.length} male players`);
  console.log(`✅ Created ${createdFemales.length} female players\n`);

  // Create session with Men's Doubles and Mixed Doubles
  console.log('Creating session...');
  const session = await createSession({
    name: 'Test Doubles Session',
    date: new Date('2025-11-01T14:00:00').toISOString(),
    capacity: 12,
    numberOfRounds: 3,
    courtsAvailable: 3,
    sessionTypes: ['mensDoubles', 'mixedDoubles'],
    status: 'upcoming',
  });
  console.log(`✅ Created session: ${session.name} (ID: ${session.id})\n`);

  // Register players
  console.log('Registering players...');
  
  // First 4 males: Men's Doubles only
  for (let i = 0; i < 4; i++) {
    await registerPlayer(session.id, createdMales[i].id, ['mensDoubles']);
    console.log(`✅ ${createdMales[i].name} → Men's Doubles only`);
  }
  
  // Next 4 males: Both Men's and Mixed Doubles
  for (let i = 4; i < 8; i++) {
    await registerPlayer(session.id, createdMales[i].id, ['mensDoubles', 'mixedDoubles']);
    console.log(`✅ ${createdMales[i].name} → Men's & Mixed Doubles`);
  }
  
  // All 4 females: Mixed Doubles only
  for (let i = 0; i < 4; i++) {
    await registerPlayer(session.id, createdFemales[i].id, ['mixedDoubles']);
    console.log(`✅ ${createdFemales[i].name} → Mixed Doubles only`);
  }

  console.log('\n🎉 Test data created successfully!');
  console.log(`\n📊 Summary:`);
  console.log(`   - 12 players created (8 male, 4 female)`);
  console.log(`   - Session: "${session.name}"`);
  console.log(`   - Registrations: 12/12 players`);
  console.log(`   - Men's Doubles: 8 players`);
  console.log(`   - Mixed Doubles: 8 players (4 male + 4 female)`);
  console.log(`\n👉 Visit http://localhost:5000/sessions to view the session`);
}

main().catch(console.error);

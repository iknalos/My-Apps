import { neon } from '@neondatabase/serverless';

async function migrateToProduction() {
  console.log('🔄 Starting migration from development to production...\n');

  const devDbUrl = process.env.DATABASE_URL;
  if (!devDbUrl) {
    throw new Error('DATABASE_URL not found');
  }

  const prodDbUrl = process.env.PROD_DATABASE_URL;
  if (!prodDbUrl) {
    throw new Error('PROD_DATABASE_URL not found. Please set this environment variable to your production database URL.');
  }

  const devDb = neon(devDbUrl);
  const prodDb = neon(prodDbUrl);

  try {
    console.log('📊 Fetching data from DEVELOPMENT database...');
    
    const [devUsers, devPlayers, devSessions, devRegistrations, devMatches, devRatingHistories] = await Promise.all([
      devDb('SELECT * FROM users ORDER BY username'),
      devDb('SELECT * FROM players ORDER BY name'),
      devDb('SELECT * FROM sessions ORDER BY date'),
      devDb('SELECT * FROM registrations ORDER BY session_id'),
      devDb('SELECT * FROM matches ORDER BY session_id, round_number'),
      devDb('SELECT * FROM rating_histories ORDER BY player_id, created_at')
    ]);

    console.log(`\n✅ Found in DEVELOPMENT:`);
    console.log(`   - ${devUsers.length} users`);
    console.log(`   - ${devPlayers.length} players`);
    console.log(`   - ${devSessions.length} sessions`);
    console.log(`   - ${devRegistrations.length} registrations`);
    console.log(`   - ${devMatches.length} matches`);
    console.log(`   - ${devRatingHistories.length} rating history entries`);

    console.log('\n📊 Checking PRODUCTION database...');
    
    const [prodUsers, prodPlayers, prodSessions] = await Promise.all([
      prodDb('SELECT id FROM users'),
      prodDb('SELECT id FROM players'),
      prodDb('SELECT id FROM sessions')
    ]);

    console.log(`\n📍 Found in PRODUCTION:`);
    console.log(`   - ${prodUsers.length} users`);
    console.log(`   - ${prodPlayers.length} players`);
    console.log(`   - ${prodSessions.length} sessions`);

    const existingUserIds = new Set(prodUsers.map((u: any) => u.id));
    const existingPlayerIds = new Set(prodPlayers.map((p: any) => p.id));
    const existingSessionIds = new Set(prodSessions.map((s: any) => s.id));

    let usersInserted = 0;
    let playersInserted = 0;
    let sessionsInserted = 0;
    let registrationsInserted = 0;
    let matchesInserted = 0;
    let ratingHistoriesInserted = 0;

    console.log('\n🔄 Migrating USERS...');
    for (const user of devUsers) {
      if (!existingUserIds.has(user.id)) {
        await prodDb(
          'INSERT INTO users (id, username, password, role) VALUES ($1, $2, $3, $4)',
          [user.id, user.username, user.password, user.role]
        );
        usersInserted++;
        console.log(`   ✓ Inserted user: ${user.username} (${user.role})`);
      } else {
        console.log(`   ⏭️  Skipped user: ${user.username} (already exists)`);
      }
    }

    console.log('\n🔄 Migrating PLAYERS...');
    for (const player of devPlayers) {
      if (!existingPlayerIds.has(player.id)) {
        await prodDb(
          `INSERT INTO players (id, name, gender, club, singles_rating, mens_doubles_rating, 
           womens_doubles_rating, mixed_doubles_rating, preferred_categories, notes, user_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            player.id, player.name, player.gender, player.club,
            player.singles_rating, player.mens_doubles_rating,
            player.womens_doubles_rating, player.mixed_doubles_rating,
            player.preferred_categories, player.notes, player.user_id
          ]
        );
        playersInserted++;
        console.log(`   ✓ Inserted player: ${player.name}`);
      } else {
        console.log(`   ⏭️  Skipped player: ${player.name} (already exists)`);
      }
    }

    console.log('\n🔄 Migrating SESSIONS...');
    for (const session of devSessions) {
      if (!existingSessionIds.has(session.id)) {
        await prodDb(
          `INSERT INTO sessions (id, name, date, capacity, courts_available, number_of_rounds, session_types, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            session.id, session.name, session.date, session.capacity,
            session.courts_available, session.number_of_rounds, session.session_types, session.status
          ]
        );
        sessionsInserted++;
        console.log(`   ✓ Inserted session: ${session.name}`);
      } else {
        console.log(`   ⏭️  Skipped session: ${session.name} (already exists)`);
      }
    }

    console.log('\n🔄 Migrating REGISTRATIONS...');
    // Re-fetch production data after insertions
    const [updatedProdSessions, updatedProdPlayers, prodRegistrations] = await Promise.all([
      prodDb('SELECT id FROM sessions'),
      prodDb('SELECT id FROM players'),
      prodDb('SELECT id FROM registrations')
    ]);
    const updatedSessionIds = new Set(updatedProdSessions.map((s: any) => s.id));
    const updatedPlayerIds = new Set(updatedProdPlayers.map((p: any) => p.id));
    const existingRegistrationIds = new Set(prodRegistrations.map((r: any) => r.id));
    
    for (const reg of devRegistrations) {
      if (!existingRegistrationIds.has(reg.id) && updatedSessionIds.has(reg.session_id) && updatedPlayerIds.has(reg.player_id)) {
        await prodDb(
          'INSERT INTO registrations (id, session_id, player_id, selected_events) VALUES ($1, $2, $3, $4)',
          [reg.id, reg.session_id, reg.player_id, reg.selected_events]
        );
        registrationsInserted++;
      }
    }
    console.log(`   ✓ Inserted ${registrationsInserted} registrations`);

    console.log('\n🔄 Migrating MATCHES...');
    const prodMatches = await prodDb('SELECT id FROM matches');
    const existingMatchIds = new Set(prodMatches.map((m: any) => m.id));
    
    for (const match of devMatches) {
      if (!existingMatchIds.has(match.id) && updatedSessionIds.has(match.session_id)) {
        await prodDb(
          `INSERT INTO matches (id, session_id, round_number, court_number, event_type, 
           team1_player1_id, team1_player2_id, team2_player1_id, team2_player2_id,
           team1_set1, team1_set2, team1_set3, team2_set1, team2_set2, team2_set3, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
          [
            match.id, match.session_id, match.round_number, match.court_number, match.event_type,
            match.team1_player1_id, match.team1_player2_id, match.team2_player1_id, match.team2_player2_id,
            match.team1_set1, match.team1_set2, match.team1_set3,
            match.team2_set1, match.team2_set2, match.team2_set3, match.status
          ]
        );
        matchesInserted++;
      }
    }
    console.log(`   ✓ Inserted ${matchesInserted} matches`);

    console.log('\n🔄 Migrating RATING HISTORIES...');
    const prodRatingHistories = await prodDb('SELECT id FROM rating_histories');
    const existingRatingHistoryIds = new Set(prodRatingHistories.map((r: any) => r.id));
    
    for (const history of devRatingHistories) {
      if (!existingRatingHistoryIds.has(history.id) && updatedPlayerIds.has(history.player_id)) {
        await prodDb(
          `INSERT INTO rating_histories (id, player_id, event_type, old_rating, new_rating,
           rating_change, match_id, opponent_ids, result, expected_outcome)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            history.id, history.player_id, history.event_type, history.old_rating,
            history.new_rating, history.rating_change, history.match_id, history.opponent_ids,
            history.result, history.expected_outcome
          ]
        );
        ratingHistoriesInserted++;
      }
    }
    console.log(`   ✓ Inserted ${ratingHistoriesInserted} rating history entries`);

    console.log('\n\n✅ MIGRATION COMPLETE!');
    console.log('\n📊 Summary:');
    console.log(`   - Users inserted: ${usersInserted}`);
    console.log(`   - Players inserted: ${playersInserted}`);
    console.log(`   - Sessions inserted: ${sessionsInserted}`);
    console.log(`   - Registrations inserted: ${registrationsInserted}`);
    console.log(`   - Matches inserted: ${matchesInserted}`);
    console.log(`   - Rating histories inserted: ${ratingHistoriesInserted}`);
    
    console.log('\n✅ Your production database now has all your development data!');
    console.log('✅ Shinya1991 admin account is ready to use in production!');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  }
}

migrateToProduction()
  .then(() => {
    console.log('\n✅ Migration script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed:', error);
    process.exit(1);
  });

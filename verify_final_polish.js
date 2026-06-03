/**
 * @file verify_final_polish.js
 * @description Integration and verification tests for Phase 7 (Art & Polish)
 */

const path = require('path');
const fs = require('fs');

// Set isolated test database path
process.env.DATABASE_PATH = './data/test_game_p7.db';

// Clean up previous test DB if any
try {
  if (fs.existsSync('./data/test_game_p7.db')) fs.unlinkSync('./data/test_game_p7.db');
  if (fs.existsSync('./data/test_game_p7.db-wal')) fs.unlinkSync('./data/test_game_p7.db-wal');
  if (fs.existsSync('./data/test_game_p7.db-shm')) fs.unlinkSync('./data/test_game_p7.db-shm');
} catch (e) { /* ignore */ }

// Initialize Connection & Schema
const db = require('./src/database/connection');
const { initSchema } = require('./src/database/schema');
initSchema();

// Load modules under test
const tutienCommand = require('./src/commands/tutien');
const mainMenu = require('./src/menus/main-menu');
const monstersConfig = require('./config/monsters');

// Helper to create mock Discord SlashCommand Interaction
function createMockInteraction({ userId, isNewPlayer }) {
  return {
    user: { id: userId, displayName: 'Đạo Hữu Mới' },
    replied: false,
    deferred: false,
    embedsSent: [],
    componentsSent: [],
    filesSent: [],
    
    async deferReply() {
      this.deferred = true;
    },

    async editReply(options) {
      this.replied = true;
      if (options.embeds) this.embedsSent = options.embeds;
      if (options.components) this.componentsSent = options.components;
      if (options.files) this.filesSent = options.files;
    },

    async update(options) {
      if (options.embeds) this.embedsSent = options.embeds;
      if (options.components) this.componentsSent = options.components;
      if (options.files) this.filesSent = options.files;
    }
  };
}

const userId = '777777777777777777';

async function runTests() {
  console.log('🏁 Starting Phase 7 Art & Polish Verification Tests...\n');

  // ==========================================
  // TEST 1: New Player Creation (Welcome Banner)
  // ==========================================
  console.log('🔷 Test 1: New Player Creation (Welcome Banner)');
  
  const mockCreationInteraction = createMockInteraction({ userId, isNewPlayer: true });
  await tutienCommand.execute(mockCreationInteraction);

  if (mockCreationInteraction.filesSent.length > 0) {
    const file = mockCreationInteraction.filesSent[0];
    console.log(`✅ 1.1: New player /tutien successfully attaches welcome banner file: "${file.attachment}"`);
  } else {
    throw new Error('1.1 Failed: No welcome image attached.');
  }
  
  const embed = mockCreationInteraction.embedsSent[0];
  if (embed && embed.data.image && embed.data.image.url === 'attachment://welcome.png') {
    console.log('✅ 1.2: Welcome embed correctly sets image to "attachment://welcome.png".');
  } else {
    throw new Error(`1.2 Failed: Welcome embed image url mismatch. URL: ${embed?.data?.image?.url}`);
  }
  console.log('');

  // ==========================================
  // TEST 2: Active Player Main Menu (Main Menu Banner)
  // ==========================================
  console.log('🔷 Test 2: Active Player Main Menu (Main Menu Banner)');

  // Register the player
  db.prepare(`
    INSERT INTO players (discord_id, name, linh_thach) VALUES (?, 'Bạch Vân', 500)
  `).run(userId);

  const mockMenuInteraction = createMockInteraction({ userId, isNewPlayer: false });
  await tutienCommand.execute(mockMenuInteraction);

  if (mockMenuInteraction.filesSent.length > 0) {
    const file = mockMenuInteraction.filesSent[0];
    console.log(`✅ 2.1: Active player /tutien successfully attaches main menu banner file: "${file.attachment}"`);
  } else {
    throw new Error('2.1 Failed: No main menu image attached.');
  }

  const menuEmbed = mockMenuInteraction.embedsSent[0];
  if (menuEmbed && menuEmbed.data.image && menuEmbed.data.image.url === 'attachment://main_menu.png') {
    console.log('✅ 2.2: Main menu embed correctly sets image to "attachment://main_menu.png".');
  } else {
    throw new Error(`2.2 Failed: Main menu embed image url mismatch. URL: ${menuEmbed?.data?.image?.url}`);
  }

  // Test direct menu routing updates
  const mockMenuUpdate = createMockInteraction({ userId });
  const freshPlayer = db.prepare('SELECT * FROM players WHERE discord_id = ?').get(userId);
  await mainMenu.showMainMenu(mockMenuUpdate, freshPlayer);

  if (mockMenuUpdate.filesSent.length > 0 && mockMenuUpdate.embedsSent[0].data.image.url === 'attachment://main_menu.png') {
    console.log('✅ 2.3: showMainMenu router utility successfully attaches main menu file and maps embed.');
  } else {
    throw new Error('2.3 Failed: Routing showMainMenu failed to attach menu image.');
  }
  console.log('');

  // ==========================================
  // TEST 3: Monster EXP Balancing
  // ==========================================
  console.log('🔷 Test 3: Monster EXP Balancing');

  const linhTho = monstersConfig.list.find(m => m.id === 'linh_tho');
  const thanhLang = monstersConfig.list.find(m => m.id === 'thanh_lang');

  if (linhTho && linhTho.exp_reward === 25) {
    console.log(`✅ 3.1: Linh Thỏ EXP reward is correctly tuned to 25.`);
  } else {
    throw new Error(`3.1 Failed: Linh Thỏ EXP reward mismatch. EXP: ${linhTho?.exp_reward}`);
  }

  if (thanhLang && thanhLang.exp_reward === 60) {
    console.log(`✅ 3.2: Thanh Lang EXP reward is correctly tuned to 60.`);
  } else {
    throw new Error(`3.2 Failed: Thanh Lang EXP reward mismatch. EXP: ${thanhLang?.exp_reward}`);
  }

  console.log('\n🎉 ALL PHASE 7 TESTS COMPLETED SUCCESSFULLY! 🎉');
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED WITH ERROR:', err.message);
  console.error(err.stack);
  process.exit(1);
});

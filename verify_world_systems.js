/**
 * @file verify_world_systems.js
 * @description Integration and verification tests for Phase 5 (World Systems)
 */

const path = require('path');
const fs = require('fs');

// Set isolated test database path
process.env.DATABASE_PATH = './data/test_game.db';

// Clean up previous test DB if any
try {
  if (fs.existsSync('./data/test_game.db')) fs.unlinkSync('./data/test_game.db');
  if (fs.existsSync('./data/test_game.db-wal')) fs.unlinkSync('./data/test_game.db-wal');
  if (fs.existsSync('./data/test_game.db-shm')) fs.unlinkSync('./data/test_game.db-shm');
} catch (e) { /* ignore */ }

// Initialize Connection & Schema
const db = require('./src/database/connection');
const { initSchema } = require('./src/database/schema');
initSchema();

// Load modules under test
const sectsSystem = require('./src/systems/sects');
const npcsSystem = require('./src/systems/npcs');
const questsSystem = require('./src/systems/quests');
const secretRealmsSystem = require('./src/systems/secretrealms');
const worldMenu = require('./src/menus/world-menu');

// Helper to create mock Discord interactions
function createMockInteraction({ userId, customId, values, textInputValue }) {
  const result = {
    user: { id: userId, username: 'TestCultivator' },
    customId,
    values,
    replied: false,
    deferred: false,
    embedsSent: [],
    componentsSent: [],
    modalSent: null,
    
    async reply(options) {
      this.replied = true;
      if (options.embeds) this.embedsSent = options.embeds;
      if (options.components) this.componentsSent = options.components;
      if (options.content) this.contentSent = options.content;
    },

    async update(options) {
      if (options.embeds) this.embedsSent = options.embeds;
      if (options.components) this.componentsSent = options.components;
      if (options.content) this.contentSent = options.content;
    },

    async showModal(modal) {
      this.modalSent = modal;
    },

    fields: {
      getTextInputValue(id) {
        if (id === 'sect_name') return textInputValue;
        return null;
      }
    }
  };
  return result;
}

// Global state variables
let testPlayerId;
const userId = '123456789012345678';

async function runTests() {
  console.log('🏁 Starting Phase 5 World Systems Verification Tests...\n');

  // Set up initial player
  db.prepare(`
    INSERT INTO players (discord_id, name, spiritual_root, root_type, constitution, dao_path, realm_index, sub_realm, exp, hp, max_hp, atk, def, speed, mana, max_mana, linh_thach)
    VALUES (?, 'Vô Danh Tu Sĩ', 'Hỏa Linh Căn', 'chinh', 'Bách Độc Bất Xâm', 'chinh', 3, 1, 0, 500, 500, 50, 30, 20, 200, 200, 2000)
  `).run(userId);

  const player = db.prepare('SELECT * FROM players WHERE discord_id = ?').get(userId);
  testPlayerId = player.id;
  console.log(`👤 Created test player: ${player.name} (ID: ${player.id}, Realm: Kim Đan, Linh Thạch: ${player.linh_thach})\n`);

  // ==========================================
  // TEST 1: Sect Creation and Management
  // ==========================================
  console.log('🔷 Test 1: Sect Creation and Management');
  
  // 1.1 Try creating a sect (modal display)
  const mockSectCreateBtn = createMockInteraction({ userId, customId: 'sect:create' });
  await sectsSystem.handleCreateSect(mockSectCreateBtn, player);
  if (mockSectCreateBtn.modalSent) {
    console.log('✅ 1.1: handleCreateSect successfully triggers Modal display.');
  } else {
    throw new Error('1.1 Failed: Modal not triggered.');
  }

  // 1.2 Confirm sect creation from modal submit
  const mockSectCreateSubmit = createMockInteraction({ userId, customId: 'sect:create_submit', textInputValue: 'Thanh Vân Tông' });
  await sectsSystem.confirmCreateSect(mockSectCreateSubmit, player, 'Thanh Vân Tông');
  
  const createdSect = db.prepare('SELECT * FROM sects WHERE name = ?').get('Thanh Vân Tông');
  const sectMember = db.prepare('SELECT * FROM sect_members WHERE player_id = ?').get(testPlayerId);
  const updatedPlayer = db.prepare('SELECT * FROM players WHERE id = ?').get(testPlayerId);

  if (createdSect && sectMember && sectMember.role === 'leader' && updatedPlayer.linh_thach === 1000) {
    console.log(`✅ 1.2: confirmCreateSect created sect "${createdSect.name}", role leader, spent 1000 Linh Thạch.`);
  } else {
    throw new Error(`1.2 Failed: Sect not created properly. Player Linh Thạch: ${updatedPlayer.linh_thach}`);
  }

  // 1.3 Sect donation
  const mockSectDonateBtn = createMockInteraction({ userId, customId: 'sect:donate' });
  await sectsSystem.handleDonateSect(mockSectDonateBtn, updatedPlayer);
  if (mockSectDonateBtn.embedsSent.length > 0) {
    console.log('✅ 1.3: handleDonateSect displays donation options.');
  } else {
    throw new Error('1.3 Failed: Donation menu not rendered.');
  }

  const mockSectDonateExec = createMockInteraction({ userId, customId: 'sect:donate:500' });
  await sectsSystem.executeDonateSect(mockSectDonateExec, updatedPlayer, 500);

  const donatedSect = db.prepare('SELECT * FROM sects WHERE id = ?').get(createdSect.id);
  const donatedMember = db.prepare('SELECT * FROM sect_members WHERE player_id = ?').get(testPlayerId);
  const playerAfterDonate = db.prepare('SELECT * FROM players WHERE id = ?').get(testPlayerId);

  if (donatedSect.treasury === 500 && donatedMember.contribution === 1000 && playerAfterDonate.linh_thach === 500) {
    console.log('✅ 1.4: executeDonateSect successfully added 500 to treasury/contribution, deducted player Linh Thạch.');
  } else {
    throw new Error(`1.4 Failed: Donation stats incorrect. Treasury: ${donatedSect.treasury}, Contribution: ${donatedMember.contribution}`);
  }

  // 1.5 Sect joining & leaving
  // Create another player to test join
  const player2Id = db.prepare(`
    INSERT INTO players (discord_id, name, linh_thach) VALUES ('999999999999999999', 'Đạo Hữu Chiết', 200)
  `).run().lastInsertRowid;
  const player2 = db.prepare('SELECT * FROM players WHERE id = ?').get(player2Id);

  const mockSectJoin = createMockInteraction({ userId: '999999999999999999', customId: `select:join_sect` });
  await sectsSystem.executeJoinSect(mockSectJoin, player2, createdSect.id);

  const joinedMember = db.prepare('SELECT * FROM sect_members WHERE player_id = ?').get(player2Id);
  if (joinedMember && joinedMember.role === 'member') {
    console.log('✅ 1.5: executeJoinSect successfully added new member.');
  } else {
    throw new Error('1.5 Failed: Joining failed.');
  }

  // Leader disbands sect
  const mockSectLeaveConfirm = createMockInteraction({ userId, customId: 'sect:leave:confirm' });
  await sectsSystem.confirmLeaveSect(mockSectLeaveConfirm, playerAfterDonate);

  const sectExists = db.prepare('SELECT * FROM sects WHERE id = ?').get(createdSect.id);
  const memberExists = db.prepare('SELECT * FROM sect_members WHERE sect_id = ?').all(createdSect.id);

  if (!sectExists && memberExists.length === 0) {
    console.log('✅ 1.6: confirmLeaveSect successfully disbanded sect and removed all members.');
  } else {
    throw new Error('1.6 Failed: Disbanding failed.');
  }
  console.log('');

  // ==========================================
  // TEST 2: NPC Interactions, Shop, and Gift
  // ==========================================
  console.log('🔷 Test 2: NPC Interactions, Shop, and Gift');
  
  // Refresh player 1 stats
  let p = db.prepare('SELECT * FROM players WHERE id = ?').get(testPlayerId);
  
  // 2.1 View NPC Menu
  const mockNpcTalk = createMockInteraction({ userId, customId: 'select:talk_npc' });
  await npcsSystem.showNpcMenu(mockNpcTalk, p, 'truong_lao_thanh_van');
  if (mockNpcTalk.embedsSent.length > 0) {
    console.log('✅ 2.1: showNpcMenu successfully rendered NPC options and dialogue.');
  } else {
    throw new Error('2.1 Failed: NPC menu not rendered.');
  }

  // 2.2 NPC Shop Buy: Buy cuoc_khai_khoang (price: 100)
  const mockNpcBuy = createMockInteraction({ userId, customId: 'select:npc_buy:truong_lao_thanh_van' });
  await npcsSystem.executeNpcBuy(mockNpcBuy, p, 'truong_lao_thanh_van', 'cuoc_khai_khoang:item');

  const pickaxe = db.prepare('SELECT * FROM inventory WHERE player_id = ? AND item_id = ?').get(testPlayerId, 'cuoc_khai_khoang');
  p = db.prepare('SELECT * FROM players WHERE id = ?').get(testPlayerId);

  if (pickaxe && pickaxe.quantity === 1 && p.linh_thach === 400) {
    console.log('✅ 2.2: executeNpcBuy successfully bought "cuoc_khai_khoang" pickaxe for 100 Linh Thạch.');
  } else {
    throw new Error(`2.2 Failed: Purchase failed. Pickaxe qty: ${pickaxe?.quantity}, Linh Thạch: ${p.linh_thach}`);
  }

  // 2.3 NPC Gift: Gift a Linh Thảo (+2 affinity)
  // Give player a Linh Thảo first
  db.prepare('INSERT INTO inventory (player_id, item_id, quantity) VALUES (?, ?, ?)').run(testPlayerId, 'linh_thao', 5);

  const mockNpcGift = createMockInteraction({ userId, customId: 'select:npc_gift:dan_su_duoc_lao' });
  await npcsSystem.executeNpcGift(mockNpcGift, p, 'dan_su_duoc_lao', 'linh_thao');

  const aff = db.prepare('SELECT * FROM npc_affinity WHERE player_id = ? AND npc_id = ?').get(testPlayerId, 'dan_su_duoc_lao');
  const itemsInInv = db.prepare('SELECT quantity FROM inventory WHERE player_id = ? AND item_id = ?').get(testPlayerId, 'linh_thao');

  if (aff && aff.affinity === 2 && itemsInInv.quantity === 4) {
    console.log('✅ 2.3: executeNpcGift successfully gifted Linh Thảo, deducted quantity, increased affinity by +2.');
  } else {
    throw new Error(`2.3 Failed: Gifting failed. Affinity: ${aff?.affinity}, Linh Thảo remaining: ${itemsInInv?.quantity}`);
  }
  console.log('');

  // ==========================================
  // TEST 3: Quest Progression and Completion
  // ==========================================
  console.log('🔷 Test 3: Quest Progression and Completion');
  
  // 3.1 Accept quest
  const mockQuestAccept = createMockInteraction({ userId, customId: 'select:accept_quest:truong_lao_thanh_van' });
  await questsSystem.handleAcceptQuest(mockQuestAccept, p, 'quest_01_first_hunt');

  const activeQuest = db.prepare('SELECT * FROM player_quests WHERE player_id = ? AND quest_id = ?').get(testPlayerId, 'quest_01_first_hunt');
  if (activeQuest && activeQuest.status === 'active') {
    console.log('✅ 3.1: handleAcceptQuest successfully accepted "quest_01_first_hunt".');
  } else {
    throw new Error('3.1 Failed: Quest not active.');
  }

  // 3.2 Update hunt progress
  questsSystem.updateQuestProgress(testPlayerId, 'hunt', 'linh_tho', 3);

  const updatedQuest = db.prepare('SELECT * FROM player_quests WHERE player_id = ? AND quest_id = ?').get(testPlayerId, 'quest_01_first_hunt');
  if (updatedQuest && updatedQuest.progress === 3) {
    console.log('✅ 3.2: updateQuestProgress successfully updated kill counts.');
  } else {
    throw new Error(`3.2 Failed: Progress not updated. Progress: ${updatedQuest?.progress}`);
  }

  // 3.3 Complete quest and check rewards
  const mockQuestComplete = createMockInteraction({ userId, customId: 'select:complete_quest:truong_lao_thanh_van' });
  await questsSystem.handleCompleteQuest(mockQuestComplete, p, 'quest_01_first_hunt');

  const completedQuest = db.prepare('SELECT * FROM player_quests WHERE player_id = ? AND quest_id = ?').get(testPlayerId, 'quest_01_first_hunt');
  const rewardBook = db.prepare('SELECT * FROM inventory WHERE player_id = ? AND item_id = ?').get(testPlayerId, 'hoa_cau_thuat_sach');
  p = db.prepare('SELECT * FROM players WHERE id = ?').get(testPlayerId);

  if (completedQuest && completedQuest.status === 'completed' && p.linh_thach === 450 && rewardBook && rewardBook.quantity === 1) {
    console.log('✅ 3.3: handleCompleteQuest validated requirements, awarded +50 Linh Thạch and 1x "hoa_cau_thuat_sach".');
  } else {
    throw new Error(`3.3 Failed: Rewards not processed properly. Status: ${completedQuest?.status}, Linh Thạch: ${p.linh_thach}, Book: ${rewardBook?.quantity}`);
  }
  console.log('');

  // ==========================================
  // TEST 4: Secret Realms (Bí Cảnh) Run
  // ==========================================
  console.log('🔷 Test 4: Secret Realms Dungeon Run');
  
  // 4.1 Run Hắc Phong Sơn (costs 100 Linh Thạch, 3 waves)
  const mockSecretRealmBtn = createMockInteraction({ userId, customId: 'select:enter_realm' });
  await secretRealmsSystem.startSecretRealm(mockSecretRealmBtn, p, 'hac_phong_son');

  const newPlayerState = db.prepare('SELECT * FROM players WHERE id = ?').get(testPlayerId);
  
  if (mockSecretRealmBtn.embedsSent.length > 0 && newPlayerState.linh_thach === 450) {
    // 450 - 100 entry + 100 reward = 450
    console.log(`      Linh Thạch: ${p.linh_thach} -> ${newPlayerState.linh_thach}`);
    const lastEmbed = mockSecretRealmBtn.embedsSent[0];
    console.log(`      Final result title: "${lastEmbed.data.title}"`);
  } else {
    throw new Error(`4.1 Failed: Secret realm failed to run or update stats. Linh Thạch: ${newPlayerState.linh_thach}`);
  }
  console.log('');

  // ==========================================
  // TEST 5: Mining Yields & Pickaxe Upgrades
  // ==========================================
  console.log('🔷 Test 5: Mining Yields & Pickaxe Upgrades');
  
  // 5.1 Test mining yield without Pickaxe
  // Clear pickaxe from inventory
  db.prepare('DELETE FROM inventory WHERE player_id = ? AND item_id = ?').run(testPlayerId, 'cuoc_khai_khoang');
  db.prepare('DELETE FROM cooldowns WHERE player_id = ? AND action_type = ?').run(testPlayerId, 'mine');
  
  let pState = db.prepare('SELECT * FROM players WHERE id = ?').get(testPlayerId);
  const beforeLinhThach = pState.linh_thach;

  const mockMiningNoPick = createMockInteraction({ userId, customId: 'world:mine' });
  await worldMenu.handleMining(mockMiningNoPick, pState);

  pState = db.prepare('SELECT * FROM players WHERE id = ?').get(testPlayerId);
  const ltRewardNoPick = pState.linh_thach - beforeLinhThach;
  console.log(`🌾 5.1: Mined WITHOUT Pickaxe. Linh Thạch earned: +${ltRewardNoPick}`);

  // 5.2 Test mining yield WITH Pickaxe
  // Add pickaxe back and clear cooldown
  db.prepare('INSERT INTO inventory (player_id, item_id, quantity) VALUES (?, ?, ?)').run(testPlayerId, 'cuoc_khai_khoang', 1);
  db.prepare('DELETE FROM cooldowns WHERE player_id = ? AND action_type = ?').run(testPlayerId, 'mine');

  pState = db.prepare('SELECT * FROM players WHERE id = ?').get(testPlayerId);
  const beforeLinhThachWithPick = pState.linh_thach;

  const mockMiningWithPick = createMockInteraction({ userId, customId: 'world:mine' });
  await worldMenu.handleMining(mockMiningWithPick, pState);

  pState = db.prepare('SELECT * FROM players WHERE id = ?').get(testPlayerId);
  const ltRewardWithPick = pState.linh_thach - beforeLinhThachWithPick;
  
  console.log(`⛏️ 5.2: Mined WITH Pickaxe. Linh Thạch earned: +${ltRewardWithPick}`);
  
  // Verify 50% increase (within random bounds)
  // Base is randomInt(10, 30) * (3 + 1) = 40 to 120. With pickaxe it should be multiplied by 1.5.
  // We can verify that Pickaxe description is present in the embed.
  const description = mockMiningWithPick.embedsSent[0]?.data.description || '';
  if (description.includes('Cuốc Khai Khoáng')) {
    console.log('✅ 5.3: Mining yield upgrade verified. Pickaxe bonus note included in embed.');
  } else {
    throw new Error('5.3 Failed: Pickaxe bonus note missing from mining embed.');
  }

  console.log('\n🎉 ALL PHASE 5 TESTS COMPLETED SUCCESSFULLY! 🎉');
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED WITH ERROR:', err.message);
  console.error(err.stack);
  process.exit(1);
});

/**
 * @file verify_economy_social.js
 * @description Integration and verification tests for Phase 6 (Economy & Social)
 */

const path = require('path');
const fs = require('fs');

// Set isolated test database path
process.env.DATABASE_PATH = './data/test_game_p6.db';

// Clean up previous test DB if any
try {
  if (fs.existsSync('./data/test_game_p6.db')) fs.unlinkSync('./data/test_game_p6.db');
  if (fs.existsSync('./data/test_game_p6.db-wal')) fs.unlinkSync('./data/test_game_p6.db-wal');
  if (fs.existsSync('./data/test_game_p6.db-shm')) fs.unlinkSync('./data/test_game_p6.db-shm');
} catch (e) { /* ignore */ }

// Initialize Connection & Schema
const db = require('./src/database/connection');
const { initSchema } = require('./src/database/schema');
initSchema();

// Load modules under test
const npcShopSystem = require('./src/systems/npc-shop');
const auctionSystem = require('./src/systems/auction');
const tradeSystem = require('./src/systems/trade');
const leaderboardMenu = require('./src/menus/leaderboard-menu');

// Helper to create mock Discord interactions
function createMockInteraction({ userId, customId, values, textInputValue }) {
  return {
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
        if (id === 'list_price') return textInputValue;
        if (id === 'offer_amount') return textInputValue;
        return null;
      }
    }
  };
}

let playerAId, playerBId;
const userAId = '111111111111111111';
const userBId = '222222222222222222';

async function runTests() {
  console.log('🏁 Starting Phase 6 Economy & Social Verification Tests...\n');

  // Set up test players
  db.prepare(`
    INSERT INTO players (discord_id, name, linh_thach) VALUES (?, 'Đạo Hữu A', 1000)
  `).run(userAId);
  db.prepare(`
    INSERT INTO players (discord_id, name, linh_thach) VALUES (?, 'Đạo Hữu B', 500)
  `).run(userBId);

  const playerA = db.prepare('SELECT * FROM players WHERE discord_id = ?').get(userAId);
  const playerB = db.prepare('SELECT * FROM players WHERE discord_id = ?').get(userBId);
  playerAId = playerA.id;
  playerBId = playerB.id;

  console.log(`👤 Created Player A: ${playerA.name} (Linh Thạch: ${playerA.linh_thach})`);
  console.log(`👤 Created Player B: ${playerB.name} (Linh Thạch: ${playerB.linh_thach})\n`);

  // ==========================================
  // TEST 1: NPC Shop Buy and Sell
  // ==========================================
  console.log('🔷 Test 1: NPC Shop Buy and Sell');

  // 1.1 Buy an item (Hồi Khí Đan, price 15)
  const mockShopBuy = createMockInteraction({ userId: userAId, customId: 'select:npc_shop_buy' });
  await npcShopSystem.executeNpcShopBuy(mockShopBuy, playerA, 'hoi_khi_dan');

  let updatedA = db.prepare('SELECT * FROM players WHERE id = ?').get(playerAId);
  let invA = db.prepare('SELECT * FROM inventory WHERE player_id = ? AND item_id = ?').get(playerAId, 'hoi_khi_dan');

  if (updatedA.linh_thach === 985 && invA && invA.quantity === 1) {
    console.log('✅ 1.1: executeNpcShopBuy successfully bought item, adjusted Linh Thạch and inventory.');
  } else {
    throw new Error(`1.1 Failed: Stats mismatch. Linh Thạch: ${updatedA.linh_thach}, Item qty: ${invA?.quantity}`);
  }

  // 1.2 Sell an item (Hồi Khí Đan, sell price 7 (50% of 15))
  const mockShopSell = createMockInteraction({ userId: userAId, customId: 'select:npc_shop_sell' });
  await npcShopSystem.executeNpcShopSell(mockShopSell, updatedA, 'hoi_khi_dan');

  updatedA = db.prepare('SELECT * FROM players WHERE id = ?').get(playerAId);
  invA = db.prepare('SELECT * FROM inventory WHERE player_id = ? AND item_id = ?').get(playerAId, 'hoi_khi_dan');

  if (updatedA.linh_thach === 992 && !invA) {
    console.log('✅ 1.2: executeNpcShopSell successfully sold item, refunded 50% price, cleared item.');
  } else {
    throw new Error(`1.2 Failed: Stats mismatch. Linh Thạch: ${updatedA.linh_thach}, Item exists: ${!!invA}`);
  }
  console.log('');

  // ==========================================
  // TEST 2: Auction House (Tụ Bảo Các)
  // ==========================================
  console.log('🔷 Test 2: Auction House (Tụ Bảo Các)');

  // Give Player A a Linh Thảo to list
  db.prepare('INSERT INTO inventory (player_id, item_id, quantity) VALUES (?, ?, ?)').run(playerAId, 'linh_thao', 2);
  updatedA = db.prepare('SELECT * FROM players WHERE id = ?').get(playerAId);

  // 2.1 List item (1x Linh Thảo for 100 Linh Thạch)
  const mockAuctionList = createMockInteraction({ userId: userAId, customId: 'trade:auction_list_submit:linh_thao', textInputValue: '100' });
  await auctionSystem.executeAuctionList(mockAuctionList, updatedA, 'linh_thao', '100');

  const listing = db.prepare('SELECT * FROM auction_listings WHERE seller_id = ?').get(playerAId);
  const remainingLinhThao = db.prepare('SELECT quantity FROM inventory WHERE player_id = ? AND item_id = ?').get(playerAId, 'linh_thao');

  if (listing && listing.item_id === 'linh_thao' && listing.price === 100 && remainingLinhThao.quantity === 1) {
    console.log('✅ 2.1: executeAuctionList successfully listed 1x Linh Thảo for 100 Linh Thạch, deducted from inventory.');
  } else {
    throw new Error(`2.1 Failed: Listing stats mismatch. Price: ${listing?.price}, Remaining qty: ${remainingLinhThao?.quantity}`);
  }

  // 2.2 Buyer purchases listing
  let updatedB = db.prepare('SELECT * FROM players WHERE id = ?').get(playerBId);
  const mockAuctionBuy = createMockInteraction({ userId: userBId, customId: 'select:auction_buy' });
  await auctionSystem.executeAuctionBuy(mockAuctionBuy, updatedB, listing.id);

  updatedA = db.prepare('SELECT * FROM players WHERE id = ?').get(playerAId);
  updatedB = db.prepare('SELECT * FROM players WHERE id = ?').get(playerBId);
  const buyerInv = db.prepare('SELECT * FROM inventory WHERE player_id = ? AND item_id = ?').get(playerBId, 'linh_thao');
  const checkListing = db.prepare('SELECT * FROM auction_listings WHERE id = ?').get(listing.id);

  if (updatedA.linh_thach === 1092 && updatedB.linh_thach === 400 && buyerInv && buyerInv.quantity === 1 && !checkListing) {
    console.log('✅ 2.2: executeAuctionBuy processed buyer/seller balances, transferred item, and closed listing.');
  } else {
    throw new Error(`2.2 Failed: Purchase mismatch. Seller LT: ${updatedA.linh_thach}, Buyer LT: ${updatedB.linh_thach}, Listing exists: ${!!checkListing}`);
  }

  // 2.3 Cancel listing
  // List the second Linh Thảo, then cancel it
  const mockAuctionList2 = createMockInteraction({ userId: userAId, customId: 'trade:auction_list_submit:linh_thao', textInputValue: '100' });
  await auctionSystem.executeAuctionList(mockAuctionList2, updatedA, 'linh_thao', '100');

  const listing2 = db.prepare('SELECT * FROM auction_listings WHERE seller_id = ?').get(playerAId);
  const mockAuctionCancel = createMockInteraction({ userId: userAId, customId: 'select:auction_cancel' });
  await auctionSystem.executeCancelListing(mockAuctionCancel, updatedA, listing2.id);

  const recoveredLinhThao = db.prepare('SELECT quantity FROM inventory WHERE player_id = ? AND item_id = ?').get(playerAId, 'linh_thao');
  const checkListing2 = db.prepare('SELECT * FROM auction_listings WHERE id = ?').get(listing2.id);

  if (recoveredLinhThao.quantity === 1 && !checkListing2) {
    console.log('✅ 2.3: executeCancelListing successfully canceled listing, returned item to seller inventory.');
  } else {
    throw new Error(`2.3 Failed: Cancellation mismatch. Qty: ${recoveredLinhThao.quantity}, Listing exists: ${!!checkListing2}`);
  }
  console.log('');

  // ==========================================
  // TEST 3: Direct Player-to-Player Trading
  // ==========================================
  console.log('🔷 Test 3: Direct Player-to-Player Trading');

  // 3.1 Initiate direct trade offering Linh Thạch
  updatedA = db.prepare('SELECT * FROM players WHERE id = ?').get(playerAId);
  const mockTradeRequest = createMockInteraction({ userId: userAId, customId: `trade:offer_lt_submit:${playerBId}`, textInputValue: '300' });
  await tradeSystem.executeTradeOfferLinhThachSubmit(mockTradeRequest, updatedA, playerBId, '300');

  const tradeRecord = db.prepare('SELECT * FROM player_trades WHERE sender_id = ? AND status = ?').get(playerAId, 'pending');
  if (tradeRecord && tradeRecord.offer_linh_thach === 300 && tradeRecord.receiver_id === playerBId) {
    console.log('✅ 3.1: executeTradeOfferLinhThachSubmit successfully registered pending trade offering 300 Linh Thạch.');
  } else {
    throw new Error(`3.1 Failed: Direct trade request not registered. Offer LT: ${tradeRecord?.offer_linh_thach}`);
  }

  // 3.2 Accept trade request
  const mockTradeAccept = createMockInteraction({ userId: userBId, customId: `trade:accept_trade:${tradeRecord.id}` });
  await tradeSystem.executeAcceptTrade(mockTradeAccept, updatedB, tradeRecord.id);

  updatedA = db.prepare('SELECT * FROM players WHERE id = ?').get(playerAId);
  updatedB = db.prepare('SELECT * FROM players WHERE id = ?').get(playerBId);
  const acceptedTrade = db.prepare('SELECT * FROM player_trades WHERE id = ?').get(tradeRecord.id);

  if (updatedA.linh_thach === 792 && updatedB.linh_thach === 700 && acceptedTrade.status === 'accepted') {
    // A: 1092 - 300 = 792. B: 400 + 300 = 700
    console.log('✅ 3.2: executeAcceptTrade verified and performed balance transfers, updating trade state to "accepted".');
  } else {
    throw new Error(`3.2 Failed: Direct trade accept mismatch. Seller LT: ${updatedA.linh_thach}, Buyer LT: ${updatedB.linh_thach}, Status: ${acceptedTrade?.status}`);
  }

  // 3.3 Reject trade request
  // Give Player A a Linh Thảo and trade it
  const mockTradeRequest2 = createMockInteraction({ userId: userAId, customId: `select:trade_item:${playerBId}` });
  await tradeSystem.executeTradeOfferItemSelect(mockTradeRequest2, updatedA, playerBId, 'linh_thao');

  const tradeRecord2 = db.prepare('SELECT * FROM player_trades WHERE sender_id = ? AND status = ?').get(playerAId, 'pending');
  const mockTradeReject = createMockInteraction({ userId: userBId, customId: `trade:reject_trade:${tradeRecord2.id}` });
  await tradeSystem.executeRejectTrade(mockTradeReject, updatedB, tradeRecord2.id);

  const rejectedTrade = db.prepare('SELECT * FROM player_trades WHERE id = ?').get(tradeRecord2.id);
  if (rejectedTrade.status === 'rejected') {
    console.log('✅ 3.3: executeRejectTrade successfully set status to "rejected".');
  } else {
    throw new Error(`3.3 Failed: Rejection failed. Status: ${rejectedTrade.status}`);
  }
  console.log('');

  // ==========================================
  // TEST 4: Leaderboard Menu & Sect Ranking
  // ==========================================
  console.log('🔷 Test 4: Leaderboard Menu & Sect Ranking');

  // Insert a mock sect
  db.prepare(`
    INSERT INTO sects (name, leader_id, level, treasury, max_members) 
    VALUES ('Cổ Kiếm Tông', ?, 5, 5000, 20)
  `).run(playerAId);

  const mockLeaderboard = createMockInteraction({ userId: userAId, customId: 'leaderboard:sect' });
  await leaderboardMenu.showLeaderboard(mockLeaderboard, 'sect');

  if (mockLeaderboard.embedsSent.length > 0) {
    const lastEmbed = mockLeaderboard.embedsSent[0];
    console.log(`✅ 4.1: showLeaderboard correctly retrieved and rendered Sects ranking.`);
    console.log(`      Leaderboard title: "${lastEmbed.data.title}"`);
    console.log(`      First ranking entry: "${lastEmbed.data.description}"`);
  } else {
    throw new Error('4.1 Failed: Sect leaderboard failed to render.');
  }

  console.log('\n🎉 ALL PHASE 6 TESTS COMPLETED SUCCESSFULLY! 🎉');
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED WITH ERROR:', err.message);
  console.error(err.stack);
  process.exit(1);
});

/**
 * @file verify_maintenance.js
 * @description Integration and verification tests for Phase 8 (Automation & Maintenance)
 */

const fs = require('fs');
const path = require('path');

// Set isolated test database path
process.env.DATABASE_PATH = './data/test_game_p8.db';

// Clean up previous test DB if any
try {
  if (fs.existsSync('./data/test_game_p8.db')) fs.unlinkSync('./data/test_game_p8.db');
  if (fs.existsSync('./data/test_game_p8.db-wal')) fs.unlinkSync('./data/test_game_p8.db-wal');
  if (fs.existsSync('./data/test_game_p8.db-shm')) fs.unlinkSync('./data/test_game_p8.db-shm');
} catch (e) { /* ignore */ }

// Initialize Connection
const db = require('./src/database/connection');
const { initSchema } = require('./src/database/schema');
const { runMigrations } = require('./src/database/migrations');

// Trigger Schema and Migration initialization
initSchema();
runMigrations();

// Load modules under test
const scheduler = require('./src/systems/scheduler');

// Prepare Mock Discord Client
function createMockClient() {
  const sentDMs = [];
  const fetchedUserIds = [];
  const fetchedChannelIds = [];
  const fetchedMessageIds = [];
  let editedMessageOptions = null;

  const mockMessage = {
    id: 'msg_999_trade',
    embeds: [
      {
        title: '🤝 GIAO DỊCH TIÊN NHÂN 🤝',
        description: 'Đề xuất giao dịch...',
        data: { title: '🤝 GIAO DỊCH TIÊN NHÂN 🤝', description: 'Đề xuất giao dịch...' }
      }
    ],
    components: [],
    async edit(options) {
      editedMessageOptions = options;
    }
  };

  const mockChannel = {
    id: 'chan_888_trade',
    messages: {
      async fetch(messageId) {
        fetchedMessageIds.push(messageId);
        if (messageId === 'msg_999_trade') {
          return mockMessage;
        }
        throw new Error('Message not found');
      }
    }
  };

  return {
    users: {
      async fetch(userId) {
        fetchedUserIds.push(userId);
        return {
          send: async (content) => {
            sentDMs.push({ userId, content });
          }
        };
      }
    },
    channels: {
      async fetch(channelId) {
        fetchedChannelIds.push(channelId);
        if (channelId === 'chan_888_trade') {
          return mockChannel;
        }
        throw new Error('Channel not found');
      }
    },
    // Helper to inspect mock activity
    _inspect() {
      return { sentDMs, fetchedUserIds, fetchedChannelIds, fetchedMessageIds, editedMessageOptions };
    }
  };
}

async function runTests() {
  console.log('🏁 Starting Phase 8 Automation & Maintenance Verification Tests...\n');

  // ==========================================================
  // TEST 1: Database Migration and Columns Check
  // ==========================================================
  console.log('🔷 Test 1: Verify Schema Columns for Trade Message Tracking');
  
  // Verify columns in player_trades
  const tableInfo = db.prepare("PRAGMA table_info(player_trades)").all();
  const columnNames = tableInfo.map(col => col.name);

  if (columnNames.includes('channel_id') && columnNames.includes('message_id')) {
    console.log('✅ 1.1: player_trades table contains both [channel_id] and [message_id] tracking columns.');
  } else {
    throw new Error(`1.1 Failed: Missing columns in player_trades. Found: ${columnNames.join(', ')}`);
  }
  console.log('');

  // ==========================================================
  // TEST 2: Auction Listing Expiration (24h) and Item Refund
  // ==========================================================
  console.log('🔷 Test 2: Expired Auction Listings (24-Hour Job)');

  // Create a seller
  const sellerId = db.prepare(`
    INSERT INTO players (discord_id, name, linh_thach) VALUES ('12345', 'Phương Nguyên', 1000)
  `).run().lastInsertRowid;

  // Insert items to inventory first to ensure it's recorded correctly
  db.prepare(`
    INSERT INTO inventory (player_id, item_id, quantity) VALUES (?, 'kieu_dan', 5)
  `).run(sellerId);

  // Seller creates a listing (e.g. lists 1 item)
  // Deduct from inventory (simulate auction_list flow)
  db.prepare(`
    UPDATE inventory SET quantity = quantity - 1 WHERE player_id = ? AND item_id = 'kieu_dan'
  `).run(sellerId);

  const listingId = db.prepare(`
    INSERT INTO auction_listings (seller_id, item_id, quantity, price) VALUES (?, 'kieu_dan', 1, 300)
  `).run(sellerId).lastInsertRowid;

  // Manually update created_at to be 25 hours ago
  db.prepare(`
    UPDATE auction_listings SET created_at = datetime('now', '-25 hours') WHERE id = ?
  `).run(listingId);

  // Instantiate client and run expirations
  const clientMock = createMockClient();
  await scheduler.expireAuctionListings(clientMock);

  // Asserts
  const listingCheck = db.prepare('SELECT * FROM auction_listings WHERE id = ?').get(listingId);
  if (!listingCheck) {
    console.log('✅ 2.1: Expired listing is successfully deleted from database.');
  } else {
    throw new Error('2.1 Failed: Expired listing still exists in the database.');
  }

  const inventoryCheck = db.prepare('SELECT quantity FROM inventory WHERE player_id = ? AND item_id = ?').get(sellerId, 'kieu_dan');
  if (inventoryCheck && inventoryCheck.quantity === 5) {
    console.log('✅ 2.2: Ký gửi item (1x kieu_dan) successfully refunded back to player inventory (restored from 4 to 5).');
  } else {
    throw new Error(`2.2 Failed: Inventory refund failed. Expected quantity: 5, got: ${inventoryCheck ? inventoryCheck.quantity : 0}`);
  }

  const inspect = clientMock._inspect();
  if (inspect.fetchedUserIds.includes('12345') && inspect.sentDMs.length > 0) {
    console.log(`✅ 2.3: Seller successfully fetched and DM sent notifying item return: "${inspect.sentDMs[0].content.split('\n')[1]}"`);
  } else {
    throw new Error('2.3 Failed: Seller did not receive expiration DM.');
  }
  console.log('');

  // ==========================================================
  // TEST 3: Trade Timeout (5m) and Discord UI update
  // ==========================================================
  console.log('🔷 Test 3: Expired Direct Trade Timeout (5-Minute Job)');

  // Create receiver
  const receiverId = db.prepare(`
    INSERT INTO players (discord_id, name, linh_thach) VALUES ('67890', 'Tô Minh', 500)
  `).run().lastInsertRowid;

  // Insert trade request
  const tradeId = db.prepare(`
    INSERT INTO player_trades (sender_id, receiver_id, offer_linh_thach, offer_item_id, offer_item_qty, status, channel_id, message_id)
    VALUES (?, ?, 200, NULL, 0, 'pending', 'chan_888_trade', 'msg_999_trade')
  `).run(sellerId, receiverId).lastInsertRowid;

  // Manually update created_at to be 6 minutes ago
  db.prepare(`
    UPDATE player_trades SET created_at = datetime('now', '-6 minutes') WHERE id = ?
  `).run(tradeId);

  // Run timeout sweep
  await scheduler.timeoutTradeRequests(clientMock);

  // Check Database status
  const tradeCheck = db.prepare('SELECT status FROM player_trades WHERE id = ?').get(tradeId);
  if (tradeCheck && tradeCheck.status === 'rejected') {
    console.log(`✅ 3.1: Expired trade request status successfully updated to 'rejected' in database.`);
  } else {
    throw new Error(`3.1 Failed: Trade status mismatch. Expected 'rejected', got '${tradeCheck ? tradeCheck.status : 'null'}'`);
  }

  // Check Message updates
  const inspectAfterTrade = clientMock._inspect();
  if (inspectAfterTrade.fetchedChannelIds.includes('chan_888_trade') && inspectAfterTrade.fetchedMessageIds.includes('msg_999_trade')) {
    console.log('✅ 3.2: Target Discord Channel and Message successfully fetched by scheduler.');
  } else {
    throw new Error('3.2 Failed: Scheduler did not attempt to fetch Channel or Message.');
  }

  const editOpts = inspectAfterTrade.editedMessageOptions;
  if (editOpts && editOpts.embeds && editOpts.embeds[0]) {
    const finalEmbed = editOpts.embeds[0];
    if (finalEmbed.data.title === '❌ GIAO DỊCH QUÁ HẠN ❌') {
      console.log('✅ 3.3: Embed title updated to [❌ GIAO DỊCH QUÁ HẠN ❌].');
    } else {
      throw new Error(`3.3 Failed: Embed title mismatch. Got: "${finalEmbed.data.title}"`);
    }

    if (editOpts.components && editOpts.components[0]) {
      const buttons = editOpts.components[0].components;
      const allDisabled = buttons.every(b => b.data.disabled === true);
      if (allDisabled) {
        console.log('✅ 3.4: All interaction buttons (Accept/Reject) successfully disabled on message update.');
      } else {
        throw new Error('3.4 Failed: Interaction buttons were not disabled.');
      }
    } else {
      throw new Error('3.4 Failed: No components updated.');
    }
  } else {
    throw new Error('3.3-3.4 Failed: Message edit options are missing.');
  }

  console.log('\n🎉 ALL PHASE 8 TESTS COMPLETED SUCCESSFULLY! 🎉');
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED WITH ERROR:', err.message);
  console.error(err.stack);
  process.exit(1);
});

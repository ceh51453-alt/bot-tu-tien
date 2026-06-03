const logger = require('../utils/logger');
const { createErrorEmbed } = require('../ui/embeds');

// Registry các handler theo prefix
const handlers = new Map();

/**
 * Đăng ký handler cho một prefix
 */
function registerHandler(prefix, handler) {
  handlers.set(prefix, handler);
  logger.debug(`Đã đăng ký handler: ${prefix}`);
}

/**
 * Lấy player từ database
 */
function getPlayer(discordId) {
  const db = require('../database/connection');
  return db.prepare('SELECT * FROM players WHERE discord_id = ?').get(discordId);
}

/**
 * Tải tất cả handlers — wires menu modules vào interaction router
 */
function loadHandlers() {
  const { showMainMenu } = require('../menus/main-menu');
  const { showProfileMenu, showDetailedStats, showEquipment, showSkills, showPets } = require('../menus/profile-menu');
  const { showCultivationMenu, handleCultivation, handleBreakthrough } = require('../menus/cultivation-menu');
  const { showCombatMenu, startHunt } = require('../menus/combat-menu');
  const { showWorldMenu, handleMining } = require('../menus/world-menu');
  const { showInventoryMenu, showItemsByType } = require('../menus/inventory-menu');
  const { showTradeMenu, showNpcShop } = require('../menus/trade-menu');
  const { showSectMenu } = require('../menus/sect-menu');
  const { showPetMenu, handleCatchPet } = require('../menus/pet-menu');
  const { showLeaderboardMenu, showLeaderboard } = require('../menus/leaderboard-menu');
  const { handleDaoPathSelect, handleNameSubmit, handleRootSelect, confirmCreation, handleReincarnate } = require('../systems/character-creation');

  // ══════════════════════════════════
  // MENU: Main menu navigation
  // ══════════════════════════════════
  registerHandler('menu', {
    async handleButton(interaction, action) {
      const player = getPlayer(interaction.user.id);
      if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật. Dùng `/tutien` để tạo.')], ephemeral: true });

      switch (action) {
        case 'main': return showMainMenu(interaction, player);
        case 'rest': {
          // REST — recover HP and Mana
          const db = require('../database/connection');
          const { formatTime } = require('../utils/helpers');
          const { COOLDOWNS, COLORS } = require('../utils/constants');
          const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

          // Check rest cooldown (5 minutes)
          const restCooldown = COOLDOWNS.rest || 300000; // 5 min default
          const cooldown = db.prepare(
            "SELECT * FROM cooldowns WHERE player_id = ? AND action_type = 'rest'"
          ).get(player.id);

          if (cooldown && Date.now() < cooldown.expires_at) {
            const embed = new EmbedBuilder()
              .setColor(COLORS.warning)
              .setTitle('⏳ Đang Nghỉ Ngơi')
              .setDescription(`Cần chờ **${formatTime(cooldown.expires_at - Date.now())}** để nghỉ ngơi tiếp.`);
            return interaction.update({ embeds: [embed], components: [
              new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('menu:main').setLabel('🔙 Menu Chính').setStyle(ButtonStyle.Secondary)
              )
            ]});
          }

          // Restore HP and Mana
          db.prepare('UPDATE players SET hp = max_hp, mana = max_mana WHERE id = ?').run(player.id);
          db.prepare(
            "INSERT OR REPLACE INTO cooldowns (player_id, action_type, expires_at) VALUES (?, 'rest', ?)"
          ).run(player.id, Date.now() + restCooldown);

          const embed = new EmbedBuilder()
            .setColor(COLORS.success)
            .setTitle('🏕️ Nghỉ Ngơi Thành Công')
            .setDescription(
              `**${player.name}** tĩnh tọa điều tức, hồi phục hoàn toàn!\n\n` +
              `❤️ HP: **${player.max_hp}**/${player.max_hp} — Đầy đủ!\n` +
              `🔮 Mana: **${player.max_mana}**/${player.max_mana} — Đầy đủ!\n\n` +
              `⏳ Cooldown: **${formatTime(restCooldown)}**`
            )
            .setTimestamp();

          return interaction.update({ embeds: [embed], components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId('menu:main').setLabel('🏠 Menu Chính').setStyle(ButtonStyle.Success)
            )
          ]});
        }
        default: return interaction.reply({ embeds: [createErrorEmbed('Chức năng chưa được triển khai.')], ephemeral: true });
      }
    },
  });

  // ══════════════════════════════════
  // PROFILE: Character info
  // ══════════════════════════════════
  registerHandler('profile', {
    async handleButton(interaction, action) {
      const player = getPlayer(interaction.user.id);
      if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });

      switch (action) {
        case 'view':
        case 'main':
          return showProfileMenu(interaction, player);
        case 'stats': return showDetailedStats(interaction, player);
        case 'equipment': return showEquipment(interaction, player);
        case 'skills': return showSkills(interaction, player);
        case 'pets': return showPets(interaction, player);
        default: return showProfileMenu(interaction, player);
      }
    },
  });

  // ══════════════════════════════════
  // CULTIVATION: Tu luyện
  // ══════════════════════════════════
  registerHandler('cultivation', {
    async handleButton(interaction, action) {
      const player = getPlayer(interaction.user.id);
      if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });

      switch (action) {
        case 'menu': return showCultivationMenu(interaction, player);
        case 'train': return handleCultivation(interaction, player);
        case 'breakthrough': return handleBreakthrough(interaction, player);
        case 'tribulation': {
          const { handleTribulation } = require('../systems/tribulation');
          return handleTribulation(interaction, player);
        }
        case 'comprehend': {
          const { showDaoLawsMenu } = require('../systems/dao-laws');
          return showDaoLawsMenu(interaction, player);
        }
        default: return showCultivationMenu(interaction, player);
      }
    },
  });

  // ══════════════════════════════════
  // TECHNIQUE: Công Pháp
  // ══════════════════════════════════
  registerHandler('technique', {
    async handleButton(interaction, action) {
      const player = getPlayer(interaction.user.id);
      if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });

      const { showTechniqueMenu, confirmTechniqueSwitch } = require('../systems/techniques');

      if (action === 'menu') {
        return showTechniqueMenu(interaction, player);
      }
      // technique:confirm:techniqueId
      if (action === 'confirm') {
        const techId = interaction.customId.split(':')[2];
        return confirmTechniqueSwitch(interaction, player, techId);
      }

      return showTechniqueMenu(interaction, player);
    },
  });

  // ══════════════════════════════════
  // COMBAT: Chiến đấu
  // ══════════════════════════════════
  registerHandler('combat', {
    async handleButton(interaction, action) {
      const player = getPlayer(interaction.user.id);
      if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });

      switch (action) {
        case 'menu': return showCombatMenu(interaction, player);
        case 'hunt': return startHunt(interaction, player);
        case 'beast': {
          const { startBeastHunt } = require('../menus/combat-menu');
          return startBeastHunt(interaction, player);
        }
        case 'pvp': {
          const { startPvP } = require('../menus/combat-menu');
          return startPvP(interaction, player);
        }
        case 'party':
          return interaction.update({
            embeds: [createErrorEmbed('Tổ Đội sẽ được cập nhật trong Phase 4.')],
            components: [],
          });
        case 'skills': {
          const { showSkillsMenu } = require('../systems/skills');
          return showSkillsMenu(interaction, player);
        }
        default: return showCombatMenu(interaction, player);
      }
    },
  });

  // ══════════════════════════════════
  // SKILLS: Kỹ năng chiến đấu
  // ══════════════════════════════════
  registerHandler('skills', {
    async handleButton(interaction, action) {
      const player = getPlayer(interaction.user.id);
      if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });

      const { showSkillsMenu, handleUnequipSkill } = require('../systems/skills');

      switch (action) {
        case 'menu': return showSkillsMenu(interaction, player);
        case 'unequip': {
          // skills:unequip:slot
          const slot = parseInt(interaction.customId.split(':')[2]);
          return handleUnequipSkill(interaction, player, slot);
        }
        default: return showSkillsMenu(interaction, player);
      }
    },
  });

  // ══════════════════════════════════
  // WORLD: Thế giới
  // ══════════════════════════════════
  registerHandler('world', {
    async handleButton(interaction, action) {
      const player = getPlayer(interaction.user.id);
      if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });

      switch (action) {
        case 'menu': return showWorldMenu(interaction, player);
        case 'mine': return handleMining(interaction, player);
        case 'catchpet': return handleCatchPet(interaction, player);
        case 'secretrealm': {
          const { showSecretRealmsMenu } = require('../systems/secretrealms');
          return showSecretRealmsMenu(interaction, player);
        }
        case 'shop': {
          const { showTradeMenu } = require('../menus/trade-menu');
          return showTradeMenu(interaction, player);
        }
        case 'npc': {
          const { showWorldNpcs } = require('../systems/npcs');
          return showWorldNpcs(interaction, player);
        }
        default: return showWorldMenu(interaction, player);
      }
    },
  });

  // ══════════════════════════════════
  // INVENTORY: Túi đồ
  // ══════════════════════════════════
  registerHandler('inventory', {
    async handleButton(interaction, action) {
      const player = getPlayer(interaction.user.id);
      if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });

      switch (action) {
        case 'menu': return showInventoryMenu(interaction, player);
        case 'pills': return showItemsByType(interaction, player, 'pills');
        case 'equipment': return showItemsByType(interaction, player, 'equipment');
        case 'materials': return showItemsByType(interaction, player, 'materials');
        case 'skillbooks': return showItemsByType(interaction, player, 'skillbooks');
        case 'consumables': return showItemsByType(interaction, player, 'pills');
        case 'special': return showItemsByType(interaction, player, 'skillbooks');
        default: return showInventoryMenu(interaction, player);
      }
    },
  });

  // ══════════════════════════════════
  // EQUIPMENT: Trang bị
  // ══════════════════════════════════
  registerHandler('equipment', {
    async handleButton(interaction, action) {
      const player = getPlayer(interaction.user.id);
      if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });

      const equipment = require('../systems/equipment');

      switch (action) {
        case 'menu': return equipment.showEquipmentMenu(interaction, player);
        case 'unequip': {
          // equipment:unequip:slot
          const slot = interaction.customId.split(':')[2];
          return equipment.handleUnequipItem(interaction, player, slot);
        }
        case 'enhance': {
          // equipment:enhance:slot
          const slot = interaction.customId.split(':')[2];
          return equipment.handleEnhance(interaction, player, slot);
        }
        default: return equipment.showEquipmentMenu(interaction, player);
      }
    },
  });

  // ══════════════════════════════════
  // TRADE: Giao dịch
  // ══════════════════════════════════
  registerHandler('trade', {
    async handleButton(interaction, action) {
      const player = getPlayer(interaction.user.id);
      if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });

      const parts = interaction.customId.split(':');
      const targetId = parts[2];

      const npcShop = require('../systems/npc-shop');
      const tradeSystem = require('../systems/trade');
      const auctionSystem = require('../systems/auction');

      switch (action) {
        case 'menu': return showTradeMenu(interaction, player);
        case 'npcshop': return npcShop.showNpcShop(interaction, player);
        case 'npcsell': return npcShop.showNpcSellMenu(interaction, player);
        case 'player': return tradeSystem.showPlayerTradeList(interaction, player);
        case 'select_partner': return tradeSystem.handleSelectTradePartner(interaction, player, targetId);
        case 'offer_lt': return tradeSystem.handleTradeOfferLinhThach(interaction, player, targetId);
        case 'offer_item_menu': return tradeSystem.handleTradeOfferItemMenu(interaction, player, targetId);
        case 'accept_trade': return tradeSystem.executeAcceptTrade(interaction, player, targetId);
        case 'reject_trade': return tradeSystem.executeRejectTrade(interaction, player, targetId);
        case 'auction': return auctionSystem.showAuctionMenu(interaction, player);
        case 'auction_view': return auctionSystem.showAuctionListings(interaction, player);
        case 'auction_list': return auctionSystem.handleAuctionListSelectMenu(interaction, player);
        case 'auction_mylist': return auctionSystem.showMyListings(interaction, player);
        default: return showTradeMenu(interaction, player);
      }
    },

    async handleModal(interaction, action) {
      const player = getPlayer(interaction.user.id);
      if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });

      const parts = interaction.customId.split(':');
      if (action === 'offer_lt_submit') {
        const targetPlayerId = parts[2];
        const amountStr = interaction.fields.getTextInputValue('offer_amount');
        const tradeSystem = require('../systems/trade');
        return tradeSystem.executeTradeOfferLinhThachSubmit(interaction, player, targetPlayerId, amountStr);
      }
      if (action === 'auction_list_submit') {
        const itemId = parts[2];
        const priceStr = interaction.fields.getTextInputValue('list_price');
        const auctionSystem = require('../systems/auction');
        return auctionSystem.executeAuctionList(interaction, player, itemId, priceStr);
      }
    }
  });

  // ══════════════════════════════════
  // SECT: Tông môn
  // ══════════════════════════════════
  registerHandler('sect', {
    async handleButton(interaction, action) {
      const player = getPlayer(interaction.user.id);
      if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });

      const sectsSystem = require('../systems/sects');
      switch (action) {
        case 'menu': return showSectMenu(interaction, player);
        case 'info': return sectsSystem.showSectInfo(interaction, player);
        case 'create': return sectsSystem.handleCreateSect(interaction, player);
        case 'donate': {
          const parts = interaction.customId.split(':');
          const amount = parts[2];
          if (amount) {
            return sectsSystem.executeDonateSect(interaction, player, amount);
          }
          return sectsSystem.handleDonateSect(interaction, player);
        }
        case 'join': return sectsSystem.showSectList(interaction, player);
        case 'leave': {
          const parts = interaction.customId.split(':');
          if (parts[2] === 'confirm') {
            return sectsSystem.confirmLeaveSect(interaction, player);
          }
          return sectsSystem.handleLeaveSect(interaction, player);
        }
        case 'quests': {
          return interaction.reply({ content: 'Nhiệm vụ Tông Môn sẽ sớm ra mắt ở các phase sau.', ephemeral: true });
        }
        default: return showSectMenu(interaction, player);
      }
    },

    async handleModal(interaction, action) {
      const player = getPlayer(interaction.user.id);
      if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });

      if (action === 'create_submit') {
        const sectName = interaction.fields.getTextInputValue('sect_name');
        const sectsSystem = require('../systems/sects');
        return sectsSystem.confirmCreateSect(interaction, player, sectName);
      }
    }
  });

  // ══════════════════════════════════
  // NPC: Nhân vật phi người chơi
  // ══════════════════════════════════
  registerHandler('npc', {
    async handleButton(interaction, action) {
      const player = getPlayer(interaction.user.id);
      if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });

      const parts = interaction.customId.split(':');
      const npcId = parts[2];
      const npcsSystem = require('../systems/npcs');

      switch (action) {
        case 'talk': return npcsSystem.showNpcMenu(interaction, player, npcId);
        case 'shop': return npcsSystem.handleNpcShop(interaction, player, npcId);
        case 'gift_menu': return npcsSystem.handleNpcGiftMenu(interaction, player, npcId);
        case 'quest_accept_list': return npcsSystem.showNpcQuestsToAccept(interaction, player, npcId);
        case 'quest_complete_list': return npcsSystem.showNpcQuestsToComplete(interaction, player, npcId);
        default: return interaction.reply({ content: 'Hành động không hợp lệ.', ephemeral: true });
      }
    }
  });

  // ══════════════════════════════════
  // QUEST: Nhiệm vụ
  // ══════════════════════════════════
  registerHandler('quest', {
    async handleButton(interaction, action) {
      const player = getPlayer(interaction.user.id);
      if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });

      const parts = interaction.customId.split(':');
      const questId = parts[2];
      const questsSystem = require('../systems/quests');

      if (action === 'accept') {
        return questsSystem.handleAcceptQuest(interaction, player, questId);
      } else if (action === 'complete') {
        return questsSystem.handleCompleteQuest(interaction, player, questId);
      }
      return interaction.reply({ content: 'Hành động không hợp lệ.', ephemeral: true });
    }
  });

  // ══════════════════════════════════
  // SECRETREALM: Bí cảnh
  // ══════════════════════════════════
  registerHandler('secretrealm', {
    async handleButton(interaction, action) {
      const player = getPlayer(interaction.user.id);
      if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });

      const parts = interaction.customId.split(':');
      const realmId = parts[2];
      const secretRealmsSystem = require('../systems/secretrealms');

      if (action === 'enter') {
        return secretRealmsSystem.startSecretRealm(interaction, player, realmId);
      }
      return interaction.reply({ content: 'Hành động không hợp lệ.', ephemeral: true });
    }
  });

  // ══════════════════════════════════
  // PET: Linh thú
  // ══════════════════════════════════
  registerHandler('pet', {
    async handleButton(interaction, action) {
      const player = getPlayer(interaction.user.id);
      if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });

      switch (action) {
        case 'menu': return showPetMenu(interaction, player);
        case 'feed': {
          const { handleFeedPet } = require('../systems/pets');
          return handleFeedPet(interaction, player);
        }
        case 'swap': {
          const { handleSwapPet } = require('../systems/pets');
          return handleSwapPet(interaction, player);
        }
        case 'evolve': {
          const { handleEvolvePet } = require('../systems/pets');
          return handleEvolvePet(interaction, player);
        }
        case 'release': {
          const { handleReleasePet } = require('../systems/pets');
          return handleReleasePet(interaction, player);
        }
        default: return showPetMenu(interaction, player);
      }
    },
  });

  // ══════════════════════════════════
  // LEADERBOARD: Bảng xếp hạng
  // ══════════════════════════════════
  registerHandler('leaderboard', {
    async handleButton(interaction, action) {
      switch (action) {
        case 'menu': return showLeaderboardMenu(interaction, getPlayer(interaction.user.id));
        case 'realm':
        case 'power':
        case 'combat':
        case 'wealth':
        case 'sect':
          return showLeaderboard(interaction, action === 'combat' ? 'power' : action);
        default: return showLeaderboardMenu(interaction, getPlayer(interaction.user.id));
      }
    },
  });

  // ══════════════════════════════════
  // CREATION: Tạo nhân vật
  // ══════════════════════════════════
  registerHandler('creation', {
    async handleButton(interaction, action) {
      if (action === 'dao_chinh') {
        return handleDaoPathSelect(interaction, 'chinh');
      } else if (action === 'dao_ma') {
        return handleDaoPathSelect(interaction, 'ma');
      }
    },
  });

  // ══════════════════════════════════
  // CREATE: Xác nhận tạo nhân vật
  // ══════════════════════════════════
  registerHandler('create', {
    async handleButton(interaction, action) {
      // Parse customId: create:confirm:name:rootId:rootType:constitutionId:daoPath
      // or: create:name:daoPath (from modal)
      // or: create:reroll:name:rootId:rootType:daoPath
      const parts = interaction.customId.split(':');

      if (parts[1] === 'confirm' && parts.length >= 7) {
        const [, , name, rootId, rootType, constitutionId, daoPath] = parts;
        return confirmCreation(interaction, name, rootId, rootType, constitutionId, daoPath);
      }

      if (parts[1] === 'reroll') {
        // Re-roll constitution — show root select again with same data
        const { createSpiritualRootSelect } = require('../ui/select-menus');
        const roots = require('../../config/spiritual-roots');
        const [, , name, rootId, rootType, daoPath] = parts;

        // Re-select same root to re-roll constitution
        return handleRootSelect(interaction, rootId, daoPath, name);
      }
    },

    async handleModal(interaction, action) {
      // Modal: create:name:daoPath
      const parts = interaction.customId.split(':');
      if (parts[1] === 'name' && parts[2]) {
        return handleNameSubmit(interaction, parts[2]);
      }
    },
  });

  // ══════════════════════════════════
  // SELECT: Select menu handlers
  // ══════════════════════════════════
  registerHandler('select', {
    async handleSelect(interaction, action, values) {
      const player = getPlayer(interaction.user.id);

      switch (action) {
        case 'root': {
          // Selected spiritual root during character creation
          const rootId = values[0];
          const selectParts = interaction.customId.split(':');
          const daoPath = selectParts[2] || 'chinh';
          const name = selectParts[3] || 'Unknown';
          return handleRootSelect(interaction, rootId, daoPath, name);
        }
        case 'dao_law': {
          // Dao law comprehension
          if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });
          const { handleComprehendSelect } = require('../systems/dao-laws');
          return handleComprehendSelect(interaction, player, values[0]);
        }
        case 'technique': {
          // Technique switch
          if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });
          const { handleTechniqueSwitch } = require('../systems/techniques');
          return handleTechniqueSwitch(interaction, player, values[0]);
        }
        case 'equip_skill': {
          // Equip skill to slot — value format: "skillId:slot"
          if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });
          const { handleEquipSkill } = require('../systems/skills');
          const [skillId, slot] = values[0].split(':');
          return handleEquipSkill(interaction, player, skillId, parseInt(slot));
        }
        case 'pvp_target': {
          // PvP target selected
          if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });
          const { executePvP } = require('../menus/combat-menu');
          if (executePvP) return executePvP(interaction, player, values[0]);
          return interaction.reply({ embeds: [createErrorEmbed('PvP chưa sẵn sàng.')], ephemeral: true });
        }
        case 'swap_pet': {
          // Swap active pet
          if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });
          const { executeSwap } = require('../systems/pets');
          return executeSwap(interaction, player, values[0]);
        }
        case 'release_pet': {
          // Release pet — confirm
          if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });
          const { confirmRelease } = require('../systems/pets');
          return confirmRelease(interaction, player, values[0]);
        }
        case 'equip_item': {
          // Equip item from inventory
          if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });
          const { handleEquipItem } = require('../systems/equipment');
          return handleEquipItem(interaction, player, values[0]);
        }
        case 'use_item': {
          // Use consumable item
          if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });
          const { handleUseItem } = require('../menus/inventory-menu');
          return handleUseItem(interaction, player, values[0]);
        }
        case 'learn_skill': {
          // Learn skill from book
          if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });
          const { handleLearnSkill } = require('../systems/skills');
          return handleLearnSkill(interaction, player, values[0]);
        }
        case 'join_sect': {
          if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });
          const { executeJoinSect } = require('../systems/sects');
          return executeJoinSect(interaction, player, values[0]);
        }
        case 'talk_npc': {
          if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });
          const { showNpcMenu } = require('../systems/npcs');
          return showNpcMenu(interaction, player, values[0]);
        }
        case 'accept_quest': {
          if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });
          const { handleAcceptQuest } = require('../systems/quests');
          return handleAcceptQuest(interaction, player, values[0]);
        }
        case 'complete_quest': {
          if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });
          const { handleCompleteQuest } = require('../systems/quests');
          return handleCompleteQuest(interaction, player, values[0]);
        }
        case 'npc_buy': {
          if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });
          const npcId = interaction.customId.split(':')[2];
          const { executeNpcBuy } = require('../systems/npcs');
          return executeNpcBuy(interaction, player, npcId, values[0]);
        }
        case 'npc_gift': {
          if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });
          const npcId = interaction.customId.split(':')[2];
          const { executeNpcGift } = require('../systems/npcs');
          return executeNpcGift(interaction, player, npcId, values[0]);
        }
        case 'enter_realm': {
          if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });
          const { startSecretRealm } = require('../systems/secretrealms');
          return startSecretRealm(interaction, player, values[0]);
        }
        case 'trade_partner': {
          if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });
          const { handleSelectTradePartner } = require('../systems/trade');
          return handleSelectTradePartner(interaction, player, values[0]);
        }
        case 'trade_item': {
          if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });
          const targetPlayerId = interaction.customId.split(':')[2];
          const { executeTradeOfferItemSelect } = require('../systems/trade');
          return executeTradeOfferItemSelect(interaction, player, targetPlayerId, values[0]);
        }
        case 'npc_shop_buy': {
          if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });
          const { executeNpcShopBuy } = require('../systems/npc-shop');
          return executeNpcShopBuy(interaction, player, values[0]);
        }
        case 'npc_shop_sell': {
          if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });
          const { executeNpcShopSell } = require('../systems/npc-shop');
          return executeNpcShopSell(interaction, player, values[0]);
        }
        case 'auction_buy': {
          if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });
          const { executeAuctionBuy } = require('../systems/auction');
          return executeAuctionBuy(interaction, player, values[0]);
        }
        case 'auction_list_item': {
          if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });
          const { handleAuctionListSelect } = require('../systems/auction');
          return handleAuctionListSelect(interaction, player, values[0]);
        }
        case 'auction_cancel': {
          if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });
          const { executeCancelListing } = require('../systems/auction');
          return executeCancelListing(interaction, player, values[0]);
        }
        default:
          return interaction.reply({ embeds: [createErrorEmbed('Lựa chọn không hợp lệ.')], ephemeral: true });
      }
    },
  });

  // ══════════════════════════════════
  // CONFIRM: Xác nhận hành động
  // ══════════════════════════════════
  registerHandler('confirm', {
    async handleButton(interaction, action) {
      if (action === 'reincarnate') {
        return handleReincarnate(interaction);
      }
    },
  });

  // ══════════════════════════════════
  // CANCEL: Hủy hành động
  // ══════════════════════════════════
  registerHandler('cancel', {
    async handleButton(interaction, action) {
      const player = getPlayer(interaction.user.id);
      if (player) {
        return showMainMenu(interaction, player);
      }
      return interaction.update({ embeds: [createErrorEmbed('Đã hủy.')], components: [] });
    },
  });

  logger.info(`✦ Đã tải ${handlers.size} handler(s)`);
}

/**
 * Xử lý button interaction
 */
async function handleButton(interaction) {
  const parts = interaction.customId.split(':');
  const prefix = parts[0];

  const handler = handlers.get(prefix);
  if (!handler || !handler.handleButton) {
    logger.warn(`Không tìm thấy handler cho button: ${interaction.customId}`);
    try {
      if (interaction.replied || interaction.deferred) {
        return interaction.followUp({ embeds: [createErrorEmbed('Chức năng này chưa được triển khai.')], ephemeral: true });
      }
      return interaction.reply({ embeds: [createErrorEmbed('Chức năng này chưa được triển khai.')], ephemeral: true });
    } catch (e) { /* ignore */ }
    return;
  }

  try {
    await handler.handleButton(interaction, parts[1]);
  } catch (err) {
    logger.error(`Lỗi xử lý button [${interaction.customId}]:`, err.message);
    logger.error(err.stack);
    try {
      const reply = interaction.replied || interaction.deferred
        ? interaction.followUp.bind(interaction)
        : interaction.reply.bind(interaction);
      await reply({ embeds: [createErrorEmbed('Đã xảy ra lỗi. Vui lòng thử lại.')], ephemeral: true });
    } catch (e) { /* ignore */ }
  }
}

/**
 * Xử lý select menu interaction
 */
async function handleSelectMenu(interaction) {
  const parts = interaction.customId.split(':');
  const prefix = parts[0];

  const handler = handlers.get(prefix);
  if (!handler || !handler.handleSelect) {
    logger.warn(`Không tìm thấy handler cho select: ${interaction.customId}`);
    return interaction.reply({ embeds: [createErrorEmbed('Chức năng này chưa được triển khai.')], ephemeral: true });
  }

  try {
    await handler.handleSelect(interaction, parts[1], interaction.values);
  } catch (err) {
    logger.error(`Lỗi xử lý select [${interaction.customId}]:`, err.message);
    logger.error(err.stack);
    try {
      const reply = interaction.replied || interaction.deferred
        ? interaction.followUp.bind(interaction)
        : interaction.reply.bind(interaction);
      await reply({ embeds: [createErrorEmbed('Đã xảy ra lỗi. Vui lòng thử lại.')], ephemeral: true });
    } catch (e) { /* ignore */ }
  }
}

/**
 * Xử lý modal submission
 */
async function handleModal(interaction) {
  const parts = interaction.customId.split(':');
  const prefix = parts[0];

  const handler = handlers.get(prefix);
  if (!handler || !handler.handleModal) {
    logger.warn(`Không tìm thấy handler cho modal: ${interaction.customId}`);
    return interaction.reply({ embeds: [createErrorEmbed('Chức năng này chưa được triển khai.')], ephemeral: true });
  }

  try {
    await handler.handleModal(interaction, parts[1]);
  } catch (err) {
    logger.error(`Lỗi xử lý modal [${interaction.customId}]:`, err.message);
    logger.error(err.stack);
    try {
      const reply = interaction.replied || interaction.deferred
        ? interaction.followUp.bind(interaction)
        : interaction.reply.bind(interaction);
      await reply({ embeds: [createErrorEmbed('Đã xảy ra lỗi. Vui lòng thử lại.')], ephemeral: true });
    } catch (e) { /* ignore */ }
  }
}

module.exports = {
  registerHandler,
  loadHandlers,
  handleButton,
  handleSelectMenu,
  handleModal,
};

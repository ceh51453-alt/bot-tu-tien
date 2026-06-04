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
  const { showCultivationMenu, handleCultivation, handleBreakthrough, handleInteractiveCultivation } = require('../menus/cultivation-menu');
  const { showCombatMenu, startHunt } = require('../menus/combat-menu');
  const { showWorldMenu, handleMining } = require('../menus/world-menu');
  const { showInventoryMenu, showItemsByType } = require('../menus/inventory-menu');
  const { showTradeMenu, showNpcShop } = require('../menus/trade-menu');
  const { showSectMenu } = require('../menus/sect-menu');
  const { showPetMenu, handleCatchPet } = require('../menus/pet-menu');
  const { showLeaderboardMenu, showLeaderboard } = require('../menus/leaderboard-menu');
  const { handleDaoPathSelect, handleNameSubmit, handleRootSelect, handleWeaponSelect, confirmCreation, handleReincarnate } = require('../systems/character-creation');

  // ══════════════════════════════════
  // MENU: Main menu navigation
  // ══════════════════════════════════
  registerHandler('menu', {
    async handleButton(interaction, action) {
      const player = getPlayer(interaction.user.id);
      if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật. Dùng `/tutien` để tạo.')], ephemeral: true });

      switch (action) {
        case 'main': return showMainMenu(interaction, player);
        case 'cultivation': return showCultivationMenu(interaction, player);
        case 'profile': return showProfileMenu(interaction, player);
        case 'combat': return showCombatMenu(interaction, player);
        case 'world': return showWorldMenu(interaction, player);
        case 'inventory': return showInventoryMenu(interaction, player);
        case 'trade': return showTradeMenu(interaction, player);
        case 'sect': return showSectMenu(interaction, player);
        case 'pet': return showPetMenu(interaction, player);
        case 'leaderboard': return showLeaderboardMenu(interaction, player);
        case 'equipment': {
          const equipment = require('../systems/equipment');
          return equipment.showEquipmentMenu(interaction, player);
        }
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
        case 'technique': {
          const { showTechniqueMenu } = require('../systems/techniques');
          return showTechniqueMenu(interaction, player);
        }
        case 'skills': {
          const { showSkillsMenu } = require('../systems/skills');
          return showSkillsMenu(interaction, player);
        }
        case 'dao_tam': {
          const { showDaoTamMenu } = require('../systems/dao-tam');
          return showDaoTamMenu(interaction, player);
        }
        case 'be_quan': {
          const { startBeQuan } = require('../systems/afk-cultivation');
          return startBeQuan(interaction, player);
        }
        case 'xuat_quan': {
          const { endBeQuan } = require('../systems/afk-cultivation');
          return endBeQuan(interaction, player);
        }
        case 'khi_van': {
          const { showKhiVanMenu } = require('../systems/khi-van');
          return showKhiVanMenu(interaction, player);
        }
        default: return showCultivationMenu(interaction, player);
      }
    },
  });

  // ══════════════════════════════════
  // ICULTIVATION: Tu Luyện Interactive (mini-game)
  // ══════════════════════════════════
  registerHandler('icultivation', {
    async handleButton(interaction, action) {
      const player = getPlayer(interaction.user.id);
      if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });

      // action format: r1:element, r2:choice, r3:eventId:type:index, next:N, finish
      return handleInteractiveCultivation(interaction, player, action);
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

      const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
      const { COLORS } = require('../utils/constants');

      switch (action) {
        case 'menu': return showCombatMenu(interaction, player);
        case 'hunt': return startHunt(interaction, player);
        case 'hunt_confirm': {
          const { executeHunt } = require('../menus/combat-menu');
          return executeHunt(interaction, player);
        }
        case 'beast': {
          const { startBeastHunt } = require('../menus/combat-menu');
          return startBeastHunt(interaction, player);
        }
        case 'beast_confirm': {
          const { executeBeastHunt } = require('../menus/combat-menu');
          return executeBeastHunt(interaction, player);
        }
        case 'pvp': {
          const { startPvP } = require('../menus/combat-menu');
          return startPvP(interaction, player);
        }
        case 'party': {
          const embed = new EmbedBuilder()
            .setColor(COLORS.info)
            .setTitle('👥 Tổ Đội')
            .setDescription('Tính năng Tổ Đội đang được phát triển!\n\n_Sẽ ra mắt trong bản cập nhật tiếp theo._')
            .setTimestamp();
          return interaction.update({ embeds: [embed], components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId('combat:menu').setLabel('🔙 Chiến Trường').setStyle(ButtonStyle.Secondary)
            )
          ]});
        }
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

      const { showSkillsMenu, handleUnequipSkill, showEquipSelectMenu, showUnequipSelectMenu } = require('../systems/skills');

      switch (action) {
        case 'menu': return showSkillsMenu(interaction, player);
        case 'equip': {
          return showEquipSelectMenu(interaction, player);
        }
        case 'unequip': {
          // skills:unequip:slot — nếu có slot thì tháo trực tiếp, không thì hiện menu chọn
          const slot = parseInt(interaction.customId.split(':')[2]);
          if (!isNaN(slot)) {
            return handleUnequipSkill(interaction, player, slot);
          }
          return showUnequipSelectMenu(interaction, player);
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
          const questsSystem = require('../systems/quests');
          if (questsSystem.showPlayerQuests) {
            return questsSystem.showPlayerQuests(interaction, player);
          }
          return interaction.reply({ content: 'Hệ thống nhiệm vụ chưa sẵn sàng.', ephemeral: true });
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
      // Parse customId formats:
      // create:confirm:name:rootId:rootType:constitutionId:daoPath:weaponTypeId:ngoTinh:vanKhi:traitIds
      // create:reroll_all:name:rootId:rootType:daoPath
      // create:reroll:name:rootId:rootType:daoPath (legacy)
      const parts = interaction.customId.split(':');

      if (parts[1] === 'confirm' && parts.length >= 11) {
        // Mới: có weapon type + stats
        let [, , name, rootId, rootType, constitutionId, daoPath, weaponTypeId, ngoTinh, vanKhi, ...traitParts] = parts;
        const traitIds = traitParts.join(':'); // Trait ids có thể chứa dấu phẩy
        try { name = decodeURIComponent(name); } catch (_e) { /* already decoded */ }
        return confirmCreation(interaction, name, rootId, rootType, constitutionId, daoPath, weaponTypeId, ngoTinh, vanKhi, traitIds);
      }

      if (parts[1] === 'confirm' && parts.length >= 7) {
        // Legacy: không có weapon type
        let [, , name, rootId, rootType, constitutionId, daoPath] = parts;
        try { name = decodeURIComponent(name); } catch (_e) { /* already decoded */ }
        return confirmCreation(interaction, name, rootId, rootType, constitutionId, daoPath, null, '100', '80', '');
      }

      if (parts[1] === 'reroll' || parts[1] === 'reroll_all') {
        // Re-roll: quay lại chọn root → weapon → roll lại
        let [, , name, rootId, rootType, daoPath] = parts;
        try { name = decodeURIComponent(name); } catch (_e) { /* already decoded */ }
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

    async handleSelect(interaction, action, values) {
      // Select menu: create:weapon:name:rootId:rootType:constitutionId:daoPath
      const parts = interaction.customId.split(':');
      if (parts[1] === 'weapon' && parts.length >= 7) {
        const { handleWeaponSelect } = require('../systems/character-creation');
        let [, , name, rootId, rootType, constitutionId, daoPath] = parts;
        try { name = decodeURIComponent(name); } catch (_e) { /* already decoded */ }
        return handleWeaponSelect(interaction, values[0], name, rootId, rootType, constitutionId, daoPath);
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
          let rawName = selectParts[3] || 'Unknown';
          // Decode tên nếu bị encode từ phiên trước
          try { rawName = decodeURIComponent(rawName); } catch (_e) { /* already decoded */ }
          const name = rawName;
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
        case 'unequip_skill': {
          // Tháo kỹ năng qua select menu — value = slot number
          if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });
          const { handleUnequipSkill } = require('../systems/skills');
          const slot = parseInt(values[0]);
          return handleUnequipSkill(interaction, player, slot);
        }
        case 'qcbh_equip': {
          // Trang bị chiến kỹ — value = "slotType:skillId"
          if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });
          const { equipQcbhSkill } = require('../menus/qcbh-skill-menu');
          const [qcbhSlotType, qcbhSkillId] = values[0].split(':');
          return equipQcbhSkill(interaction, player, qcbhSlotType, qcbhSkillId);
        }
        case 'nghich_thien_equip': {
          // Trang bị Nghịch Thiên — value = "slot:traitId"
          if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });
          const { equipNghichThien } = require('../menus/nghich-thien-menu');
          const [ntSlot, ntTraitId] = values[0].split(':');
          return equipNghichThien(interaction, player, parseInt(ntSlot), ntTraitId);
        }
        case 'tam_phap_equip': {
          // Trang bị Tâm Pháp — value = "slotType:tamPhapId"
          if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });
          const { equipTamPhap } = require('../menus/tam-phap-menu');
          const [tpSlotType, tpId] = values[0].split(':');
          return equipTamPhap(interaction, player, tpSlotType, tpId);
        }
        case 'ngu_kiem_travel': {
          if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });
          const { setPlayerLocation, LOCATIONS, getPlayerLocation, calculateTravelTime } = require('../systems/ngu-kiem');
          const { EmbedBuilder: TravelEmbed, ActionRowBuilder: TravelRow, ButtonBuilder: TravelBtn, ButtonStyle: TravelStyle } = require('discord.js');
          const destId = values[0];
          const dest = LOCATIONS.find(l => l.id === destId);
          if (!dest) return interaction.reply({ embeds: [createErrorEmbed('Địa điểm không tồn tại.')], ephemeral: true });

          const currentLoc = getPlayerLocation(player.id);
          const travelTime = calculateTravelTime(player, currentLoc, dest);
          setPlayerLocation(player.id, destId);

          const embed = new TravelEmbed()
            .setColor('#2ecc71')
            .setTitle(`🗡️ Ngự Kiếm — Di chuyển`)
            .setDescription(
              `**${player.name}** ngự kiếm bay từ ${currentLoc.emoji} **${currentLoc.name}** đến ${dest.emoji} **${dest.name}**!\n\n` +
              `⏱️ Thời gian: **${travelTime} phút**\n` +
              `📍 Vị trí mới: **${dest.name}**\n\n` +
              `*${dest.description}*`
            )
            .setTimestamp();

          const row = new TravelRow().addComponents(
            new TravelBtn().setCustomId('ngu_kiem:map').setLabel('🗺️ Xem Bản Đồ').setStyle(TravelStyle.Primary),
            new TravelBtn().setCustomId('menu:main').setLabel('🔙 Menu').setStyle(TravelStyle.Secondary),
          );
          return interaction.update({ embeds: [embed], components: [row] });
        }
        case 'dao_tam': {
          if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });
          const { selectDaoTam } = require('../systems/dao-tam');
          return selectDaoTam(interaction, player, values[0]);
        }
        case 'change_dao_tam': {
          if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });
          const { confirmChangeDaoTam } = require('../systems/dao-tam');
          return confirmChangeDaoTam(interaction, player, values[0]);
        }
        default:
          return interaction.reply({ embeds: [createErrorEmbed('Lựa chọn không hợp lệ.')], ephemeral: true });
      }
    },
  });

  // ══════════════════════════════════
  // CHIẾN_KỸ: Kỹ năng chiến đấu nâng cao
  // ══════════════════════════════════
  registerHandler('qcbh_skill', {
    async handleButton(interaction, action) {
      const player = getPlayer(interaction.user.id);
      if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });

      const { showQcbhSkillMenu, showSlotSkills } = require('../menus/qcbh-skill-menu');
      const { showNghichThienMenu } = require('../menus/nghich-thien-menu');
      const { showTamPhapMenu, showTamPhapSlot } = require('../menus/tam-phap-menu');

      switch (action) {
        case 'menu': return showQcbhSkillMenu(interaction, player);
        case 'vo_ky': return showSlotSkills(interaction, player, 'vo_ky');
        case 'than_phap': return showSlotSkills(interaction, player, 'than_phap');
        case 'tuyet_ky': return showSlotSkills(interaction, player, 'tuyet_ky');
        case 'than_thong': return showSlotSkills(interaction, player, 'than_thong');
        case 'nghich_thien': return showNghichThienMenu(interaction, player);
        case 'tam_phap': return showTamPhapMenu(interaction, player);
        // Tâm pháp slot types
        case 'tp_than_cong': return showTamPhapSlot(interaction, player, 'than_cong');
        case 'tp_dai_phap': return showTamPhapSlot(interaction, player, 'dai_phap');
        case 'tp_bi_quyen': return showTamPhapSlot(interaction, player, 'bi_quyen');
        case 'tp_quyet': return showTamPhapSlot(interaction, player, 'quyet');
        case 'tp_ngang': return showTamPhapSlot(interaction, player, 'ngang');
        case 'tp_luc': return showTamPhapSlot(interaction, player, 'luc');
        default: return showQcbhSkillMenu(interaction, player);
      }
    },
  });

  // ══════════════════════════════════
  // ĐẠO TÂM: Hệ thống đạo tâm
  // ══════════════════════════════════
  registerHandler('dao_tam', {
    async handleButton(interaction, action) {
      const player = getPlayer(interaction.user.id);
      if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });

      const daoTamSystem = require('../systems/dao-tam');
      switch (action) {
        case 'menu': return daoTamSystem.showDaoTamMenu(interaction, player);
        case 'meditate': return daoTamSystem.handleMeditate(interaction, player);
        case 'change': return daoTamSystem.handleChangeDaoTam(interaction, player);
        default: return daoTamSystem.showDaoTamMenu(interaction, player);
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

  // ══════════════════════════════════
  // WORLDBOSS: World Boss Raid
  // ══════════════════════════════════
  registerHandler('worldboss', {
    async handleButton(interaction, action) {
      const player = getPlayer(interaction.user.id);
      if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật. Dùng `/tutien` để tạo.')], ephemeral: true });

      const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
      const { COLORS } = require('../utils/constants');
      const worldBoss = require('../systems/world-boss');

      switch (action) {
        case 'join': {
          // Hiển thị xác nhận tham gia + nút tấn công
          const raid = worldBoss.getActiveRaid();
          if (!raid || raid.status !== 'active') {
            return interaction.reply({
              embeds: [createErrorEmbed('Không có World Boss đang hoạt động!')],
              ephemeral: true,
            });
          }

          const hpBar = worldBoss.createHpBar(raid.currentHp, raid.maxHp, 20);
          const remainingTime = worldBoss.getRemainingTime();

          const embed = new EmbedBuilder()
            .setColor(COLORS.COMBAT)
            .setTitle(`${raid.bossEmoji} ${raid.bossName} — Raid`)
            .setDescription(
              `**${player.name}** tham gia chiến đấu!\n\n` +
              `❤️ Boss HP: ${hpBar}\n` +
              `⚔️ Giai đoạn: **${raid.phase}**/3\n` +
              `⏰ Thời gian còn: **${remainingTime}**\n` +
              `👥 Người tham gia: **${raid.participants.size}**\n\n` +
              `Nhấn **Tấn Công** để gây sát thương!\n` +
              `⏱️ Cooldown: **60 giây** giữa mỗi lần đánh.`
            )
            .setTimestamp();

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('worldboss:attack')
              .setLabel('⚔️ Tấn Công Boss')
              .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
              .setCustomId('worldboss:status')
              .setLabel('📊 Trạng Thái')
              .setStyle(ButtonStyle.Primary),
          );

          return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
        }

        case 'attack': {
          // Tấn công boss
          const raid = worldBoss.getActiveRaid();
          if (!raid || raid.status !== 'active') {
            return interaction.reply({
              embeds: [createErrorEmbed('World Boss đã bị tiêu diệt hoặc biến mất!')],
              ephemeral: true,
            });
          }

          const result = worldBoss.attackBoss(player);

          if (result.error) {
            const embed = new EmbedBuilder()
              .setColor(result.cooldown ? COLORS.WARNING : COLORS.ERROR)
              .setTitle(result.cooldown ? '⏳ Đang Hồi Chiêu' : '❌ Lỗi')
              .setDescription(result.error);

            const row = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId('worldboss:attack')
                .setLabel('⚔️ Tấn Công Boss')
                .setStyle(ButtonStyle.Danger),
              new ButtonBuilder()
                .setCustomId('worldboss:status')
                .setLabel('📊 Trạng Thái')
                .setStyle(ButtonStyle.Primary),
            );

            try {
              return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
            } catch (_e) {
              return interaction.update({ embeds: [embed], components: [row] });
            }
          }

          const hpBar = worldBoss.createHpBar(result.bossHpNow, result.bossMaxHp, 20);
          const combatLog = result.log.join('\n');

          // Boss bị hạ → phân phối phần thưởng
          if (result.defeated) {
            const rewards = worldBoss.distributeRewards();

            // Bảng xếp hạng phần thưởng
            let rewardText = '';
            const top = rewards.slice(0, 10);
            for (let i = 0; i < top.length; i++) {
              const r = top[i];
              const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
              rewardText += `${medal} **${r.name}** — DMG: ${worldBoss.formatNumber(r.damage)} (${r.contribution}%) → +${worldBoss.formatNumber(r.exp)} EXP, +${worldBoss.formatNumber(r.gold)} 💎\n`;
            }

            const embed = new EmbedBuilder()
              .setColor('#FFD700')
              .setTitle(`🏆 WORLD BOSS ĐÃ BỊ TIÊU DIỆT!`)
              .setDescription(
                `## ${raid.bossEmoji} ${raid.bossName} đã gục ngã!\n\n` +
                `📜 **Nhật Ký Tấn Công Cuối:**\n${combatLog}\n\n` +
                `❤️ HP: ${hpBar}\n\n` +
                `🏆 **BẢNG XẾP HẠNG PHẦN THƯỞNG:**\n${rewardText}\n` +
                `👥 Tổng người tham gia: **${rewards.length}**`
              )
              .setTimestamp();

            // Reply (không ephemeral để mọi người thấy)
            try {
              await interaction.reply({ embeds: [embed] });
            } catch (_e) {
              await interaction.update({ embeds: [embed], components: [] });
            }

            // Gửi thêm thông báo công khai vào channel
            if (raid.channelId) {
              try {
                const channel = await interaction.client.channels.fetch(raid.channelId);
                if (channel) {
                  const publicEmbed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setTitle(`🏆 WORLD BOSS ĐÃ BỊ TIÊU DIỆT!`)
                    .setDescription(
                      `## ${raid.bossEmoji} ${raid.bossName} đã gục ngã!\n\n` +
                      `🏆 **TOP CONTRIBUTORS:**\n${rewardText}\n` +
                      `👥 Tổng: **${rewards.length}** tu sĩ tham gia`
                    )
                    .setTimestamp();
                  await channel.send({ embeds: [publicEmbed] });
                }
              } catch (_e) { /* ignore */ }
            }

            return;
          }

          // Chưa hạ → hiển thị kết quả tấn công
          const embed = new EmbedBuilder()
            .setColor(COLORS.COMBAT)
            .setTitle(`⚔️ Tấn Công ${raid.bossEmoji} ${raid.bossName}`)
            .setDescription(
              `📜 **Nhật Ký Chiến Đấu:**\n${combatLog}\n\n` +
              `💥 Tổng sát thương: **${worldBoss.formatNumber(result.totalDamage)}**\n` +
              `💔 Boss phản công: **${worldBoss.formatNumber(result.bossDmg)}** HP\n\n` +
              `❤️ Boss HP: ${hpBar}\n` +
              `⚔️ Giai đoạn: **${result.phase}**/3\n` +
              `👥 Người tham gia: **${result.participantCount}**\n\n` +
              `⏱️ Chờ **60 giây** để tấn công tiếp.`
            )
            .setTimestamp();

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('worldboss:attack')
              .setLabel('⚔️ Tấn Công Tiếp')
              .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
              .setCustomId('worldboss:status')
              .setLabel('📊 Trạng Thái')
              .setStyle(ButtonStyle.Primary),
          );

          try {
            return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
          } catch (_e) {
            return interaction.update({ embeds: [embed], components: [row] });
          }
        }

        case 'status': {
          // Xem trạng thái boss + bảng xếp hạng
          const raid = worldBoss.getActiveRaid();
          if (!raid || raid.status !== 'active') {
            return interaction.reply({
              embeds: [createErrorEmbed('Không có World Boss đang hoạt động!')],
              ephemeral: true,
            });
          }

          const hpBar = worldBoss.createHpBar(raid.currentHp, raid.maxHp, 20);
          const remainingTime = worldBoss.getRemainingTime();
          const leaderboard = worldBoss.getRaidLeaderboard();

          let lbText = '';
          const top = leaderboard.slice(0, 10);
          for (let i = 0; i < top.length; i++) {
            const e = top[i];
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
            lbText += `${medal} **${e.name}** — ${worldBoss.formatNumber(e.totalDamage)} DMG (${e.attacks} lần đánh)\n`;
          }
          if (lbText === '') lbText = '_Chưa ai tấn công._';

          const embed = new EmbedBuilder()
            .setColor(COLORS.COMBAT)
            .setTitle(`${raid.bossEmoji} ${raid.bossName} — Trạng Thái`)
            .setDescription(
              `❤️ HP: ${hpBar}\n` +
              `⚔️ Giai đoạn: **${raid.phase}**/3\n` +
              `⏰ Thời gian còn: **${remainingTime}**\n` +
              `👥 Người tham gia: **${raid.participants.size}**\n\n` +
              `🏆 **BẢNG XẾP HẠNG:**\n${lbText}`
            )
            .setTimestamp();

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('worldboss:attack')
              .setLabel('⚔️ Tấn Công Boss')
              .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
              .setCustomId('worldboss:status')
              .setLabel('🔄 Làm Mới')
              .setStyle(ButtonStyle.Primary),
          );

          try {
            return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
          } catch (_e) {
            return interaction.update({ embeds: [embed], components: [row] });
          }
        }

        default:
          return interaction.reply({ embeds: [createErrorEmbed('Hành động không hợp lệ.')], ephemeral: true });
      }
    },
  });

  // ══════════════════════════════════
  // ICOMBAT: Interactive Boss Combat
  // ══════════════════════════════════
  registerHandler('icombat', {
    async handleButton(interaction, action) {
      const player = getPlayer(interaction.user.id);
      if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });

      const {
        executePlayerTurn,
        buildInteractiveEmbed,
        buildActionButtons,
        buildSkillSelectMenu,
      } = require('../systems/interactive-combat');

      const combatMap = interaction.client._interactiveCombats;
      if (!combatMap) return interaction.reply({ embeds: [createErrorEmbed('Không có trận chiến nào đang diễn ra.')], ephemeral: true });

      const state = combatMap.get(interaction.user.id);
      if (!state) return interaction.reply({ embeds: [createErrorEmbed('Trận chiến đã kết thúc hoặc không tồn tại.')], ephemeral: true });

      switch (action) {
        case 'basic': {
          const result = executePlayerTurn(state, 'basic');
          return _handleTurnResult(interaction, state, result, combatMap, player);
        }

        case 'skills': {
          // Show skill select menu
          const embed = buildInteractiveEmbed(state);
          const { selectRow, backRow } = buildSkillSelectMenu(state);
          return interaction.update({ embeds: [embed], components: [selectRow, backRow] });
        }

        case 'back': {
          // Back to action buttons
          const embed = buildInteractiveEmbed(state);
          const buttons = buildActionButtons(state);
          return interaction.update({ embeds: [embed], components: Array.isArray(buttons) ? buttons : [buttons] });
        }

        case 'flee': {
          const result = executePlayerTurn(state, 'flee');
          return _handleTurnResult(interaction, state, result, combatMap, player);
        }

        default: {
          // Handle chiến kỹ skill buttons: icombat:qcbh:vo_ky, icombat:qcbh:than_phap, etc.
          if (action.startsWith('qcbh:')) {
            const qcbhSlot = action.replace('qcbh:', '');
            const result = executePlayerTurn(state, 'qcbh', qcbhSlot);
            return _handleTurnResult(interaction, state, result, combatMap, player);
          }
          return interaction.reply({ embeds: [createErrorEmbed('Hành động không hợp lệ.')], ephemeral: true });
        }
      }
    },

    async handleSelect(interaction, action, values) {
      const player = getPlayer(interaction.user.id);
      if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });

      if (action !== 'skill_select') {
        return interaction.reply({ embeds: [createErrorEmbed('Lựa chọn không hợp lệ.')], ephemeral: true });
      }

      const { executePlayerTurn } = require('../systems/interactive-combat');
      const combatMap = interaction.client._interactiveCombats;
      if (!combatMap) return interaction.reply({ embeds: [createErrorEmbed('Không có trận chiến.')], ephemeral: true });

      const state = combatMap.get(interaction.user.id);
      if (!state) return interaction.reply({ embeds: [createErrorEmbed('Trận chiến đã kết thúc.')], ephemeral: true });

      const skillId = values[0];
      if (skillId === 'none') {
        return interaction.reply({ embeds: [createErrorEmbed('Không có kỹ năng khả dụng.')], ephemeral: true });
      }

      const result = executePlayerTurn(state, 'skill', skillId);
      return _handleTurnResult(interaction, state, result, combatMap, player);
    },
  });

  /**
   * Xử lý kết quả lượt chiến đấu interactive
   * @private
   */
  async function _handleTurnResult(interaction, state, result, combatMap, player) {
    const {
      buildInteractiveEmbed,
      buildActionButtons,
    } = require('../systems/interactive-combat');

    const db = require('../database/connection');
    const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
    const { COLORS } = require('../utils/constants');
    const { formatNumber, randomInt } = require('../utils/helpers');

    const isOver = result.playerDead || result.enemyDead || result.fled || state.turn >= state.maxTurns;

    if (!isOver) {
      // Continue combat
      const embed = buildInteractiveEmbed(state);
      const buttons = buildActionButtons(state);
      return interaction.update({ embeds: [embed], components: Array.isArray(buttons) ? buttons : [buttons] });
    }

    // ═══ COMBAT END ═══
    combatMap.delete(interaction.user.id);
    const monster = state.monsterData;
    const recentLog = state.turnLog.slice(-10).join('\n');

    if (result.fled) {
      // Fled — small HP penalty
      const hpPenalty = Math.floor(player.max_hp * 0.1);
      db.prepare('UPDATE players SET hp = MAX(1, hp - ?) WHERE id = ?').run(hpPenalty, player.id);

      const embed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('🏃 Bỏ Chạy Thành Công!')
        .setDescription(
          `**${player.name}** đã thoát khỏi **${monster.emoji} ${monster.name}**!\n\n` +
          `💔 Mất **${hpPenalty}** HP do chạy trốn.\n\n` +
          `📜 **Nhật Ký:**\n${recentLog}`
        )
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('combat:menu').setLabel('🔙 Chiến Trường').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('menu:main').setLabel('🏠 Menu Chính').setStyle(ButtonStyle.Primary),
      );
      return interaction.update({ embeds: [embed], components: [row] });
    }

    if (result.enemyDead) {
      // Victory!
      const expReward = (monster.exp_reward || 0) + randomInt(0, Math.floor((monster.exp_reward || 0) * 0.2));
      const linhThachReward = randomInt(5, 20) * ((player.realm_index || 0) + 1);

      // Update player: add rewards + update HP
      const finalHp = Math.max(1, state.player.hp);
      db.prepare('UPDATE players SET exp = exp + ?, linh_thach = linh_thach + ?, hp = ? WHERE id = ?')
        .run(expReward, linhThachReward, finalHp, player.id);

      // Cập nhật tiến trình nhiệm vụ
      try {
        const { updateQuestProgress } = require('../systems/quests');
        updateQuestProgress(player.id, 'hunt', monster.id, 1);
      } catch (_err) { /* ignore */ }

      // Drop items
      let dropsText = '';
      if (monster.drops && monster.drops.length > 0) {
        const { getItemById } = require('../../config/items');
        for (const drop of monster.drops) {
          if (Math.random() < drop.chance) {
            try {
              const existing = db.prepare('SELECT quantity FROM inventory WHERE player_id = ? AND item_id = ?').get(player.id, drop.item_id);
              if (existing) {
                db.prepare('UPDATE inventory SET quantity = quantity + 1 WHERE player_id = ? AND item_id = ?').run(player.id, drop.item_id);
              } else {
                db.prepare('INSERT INTO inventory (player_id, item_id, quantity) VALUES (?, ?, 1)').run(player.id, drop.item_id);
              }
              const item = getItemById(drop.item_id);
              const itemName = item ? `${item.emoji || '📦'} ${item.name}` : drop.item_id;
              dropsText += `  • ${itemName}\n`;
            } catch (_e) { /* item not found */ }
          }
        }
      }
      if (!dropsText) dropsText = '  _Không có vật phẩm rơi ra._\n';

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle(`🏆 CHIẾN THẮNG! — ${monster.emoji} ${monster.name}`)
        .setDescription(
          `**${player.name}** đã đánh bại **${monster.emoji} ${monster.name}**!\n\n` +
          `📜 **Nhật Ký Trận Đấu:**\n${recentLog}\n\n` +
          `🎁 **Phần Thưởng:**\n` +
          `  ✨ EXP: +**${formatNumber(expReward)}**\n` +
          `  💎 Linh Thạch: +**${formatNumber(linhThachReward)}**\n\n` +
          `📦 **Vật Phẩm Rơi:**\n${dropsText}\n` +
          `❤️ HP còn lại: **${formatNumber(finalHp)}**/${formatNumber(state.player.maxHp)}`
        )
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('combat:menu').setLabel('🔙 Chiến Trường').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('menu:main').setLabel('🏠 Menu Chính').setStyle(ButtonStyle.Primary),
      );
      return interaction.update({ embeds: [embed], components: [row] });
    }

    if (result.playerDead) {
      // Defeat — permadeath!
      db.prepare('UPDATE players SET hp = 0, is_dead = 1 WHERE id = ?').run(player.id);

      const embed = new EmbedBuilder()
        .setColor('#E74C3C')
        .setTitle('💀 THÂN TỬ ĐẠO TIÊU')
        .setDescription(
          `**${player.name}** đã bị ${monster.emoji} **${monster.name}** giết chết!\n\n` +
          `📜 **Nhật Ký:**\n${recentLog}\n\n` +
          `💀 **PERMADEATH** — Nhân vật đã mất vĩnh viễn.\n` +
          `_Dùng /tutien để bắt đầu lại._`
        )
        .setTimestamp();

      return interaction.update({ embeds: [embed], components: [] });
    }

    // Timeout — draw
    const embed = new EmbedBuilder()
      .setColor('#95A5A6')
      .setTitle('⏰ HẾT THỜI GIAN!')
      .setDescription(
        `Trận chiến giữa **${player.name}** và **${monster.emoji} ${monster.name}** bất phân thắng bại!\n\n` +
        `📜 **Nhật Ký:**\n${recentLog}`
      )
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('combat:menu').setLabel('🔙 Chiến Trường').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('menu:main').setLabel('🏠 Menu Chính').setStyle(ButtonStyle.Primary),
    );
    return interaction.update({ embeds: [embed], components: [row] });
  }

  logger.info(`✦ Đã tải ${handlers.size} handler(s)`);
}

// Các prefix cho phép bất kỳ ai cũng tương tác được (không cần owner check)
const PUBLIC_PREFIXES = new Set(['worldboss', 'leaderboard']);

/**
 * Kiểm tra quyền sở hữu interaction
 * @returns {boolean} true nếu user được phép tương tác
 */
function checkInteractionOwner(interaction) {
  const prefix = interaction.customId.split(':')[0];
  // Cho phép các interaction công cộng
  if (PUBLIC_PREFIXES.has(prefix)) return true;
  // Nếu message có thông tin interaction gốc, kiểm tra user
  const originalUserId = interaction.message?.interaction?.user?.id;
  if (originalUserId && originalUserId !== interaction.user.id) {
    return false;
  }
  return true;
}

/**
 * Xử lý button interaction
 */
async function handleButton(interaction) {
  const parts = interaction.customId.split(':');
  const prefix = parts[0];

  // Kiểm tra quyền sở hữu — chặn người khác bấm nút của mình
  if (!checkInteractionOwner(interaction)) {
    return interaction.reply({
      embeds: [createErrorEmbed('⛔ Đây không phải menu của bạn! Dùng `/tutien` để mở menu riêng.')],
      ephemeral: true,
    });
  }

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

  // Kiểm tra quyền sở hữu — chặn người khác chọn menu của mình
  if (!checkInteractionOwner(interaction)) {
    return interaction.reply({
      embeds: [createErrorEmbed('⛔ Đây không phải menu của bạn! Dùng `/tutien` để mở menu riêng.')],
      ephemeral: true,
    });
  }

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

  // ══════════════════════════════════
  // LUẬN ĐẠO: Philosophical Debate
  // ══════════════════════════════════
  registerHandler('luan_dao', {
    async handleButton(interaction, action) {
      const player = getPlayer(interaction.user.id);
      if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });

      const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
      const { executeSoloLuanDao, applyLuanDaoRewards } = require('../systems/luan-dao-ti-vo');
      const { formatNumber } = require('../utils/helpers');

      if (action === 'menu') {
        const embed = new EmbedBuilder()
          .setColor('#9b59b6')
          .setTitle('🗣️ Luận Đạo')
          .setDescription(
            `**${player.name}** — Đạo Tâm: **${formatNumber(player.dao_tam || 0)}** | Ngộ Tính: **${player.ngo_tinh || 100}**\n\n` +
            `Luận đạo là hình thức tranh biện về đại đạo.\nThắng → nhận Đạo Tâm + EXP\nThua → vẫn nhận ít kinh nghiệm\n\n` +
            `_So sánh dựa trên Đạo Tâm, Ngộ Tính, và Cảnh Giới._`
          )
          .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('luan_dao:solo').setLabel('🧘 Luận Đạo Solo (vs NPC)').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('menu:main').setLabel('🔙 Quay Lại').setStyle(ButtonStyle.Secondary),
        );
        return interaction.update({ embeds: [embed], components: [row] });
      }

      if (action === 'solo') {
        const result = executeSoloLuanDao(player);
        applyLuanDaoRewards(player.id, result.rewards);

        const resultEmoji = result.won ? '🏆' : '😔';
        const resultText = result.won ? 'CHIẾN THẮNG' : 'THẤT BẠI';
        const embed = new EmbedBuilder()
          .setColor(result.won ? '#2ecc71' : '#e74c3c')
          .setTitle(`${resultEmoji} Luận Đạo — ${resultText}`)
          .setDescription(
            `**Chủ đề**: ${result.topic.name}\n*${result.topic.desc}*\n\n` +
            `📊 Điểm bạn: **${result.playerScore}** vs NPC: **${result.npcScore}**\n` +
            `Chênh lệch: **${result.diff}** điểm\n\n` +
            `**Phần thưởng:**\n` +
            `🧘 Đạo Tâm: +${result.rewards.dao_tam || 0}\n` +
            `📈 EXP: +${Math.floor(result.rewards.exp || 0)}\n` +
            (result.rewards.ngo_tinh ? `🧠 Ngộ Tính: +${result.rewards.ngo_tinh}\n` : '')
          )
          .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('luan_dao:solo').setLabel('🗣️ Luận Đạo Tiếp').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('menu:main').setLabel('🔙 Menu').setStyle(ButtonStyle.Secondary),
        );
        return interaction.update({ embeds: [embed], components: [row] });
      }
    },
  });

  // ══════════════════════════════════
  // TỈ VÕ: Martial Tournament
  // ══════════════════════════════════
  registerHandler('ti_vo', {
    async handleButton(interaction, action) {
      const player = getPlayer(interaction.user.id);
      if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });

      const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
      const { getTiVoRank, getTiVoLeaderboard } = require('../systems/luan-dao-ti-vo');
      const { formatNumber } = require('../utils/helpers');

      if (action === 'menu') {
        const rank = getTiVoRank(player.danh_vong || 0);
        const leaderboard = getTiVoLeaderboard(5);
        const lbText = leaderboard.map((p, i) =>
          `${i + 1}. **${p.name}** — ${formatNumber(p.danh_vong)} DV`
        ).join('\n') || '_Chưa có ai_';

        const embed = new EmbedBuilder()
          .setColor('#e67e22')
          .setTitle('🏟️ Tỉ Võ Đài')
          .setDescription(
            `**${player.name}** — ${rank.name}\n` +
            `🏆 Danh Vọng: **${formatNumber(player.danh_vong || 0)}**\n\n` +
            `**🏅 Bảng Xếp Hạng:**\n${lbText}\n\n` +
            `_Tỉ Võ sử dụng hệ thống chiến đấu nâng cao.\nKhông gây chết vĩnh viễn._`
          )
          .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('combat:pvp').setLabel('⚔️ Thách Đấu PvP').setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId('menu:main').setLabel('🔙 Quay Lại').setStyle(ButtonStyle.Secondary),
        );
        return interaction.update({ embeds: [embed], components: [row] });
      }
    },
  });

  // ══════════════════════════════════
  // KỲ NGỘ: Random Events
  // ══════════════════════════════════
  registerHandler('ky_ngo', {
    async handleButton(interaction, action) {
      const player = getPlayer(interaction.user.id);
      if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });

      const { checkKyNgoTrigger, calculateRewards, applyRewards, buildKyNgoEmbed, buildKyNgoButtons } = require('../systems/ky-ngo');
      const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

      if (action === 'explore') {
        const event = checkKyNgoTrigger(player);
        if (!event) {
          const embed = new EmbedBuilder()
            .setColor('#808080')
            .setTitle('✨ Kỳ Ngộ')
            .setDescription(
              `**${player.name}** ra ngoài tìm cơ duyên...\n\n` +
              `😔 Lần này không gặp gì đặc biệt.\n` +
              `_Vận khí hiện tại: ${player.van_khi || 80}. Vận khí cao sẽ tăng cơ hội kỳ ngộ!_`
            )
            .setTimestamp();

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ky_ngo:explore').setLabel('✨ Thử Lại').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('menu:main').setLabel('🔙 Menu').setStyle(ButtonStyle.Secondary),
          );
          return interaction.update({ embeds: [embed], components: [row] });
        }

        // Cache event
        if (!interaction.client._kyNgoCache) interaction.client._kyNgoCache = new Map();
        interaction.client._kyNgoCache.set(interaction.user.id, event);

        const embed = buildKyNgoEmbed(event, player);
        const buttons = buildKyNgoButtons(event);
        return interaction.update({ embeds: [embed], components: [buttons] });
      }

      if (action === 'skip') {
        interaction.client._kyNgoCache?.delete(interaction.user.id);
        const { showMainMenu } = require('../menus/main-menu');
        return showMainMenu(interaction, player);
      }

      // Handle choices: ky_ngo:choose:eventId:choiceIndex
      if (action.startsWith('choose:')) {
        const parts = action.split(':');
        const eventId = parts[1];
        const choiceIndex = parseInt(parts[2]) || 0;

        const event = interaction.client._kyNgoCache?.get(interaction.user.id);
        if (!event || event.id !== eventId) {
          return interaction.reply({ embeds: [createErrorEmbed('Kỳ ngộ đã hết hạn.')], ephemeral: true });
        }

        interaction.client._kyNgoCache.delete(interaction.user.id);

        const result = calculateRewards(event, player, choiceIndex);
        applyRewards(player.id, result.rewards);

        const embed = new EmbedBuilder()
          .setColor(result.risk_failed ? '#e74c3c' : '#2ecc71')
          .setTitle(`${event.emoji} ${event.name} — ${result.risk_failed ? 'THẤT BẠI' : 'KẾT QUẢ'}`)
          .setDescription(result.log.join('\n'))
          .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('ky_ngo:explore').setLabel('✨ Tìm Kỳ Ngộ Tiếp').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('menu:main').setLabel('🔙 Menu').setStyle(ButtonStyle.Secondary),
        );
        return interaction.update({ embeds: [embed], components: [row] });
      }
    },
  });

  // ══════════════════════════════════
  // NGỰ KIẾM: Sword Riding / Map
  // ══════════════════════════════════
  registerHandler('ngu_kiem', {
    async handleButton(interaction, action) {
      const player = getPlayer(interaction.user.id);
      if (!player) return interaction.reply({ embeds: [createErrorEmbed('Chưa có nhân vật.')], ephemeral: true });

      const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
      const { LOCATIONS, getAvailableLocations, getPlayerLocation, setPlayerLocation, calculateTravelTime } = require('../systems/ngu-kiem');
      const { formatNumber } = require('../utils/helpers');

      if (action === 'map') {
        const currentLoc = getPlayerLocation(player.id);
        const available = getAvailableLocations(player);

        const locList = available.map(loc => {
          const isCurrent = loc.id === currentLoc.id;
          const prefix = isCurrent ? '📍' : loc.emoji;
          const features = loc.features.map(f => {
            const names = { shop: '🛒', hunt: '⚔️', boss: '💀', gather: '🌿', npc: '👤',
              ky_ngo: '✨', sect: '🏯', luan_dao: '🗣️', ti_vo: '🏟️', tribulation: '⛈️',
              sword_treasure: '🗡️', legendary_treasure: '💎', ascension: '☁️' };
            return names[f] || f;
          }).join('');
          return `${prefix} **${loc.name}** ${isCurrent ? '← _Đang ở đây_' : ''}\n  ${features} | ${loc.description.slice(0, 60)}...`;
        }).join('\n\n');

        const embed = new EmbedBuilder()
          .setColor('#3498db')
          .setTitle('🗡️ Ngự Kiếm — Bản Đồ')
          .setDescription(
            `📍 Vị trí: **${currentLoc.name}**\n` +
            `⚔️ Chiến lực: **${formatNumber((player.atk || 0) + (player.def || 0) + (player.speed || 0))}**\n\n` +
            `**Các địa điểm:**\n\n${locList}`
          )
          .setFooter({ text: `Võ khí: ${player.weapon_type || 'Chưa có'} | Cảnh giới: ${player.realm_index || 0}` })
          .setTimestamp();

        // Select menu to travel
        const travelOptions = available
          .filter(loc => loc.id !== currentLoc.id)
          .slice(0, 25)
          .map(loc => ({
            label: loc.name.replace(/[^\w\s]/g, '').trim(),
            value: loc.id,
            emoji: loc.emoji,
            description: `${calculateTravelTime(player, currentLoc, loc)} phút bay`,
          }));

        const components = [];
        if (travelOptions.length > 0) {
          components.push(new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId('select:ngu_kiem_travel')
              .setPlaceholder('🗡️ Chọn nơi muốn đến...')
              .addOptions(travelOptions)
          ));
        }
        components.push(new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('menu:main').setLabel('🔙 Quay Lại').setStyle(ButtonStyle.Secondary),
        ));

        return interaction.update({ embeds: [embed], components });
      }
    },

    async handleSelect(interaction, action, values) {
      // Travel handled in select handler below
    },
  });

  // Wire ngu_kiem travel in select handler
  // Add to existing 'select' handler or handle via prefix routing

module.exports = {
  registerHandler,
  loadHandlers,
  handleButton,
  handleSelectMenu,
  handleModal,
};

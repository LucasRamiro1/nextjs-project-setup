// src/bot/keyboards/providers.ts
import { Markup } from 'telegraf';

export const providersKeyboard = Markup.inlineKeyboard([
  [
    Markup.button.callback('🎮 PGSoft', 'provider_pgsoft'),
    Markup.button.callback('🎯 Pragmatic Play', 'provider_pp')
  ],
  [
    Markup.button.callback('⬅️ Voltar', 'back')
  ]
]);

export const pgsoftGamesKeyboard = Markup.inlineKeyboard([
  [
    Markup.button.callback('🐅 Fortune Tiger', 'game_fortune_tiger'),
    Markup.button.callback('🀄 Mahjong Ways', 'game_mahjong_ways')
  ],
  [
    Markup.button.callback('🐉 Fortune Dragon', 'game_fortune_dragon'),
    Markup.button.callback('🦅 Wild Bandito', 'game_wild_bandito')
  ],
  [
    Markup.button.callback('💎 Gems Bonanza', 'game_gems_bonanza'),
    Markup.button.callback('🏴‍☠️ Pirates Gold', 'game_pirates_gold')
  ],
  [
    Markup.button.callback('🎭 Mask Carnival', 'game_mask_carnival'),
    Markup.button.callback('🐼 Panda Fortune', 'game_panda_fortune')
  ],
  [
    Markup.button.callback('🔥 Phoenix Rises', 'game_phoenix_rises'),
    Markup.button.callback('⚡ Thunder Kick', 'game_thunder_kick')
  ],
  [
    Markup.button.callback('🌟 Starlight Princess', 'game_starlight_princess'),
    Markup.button.callback('🦊 Kitsune Masks', 'game_kitsune_masks')
  ],
  [
    Markup.button.callback('🎪 Circus Launch', 'game_circus_launch'),
    Markup.button.callback('🐨 Koala Fortune', 'game_koala_fortune')
  ],
  [
    Markup.button.callback('🌙 Lucky Neko', 'game_lucky_neko'),
    Markup.button.callback('🎨 Hip Hop Panda', 'game_hip_hop_panda')
  ],
  [
    Markup.button.callback('💰 Cash Patrol', 'game_cash_patrol'),
    Markup.button.callback('🎸 Rock Vegas', 'game_rock_vegas')
  ],
  [
    Markup.button.callback('🍀 Irish Charms', 'game_irish_charms'),
    Markup.button.callback('🌺 Tropical Tiki', 'game_tropical_tiki')
  ],
  [
    Markup.button.callback('🔮 Mystic Potion', 'game_mystic_potion'),
    Markup.button.callback('🎯 Archer Robin', 'game_archer_robin')
  ],
  [
    Markup.button.callback('⬅️ Voltar', 'back')
  ]
]);

export const pragmaticGamesKeyboard = Markup.inlineKeyboard([
  [
    Markup.button.callback('⚡ Gates of Olympus', 'game_gates_olympus'),
    Markup.button.callback('🍭 Sweet Bonanza', 'game_sweet_bonanza')
  ],
  [
    Markup.button.callback('🐺 Wolf Gold', 'game_wolf_gold'),
    Markup.button.callback('💎 The Dog House', 'game_dog_house')
  ],
  [
    Markup.button.callback('🌟 Starlight Princess', 'game_starlight_pp'),
    Markup.button.callback('🔥 Fire Strike', 'game_fire_strike')
  ],
  [
    Markup.button.callback('🍒 Fruit Party', 'game_fruit_party'),
    Markup.button.callback('🎭 Wild West Gold', 'game_wild_west_gold')
  ],
  [
    Markup.button.callback('💰 Money Train', 'game_money_train'),
    Markup.button.callback('🐻 John Hunter', 'game_john_hunter')
  ],
  [
    Markup.button.callback('🌙 Moonlight Princess', 'game_moonlight_princess'),
    Markup.button.callback('🎪 Circus Delight', 'game_circus_delight')
  ],
  [
    Markup.button.callback('🏴‍☠️ Pirate Gold', 'game_pirate_gold_pp'),
    Markup.button.callback('🔱 Rise of Giza', 'game_rise_giza')
  ],
  [
    Markup.button.callback('🎨 Street Racer', 'game_street_racer'),
    Markup.button.callback('🎯 Buffalo King', 'game_buffalo_king')
  ],
  [
    Markup.button.callback('💎 Diamond Strike', 'game_diamond_strike'),
    Markup.button.callback('🌺 Hawaiian Tiki', 'game_hawaiian_tiki')
  ],
  [
    Markup.button.callback('🔮 Magic Journey', 'game_magic_journey'),
    Markup.button.callback('🎸 Rock Vegas PP', 'game_rock_vegas_pp')
  ],
  [
    Markup.button.callback('⬅️ Voltar', 'back')
  ]
]);
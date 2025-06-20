// src/bot/keyboards/platforms.ts
import { Markup } from 'telegraf';

export const platformsKeyboard = Markup.inlineKeyboard([
  [
    Markup.button.url('🎰 Pop678', 'https://pop678.com/affiliate_link'),
    Markup.button.url('🎰 Popbra', 'https://popbra.com/affiliate_link')
  ],
  [
    Markup.button.url('🎰 Popkkk', 'https://popkkk.com/affiliate_link'),
    Markup.button.url('🎰 26bet', 'https://26bet.com/affiliate_link')
  ],
  [
    Markup.button.url('🎰 Poppg', 'https://poppg.com/affiliate_link'),
    Markup.button.url('🎰 Pop888', 'https://pop888.com/affiliate_link')
  ],
  [
    Markup.button.url('🎰 Popwb', 'https://popwb.com/affiliate_link'),
    Markup.button.url('🎰 Pop555', 'https://pop555.com/affiliate_link')
  ],
  [
    Markup.button.url('🎰 Popbem', 'https://popbem.com/affiliate_link'),
    Markup.button.url('🎰 Popmel', 'https://popmel.com/affiliate_link')
  ],
  [
    Markup.button.url('🎰 Popceu', 'https://popceu.com/affiliate_link'),
    Markup.button.url('🎰 Poplua', 'https://poplua.com/affiliate_link')
  ],
  [
    Markup.button.callback('⬅️ Voltar', 'back')
  ]
]);

export const reportPlatformsKeyboard = Markup.inlineKeyboard([
  [
    Markup.button.callback('Pop678', 'platform_pop678'),
    Markup.button.callback('Popbra', 'platform_popbra')
  ],
  [
    Markup.button.callback('Popkkk', 'platform_popkkk'),
    Markup.button.callback('26bet', 'platform_26bet')
  ],
  [
    Markup.button.callback('Poppg', 'platform_poppg'),
    Markup.button.callback('Pop888', 'platform_pop888')
  ],
  [
    Markup.button.callback('Popwb', 'platform_popwb'),
    Markup.button.callback('Pop555', 'platform_pop555')
  ],
  [
    Markup.button.callback('Popbem', 'platform_popbem'),
    Markup.button.callback('Popmel', 'platform_popmel')
  ],
  [
    Markup.button.callback('Popceu', 'platform_popceu'),
    Markup.button.callback('Poplua', 'platform_poplua')
  ],
  [
    Markup.button.callback('⬅️ Voltar', 'back')
  ]
]);
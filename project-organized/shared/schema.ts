import { pgTable, text, serial, integer, boolean, timestamp, decimal, bigint, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  telegramId: bigint("telegram_id", { mode: "number" }).unique().notNull(),
  username: text("username"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  points: decimal("points", { precision: 10, scale: 2 }).default("0.00").notNull(),
  affiliateCode: text("affiliate_code").unique().notNull(),
  referredBy: bigint("referred_by", { mode: "number" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isBanned: boolean("is_banned").default(false).notNull(),
  lastInteraction: timestamp("last_interaction"),
});

export const bets = pgTable("bets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  platform: text("platform").notNull(),
  game: text("game").notNull(),
  betAmount: decimal("bet_amount", { precision: 10, scale: 2 }).notNull(),
  winAmount: decimal("win_amount", { precision: 10, scale: 2 }),
  lossAmount: decimal("loss_amount", { precision: 10, scale: 2 }),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  duration: decimal("duration", { precision: 10, scale: 2 }).notNull(),
  proofImage: text("proof_image"),
  betType: text("bet_type").notNull(), // 'win' or 'loss'
  isApproved: boolean("is_approved").default(false).notNull(),
  approvedBy: integer("approved_by").references(() => users.id),
  approvalDate: timestamp("approval_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  points: decimal("points", { precision: 10, scale: 2 }).notNull(),
  code: text("code").unique().notNull(),
  isUsed: boolean("is_used").default(false).notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

export const pendingApprovals = pgTable("pending_approvals", {
  id: serial("id").primaryKey(),
  betId: integer("bet_id").references(() => bets.id).notNull(),
  adminId: integer("admin_id").references(() => users.id),
  status: text("status").default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const groupAnalysis = pgTable("group_analysis", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  analysisDate: timestamp("analysis_date").defaultNow().notNull(),
  timePeriod: integer("time_period").notNull(),
  data: jsonb("data"),
  isPublic: boolean("is_public").default(false).notNull(),
  accessCost: decimal("access_cost", { precision: 10, scale: 2 }).default("0.00").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: text("key").unique().notNull(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const analysisPeriods = pgTable("analysis_periods", {
  id: serial("id").primaryKey(),
  periodMinutes: integer("period_minutes").notNull(),
  costMultiplier: decimal("cost_multiplier", { precision: 3, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const broadcastMessages = pgTable("broadcast_messages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  targetUsers: text("target_users").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  sentBy: integer("sent_by").references(() => users.id).notNull(),
  recipientCount: integer("recipient_count").default(0),
  readCount: integer("read_count").default(0),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  bets: many(bets),
  rewards: many(rewards),
  approvals: many(pendingApprovals),
  analyses: many(groupAnalysis),
  referrer: one(users, {
    fields: [users.referredBy],
    references: [users.telegramId],
  }),
}));

export const betsRelations = relations(bets, ({ one }) => ({
  user: one(users, {
    fields: [bets.userId],
    references: [users.id],
  }),
  approver: one(users, {
    fields: [bets.approvedBy],
    references: [users.id],
  }),
}));

export const rewardsRelations = relations(rewards, ({ one }) => ({
  user: one(users, {
    fields: [rewards.userId],
    references: [users.id],
  }),
}));

export const pendingApprovalsRelations = relations(pendingApprovals, ({ one }) => ({
  bet: one(bets, {
    fields: [pendingApprovals.betId],
    references: [bets.id],
  }),
  admin: one(users, {
    fields: [pendingApprovals.adminId],
    references: [users.id],
  }),
}));

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBetSchema = createInsertSchema(bets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRewardSchema = createInsertSchema(rewards).omit({
  id: true,
  createdAt: true,
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertBroadcastMessageSchema = createInsertSchema(broadcastMessages).omit({
  id: true,
  sentAt: true,
  recipientCount: true,
  readCount: true,
});

export const insertAnalysisPeriodSchema = createInsertSchema(analysisPeriods).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Bet = typeof bets.$inferSelect;
export type InsertBet = z.infer<typeof insertBetSchema>;
export type Reward = typeof rewards.$inferSelect;
export type InsertReward = z.infer<typeof insertRewardSchema>;
export type PendingApproval = typeof pendingApprovals.$inferSelect;
export type GroupAnalysis = typeof groupAnalysis.$inferSelect;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type BroadcastMessage = typeof broadcastMessages.$inferSelect;
export type InsertBroadcastMessage = z.infer<typeof insertBroadcastMessageSchema>;
export type AnalysisPeriod = typeof analysisPeriods.$inferSelect;
export type InsertAnalysisPeriod = z.infer<typeof insertAnalysisPeriodSchema>;

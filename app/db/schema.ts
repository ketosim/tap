import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core'

export const techniques = pgTable('techniques', {
  id: serial('id').primaryKey(),
  gifUrl: text('gif_url').notNull(),
  title: text('title').notNull(),
  note: text('note'),
  tags: text('tags').array().default([]),
  
  lastSeen: timestamp('last_seen'),
  timesReviewed: integer('times_reviewed').default(0).notNull(),
  nextReview: timestamp('next_review').notNull(),
  confidence: text('confidence').default('medium').notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Technique = typeof techniques.$inferSelect
export type NewTechnique = typeof techniques.$inferInsert
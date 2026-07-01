import { relations } from 'drizzle-orm'
import { customers, quotes, quoteItems } from './index.js'

export const customersRelations = relations(customers, ({ many }) => ({
  quotes: many(quotes),
}))

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  customer: one(customers, {
    fields: [quotes.customerId],
    references: [customers.id],
  }),
  items: many(quoteItems),
}))

export const quoteItemsRelations = relations(quoteItems, ({ one }) => ({
  quote: one(quotes, {
    fields: [quoteItems.quoteId],
    references: [quotes.id],
  }),
}))

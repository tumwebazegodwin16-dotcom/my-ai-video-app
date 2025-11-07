import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const videos = pgTable("videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  filename: text("filename").notNull(), // Disk filename
  originalFilename: text("original_filename").notNull(), // Original filename for downloads
  fileSize: integer("file_size").notNull(),
  duration: text("duration").default(""),
  category: text("category").notNull().default("Other"),
  thumbnailUrl: text("thumbnail_url").default(""),
  uploadDate: timestamp("upload_date").notNull().defaultNow(),
});

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  uploadDate: true,
});

export const updateVideoSchema = createInsertSchema(videos).omit({
  id: true,
  uploadDate: true,
  filename: true,
  originalFilename: true,
  fileSize: true,
}).partial();

export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type UpdateVideo = z.infer<typeof updateVideoSchema>;
export type Video = typeof videos.$inferSelect;

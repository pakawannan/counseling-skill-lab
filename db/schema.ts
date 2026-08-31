import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const rooms = sqliteTable("rooms", {
  code: text("code").primaryKey(),
  title: text("title").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const students = sqliteTable("students", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  roomCode: text("room_code").notNull().references(() => rooms.code),
  studentCode: text("student_code").notNull(),
  displayName: text("display_name").notNull(),
  pinHash: text("pin_hash").notNull(),
  sessionHash: text("session_hash").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  lastActiveAt: text("last_active_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("students_room_student_unique").on(table.roomCode, table.studentCode),
  uniqueIndex("students_session_unique").on(table.sessionHash),
  index("students_room_idx").on(table.roomCode),
]);

export const attempts = sqliteTable("attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentId: integer("student_id").notNull().references(() => students.id),
  skill: text("skill").notNull(),
  stage: text("stage").notNull(),
  score: integer("score").notNull(),
  total: integer("total").notNull(),
  percent: integer("percent").notNull(),
  passed: integer("passed", { mode: "boolean" }).notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("attempts_student_idx").on(table.studentId),
  index("attempts_skill_stage_idx").on(table.skill, table.stage),
]);

export const responses = sqliteTable("responses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  attemptId: integer("attempt_id").notNull().references(() => attempts.id),
  studentId: integer("student_id").notNull().references(() => students.id),
  skill: text("skill").notNull(),
  stage: text("stage").notNull(),
  itemIndex: integer("item_index").notNull(),
  answer: text("answer").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  isCorrect: integer("is_correct", { mode: "boolean" }).notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("responses_attempt_idx").on(table.attemptId),
  index("responses_item_idx").on(table.skill, table.stage, table.itemIndex),
]);

export const quizzes = sqliteTable("quizzes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  roomCode: text("room_code").notNull().references(() => rooms.code),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  category: text("category").notNull().default("แบบฝึกเพิ่มเติม"),
  durationMinutes: integer("duration_minutes").notNull().default(20),
  published: integer("published", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("quizzes_room_idx").on(table.roomCode)]);

export const quizItems = sqliteTable("quiz_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  quizId: integer("quiz_id").notNull().references(() => quizzes.id),
  position: integer("position").notNull(),
  type: text("type").notNull(),
  prompt: text("prompt").notNull(),
  optionsJson: text("options_json").notNull().default("[]"),
  correctAnswer: text("correct_answer"),
  explanation: text("explanation").notNull().default(""),
  points: integer("points").notNull().default(1),
}, (table) => [
  index("quiz_items_quiz_idx").on(table.quizId),
  uniqueIndex("quiz_items_position_unique").on(table.quizId, table.position),
]);

export const quizSubmissions = sqliteTable("quiz_submissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  quizId: integer("quiz_id").notNull().references(() => quizzes.id),
  studentId: integer("student_id").notNull().references(() => students.id),
  status: text("status").notNull().default("draft"),
  objectiveScore: integer("objective_score").notNull().default(0),
  earnedScore: integer("earned_score").notNull().default(0),
  maxScore: integer("max_score").notNull().default(0),
  startedAt: text("started_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  submittedAt: text("submitted_at"),
  gradedAt: text("graded_at"),
  feedback: text("feedback").notNull().default(""),
}, (table) => [
  uniqueIndex("quiz_submission_student_unique").on(table.quizId, table.studentId),
  index("quiz_submission_quiz_idx").on(table.quizId),
]);

export const quizAnswers = sqliteTable("quiz_answers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  submissionId: integer("submission_id").notNull().references(() => quizSubmissions.id),
  itemId: integer("item_id").notNull().references(() => quizItems.id),
  answer: text("answer").notNull().default(""),
  isCorrect: integer("is_correct", { mode: "boolean" }),
  earnedPoints: integer("earned_points"),
  feedback: text("feedback").notNull().default(""),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("quiz_answers_item_unique").on(table.submissionId, table.itemId),
  index("quiz_answers_submission_idx").on(table.submissionId),
]);

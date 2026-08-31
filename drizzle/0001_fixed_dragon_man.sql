CREATE TABLE `quiz_answers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`submission_id` integer NOT NULL,
	`item_id` integer NOT NULL,
	`answer` text DEFAULT '' NOT NULL,
	`is_correct` integer,
	`earned_points` integer,
	`feedback` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`submission_id`) REFERENCES `quiz_submissions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`item_id`) REFERENCES `quiz_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `quiz_answers_item_unique` ON `quiz_answers` (`submission_id`,`item_id`);--> statement-breakpoint
CREATE INDEX `quiz_answers_submission_idx` ON `quiz_answers` (`submission_id`);--> statement-breakpoint
CREATE TABLE `quiz_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`quiz_id` integer NOT NULL,
	`position` integer NOT NULL,
	`type` text NOT NULL,
	`prompt` text NOT NULL,
	`options_json` text DEFAULT '[]' NOT NULL,
	`correct_answer` text,
	`explanation` text DEFAULT '' NOT NULL,
	`points` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `quiz_items_quiz_idx` ON `quiz_items` (`quiz_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `quiz_items_position_unique` ON `quiz_items` (`quiz_id`,`position`);--> statement-breakpoint
CREATE TABLE `quiz_submissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`quiz_id` integer NOT NULL,
	`student_id` integer NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`objective_score` integer DEFAULT 0 NOT NULL,
	`earned_score` integer DEFAULT 0 NOT NULL,
	`max_score` integer DEFAULT 0 NOT NULL,
	`started_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`submitted_at` text,
	`graded_at` text,
	`feedback` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `quiz_submission_student_unique` ON `quiz_submissions` (`quiz_id`,`student_id`);--> statement-breakpoint
CREATE INDEX `quiz_submission_quiz_idx` ON `quiz_submissions` (`quiz_id`);--> statement-breakpoint
CREATE TABLE `quizzes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`room_code` text NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`category` text DEFAULT 'แบบฝึกเพิ่มเติม' NOT NULL,
	`duration_minutes` integer DEFAULT 20 NOT NULL,
	`published` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`room_code`) REFERENCES `rooms`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `quizzes_room_idx` ON `quizzes` (`room_code`);
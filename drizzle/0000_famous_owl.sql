CREATE TABLE `attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_id` integer NOT NULL,
	`skill` text NOT NULL,
	`stage` text NOT NULL,
	`score` integer NOT NULL,
	`total` integer NOT NULL,
	`percent` integer NOT NULL,
	`passed` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `attempts_student_idx` ON `attempts` (`student_id`);--> statement-breakpoint
CREATE INDEX `attempts_skill_stage_idx` ON `attempts` (`skill`,`stage`);--> statement-breakpoint
CREATE TABLE `responses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`attempt_id` integer NOT NULL,
	`student_id` integer NOT NULL,
	`skill` text NOT NULL,
	`stage` text NOT NULL,
	`item_index` integer NOT NULL,
	`answer` text NOT NULL,
	`correct_answer` text NOT NULL,
	`is_correct` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`attempt_id`) REFERENCES `attempts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `responses_attempt_idx` ON `responses` (`attempt_id`);--> statement-breakpoint
CREATE INDEX `responses_item_idx` ON `responses` (`skill`,`stage`,`item_index`);--> statement-breakpoint
CREATE TABLE `rooms` (
	`code` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`room_code` text NOT NULL,
	`student_code` text NOT NULL,
	`display_name` text NOT NULL,
	`pin_hash` text NOT NULL,
	`session_hash` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_active_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`room_code`) REFERENCES `rooms`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `students_room_student_unique` ON `students` (`room_code`,`student_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `students_session_unique` ON `students` (`session_hash`);--> statement-breakpoint
CREATE INDEX `students_room_idx` ON `students` (`room_code`);
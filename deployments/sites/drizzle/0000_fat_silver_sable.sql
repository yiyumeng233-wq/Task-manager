CREATE TABLE `app_metadata` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `demo_users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `demo_users_email_unique` ON `demo_users` (`email`);--> statement-breakpoint
CREATE TABLE `task_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`record` text NOT NULL,
	`version` integer DEFAULT 0 NOT NULL
);

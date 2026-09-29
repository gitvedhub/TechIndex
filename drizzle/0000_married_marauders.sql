CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`full_name` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_login_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
--> statement-breakpoint
CREATE TABLE `user_workspaces` (
	`user_id` text PRIMARY KEY NOT NULL,
	`saved_services` text DEFAULT '[]' NOT NULL,
	`comparison_selections` text DEFAULT '[]' NOT NULL,
	`researched_services` text DEFAULT '[]' NOT NULL,
	`read_alerts` text DEFAULT '[]' NOT NULL,
	`muted_services` text DEFAULT '[]' NOT NULL,
	`theme` text DEFAULT 'light' NOT NULL,
	`saved_layout` text DEFAULT 'grid' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

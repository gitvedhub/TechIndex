CREATE TABLE "user_workspaces" (
	"user_id" text PRIMARY KEY NOT NULL,
	"saved_services" text DEFAULT '[]' NOT NULL,
	"comparison_selections" text DEFAULT '[]' NOT NULL,
	"researched_services" text DEFAULT '[]' NOT NULL,
	"read_alerts" text DEFAULT '[]' NOT NULL,
	"muted_services" text DEFAULT '[]' NOT NULL,
	"theme" text DEFAULT 'light' NOT NULL,
	"saved_layout" text DEFAULT 'grid' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"display_name" text NOT NULL,
	"full_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "user_workspaces" ADD CONSTRAINT "user_workspaces_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
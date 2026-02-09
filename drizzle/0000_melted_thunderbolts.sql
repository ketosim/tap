CREATE TABLE "techniques" (
	"id" serial PRIMARY KEY NOT NULL,
	"gif_url" text NOT NULL,
	"title" text NOT NULL,
	"note" text,
	"tags" text[] DEFAULT '{}',
	"last_seen" timestamp,
	"times_reviewed" integer DEFAULT 0 NOT NULL,
	"next_review" timestamp NOT NULL,
	"confidence" text DEFAULT 'medium' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TYPE "public"."crm_sync_status" AS ENUM('pending', 'synced', 'failed');--> statement-breakpoint
CREATE TYPE "public"."layout_change" AS ENUM('none', 'partitions', 'wetZones');--> statement-breakpoint
CREATE TYPE "public"."materials_class" AS ENUM('economy', 'standard', 'premium');--> statement-breakpoint
CREATE TYPE "public"."repair_type" AS ENUM('cosmetic', 'capital', 'designer');--> statement-breakpoint
CREATE TYPE "public"."urgency" AS ENUM('normal', 'accelerated', 'urgent');--> statement-breakpoint
CREATE TABLE "estimate_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"area" integer NOT NULL,
	"repair_type" "repair_type" NOT NULL,
	"bathrooms" integer NOT NULL,
	"urgency" "urgency" NOT NULL,
	"layout_change" "layout_change" NOT NULL,
	"materials_class" "materials_class" NOT NULL,
	"estimate_low" integer NOT NULL,
	"estimate_high" integer NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"crm_sync_status" "crm_sync_status" DEFAULT 'pending' NOT NULL,
	"crm_sync_attempts" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

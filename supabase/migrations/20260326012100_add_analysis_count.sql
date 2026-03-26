-- Add analysis_count to profiles
ALTER TABLE "public"."profiles" ADD COLUMN IF NOT EXISTS "analysis_count" integer DEFAULT 0;

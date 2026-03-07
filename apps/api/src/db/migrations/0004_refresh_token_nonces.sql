-- Add discord_id column to users for future Discord OAuth support.
ALTER TABLE "users" ADD COLUMN "discord_id" varchar(50);--> statement-breakpoint

-- Add refresh_token_nonces table for server-side refresh token revocation.
-- One row per user (primary key = user_id). Rotated on every refresh/me call.
-- Row is deleted on logout, making the outstanding refresh token immediately invalid.
CREATE TABLE "refresh_token_nonces" (
  "user_id" uuid PRIMARY KEY NOT NULL,
  "nonce" uuid NOT NULL DEFAULT gen_random_uuid(),
  "expires_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);--> statement-breakpoint

ALTER TABLE "refresh_token_nonces"
  ADD CONSTRAINT "refresh_token_nonces_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
  ON DELETE cascade ON UPDATE no action;

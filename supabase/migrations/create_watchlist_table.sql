-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop table if exists
DROP TABLE IF EXISTS watchlist;

-- Create the watchlist table
CREATE TABLE watchlist (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id text NOT NULL,
  symbol text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, symbol)
);

-- Create index for faster lookups
CREATE INDEX idx_watchlist_user_id ON watchlist(user_id);
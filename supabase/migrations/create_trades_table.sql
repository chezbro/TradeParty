create table trades (
    id uuid default uuid_generate_v4() primary key,
    symbol text not null,
    type text not null check (type in ('LONG', 'SHORT')),
    entry numeric not null,
    target numeric not null,
    stop_loss numeric not null,
    size numeric not null,
    timestamp timestamptz not null default now(),
    status text not null check (status in ('OPEN', 'CLOSED')) default 'OPEN',
    exit_price numeric,
    exit_timestamp timestamptz,
    profit_loss numeric default 0,
    current_price numeric not null,
    trader_id text not null,
    trader_name text not null
);

-- Create indexes for common queries
CREATE INDEX idx_trades_trader_id ON trades(trader_id);
CREATE INDEX idx_trades_status ON trades(status);
CREATE INDEX idx_trades_timestamp ON trades(timestamp DESC);

-- Disable RLS
ALTER TABLE trades DISABLE ROW LEVEL SECURITY;

-- Create policies with text comparison instead of UUID
CREATE POLICY "Users can view all trades"
    ON trades FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can insert their own trades"
    ON trades FOR INSERT
    TO authenticated
    WITH CHECK (trader_id::text = auth.uid()::text);

CREATE POLICY "Users can update their own trades"
    ON trades FOR UPDATE
    TO authenticated
    USING (trader_id::text = auth.uid()::text);

-- Add delete policy for completeness
CREATE POLICY "Users can delete their own trades"
    ON trades FOR DELETE
    TO authenticated
    USING (trader_id::text = auth.uid()::text); 
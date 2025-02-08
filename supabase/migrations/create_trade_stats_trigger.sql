-- Function to update trading stats
CREATE OR REPLACE FUNCTION update_trading_stats()
RETURNS TRIGGER AS $$
DECLARE
  total_trades INTEGER;
  winning_trades INTEGER;
  total_profit NUMERIC;
  total_loss NUMERIC;
BEGIN
  -- Calculate stats for the trader
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE profit_loss > 0),
    COALESCE(SUM(profit_loss) FILTER (WHERE profit_loss > 0), 0),
    ABS(COALESCE(SUM(profit_loss) FILTER (WHERE profit_loss < 0), 0))
  INTO 
    total_trades,
    winning_trades,
    total_profit,
    total_loss
  FROM trades
  WHERE trader_id = NEW.trader_id::uuid
    AND status = 'CLOSED';

  -- Update or insert trading stats
  INSERT INTO trading_stats (
    user_id,
    win_rate,
    total_trades,
    profit_factor,
    monthly_return
  ) VALUES (
    NEW.trader_id::uuid,
    CASE WHEN total_trades > 0 THEN (winning_trades::NUMERIC / total_trades) * 100 ELSE 0 END,
    total_trades,
    CASE WHEN total_loss > 0 THEN total_profit / total_loss ELSE total_profit END,
    CASE 
      WHEN total_trades > 0 
      THEN ((total_profit - total_loss) / total_trades) * 100
      ELSE 0 
    END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    win_rate = EXCLUDED.win_rate,
    total_trades = EXCLUDED.total_trades,
    profit_factor = EXCLUDED.profit_factor,
    monthly_return = EXCLUDED.monthly_return,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_stats_on_trade
AFTER INSERT OR UPDATE OF status, profit_loss ON trades
FOR EACH ROW
WHEN (NEW.status = 'CLOSED')
EXECUTE FUNCTION update_trading_stats(); 
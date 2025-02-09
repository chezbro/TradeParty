-- Insert dummy TradeParty sessions
INSERT INTO tradeparty_sessions (
  name,
  created_by,
  started_at,
  ended_at,
  duration_minutes,
  participant_count,
  charts_shared,
  trades_taken,
  participants,
  recording_url
) VALUES
(
  'Morning Trading Session',
  'user_id_here',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days' + INTERVAL '2 hours',
  120,
  5,
  '[
    {"symbol": "BTCUSDT", "shared_by": "John Doe", "timestamp": "2024-03-18T08:30:00Z"},
    {"symbol": "ETHUSDT", "shared_by": "Jane Smith", "timestamp": "2024-03-18T09:15:00Z"}
  ]',
  '[
    {"symbol": "BTCUSDT", "type": "LONG", "entry": 65000, "exit": 66000, "profit": 1000},
    {"symbol": "ETHUSDT", "type": "SHORT", "entry": 3500, "exit": 3400, "profit": 100}
  ]',
  '{
    "user_ids": ["user1", "user2", "user3", "user4", "user5"],
    "names": ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Wilson", "Alex Brown"],
    "avatars": [null, null, null, null, null]
  }',
  'https://example.com/recording1'
),
(
  'Crypto Market Analysis',
  'c0980821-be89-49bd-8d5a-dd69ba593141',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days' + INTERVAL '1 hour',
  60,
  3,
  '[
    {"symbol": "SOLUSDT", "shared_by": "Mike Johnson", "timestamp": "2024-03-15T14:00:00Z"}
  ]',
  '[
    {"symbol": "SOLUSDT", "type": "LONG", "entry": 150, "exit": 155, "profit": 500}
  ]',
  '{
    "user_ids": ["user1", "user2", "user3"],
    "names": ["John Doe", "Mike Johnson", "Sarah Wilson"],
    "avatars": [null, null, null]
  }',
  'https://example.com/recording2'
); 
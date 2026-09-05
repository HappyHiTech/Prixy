-- 002_seed.sql
-- Dev mock data. Safe to run repeatedly.

INSERT INTO users (id, display_name, email)
VALUES ('11111111-1111-1111-1111-111111111111', 'Harvey Tan', 'harveycytan@gmail.com')
ON CONFLICT (email) DO NOTHING;

INSERT INTO recipients (id, user_id, name) VALUES
  ('22222222-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Mom'),
  ('22222222-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Dad'),
  ('22222222-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Sarah Chen')
ON CONFLICT (id) DO NOTHING;

INSERT INTO categories (id, user_id, name, icon, is_default) VALUES
  ('33333333-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Family',  'home',   true),
  ('33333333-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Friends', 'users',  true),
  ('33333333-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Church',  'church', true),
  ('33333333-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Health',  'heart',  true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO prayer_requests
  (id, user_id, recipient_id, category_id, request_text, raw_transcript,
   status, source_type, frequency_type, recurring_days, last_prayed_at, answered_at)
VALUES
  -- Inbox: uncategorized, straight off a recording
  ('44444444-0000-0000-0000-000000000001',
   '11111111-1111-1111-1111-111111111111', NULL, NULL,
   'Pray for Sarah as she starts her new job next week',
   'um so pray for uh Sarah as she starts her new job next week',
   'inbox', 'voice', 'one_time', '{}', NULL, NULL),

  -- Inbox: manual entry, no recipient yet
  ('44444444-0000-0000-0000-000000000002',
   '11111111-1111-1111-1111-111111111111', NULL, NULL,
   'Wisdom for the elders meeting on Thursday',
   NULL,
   'inbox', 'manual', 'one_time', '{}', NULL, NULL),

  -- Active, one-time, fully assigned, prayed for yesterday
  ('44444444-0000-0000-0000-000000000003',
   '11111111-1111-1111-1111-111111111111',
   '22222222-0000-0000-0000-000000000002',
   '33333333-0000-0000-0000-000000000004',
   'Dad''s follow-up scan comes back clear',
   NULL,
   'active', 'manual', 'one_time', '{}', now() - interval '1 day', NULL),

  -- Active, recurring — exercises recurring_days
  ('44444444-0000-0000-0000-000000000004',
   '11111111-1111-1111-1111-111111111111',
   '22222222-0000-0000-0000-000000000001',
   '33333333-0000-0000-0000-000000000001',
   'Mom would find a church community near her',
   NULL,
   'active', 'voice', 'recurring', '{Mon,Wed,Fri}', now() - interval '3 days', NULL),

  -- Active, never prayed for
  ('44444444-0000-0000-0000-000000000005',
   '11111111-1111-1111-1111-111111111111',
   '22222222-0000-0000-0000-000000000003',
   '33333333-0000-0000-0000-000000000002',
   'Sarah and her husband as they look for a house',
   NULL,
   'active', 'manual', 'one_time', '{}', NULL, NULL),

  -- Answered — feeds lifetime stats
  ('44444444-0000-0000-0000-000000000006',
   '11111111-1111-1111-1111-111111111111',
   '22222222-0000-0000-0000-000000000001',
   '33333333-0000-0000-0000-000000000004',
   'Mom''s surgery goes well',
   NULL,
   'answered', 'voice', 'one_time', '{}',
   now() - interval '10 days', now() - interval '9 days')
ON CONFLICT (id) DO NOTHING;

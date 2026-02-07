-- SQL Script to set default subscription status for existing users
-- Run this in the Supabase Dashboard > SQL Editor

UPDATE auth.users
SET raw_user_meta_data = 
  CASE 
    WHEN raw_user_meta_data IS NULL THEN '{"isSubscribed": false}'::jsonb
    ELSE raw_user_meta_data || '{"isSubscribed": false}'::jsonb
  END
WHERE (raw_user_meta_data->>'isSubscribed') IS NULL;

-- Verify the update
SELECT id, email, raw_user_meta_data->>'isSubscribed' as is_subscribed
FROM auth.users
LIMIT 10;

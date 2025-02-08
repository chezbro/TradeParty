-- Create type for roles if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add role column if it doesn't exist (using the enum type directly)
DO $$ BEGIN
    ALTER TABLE user_profiles 
    ADD COLUMN role user_role DEFAULT 'user'::user_role;
EXCEPTION
    WHEN duplicate_column THEN 
        -- Column exists, alter its type
        ALTER TABLE user_profiles 
        ALTER COLUMN role TYPE user_role 
        USING role::user_role;
END $$;

-- Update existing null values to 'user'
UPDATE user_profiles 
SET role = 'user'::user_role 
WHERE role IS NULL; 
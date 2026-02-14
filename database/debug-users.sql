-- DRINKIT Database Debugging Commands

-- 1. Check all users and their roles
SELECT mobile, name, role, is_verified, created_at 
FROM users 
ORDER BY created_at DESC;

-- 2. If you want to delete all non-admin users and start fresh:
-- DELETE FROM users WHERE role != 'ADMIN';

-- 3. To check if a specific mobile exists:
-- SELECT * FROM users WHERE mobile = '9876543210';

-- 4. To manually change a user's role:
-- UPDATE users SET role = 'USER' WHERE mobile = '9876543210';

-- 5. To see the admin account:
SELECT * FROM users WHERE role = 'ADMIN';

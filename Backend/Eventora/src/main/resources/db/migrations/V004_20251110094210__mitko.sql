ALTER TABLE "User" ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'USER';

UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@eventora.com';

ALTER TABLE "User" ADD CONSTRAINT user_role_check 
    CHECK (role IN ('USER', 'ORGANIZER', 'ADMIN'));
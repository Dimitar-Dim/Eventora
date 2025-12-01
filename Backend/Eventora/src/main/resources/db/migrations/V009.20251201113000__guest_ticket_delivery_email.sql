ALTER TABLE "Ticket" ADD COLUMN delivery_email VARCHAR(320);
ALTER TABLE "Ticket" ALTER COLUMN user_id DROP NOT NULL;

UPDATE "Ticket" AS t
SET delivery_email = COALESCE(u.email, 'legacy-' || t.id || '@eventora.local')
FROM "User" AS u
WHERE t.user_id = u.id
  AND t.delivery_email IS NULL;

ALTER TABLE "Ticket" ALTER COLUMN delivery_email SET NOT NULL;

CREATE INDEX idx_ticket_delivery_email ON "Ticket"(delivery_email);

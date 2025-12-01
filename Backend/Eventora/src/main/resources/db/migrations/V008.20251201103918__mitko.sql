ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS seat_section VARCHAR(32);
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS seat_row VARCHAR(16);
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS seat_number VARCHAR(16);

WITH ordered AS (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY event_id ORDER BY COALESCE(created_at, NOW()), id) AS seq
    FROM "Ticket"
)
UPDATE "Ticket" AS t
SET seat_section = COALESCE(t.seat_section, CASE WHEN ((o.seq - 1) / 20) < 5 THEN 'Floor' ELSE 'Balcony' END),
    seat_row = COALESCE(t.seat_row, 'R' || (((o.seq - 1) / 20) + 1)::TEXT),
    seat_number = COALESCE(t.seat_number, LPAD((((o.seq - 1) % 20) + 1)::TEXT, 2, '0'))
FROM ordered AS o
WHERE t.id = o.id;

ALTER TABLE "Ticket"
    ALTER COLUMN seat_section SET NOT NULL,
    ALTER COLUMN seat_row SET NOT NULL,
    ALTER COLUMN seat_number SET NOT NULL;

CREATE INDEX IF NOT EXISTS ticket_seat_lookup_idx ON "Ticket" (event_id, seat_row, seat_number);
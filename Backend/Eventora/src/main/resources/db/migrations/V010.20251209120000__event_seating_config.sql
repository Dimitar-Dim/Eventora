ALTER TABLE "Event"
    ADD COLUMN IF NOT EXISTS has_seating BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS seating_layout VARCHAR(32) NOT NULL DEFAULT 'NONE',
    ADD COLUMN IF NOT EXISTS seated_capacity INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS standing_capacity INTEGER NOT NULL DEFAULT 600;

-- Enforce allowed values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'event_seating_layout_check'
    ) THEN
        ALTER TABLE "Event"
            ADD CONSTRAINT event_seating_layout_check
            CHECK (seating_layout IN ('NONE', 'FLOOR', 'FLOOR_BALCONY'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'event_standing_capacity_check'
    ) THEN
        ALTER TABLE "Event"
            ADD CONSTRAINT event_standing_capacity_check
            CHECK (standing_capacity BETWEEN 0 AND 600);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'event_seated_capacity_check'
    ) THEN
        ALTER TABLE "Event"
            ADD CONSTRAINT event_seated_capacity_check
            CHECK (seated_capacity IN (0, 300, 600));
    END IF;
END $$;

-- Backfill existing rows
UPDATE "Event"
SET has_seating = FALSE,
    seating_layout = 'NONE',
    seated_capacity = 0,
    standing_capacity = LEAST(max_tickets, 600)
WHERE has_seating IS DISTINCT FROM FALSE
   OR seating_layout IS DISTINCT FROM 'NONE'
   OR seated_capacity IS DISTINCT FROM 0
   OR standing_capacity IS DISTINCT FROM LEAST(max_tickets, 600);

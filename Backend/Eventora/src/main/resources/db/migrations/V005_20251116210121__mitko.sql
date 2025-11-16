-- Ticket purchase metadata columns and constraints
ALTER TABLE "Ticket"
    ADD COLUMN IF NOT EXISTS qr_code VARCHAR(255),
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE',
    ADD COLUMN IF NOT EXISTS issued_to VARCHAR(255) DEFAULT 'Ticket Holder';

UPDATE "Ticket"
SET
    qr_code = COALESCE(qr_code, MD5(CAST(random() AS TEXT) || CAST(clock_timestamp() AS TEXT))),
    status = COALESCE(status, 'ACTIVE'),
    issued_to = COALESCE(issued_to, 'Ticket Holder')
WHERE qr_code IS NULL OR status IS NULL OR issued_to IS NULL;

ALTER TABLE "Ticket"
    ALTER COLUMN qr_code SET NOT NULL,
    ALTER COLUMN status SET NOT NULL,
    ALTER COLUMN issued_to SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ticket_qr_code_unique'
    ) THEN
        ALTER TABLE "Ticket"
            ADD CONSTRAINT ticket_qr_code_unique UNIQUE (qr_code);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ticket_status_check'
    ) THEN
        ALTER TABLE "Ticket"
            ADD CONSTRAINT ticket_status_check
                CHECK (status IN ('ACTIVE', 'USED', 'EXPIRED'));
    END IF;
END $$;

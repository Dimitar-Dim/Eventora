CREATE TABLE IF NOT EXISTS verification_token (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT      NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    token        VARCHAR(128) NOT NULL UNIQUE,
    type         VARCHAR(50)  NOT NULL,
    expires_at   TIMESTAMP    NOT NULL,
    consumed_at  TIMESTAMP,
    metadata     TEXT,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS verification_token_user_idx
    ON verification_token (user_id);

CREATE INDEX IF NOT EXISTS verification_token_type_expiry_idx
    ON verification_token (type, expires_at);
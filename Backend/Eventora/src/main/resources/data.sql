-- Sample data for Eventoria
-- Run this after creating the schema

-- Sample events (assuming venue_id = 1 from the default venue)
INSERT INTO events (name, description, event_date, music_type, ticket_price, total_capacity, available_tickets, venue_id) VALUES
(
    'Electronic Dreams Festival',
    'A night of electronic music featuring top DJs from around the world. Experience cutting-edge sound in an immersive atmosphere.',
    '2025-11-15 20:00:00',
    'Electronic',
    45.00,
    3000,
    3000,
    1
),
(
    'Rock Revolution Concert',
    'Classic rock meets modern energy. Local and international rock bands come together for an unforgettable night.',
    '2025-11-22 19:30:00',
    'Rock',
    38.50,
    2500,
    2500,
    1
),
(
    'Jazz Under the Stars',
    'An intimate jazz evening featuring smooth melodies and soulful performances in our premium acoustic setting.',
    '2025-12-01 21:00:00',
    'Jazz',
    55.00,
    1000,
    1000,
    1
),
(
    'Hip-Hop Showcase',
    'The biggest names in hip-hop performing their latest hits and classic favorites.',
    '2025-12-08 20:30:00',
    'Hip-Hop',
    42.00,
    2800,
    2800,
    1
),
(
    'Classical Symphony Night',
    'A sophisticated evening of classical music performed by the city philharmonic orchestra.',
    '2025-12-15 19:00:00',
    'Classical',
    65.00,
    1500,
    1500,
    1
);

-- Sample tickets for the first event
INSERT INTO tickets (customer_name, customer_email, customer_phone, purchase_price, status, event_id, purchased_at) VALUES
(
    'John Smith',
    'john.smith@email.com',
    '+1-555-0101',
    45.00,
    'ACTIVE',
    1,
    '2025-10-01 14:30:00'
),
(
    'Maria Garcia',
    'maria.garcia@email.com',
    '+1-555-0102',
    45.00,
    'ACTIVE',
    1,
    '2025-10-01 15:45:00'
),
(
    'David Johnson',
    'david.johnson@email.com',
    '+1-555-0103',
    45.00,
    'ACTIVE',
    1,
    '2025-10-02 09:15:00'
),
(
    'Sarah Williams',
    'sarah.williams@email.com',
    '+1-555-0104',
    45.00,
    'ACTIVE',
    1,
    '2025-10-02 10:30:00'
),
(
    'Michael Brown',
    'michael.brown@email.com',
    '+1-555-0105',
    45.00,
    'CANCELLED',
    1,
    '2025-10-01 16:20:00'
);

-- Update available tickets count for the first event
UPDATE events SET available_tickets = available_tickets - 4 WHERE id = 1;
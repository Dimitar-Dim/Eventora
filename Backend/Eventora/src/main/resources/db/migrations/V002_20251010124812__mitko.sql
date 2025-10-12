CREATE TYPE genre AS ENUM ('Rock', 'Pop', 'Folk', 'Classical', 'Jazz', 'Metal', 'Techno');

ALTER TABLE "Event"
ADD COLUMN genre genre,
ADD COLUMN max_tickets INT,
ADD COLUMN available_tickets INT,
ADD COLUMN ticket_price DECIMAL(10,2);

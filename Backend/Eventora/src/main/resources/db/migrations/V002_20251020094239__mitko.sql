ALTER TABLE "Event"
ADD CONSTRAINT valid_genre CHECK (
  genre IN (
    'Rock',
    'Pop',
    'Folk',
    'Classical',
    'Jazz',
    'Metal',
    'Techno'
  )
);

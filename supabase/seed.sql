-- TWNG Seed Data
-- Run this after the schema migration to populate test data.

-- Replace this UUID with your actual auth.users.id after signing up
DO $$
DECLARE
    test_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN

-- Insert test user (skip if exists)
INSERT INTO users (id, email, username, display_name, bio, role, is_verified)
VALUES (
    test_user_id,
    'alex@example.com',
    'kalamazoo_kid',
    'Alex Rivera',
    'Heritage enthusiast. Kalamazoo or bust.',
    'user',
    true
) ON CONFLICT (id) DO NOTHING;

-- Guitars (Instrument Entities)

INSERT INTO guitars (id, owner_id, brand, model, year, serial_number, body_style, instrument_type, finish, specifications, state, source)
VALUES
    (gen_random_uuid(), test_user_id, 'Heritage', 'H-150 Standard', 2022, 'HER-2022-1150',
     'solid', 'electric', 'Honey Burst Nitrocellulose',
     '{"body_material": "Mahogany with Maple cap", "neck_material": "Mahogany, Set-neck", "fretboard": "Rosewood, 22 frets", "pickups": "Heritage PAF-style Humbuckers", "bridge": "TonePros ABR-1 style", "tuners": "Kluson-style", "weight": "8.7 lbs", "scale_length": "24.75\"", "condition": "Excellent", "verified": true, "tags": ["Kalamazoo", "PAF-style", "Flame Top"]}'::jsonb,
     'published', 'manual'),

    (gen_random_uuid(), test_user_id, 'Nash', 'S-57 Heavy Relic', 2021, 'NASH-S57-2021',
     'solid', 'electric', 'Three-Tone Sunburst Nitro, Heavy Relic',
     '{"body_material": "Alder", "neck_material": "Maple, bolt-on", "fretboard": "Maple, 21 frets", "pickups": "Lollar Vintage Blonde single-coils", "bridge": "Vintage tremolo", "tuners": "Gotoh vintage-style", "weight": "7.2 lbs", "scale_length": "25.5\"", "condition": "Relicd", "verified": true, "tags": ["Relic", "Sunburst", "SSS"]}'::jsonb,
     'published', 'manual'),

    (gen_random_uuid(), test_user_id, 'Fender', 'Telecaster Heavy Relic', 2019, 'FEN-TELE-2019',
     'solid', 'electric', 'Butterscotch Blonde Nitro, Heavy Relic',
     '{"body_material": "Ash", "neck_material": "Maple, bolt-on", "fretboard": "Maple, 21 frets", "pickups": "Hand-wound single-coils", "bridge": "Vintage 3-saddle", "tuners": "Kluson-style", "weight": "7.5 lbs", "scale_length": "25.5\"", "condition": "Relicd", "tags": ["Relic", "Blonde", "Custom"]}'::jsonb,
     'published', 'manual'),

    (gen_random_uuid(), test_user_id, 'Heritage', 'H-535 Semi-Hollow', 2023, 'HER-535-2023',
     'semi-hollow', 'electric', 'Translucent Cherry Nitrocellulose',
     '{"body_material": "Maple/Poplar/Maple laminate", "neck_material": "Mahogany, Set-neck", "fretboard": "Rosewood, 22 frets", "pickups": "Heritage HRW humbuckers", "bridge": "TonePros", "tuners": "Grover Rotomatic", "weight": "7.9 lbs", "scale_length": "24.75\"", "condition": "Mint", "verified": true, "tags": ["Semi-Hollow", "Cherry", "Jazz"]}'::jsonb,
     'published', 'manual'),

    (gen_random_uuid(), test_user_id, 'Suhr', 'Classic S Antique', 2022, 'SUHR-CS-2022',
     'solid', 'electric', 'Surf Green',
     '{"body_material": "Alder", "neck_material": "Maple, bolt-on", "fretboard": "Rosewood, 22 frets", "pickups": "Suhr V60LP single-coils + SSCII", "bridge": "Gotoh 510 tremolo", "tuners": "Suhr locking", "weight": "7.4 lbs", "scale_length": "25.5\"", "condition": "Excellent", "tags": ["Modern S-type", "SSS", "Boutique"]}'::jsonb,
     'published', 'manual'),

    (gen_random_uuid(), test_user_id, 'Brian May', 'BMG Special', 2020, 'BMG-SP-2020',
     'solid', 'electric', 'Antique Cherry',
     '{"body_material": "Mahogany", "neck_material": "Mahogany, set-neck", "fretboard": "Ebony, 24 frets", "pickups": "3x Burns Tri-Sonic", "bridge": "Roller bridge with custom tremolo", "tuners": "Grover", "weight": "8.2 lbs", "scale_length": "24\"", "condition": "Very Good", "verified": true, "tags": ["Signature", "Tri-Sonic", "Unique"]}'::jsonb,
     'published', 'manual'),

    (gen_random_uuid(), test_user_id, 'Gibson', 'ES-335 Figured', 2021, 'GIB-335-2021',
     'semi-hollow', 'electric', 'Iced Tea Burst',
     '{"body_material": "Maple/Poplar/Maple", "neck_material": "Mahogany, Set-neck", "fretboard": "Rosewood, 22 frets", "pickups": "MHS humbuckers", "bridge": "ABR-1", "tuners": "Grover Rotomatic", "weight": "8.1 lbs", "scale_length": "24.75\"", "condition": "Excellent", "verified": true, "tags": ["Semi-Hollow", "Blues", "Classic"]}'::jsonb,
     'published', 'manual'),

    (gen_random_uuid(), test_user_id, 'Martin', 'D-28', 2020, 'MAR-D28-2020',
     'acoustic', 'acoustic', 'Natural Gloss',
     '{"body_material": "Sitka Spruce top, East Indian Rosewood back/sides", "neck_material": "Select Hardwood", "fretboard": "Ebony, 20 frets", "pickups": "None (acoustic)", "bridge": "Ebony", "tuners": "Nickel Open Gear", "weight": "4.8 lbs", "scale_length": "25.4\"", "condition": "Excellent", "tags": ["Dreadnought", "Rosewood", "Iconic"]}'::jsonb,
     'published', 'manual'),

    (gen_random_uuid(), test_user_id, 'PRS', 'Custom 24-08', 2023, 'PRS-C24-2023',
     'solid', 'electric', 'McCarty Tobacco Sunburst',
     '{"body_material": "Mahogany with Maple cap", "neck_material": "Mahogany, Set-neck", "fretboard": "Rosewood, 24 frets", "pickups": "85/15 humbuckers with coil-split", "bridge": "PRS Tremolo", "tuners": "PRS Phase III locking", "weight": "8.0 lbs", "scale_length": "25\"", "condition": "Mint", "verified": true, "tags": ["Versatile", "10-Top", "Premium"]}'::jsonb,
     'published', 'manual'),

    (gen_random_uuid(), test_user_id, 'Yamaha', 'C40', 2023, NULL,
     'classical', 'classical', 'Natural Gloss',
     '{"body_material": "Spruce top, Meranti back/sides", "neck_material": "Nato", "fretboard": "Rosewood, 18 frets", "pickups": "None (acoustic)", "bridge": "Rosewood classical", "tuners": "Chrome open-gear", "weight": "3.6 lbs", "scale_length": "25.6\"", "condition": "Very Good", "tags": ["Classical", "Nylon", "Beginner"]}'::jsonb,
     'published', 'manual');

RAISE NOTICE 'Seed complete: 1 user, 10 guitars inserted.';

END $$;

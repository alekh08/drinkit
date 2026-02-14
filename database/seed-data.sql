-- ===============================================
-- DRINKIT - Seed Data for Demo Stores & Products
-- ===============================================
-- Run this file to populate database with sample stores and products
-- Command: psql -U postgres -d drinkit -f database/seed-data.sql

-- Step 1: Create Store Users
INSERT INTO users (mobile, name, role, is_verified, is_active) VALUES
('5001000001', 'Luxury Wine Shop', 'STORE', TRUE, TRUE),
('5001000002', 'Beer Paradise', 'STORE', TRUE, TRUE),
('5001000003', 'Premium Spirits', 'STORE', TRUE, TRUE),
('5001000004', 'Whisky World', 'STORE', TRUE, TRUE),
('5001000005', 'The Wine Cellar', 'STORE', TRUE, TRUE),
('5001000006', 'Vodka House', 'STORE', TRUE, TRUE),
('5001000007', 'Rum & More', 'STORE', TRUE, TRUE),
('5001000008', 'Champagne Dreams', 'STORE', TRUE, TRUE),
('5001000009', 'Local Brewery', 'STORE', TRUE, TRUE),
('5001000010', 'Tequila Town', 'STORE', TRUE, TRUE),
('5001000011', 'Gin Junction', 'STORE', TRUE, TRUE),
('5001000012', 'All Spirits Bazaar', 'STORE', TRUE, TRUE)
ON CONFLICT (mobile) DO NOTHING;

-- Step 2: Create Store Profiles
INSERT INTO stores (user_id, store_name, description, address, license_number, latitude, longitude, is_approved) 
SELECT 
    u.id,
    u.name,
    'Premium liquor store with wide selection',
    CASE 
        WHEN u.name = 'Luxury Wine Shop' THEN '123 MG Road, Near City Center, Bangalore'
        WHEN u.name = 'Beer Paradise' THEN '456 Park Street, Green Park, Bangalore'
        WHEN u.name = 'Premium Spirits' THEN '789 Mall Road, Commercial Complex, Bangalore'
        WHEN u.name = 'Whisky World' THEN '321 Brigade Road, Downtown, Bangalore'
        WHEN u.name = 'The Wine Cellar' THEN '654 Residency Road, Old Town, Bangalore'
        WHEN u.name = 'Vodka House' THEN '987 Church Street, Central Plaza, Bangalore'
        WHEN u.name = 'Rum & More' THEN '159 Indiranagar, 100 Feet Road, Bangalore'
        WHEN u.name = 'Champagne Dreams' THEN '753 Koramangala, 5th Block, Bangalore'
        WHEN u.name = 'Local Brewery' THEN '852 Jayanagar, 4th Block, Bangalore'
        WHEN u.name = 'Tequila Town' THEN '951 HSR Layout, Sector 1, Bangalore'
        WHEN u.name = 'Gin Junction' THEN '147 Whitefield, ITPL Main Road, Bangalore'
        ELSE '258 Electronic City, Phase 1, Bangalore'
    END,
    'LIC-' || LPAD((ROW_NUMBER() OVER())::TEXT, 6, '0'),
    12.9716 + (RANDOM() * 0.1),
    77.5946 + (RANDOM() * 0.1),
    TRUE
FROM users u
WHERE u.role = 'STORE' AND u.mobile LIKE '50010000%'
ON CONFLICT DO NOTHING;

-- Step 3: Create Products for Each Store
-- Luxury Wine Shop - Premium Wines
INSERT INTO products (store_id, name, brand, category, volume, price, stock_quantity, description, is_available)
SELECT s.id, p.product_name, p.brand, p.category, p.volume, p.price, p.stock, p.product_desc, TRUE
FROM stores s
CROSS JOIN (VALUES
    ('Cabernet Sauvignon', 'Sula', 'Wine', '750ml', 1200, 50, 'Rich red wine with notes of blackcurrant'),
    ('Shiraz Reserve', 'Grover Zampa', 'Wine', '750ml', 1500, 30, 'Full-bodied red wine'),
    ('Chardonnay', 'Fratelli', 'Wine', '750ml', 1800, 25, 'Crisp white wine'),
    ('Sauvignon Blanc', 'Four Seasons', 'Wine', '750ml', 900, 40, 'Refreshing white wine'),
    ('Rosé Wine', 'Sula', 'Wine', '750ml', 950, 35, 'Light and fruity rosé'),
    ('Merlot', 'York', 'Wine', '750ml', 1100, 45, 'Smooth red wine'),
    ('Pinot Noir', 'Fratelli', 'Wine', '750ml', 2200, 20, 'Premium red wine')
) AS p(product_name, brand, category, volume, price, stock, product_desc)
WHERE s.store_name = 'Luxury Wine Shop'
ON CONFLICT DO NOTHING;

-- Beer Paradise - Various Beers
INSERT INTO products (store_id, name, brand, category, volume, price, stock_quantity, description, is_available)
SELECT s.id, p.product_name, p.brand, p.category, p.volume, p.price, p.stock, p.product_desc, TRUE
FROM stores s
CROSS JOIN (VALUES
    ('Premium Lager', 'Kingfisher', 'Beer', '650ml', 150, 200, 'Classic Indian lager'),
    ('Strong Beer', 'Kingfisher Strong', 'Beer', '650ml', 180, 150, 'Bold and strong'),
    ('Wheat Beer', 'Bira White', 'Beer', '330ml', 200, 100, 'Light wheat beer'),
    ('IPA', 'Bira Boom', 'Beer', '330ml', 220, 80, 'India Pale Ale'),
    ('Premium Beer', 'Budweiser', 'Beer', '330ml', 250, 120, 'American lager'),
    ('Craft Beer', 'Simba Wit', 'Beer', '330ml', 280, 60, 'Belgian style wheat beer'),
    ('Dark Lager', 'Carlsberg Elephant', 'Beer', '500ml', 300, 90, 'Strong dark beer')
) AS p(product_name, brand, category, volume, price, stock, product_desc)
WHERE s.store_name = 'Beer Paradise'
ON CONFLICT DO NOTHING;

-- Premium Spirits - Whisky & Vodka
INSERT INTO products (store_id, name, brand, category, volume, price, stock_quantity, description, is_available)
SELECT s.id, p.product_name, p.brand, p.category, p.volume, p.price, p.stock, p.product_desc, TRUE
FROM stores s
CROSS JOIN (VALUES
    ('Black Label', 'Johnnie Walker', 'Whisky', '750ml', 4500, 30, 'Premium Scotch whisky'),
    ('Single Malt', 'Glenfiddich 12yr', 'Whisky', '750ml', 5500, 20, 'Highland single malt'),
    ('Reserve Whisky', 'Royal Challenge', 'Whisky', '750ml', 1200, 80, 'Indian whisky'),
    ('Premium Vodka', 'Absolut', 'Vodka', '750ml', 1800, 60, 'Swedish vodka'),
    ('Flavored Vodka', 'Smirnoff', 'Vodka', '750ml', 1500, 50, 'Russian vodka'),
    ('Luxury Vodka', 'Grey Goose', 'Vodka', '750ml', 4200, 15, 'French premium vodka')
) AS p(product_name, brand, category, volume, price, stock, product_desc)
WHERE s.store_name = 'Premium Spirits'
ON CONFLICT DO NOTHING;

-- Whisky World - Exclusive Whiskies
INSERT INTO products (store_id, name, brand, category, volume, price, stock_quantity, description, is_available)
SELECT s.id, p.product_name, p.brand, p.category, p.volume, p.price, p.stock, p.product_desc, TRUE
FROM stores s
CROSS JOIN (VALUES
    ('Officers Choice', 'Allied Blenders', 'Whisky', '750ml', 800, 150, 'Popular Indian whisky'),
    ('Royal Stag', 'Pernod Ricard', 'Whisky', '750ml', 1000, 120, 'Its your life'),
    ('Blenders Pride', 'Pernod Ricard', 'Whisky', '750ml', 1300, 100, 'Premium blend'),
    ('100 Pipers', 'Pernod Ricard', 'Whisky', '750ml', 1600, 70, 'Smooth Scotch'),
    ('Chivas Regal 12yr', 'Chivas', 'Whisky', '750ml', 3800, 25, 'Premium Scotch'),
    ('Jack Daniels', 'Jack Daniels', 'Whisky', '750ml', 3200, 40, 'Tennessee whisky'),
    ('Jim Beam', 'Beam Suntory', 'Whisky', '750ml', 2100, 55, 'Kentucky bourbon')
) AS p(product_name, brand, category, volume, price, stock, product_desc)
WHERE s.store_name = 'Whisky World'
ON CONFLICT DO NOTHING;

-- The Wine Cellar - International Wines
INSERT INTO products (store_id, name, brand, category, volume, price, stock_quantity, description, is_available)
SELECT s.id, p.product_name, p.brand, p.category, p.volume, p.price, p.stock, p.product_desc, TRUE
FROM stores s
CROSS JOIN (VALUES
    ('Malbec', 'Trapiche', 'Wine', '750ml', 1400, 40, 'Argentine red wine'),
    ('Tempranillo', 'Campo Viejo', 'Wine', '750ml', 1600, 35, 'Spanish red wine'),
    ('Prosecco', 'Martini', 'Wine', '750ml', 1800, 30, 'Italian sparkling wine'),
    ('Zinfandel', 'Ravenswood', 'Wine', '750ml', 2000, 25, 'American red wine'),
    ('Riesling', 'Yellow Tail', 'Wine', '750ml', 1100, 45, 'Australian white wine'),
    ('Moscato', 'Barefoot', 'Wine', '750ml', 950, 50, 'Sweet white wine')
) AS p(product_name, brand, category, volume, price, stock, product_desc)
WHERE s.store_name = 'The Wine Cellar'
ON CONFLICT DO NOTHING;

-- Vodka House - Premium Vodkas
INSERT INTO products (store_id, name, brand, category, volume, price, stock_quantity, description, is_available)
SELECT s.id, p.product_name, p.brand, p.category, p.volume, p.price, p.stock, p.product_desc, TRUE
FROM stores s
CROSS JOIN (VALUES
    ('Classic Vodka', 'Magic Moments', 'Vodka', '750ml', 650, 100, 'Indian vodka'),
    ('Flavored Vodka', 'Romanov', 'Vodka', '750ml', 700, 80, 'Premium Indian vodka'),
    ('Pure Vodka', 'Eristoff', 'Vodka', '750ml', 1200, 60, 'Georgian vodka'),
    ('Premium', 'Belvedere', 'Vodka', '750ml', 4800, 20, 'Polish luxury vodka'),
    ('Citrus Vodka', 'Absolut Citron', 'Vodka', '750ml', 1900, 40, 'Flavored vodka'),
    ('Russian Standard', 'Russian Standard', 'Vodka', '750ml', 1600, 50, 'Original Russian vodka')
) AS p(product_name, brand, category, volume, price, stock, product_desc)
WHERE s.store_name = 'Vodka House'
ON CONFLICT DO NOTHING;

-- Rum & More - Rum Collection
INSERT INTO products (store_id, name, brand, category, volume, price, stock_quantity, description, is_available)
SELECT s.id, p.product_name, p.brand, p.category, p.volume, p.price, p.stock, p.product_desc, TRUE
FROM stores s
CROSS JOIN (VALUES
    ('White Rum', 'Bacardi', 'Rum', '750ml', 1500, 70, 'Caribbean rum'),
    ('Dark Rum', 'Old Monk', 'Rum', '750ml', 600, 150, 'Indian dark rum'),
    ('Spiced Rum', 'Captain Morgan', 'Rum', '750ml', 1800, 50, 'Spiced Caribbean rum'),
    ('Gold Rum', 'Havana Club', 'Rum', '750ml', 2200, 40, 'Cuban rum'),
    ('Premium Rum', 'Malibu', 'Rum', '750ml', 1600, 55, 'Coconut rum'),
    ('Añejo Rum', 'Zacapa 23', 'Rum', '750ml', 6500, 15, 'Guatemalan premium rum')
) AS p(product_name, brand, category, volume, price, stock, product_desc)
WHERE s.store_name = 'Rum & More'
ON CONFLICT DO NOTHING;

-- Champagne Dreams - Sparkling Wines & Champagne
INSERT INTO products (store_id, name, brand, category, volume, price, stock_quantity, description, is_available)
SELECT s.id, p.product_name, p.brand, p.category, p.volume, p.price, p.stock, p.product_desc, TRUE
FROM stores s
CROSS JOIN (VALUES
    ('Brut Champagne', 'Chandon', 'Champagne', '750ml', 2800, 30, 'Indian sparkling wine'),
    ('Rosé Champagne', 'Chandon Rosé', 'Champagne', '750ml', 3200, 25, 'Premium rosé sparkling'),
    ('Prosecco DOC', 'La Marca', 'Wine', '750ml', 2000, 40, 'Italian prosecco'),
    ('Sparkling Wine', 'Sula Brut', 'Wine', '750ml', 850, 50, 'Indian sparkling wine'),
    ('Premium Bubbly', 'Veuve Clicquot', 'Champagne', '750ml', 8500, 10, 'French champagne'),
    ('Cava', 'Freixenet', 'Wine', '750ml', 1200, 35, 'Spanish sparkling wine')
) AS p(product_name, brand, category, volume, price, stock, product_desc)
WHERE s.store_name = 'Champagne Dreams'
ON CONFLICT DO NOTHING;

-- Local Brewery - Craft Beers
INSERT INTO products (store_id, name, brand, category, volume, price, stock_quantity, description, is_available)
SELECT s.id, p.product_name, p.brand, p.category, p.volume, p.price, p.stock, p.product_desc, TRUE
FROM stores s
CROSS JOIN (VALUES
    ('Blonde Ale', 'Bira 91 Blonde', 'Beer', '330ml', 190, 100, 'Light craft beer'),
    ('Wheat Beer', 'Hoegaarden', 'Beer', '330ml', 280, 70, 'Belgian wheat beer'),
    ('Pale Ale', 'White Owl', 'Beer', '330ml', 220, 80, 'Indian pale ale'),
    ('Stout', 'Geist Stout', 'Beer', '330ml', 260, 50, 'Dark stout beer'),
    ('Lager', 'Simba Strong', 'Beer', '500ml', 180, 120, 'Strong lager'),
    ('Session IPA', 'Doolally', 'Beer', '330ml', 240, 60, 'Craft IPA')
) AS p(product_name, brand, category, volume, price, stock, product_desc)
WHERE s.store_name = 'Local Brewery'
ON CONFLICT DO NOTHING;

-- Tequila Town - Tequila & Mezcal
INSERT INTO products (store_id, name, brand, category, volume, price, stock_quantity, description, is_available)
SELECT s.id, p.product_name, p.brand, p.category, p.volume, p.price, p.stock, p.product_desc, TRUE
FROM stores s
CROSS JOIN (VALUES
    ('Silver Tequila', 'Jose Cuervo', 'Tequila', '750ml', 2800, 40, 'Classic silver tequila'),
    ('Gold Tequila', 'Jose Cuervo Gold', 'Tequila', '750ml', 3200, 35, 'Gold tequila'),
    ('Reposado', 'Patron Reposado', 'Tequila', '750ml', 6500, 15, 'Aged tequila'),
    ('Añejo Tequila', '1800 Añejo', 'Tequila', '750ml', 5500, 20, 'Premium aged tequila'),
    ('Mezcal', 'Del Maguey', 'Tequila', '750ml', 7200, 10, 'Artisanal mezcal'),
    ('Blanco', 'Don Julio Blanco', 'Tequila', '750ml', 5800, 18, 'Pure tequila')
) AS p(product_name, brand, category, volume, price, stock, product_desc)
WHERE s.store_name = 'Tequila Town'
ON CONFLICT DO NOTHING;

-- Gin Junction - Gin Collection
INSERT INTO products (store_id, name, brand, category, volume, price, stock_quantity, description, is_available)
SELECT s.id, p.product_name, p.brand, p.category, p.volume, p.price, p.stock, p.product_desc, TRUE
FROM stores s
CROSS JOIN (VALUES
    ('London Dry Gin', 'Bombay Sapphire', 'Gin', '750ml', 2200, 50, 'Classic London dry gin'),
    ('Premium Gin', 'Tanqueray', 'Gin', '750ml', 2400, 40, 'Premium London gin'),
    ('Craft Gin', 'Greater Than', 'Gin', '750ml', 2800, 30, 'Indian craft gin'),
    ('Flavored Gin', 'Gordons Pink', 'Gin', '750ml', 1800, 45, 'Strawberry flavored gin'),
    ('Luxury Gin', 'Hendricks', 'Gin', '750ml', 4200, 20, 'Scottish gin'),
    ('Navy Strength', 'Jaisalmer Gin', 'Gin', '750ml', 2600, 35, 'Indian premium gin')
) AS p(product_name, brand, category, volume, price, stock, product_desc)
WHERE s.store_name = 'Gin Junction'
ON CONFLICT DO NOTHING;

-- All Spirits Bazaar - Mixed Collection
INSERT INTO products (store_id, name, brand, category, volume, price, stock_quantity, description, is_available)
SELECT s.id, p.product_name, p.brand, p.category, p.volume, p.price, p.stock, p.product_desc, TRUE
FROM stores s
CROSS JOIN (VALUES
    ('Red Wine', 'Sula Shiraz', 'Wine', '750ml', 900, 60, 'Indian red wine'),
    ('Beer Pack', 'Corona', 'Beer', '330ml', 180, 100, 'Mexican beer'),
    ('Scotch Whisky', 'Dewars', 'Whisky', '750ml', 2400, 45, 'Blended Scotch'),
    ('White Rum', 'Bacardi White', 'Rum', '750ml', 1400, 50, 'Light rum'),
    ('Gin', 'Bombay Dry', 'Gin', '750ml', 1800, 40, 'Classic gin'),
    ('Vodka', 'Smirnoff Red', 'Vodka', '750ml', 1400, 55, 'Classic vodka'),
    ('Brandy', 'Mansion House', 'Brandy', '750ml', 1100, 65, 'Indian brandy'),
    ('Port Wine', 'Sandeman', 'Wine', '750ml', 1600, 30, 'Portuguese port')
) AS p(product_name, brand, category, volume, price, stock, product_desc)
WHERE s.store_name = 'All Spirits Bazaar'
ON CONFLICT DO NOTHING;

-- Success Message
SELECT 'Seed data inserted successfully!' AS status,
       COUNT(DISTINCT s.id) AS total_stores,
       COUNT(p.id) AS total_products
FROM stores s
LEFT JOIN products p ON s.id = p.store_id
WHERE s.store_name IN (
    'Luxury Wine Shop', 'Beer Paradise', 'Premium Spirits', 
    'Whisky World', 'The Wine Cellar', 'Vodka House', 
    'Rum & More', 'Champagne Dreams', 'Local Brewery', 
    'Tequila Town', 'Gin Junction', 'All Spirits Bazaar'
);

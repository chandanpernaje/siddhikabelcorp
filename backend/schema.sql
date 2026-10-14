-- Siddhi Kabel – starter database schema (PostgreSQL)
-- Covers: products, variants (core x size x colour), users, quote requests.

CREATE TABLE brands (
  id          SERIAL PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,          -- lapp, eaton, mennekes, partex
  name        TEXT NOT NULL
);

CREATE TABLE products (
  id          SERIAL PRIMARY KEY,
  brand_id    INT NOT NULL REFERENCES brands(id),
  series      TEXT NOT NULL,                 -- e.g. 110, 110 SY, 110 CV, 100
  name        TEXT NOT NULL,
  part_no     TEXT,
  hsn_code    TEXT,
  description TEXT,
  image_url   TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

-- One row per orderable variant (core / size / colour combination)
CREATE TABLE product_variants (
  id           SERIAL PRIMARY KEY,
  product_id   INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  cores        INT,                          -- NULL for single core
  size_sqmm    NUMERIC(6,2),
  protective   CHAR(1) CHECK (protective IN ('G','X')),  -- G = with earth, X = without
  colour       TEXT,                         -- single core only
  unit_price   NUMERIC(12,2) NOT NULL,
  min_qty_m    INT NOT NULL DEFAULT 25,      -- minimum order in metres
  qty_step_m   INT NOT NULL DEFAULT 25,      -- 10 or 25
  gst_percent  NUMERIC(4,1) NOT NULL DEFAULT 18,
  UNIQUE (product_id, cores, size_sqmm, protective, colour)
);

CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  phone       TEXT,
  company     TEXT,
  password_hash TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Request Quote / product enquiry
CREATE TABLE quote_requests (
  id          SERIAL PRIMARY KEY,
  user_id     INT REFERENCES users(id),      -- NULL for guest enquiries
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  company     TEXT,
  message     TEXT,
  status      TEXT NOT NULL DEFAULT 'new',   -- new / quoted / closed
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE quote_items (
  id          SERIAL PRIMARY KEY,
  quote_id    INT NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
  variant_id  INT NOT NULL REFERENCES product_variants(id),
  qty_m       INT NOT NULL
);

CREATE INDEX idx_products_brand_series ON products(brand_id, series);
CREATE INDEX idx_variants_product ON product_variants(product_id);
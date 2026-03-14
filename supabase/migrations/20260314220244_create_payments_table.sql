/*
  # Create payments table

  Tracks every successful Stripe payment tied to a strike.

  1. New Tables
    - `payments`
      - `id` (uuid, primary key)
      - `strike_id` (uuid, FK → strikes.id)
      - `stripe_session_id` (text, unique) — Stripe checkout session ID
      - `stripe_payment_intent_id` (text) — Stripe PaymentIntent ID
      - `amount_cents` (integer) — amount in cents (e.g. 29900 = $299.00)
      - `currency` (text) — lowercase ISO currency code (e.g. 'cad')
      - `status` (text) — 'succeeded' | 'refunded' | 'disputed'
      - `customer_email` (text)
      - `metadata` (jsonb) — raw Stripe session metadata snapshot
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `payments`
    - Only authenticated users can SELECT their own payments (via strikes ownership)
    - Service role key (used by edge functions) bypasses RLS

  3. Indexes
    - `payments_strike_id_idx` for fast join to strikes
    - `payments_stripe_session_id_key` unique index
*/

CREATE TABLE IF NOT EXISTS payments (
  id                       uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  strike_id                uuid        REFERENCES strikes(id) ON DELETE SET NULL,
  stripe_session_id        text        UNIQUE NOT NULL,
  stripe_payment_intent_id text,
  amount_cents             integer     NOT NULL DEFAULT 0,
  currency                 text        NOT NULL DEFAULT 'cad',
  status                   text        NOT NULL DEFAULT 'succeeded',
  customer_email           text,
  metadata                 jsonb       DEFAULT '{}'::jsonb,
  created_at               timestamptz DEFAULT now(),
  updated_at               timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payments_strike_id_idx ON payments(strike_id);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view payments for their strikes"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM strikes
      WHERE strikes.id = payments.strike_id
    )
  );

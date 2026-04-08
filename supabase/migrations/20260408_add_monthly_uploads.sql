-- Adiciona controle de uploads mensais na tabela profiles
-- monthly_uploads: quantidade de uploads feitos no mês corrente
-- uploads_reset_at: data de quando os uploads mensais devem ser resetados (dia 1 do próximo mês)
-- analysis_count já existe para o plano Scanner (vitalício)

ALTER TABLE "public"."profiles"
  ADD COLUMN IF NOT EXISTS "monthly_uploads" integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "uploads_reset_at" timestamptz DEFAULT date_trunc('month', now()) + interval '1 month';

-- Atualiza o valor padrão do plano para 'scanner' em vez de 'free'
UPDATE "public"."profiles" SET plan = 'scanner' WHERE plan = 'free' OR plan IS NULL;
ALTER TABLE "public"."profiles" ALTER COLUMN plan SET DEFAULT 'scanner';

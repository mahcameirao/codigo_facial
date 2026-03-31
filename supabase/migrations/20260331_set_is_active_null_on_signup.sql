-- Permitir que is_active seja NULL
ALTER TABLE public.profiles ALTER COLUMN is_active DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN is_active SET DEFAULT NULL;

-- Atualizar a função handle_new_user para garantir que is_active comece como NULL
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, cpf, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'cpf', ''),
    NULL
  );
  RETURN NEW;
END;
$$;

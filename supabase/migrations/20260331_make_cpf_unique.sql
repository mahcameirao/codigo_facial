-- Adicionar restrição UNIQUE ao CPF para garantir que não haja duplicidade
ALTER TABLE public.profiles ADD CONSTRAINT unique_cpf UNIQUE (cpf);

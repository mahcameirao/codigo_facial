import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Register = () => {
    const [name, setName] = useState("");
    const [cpf, setCpf] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [isCpfRegistered, setIsCpfRegistered] = useState(false);
    const { signUp } = useAuth();
    const navigate = useNavigate();

    // Máscara simples para CPF (000.000.000-00)
    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 11) value = value.slice(0, 11);
        
        value = value.replace(/(\d{3})(\d)/, "$1.$2");
        value = value.replace(/(\d{3})(\d)/, "$1.$2");
        value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        
        setCpf(value);
        setIsCpfRegistered(false);
    };

    const handleCpfBlur = async () => {
        if (cpf.length < 14) return;

        const { data: existingUser } = await (supabase
            .from('profiles')
            .select('id')
            .eq('cpf', cpf)
            .maybeSingle() as any);

        if (existingUser) {
            setIsCpfRegistered(true);
            toast.warning("CPF já cadastrado", {
                description: "Este CPF já possui uma conta ativa. Direcionando para o login...",
                duration: 3000,
            });
            setTimeout(() => navigate("/login"), 1500);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Checagem final antes de enviar
        const { data: existingUser } = await (supabase
            .from('profiles')
            .select('id')
            .eq('cpf', cpf)
            .maybeSingle() as any);

        if (existingUser) {
            setLoading(false);
            toast.warning("CPF já cadastrado", {
                description: "Redirecionando para o login...",
            });
            navigate("/login");
            return;
        }

        const { error } = await signUp(email, name, cpf);
        setLoading(false);

        if (error) {
            toast.error("Erro no cadastro", {
                description: error,
            });
        } else {
            toast.success("Código enviado!", {
                description: "Verifique seu e-mail para validar sua conta.",
            });
            navigate("/validation", { state: { email } });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <Card className="w-full max-w-md border-primary/20 bg-card/50 backdrop-blur-sm shadow-2xl">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-3xl font-display font-bold">
                        Criar <span className="text-gradient-gold">Conta</span>
                    </CardTitle>
                    <CardDescription>
                        Entraremos em contato com um código de acesso
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome Completo</Label>
                            <Input id="name" placeholder="Ex: Maria Silva" value={name} onChange={(e) => setName(e.target.value)} required className="bg-background/50 border-primary/20 focus:border-primary/50" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cpf">CPF</Label>
                            <Input 
                                id="cpf" 
                                placeholder="000.000.000-00" 
                                value={cpf} 
                                onChange={handleCpfChange} 
                                onBlur={handleCpfBlur}
                                required 
                                className="bg-background/50 border-primary/20 focus:border-primary/50" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-background/50 border-primary/20 focus:border-primary/50" />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full" variant="hero" disabled={loading || isCpfRegistered}>
                            {loading ? "Criando conta..." : isCpfRegistered ? "CPF já cadastrado" : "Criar Conta Grátis"}
                        </Button>
                        <div className="text-center text-sm text-muted-foreground">
                            Já tem uma conta?{" "}
                            <Link to="/login" className="text-primary hover:underline font-semibold">Faça login</Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default Register;

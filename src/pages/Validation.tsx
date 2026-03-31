import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";

const Validation = () => {
    const [token, setToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const { verifyEmailOtp, resendOtp } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Pegar o email do estado da navegação (enviado pelo Register.tsx)
    const email = location.state?.email || "";

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleVerify = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (token.length !== 6) return;
        
        setLoading(true);
        const { error } = await verifyEmailOtp(email, token);
        
        if (error) {
            setLoading(false);
            toast.error("Token inválido", {
                description: error,
            });
        } else {
            // Ativa o perfil após validar o e-mail
            await supabase.from('profiles').update({ is_active: true }).eq('email', email);
            setLoading(false);
            toast.success("E-mail validado com sucesso!", {
                description: "Bem-vindo(a) à plataforma.",
            });
            navigate("/");
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleResend = async () => {
        if (timeLeft > 0) return;
        setLoading(true);
        const { error } = await resendOtp(email);
        setLoading(false);
        if (error) {
            toast.error("Erro ao reenviar", { description: error });
        } else {
            toast.success("Código reenviado com sucesso!");
            setTimeLeft(60);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <Card className="w-full max-w-md border-primary/20 bg-card/50 backdrop-blur-sm shadow-2xl">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-3xl font-display font-bold">
                        Validar <span className="text-gradient-gold">E-mail</span>
                    </CardTitle>
                    <CardDescription>
                        Digite o código de 6 dígitos enviado para <br/>
                        <span className="font-semibold text-foreground">{email}</span>
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleVerify}>
                    <CardContent className="flex flex-col items-center space-y-6 py-6">
                        <InputOTP
                            maxLength={6}
                            value={token}
                            onChange={(value) => setToken(value)}
                        >
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>
                            <div className="text-center space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    Não recebeu o código? Verifique sua caixa de spam.
                                </p>
                                {timeLeft > 0 ? (
                                    <p className="text-xs text-muted-foreground">
                                        Reenviar disponível em {timeLeft}s
                                    </p>
                                ) : (
                                    <Button 
                                        type="button" 
                                        variant="link" 
                                        size="sm" 
                                        onClick={handleResend}
                                        className="text-primary p-0 h-auto"
                                    >
                                        reenviar código de confirmação
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4">
                            <Button 
                                type="submit" 
                                className="w-full" 
                                variant="hero" 
                                disabled={loading || token.length !== 6}
                            >
                                {loading ? "Validando..." : "Confirmar Código"}
                            </Button>
                        </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default Validation;

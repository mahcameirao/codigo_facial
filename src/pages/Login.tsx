import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, LogIn } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ title: "Erro", description: "Preencha todos os campos.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    const { error } = await signIn(email.trim(), password);
    setIsLoading(false);
    if (error) {
      const isEmailNotConfirmed = error.toLowerCase().includes("email not confirmed");
      toast({ 
        title: isEmailNotConfirmed ? "Confirmação Pendente" : "Erro ao entrar", 
        description: isEmailNotConfirmed ? "Você precisa clicar no link de confirmação enviado para o seu e-mail antes de fazer login." : error, 
        variant: "destructive" 
      });
    } else {
      navigate("/upload");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground font-display">Entrar</h1>
          <p className="text-muted-foreground">Acesse sua conta do Método Leitura Facial</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 bg-card p-8 rounded-xl border border-border shadow-lg">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-secondary border-border text-foreground"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-secondary border-border text-foreground pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Entrar
              </>
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Não tem conta?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Cadastre-se
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;

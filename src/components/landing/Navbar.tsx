import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-6 flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-display font-bold text-sm">CF</span>
          </div>
          <span className="font-display font-semibold text-lg">Código Facial</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Recursos</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">Como funciona</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Preços</a>
        </div>

        <div className="flex items-center gap-4">
          {profile ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline">Olá, {profile.name.split(' ')[0]}</span>
              <Button variant="outline" size="sm" onClick={signOut}>
                Sair
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="hidden sm:inline-flex">
                Entrar
              </Button>
              <Button variant="hero" size="sm" onClick={() => navigate("/register")}>
                Criar conta
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

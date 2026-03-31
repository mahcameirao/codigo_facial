import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-6 flex h-16 items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-2"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
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
          {user ? (
            <div className="flex items-center gap-2">
              <Button variant="hero" size="sm" onClick={() => navigate("/profile")} className="hidden sm:inline-flex">
                Perfil
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                sair
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="hidden sm:inline-flex">
                entrar
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

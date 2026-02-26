import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-6 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-display font-bold text-sm">LF</span>
          </div>
          <span className="font-display font-semibold text-lg">Leitura Facial</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Recursos</a>
          <a href="#" className="hover:text-foreground transition-colors">Como funciona</a>
          <a href="#" className="hover:text-foreground transition-colors">Preços</a>
        </div>

        <Button variant="hero" size="sm" onClick={() => navigate("/upload")}>
          Começar agora
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;

const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-display font-bold text-sm">LF</span>
            </div>
            <span className="font-display font-semibold text-lg">Leitura Facial</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Leitura Facial. Não substitui diagnóstico médico. Conformidade LGPD.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

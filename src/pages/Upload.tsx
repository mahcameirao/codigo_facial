import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Image, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MAX_SIZE = 10 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

const UploadPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = useCallback((f: File) => {
    setError(null);
    if (!ACCEPTED.includes(f.type)) {
      setError("Formato não aceito. Use JPG, PNG ou WEBP.");
      return;
    }
    if (f.size > MAX_SIZE) {
      setError("Arquivo muito grande. Máximo 10MB.");
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleAnalyze = async () => {
    if (!file) return;

    if (user && profile) {
      if ((profile.analysis_count || 0) >= 1) {
        toast.error("Limite Atingido", {
          description: "Você já utilizou sua análise no plano gratuito. Assine o Pro para análises ilimitadas."
        });
        document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ analysis_count: (profile.analysis_count || 0) + 1 })
        .eq('id', user.id);

      if (updateError) {
        toast.error("Erro", { description: "Erro ao registrar uso da análise. Tente novamente." });
        return;
      }
    }

    setLoading(true);
    // Simulate processing
    setTimeout(() => {
      navigate("/results", { state: { imageUrl: preview } });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-6 pt-28 pb-16">
        <button
          onClick={() => {
            navigate("/");
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>

        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-4xl font-bold mb-3 text-center">
            Envie sua <span className="text-gradient-gold">foto</span>
          </h1>
          <p className="text-muted-foreground text-center mb-10">
            Foto frontal, boa iluminação, sem óculos escuros.
          </p>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative h-24 w-24 mb-8">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <div className="absolute inset-3 rounded-full border-2 border-accent/20" />
                <div className="absolute inset-3 rounded-full border-2 border-accent border-b-transparent animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
              </div>
              <p className="font-display text-xl font-semibold mb-2">Analisando seu rosto...</p>
              <p className="text-sm text-muted-foreground">Mapeando 468 pontos faciais</p>
            </div>
          ) : (
            <>
              {/* Drop zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 ${
                  preview
                    ? "border-primary/50 bg-card"
                    : "border-border hover:border-primary/30 bg-card/30 hover:bg-card/50"
                } p-8`}
              >
                {preview ? (
                  <div className="flex flex-col items-center">
                    <div className="relative rounded-xl overflow-hidden mb-6 max-w-sm">
                      <img src={preview} alt="Preview" className="w-full h-auto" />
                      <div className="absolute inset-0 border-2 border-primary/20 rounded-xl" />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-primary mb-4">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{file?.name}</span>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="heroOutline"
                        size="sm"
                        onClick={() => {
                          setPreview(null);
                          setFile(null);
                        }}
                      >
                        Trocar foto
                      </Button>
                      <Button variant="hero" size="lg" className="px-10" onClick={handleAnalyze}>
                        Analisar rosto
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center cursor-pointer py-12">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <p className="font-display text-lg font-semibold mb-2">
                      Arraste sua foto aqui
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                      ou clique para selecionar • JPG, PNG, WEBP até 10MB
                    </p>
                    <Button variant="heroOutline" size="sm" asChild>
                      <span>Selecionar arquivo</span>
                    </Button>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFile(f);
                      }}
                    />
                  </label>
                )}
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              {/* Requirements */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Image, text: "Foto frontal" },
                  { icon: Image, text: "Boa iluminação" },
                  { icon: Image, text: "Sem óculos escuros" },
                  { icon: Image, text: "Apenas 1 rosto" },
                ].map((req, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <req.icon className="h-3.5 w-3.5 text-primary/60" />
                    <span>{req.text}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UploadPage;

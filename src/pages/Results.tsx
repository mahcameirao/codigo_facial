import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Scissors, Glasses, Palette, Crown, Target, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";

const mockData = {
  face_shape: "Oval",
  golden_ratio_score: 1.59,
  symmetry_score: 87,
  thirds_balance: { upper: 33, middle: 31, lower: 36 },
  measurements: {
    face_height: "18.2 cm",
    zygomatic_width: "13.4 cm",
    jaw_width: "11.1 cm",
    forehead_width: "12.8 cm",
  },
  analysis_text:
    "Seu rosto oval é considerado o formato mais equilibrado pela teoria visagista. Apresenta boa simetria e proporções próximas à proporção áurea de 1.618. Os terços faciais estão bem distribuídos, com leve predominância do terço inferior, o que transmite uma imagem de determinação e confiabilidade.",
  personality:
    "O formato oval transmite equilíbrio, harmonia e versatilidade. É associado a características de adaptabilidade, diplomacia e elegância natural.",
  strengths: [
    "Excelente simetria bilateral",
    "Proporções próximas ao ideal áureo",
    "Terços faciais bem distribuídos",
    "Formato versátil para diversos estilos",
  ],
  suggestions: {
    hair: [
      "Cortes médios com camadas suaves",
      "Franjas laterais para adicionar movimento",
      "Evitar volume excessivo nas laterais",
    ],
    glasses: [
      "Armações retangulares ou cat-eye",
      "Evitar armações muito arredondadas",
      "Tamanho proporcional à largura do rosto",
    ],
    beard: [
      "Barba curta e bem aparada",
      "Contorno natural do maxilar",
      "Bigode discreto para equilibrar terço médio",
    ],
    aesthetic: [
      "Contorno sutil nas têmporas",
      "Iluminador no arco do cupido e têmporas",
      "Blush aplicado nas maçãs do rosto em diagonal",
    ],
  },
};

const MetricCard = ({
  label,
  value,
  icon: Icon,
  color = "primary",
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
}) => (
  <div className="rounded-xl border border-border bg-card/50 p-5 flex items-start gap-4">
    <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
      color === "accent" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
    }`}>
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-xl font-bold font-display">{value}</p>
    </div>
  </div>
);

const ThirdsBar = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center gap-3">
    <span className="text-sm text-muted-foreground w-20">{label}</span>
    <div className="flex-1 h-3 rounded-full bg-secondary overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-1000"
        style={{ width: `${value}%` }}
      />
    </div>
    <span className="text-sm font-semibold w-10 text-right">{value}%</span>
  </div>
);

const SuggestionCard = ({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: React.ElementType;
  items: string[];
}) => (
  <div className="rounded-xl border border-border bg-card/50 p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
    </div>
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
          <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

const ResultsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-6 pt-28 pb-16">
        <button
          onClick={() => navigate("/upload")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Nova análise
        </button>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
              Sua Análise <span className="text-gradient-gold">Visagista</span>
            </h1>
            <p className="text-muted-foreground">Resultados baseados em proporção áurea e visagismo clássico</p>
          </div>

          {/* Main metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <MetricCard icon={Crown} label="Formato do Rosto" value={mockData.face_shape} />
            <MetricCard icon={Target} label="Proporção Áurea" value={mockData.golden_ratio_score.toFixed(2)} color="accent" />
            <MetricCard icon={Percent} label="Simetria Facial" value={`${mockData.symmetry_score}%`} />
            <MetricCard icon={Target} label="Largura Zigomática" value={mockData.measurements.zygomatic_width} color="accent" />
          </div>

          {/* Thirds balance */}
          <div className="rounded-xl border border-border bg-card/50 p-6 mb-10">
            <h2 className="font-display text-xl font-semibold mb-5">Regra dos Terços</h2>
            <div className="space-y-4">
              <ThirdsBar label="Superior" value={mockData.thirds_balance.upper} />
              <ThirdsBar label="Médio" value={mockData.thirds_balance.middle} />
              <ThirdsBar label="Inferior" value={mockData.thirds_balance.lower} />
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Ideal: distribuição equilibrada de ~33.3% em cada terço
            </p>
          </div>

          {/* Analysis text */}
          <div className="rounded-xl border border-primary/20 bg-card/50 p-6 mb-10 glow-card">
            <h2 className="font-display text-xl font-semibold mb-3">Análise Personalizada</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">{mockData.analysis_text}</p>
            <div className="border-t border-border pt-4 mt-4">
              <h3 className="text-sm font-semibold text-primary mb-2">Psicologia da Imagem</h3>
              <p className="text-sm text-muted-foreground">{mockData.personality}</p>
            </div>
          </div>

          {/* Strengths */}
          <div className="rounded-xl border border-border bg-card/50 p-6 mb-10">
            <h2 className="font-display text-xl font-semibold mb-4">Pontos Fortes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mockData.strengths.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs text-primary font-bold">{i + 1}</span>
                  </div>
                  <span className="text-foreground/80">{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          <h2 className="font-display text-2xl font-bold mb-6">
            Sugestões <span className="text-gradient-gold">Personalizadas</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <SuggestionCard title="Cortes de Cabelo" icon={Scissors} items={mockData.suggestions.hair} />
            <SuggestionCard title="Armações de Óculos" icon={Glasses} items={mockData.suggestions.glasses} />
            <SuggestionCard title="Barba" icon={Crown} items={mockData.suggestions.beard} />
            <SuggestionCard title="Estética" icon={Palette} items={mockData.suggestions.aesthetic} />
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-primary/30 bg-card p-8 text-center glow-gold">
            <h2 className="font-display text-2xl font-bold mb-2">Quer o relatório completo em PDF?</h2>
            <p className="text-muted-foreground mb-6">
              Assine o plano Premium e tenha acesso ao relatório detalhado com todas as métricas.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="hero" size="lg" className="px-8">
                <Download className="mr-2 h-5 w-5" />
                Baixar PDF Premium
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;

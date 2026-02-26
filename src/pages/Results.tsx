import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Download, Scissors, Glasses, Palette, Crown, Target, Percent, Ruler, Eye, Activity, Info, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { analyzeVisagism, type RawMeasurements, type ComparisonResult, type VisagismResult } from "@/lib/visagism-calculator";
import FaceMeasurementsOverlay from "@/components/results/FaceMeasurementsOverlay";
import FacePointsEditor from "@/components/results/FacePointsEditor";
import { useMemo, useState, useCallback } from "react";

// Medidas simuladas (em cm) — serão substituídas por dados reais da IA
const MOCK_RAW: RawMeasurements = {
  a: 3.2,  // Distância dos olhos (largura do olho)
  b: 3.4,  // Distância entre os olhos (interocular)
  c: 3.5,  // Largura do nariz
  j: 18.2, // Altura do rosto real
  k: 13.4, // Largura do rosto real
  l: 5.1,  // Largura da boca real
  m: 6.0,  // Terço superior
  n: 5.6,  // Terço médio
  o: 6.6,  // Terço inferior
};

// ---- Sub-components ----

const StatusIcon = ({ status }: { status: "equal" | "greater" | "lesser" }) => {
  if (status === "equal") return <CheckCircle2 className="h-4 w-4 text-green-400" />;
  if (status === "greater") return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
  return <XCircle className="h-4 w-4 text-red-400" />;
};

const statusColor = (status: "equal" | "greater" | "lesser") =>
  status === "equal" ? "border-green-400/30 bg-green-400/5" : status === "greater" ? "border-yellow-400/30 bg-yellow-400/5" : "border-red-400/30 bg-red-400/5";

const MetricCard = ({
  label, value, icon: Icon, color = "primary", tooltip,
}: {
  label: string; value: string | number; icon: React.ElementType; color?: string; tooltip?: string;
}) => {
  const card = (
    <div className="rounded-xl border border-border bg-card/50 p-5 flex items-start gap-4 hover:border-primary/30 transition-colors">
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
  if (!tooltip) return card;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{card}</TooltipTrigger>
      <TooltipContent><p className="max-w-[200px] text-xs">{tooltip}</p></TooltipContent>
    </Tooltip>
  );
};

const ThirdsBar = ({ label, value, ideal }: { label: string; value: number; ideal: number }) => (
  <div className="flex items-center gap-3">
    <span className="text-sm text-muted-foreground w-20">{label}</span>
    <div className="flex-1 h-3 rounded-full bg-secondary overflow-hidden relative">
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-1000"
        style={{ width: `${value}%` }}
      />
      <div className="absolute top-0 h-full w-px bg-foreground/30" style={{ left: `${ideal}%` }} />
    </div>
    <span className="text-sm font-semibold w-10 text-right">{value}%</span>
  </div>
);

const ComparisonCard = ({ comparison }: { comparison: ComparisonResult }) => (
  <div className={`rounded-xl border p-5 ${statusColor(comparison.status)}`}>
    <div className="flex items-start gap-3">
      <StatusIcon status={comparison.status} />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-semibold">{comparison.label}</h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Real: {comparison.realValue.toFixed(1)} cm</span>
            <span>•</span>
            <span>Ideal: {comparison.idealValue.toFixed(1)} cm</span>
          </div>
        </div>
        <p className="text-sm font-medium mb-1">{comparison.description}</p>
        <p className="text-xs text-muted-foreground">{comparison.suggestion}</p>
      </div>
    </div>
  </div>
);

const MeasurementRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center py-2.5 border-b border-border/30">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-semibold">{value}</span>
  </div>
);

const IdealRow = ({ label, real, ideal }: { label: string; real: string; ideal: string }) => {
  const r = parseFloat(real);
  const i = parseFloat(ideal);
  const diff = Math.abs(r - i) / Math.max(r, i, 0.001);
  const color = diff <= 0.05 ? "text-green-400" : diff <= 0.15 ? "text-yellow-400" : "text-red-400";
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/30">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-4">
        <span className={`text-sm font-bold ${color}`}>{real}</span>
        <span className="text-xs text-muted-foreground w-20 text-right">ideal: {ideal}</span>
      </div>
    </div>
  );
};

const SuggestionCard = ({ title, icon: Icon, items }: { title: string; icon: React.ElementType; items: string[] }) => (
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

// ---- Gerar sugestões de estilo baseadas nos resultados ----
function generateStyleSuggestions(result: VisagismResult) {
  const { faceShape, comparisons } = result;

  const hairSuggestions: string[] = [];
  const glassesSuggestions: string[] = [];
  const beardSuggestions: string[] = [];

  // Sugestões por formato
  const shapeStyles: Record<string, { hair: string[]; glasses: string[]; beard: string[] }> = {
    Oval: {
      hair: ["Cortes médios com camadas suaves", "Franjas laterais para movimento", "Volume no topo para equilibrar"],
      glasses: ["Armações retangulares ou cat-eye", "Evitar arredondadas demais"],
      beard: ["Barba curta e bem aparada", "Contorno natural do maxilar"],
    },
    Redondo: {
      hair: ["Cortes com volume no topo para alongar", "Laterais curtas para afinar", "Evitar franjas retas"],
      glasses: ["Armações angulares ou retangulares", "Evitar arredondadas"],
      beard: ["Barba quadrada para angulação", "Mais volume no queixo"],
    },
    Quadrado: {
      hair: ["Camadas suaves para suavizar ângulos", "Franjas laterais ou desconectadas"],
      glasses: ["Armações ovais ou arredondadas", "Evitar retangulares que reforcem ângulos"],
      beard: ["Barba arredondada no queixo", "Evitar linhas muito retas"],
    },
    Retangular: {
      hair: ["Volume nas laterais para equilibrar", "Franjas para encurtar visualmente", "Evitar volume excessivo no topo"],
      glasses: ["Armações largas e baixas", "Modelos aviador"],
      beard: ["Barba com mais volume lateral", "Evitar alongar ainda mais"],
    },
    Triangular: {
      hair: ["Volume no topo e laterais superiores", "Franjas para equilibrar a testa"],
      glasses: ["Armações mais largas na parte superior", "Cat-eye ou browline"],
      beard: ["Barba mais curta no queixo", "Volume lateral para equilibrar"],
    },
    Coração: {
      hair: ["Volume na parte inferior do rosto", "Evitar volume excessivo no topo"],
      glasses: ["Armações com parte inferior mais larga", "Evitar cat-eye"],
      beard: ["Barba com volume no queixo para equilibrar", "Bigode discreto"],
    },
    Diamante: {
      hair: ["Franjas laterais para suavizar", "Volume no topo e queixo"],
      glasses: ["Armações ovais ou sem aro", "Evitar muito estreitas"],
      beard: ["Barba que adicione largura ao queixo", "Contorno suave"],
    },
  };

  const style = shapeStyles[faceShape] || shapeStyles.Oval;
  hairSuggestions.push(...style.hair);
  glassesSuggestions.push(...style.glasses);
  beardSuggestions.push(...style.beard);

  // Ajuste pelo largura do rosto
  const faceWidthComp = comparisons.find(c => c.key === "face_width");
  if (faceWidthComp?.status === "greater") {
    hairSuggestions.push("Evitar volume nas laterais que alargue mais o rosto");
  } else if (faceWidthComp?.status === "lesser") {
    hairSuggestions.push("Volume lateral para dar mais largura ao rosto");
  }

  return {
    hair: hairSuggestions,
    glasses: glassesSuggestions,
    beard: beardSuggestions,
    aesthetic: comparisons.map(c => c.suggestion),
  };
}

// ---- Main page ----

const ResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const imageUrl = (location.state as any)?.imageUrl as string | undefined;

  const [rawMeasurements, setRawMeasurements] = useState<RawMeasurements>(MOCK_RAW);

  const result = useMemo(() => analyzeVisagism(rawMeasurements), [rawMeasurements]);
  const suggestions = useMemo(() => generateStyleSuggestions(result), [result]);

  const { rawMeasurements: raw, idealValues: ideal, referenceLine, referenceLabel, comparisons, thirdsAnalysis } = result;

  const handleRecalculate = useCallback((newMeasurements: RawMeasurements) => {
    setRawMeasurements(newMeasurements);
    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const refFaceWidth = referenceLine === "a" ? ideal.x : referenceLine === "b" ? ideal.y : ideal.z;
  const refFaceHeight = referenceLine === "a" ? ideal.d : referenceLine === "b" ? ideal.e : ideal.f;
  const refMouthWidth = referenceLine === "a" ? ideal.g : referenceLine === "b" ? ideal.h : ideal.i;

  return (
    <TooltipProvider>
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
              <p className="text-muted-foreground">Cálculos baseados em proporção áurea (1.618) e visagismo clássico</p>
            </div>

            {/* Draggable points editor (if photo available) or static overlay */}
            {imageUrl ? (
              <FacePointsEditor
                imageUrl={imageUrl}
                onRecalculate={handleRecalculate}
              />
            ) : (
              <FaceMeasurementsOverlay measurements={raw} />
            )}

            {/* Main metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <MetricCard icon={Crown} label="Formato do Rosto" value={result.faceShape} tooltip="Classificação baseada nas relações entre largura, altura e terços faciais" />
              <MetricCard icon={Target} label="Proporção Áurea" value={result.goldenRatioScore.toFixed(2)} color="accent" tooltip="Ideal: 1.618 (número de ouro de Da Vinci)" />
              <MetricCard icon={Percent} label="Simetria Facial" value={`${result.symmetryScore}%`} tooltip="Baseada na simetria bilateral e equilíbrio dos terços" />
              <MetricCard icon={Activity} label="Medida Referência" value={referenceLabel} color="accent" tooltip="Medida que mais se aproxima dos valores ideais calculados" />
            </div>

            {/* Reference measurement explanation */}
            <div className="rounded-xl border border-primary/20 bg-card/50 p-5 mb-10 flex items-start gap-3">
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold mb-1">Medida Referência: {referenceLabel}</p>
                <p className="text-xs text-muted-foreground">
                  A medida referência é selecionada automaticamente com base na linha que possui mais valores próximos ou iguais aos ideais calculados.
                  Todas as comparações abaixo usam esta referência ({referenceLine} = {raw[referenceLine].toFixed(1)} cm).
                </p>
              </div>
            </div>

            {/* Raw Measurements + Ideal Values side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {/* Raw measurements */}
              <div className="rounded-xl border border-border bg-card/50 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Ruler className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="font-display text-lg font-semibold">Medidas do seu rosto</h2>
                </div>
                <MeasurementRow label="Distância dos olhos (a)" value={`${raw.a.toFixed(1)} cm`} />
                <MeasurementRow label="Distância entre olhos (b)" value={`${raw.b.toFixed(1)} cm`} />
                <MeasurementRow label="Largura do nariz (c)" value={`${raw.c.toFixed(1)} cm`} />
                <MeasurementRow label="Altura do rosto (j)" value={`${raw.j.toFixed(1)} cm`} />
                <MeasurementRow label="Largura do rosto (k)" value={`${raw.k.toFixed(1)} cm`} />
                <MeasurementRow label="Largura da boca (l)" value={`${raw.l.toFixed(1)} cm`} />
                <MeasurementRow label="Terço superior (m)" value={`${raw.m.toFixed(1)} cm`} />
                <MeasurementRow label="Terço médio (n)" value={`${raw.n.toFixed(1)} cm`} />
                <MeasurementRow label="Terço inferior (o)" value={`${raw.o.toFixed(1)} cm`} />
              </div>

              {/* Ideal calculated values */}
              <div className="rounded-xl border border-border bg-card/50 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Target className="h-5 w-5 text-accent" />
                  </div>
                  <h2 className="font-display text-lg font-semibold">Medidas Ideais</h2>
                </div>
                <IdealRow label="Largura rosto" real={`${raw.k.toFixed(1)}`} ideal={`${ideal.x.toFixed(1)}`} />
                <IdealRow label="Altura rosto" real={`${raw.j.toFixed(1)}`} ideal={`${ideal.d.toFixed(1)}`} />
                <IdealRow label="Boca" real={`${raw.l.toFixed(1)}`} ideal={`${ideal.g.toFixed(1)}`} />
                <IdealRow label="Largura rosto" real={`${raw.k.toFixed(1)}`} ideal={`${ideal.y.toFixed(1)}`} />
                <IdealRow label="Altura rosto" real={`${raw.j.toFixed(1)}`} ideal={`${ideal.e.toFixed(1)}`} />
                <IdealRow label="Boca" real={`${raw.l.toFixed(1)}`} ideal={`${ideal.h.toFixed(1)}`} />
                <IdealRow label="Largura rosto" real={`${raw.k.toFixed(1)}`} ideal={`${ideal.z.toFixed(1)}`} />
                <IdealRow label="Altura rosto" real={`${raw.j.toFixed(1)}`} ideal={`${ideal.f.toFixed(1)}`} />
                <IdealRow label="Boca" real={`${raw.l.toFixed(1)}`} ideal={`${ideal.i.toFixed(1)}`} />
              </div>
            </div>

            {/* Comparisons - the core visagism analysis */}
            <h2 className="font-display text-2xl font-bold mb-6">
              Análise <span className="text-gradient-gold">Comparativa</span>
            </h2>
            <div className="space-y-4 mb-10">
              {comparisons.map((comp) => (
                <ComparisonCard key={comp.key} comparison={comp} />
              ))}
            </div>

            {/* Thirds balance */}
            <div className="rounded-xl border border-border bg-card/50 p-6 mb-10">
              <h2 className="font-display text-xl font-semibold mb-5">Regra dos Terços</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <div className={`text-center p-3 rounded-lg ${thirdsAnalysis.largest === "m" ? "bg-yellow-400/10 border border-yellow-400/20" : "bg-secondary/30"}`}>
                  <p className="text-xs text-muted-foreground mb-1">Linha do cabelo → Sobrancelhas</p>
                  <p className="text-lg font-bold font-display">{thirdsAnalysis.percentages.upper}%</p>
                  <p className="text-[10px] text-muted-foreground">{raw.m.toFixed(1)} cm</p>
                </div>
                <div className={`text-center p-3 rounded-lg ${thirdsAnalysis.largest === "n" ? "bg-yellow-400/10 border border-yellow-400/20" : "bg-secondary/30"}`}>
                  <p className="text-xs text-muted-foreground mb-1">Sobrancelhas → Base do nariz</p>
                  <p className="text-lg font-bold font-display">{thirdsAnalysis.percentages.middle}%</p>
                  <p className="text-[10px] text-muted-foreground">{raw.n.toFixed(1)} cm</p>
                </div>
                <div className={`text-center p-3 rounded-lg ${thirdsAnalysis.largest === "o" ? "bg-yellow-400/10 border border-yellow-400/20" : "bg-secondary/30"}`}>
                  <p className="text-xs text-muted-foreground mb-1">Base do nariz → Queixo</p>
                  <p className="text-lg font-bold font-display">{thirdsAnalysis.percentages.lower}%</p>
                  <p className="text-[10px] text-muted-foreground">{raw.o.toFixed(1)} cm</p>
                </div>
              </div>
              <div className="space-y-4">
                <ThirdsBar label="Superior" value={thirdsAnalysis.percentages.upper} ideal={33.3} />
                <ThirdsBar label="Médio" value={thirdsAnalysis.percentages.middle} ideal={33.3} />
                <ThirdsBar label="Inferior" value={thirdsAnalysis.percentages.lower} ideal={33.3} />
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Ideal: ~33.3% cada. O terço destacado é o {thirdsAnalysis.largest === "m" ? "superior" : thirdsAnalysis.largest === "n" ? "médio" : "inferior"} (maior).
              </p>
            </div>

            {/* Style Suggestions */}
            <h2 className="font-display text-2xl font-bold mb-6">
              Sugestões <span className="text-gradient-gold">Personalizadas</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              <SuggestionCard title="Cortes de Cabelo" icon={Scissors} items={suggestions.hair} />
              <SuggestionCard title="Armações de Óculos" icon={Glasses} items={suggestions.glasses} />
              <SuggestionCard title="Barba" icon={Crown} items={suggestions.beard} />
              <SuggestionCard title="Maquiagem & Estética" icon={Palette} items={suggestions.aesthetic} />
            </div>

            {/* CTA */}
            <div className="rounded-2xl border border-primary/30 bg-card p-8 text-center glow-gold">
              <h2 className="font-display text-2xl font-bold mb-2">Quer o relatório completo em PDF?</h2>
              <p className="text-muted-foreground mb-6">
                Assine o plano Premium e tenha acesso ao relatório detalhado com todas as métricas e marcações faciais.
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
    </TooltipProvider>
  );
};

export default ResultsPage;

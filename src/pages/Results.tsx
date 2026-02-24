import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Scissors, Glasses, Palette, Crown, Target, Percent, Ruler, Eye, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
    interocular_distance: "3.2 cm",
    nose_width: "3.5 cm",
    nose_to_mouth: "1.8 cm",
    mouth_width: "5.1 cm",
    chin_height: "3.4 cm",
    eyebrow_height_left: "2.1 cm",
    eyebrow_height_right: "2.0 cm",
    eye_width_left: "2.9 cm",
    eye_width_right: "3.0 cm",
  },
  proportions: {
    face_ratio: { value: 1.36, label: "Largura / Altura do rosto", ideal: "~1.618" },
    eye_nose_ratio: { value: 0.91, label: "Dist. olhos / Largura nariz", ideal: "~1.0" },
    nose_mouth_ratio: { value: 0.51, label: "Dist. nariz-boca / Larg. boca", ideal: "~0.50" },
    forehead_jaw_ratio: { value: 1.15, label: "Testa / Maxilar", ideal: "~1.0" },
    facial_index: { value: 1.36, label: "Índice Facial (Alt/Larg)", ideal: "1.30–1.40" },
  },
  symmetry: {
    overall: 87,
    eyes: { left: 2.9, right: 3.0, diff_percent: 3.4 },
    eyebrows: { left: 2.1, right: 2.0, diff_percent: 4.8 },
    nose_inclination: 1.2,
    midline_deviation: 0.8,
  },
  analysis_text:
    "Seu rosto oval é considerado o formato mais equilibrado pela teoria visagista de Philip Hallawell. Apresenta boa simetria bilateral (87%) e proporções próximas à proporção áurea de 1.618 (seu índice: 1.59). Os terços faciais estão bem distribuídos, com leve predominância do terço inferior (36%), o que transmite uma imagem de determinação e confiabilidade. A distância interocular está dentro do padrão ideal, e a relação nariz-boca apresenta equilíbrio notável (0.51, ideal 0.50).",
  personality:
    "O formato oval transmite equilíbrio, harmonia e versatilidade. Segundo a psicologia da imagem de Hallawell, é associado a características de adaptabilidade, diplomacia e elegância natural. A boa simetria reforça a percepção de confiança e atratividade.",
  strengths: [
    "Excelente simetria bilateral (87%)",
    "Proporção áurea próxima ao ideal (1.59 / 1.618)",
    "Terços faciais bem distribuídos",
    "Relação nariz-boca equilibrada (0.51)",
    "Índice facial dentro da faixa ideal (1.36)",
    "Formato versátil para diversos estilos",
  ],
  weaknesses: [
    "Terço inferior levemente dominante (+2.7%)",
    "Leve assimetria nas sobrancelhas (4.8%)",
    "Proporção áurea com desvio de 1.7%",
  ],
  suggestions: {
    hair: [
      "Cortes médios com camadas suaves para valorizar o oval",
      "Franjas laterais para adicionar movimento e suavizar a testa",
      "Volume no topo para equilibrar o terço inferior",
      "Evitar volume excessivo nas laterais que alargue o rosto",
    ],
    glasses: [
      "Armações retangulares ou cat-eye para manter a harmonia",
      "Evitar armações muito arredondadas que conflitem com o oval",
      "Largura da armação proporcional à largura zigomática (13.4 cm)",
      "Ponte do óculos alinhada com a largura do nariz (3.5 cm)",
    ],
    beard: [
      "Barba curta e bem aparada para não encobrir o formato oval",
      "Contorno natural do maxilar sem angulação excessiva",
      "Bigode discreto para equilibrar o terço médio (31%)",
      "Linha da barba seguindo o ângulo natural do maxilar",
    ],
    aesthetic: [
      "Contorno sutil nas têmporas para definir o terço superior",
      "Iluminador no arco do cupido e têmporas para realçar simetria",
      "Blush aplicado nas maçãs do rosto em diagonal ascendente",
      "Contorno leve no queixo para equilibrar o terço inferior",
    ],
  },
};

// --- Sub-components ---

const MetricCard = ({
  label,
  value,
  icon: Icon,
  color = "primary",
  tooltip,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
  tooltip?: string;
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

const ProportionRow = ({ label, value, ideal }: { label: string; value: number; ideal: string }) => {
  const idealNum = parseFloat(ideal.replace("~", "").split("–")[0]);
  const diff = Math.abs(value - idealNum);
  const quality = diff < 0.05 ? "text-green-400" : diff < 0.15 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
      <span className="text-sm text-foreground/80">{label}</span>
      <div className="flex items-center gap-4">
        <span className={`text-sm font-bold ${quality}`}>{value.toFixed(2)}</span>
        <span className="text-xs text-muted-foreground w-24 text-right">ideal: {ideal}</span>
      </div>
    </div>
  );
};

const SymmetryRow = ({ label, left, right, diff }: { label: string; left: number; right: number; diff: number }) => {
  const quality = diff < 3 ? "text-green-400" : diff < 6 ? "text-yellow-400" : "text-red-400";
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
      <span className="text-sm text-foreground/80">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">E: {left} cm</span>
        <span className="text-xs text-muted-foreground">D: {right} cm</span>
        <span className={`text-sm font-bold ${quality}`}>{diff.toFixed(1)}%</span>
      </div>
    </div>
  );
};

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

// --- Main page ---

const ResultsPage = () => {
  const navigate = useNavigate();

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
              <p className="text-muted-foreground">Resultados baseados em proporção áurea e visagismo clássico de Philip Hallawell</p>
            </div>

            {/* Main metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <MetricCard icon={Crown} label="Formato do Rosto" value={mockData.face_shape} tooltip="Classificação baseada em relações entre largura, altura, testa e maxilar" />
              <MetricCard icon={Target} label="Proporção Áurea" value={mockData.golden_ratio_score.toFixed(2)} color="accent" tooltip="Ideal: 1.618 (número de ouro de Da Vinci)" />
              <MetricCard icon={Percent} label="Simetria Facial" value={`${mockData.symmetry_score}%`} tooltip="Média ponderada da simetria bilateral dos pontos faciais" />
              <MetricCard icon={Activity} label="Índice Facial" value={mockData.proportions.facial_index.value.toFixed(2)} color="accent" tooltip="Relação altura/largura do rosto. Ideal: 1.30–1.40" />
            </div>

            {/* Detailed Measurements Table */}
            <div className="rounded-xl border border-border bg-card/50 p-6 mb-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Ruler className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-display text-xl font-semibold">Medidas Faciais Detalhadas</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                {Object.entries({
                  "Altura total do rosto": mockData.measurements.face_height,
                  "Largura zigomática": mockData.measurements.zygomatic_width,
                  "Largura do maxilar": mockData.measurements.jaw_width,
                  "Largura da testa": mockData.measurements.forehead_width,
                  "Distância interocular": mockData.measurements.interocular_distance,
                  "Largura do nariz": mockData.measurements.nose_width,
                  "Distância nariz-boca": mockData.measurements.nose_to_mouth,
                  "Largura da boca": mockData.measurements.mouth_width,
                  "Altura do queixo": mockData.measurements.chin_height,
                  "Sobrancelha esquerda": mockData.measurements.eyebrow_height_left,
                  "Sobrancelha direita": mockData.measurements.eyebrow_height_right,
                  "Olho esquerdo": mockData.measurements.eye_width_left,
                  "Olho direito": mockData.measurements.eye_width_right,
                }).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center py-2.5 border-b border-border/30">
                    <span className="text-sm text-muted-foreground">{key}</span>
                    <span className="text-sm font-semibold">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Proportions Analysis */}
            <div className="rounded-xl border border-border bg-card/50 p-6 mb-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-accent" />
                </div>
                <h2 className="font-display text-xl font-semibold">Proporções Matemáticas</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                <span className="inline-block h-2 w-2 rounded-full bg-green-400 mr-1" /> Excelente
                <span className="inline-block h-2 w-2 rounded-full bg-yellow-400 ml-3 mr-1" /> Bom
                <span className="inline-block h-2 w-2 rounded-full bg-red-400 ml-3 mr-1" /> A melhorar
              </p>
              {Object.values(mockData.proportions).map((p, i) => (
                <ProportionRow key={i} label={p.label} value={p.value} ideal={p.ideal} />
              ))}
            </div>

            {/* Symmetry Detail */}
            <div className="rounded-xl border border-border bg-card/50 p-6 mb-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-display text-xl font-semibold">Análise de Simetria</h2>
              </div>
              <div className="flex items-center gap-4 mb-5">
                <div className="text-3xl font-bold font-display text-primary">{mockData.symmetry.overall}%</div>
                <div className="text-sm text-muted-foreground">Simetria geral</div>
              </div>
              <SymmetryRow label="Olhos" left={mockData.symmetry.eyes.left} right={mockData.symmetry.eyes.right} diff={mockData.symmetry.eyes.diff_percent} />
              <SymmetryRow label="Sobrancelhas" left={mockData.symmetry.eyebrows.left} right={mockData.symmetry.eyebrows.right} diff={mockData.symmetry.eyebrows.diff_percent} />
              <div className="flex items-center justify-between py-3 border-b border-border/50">
                <span className="text-sm text-foreground/80">Inclinação do nariz</span>
                <span className="text-sm font-bold text-green-400">{mockData.symmetry.nose_inclination}°</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-foreground/80">Desvio da linha média</span>
                <span className="text-sm font-bold text-green-400">{mockData.symmetry.midline_deviation} mm</span>
              </div>
            </div>

            {/* Thirds balance */}
            <div className="rounded-xl border border-border bg-card/50 p-6 mb-10">
              <h2 className="font-display text-xl font-semibold mb-5">Regra dos Terços</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <div className="text-center p-3 rounded-lg bg-secondary/30">
                  <p className="text-xs text-muted-foreground mb-1">Linha do cabelo → Sobrancelhas</p>
                  <p className="text-lg font-bold font-display">{mockData.thirds_balance.upper}%</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary/30">
                  <p className="text-xs text-muted-foreground mb-1">Sobrancelhas → Base do nariz</p>
                  <p className="text-lg font-bold font-display">{mockData.thirds_balance.middle}%</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary/30">
                  <p className="text-xs text-muted-foreground mb-1">Base do nariz → Queixo</p>
                  <p className="text-lg font-bold font-display">{mockData.thirds_balance.lower}%</p>
                </div>
              </div>
              <div className="space-y-4">
                <ThirdsBar label="Superior" value={mockData.thirds_balance.upper} ideal={33.3} />
                <ThirdsBar label="Médio" value={mockData.thirds_balance.middle} ideal={33.3} />
                <ThirdsBar label="Inferior" value={mockData.thirds_balance.lower} ideal={33.3} />
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Ideal: distribuição equilibrada de ~33.3% em cada terço. Linha vertical indica o ideal.
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

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              <div className="rounded-xl border border-border bg-card/50 p-6">
                <h2 className="font-display text-lg font-semibold mb-4 text-green-400">✦ Pontos Fortes</h2>
                <div className="space-y-3">
                  {mockData.strengths.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className="h-5 w-5 rounded-full bg-green-400/10 flex items-center justify-center shrink-0">
                        <span className="text-[10px] text-green-400 font-bold">{i + 1}</span>
                      </div>
                      <span className="text-foreground/80">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card/50 p-6">
                <h2 className="font-display text-lg font-semibold mb-4 text-yellow-400">◆ Pontos a Equilibrar</h2>
                <div className="space-y-3">
                  {mockData.weaknesses.map((w, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className="h-5 w-5 rounded-full bg-yellow-400/10 flex items-center justify-center shrink-0">
                        <span className="text-[10px] text-yellow-400 font-bold">{i + 1}</span>
                      </div>
                      <span className="text-foreground/80">{w}</span>
                    </div>
                  ))}
                </div>
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
              <SuggestionCard title="Estética & Maquiagem" icon={Palette} items={mockData.suggestions.aesthetic} />
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

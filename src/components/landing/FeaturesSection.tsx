import { Ratio, ScanFace, FileText, Scissors, Glasses, Palette } from "lucide-react";

const features = [
  {
    icon: ScanFace,
    title: "Detecção Facial IA",
    description: "468 pontos faciais mapeados automaticamente com precisão por inteligência artificial.",
  },
  {
    icon: Ratio,
    title: "Proporção Áurea",
    description: "Cálculo da proporção de 1.618 e regra dos terços aplicada ao seu rosto.",
  },
  {
    icon: FileText,
    title: "Relatório Completo",
    description: "Análise detalhada com métricas, gráficos e recomendações personalizadas em PDF.",
  },
  {
    icon: Palette,
    title: "Visagismo e Maquiagem",
    description: "Maquiagem e dicas estéticas baseadas no formato e proporção do seu rosto.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Ciência por trás da <span className="text-gradient-gold">beleza</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Combinamos visão computacional, matemática e princípios clássicos de visagismo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group rounded-xl border border-border bg-card/50 p-8 transition-all duration-300 hover:border-primary/30 hover:glow-card"
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

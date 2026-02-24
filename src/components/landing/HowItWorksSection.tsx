import { Upload, Cpu, BarChart3, Download } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Envie sua foto",
    description: "Faça upload de uma foto frontal com boa iluminação.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "Processamento IA",
    description: "Nossa IA detecta 468 pontos faciais e calcula proporções.",
  },
  {
    icon: BarChart3,
    step: "03",
    title: "Análise completa",
    description: "Receba métricas de simetria, proporção áurea e formato.",
  },
  {
    icon: Download,
    step: "04",
    title: "Baixe o relatório",
    description: "Download do PDF com análise visagista personalizada.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Como <span className="text-gradient-gold">funciona</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div key={i} className="relative text-center">
              <div className="mb-6 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5">
                <s.icon className="h-7 w-7 text-primary" />
              </div>
              <span className="text-xs font-semibold tracking-widest text-primary/60 uppercase mb-2 block">
                Passo {s.step}
              </span>
              <h3 className="font-display text-lg font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.description}</p>

              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[calc(50%+3rem)] w-[calc(100%-6rem)] h-px bg-gradient-to-r from-primary/30 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

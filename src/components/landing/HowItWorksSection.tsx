import { Upload, Cpu, BarChart3, Download, Eye, Ruler, User, ArrowUpCircle, ArrowDownCircle, MoveHorizontal } from "lucide-react";
import guideImage from "@/assets/guia-visagismo.png";

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

const faceDetails = [
  {
    icon: ArrowUpCircle,
    title: "Terço Superior",
    desc: "Da raiz do cabelo ao meio da sobrancelha. Representa o intelecto e a criatividade.",
    color: "text-amber-500"
  },
  {
    icon: Ruler,
    title: "Terço Médio",
    desc: "Do meio da sobrancelha à base do nariz. Reflete o emocional e a afeição.",
    color: "text-blue-500"
  },
  {
    icon: ArrowDownCircle,
    title: "Terço Inferior",
    desc: "Da base do nariz ao queixo. Ligado à ação, vontade e instinto.",
    color: "text-pink-500"
  },
  {
    icon: Eye,
    title: "Área dos Olhos",
    desc: "Medimos a distância interocular para equilíbrio do olhar.",
    color: "text-amber-500"
  },
  {
    icon: MoveHorizontal,
    title: "Largura Facial",
    desc: "Pontos no osso zigomático definem a estrutura óssea do rosto.",
    color: "text-cyan-500"
  },
  {
    icon: User,
    title: "Boca e Nariz",
    desc: "Proporções fundamentais para harmonização labial e rinoplastia visual.",
    color: "text-rose-500"
  }
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Como <span className="text-gradient-gold">funciona</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-24">
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

        {/* Guia de Pontos Visagistas */}
        <div className="max-w-6xl mx-auto rounded-3xl bg-card border border-border p-8 md:p-12 overflow-hidden shadow-2xl">
          <div className="text-center mb-12">
            <h3 className="font-display text-2xl md:text-3xl font-bold mb-4">Como posicionar os pontos</h3>
            <p className="text-muted-foreground">Guia prático para garantir a precisão da sua análise facial</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Coluna Esquerda: Detalhes */}
            <div className="lg:col-span-3 space-y-8">
              {faceDetails.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className={`mt-1 h-10 w-10 shrink-0 rounded-lg bg-secondary flex items-center justify-center ${item.color}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Coluna Central: Imagem */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative p-2 rounded-2xl bg-gradient-to-b from-primary/10 to-transparent border border-primary/5">
                <img
                  src={guideImage}
                  alt="Guia de posicionamento de pontos"
                  className="rounded-xl w-full max-w-[400px] shadow-lg grayscale focus:grayscale-0 transition-all hover:grayscale-0 duration-500"
                />
              </div>
            </div>

            {/* Coluna Direita: Detalhes */}
            <div className="lg:col-span-3 space-y-8">
              {faceDetails.slice(3, 6).map((item, idx) => (
                <div key={idx} className="flex gap-4 lg:flex-row-reverse lg:text-right">
                  <div className={`mt-1 h-10 w-10 shrink-0 rounded-lg bg-secondary flex items-center justify-center ${item.color}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

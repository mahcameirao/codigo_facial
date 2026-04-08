import { Crown } from "lucide-react";
import fotoMarcela from "@/assets/foto-marcela.jpg";

const AboutSection = () => {
  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 -skew-y-3 transform origin-top-left -z-10" />
      
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20 max-w-6xl mx-auto">
          
          {/* Coluna da Imagem */}
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md aspect-[4/5] rounded-3xl overflow-hidden border border-primary/20 glow-gold group">
              <img 
                src={fotoMarcela} 
                alt="Marcela Cameirão aplicando batom vermelhor em frente a um espelho" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
                <h3 className="font-display font-bold text-3xl mb-1">Marcela Cameirão</h3>
                <p className="text-primary font-bold tracking-widest text-sm uppercase">Especialista em Visagismo</p>
              </div>
            </div>
          </div>

          {/* Coluna do Texto */}
          <div className="w-full md:w-1/2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-2">
              <Crown className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Quem Sou</span>
            </div>
            
            <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight">
              A Arte da Beleza <br/>
              Elevada pela <span className="text-gradient-gold">Ciência da Proporção</span>
            </h2>

            <div className="space-y-5 text-muted-foreground leading-relaxed mt-8">
              <p>
                A maquiagem começou como uma jornada pessoal de autocuidado e autoestima na adolescência, mas logo se transformou em vocação. Formada pela prestigiada <span className="text-foreground font-medium">Catharine Hill</span>, transformei a paixão inicial em uma profissão sólida, atendendo o exigente mercado de alta performance, eventos e noivas.
              </p>
              
              <p>
                Com mais de <span className="text-foreground font-medium">6 anos de experiência</span> no mercado de beleza premium, minha assinatura se moldou em torno do <strong className="text-foreground">Visagismo</strong> e da <strong className="text-foreground">Pele Blindada</strong> — uma técnica exclusiva resistente a água, lágrimas e atrito. Cada rosto conta uma história, e o meu trabalho sempre foi traduzir essa identidade em uma beleza autêntica, segura e inabalável.
              </p>
              
              <p>
                Percebendo que o poder transformador de uma análise especialista poderia ir além da minha cadeira de maquiagem, idealizei o <strong className="text-primary">Código Facial</strong>. Mais do que inteligência artificial, esta ferramenta é a tradução digital de anos de prática de bancada e métricas de <strong className="text-foreground">Proporção Áurea</strong>, criada para democratizar o autoconhecimento estético e garantir que você realce sua beleza de forma unicamente natural.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;

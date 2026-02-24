import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Gratuito",
    price: "R$ 0",
    description: "Experimente a análise básica",
    features: [
      "1 análise facial",
      "Formato do rosto",
      "Proporção áurea",
      "Simetria básica",
    ],
    cta: "Começar grátis",
    highlight: false,
  },
  {
    name: "Premium",
    price: "R$ 29",
    period: "/mês",
    description: "Análise completa com sugestões",
    features: [
      "Análises ilimitadas",
      "Relatório PDF detalhado",
      "Sugestões de cabelo e óculos",
      "Sugestões de barba e estética",
      "Histórico de análises",
      "Comparativo antes/depois",
    ],
    cta: "Assinar Premium",
    highlight: true,
  },
];

const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Escolha seu <span className="text-gradient-gold">plano</span>
          </h2>
          <p className="text-muted-foreground text-lg">Comece gratuitamente, evolua quando quiser.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl border p-8 transition-all duration-300 ${
                plan.highlight
                  ? "border-primary/50 bg-card glow-gold"
                  : "border-border bg-card/50"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">
                  Mais popular
                </div>
              )}

              <h3 className="font-display text-2xl font-bold mb-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
              <div className="mb-8">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-foreground/80">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.highlight ? "hero" : "heroOutline"}
                className="w-full py-5"
                onClick={() => navigate("/upload")}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

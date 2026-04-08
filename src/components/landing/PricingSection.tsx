import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    key: "scanner",
    name: "Scanner",
    price: "Grátis",
    period: "",
    description: "Conheça o básico do seu rosto",
    features: ["1 análise por cadastro", "Formato do Rosto", "Score de Simetria Facial"],
    cta: "Começar Grátis",
    highlight: false,
    badge: null,
  },
  {
    key: "smart",
    name: "Smart",
    price: "R$ 9,90",
    period: "/mês",
    description: "Proporções e medidas desbloqueadas",
    features: ["5 uploads por mês", "Formato do Rosto", "Proporção Áurea", "Medidas Ideais", "Análise Comparativa", "Regra dos Terços"],
    cta: "Assinar Smart",
    highlight: false,
    badge: null,
  },
  {
    key: "expert",
    name: "Expert",
    price: "R$ 27,90",
    period: "/mês",
    description: "Análise completa com sugestões",
    features: ["20 uploads por mês", "Tudo do Smart", "Sugestões de Maquiagem", "Sugestões de Estilo"],
    cta: "Assinar Expert",
    highlight: true,
    badge: "Mais Popular",
  },
  {
    key: "pro",
    name: "Pro",
    price: "R$ 67,90",
    period: "/mês",
    description: "Sem limites, total liberdade",
    features: ["Uploads ilimitados", "Tudo do Expert"],
    cta: "Assinar Pro",
    highlight: false,
    badge: "Sem Limites",
  },
];

// Tabela de diferenciais: [feature, scanner, smart, expert, pro]
const comparisonRows = [
  { label: "Uploads por mês",         scanner: "1 por cadastro", smart: "5/mês",     expert: "20/mês",    pro: "Ilimitado" },
  { label: "Formato do Rosto",        scanner: true,              smart: true,        expert: true,        pro: true },
  { label: "Score de Simetria",       scanner: true,              smart: true,        expert: true,        pro: true },
  { label: "Proporção Áurea",         scanner: false,             smart: true,        expert: true,        pro: true },
  { label: "Medidas Ideais",          scanner: false,             smart: true,        expert: true,        pro: true },
  { label: "Análise Comparativa",     scanner: false,             smart: true,        expert: true,        pro: true },
  { label: "Regra dos Terços",        scanner: false,             smart: true,        expert: true,        pro: true },
  { label: "Sugestões de Maquiagem",  scanner: false,             smart: false,       expert: true,        pro: true },
  { label: "Sugestões de Estilo",     scanner: false,             smart: false,       expert: true,        pro: true },
];

const CellValue = ({ value }: { value: boolean | string }) => {
  if (typeof value === "string") {
    return <span className="text-xs font-semibold text-foreground/80">{value}</span>;
  }
  return value ? (
    <CheckCircle2 className="h-5 w-5 text-green-400 mx-auto" />
  ) : (
    <XCircle className="h-5 w-5 text-red-400/60 mx-auto" />
  );
};

const PricingSection = () => {
  const navigate = useNavigate();
  const { session, profile } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planKey: string) => {
    if (planKey === "scanner") {
      if (!session) {
        navigate("/register");
      } else {
        navigate("/upload");
      }
      return;
    }

    if (!session) {
      navigate("/register");
      return;
    }

    if (profile?.plan === planKey) {
      toast.success(`Você já possui o plano ${planKey.charAt(0).toUpperCase() + planKey.slice(1)}!`);
      return;
    }

    try {
      setLoading(planKey);
      const response = await api.post("/payment/create-checkout-session", { plan: planKey });
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error: any) {
      console.error("Erro ao iniciar pagamento:", error);
      toast.error(error.response?.data?.error || "Erro ao processar pagamento. Tente novamente.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Escolha seu <span className="text-gradient-gold">plano</span>
          </h2>
          <p className="text-muted-foreground text-lg">Comece gratuitamente, evolua quando quiser.</p>
        </div>

        {/* Cards dos planos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-20">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`relative rounded-2xl border p-7 flex flex-col transition-all duration-300 ${
                plan.highlight
                  ? "border-primary/60 bg-card glow-gold scale-[1.02]"
                  : "border-border bg-card/50 hover:border-primary/30"
              }`}
            >
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-bold text-primary-foreground ${plan.highlight ? "bg-primary" : "bg-muted-foreground"}`}>
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-display text-2xl font-bold mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground text-sm">{plan.period}</span>}
                </div>
              </div>

              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2.5 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                    <span className="text-foreground/80">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.highlight ? "hero" : "heroOutline"}
                className="w-full py-5"
                disabled={loading !== null || (session && (profile?.plan || 'scanner') === plan.key)}
                onClick={() => handleSubscribe(plan.key)}
                id={`btn-plan-${plan.key}`}
              >
                {loading === plan.key ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : session && (profile?.plan || 'scanner') === plan.key ? (
                  "Seu Plano Atual"
                ) : (
                  plan.cta
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* Tabela comparativa */}
        <div className="max-w-5xl mx-auto">
          <h3 className="font-display text-2xl font-bold text-center mb-8">
            Compare os <span className="text-gradient-gold">diferenciais</span>
          </h3>
          <div className="rounded-2xl border border-border bg-card/50 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-4 text-muted-foreground font-medium w-1/3">Recurso</th>
                  {plans.map((p) => (
                    <th key={p.key} className={`text-center px-4 py-4 font-display font-bold ${p.highlight ? "text-primary" : "text-foreground"}`}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-b border-border/50 transition-colors hover:bg-card ${i % 2 === 0 ? "" : "bg-card/30"}`}
                  >
                    <td className="px-6 py-3.5 text-muted-foreground">{row.label}</td>
                    <td className="px-4 py-3.5 text-center"><CellValue value={row.scanner} /></td>
                    <td className="px-4 py-3.5 text-center"><CellValue value={row.smart} /></td>
                    <td className={`px-4 py-3.5 text-center ${true ? "bg-primary/5" : ""}`}><CellValue value={row.expert} /></td>
                    <td className="px-4 py-3.5 text-center"><CellValue value={row.pro} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

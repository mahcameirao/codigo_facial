// ============================================================
// Motor de Cálculos Visagistas
// Baseado em proporção áurea (1.618) e visagismo clássico
// ============================================================

export interface RawMeasurements {
  a: number; // Distância dos olhos (largura do olho)
  b: number; // Distância entre os olhos (interocular)
  c: number; // Largura do nariz
  j: number; // Altura do rosto real
  k: number; // Largura do rosto real
  l: number; // Largura da boca real
  m: number; // Terço superior (linha do cabelo → sobrancelhas)
  n: number; // Terço médio (sobrancelhas → base do nariz)
  o: number; // Terço inferior (base do nariz → queixo)
}

export interface IdealValues {
  // Linha "a" (distância dos olhos)
  x: number; // a*4 = largura do rosto ideal
  d: number; // x*1.618 = altura do rosto ideal
  g: number; // a*1.5 = largura da boca ideal
  // Linha "b" (distância entre olhos)
  y: number; // b*4
  e: number; // y*1.618
  h: number; // b*1.5
  // Linha "c" (largura do nariz)
  z: number; // c*4
  f: number; // z*1.618
  i: number; // c*1.5
}

export type ReferenceLine = "a" | "b" | "c";

export interface ComparisonResult {
  key: string;
  label: string;
  realValue: number;
  idealValue: number;
  status: "equal" | "greater" | "lesser";
  description: string;
  suggestion: string;
}

export interface ThirdsAnalysis {
  largest: "m" | "n" | "o";
  smallest: "m" | "n" | "o";
  percentages: { upper: number; middle: number; lower: number };
}

export interface VisagismResult {
  rawMeasurements: RawMeasurements;
  idealValues: IdealValues;
  referenceLine: ReferenceLine;
  referenceLabel: string;
  comparisons: ComparisonResult[];
  thirdsAnalysis: ThirdsAnalysis;
  faceShape: string;
  symmetryScore: number;
  goldenRatioScore: number;
}

// Tolerância para considerar valores "iguais" (5%)
const TOLERANCE = 0.05;

function isApproxEqual(a: number, b: number): boolean {
  return Math.abs(a - b) / Math.max(a, b, 0.001) <= TOLERANCE;
}

function compare(real: number, ideal: number): "equal" | "greater" | "lesser" {
  if (isApproxEqual(real, ideal)) return "equal";
  return real > ideal ? "greater" : "lesser";
}

// ---- Etapa 1: Calcular valores ideais ----
export function calculateIdealValues(raw: RawMeasurements): IdealValues {
  const x = raw.a * 4;
  const y = raw.b * 4;
  const z = raw.c * 4;
  return {
    x, d: x * 1.618, g: raw.a * 1.5,
    y, e: y * 1.618, h: raw.b * 1.5,
    z, f: z * 1.618, i: raw.c * 1.5,
  };
}

// ---- Etapa 1: Selecionar medida referência ----
// A linha que possui mais números próximos ou iguais aos reais
export function selectReferenceLine(raw: RawMeasurements, ideal: IdealValues): ReferenceLine {
  // Para cada linha, contar quantos valores ideais são próximos dos reais
  // Linha a: x vs k (largura rosto), d vs j (altura rosto), g vs l (boca)
  const scoreA = [
    isApproxEqual(ideal.x, raw.k) ? 1 : 0,
    isApproxEqual(ideal.d, raw.j) ? 1 : 0,
    isApproxEqual(ideal.g, raw.l) ? 1 : 0,
  ].reduce((s, v) => s + v, 0);

  // Linha b: y vs k, e vs j, h vs l
  const scoreB = [
    isApproxEqual(ideal.y, raw.k) ? 1 : 0,
    isApproxEqual(ideal.e, raw.j) ? 1 : 0,
    isApproxEqual(ideal.h, raw.l) ? 1 : 0,
  ].reduce((s, v) => s + v, 0);

  // Linha c: z vs k, f vs j, i vs l
  const scoreC = [
    isApproxEqual(ideal.z, raw.k) ? 1 : 0,
    isApproxEqual(ideal.f, raw.j) ? 1 : 0,
    isApproxEqual(ideal.i, raw.l) ? 1 : 0,
  ].reduce((s, v) => s + v, 0);

  // Se empate, usar a proximidade média como desempate
  if (scoreA >= scoreB && scoreA >= scoreC) return "a";
  if (scoreB >= scoreC) return "b";
  return "c";
}

const REFERENCE_LABELS: Record<ReferenceLine, string> = {
  a: "Distância dos olhos",
  b: "Distância entre olhos",
  c: "Largura do nariz",
};

// ---- Etapa 2: Comparações ----
export function generateComparisons(
  raw: RawMeasurements,
  ideal: IdealValues,
  ref: ReferenceLine
): ComparisonResult[] {
  const refValue = raw[ref];
  const refFaceWidth = ref === "a" ? ideal.x : ref === "b" ? ideal.y : ideal.z;
  const refFaceHeight = ref === "a" ? ideal.d : ref === "b" ? ideal.e : ideal.f;
  const refMouthWidth = ref === "a" ? ideal.g : ref === "b" ? ideal.h : ideal.i;

  const results: ComparisonResult[] = [];

  // 1. Comparar olhos: b vs referência
  const eyeStatus = compare(raw.b, refValue);
  results.push({
    key: "eyes",
    label: "Distância entre os olhos",
    realValue: raw.b,
    idealValue: refValue,
    status: eyeStatus,
    description: eyeStatus === "equal"
      ? "Olhos na distância padrão"
      : eyeStatus === "greater"
        ? "Olhos afastados"
        : "Olhos aproximados",
    suggestion: eyeStatus === "equal"
      ? "Pode usar todas as técnicas de esfumado, brilho no canto interno, etc."
      : eyeStatus === "greater"
        ? "Pode apostar em foxy eye com puxado no canto interno."
        : "Iluminar o canto interno e fazer delineado gatinho ou esfumado são as melhores opções.",
  });

  // 2. Comparar nariz: c vs referência
  const noseStatus = compare(raw.c, refValue);
  results.push({
    key: "nose",
    label: "Largura do nariz",
    realValue: raw.c,
    idealValue: refValue,
    status: noseStatus,
    description: noseStatus === "equal"
      ? "Nariz na largura padrão"
      : noseStatus === "greater"
        ? "Nariz mais largo"
        : "Nariz mais estreito",
    suggestion: noseStatus === "equal"
      ? "Não necessita de contorno."
      : noseStatus === "greater"
        ? "Realizar contorno para afinar."
        : "Iluminar o centro para dar a ilusão de maior ou aplicar blush para dar mais volume.",
  });

  // 3. Comparar largura do rosto: k vs ideal
  const faceWidthStatus = compare(raw.k, refFaceWidth);
  results.push({
    key: "face_width",
    label: "Largura do rosto",
    realValue: raw.k,
    idealValue: refFaceWidth,
    status: faceWidthStatus,
    description: faceWidthStatus === "equal"
      ? "Rosto na largura ideal"
      : faceWidthStatus === "greater"
        ? "Rosto mais largo que a medida referência"
        : "Rosto mais estreito que a medida referência",
    suggestion: faceWidthStatus === "equal"
      ? "Largura facial equilibrada, sem necessidade de contorno lateral."
      : faceWidthStatus === "greater"
        ? "Contornar para afinar."
        : "Não contornar para não criar o efeito de rosto ainda mais fino.",
  });

  // 4. Comparar altura do rosto: j vs ideal
  const faceHeightStatus = compare(raw.j, refFaceHeight);
  const thirds = analyzeThirds(raw);
  let heightSuggestion = "";
  let heightDescription = "";

  if (faceHeightStatus === "equal") {
    heightDescription = "Rosto na altura ideal";
    heightSuggestion = "Proporção vertical equilibrada, sem necessidade de correção.";
  } else if (faceHeightStatus === "greater") {
    heightDescription = "Rosto mais alto que o ideal";
    if (thirds.largest === "m") {
      heightSuggestion = "Contornar a parte superior da testa dando a ilusão de testa menor.";
    } else if (thirds.largest === "n") {
      heightSuggestion = "Contornar na horizontal para dar a sensação de 'cortar' o terço e diminuir.";
    } else {
      heightSuggestion = "Contornar o queixo e a mandíbula para dar a sensação de terço menor.";
    }
    heightDescription += ` — terço ${thirds.largest === "m" ? "superior" : thirds.largest === "n" ? "médio" : "inferior"} é o maior`;
  } else {
    heightDescription = "Rosto mais curto que o ideal";
    if (thirds.smallest === "m") {
      heightSuggestion = "Iluminar a parte central da testa.";
    } else if (thirds.smallest === "n") {
      heightSuggestion = "Iluminar o centro do nariz e contornar o rosto na diagonal dando a sensação de alongamento.";
    } else {
      heightSuggestion = "Iluminar a ponta do queixo dando a sensação de alongamento e contornar suavemente a mandíbula sem fechar no queixo.";
    }
    heightDescription += ` — terço ${thirds.smallest === "m" ? "superior" : thirds.smallest === "n" ? "médio" : "inferior"} é o menor`;
  }

  results.push({
    key: "face_height",
    label: "Altura do rosto",
    realValue: raw.j,
    idealValue: refFaceHeight,
    status: faceHeightStatus,
    description: heightDescription,
    suggestion: heightSuggestion,
  });

  // 5. Comparar boca: l vs ideal
  const mouthStatus = compare(raw.l, refMouthWidth);
  results.push({
    key: "mouth",
    label: "Largura da boca",
    realValue: raw.l,
    idealValue: refMouthWidth,
    status: mouthStatus,
    description: mouthStatus === "equal"
      ? "Boca do tamanho padrão"
      : mouthStatus === "lesser"
        ? "Boca mais curta que a medida padrão"
        : "Boca mais larga que a medida padrão",
    suggestion: mouthStatus === "equal"
      ? "Proporção labial equilibrada."
      : mouthStatus === "lesser"
        ? "Apostar em tom único e gloss dará a sensação de boca maior."
        : "Utilizar os cantos mais escuros e o centro levemente mais claro.",
  });

  return results;
}

// ---- Análise dos terços ----
export function analyzeThirds(raw: RawMeasurements): ThirdsAnalysis {
  const total = raw.m + raw.n + raw.o;
  const percentages = {
    upper: Math.round((raw.m / total) * 100),
    middle: Math.round((raw.n / total) * 100),
    lower: Math.round((raw.o / total) * 100),
  };

  const thirds: Record<string, number> = { m: raw.m, n: raw.n, o: raw.o };
  const largest = (Object.entries(thirds).sort((a, b) => b[1] - a[1])[0][0]) as "m" | "n" | "o";
  const smallest = (Object.entries(thirds).sort((a, b) => a[1] - b[1])[0][0]) as "m" | "n" | "o";

  return { largest, smallest, percentages };
}

// ---- Classificação do formato do rosto ----
export function classifyFaceShape(raw: RawMeasurements): string {
  const ratio = raw.k / raw.j;
  const foreheadToJaw = raw.k; // simplified — in real impl would use separate forehead/jaw
  
  // Heurísticas baseadas nas proporções
  if (ratio > 0.85) return "Redondo";
  if (ratio < 0.65) return "Retangular";
  if (ratio >= 0.70 && ratio <= 0.80) {
    // Checar terços para diferenciar oval vs outros
    const thirds = analyzeThirds(raw);
    if (thirds.percentages.lower > 38) return "Triangular";
    if (thirds.percentages.upper > 38) return "Coração";
    return "Oval";
  }
  if (ratio >= 0.80 && ratio <= 0.85) return "Quadrado";
  return "Diamante";
}

// ---- Simetria ----
export function calculateSymmetry(raw: RawMeasurements): number {
  // Simetria baseada na diferença entre a e b (olho vs interocular)
  // e na distribuição dos terços
  const eyeSymmetry = 100 - (Math.abs(raw.a - raw.b) / Math.max(raw.a, raw.b)) * 100;
  const thirdsDeviation = Math.abs(raw.m - raw.n) + Math.abs(raw.n - raw.o) + Math.abs(raw.m - raw.o);
  const avgThird = (raw.m + raw.n + raw.o) / 3;
  const thirdsSymmetry = 100 - (thirdsDeviation / (avgThird * 3)) * 100;
  return Math.round((eyeSymmetry * 0.6 + thirdsSymmetry * 0.4));
}

// ---- Proporção áurea ----
export function calculateGoldenRatio(raw: RawMeasurements, ideal: IdealValues, ref: ReferenceLine): number {
  const refFaceHeight = ref === "a" ? ideal.d : ref === "b" ? ideal.e : ideal.f;
  const refFaceWidth = ref === "a" ? ideal.x : ref === "b" ? ideal.y : ideal.z;
  const actualRatio = raw.j / raw.k;
  const idealRatio = refFaceHeight / refFaceWidth; // should be 1.618
  // Score = how close actual is to 1.618
  return Math.round((1 - Math.abs(actualRatio - 1.618) / 1.618) * 100) / 100 * 1.618;
}

// ---- Função principal ----
export function analyzeVisagism(raw: RawMeasurements): VisagismResult {
  const idealValues = calculateIdealValues(raw);
  const referenceLine = selectReferenceLine(raw, idealValues);
  const comparisons = generateComparisons(raw, idealValues, referenceLine);
  const thirdsAnalysis = analyzeThirds(raw);
  const faceShape = classifyFaceShape(raw);
  const symmetryScore = calculateSymmetry(raw);
  const goldenRatioScore = calculateGoldenRatio(raw, idealValues, referenceLine);

  return {
    rawMeasurements: raw,
    idealValues,
    referenceLine,
    referenceLabel: REFERENCE_LABELS[referenceLine],
    comparisons,
    thirdsAnalysis,
    faceShape,
    symmetryScore,
    goldenRatioScore,
  };
}

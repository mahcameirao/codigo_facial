import { useState, useCallback, useRef, useEffect } from "react";
import { RefreshCw, Move, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RawMeasurements } from "@/lib/visagism-calculator";

// Named landmark points the user can drag
export interface LandmarkPoints {
  // Each point is { x, y } in % of container
  leftEyeOuter: { x: number; y: number };
  leftEyeInner: { x: number; y: number };
  rightEyeInner: { x: number; y: number };
  rightEyeOuter: { x: number; y: number };
  noseLeft: { x: number; y: number };
  noseRight: { x: number; y: number };
  mouthLeft: { x: number; y: number };
  mouthRight: { x: number; y: number };
  faceLeft: { x: number; y: number };
  faceRight: { x: number; y: number };
  hairline: { x: number; y: number };
  browLine: { x: number; y: number };
  noseBase: { x: number; y: number };
  chin: { x: number; y: number };
}

const DEFAULT_LANDMARKS: LandmarkPoints = {
  leftEyeOuter: { x: 28, y: 38 },
  leftEyeInner: { x: 42, y: 38 },
  rightEyeInner: { x: 58, y: 38 },
  rightEyeOuter: { x: 72, y: 38 },
  noseLeft: { x: 44, y: 55 },
  noseRight: { x: 56, y: 55 },
  mouthLeft: { x: 38, y: 68 },
  mouthRight: { x: 62, y: 68 },
  faceLeft: { x: 18, y: 46 },
  faceRight: { x: 82, y: 46 },
  hairline: { x: 50, y: 8 },
  browLine: { x: 50, y: 33 },
  noseBase: { x: 50, y: 58 },
  chin: { x: 50, y: 92 },
};

// Point metadata for display
const POINT_META: Record<keyof LandmarkPoints, { label: string; color: string; group: string }> = {
  leftEyeOuter: { label: "Olho E (ext)", color: "hsl(var(--primary))", group: "eyes" },
  leftEyeInner: { label: "Olho E (int)", color: "hsl(var(--primary))", group: "eyes" },
  rightEyeInner: { label: "Olho D (int)", color: "hsl(45, 80%, 60%)", group: "eyes" },
  rightEyeOuter: { label: "Olho D (ext)", color: "hsl(45, 80%, 60%)", group: "eyes" },
  noseLeft: { label: "Nariz E", color: "hsl(200, 70%, 55%)", group: "nose" },
  noseRight: { label: "Nariz D", color: "hsl(200, 70%, 55%)", group: "nose" },
  mouthLeft: { label: "Boca E", color: "hsl(340, 65%, 55%)", group: "mouth" },
  mouthRight: { label: "Boca D", color: "hsl(340, 65%, 55%)", group: "mouth" },
  faceLeft: { label: "Rosto E", color: "hsl(var(--accent))", group: "face" },
  faceRight: { label: "Rosto D", color: "hsl(var(--accent))", group: "face" },
  hairline: { label: "Linha cabelo", color: "hsl(45, 80%, 60%)", group: "thirds" },
  browLine: { label: "Sobrancelhas", color: "hsl(45, 80%, 60%)", group: "thirds" },
  noseBase: { label: "Base nariz", color: "hsl(200, 70%, 55%)", group: "thirds" },
  chin: { label: "Queixo", color: "hsl(340, 65%, 55%)", group: "thirds" },
};

// Calculate pixel distance between two points
function dist(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

// Convert landmark positions (%) to RawMeasurements (cm)
// We use a scale factor based on average face height (~18cm)
export function landmarksToMeasurements(points: LandmarkPoints, scaleFactor: number = 1): RawMeasurements {
  const faceHeightPx = dist(points.hairline, points.chin);
  // Scale: map face height in % to real cm (assume ~18cm as default)
  const cmPerPercent = (18 * scaleFactor) / faceHeightPx;

  const a = dist(points.leftEyeOuter, points.leftEyeInner) * cmPerPercent; // eye width
  const b = dist(points.leftEyeInner, points.rightEyeInner) * cmPerPercent; // interocular
  const c = dist(points.noseLeft, points.noseRight) * cmPerPercent; // nose width
  const j = faceHeightPx * cmPerPercent; // face height
  const k = dist(points.faceLeft, points.faceRight) * cmPerPercent; // face width
  const l = dist(points.mouthLeft, points.mouthRight) * cmPerPercent; // mouth width
  const m = dist(points.hairline, points.browLine) * cmPerPercent; // upper third
  const n = dist(points.browLine, points.noseBase) * cmPerPercent; // middle third
  const o = dist(points.noseBase, points.chin) * cmPerPercent; // lower third

  return { a, b, c, j, k, l, m, n, o };
}

interface DraggablePointProps {
  id: keyof LandmarkPoints;
  point: { x: number; y: number };
  meta: { label: string; color: string };
  isActive: boolean;
  onDragStart: (id: keyof LandmarkPoints) => void;
}

const DraggablePoint = ({ id, point, meta, isActive, onDragStart }: DraggablePointProps) => (
  <g
    className="cursor-grab active:cursor-grabbing"
    onPointerDown={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onDragStart(id);
    }}
    style={{ touchAction: "none" }}
  >
    {/* Hit area (larger invisible circle) */}
    <circle cx={`${point.x}%`} cy={`${point.y}%`} r="8" fill="transparent" />
    {/* Outer ring */}
    <circle
      cx={`${point.x}%`} cy={`${point.y}%`} r={isActive ? "5" : "4"}
      fill="none" stroke={meta.color} strokeWidth={isActive ? "2" : "1.5"}
      opacity={isActive ? 1 : 0.7}
    />
    {/* Inner dot */}
    <circle
      cx={`${point.x}%`} cy={`${point.y}%`} r="2"
      fill={meta.color} opacity="0.9"
    />
    {/* Label on hover/active */}
    {isActive && (
      <g>
        <rect
          x={`${point.x + 2}%`} y={`${point.y - 4}%`}
          width="16%" height="5%" rx="2"
          fill="hsl(var(--background))" stroke={meta.color} strokeWidth="0.5"
          opacity="0.95"
        />
        <text
          x={`${point.x + 10}%`} y={`${point.y - 1.5}%`}
          fill={meta.color} fontSize="4.5" textAnchor="middle"
          dominantBaseline="middle" fontFamily="var(--font-sans)" fontWeight="600"
        >
          {meta.label}
        </text>
      </g>
    )}
  </g>
);

// Measurement line between two points
const PointLine = ({ p1, p2, color, dashed = false }: { p1: { x: number; y: number }; p2: { x: number; y: number }; color: string; dashed?: boolean }) => (
  <line
    x1={`${p1.x}%`} y1={`${p1.y}%`}
    x2={`${p2.x}%`} y2={`${p2.y}%`}
    stroke={color} strokeWidth="1" strokeDasharray={dashed ? "3 2" : "none"} opacity="0.5"
  />
);

interface FacePointsEditorProps {
  imageUrl: string;
  initialMeasurements?: RawMeasurements;
  onRecalculate: (measurements: RawMeasurements) => void;
}

const FacePointsEditor = ({ imageUrl, onRecalculate }: FacePointsEditorProps) => {
  const [points, setPoints] = useState<LandmarkPoints>(DEFAULT_LANDMARKS);
  const [activePoint, setActivePoint] = useState<keyof LandmarkPoints | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const measurements = landmarksToMeasurements(points);

  const handleDragStart = useCallback((id: keyof LandmarkPoints) => {
    setActivePoint(id);
    setIsDragging(true);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !activePoint || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(2, Math.min(98, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(2, Math.min(98, ((e.clientY - rect.top) / rect.height) * 100));

    setPoints(prev => ({ ...prev, [activePoint]: { x, y } }));
  }, [isDragging, activePoint]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Global pointer up listener
  useEffect(() => {
    const handleGlobalUp = () => {
      setIsDragging(false);
    };
    window.addEventListener("pointerup", handleGlobalUp);
    return () => window.removeEventListener("pointerup", handleGlobalUp);
  }, []);

  const handleRecalculate = () => {
    onRecalculate(measurements);
  };

  const handleReset = () => {
    setPoints(DEFAULT_LANDMARKS);
    setActivePoint(null);
  };

  return (
    <div className="rounded-2xl border border-border bg-card/50 p-6 mb-10">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Move className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">Ajuste os Pontos de Medida</h2>
            <p className="text-xs text-muted-foreground">Arraste os pontos para alinhar com seu rosto</p>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 mb-5 flex items-start gap-2">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Posicione cada ponto sobre o local correspondente do rosto. Após ajustar, clique em <strong className="text-foreground">"Recalcular Análise"</strong> para atualizar todos os resultados.
        </p>
      </div>

      <div
        ref={containerRef}
        className="relative mx-auto select-none"
        style={{ maxWidth: "420px", touchAction: "none" }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="relative w-full" style={{ paddingBottom: "130%" }}>
          {/* Photo */}
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <img
              src={imageUrl}
              alt="Rosto para análise"
              className="w-full h-full object-cover pointer-events-none"
              draggable={false}
            />
            {/* Dark overlay for better point visibility */}
            <div className="absolute inset-0 bg-background/20" />
          </div>

          {/* SVG with draggable points */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 130"
            preserveAspectRatio="none"
          >
            {/* Connection lines between related points */}
            {/* Eye width (a) */}
            <PointLine p1={points.leftEyeOuter} p2={points.leftEyeInner} color="hsl(var(--primary))" />
            {/* Interocular (b) */}
            <PointLine p1={points.leftEyeInner} p2={points.rightEyeInner} color="hsl(45, 80%, 60%)" />
            {/* Right eye */}
            <PointLine p1={points.rightEyeInner} p2={points.rightEyeOuter} color="hsl(45, 80%, 60%)" />
            {/* Nose width (c) */}
            <PointLine p1={points.noseLeft} p2={points.noseRight} color="hsl(200, 70%, 55%)" />
            {/* Mouth width (l) */}
            <PointLine p1={points.mouthLeft} p2={points.mouthRight} color="hsl(340, 65%, 55%)" />
            {/* Face width (k) */}
            <PointLine p1={points.faceLeft} p2={points.faceRight} color="hsl(var(--accent))" dashed />
            {/* Vertical: thirds */}
            <PointLine p1={points.hairline} p2={points.browLine} color="hsl(45, 80%, 60%)" dashed />
            <PointLine p1={points.browLine} p2={points.noseBase} color="hsl(200, 70%, 55%)" dashed />
            <PointLine p1={points.noseBase} p2={points.chin} color="hsl(340, 65%, 55%)" dashed />

            {/* Draggable points */}
            {(Object.entries(points) as [keyof LandmarkPoints, { x: number; y: number }][]).map(([id, point]) => (
              <DraggablePoint
                key={id}
                id={id}
                point={point}
                meta={POINT_META[id]}
                isActive={activePoint === id}
                onDragStart={handleDragStart}
              />
            ))}
          </svg>
        </div>

        {/* Live measurements preview */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Olho (a)", value: measurements.a, color: "text-primary" },
            { label: "Entre olhos (b)", value: measurements.b, color: "text-[hsl(45,80%,60%)]" },
            { label: "Nariz (c)", value: measurements.c, color: "text-[hsl(200,70%,55%)]" },
            { label: "Altura (j)", value: measurements.j, color: "text-accent" },
            { label: "Largura (k)", value: measurements.k, color: "text-accent" },
            { label: "Boca (l)", value: measurements.l, color: "text-[hsl(340,65%,55%)]" },
          ].map((m, i) => (
            <div key={i} className="rounded-lg bg-secondary/30 p-2">
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
              <p className={`text-sm font-bold ${m.color}`}>{m.value.toFixed(1)} cm</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-3 mt-6">
        <Button variant="heroOutline" size="sm" onClick={handleReset}>
          Resetar pontos
        </Button>
        <Button variant="hero" size="lg" className="px-8" onClick={handleRecalculate}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Recalcular Análise
        </Button>
      </div>
    </div>
  );
};

export default FacePointsEditor;

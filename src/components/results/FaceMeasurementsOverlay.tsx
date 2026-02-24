import { useMemo } from "react";
import type { RawMeasurements } from "@/lib/visagism-calculator";

interface FaceMeasurementsOverlayProps {
  measurements: RawMeasurements;
  imageUrl?: string;
}

// Posições relativas dos pontos faciais (% do container)
// Baseado em proporções médias de um rosto frontal
const LANDMARKS = {
  // Centro do rosto
  centerX: 50,
  // Olhos
  leftEyeX: 35,
  rightEyeX: 65,
  eyeY: 38,
  // Sobrancelhas
  leftBrowX: 33,
  rightBrowX: 67,
  browY: 33,
  // Nariz
  noseLeftX: 44,
  noseRightX: 56,
  noseTopY: 38,
  noseBottomY: 58,
  // Boca
  mouthLeftX: 38,
  mouthRightX: 62,
  mouthY: 68,
  // Rosto
  faceLeftX: 18,
  faceRightX: 82,
  faceTopY: 5,
  faceBottomY: 95,
  foreheadY: 12,
  // Terços
  hairlineY: 8,
  browLineY: 33,
  noseBaseY: 60,
  chinY: 92,
  // Queixo
  jawLeftX: 25,
  jawRightX: 75,
};

interface MeasurementLineProps {
  x1: number; y1: number; x2: number; y2: number;
  label: string; value: string;
  color?: string; side?: "left" | "right" | "top" | "bottom" | "center";
  dashed?: boolean;
}

const MeasurementLine = ({ x1, y1, x2, y2, label, value, color = "hsl(var(--primary))", side = "right", dashed = false }: MeasurementLineProps) => {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  const labelOffset = {
    left: { x: -3, y: 0, anchor: "end" as const },
    right: { x: 3, y: 0, anchor: "start" as const },
    top: { x: 0, y: -3, anchor: "middle" as const },
    bottom: { x: 0, y: 5, anchor: "middle" as const },
    center: { x: 0, y: -2, anchor: "middle" as const },
  }[side];

  return (
    <g>
      <line
        x1={`${x1}%`} y1={`${y1}%`}
        x2={`${x2}%`} y2={`${y2}%`}
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray={dashed ? "4 3" : "none"}
        opacity="0.85"
      />
      {/* End caps */}
      <circle cx={`${x1}%`} cy={`${y1}%`} r="2.5" fill={color} opacity="0.9" />
      <circle cx={`${x2}%`} cy={`${y2}%`} r="2.5" fill={color} opacity="0.9" />
      {/* Label background */}
      <rect
        x={`${midX + labelOffset.x - (side === "left" ? 14 : side === "right" ? 0 : 7)}%`}
        y={`${midY + labelOffset.y - 3.5}%`}
        width="14%"
        height="7%"
        rx="3"
        fill="hsl(var(--background))"
        opacity="0.85"
      />
      {/* Label text */}
      <text
        x={`${midX + labelOffset.x + (side === "left" ? -7 : side === "right" ? 7 : 0)}%`}
        y={`${midY + labelOffset.y - 0.5}%`}
        fill={color}
        fontSize="7"
        fontWeight="600"
        textAnchor={labelOffset.anchor}
        dominantBaseline="middle"
        fontFamily="var(--font-sans)"
      >
        {value}
      </text>
      <text
        x={`${midX + labelOffset.x + (side === "left" ? -7 : side === "right" ? 7 : 0)}%`}
        y={`${midY + labelOffset.y + 2.5}%`}
        fill="hsl(var(--muted-foreground))"
        fontSize="5"
        textAnchor={labelOffset.anchor}
        dominantBaseline="middle"
        fontFamily="var(--font-sans)"
      >
        {label}
      </text>
    </g>
  );
};

const ThirdZone = ({ y1, y2, label, color }: { y1: number; y2: number; label: string; color: string }) => (
  <g>
    <rect
      x="83%" y={`${y1}%`}
      width="12%" height={`${y2 - y1}%`}
      fill={color} opacity="0.1"
      rx="2"
    />
    <line x1="83%" y1={`${y1}%`} x2="95%" y2={`${y1}%`} stroke={color} strokeWidth="0.5" opacity="0.4" />
    <line x1="83%" y1={`${y2}%`} x2="95%" y2={`${y2}%`} stroke={color} strokeWidth="0.5" opacity="0.4" />
    <text
      x="89%" y={`${(y1 + y2) / 2}%`}
      fill={color} fontSize="5" textAnchor="middle" dominantBaseline="middle"
      fontFamily="var(--font-sans)" fontWeight="500"
    >
      {label}
    </text>
  </g>
);

const FaceMeasurementsOverlay = ({ measurements, imageUrl }: FaceMeasurementsOverlayProps) => {
  const L = LANDMARKS;

  return (
    <div className="rounded-2xl border border-border bg-card/50 p-6 mb-10">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="10" r="7" />
            <path d="M12 17v4M8 21h8" />
          </svg>
        </div>
        <h2 className="font-display text-xl font-semibold">Mapa de Medidas Faciais</h2>
      </div>

      <div className="relative mx-auto" style={{ maxWidth: "420px" }}>
        <div className="relative w-full" style={{ paddingBottom: "130%" }}>
          {/* Background: photo or placeholder silhouette */}
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            {imageUrl ? (
              <img src={imageUrl} alt="Rosto analisado" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-secondary/20 flex items-center justify-center">
                {/* Face silhouette */}
                <svg viewBox="0 0 200 260" className="w-3/4 h-3/4 text-muted-foreground/15">
                  <ellipse cx="100" cy="120" rx="70" ry="90" fill="currentColor" />
                  {/* Eyes */}
                  <ellipse cx="72" cy="100" rx="12" ry="6" fill="hsl(var(--background))" opacity="0.5" />
                  <ellipse cx="128" cy="100" rx="12" ry="6" fill="hsl(var(--background))" opacity="0.5" />
                  {/* Nose */}
                  <path d="M95 110 L100 135 L105 110" stroke="hsl(var(--background))" strokeWidth="1.5" fill="none" opacity="0.3" />
                  {/* Mouth */}
                  <path d="M80 160 Q100 175 120 160" stroke="hsl(var(--background))" strokeWidth="1.5" fill="none" opacity="0.3" />
                </svg>
              </div>
            )}
          </div>

          {/* SVG Overlay with measurements */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 130"
            preserveAspectRatio="none"
          >
            {/* Face outline guide */}
            <ellipse
              cx="50" cy="48" rx="32" ry="40"
              fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5"
              strokeDasharray="3 2" opacity="0.25"
            />

            {/* Center line */}
            <line x1="50%" y1="5%" x2="50%" y2="95%" stroke="hsl(var(--muted-foreground))" strokeWidth="0.3" strokeDasharray="2 3" opacity="0.3" />

            {/* Horizontal third lines */}
            <line x1="15%" y1={`${L.browLineY}%`} x2="80%" y2={`${L.browLineY}%`} stroke="hsl(var(--accent))" strokeWidth="0.4" strokeDasharray="2 2" opacity="0.4" />
            <line x1="15%" y1={`${L.noseBaseY}%`} x2="80%" y2={`${L.noseBaseY}%`} stroke="hsl(var(--accent))" strokeWidth="0.4" strokeDasharray="2 2" opacity="0.4" />

            {/* Measurement: Distância dos olhos (a) - width of left eye */}
            <MeasurementLine
              x1={L.leftEyeX - 7} y1={L.eyeY}
              x2={L.leftEyeX + 7} y2={L.eyeY}
              label="Dist. olhos (a)" value={`${measurements.a.toFixed(1)} cm`}
              side="left" color="hsl(var(--primary))"
            />

            {/* Measurement: Distância entre olhos (b) - interocular */}
            <MeasurementLine
              x1={L.leftEyeX + 7} y1={L.eyeY - 5}
              x2={L.rightEyeX - 7} y2={L.eyeY - 5}
              label="Entre olhos (b)" value={`${measurements.b.toFixed(1)} cm`}
              side="top" color="hsl(45, 80%, 60%)"
            />

            {/* Measurement: Largura do nariz (c) */}
            <MeasurementLine
              x1={L.noseLeftX} y1={L.noseBottomY}
              x2={L.noseRightX} y2={L.noseBottomY}
              label="Nariz (c)" value={`${measurements.c.toFixed(1)} cm`}
              side="bottom" color="hsl(200, 70%, 55%)"
            />

            {/* Measurement: Largura da boca (l) */}
            <MeasurementLine
              x1={L.mouthLeftX} y1={L.mouthY}
              x2={L.mouthRightX} y2={L.mouthY}
              label="Boca (l)" value={`${measurements.l.toFixed(1)} cm`}
              side="bottom" color="hsl(340, 65%, 55%)"
            />

            {/* Measurement: Largura do rosto (k) */}
            <MeasurementLine
              x1={L.faceLeftX} y1={L.eyeY + 8}
              x2={L.faceRightX} y2={L.eyeY + 8}
              label="Largura rosto (k)" value={`${measurements.k.toFixed(1)} cm`}
              side="bottom" color="hsl(var(--accent))"
            />

            {/* Measurement: Altura do rosto (j) - vertical left side */}
            <MeasurementLine
              x1={L.faceLeftX - 5} y1={L.hairlineY}
              x2={L.faceLeftX - 5} y2={L.chinY}
              label="Altura (j)" value={`${measurements.j.toFixed(1)} cm`}
              side="left" color="hsl(var(--accent))"
            />

            {/* Thirds zones on right */}
            <ThirdZone y1={L.hairlineY} y2={L.browLineY} label={`${measurements.m.toFixed(1)} cm`} color="hsl(45, 80%, 60%)" />
            <ThirdZone y1={L.browLineY} y2={L.noseBaseY} label={`${measurements.n.toFixed(1)} cm`} color="hsl(200, 70%, 55%)" />
            <ThirdZone y1={L.noseBaseY} y2={L.chinY} label={`${measurements.o.toFixed(1)} cm`} color="hsl(340, 65%, 55%)" />

            {/* Third labels */}
            <text x="89%" y={`${L.hairlineY - 2}%`} fill="hsl(var(--muted-foreground))" fontSize="4" textAnchor="middle" fontFamily="var(--font-sans)">Terços</text>
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {[
            { color: "bg-primary", label: "Distância dos olhos (a)" },
            { color: "bg-[hsl(45,80%,60%)]", label: "Entre olhos (b)" },
            { color: "bg-[hsl(200,70%,55%)]", label: "Largura do nariz (c)" },
            { color: "bg-[hsl(340,65%,55%)]", label: "Largura da boca (l)" },
            { color: "bg-accent", label: "Largura / Altura do rosto" },
            { color: "bg-muted-foreground", label: "Linha central / terços" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <div className={`h-2 w-2 rounded-full ${item.color} shrink-0`} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FaceMeasurementsOverlay;

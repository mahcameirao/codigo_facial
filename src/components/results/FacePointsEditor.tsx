import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { RefreshCw, Move, Info, ZoomIn, ZoomOut, Maximize, Ruler, RotateCw, RotateCcw, Loader2 } from "lucide-react";
import * as faceapi from '@vladmandic/face-api';
import { Button } from "@/components/ui/button";
import type { RawMeasurements } from "@/lib/visagism-calculator";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
  zoom?: number;
  isClamped?: boolean;
}

const DraggablePoint = ({ id, point, meta, isActive, onDragStart, zoom = 1, isClamped = false }: DraggablePointProps) => (
  <g
    className="cursor-grab active:cursor-grabbing"
    onPointerDown={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onDragStart(id);
    }}
    style={{ touchAction: "none" }}
  >
    {/* Hit area */}
    <circle cx={`${point.x}%`} cy={`${point.y}%`} r={12 / zoom} fill="transparent" />
    {/* Outer ring */}
    <circle
      cx={`${point.x}%`} cy={`${point.y}%`} r={(isClamped ? 2.5 : 1.5) / zoom}
      fill={isClamped ? "hsl(var(--background))" : "none"}
      stroke={meta.color} strokeWidth={(isClamped ? 1.0 : 0.8) / zoom}
      opacity={1}
      strokeDasharray={isClamped ? `${1.5 / zoom} ${1.5 / zoom}` : "none"}
    />
    {/* Inner dot */}
    <circle
      cx={`${point.x}%`} cy={`${point.y}%`} r={(isActive || isClamped) ? 0.8 / zoom : 0.5 / zoom}
      fill={meta.color} opacity="1"
    />
    {/* Crosshair when active */}
    {isActive && (
      <>
        <line x1={`${point.x - 1.8 / zoom}%`} y1={`${point.y}%`} x2={`${point.x + 1.8 / zoom}%`} y2={`${point.y}%`} stroke={meta.color} strokeWidth={0.3 / zoom} opacity="0.6" />
        <line x1={`${point.x}%`} y1={`${point.y - 1.8 / zoom}%`} x2={`${point.x}%`} y2={`${point.y + 1.8 / zoom}%`} stroke={meta.color} strokeWidth={0.3 / zoom} opacity="0.6" />
      </>
    )}
    {/* Label */}
    {(isActive || isClamped) && (
      <g>
        <rect
          x={`${point.x + 1.5 / zoom}%`} y={`${point.y - (isClamped ? 3.5 : 2.5) / zoom}%`}
          width={`${isClamped ? 12 : 8} / zoom}%`} height={`${3 / zoom}%`} rx={1 / zoom}
          fill="hsl(var(--foreground))" stroke={meta.color} strokeWidth={0.3 / zoom}
          opacity="0.95"
        />
        <text
          x={`${point.x + (isClamped ? 7.5 : 5.5) / zoom}%`} y={`${point.y - (isClamped ? 2 : 1) / zoom}%`}
          fill="hsl(var(--background))" fontSize={2 / zoom} textAnchor="middle"
          dominantBaseline="middle" fontFamily="var(--font-sans)" fontWeight="700"
        >
          {meta.label} {isClamped ? "(Solto)" : ""}
        </text>
      </g>
    )}
  </g>
);

// Measurement line between two points
const PointLine = ({ p1, p2, color, dashed = false, zoom = 1 }: { p1: { x: number; y: number }; p2: { x: number; y: number }; color: string; dashed?: boolean; zoom?: number }) => (
  <line
    x1={`${p1.x}%`} y1={`${p1.y}%`}
    x2={`${p2.x}%`} y2={`${p2.y}%`}
    stroke={color} strokeWidth={1 / zoom} strokeDasharray={dashed ? `${3 / zoom} ${2 / zoom}` : "none"} opacity="0.5"
  />
);

interface FacePointsEditorProps {
  imageUrl: string;
  initialMeasurements?: RawMeasurements;
  onRecalculate: (measurements: RawMeasurements) => void;
}

const FacePointsEditor = ({ imageUrl, onRecalculate }: FacePointsEditorProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [points, setPoints] = useState<LandmarkPoints>(DEFAULT_LANDMARKS);
  const [activePoint, setActivePoint] = useState<keyof LandmarkPoints | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [imgAspect, setImgAspect] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);
  const [showRuler, setShowRuler] = useState(false);
  const [rulerY, setRulerY] = useState(50); // ruler position in %
  const [isDraggingRuler, setIsDraggingRuler] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const measurements = landmarksToMeasurements(points);

  // Load image to get natural aspect ratio and auto-detect face
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      setImgAspect(img.naturalHeight / img.naturalWidth);

      try {
        setIsDetecting(true);
        await faceapi.nets.tinyFaceDetector.loadFromUri('https://vladmandic.github.io/face-api/model/');
        await faceapi.nets.faceLandmark68Net.loadFromUri('https://vladmandic.github.io/face-api/model/');

        const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
        if (detection) {
          const w = img.naturalWidth;
          const h = img.naturalHeight;
          const pts = detection.landmarks.positions;
          const toPct = (pt: { x: number, y: number }) => ({ x: (pt.x / w) * 100, y: (pt.y / h) * 100 });
          const bbox = detection.alignedRect.box;

          const detectedMarks: LandmarkPoints = {
            leftEyeOuter: toPct(pts[36]),
            leftEyeInner: toPct(pts[39]),
            rightEyeInner: toPct(pts[42]),
            rightEyeOuter: toPct(pts[45]),
            noseLeft: toPct(pts[31]),
            noseRight: toPct(pts[35]),
            mouthLeft: toPct(pts[48]),
            mouthRight: toPct(pts[54]),
            faceLeft: toPct(pts[0]),
            faceRight: toPct(pts[16]),
            chin: toPct(pts[8]),
            hairline: { x: toPct(pts[27]).x, y: Math.max(0, (bbox.y / h) * 100) },
            browLine: toPct({ x: (pts[19].x + pts[24].x) / 2, y: (pts[19].y + pts[24].y) / 2 }),
            noseBase: toPct(pts[33])
          };

          setPoints(detectedMarks);
          onRecalculate(landmarksToMeasurements(detectedMarks));
        }
      } catch (e) {
        console.error("Auto detect failed", e);
      } finally {
        setIsDetecting(false);
      }
    };
    img.src = imageUrl;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl]);

  const handleDragStart = useCallback((id: keyof LandmarkPoints) => {
    if (!user) {
      toast.error("Cadastro Necessário", {
        description: "Faça seu cadastro para ajustar os pontos médicos."
      });
      navigate("/register");
      return;
    }
    setActivePoint(id);
    setIsDragging(true);
  }, [user, navigate]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!innerRef.current) return;

    // Handle ruler dragging
    if (isDraggingRuler && showRuler) {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
        setRulerY(y);
      }
      return;
    }

    // Handle panning
    if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setPan(prev => ({
        x: Math.max(-(zoom - 1) * 50, Math.min((zoom - 1) * 50, prev.x + dx / zoom)),
        y: Math.max(-(zoom - 1) * 50, Math.min((zoom - 1) * 50, prev.y + dy / zoom)),
      }));
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (!isDragging || !activePoint) return;

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // O evento de mouse nos dá a posição na tela. 
      // Subtrai-se as bordas (rect.left/top) para achar o Ponto X e Y relativo à div contêiner.
      const rawX = e.clientX - rect.left;
      const rawY = e.clientY - rect.top;

      // Precisamos reverter a matemática do transform CSS: translate e scale (zoom).
      // Transform aplicado: translate(pan.X, pan.Y) scale(zoom)
      // Largura virtual da imagem em pixels
      const vWidth = rect.width * zoom;
      const vHeight = rect.height * zoom;

      // Deslocamento do panning (em pixels relativas à tela original)
      const panPxX = (pan.x / 100) * rect.width;
      const panPxY = (pan.y / 100) * rect.height;

      // Achar onde seria o top/left do canvas transformado
      const leftEdge = (rect.width - vWidth) / 2 + panPxX;
      const topEdge = (rect.height - vHeight) / 2 + panPxY;

      // Achar a coordenada no canvas e converter para %.
      const xPct = ((rawX - leftEdge) / vWidth) * 100;
      const yPct = ((rawY - topEdge) / vHeight) * 100;

      // Travar os pontos dentro da imagem para não passarem da borda
      const boundedX = Math.max(0, Math.min(100, xPct));
      const boundedY = Math.max(0, Math.min(100, yPct));

      setPoints(prev => ({ ...prev, [activePoint]: { x: boundedX, y: boundedY } }));
    }
  }, [isDragging, activePoint, isPanning, panStart, zoom, pan, isDraggingRuler, showRuler]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setIsPanning(false);
    setIsDraggingRuler(false);
  }, []);

  const handleMiddleDown = useCallback((e: React.PointerEvent) => {
    // Middle mouse or when no point is being dragged and zoom > 1
    if (e.button === 1 || (e.button === 0 && zoom > 1 && !activePoint)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  }, [zoom, activePoint]);

  // Global pointer up listener
  useEffect(() => {
    const handleGlobalUp = () => {
      setIsDragging(false);
      setIsPanning(false);
      setIsDraggingRuler(false);
    };
    window.addEventListener("pointerup", handleGlobalUp);
    return () => window.removeEventListener("pointerup", handleGlobalUp);
  }, []);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(prev => Math.max(1, Math.min(4, prev + (e.deltaY > 0 ? -0.1 : 0.1))));
  }, []);

  const visibleBounds = useMemo(() => {
    const minX = ((zoom - 1) * 50 - pan.x) / zoom;
    const maxX = 100 / zoom + minX;
    const minY = ((zoom - 1) * 50 - pan.y) / zoom;
    const maxY = 100 / zoom + minY;

    return {
      minX: minX + 5 / zoom,
      maxX: maxX - 5 / zoom,
      minY: minY + 5 / zoom,
      maxY: maxY - 5 / zoom,
    };
  }, [zoom, pan]);

  const zoomIn = () => setZoom(prev => Math.min(4, prev + 0.1));
  const zoomOut = () => setZoom(prev => Math.max(1, prev - 0.1));
  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); setRotation(0); };
  const rotateLeft = () => setRotation(prev => prev - 1);
  const rotateRight = () => setRotation(prev => prev + 1);
  const toggleRuler = () => setShowRuler(prev => !prev);

  const handleRecalculate = () => {
    if (!user) {
      toast.error("Cadastro Necessário", {
        description: "Faça o cadastro para recalcular a análise."
      });
      navigate("/register");
      return;
    }
    onRecalculate(measurements);
  };

  const handleReset = () => {
    setPoints(DEFAULT_LANDMARKS);
    setActivePoint(null);
  };

  // Aspect ratio: use real image aspect or default 1.3
  const aspectRatio = imgAspect ?? 1.3;
  const svgViewBox = `0 0 100 ${100 * aspectRatio}`;

  return (
    <div className="rounded-2xl border border-border bg-card/50 p-6 mb-10">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            {isDetecting ? (
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            ) : (
              <Move className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">
              {isDetecting ? "Detectando rosto na IA..." : "Ajuste os Pontos de Medida"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isDetecting ? "Aguarde enquanto os pontos são pré-posicionados" : "Arraste os pontos para alinhar com seu rosto"}
            </p>
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

      {/* Toolbar */}
      <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
        <Button variant="heroOutline" size="sm" onClick={zoomOut} disabled={zoom <= 1} className="h-8 w-8 p-0">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-xs text-muted-foreground font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
        <Button variant="heroOutline" size="sm" onClick={zoomIn} disabled={zoom >= 4} className="h-8 w-8 p-0">
          <ZoomIn className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button variant="heroOutline" size="sm" onClick={rotateLeft} className="h-8 w-8 p-0" title="Girar esquerda">
          <RotateCcw className="h-4 w-4" />
        </Button>
        <span className="text-xs text-muted-foreground font-mono w-10 text-center">{rotation}°</span>
        <Button variant="heroOutline" size="sm" onClick={rotateRight} className="h-8 w-8 p-0" title="Girar direita">
          <RotateCw className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          variant={showRuler ? "hero" : "heroOutline"}
          size="sm"
          onClick={toggleRuler}
          className="h-8 w-8 p-0"
          title="Régua horizontal"
        >
          <Ruler className="h-4 w-4" />
        </Button>

        <Button variant="heroOutline" size="sm" onClick={resetView} className="h-8 w-8 p-0" disabled={zoom === 1 && rotation === 0}>
          <Maximize className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={containerRef}
        className="relative mx-auto select-none overflow-hidden rounded-xl border border-border"
        style={{ maxWidth: "500px", touchAction: "none" }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerDown={handleMiddleDown}
        onWheel={handleWheel}
      >
        <div
          ref={innerRef}
          className="relative w-full transition-transform duration-100"
          style={{
            paddingBottom: `${aspectRatio * 100}%`,
            width: "100%",
            transform: `translate(${pan.x}%, ${pan.y}%) scale(${zoom}) rotate(${rotation}deg)`,
            transformOrigin: "center center",
          }}
        >
          {/* Photo — object-contain to preserve aspect ratio */}
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={imageUrl}
              alt="Rosto para análise"
              className="w-full h-full object-contain pointer-events-none"
              draggable={false}
            />
            {/* Dark overlay for better point visibility */}
            <div className="absolute inset-0 bg-background/20" />
          </div>

          {/* SVG with draggable points — matching image aspect */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox={svgViewBox}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Connection lines between related points */}
            <PointLine p1={points.leftEyeOuter} p2={points.leftEyeInner} color="hsl(var(--primary))" zoom={zoom} />
            <PointLine p1={points.leftEyeInner} p2={points.rightEyeInner} color="hsl(45, 80%, 60%)" zoom={zoom} />
            <PointLine p1={points.rightEyeInner} p2={points.rightEyeOuter} color="hsl(45, 80%, 60%)" zoom={zoom} />
            <PointLine p1={points.noseLeft} p2={points.noseRight} color="hsl(200, 70%, 55%)" zoom={zoom} />
            <PointLine p1={points.mouthLeft} p2={points.mouthRight} color="hsl(340, 65%, 55%)" zoom={zoom} />
            <PointLine p1={points.faceLeft} p2={points.faceRight} color="hsl(var(--accent))" dashed zoom={zoom} />
            <PointLine p1={points.hairline} p2={points.browLine} color="hsl(45, 80%, 60%)" dashed zoom={zoom} />
            <PointLine p1={points.browLine} p2={points.noseBase} color="hsl(200, 70%, 55%)" dashed zoom={zoom} />
            <PointLine p1={points.noseBase} p2={points.chin} color="hsl(340, 65%, 55%)" dashed zoom={zoom} />

            {/* Draggable points */}
            {(Object.entries(points) as [keyof LandmarkPoints, { x: number; y: number }][]).map(([id, point]) => {
              const isClampedX = point.x < visibleBounds.minX || point.x > visibleBounds.maxX;
              const isClampedY = point.y < visibleBounds.minY || point.y > visibleBounds.maxY;
              const isClamped = isClampedX || isClampedY;

              const visualPoint = {
                x: Math.max(visibleBounds.minX, Math.min(visibleBounds.maxX, point.x)),
                y: Math.max(visibleBounds.minY, Math.min(visibleBounds.maxY, point.y))
              };

              return (
                <DraggablePoint
                  key={id}
                  id={id}
                  point={visualPoint}
                  meta={POINT_META[id]}
                  isActive={activePoint === id}
                  onDragStart={handleDragStart}
                  zoom={zoom}
                  isClamped={isClamped}
                />
              );
            })}
          </svg>
        </div>

        {/* Fixed Overlay for Grid and Ruler */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 10 }}
        >
          {/* Grid overlay */}
          <defs>
            <pattern id="fixed-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--foreground))" strokeWidth="0.5" opacity="0.15" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#fixed-grid)" />

          {/* Horizontal ruler */}
          {showRuler && (
            <g>
              <line
                x1="0" y1={`${rulerY}%`}
                x2="100%" y2={`${rulerY}%`}
                stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.8"
                strokeDasharray="6 4"
              />
              <rect
                x="0" y={`calc(${rulerY}% - 8px)`}
                width="100%" height="16px"
                fill="transparent"
                className="cursor-ns-resize"
                style={{ pointerEvents: "auto", touchAction: "none" }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDraggingRuler(true);
                }}
              />
              <rect
                x="8" y={`calc(${rulerY}% - 12px)`}
                width="40" height="24" rx="4"
                fill="hsl(var(--primary))" opacity="0.9"
              />
              <text
                x="28" y={`${rulerY}%`}
                fill="hsl(var(--primary-foreground))" fontSize="12" textAnchor="middle"
                dominantBaseline="middle" fontFamily="var(--font-sans)" fontWeight="700"
              >
                {rulerY.toFixed(0)}%
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Live measurements preview */}
      <div className="mt-4 mx-auto grid grid-cols-3 gap-2 text-center" style={{ maxWidth: "500px" }}>
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
    </div >
  );
};

export default FacePointsEditor;

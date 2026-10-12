import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, LoaderCircle, Palette, Share2, X } from "lucide-react";
import { toast } from "sonner";
import type { VerseRef } from "@/lib/bible";

const CARD_THEMES = {
  parchment: { bg: ["#F5EFE0", "#EDE2C8"], text: "#3A3528", accent: "#B89B5E", label: "Parchment" },
  indigo: { bg: ["#1E2746", "#2E3A6B"], text: "#F2EBD8", accent: "#E2B864", label: "Indigo Night" },
  rose: { bg: ["#F4D9D0", "#E8A89E"], text: "#4A2A2A", accent: "#8E3A50", label: "Rose Dawn" },
  forest: { bg: ["#2A3D2E", "#3F5944"], text: "#EFE6CF", accent: "#D4B36A", label: "Forest Vesper" },
} as const;

type CardTheme = keyof typeof CARD_THEMES;

const SIZE = 1080;

/** Draws a square, Instagram-ready verse card onto the canvas. */
const drawVerseCard = (canvas: HTMLCanvasElement, verse: VerseRef, themeKey: CardTheme) => {
  const theme = CARD_THEMES[themeKey];
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = SIZE;
  canvas.height = SIZE;

  const gradient = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  gradient.addColorStop(0, theme.bg[0]);
  gradient.addColorStop(1, theme.bg[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Subtle dot texture
  ctx.fillStyle = theme.text;
  ctx.globalAlpha = 0.03;
  for (let x = 0; x < SIZE; x += 20)
    for (let y = 0; y < SIZE; y += 20) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  ctx.globalAlpha = 1;

  // Top ornament
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(SIZE / 2 - 60, 140);
  ctx.lineTo(SIZE / 2 + 60, 140);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(SIZE / 2, 140, 6, 0, Math.PI * 2);
  ctx.fillStyle = theme.accent;
  ctx.fill();

  ctx.fillStyle = theme.text;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const length = verse.text.length;
  const fontSize = length > 280 ? 42 : length > 180 ? 50 : length > 100 ? 60 : 70;
  ctx.font = `italic ${fontSize}px "Playfair Display", Georgia, serif`;

  // Word-wrap the verse
  const maxWidth = SIZE - 200;
  const lines: string[] = [];
  let line = "";
  for (const word of verse.text.split(" ")) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);

  const lineHeight = fontSize * 1.4;
  const blockHeight = lines.length * lineHeight;
  const startY = SIZE / 2 - blockHeight / 2 + lineHeight / 2;

  ctx.font = `italic ${fontSize * 1.4}px "Playfair Display", Georgia, serif`;
  ctx.fillStyle = theme.accent;
  ctx.globalAlpha = 0.5;
  ctx.fillText("“", SIZE / 2, startY - lineHeight);
  ctx.globalAlpha = 1;

  ctx.fillStyle = theme.text;
  ctx.font = `italic ${fontSize}px "Playfair Display", Georgia, serif`;
  lines.forEach((l, i) => ctx.fillText(l, SIZE / 2, startY + i * lineHeight));

  ctx.font = `italic ${fontSize * 1.4}px "Playfair Display", Georgia, serif`;
  ctx.fillStyle = theme.accent;
  ctx.globalAlpha = 0.5;
  ctx.fillText("”", SIZE / 2, startY + blockHeight + lineHeight * 0.2);
  ctx.globalAlpha = 1;

  // Reference + footer
  ctx.fillStyle = theme.accent;
  ctx.font = '600 32px "Inter", system-ui, sans-serif';
  ctx.fillText(verse.reference.toUpperCase(), SIZE / 2, SIZE - 180);
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(SIZE / 2 - 100, SIZE - 130);
  ctx.lineTo(SIZE / 2 + 100, SIZE - 130);
  ctx.stroke();
  ctx.fillStyle = theme.text;
  ctx.globalAlpha = 0.5;
  ctx.font = '400 22px "Inter", system-ui, sans-serif';
  ctx.fillText("SANCTUARY", SIZE / 2, SIZE - 90);
  ctx.globalAlpha = 1;
};

interface ShareVerseDialogProps {
  open: boolean;
  onClose: () => void;
  verse: VerseRef | null;
}

const ShareVerseDialog = ({ open, onClose, verse }: ShareVerseDialogProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [theme, setTheme] = useState<CardTheme>("parchment");
  const [rendering, setRendering] = useState(false);

  useEffect(() => {
    if (!open || !verse || !canvasRef.current) return;
    setRendering(true);
    const timer = setTimeout(async () => {
      try {
        if ("fonts" in document) await document.fonts.load("italic 60px 'Playfair Display'");
      } catch {
        /* ignore */
      }
      if (canvasRef.current && verse) drawVerseCard(canvasRef.current, verse, theme);
      setRendering(false);
    }, 50);
    return () => clearTimeout(timer);
  }, [open, verse, theme]);

  if (!verse) return null;

  const filename = `verse-${verse.reference.replace(/[^\w]+/g, "-").toLowerCase()}.png`;

  const download = () => {
    canvasRef.current?.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Verse card downloaded");
    });
  };

  const share = () => {
    canvasRef.current?.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], filename, { type: "image/png" });
      const data = { title: verse.reference, text: `"${verse.text}" — ${verse.reference}`, files: [file] };
      if (navigator.canShare?.(data) && navigator.share) {
        try {
          await navigator.share(data);
        } catch {
          /* user cancelled */
        }
      } else {
        download();
      }
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto pointer-events-auto shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold">Share Verse</h3>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="relative aspect-square rounded-xl overflow-hidden bg-muted mb-4">
                <canvas ref={canvasRef} className="w-full h-full block" />
                {rendering && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-sm">
                    <LoaderCircle className="animate-spin text-accent" size={24} />
                  </div>
                )}
              </div>

              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-widest font-body font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Palette size={12} /> Theme
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(CARD_THEMES) as CardTheme[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => setTheme(key)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        theme === key ? "border-accent scale-95" : "border-transparent hover:border-border"
                      }`}
                      style={{ background: `linear-gradient(135deg, ${CARD_THEMES[key].bg[0]}, ${CARD_THEMES[key].bg[1]})` }}
                      aria-label={CARD_THEMES[key].label}
                    >
                      <span
                        className="absolute inset-x-0 bottom-0 text-[8px] font-body font-medium py-1 text-center"
                        style={{ color: CARD_THEMES[key].text, background: `${CARD_THEMES[key].bg[1]}cc` }}
                      >
                        {CARD_THEMES[key].label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={download}
                  disabled={rendering}
                  className="flex-1 flex items-center justify-center gap-2 bg-secondary text-secondary-foreground font-body font-medium text-sm px-4 py-2.5 rounded-lg hover:brightness-95 disabled:opacity-50 transition-all"
                >
                  <Download size={16} /> Download
                </button>
                <button
                  onClick={share}
                  disabled={rendering}
                  className="flex-1 gold-button text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Share2 size={16} /> Share
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ShareVerseDialog;

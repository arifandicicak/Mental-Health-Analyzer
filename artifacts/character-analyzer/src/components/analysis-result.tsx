/**
 * analysis-result.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Komponen yang menampilkan hasil analisis AI dalam bentuk dashboard kartu.
 * Setiap kartu hasil memiliki tombol "Salin" untuk menyalin teks ke clipboard.
 *
 * Kartu yang ditampilkan:
 *  1. Status Toksisitas & Bullying
 *  2. Profil Kepribadian
 *  3. Red Flag vs Green Flag Meter
 *  4. Mental Health Insight
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  User,
  Flag,
  CheckCircle,
  Lightbulb,
  Copy,
  Check,
  Fingerprint,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AnalysisResult } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

// ─── Props komponen ──────────────────────────────────────────────────────────
interface AnalysisResultProps {
  result: AnalysisResult; // Objek hasil dari API Gemini
}

// ─── Sub-komponen: tombol salin teks ─────────────────────────────────────────
function CopyButton({ text, label }: { text: string; label?: string }) {
  // State untuk animasi feedback "Tersalin!"
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Handler klik tombol salin
  const handleCopy = useCallback(async () => {
    try {
      // Gunakan Clipboard API (modern, async)
      await navigator.clipboard.writeText(text);
      setCopied(true); // Tampilkan ikon centang

      // Reset ikon kembali ke ikon copy setelah 2 detik
      setTimeout(() => setCopied(false), 2000);

      toast({
        title: "Tersalin!",
        description: label ? `${label} berhasil disalin ke clipboard.` : "Teks disalin ke clipboard.",
        duration: 2000,
      });
    } catch {
      // Jika Clipboard API tidak tersedia, tampilkan pesan error
      toast({
        title: "Gagal menyalin",
        description: "Browser tidak mendukung akses clipboard.",
        variant: "destructive",
      });
    }
  }, [text, label, toast]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="
        w-7 h-7                          /* ukuran kecil */
        text-muted-foreground            /* warna abu default */
        hover:text-foreground            /* lebih gelap saat hover */
        hover:bg-muted/60                /* latar tipis saat hover */
        rounded-lg                       /* sudut bulat */
        shrink-0                         /* tidak menyusut di flex */
        transition-all duration-150
      "
      onClick={handleCopy}
      aria-label="Salin ke clipboard"
      data-testid="button-copy"
    >
      {/* Ganti ikon sesuai state copied */}
      {copied ? (
        <Check className="w-3.5 h-3.5 text-primary" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </Button>
  );
}

// ─── Helper: warna badge toksisitas ──────────────────────────────────────────
function getToxicityStyle(isToxic: boolean, label: string): string {
  // Pilih kelas CSS berdasarkan tingkat bahaya
  if (isToxic) {
    return "border-destructive text-destructive bg-destructive/10";
  }
  if (label.toLowerCase().includes("perhatian")) {
    return "border-amber-500 text-amber-600 bg-amber-500/10";
  }
  return "border-primary text-primary bg-primary/10";
}

// ─── Animasi: varian kartu muncul berurutan ───────────────────────────────────
// Framer Motion Variants — setiap kartu muncul dengan delay berbeda (stagger)
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  // "custom" menerima indeks kartu (i) untuk membuat delay bertahap
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: i * 0.08,               // Kartu ke-1 delay 0ms, ke-4 delay 320ms
      ease: "easeOut" as const,       // Typed as const agar cocok dengan Framer Motion Easing
    },
  }),
};

// ─── Komponen utama ──────────────────────────────────────────────────────────
export function AnalysisResultView({ result }: AnalysisResultProps) {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-5"
    >
      {/* ── Header seksi hasil ─────────────────────────────────────────────── */}
      <motion.div
        variants={cardVariants}
        custom={0}
        className="flex items-center gap-3 pb-2 border-b border-border/40"
      >
        <Fingerprint className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-base font-semibold text-foreground">
          Analysis Results
        </h2>
      </motion.div>

      {/* ── Grid 2 kolom di desktop, 1 kolom di mobile ─────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* ── Kartu 1: Status Toksisitas ──────────────────────────────────── */}
        <motion.div variants={cardVariants} custom={1}>
          <Card className="border-border/50 shadow-sm overflow-hidden flex flex-col h-full">
            {/* Header kartu */}
            <CardHeader className="pb-3 bg-muted/30 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5" />
                Toxicity Status
              </CardTitle>
              {/* Tombol salin hasil toksisitas */}
              <CopyButton
                text={`Status: ${result.toxicityLabel}\n${result.toxicitySummary}`}
                label="Status toksisitas"
              />
            </CardHeader>

            {/* Konten kartu */}
            <CardContent className="pt-5 flex-1 flex flex-col justify-center items-center text-center gap-3 pb-6">
              {/* Badge status berwarna */}
              <Badge
                variant="outline"
                className={cn(
                  "px-4 py-1.5 text-sm font-semibold border-2",
                  getToxicityStyle(result.isToxic, result.toxicityLabel)
                )}
              >
                {result.toxicityLabel}
              </Badge>

              {/* Penjelasan singkat */}
              <p className="text-sm text-foreground/75 leading-relaxed max-w-xs">
                {result.toxicitySummary}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Kartu 2: Profil Kepribadian ─────────────────────────────────── */}
        <motion.div variants={cardVariants} custom={2}>
          <Card className="border-border/50 shadow-sm flex flex-col h-full">
            {/* Header kartu */}
            <CardHeader className="pb-3 bg-muted/30 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <User className="w-3.5 h-3.5" />
                Personality Profile
              </CardTitle>
              {/* Tombol salin profil kepribadian */}
              <CopyButton
                text={`Tipe: ${result.personalityType} (${result.communicationStyle})\n${result.personalityDescription}`}
                label="Profil kepribadian"
              />
            </CardHeader>

            {/* Konten kartu */}
            <CardContent className="pt-5 flex-1 flex flex-col gap-3">
              {/* Tipe kepribadian + badge gaya komunikasi */}
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-xl font-bold text-foreground leading-tight">
                  {result.personalityType}
                </h3>
                <Badge
                  variant="secondary"
                  className="bg-secondary/60 hover:bg-secondary/60 text-xs shrink-0"
                >
                  {result.communicationStyle}
                </Badge>
              </div>

              {/* Deskripsi kepribadian */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {result.personalityDescription}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Kartu 3: Red Flag vs Green Flag ──────────────────────────────── */}
        <motion.div variants={cardVariants} custom={3} className="md:col-span-2">
          <Card className="border-border/50 shadow-sm">
            {/* Header kartu */}
            <CardHeader className="pb-3 border-b border-border/20 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Flag className="w-3.5 h-3.5" />
                Red Flag vs Green Flag Indicator
              </CardTitle>
              {/* Tombol salin skor flag */}
              <CopyButton
                text={`Red Flag: ${result.redFlagScore}%\nGreen Flag: ${result.greenFlagScore}%`}
                label="Skor flag"
              />
            </CardHeader>

            {/* Progress bar berdampingan */}
            <CardContent className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ── Red Flag progress bar ─────────────────────────────────── */}
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between items-end">
                  {/* Label kiri */}
                  <span className="text-xs font-medium flex items-center gap-1.5 text-destructive">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Red Flag Tendency
                  </span>
                  {/* Persentase kanan — bold dan besar */}
                  <span className="text-xl font-bold text-destructive tabular-nums">
                    {result.redFlagScore}%
                  </span>
                </div>
                {/* Progress bar merah */}
                <Progress
                  value={result.redFlagScore}
                  className="h-2.5 bg-destructive/10 [&>div]:bg-destructive"
                />
              </div>

              {/* ── Green Flag progress bar ───────────────────────────────── */}
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between items-end">
                  {/* Label kiri */}
                  <span className="text-xs font-medium flex items-center gap-1.5 text-primary">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Green Flag Tendency
                  </span>
                  {/* Persentase kanan */}
                  <span className="text-xl font-bold text-primary tabular-nums">
                    {result.greenFlagScore}%
                  </span>
                </div>
                {/* Progress bar hijau (mint) */}
                <Progress
                  value={result.greenFlagScore}
                  className="h-2.5 bg-primary/10 [&>div]:bg-primary"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Kartu 4: Mental Health Insight ───────────────────────────────── */}
        <motion.div variants={cardVariants} custom={4} className="md:col-span-2">
          <Card className="border-border/50 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50/30">
            <CardContent className="p-5 md:p-6 flex items-start gap-4">
              {/* Ikon bola lampu kuning */}
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <Lightbulb className="w-5 h-5 text-amber-600" />
              </div>

              {/* Teks insight + tombol salin */}
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-amber-900 text-sm">
                    Mental Health Insight
                  </h4>
                  {/* Tombol salin insight */}
                  <CopyButton
                    text={result.mentalHealthInsight}
                    label="Mental health insight"
                  />
                </div>
                {/* Saran untuk menghadapi tipe komunikasi ini */}
                <p className="text-amber-800/80 text-sm leading-relaxed">
                  {result.mentalHealthInsight}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.section>
  );
}

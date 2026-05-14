/**
 * home.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Halaman utama aplikasi CharacterAI.
 * Layout mirip ChatGPT/Gemini: sidebar gelap di kiri, area konten di kanan.
 *
 * Hierarki komponen:
 *   Home
 *   ├── AppSidebar        → navigasi sesi + profil (kiri, gelap)
 *   ├── ProfileModal      → modal profil Arifandi Tanggahma
 *   └── div.main-content  → area kerja utama (kanan, terang)
 *       ├── Header        → tombol burger + judul sesi + badge status
 *       ├── InputSection  → textarea + counter karakter + tombol analisis
 *       ├── LoadingSkeleton (ditampilkan saat API sedang diproses)
 *       └── AnalysisResultView (ditampilkan setelah analisis selesai)
 *
 * State management:
 *   - useSessions()     → semua data sesi (disimpan di localStorage)
 *   - useAnalyzeText()  → React Query mutation untuk POST /api/analyze
 *   - sidebarOpen       → boolean toggle buka/tutup sidebar
 *   - profileOpen       → boolean toggle modal profil
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,    // Ikon spinner & logo
  Search,      // Ikon tombol analisis
  Menu,        // Ikon burger untuk toggle sidebar
  Sparkles,    // Ikon dekoratif empty state
  AlertTriangle, // Ikon peringatan untuk status toxic
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

// ─── Import hook Orval-generated (jangan gunakan fetch manual) ────────────────
import { useAnalyzeText } from "@workspace/api-client-react";
import { AnalysisResult } from "@workspace/api-client-react";

// ─── Import komponen dan hook lokal ──────────────────────────────────────────
import { useSessions } from "@/hooks/use-sessions";
import { AppSidebar } from "@/components/app-sidebar";
import { ProfileModal } from "@/components/profile-modal";
import { AnalysisResultView } from "@/components/analysis-result";
import { cn } from "@/lib/utils"; // Utility untuk conditional className

// ─────────────────────────────────────────────────────────────────────────────
// Komponen utama halaman
// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {

  // ── State UI: apakah sidebar sedang terbuka ────────────────────────────────
  // Default: true (terbuka) di desktop, akan ditutup otomatis di mobile
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── State UI: apakah modal profil sedang terbuka ──────────────────────────
  const [profileOpen, setProfileOpen] = useState(false);

  // ── Hook session management ────────────────────────────────────────────────
  // Mengelola semua sesi analisis yang disimpan di localStorage
  const {
    sessions,           // Array semua sesi (untuk daftar di sidebar)
    activeSession,      // Objek sesi yang sedang dipilih/aktif
    activeSessionId,    // String ID sesi aktif
    setActiveSessionId, // Fungsi untuk pindah ke sesi lain
    createSession,      // Fungsi membuat sesi kosong baru
    deleteSession,      // Fungsi menghapus sesi berdasarkan ID
    updateSessionText,  // Fungsi update teks input di sesi aktif
    saveResult,         // Fungsi menyimpan hasil analisis ke sesi
  } = useSessions();

  // ── Toast untuk notifikasi error / success ────────────────────────────────
  const { toast } = useToast();

  // ── Mutation hook dari Orval ───────────────────────────────────────────────
  // Menghandle POST /api/analyze ke backend Express
  const analyzeMutation = useAnalyzeText();

  // ── Effect: buat sesi pertama otomatis jika belum ada ────────────────────
  // Dijalankan hanya sekali saat komponen pertama kali mount
  useEffect(() => {
    if (sessions.length === 0) {
      createSession(); // Buat sesi kosong agar UI tidak kosong
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependency kosong = hanya sekali saat mount

  // ── Effect: tutup sidebar otomatis di layar kecil (< 1024px) ─────────────
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false); // Mobile: sidebar overlay, default tertutup
      } else {
        setSidebarOpen(true);  // Desktop: sidebar selalu terbuka
      }
    }
    window.addEventListener("resize", handleResize);
    handleResize(); // Langsung cek saat mount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── Effect: reset state mutasi saat pindah ke sesi lain ───────────────────
  // Agar hasil sesi sebelumnya tidak tampil sebentar sebelum hasil baru muncul
  useEffect(() => {
    analyzeMutation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSessionId]); // Jalankan setiap kali sesi aktif berubah

  // ── Handler: buat sesi baru ────────────────────────────────────────────────
  const handleNewSession = useCallback(() => {
    createSession(); // Tambahkan sesi kosong ke daftar
    // Di mobile, tutup sidebar setelah membuat sesi agar tidak menghalangi konten
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, [createSession]);

  // ── Handler: pilih sesi dari daftar di sidebar ────────────────────────────
  const handleSelectSession = useCallback(
    (id: string) => {
      setActiveSessionId(id); // Pindah ke sesi yang dipilih
      analyzeMutation.reset(); // Hapus hasil mutasi lama dari state React Query
      // Tutup sidebar di mobile setelah memilih sesi
      if (window.innerWidth < 1024) setSidebarOpen(false);
    },
    [setActiveSessionId, analyzeMutation]
  );

  // ── Handler: perubahan teks di textarea ───────────────────────────────────
  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!activeSessionId) return; // Guard: jangan update jika tidak ada sesi aktif
      updateSessionText(activeSessionId, e.target.value);
    },
    [activeSessionId, updateSessionText]
  );

  // ── Handler: klik tombol "Analisis Karakter" ──────────────────────────────
  const handleAnalyze = useCallback(() => {
    // Validasi minimal 10 karakter agar prompt ke Gemini tidak terlalu pendek
    if (!activeSession || activeSession.text.length < 10) {
      toast({
        title: "Text is too short",
        description: "Enter at least 10 characters for accurate analysis.",
        variant: "destructive",
      });
      return;
    }

    // Kirim teks ke API via Orval mutation hook
    analyzeMutation.mutate(
      { data: { text: activeSession.text } },
      {
        onSuccess: (data) => {
          // Simpan hasil ke sesi aktif di localStorage agar persistent
          if (activeSessionId) {
            saveResult(activeSessionId, data as AnalysisResult);
          }
        },
        onError: (error) => {
          // Tampilkan pesan error dari API (atau fallback generic)
          toast({
            title: "Analysis Failed",
            description:
              (error as { error?: string })?.error ??
              "An error occurred. Check your Internet/API and try again..",
            variant: "destructive",
          });
        },
      }
    );
  }, [activeSession, activeSessionId, analyzeMutation, saveResult, toast]);

  // ── Derivasi: state loading dan data hasil ────────────────────────────────
  const isPending = analyzeMutation.isPending; // true saat API sedang diproses

  // Prioritas hasil: (1) hasil mutasi terbaru, (2) hasil tersimpan di sesi
  const result =
    (analyzeMutation.data as AnalysisResult | undefined) ??
    activeSession?.result ??
    null;

  // ── Derivasi: teks yang sedang di-input ───────────────────────────────────
  const currentText = activeSession?.text ?? "";

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER — Layout 2 panel: sidebar (kiri) + konten (kanan)
  // ─────────────────────────────────────────────────────────────────────────
  return (
    // Root container: flex row, full tinggi viewport, tidak bisa scroll di sini
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background font-sans text-foreground selection:bg-primary/20">

      {/* ── Panel 1: Sidebar ────────────────────────────────────────────────
          Komponen terpisah di app-sidebar.tsx.
          Menggunakan Framer Motion untuk animasi slide in/out.
          Di mobile: overlay (fixed). Di desktop: mendorong konten (relative).
      ──────────────────────────────────────────────────────────────────────── */}
      <AppSidebar
        open={sidebarOpen}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onClose={() => setSidebarOpen(false)}
        onNewSession={handleNewSession}
        onSelectSession={handleSelectSession}
        onDeleteSession={deleteSession}
        onOpenProfile={() => setProfileOpen(true)}
      />

      {/* ── Panel 2: Area konten utama ─────────────────────────────────────
          transition-all duration-300: animasi margin-left mengikuti sidebar.
          Di desktop: ml-[280px] saat sidebar buka, ml-0 saat tutup.
          Di mobile: selalu ml-0 (sidebar overlay, tidak mendorong konten).
      ──────────────────────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "flex-1 flex flex-col overflow-hidden transition-all duration-300",
          sidebarOpen ? "lg:ml-[280px]" : "lg:ml-0"
        )}
      >

        {/* ── Header bar ──────────────────────────────────────────────────
            Sticky di atas, berisi: burger toggle, logo, judul sesi, badge status.
        ──────────────────────────────────────────────────────────────────── */}
        <header className="flex items-center gap-3 px-4 h-14 border-b border-border/40 bg-card/80 backdrop-blur-sm sticky top-0 z-10 shrink-0">

          {/* Tombol burger — toggle buka/tutup sidebar */}
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg shrink-0"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
            data-testid="button-toggle-sidebar"
          >
            <Menu className="w-4 h-4" />
          </Button>

          {/* Logo mini di header */}
          <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center shrink-0">
            <Activity className="w-3.5 h-3.5 text-primary" />
          </div>

          {/* Judul sesi aktif — terpotong jika terlalu panjang */}
          <span className="text-sm font-medium text-foreground truncate flex-1 min-w-0">
            {activeSession?.title && activeSession.title !== "New Session"
              ? activeSession.title  // Tampilkan judul otomatis dari teks
              : "MindGuardAI"        // Fallback: nama app jika sesi masih kosong
            }
          </span>

          {/* Badge status analisis — hanya muncul jika ada hasil, dan di layar sm+ */}
          {result && (
            <div
              className={cn(
                "hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border shrink-0",
                // Merah jika toxic, hijau jika aman
                result.isToxic
                  ? "text-destructive border-destructive/30 bg-destructive/5"
                  : "text-primary border-primary/30 bg-primary/5"
              )}
              data-testid="status-toxicity-badge"
            >
              {result.isToxic ? (
                <AlertTriangle className="w-3 h-3" />  // Ikon peringatan merah
              ) : (
                <Sparkles className="w-3 h-3" />       // Ikon sparkle hijau
              )}
              {result.toxicityLabel}
            </div>
          )}
        </header>

        {/* ── Area konten yang bisa di-scroll ─────────────────────────────
            Semua konten di bawah header ada di sini.
            overflow-y-auto: scroll vertikal jika konten lebih panjang dari layar.
        ──────────────────────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          {/* Pembungkus dengan max-width dan padding responsif */}
          <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-8">

            {/* ── Seksi input teks ──────────────────────────────────────────
                Judul halaman (hanya muncul jika belum ada hasil) + textarea + tombol.
            ──────────────────────────────────────────────────────────────── */}
            <section className="flex flex-col gap-5" aria-label="Input text analysis">

              {/* Judul dan deskripsi — disembunyikan saat ada hasil untuk menghemat ruang */}
              <AnimatePresence>
                {!result && !isPending && (
                  <motion.div
                    key="intro"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col gap-1.5 overflow-hidden"
                  >
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                      Character Forensics
                    </h1>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                      Paste someone's conversation, 
                      message, or typing — AI will analyze their psychological profile, 
                      communication style, and red flags.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Textarea wrapper dengan efek glow ──────────────────────
                  Efek glow hijau muncul di belakang textarea saat hover/fokus.
              ──────────────────────────────────────────────────────────────── */}
              <div className="relative group">
                {/* Layer glow: div kosong dengan blur besar, ada di belakang textarea */}
                <div className="absolute inset-0 bg-primary/5 rounded-xl blur-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Textarea utama */}
                <Textarea
                  placeholder="Paste someone's conversation or typing here..."
                  className="
                    min-h-[180px] sm:min-h-[200px] resize-y
                    text-sm sm:text-base leading-relaxed
                    p-4 sm:p-5 rounded-xl
                    border-border/50
                    shadow-sm
                    focus-visible:ring-primary/25
                    focus-visible:border-primary/40
                    bg-card relative z-10
                    transition-all duration-200
                  "
                  value={currentText}
                  onChange={handleTextChange}
                  disabled={isPending}   // Kunci textarea saat API sedang diproses
                  data-testid="input-text-analysis"
                  aria-label="Text to be analyzed"
                />
              </div>

              {/* ── Footer textarea: counter karakter + tombol analisis ──── */}
              <div className="flex items-center justify-between gap-4">

                {/* Counter karakter — warna berubah sesuai panjang */}
                <span
                  className={cn(
                    "text-xs font-medium tabular-nums select-none",
                    currentText.length === 0
                      ? "text-muted-foreground/40"      // Abu sangat pucat jika kosong
                      : currentText.length < 10
                      ? "text-amber-500"                 // Kuning jika kurang dari minimum
                      : "text-muted-foreground"          // Abu normal jika sudah cukup
                  )}
                  data-testid="text-char-count"
                >
                  {currentText.length} character
                  {/* Hint tambahan jika teks ada tapi masih kurang */}
                  {currentText.length > 0 && currentText.length < 10 && (
                    <span className="ml-1 opacity-70">(min. 10)</span>
                  )}
                </span>

                {/* Tombol "Analisis Karakter" */}
                <Button
                  onClick={handleAnalyze}
                  disabled={
                    isPending ||          // Disabled saat loading
                    currentText.length < 10  // Disabled jika teks terlalu pendek
                  }
                  className="h-10 px-6 rounded-full shadow-sm hover:shadow-md transition-all duration-200 font-medium text-sm group shrink-0"
                  data-testid="button-analyze"
                  aria-label="Start character analysis"
                >
                  {isPending ? (
                    // State loading: spinner berputar
                    <span className="flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 animate-spin" />
                      Analyzing...
                    </span>
                  ) : (
                    // State normal: ikon search + teks
                    <span className="flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                      Character Analysis
                    </span>
                  )}
                </Button>
              </div>
            </section>

            {/* ── Skeleton loading state ────────────────────────────────────
                Ditampilkan saat API sedang memproses (isPending = true).
                AnimatePresence memastikan animasi fade-out saat hilang.
            ──────────────────────────────────────────────────────────────── */}
            <AnimatePresence>
              {isPending && (
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-5"
                  aria-live="polite"
                  aria-label="Analyzing..."
                >
                  {/* Label proses dengan ikon berkedip */}
                  <div className="flex items-center gap-2 text-primary text-sm font-medium">
                    <Activity className="w-4 h-4 animate-pulse" />
                    MindGuard AI is analyzing the psychology of text...
                  </div>

                  {/* Placeholder kartu berbentuk abu-abu berkedip */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-36 rounded-xl" />          {/* Kartu toksisitas */}
                    <Skeleton className="h-36 rounded-xl" />          {/* Kartu kepribadian */}
                    <Skeleton className="h-24 rounded-xl md:col-span-2" />  {/* Kartu flag meter */}
                    <Skeleton className="h-20 rounded-xl md:col-span-2" />  {/* Kartu insight */}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Dashboard hasil analisis ──────────────────────────────────
                AnalysisResultView menampilkan 4 kartu hasil dari Gemini AI.
                Key berubah saat activeSessionId berubah → komponen di-remount
                → animasi muncul ulang untuk setiap sesi yang berbeda.
            ──────────────────────────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
              {!isPending && result && (
                <AnalysisResultView
                  key={activeSessionId ?? "result"}  // Re-animasi saat ganti sesi
                  result={result}
                />
              )}
            </AnimatePresence>

            {/* ── Empty state ───────────────────────────────────────────────
                Muncul jika belum ada hasil dan tidak sedang loading.
                Memberikan petunjuk kepada pengguna apa yang harus dilakukan.
            ──────────────────────────────────────────────────────────────── */}
            {!isPending && !result && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex flex-col items-center gap-3 py-8 text-center"
                aria-label="Instructions for use"
              >
                {/* Lingkaran dekoratif dengan ikon */}
                <div className="w-12 h-12 rounded-2xl bg-muted/80 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-muted-foreground/40" />
                </div>
                {/* Teks petunjuk */}
                <p className="text-sm text-muted-foreground/60 max-w-xs leading-relaxed">
                  Paste the text above, then click{" "}
                  <span className="font-medium text-foreground/50">
                    Character Analysis
                  </span>{" "}
                  to gain deep psychological insights from MindGuard AI.
                </p>
              </motion.div>
            )}

          </div>
        </main>
      </div>

      {/* ── Modal profil Arifandi Tanggahma ─────────────────────────────────
          Komponen terpisah di profile-modal.tsx.
          Terbuka saat pengguna klik tombol profil di footer sidebar.
      ──────────────────────────────────────────────────────────────────────── */}
      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </div>
  );
}

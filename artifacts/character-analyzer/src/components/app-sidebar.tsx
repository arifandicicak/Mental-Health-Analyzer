/**
 * app-sidebar.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Sidebar navigasi utama mirip ChatGPT/Gemini.
 * Berisi:
 *  - Tombol burger (toggle buka/tutup sidebar)
 *  - Logo dan nama aplikasi
 *  - Tombol "Sesi Baru"
 *  - Daftar semua sesi (bisa diklik & dihapus)
 *  - Tombol profil pengguna di bagian bawah
 *
 * Sidebar menggunakan animasi Framer Motion untuk slide in/out.
 * Di mobile, sidebar overlay dan menutup saat klik backdrop.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Activity,
  User,
  MessageSquare,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Session } from "@/hooks/use-sessions";
import { cn } from "@/lib/utils";

// ─── Props komponen ──────────────────────────────────────────────────────────
interface AppSidebarProps {
  open: boolean;                              // Apakah sidebar terbuka
  sessions: Session[];                        // Semua sesi dari hook useSessions
  activeSessionId: string | null;             // ID sesi yang sedang aktif
  onClose: () => void;                        // Tutup sidebar (mobile)
  onNewSession: () => void;                   // Buat sesi baru
  onSelectSession: (id: string) => void;      // Pilih sesi dari daftar
  onDeleteSession: (id: string) => void;      // Hapus satu sesi
  onOpenProfile: () => void;                  // Buka modal profil
}

// ─── Format timestamp ke teks relatif ────────────────────────────────────────
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  // Kembalikan teks yang mudah dibaca manusia
  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay === 1) return "Kemarin";
  return `${diffDay} hari lalu`;
}

// ─── Komponen utama ──────────────────────────────────────────────────────────
export function AppSidebar({
  open,
  sessions,
  activeSessionId,
  onClose,
  onNewSession,
  onSelectSession,
  onDeleteSession,
  onOpenProfile,
}: AppSidebarProps) {

  // ─── Handler hapus sesi dengan konfirmasi ──────────────────────────────────
  const handleDelete = useCallback(
    (e: React.MouseEvent, sessionId: string) => {
      e.stopPropagation(); // Cegah event klik item sesi ikut terpanggil
      onDeleteSession(sessionId);
    },
    [onDeleteSession]
  );

  return (
    <>
      {/* ── Backdrop overlay (mobile only) ─────────────────────────────────
          Muncul di belakang sidebar saat sidebar terbuka di layar kecil.
          Klik backdrop = tutup sidebar.
      ──────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="
              fixed inset-0 z-20        /* menutupi seluruh layar */
              bg-black/40               /* semi-transparan */
              backdrop-blur-sm          /* blur konten di belakang */
              lg:hidden                 /* hanya muncul di mobile (<lg) */
            "
            onClick={onClose}           /* klik backdrop = tutup */
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* ── Panel sidebar ──────────────────────────────────────────────────
          Menggunakan translate-x untuk slide in/out dengan animasi Framer Motion.
          Di desktop (lg+) sidebar selalu terlihat — hanya mengubah lebar.
      ──────────────────────────────────────────────────────────────────── */}
      <motion.aside
        initial={false}
        animate={{
          // Slide out ke kiri saat tertutup, slide in saat terbuka
          x: open ? 0 : "-100%",
          width: open ? 280 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className="
          fixed top-0 left-0           /* posisi absolut dari pojok kiri atas */
          h-full z-30                  /* full tinggi, layer di atas konten */
          flex flex-col                /* layout kolom vertikal */
          bg-[#111318]                 /* latar gelap seperti ChatGPT */
          border-r border-white/5      /* garis pemisah tipis di kanan */
          overflow-hidden              /* potong konten saat animasi lebar */
          shadow-2xl                   /* bayangan tebal */
        "
        aria-label="Sidebar Navigasi"
      >
        {/* ── Header sidebar ─────────────────────────────────────────────
            Logo + nama app + tombol tutup (mobile)
        ──────────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
          {/* Logo dan nama */}
          <div className="flex items-center gap-2">
            {/* Kotak ikon hijau */}
            <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-white text-sm tracking-tight">
              CharacterAI
            </span>
          </div>

          {/* Tombol X untuk menutup sidebar di mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-white/40 hover:text-white hover:bg-white/10 lg:hidden"
            onClick={onClose}
            aria-label="Tutup sidebar"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* ── Tombol "Sesi Baru" ─────────────────────────────────────────
            Muncul di bawah header, klik untuk membuat sesi kosong baru.
        ──────────────────────────────────────────────────────────────── */}
        <div className="px-3 py-3">
          <Button
            onClick={onNewSession}
            className="
              w-full justify-start gap-2   /* full lebar, konten rata kiri */
              bg-white/8                   /* latar tipis */
              hover:bg-white/14            /* lebih terang saat hover */
              text-white/80 hover:text-white
              border border-white/10       /* border tipis */
              rounded-xl h-10 text-sm
              transition-all duration-150
            "
            variant="ghost"
            data-testid="button-new-session"
          >
            <Plus className="w-4 h-4" />  {/* ikon plus */}
            Sesi Baru
          </Button>
        </div>

        {/* ── Daftar sesi ────────────────────────────────────────────────
            Scroll secara vertikal jika sesi terlalu banyak.
            Setiap item menampilkan judul dan waktu relatif.
        ──────────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-2 pb-2 scrollbar-thin">
          {sessions.length === 0 ? (
            // Tampilkan pesan kosong jika belum ada sesi
            <div className="flex flex-col items-center justify-center h-32 gap-2 text-white/25">
              <MessageSquare className="w-8 h-8" />
              <p className="text-xs">Belum ada sesi</p>
            </div>
          ) : (
            /* Render setiap sesi sebagai item yang bisa diklik */
            sessions.map((session) => {
              // Apakah sesi ini yang sedang aktif?
              const isActive = session.id === activeSessionId;

              return (
                <div
                  key={session.id}
                  className={cn(
                    /* Base style item sesi */
                    "group relative flex items-start gap-2 px-3 py-2.5 rounded-xl mb-1",
                    "cursor-pointer transition-all duration-150",
                    /* Aktif = latar lebih terang dan border primary */
                    isActive
                      ? "bg-primary/15 border border-primary/20"
                      : "hover:bg-white/6 border border-transparent"
                  )}
                  onClick={() => onSelectSession(session.id)}
                  data-testid={`session-item-${session.id}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && onSelectSession(session.id)}
                  aria-selected={isActive}
                >
                  {/* Ikon percakapan */}
                  <MessageSquare
                    className={cn(
                      "w-3.5 h-3.5 mt-0.5 shrink-0",
                      isActive ? "text-primary" : "text-white/30"
                    )}
                  />

                  {/* Teks judul & waktu */}
                  <div className="flex-1 min-w-0 pr-6">
                    {/* Judul sesi — terpotong jika terlalu panjang */}
                    <p
                      className={cn(
                        "text-xs font-medium leading-snug truncate",
                        isActive ? "text-white" : "text-white/60"
                      )}
                    >
                      {session.title}
                    </p>
                    {/* Waktu relatif */}
                    <p className="text-[10px] text-white/25 mt-0.5">
                      {formatRelativeTime(session.createdAt)}
                    </p>
                  </div>

                  {/* Tombol hapus sesi — hanya muncul saat hover */}
                  <button
                    className="
                      absolute right-2 top-2.5
                      opacity-0 group-hover:opacity-100  /* muncul saat hover */
                      w-6 h-6 rounded-md
                      flex items-center justify-center
                      text-white/30 hover:text-red-400
                      hover:bg-red-400/10
                      transition-all duration-150
                    "
                    onClick={(e) => handleDelete(e, session.id)}
                    aria-label={`Hapus sesi: ${session.title}`}
                    data-testid={`button-delete-session-${session.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* ── Footer sidebar: tombol profil ─────────────────────────────
            Selalu di bawah sidebar. Klik untuk membuka modal profil.
        ──────────────────────────────────────────────────────────────── */}
        <div className="px-3 py-3 border-t border-white/5">
          <button
            onClick={onOpenProfile}
            className="
              w-full flex items-center gap-3
              px-3 py-2.5 rounded-xl
              hover:bg-white/8
              transition-colors duration-150
              group
            "
            data-testid="button-open-profile"
            aria-label="Buka profil Arifandi Tanggahma"
          >
            {/* Avatar inisial */}
            <div
              className="
                w-8 h-8 rounded-lg shrink-0
                bg-gradient-to-br from-primary/60 to-primary/30
                flex items-center justify-center
                text-white text-xs font-bold
              "
            >
              AT
            </div>

            {/* Nama dan role */}
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-medium text-white/80 truncate group-hover:text-white transition-colors">
                Arifandi Tanggahma
              </p>
              <p className="text-[10px] text-white/30 truncate">
                @jangrik · Developer
              </p>
            </div>

            {/* Ikon user kecil di kanan */}
            <User className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
          </button>
        </div>
      </motion.aside>
    </>
  );
}

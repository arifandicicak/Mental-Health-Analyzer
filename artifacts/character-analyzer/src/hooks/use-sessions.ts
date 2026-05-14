/**
 * use-sessions.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Custom React hook yang mengelola semua sesi analisis.
 * Data disimpan di localStorage sehingga tetap ada setelah refresh halaman.
 *
 * Struktur satu sesi (Session):
 *   id         → string unik berbasis timestamp + random
 *   title      → 50 karakter pertama dari teks yang dianalisis
 *   text       → teks lengkap yang diinput pengguna
 *   result     → hasil analisis dari Gemini AI (atau null jika belum dianalisis)
 *   createdAt  → Unix timestamp (ms) untuk urutan tampil di sidebar
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useCallback, useEffect } from "react";
import { AnalysisResult } from "@workspace/api-client-react";

// ─── Tipe data satu sesi ─────────────────────────────────────────────────────
export interface Session {
  id: string;
  title: string;
  text: string;
  result: AnalysisResult | null;
  createdAt: number;
}

// ─── Konstanta localStorage key ──────────────────────────────────────────────
const STORAGE_KEY = "characterai_sessions";

// ─── Helper: baca semua sesi dari localStorage ───────────────────────────────
function loadSessions(): Session[] {
  try {
    // Ambil string JSON dari storage, parse ke array
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Session[];
  } catch {
    // Jika corrupt/error, kembalikan array kosong
    return [];
  }
}

// ─── Helper: simpan semua sesi ke localStorage ───────────────────────────────
function saveSessions(sessions: Session[]): void {
  // Serialisasi array ke JSON string lalu simpan
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

// ─── Helper: buat ID unik untuk sesi baru ────────────────────────────────────
function generateId(): string {
  // Gabungkan timestamp + angka acak untuk menghindari tabrakan
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Helper: buat judul otomatis dari teks input ─────────────────────────────
function generateTitle(text: string): string {
  // Ambil 55 karakter pertama, hapus newline, tambahkan "..." jika kepotong
  const clean = text.replace(/\n/g, " ").trim();
  return clean.length > 55 ? clean.slice(0, 52) + "..." : clean;
}

// ─── Hook utama ──────────────────────────────────────────────────────────────
export function useSessions() {
  // State array semua sesi, diinisialisasi dari localStorage
  const [sessions, setSessions] = useState<Session[]>(() => loadSessions());

  // ID sesi yang sedang aktif/dipilih di sidebar
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    () => {
      // Pilih sesi pertama (terbaru) sebagai default jika ada
      const saved = loadSessions();
      return saved.length > 0 ? saved[0].id : null;
    }
  );

  // Sinkronkan perubahan state ke localStorage setiap kali sessions berubah
  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  // ─── Buat sesi baru yang kosong ────────────────────────────────────────────
  const createSession = useCallback((): string => {
    const newSession: Session = {
      id: generateId(),           // ID unik
      title: "Sesi Baru",         // Judul default sebelum ada teks
      text: "",                   // Input teks kosong
      result: null,               // Belum ada hasil analisis
      createdAt: Date.now(),      // Waktu sekarang
    };

    // Tambahkan sesi baru di awal array (paling atas di sidebar)
    setSessions((prev) => [newSession, ...prev]);
    // Langsung aktifkan sesi baru
    setActiveSessionId(newSession.id);

    return newSession.id;
  }, []);

  // ─── Hapus sesi berdasarkan ID ─────────────────────────────────────────────
  const deleteSession = useCallback(
    (sessionId: string): void => {
      setSessions((prev) => {
        const remaining = prev.filter((s) => s.id !== sessionId);

        // Jika sesi yang dihapus adalah yang aktif, pindah ke sesi lain
        if (activeSessionId === sessionId) {
          // Pilih sesi pertama yang tersisa, atau null jika tidak ada
          const next = remaining.length > 0 ? remaining[0].id : null;
          setActiveSessionId(next);
        }

        return remaining;
      });
    },
    [activeSessionId]
  );

  // ─── Update teks input pada sesi aktif ────────────────────────────────────
  const updateSessionText = useCallback(
    (sessionId: string, text: string): void => {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                text,
                // Update judul otomatis dari teks (kecuali masih kosong)
                title: text.trim().length > 0 ? generateTitle(text) : "Sesi Baru",
              }
            : s
        )
      );
    },
    []
  );

  // ─── Simpan hasil analisis ke sesi tertentu ────────────────────────────────
  const saveResult = useCallback(
    (sessionId: string, result: AnalysisResult): void => {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, result } // Hanya update field result
            : s
        )
      );
    },
    []
  );

  // ─── Ambil objek sesi yang sedang aktif ───────────────────────────────────
  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;

  return {
    sessions,           // Semua sesi (untuk ditampilkan di sidebar)
    activeSession,      // Sesi yang sedang dipilih
    activeSessionId,    // ID sesi aktif
    setActiveSessionId, // Pindah ke sesi lain
    createSession,      // Buat sesi baru
    deleteSession,      // Hapus sesi
    updateSessionText,  // Update teks input
    saveResult,         // Simpan hasil AI
  };
}

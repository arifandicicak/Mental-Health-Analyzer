/**
 * profile-modal.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Modal profil pemilik aplikasi: Arifandi Tanggahma (jangrik).
 * Menampilkan foto, bio singkat, daftar sertifikat, dan proyek yang telah dibuat.
 *
 * Komponen ini menggunakan Radix UI Dialog (shadcn) agar accessible dan responsive.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Award,
  Briefcase,
  Github,
  Globe,
  MapPin,
  Code2,
  Brain,
  Shield,
  Database,
  Smartphone,
} from "lucide-react";

// ─── Props komponen ──────────────────────────────────────────────────────────
interface ProfileModalProps {
  open: boolean;       // Apakah modal ditampilkan
  onClose: () => void; // Callback saat modal ditutup
}

// ─── Data sertifikat ─────────────────────────────────────────────────────────
const certificates = [
  {
    title: "Ai Engineer Certificate",
    issuer: "Dicoding Indonesia",
    year: "2025",
    icon: Shield,
  },
  {
    title: "Deep Learning Fundamental",
    issuer: "Dicoding Indonesia",
    year: "2025",
    icon: Code2,
  },
  {
    title: "Machine Learning Fundamentals",
    issuer: "Dicoding Indonesia",
    year: "2024",
    icon: Brain,
  },
  {
    title: "AI Development with Python",
    issuer: "Dicoding Indonesia",
    year: "2025",
    icon: Database,
  },
  {
    title: "Android Developer",
    issuer: "Autodidak",
    year: "2025",
    icon: Smartphone,
  },
];

// ─── Data proyek ─────────────────────────────────────────────────────────────
const projects = [
  {
    name: "MindGuard AI",
    description:
      "Aplikasi web analisis karakter & kesehatan mental berbasis Gemini AI. Mendeteksi toxicity, profil kepribadian, dan red/green flags dari teks percakapan.",
    stack: ["React", "TypeScript", "Gemini AI", "Express"],
    status: "Live",
  },
  {
    name: "Jangkrik AI",
    description:
      "Platform chat real-time with Ai, Arifandi Tanggahma Portfolio, and introducing to Arifandi.",
    stack: ["Next.js", "TypeScript", "CSS", "Gemini AI"],
    status: "Development",
  },
  {
    name: "Mala",
    description:
      "Game mobile genre action platformer 2D developed with GODOT ENGINE in SmartPhone",
    stack: ["Python", "GDScript", "C#"],
    status: "Finished",
  },
  {
    name: "ClassWeb",
    description:
      "A private class website created for class member introductions, class duty schedules.",
    stack: ["Vue.js", "D3.js", "Node.js", "MongoDB"],
    status: "Finished",
  },
];

// ─── Warna badge status proyek ───────────────────────────────────────────────
function getStatusColor(status: string): string {
  // Mengembalikan class Tailwind sesuai status proyek
  switch (status) {
    case "Live":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "Development":
      return "bg-blue-100 text-blue-700 border-blue-200";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

// ─── Komponen utama ──────────────────────────────────────────────────────────
export function ProfileModal({ open, onClose }: ProfileModalProps) {
  return (
    // Dialog dari shadcn/ui — accessible, menutup saat klik backdrop
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="
          max-w-2xl                    /* lebar maksimum modal */
          max-h-[90vh]                 /* tinggi maksimum 90% viewport */
          overflow-y-auto              /* scroll vertikal jika konten panjang */
          p-0                          /* hapus padding default, kita atur manual */
          rounded-2xl                  /* sudut bulat */
          border-border/60             /* border tipis */
          shadow-2xl                   /* bayangan tebal agar terasa mengambang */
        "
      >
        {/* ── Header bergradient ─────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/20 p-8 pb-6">
          {/* Pola dekoratif lingkaran di sudut kanan atas */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

          {/* Avatar + info utama */}
          <div className="flex items-start gap-6 relative">
            {/* Avatar placeholder berbentuk lingkaran dengan inisial */}
            <div
              className="
                w-20 h-20               /* ukuran 80x80 */
                rounded-2xl             /* sudut bulat */
                bg-gradient-to-br from-primary to-primary/60
                flex items-center justify-center
                text-white text-2xl font-bold
                shadow-lg shadow-primary/30
                shrink-0                /* jangan menyusut di flexbox */
              "
              aria-label="Avatar Arifandi Tanggahma"
            >
              AT
            </div>

            {/* Nama, alias, dan lokasi */}
            <div className="flex flex-col gap-1 pt-1">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-foreground tracking-tight">
                  Arifandi Tanggahma
                </DialogTitle>
              </DialogHeader>

              {/* Alias / username */}
              <p className="text-primary font-medium text-sm">@jangrik</p>

              {/* Lokasi */}
              <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Fak-Fak, Papua Barat, Indonesia</span>
              </div>

              {/* Bio singkat */}
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed max-w-sm">
                Jangkrik or Arifandi Tanggahma is an ordinary school kid in SMA NEGERI 1 FAKFAK who really likes coding, 
                interested in coding, Arifandi Tanggahma create websites, 
                Ai and games just with a smartphone, 
                Arif has made his own game: Indie Game Titled Mala on itch.io , 
                class website, and get various certificates from dicoding, AI Enthusiast, 
                Arifandi Tanggahma is proof that the greatest power comes from the brain, not from the tools you have.
              </p>

              {/* Link eksternal */}
              <div className="flex gap-3 mt-3">
                <a
                  href="https://github.com/jangrik"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  GitHub
                </a>
                <a
                  href="#"
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  Portfolio
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── Konten utama ───────────────────────────────────────────────── */}
        <div className="px-8 py-6 flex flex-col gap-8">

          {/* ── Seksi Sertifikat ─────────────────────────────────────────── */}
          <section>
            {/* Judul seksi */}
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Certificate</h3>
            </div>

            {/* Daftar sertifikat */}
            <div className="flex flex-col gap-3">
              {certificates.map((cert, idx) => {
                // Render ikon yang sesuai tiap sertifikat
                const Icon = cert.icon;
                return (
                  <div
                    key={idx}
                    className="
                      flex items-start gap-3
                      p-3 rounded-xl
                      border border-border/50
                      bg-muted/30
                      hover:bg-muted/50
                      transition-colors
                    "
                  >
                    {/* Ikon sertifikat */}
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>

                    {/* Detail sertifikat */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground leading-snug">
                        {cert.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {cert.issuer} · {cert.year}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <Separator className="opacity-50" />

          {/* ── Seksi Proyek ─────────────────────────────────────────────── */}
          <section>
            {/* Judul seksi */}
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Project</h3>
            </div>

            {/* Grid proyek — 1 kolom di mobile, 2 di desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {projects.map((project, idx) => (
                <div
                  key={idx}
                  className="
                    flex flex-col gap-3
                    p-4 rounded-xl
                    border border-border/50
                    bg-card
                    hover:border-primary/30
                    hover:shadow-sm
                    transition-all
                  "
                >
                  {/* Nama proyek + badge status */}
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-foreground text-sm">
                      {project.name}
                    </h4>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border font-medium whitespace-nowrap ${getStatusColor(project.status)}`}
                    >
                      {project.status}
                    </span>
                  </div>

                  {/* Deskripsi proyek */}
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>

                  {/* Tech stack sebagai badge-badge kecil */}
                  <div className="flex flex-wrap gap-1">
                    {project.stack.map((tech) => (
                      <Badge
                        key={tech}
                        variant="secondary"
                        className="text-xs px-2 py-0 h-5 bg-muted/80"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Footer modal ─────────────────────────────────────────────── */}
          <div className="text-center text-xs text-muted-foreground pb-2">
            © 2026 Developed With Heart by Arifandi Tanggahma. powered by Gemini AI
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

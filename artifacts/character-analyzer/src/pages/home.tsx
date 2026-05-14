import { useState } from "react";
import { useAnalyzeText } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ShieldAlert, Heart, Lightbulb, User, Search, Fingerprint, Flag, CheckCircle } from "lucide-react";
import { AnalysisResult } from "@workspace/api-client-react/src/generated/api.schemas";

export default function Home() {
  const [text, setText] = useState("");
  const { toast } = useToast();
  
  const analyzeMutation = useAnalyzeText();

  const handleAnalyze = () => {
    if (text.length < 10) {
      toast({
        title: "Teks terlalu pendek",
        description: "Masukkan setidaknya 10 karakter untuk analisis yang akurat.",
        variant: "destructive",
      });
      return;
    }

    analyzeMutation.mutate(
      { data: { text } },
      {
        onError: (error) => {
          toast({
            title: "Analysis Failed",
            description: error?.error || "An unexpected error occurred",
            variant: "destructive",
          });
        },
      }
    );
  };

  const isPending = analyzeMutation.isPending;
  const result = analyzeMutation.data as AnalysisResult | undefined;

  return (
    <div className="min-h-[100dvh] w-full bg-background font-sans text-foreground selection:bg-primary/20">
      <header className="w-full border-b border-border/40 bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Activity className="w-5 h-5" />
            </div>
            <span className="font-semibold text-lg tracking-tight">CharacterAI</span>
          </div>
          <span className="text-sm text-muted-foreground hidden sm:inline-flex">
            Membaca di antara baris kata.
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 flex flex-col gap-12">
        
        {/* Input Section */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
              Forensik Karakter
            </h1>
            <p className="text-muted-foreground text-lg">
              Paste percakapan, email, atau ketikan seseorang. Kami akan menganalisis profil psikologis, gaya komunikasi, dan red flags.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/5 rounded-xl blur-xl transition-all duration-500 group-hover:bg-primary/10 opacity-0 group-hover:opacity-100" />
              <Textarea
                placeholder="Paste percakapan atau ketikan seseorang di sini..."
                className="min-h-[240px] resize-y text-base p-6 rounded-xl border-border/50 shadow-sm focus-visible:ring-primary/30 focus-visible:border-primary/50 transition-all bg-card relative z-10"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">
                {text.length} characters
              </span>
              <Button 
                onClick={handleAnalyze} 
                disabled={isPending || text.length === 0}
                className="h-12 px-8 rounded-full shadow-sm hover:shadow-md transition-all group"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Activity className="w-4 h-4 animate-spin" />
                    Menganalisis...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Analisis Karakter
                  </span>
                )}
              </Button>
            </div>
          </div>
        </section>

        {/* Loading State */}
        <AnimatePresence>
          {isPending && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col gap-6"
            >
              <div className="flex items-center gap-4 text-primary font-medium">
                <Activity className="w-5 h-5 animate-pulse" />
                <span>Memproses profil psikologis...</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-40 rounded-xl" />
                <Skeleton className="h-40 rounded-xl" />
                <Skeleton className="h-32 rounded-xl md:col-span-2" />
                <Skeleton className="h-32 rounded-xl md:col-span-2" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Dashboard */}
        <AnimatePresence>
          {!isPending && result && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-6"
            >
              <div className="flex items-center gap-3 pb-2 border-b border-border/40">
                <Fingerprint className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold text-foreground">Hasil Analisis</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Toxicity Status */}
                <Card className="border-border/50 shadow-sm overflow-hidden flex flex-col">
                  <CardHeader className="pb-4 bg-muted/30">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" />
                      Status Toksisitas & Bullying
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 flex-1 flex flex-col justify-center items-center text-center gap-4">
                    <Badge 
                      variant="outline" 
                      className={`px-4 py-1.5 text-base border-2 ${
                        result.isToxic 
                          ? 'border-destructive text-destructive bg-destructive/10' 
                          : result.toxicityLabel.toLowerCase().includes('perhatian') 
                            ? 'border-amber-500 text-amber-600 bg-amber-500/10'
                            : 'border-primary text-primary bg-primary/10'
                      }`}
                    >
                      {result.toxicityLabel}
                    </Badge>
                    <p className="text-sm text-foreground/80 leading-relaxed max-w-sm">
                      {result.toxicitySummary}
                    </p>
                  </CardContent>
                </Card>

                {/* Personality Profile */}
                <Card className="border-border/50 shadow-sm flex flex-col">
                  <CardHeader className="pb-4 bg-muted/30">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Profil Kepribadian
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 flex-1 flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-2xl font-bold text-foreground">
                        {result.personalityType}
                      </h3>
                      <Badge variant="secondary" className="bg-secondary/50 hover:bg-secondary/50">
                        {result.communicationStyle}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {result.personalityDescription}
                    </p>
                  </CardContent>
                </Card>

                {/* Flags */}
                <Card className="border-border/50 shadow-sm md:col-span-2">
                  <CardHeader className="pb-4 border-b border-border/20">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Flag className="w-4 h-4" />
                      Red Flag vs Green Flag Indikator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-end">
                        <span className="text-sm font-medium flex items-center gap-2 text-destructive">
                          <ShieldAlert className="w-4 h-4" />
                          Red Flag Tendency
                        </span>
                        <span className="text-2xl font-bold text-destructive">
                          {result.redFlagScore}%
                        </span>
                      </div>
                      <Progress value={result.redFlagScore} className="h-2.5 bg-destructive/10 [&>div]:bg-destructive" />
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-end">
                        <span className="text-sm font-medium flex items-center gap-2 text-primary">
                          <CheckCircle className="w-4 h-4" />
                          Green Flag Tendency
                        </span>
                        <span className="text-2xl font-bold text-primary">
                          {result.greenFlagScore}%
                        </span>
                      </div>
                      <Progress value={result.greenFlagScore} className="h-2.5 bg-primary/10 [&>div]:bg-primary" />
                    </div>
                  </CardContent>
                </Card>

                {/* Mental Health Insight */}
                <Card className="border-border/50 shadow-sm md:col-span-2 bg-gradient-to-br from-amber-50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10">
                  <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
                      <Lightbulb className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <h4 className="font-semibold text-amber-900 dark:text-amber-300">
                        Mental Health & Interaction Insight
                      </h4>
                      <p className="text-amber-800/80 dark:text-amber-200/70 text-sm md:text-base leading-relaxed">
                        {result.mentalHealthInsight}
                      </p>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </motion.section>
          )}
        </AnimatePresence>
        
      </main>
    </div>
  );
}
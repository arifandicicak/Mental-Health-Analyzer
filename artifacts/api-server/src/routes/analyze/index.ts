import { Router, type IRouter } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalyzeTextBody, AnalyzeTextResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

router.post("/analyze", async (req, res): Promise<void> => {
  const parsed = AnalyzeTextBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { text } = parsed.data;

  // Gunakan gemini-1.5-flash: stabil, cepat, dan kuota gratis lebih besar
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const prompt = `Kamu adalah seorang psikolog forensik dan ahli analisis komunikasi. Analisis teks percakapan atau pesan berikut dan berikan penilaian psikologis yang mendalam.

Teks yang dianalisis:
"""
${text}
"""

Berikan respons dalam format JSON yang TEPAT berikut (tanpa markdown, tanpa komentar, hanya JSON murni):
{
  "isToxic": boolean,
  "toxicityLabel": "string (salah satu dari: 'Toxic', 'Aman', 'Perlu Perhatian')",
  "toxicitySummary": "string (penjelasan singkat 1-2 kalimat dalam Bahasa Indonesia tentang apakah teks ini mengandung unsur bullying, toksik, atau aman)",
  "personalityType": "string (salah satu dari: 'Dominan', 'Pasif-Agresif', 'Empatis', 'Narsistik', 'Manipulatif', 'Introvert Tertutup', 'Ekstrover Ekspresif', 'Perfeksionis')",
  "personalityDescription": "string (deskripsi 2-3 kalimat dalam Bahasa Indonesia tentang tipe kepribadian orang tersebut berdasarkan cara mengetik dan diksi yang digunakan)",
  "redFlagScore": integer antara 0-100,
  "greenFlagScore": integer antara 0-100,
  "mentalHealthInsight": "string (saran 2-3 kalimat dalam Bahasa Indonesia tentang bagaimana cara menghadapi orang dengan tipe komunikasi seperti ini)",
  "communicationStyle": "string (salah satu dari: 'Agresif', 'Asertif', 'Pasif', 'Pasif-Agresif', 'Manipulatif')"
}

Pastikan redFlagScore + greenFlagScore tidak harus selalu 100, karena seseorang bisa memiliki skor yang bervariasi. Analisis secara objektif berdasarkan isi teks.`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      req.log.error({ responseText }, "No JSON found in Gemini response");
      res.status(500).json({ error: "Gagal memproses respons AI. Coba lagi." });
      return;
    }

    const rawJson = JSON.parse(jsonMatch[0]);

    const validated = AnalyzeTextResponse.safeParse(rawJson);
    if (!validated.success) {
      req.log.error({ errors: validated.error.message, rawJson }, "Gemini response failed validation");
      res.status(500).json({ error: "Respons AI tidak valid. Coba lagi." });
      return;
    }

    res.json(validated.data);
  } catch (err) {
    req.log.error({ err }, "Gemini API error");
    res.status(500).json({ error: "Terjadi kesalahan saat menghubungi AI. Periksa API key dan coba lagi." });
  }
});

export default router;

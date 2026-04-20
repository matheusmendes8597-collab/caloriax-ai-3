export const config = {
  api: {
    bodyParser: false,
  },
};

declare const process: any;

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    // ✅ pega o form-data enviado pelo frontend
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return res.status(400).json({ error: "Áudio não enviado" });
    }

    // 🔥 envia direto pra OpenAI
    const openaiForm = new FormData();
    openaiForm.append("file", file);
    openaiForm.append("model", "gpt-4o-mini-transcribe");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: openaiForm,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI Error:", data);
      return res.status(500).json({ error: "Erro OpenAI", details: data });
    }

    return res.status(200).json({ text: data.text });

  } catch (error: any) {
    console.error("Transcribe Error:", error);
    return res.status(500).json({
      error: "Erro geral",
      details: error.message,
    });
  }
}

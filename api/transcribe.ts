export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { audioBase64 } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: "Áudio não enviado" });
    }

    // converte base64 → blob
    const audioBuffer = Buffer.from(audioBase64, "base64");

    const formData = new FormData();
    formData.append("file", new Blob([audioBuffer]), "audio.webm");
    formData.append("model", "gpt-4o-mini-transcribe");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    });

    const data = await response.json();

    return res.status(200).json({ text: data.text });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro na transcrição" });
  }
}

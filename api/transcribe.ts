export const config = {
  api: {
    bodyParser: false, // 🚨 obrigatório
  },
};

import formidable from "formidable";
import fs from "fs";

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
    const form = formidable({ multiples: false });

    const [fields, files]: any = await form.parse(req);

    const file = files.file?.[0];

    if (!file) {
      return res.status(400).json({ error: "Áudio não enviado" });
    }

    const fileStream = fs.createReadStream(file.filepath);

    const formData = new FormData();
    formData.append("file", fileStream);
    formData.append("model", "gpt-4o-mini-transcribe");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
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

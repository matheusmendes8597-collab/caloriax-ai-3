export const config = {
  api: {
    bodyParser: false,
  },
};

import formidable from "formidable";
import fs from "fs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: "Erro ao processar upload" });
    }

    try {
      const file = files.audio[0];
      const fileStream = fs.createReadStream(file.filepath);

      const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: (() => {
          const formData = new FormData();
          formData.append("file", fileStream);
          formData.append("model", "gpt-4o-mini-transcribe");
          return formData;
        })(),
      });

      const data = await response.json();

      return res.status(200).json({ text: data.text });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro na transcrição" });
    }
  });
}

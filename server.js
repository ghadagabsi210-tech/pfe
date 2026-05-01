const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
 apiKey: process.env.OPENAI_API_KEY
});

app.post("/chat", async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Tu es l'assistant officiel de ESIP Gafsa. Réponds professionnellement."
        },
        { role: "user", content: req.body.message }
      ]
    });

    res.json({ reply: completion.choices[0].message.content });

  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "Erreur serveur." });
  }
});

app.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});
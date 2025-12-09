import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// متغیرها از Render خونده می‌شن (نیازی نیست اینجا بنویسی)
const BOT_TOKEN = process.env.BOT_TOKEN;
const OPENAI_KEY = process.env.OPENAI_KEY;

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const WEBHOOK_PATH = `/webhook/${BOT_TOKEN}`;
const WEBHOOK_URL = `https://express-hello-world-z58y.onrender.com${WEBHOOK_PATH}`;

app.get("/", (req, res) => {
  res.send("🤖 AI Bot is live and connected successfully!");
});

app.post(WEBHOOK_PATH, async (req, res) => {
  try {
    const msg = req.body.message;
    if (!msg || !msg.text) return res.sendStatus(200);

    const userText = msg.text;
    const chatId = msg.chat.id;

    // ارسال درخواست به OpenAI
    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: userText }],
      }),
    });

    const data = await aiRes.json();
    const aiText = data?.choices?.[0]?.message?.content || "⚠️ پاسخ نامشخص از هوش مصنوعی";

    // ارسال پاسخ به چت تلگرام
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: aiText }),
    });

    res.sendStatus(200);
  } catch (err) {
    console.error("⚠️ Error:", err);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

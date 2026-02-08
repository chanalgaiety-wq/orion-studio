export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const { name, phone, channel, page, hp } = req.body || {};

    // антиспам: если боты заполнили скрытое поле — делаем вид что ок
    if (hp) return res.status(200).json({ ok: true });

    if (!name || !phone) {
      return res.status(400).json({ ok: false, error: "name/phone required" });
    }

    const token = process.env.TG_BOT_TOKEN;
    const chatId = process.env.TG_CHAT_ID;

    if (!token || !chatId) {
      return res.status(500).json({ ok: false, error: "Missing TG env vars" });
    }

    const text =
      "📩 Новая заявка с сайта ORION\n\n" +
      `👤 Имя: ${name}\n` +
      `📞 Телефон: ${phone}\n` +
      `💬 Удобнее: ${channel || "-"}\n` +
      `📄 Страница: ${page || "-"}\n` +
      `⏱ ${new Date().toLocaleString("ru-RU")}`;

    const tgResp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true
      })
    });

    const tgJson = await tgResp.json();
    if (!tgJson.ok) {
      return res.status(500).json({ ok: false, error: "Telegram error", tg: tgJson });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
}
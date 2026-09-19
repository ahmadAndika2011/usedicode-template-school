const {asyncHandler} = require("../utils/async-handler")

const SYSTEM_PROMPT = `Kamu adalah asisten AI resmi SMA Nusantara.
Jawab dalam Bahasa Indonesia, singkat, ramah, dan sopan.
Informasi sekolah:
- Alamat: Jl. Kenanga Raya No. 17, Depok, Jawa Barat
- Telepon: (021) 555-0192
- Email: info@smanusantara.sch.id
- Jam layanan: Senin–Jumat 07.00–15.30 WIB, Sabtu 08.00–12.00 WIB
Jika pertanyaan di luar informasi ini dan kamu tidak yakin, jangan mengarang;
arahkan penanya menghubungi sekolah via WhatsApp atau telepon.`;

module.exports.apiChat = asyncHandler(async (req, res) => {
    const {messages} = req.body

    if(!Array.isArray(messages)) return res.status(400).json({ error: 'Bad request' });

    const safe = messages.slice(-10).map(m => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content).slice(0, 1000)
    }))

    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: process.env.GROQ_MODEL,
            messages: [{role: "system", content: SYSTEM_PROMPT}, ...safe],
            temperature: 0.5,
            max_tokens: 500
        })
    })

    if(!r.ok){
      console.error('Groq error:', r.status, await r.text());
      return res.status(502).json({ error: 'Upstream error' });
    }
    const data = await r.json()
    res.json({reply: data.choices[0].message.content})
})
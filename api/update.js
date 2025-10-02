const { createClient } = require("@supabase/supabase-js");

// Sécurité : transforme les valeurs en nombre
function toInt(x) { const n = parseInt(x,10); return Number.isFinite(n) ? n : null; }

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const payload = {
      slug: "main", // identifiant de ton tournoi
      tournament: body.tournament,
      round: toInt(body.round),
      small_blind: toInt(body.smallBlind),
      big_blind: toInt(body.bigBlind),
      ante: toInt(body.ante),
      players_left: toInt(body.playersLeft),
      players_total: toInt(body.playersTotal),
      prize_pool: toInt(body.prizePool),
      next_break: body.nextBreak,
      isBreak: body.isBreak,
      status: body.status,
      updated_at: new Date().toISOString()
    };

    await supabase.from("tournament_status").upsert(payload, { onConflict: "slug" });
    return res.status(200).json({ success: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, error: e.message });
  }
};

const { createClient } = require("@supabase/supabase-js");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    // Connexion à Supabase
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Préparer les données principales du tournoi
    const payload = {
      slug: "main",
      round: body.RoundNum,
      level: body.Level,
      state: body.StateDesc,
      players_left: body.PlayersLeft,
      players_total: body.Buyins,
      small_blind: body.SmallBlind,
      big_blind: body.BigBlind,
      ante: body.Ante,
      prize_pool: body.Pot,
      tables_left: body.TablesLeft,
      chip_count: body.ChipCount,
      seconds_left: body.SecondsLeft,
      updated_at: new Date().toISOString()
    };

    // Enregistrer dans Supabase
    await supabase.from("tournament_status").upsert(payload, { onConflict: "slug" });

    // Sauvegarder aussi la liste complète des joueurs si elle existe
    if (body.Players && Array.isArray(body.Players)) {
      for (const player of body.Players) {
        await supabase.from("tournament_players").upsert(
          {
            internal_id: player.InternalID,
            name: player.Name,
            nickname: player.Nickname,
            chips: player.ChipCount,
            status: player.Status,
            rank: player.Rank,
            hits: player.Hits,
            prize: player.PrizeWinnings || 0,
            updated_at: new Date().toISOString()
          },
          { onConflict: "internal_id" }
        );
      }
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error("Erreur update.js:", e);
    return res.status(500).json({ success: false, error: e.message });
  }
};

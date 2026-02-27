cat > (api / subscribe.js) << "EOF";
const https = require("https");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { prenom, email, phone } = req.body;

  if (!prenom || !email) {
    res.status(400).json({ error: "Prénom et email requis." });
    return;
  }

  const payload = JSON.stringify({
    email,
    attributes: {
      PRENOM: prenom,
      ...(phone && { SMS: phone }),
    },
    listIds: [parseInt(process.env.BREVO_LIST_ID, 10)],
    updateEnabled: true,
  });

  const options = {
    hostname: "api.brevo.com",
    path: "/v3/contacts",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "Content-Length": Buffer.byteLength(payload),
    },
  };

  const brevoReq = https.request(options, (brevoRes) => {
    let data = "";
    brevoRes.on("data", (chunk) => (data += chunk));
    brevoRes.on("end", () => {
      const status = brevoRes.statusCode;
      if (status === 201 || status === 204 || status === 400) {
        res.status(200).json({ success: true });
      } else {
        res.status(status).json({ error: data });
      }
    });
  });

  brevoReq.on("error", (e) => {
    res.status(500).json({ error: e.message });
  });

  brevoReq.write(payload);
  brevoReq.end();
};
EOF;

require("dotenv").config();
const express = require("express");
const axios = require("axios");
const fs = require("fs");
const app = express();

const PORT = process.env.PORT || 4000;

const CLIENT_ID = process.env.NIGHTBOT_CLIENT_ID;
const CLIENT_SECRET = process.env.NIGHTBOT_CLIENT_SECRET;
const REDIRECT_URI = process.env.NIGHTBOT_REDIRECT_URI;

app.get("/", (req, res) => {
  res.send(`<h2>Nightbot OAuth App</h2>
    <a href="/auth/nightbot">Connect Nightbot</a>`);
});

// Step 1 → Redirect to Nightbot
app.get("/auth/nightbot", (req, res) => {
  const scope = "chat:write";
  const authURL = `https://api.nightbot.tv/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${scope}`;

  res.redirect(authURL);
});

// Step 2 → Callback
app.get("/auth/nightbot/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.send("No code received.");
  }

  try {
    const response = await axios.post(
      "https://api.nightbot.tv/oauth2/token",
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI
      }
    );

    const tokenData = response.data;

    fs.writeFileSync(
      "nightbot_token.json",
      JSON.stringify(tokenData, null, 2)
    );

    res.send("✅ Nightbot Connected & Token Saved!");
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.send("❌ Token exchange failed.");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
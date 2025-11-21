import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: [
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/spreadsheets",
      ],
    });

    const sheets = google.sheets({
      auth,
      version: "v4",
    });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: "1u-vQ1fGKclf30XJ8wU5-l0EsITs-OnfryjF0tPtdPrI",
      range: "Designers",
    });

    const rows = response.data.values || [];

    const db = rows.map((row) => ({
      name: row[0],
      location: row[1],
      expertise: row[2],
      link: row[3],
      approved: row[4],
      featured: row[5],
    }));

    const sanitizeResult = db.filter(
      (item) => item.name && item.approved === "Yes"
    );

    return res.status(200).json(sanitizeResult);
  } catch (err) {
    console.error("Google Sheets ERROR:", err);
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
}

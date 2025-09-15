const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());

const CREDENTIALS_PATH = path.join(__dirname, '../credentials.json');
const SHEET_ID = '1QHDx-gzCdMobdKfJ1iZUJ3ovJdp1WnsD18XpaDOe6rI';
const SHEET_RANGE = 'Sheet1!A:D'; // Assuming columns: No, Name, age, email

async function getAuth() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const scopes = ['https://www.googleapis.com/auth/spreadsheets'];
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes,
  });
  return await auth.getClient();
}

app.get('/api/sheet', async (req, res) => {
  try {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: SHEET_RANGE,
    });
    res.json(response.data.values);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sheet', async (req, res) => {
  try {
    const { rowIndex, rowData } = req.body;
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!A${rowIndex + 1}:D${rowIndex + 1}`,
      valueInputOption: 'RAW',
      requestBody: { values: [rowData] },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

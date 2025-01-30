const express = require("express");
const { google } = require("googleapis");
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require("cors");

app.use(cors());

// Google Sheets API setup
const sheets = google.sheets("v4");
const auth = new google.auth.GoogleAuth({
  keyFile:
    "C:/Users/shivi/OneDrive/Desktop/SpardhaVolleyballWebsite/backEndVolleyball/service-account-file.json", // Update this path
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

async function fetchData(range) {
  const client = await auth.getClient();
  const spreadsheetId = "1nGfmRvoaGkjR--i-GxALcu9R0IwgVg2vSMcfzYYd7dE"; // Updated sheet ID

  const response = await sheets.spreadsheets.values.get({
    auth: client,
    spreadsheetId,
    range: range, // Fetch all data from the specified range
  });

  return response.data.values;
}

app.get("/api/data", async (req, res) => {
  console.log("GET /api/data");
  try {
    const rows = await fetchData("Sheet1");
    console.log(rows.length);
    if (rows.length) {
      // console.log(rows);
      const liveMatches = rows
        .filter((row) => row[2] === "LIVE")
        .map((row) => ({
          teamA: row[0],
          teamB: row[1],
          gender: row[3],
          court: row[4],
          matchType: row[5],

        }));
      res.json(liveMatches);
    } else {
      res.status(404).send("No data found.");
    }
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

app.get("/api/upcoming", async (req, res) => {
  console.log("GET /api/upcoming");
  try {
    const rows = await fetchData("Sheet1");
    if (rows.length) {
      const upcomingMatches = rows
        .filter((row) => row[2] === "UPCOMING")
        .map((row) => ({
            teamA: row[0],
            teamB: row[1],
            gender: row[3],
            court: row[4],
            matchType: row[5],
            time : row[6],
            date : row[7],
            

        }));
      res.json(upcomingMatches);
    } else {
      res.status(404).send("No data found.");
    }
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

app.get("/api/results", async (req, res) => {
  console.log("GET /api/results");
  try {
    const rows = await fetchData("Sheet1");
    if (rows.length) {
      const results = rows
        .filter((row) => row[2] === "RESULTS")
        .map((row) => ({
          teamA: row[0],
          teamB: row[1],
          matchType: row[5],
          teamAsets: row[7],
          teamBsets: row[8],
          teamAs : row[8],
          teamBs : row[9]
        }));
      res.json(results);
    } else {
      res.status(404).send("No data found.");
    }
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

// Test API endpoint
app.get("/api/test", (req, res) => {
  console.log("GET /api/test");
  res.send("Hello Gowtham");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Available APIs:");
  console.log(`GET http://localhost:${PORT}/api/data`);
  console.log(`GET http://localhost:${PORT}/api/upcoming`);
  console.log(`GET http://localhost:${PORT}/api/results`);
  console.log(`GET http://localhost:${PORT}/api/test`);
});

const express = require("express");
const { google } = require("googleapis");
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require("cors");

app.use(cors());

// Google Sheets API setup
const sheets = google.sheets("v4");
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT), // ✅ Load from ENV
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
          gender: row[3],
          matchType: row[5],
          teamAsets: row[7],
          teamBsets: row[8],
          teamAs : row[8],
          teamBs : row[9]
        }));
      res.json(results.reverse());
    } else {
      res.status(404).send("No data found.");
    }
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

app.get("/api/court1data", async (req, res) => {
  console.log("GET /api/court1data"); // Debugging log
  try {
    const rows = await fetchData("Court 1"); // Ensure the correct range is used
    if (rows.length) {
      const sheet2Data = rows
        .filter((row) =>(row[0] === "live") )
        .map((row) => ({
          // Map the data as needed
          match1Asets: row[1],
          match1Ascore: row[2],
          match1Bscore: row[3],
          match1Bsets: row[4],
          // Add more columns as needed
        }));
      res.json(sheet2Data);
    } else {
      res.status(404).send("No data found.");
    }
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

app.get("/api/court2data", async (req, res) => {
  console.log("GET /api/court2data"); // Debugging log
  try {
    const rows = await fetchData("Court 2"); // Ensure the correct range is used
    if (rows.length) {
      const sheet3Data = rows
        .filter((row) => (row[0] === "live") )
        .map((row) => ({
          // Map the data as needed
          match2Asets: row[1],
          match2Ascore: row[2],
          match2Bscore: row[3],
          match2Bsets: row[4],
          // Add more columns as needed
        }));
      res.json(sheet3Data);
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
  console.log(`GET http://localhost:${PORT}/api/court1data`); // Ensure this is logged
  console.log(`GET http://localhost:${PORT}/api/court2data`); // Ensure this is logged
});

const untis = require("./untis");
const notion = require("./notion");
const express = require("express");
const app = express();

app.get("/", (req, res) => res.send("Hello World!"));

app.post("/generateTimeTable", async function (request, response) {
    try {
        const timetable = await untis.getTimetable();
        await notion.uploadTimetable(timetable);
        response.status(200).send("OK");
    } catch (error) {
        console.log(error)
        response.status(500).send("Whoops! Something went wrong!");
    }
});

app.post("/resetDailyGoals", async function (request, response) {
  try {
    await notion.resetDailyGoals();
    response.status(200).send();
  } catch (error) {
    console.log(error)
    response.status(500).send("Whoops! Something went wrong!");
  }
});

// listen for requests
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
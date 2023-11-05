const untis = require("./untis");
const notion = require("./notion");
const express = require("express");
const app = express();



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

app.post("/generateDailyReport", async function (request, response) {
  try {
    await notion.generateDailyReport();
    response.status(200).send();
  } catch (error) {
    console.log(error)
    response.status(500).send("Whoops! Something went wrong!");
  }
});

// <http://expressjs.com/en/starter/static-files.html>
app.use(express.static("public"));

// <http://expressjs.com/en/starter/basic-routing.html>
app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

// listen for requests
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});


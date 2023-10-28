const webuntis = require("webuntis");
require("dotenv").config();

const untis = new webuntis.WebUntis(process.env.SCHOOL, process.env.USER, process.env.PASSW, process.env.PROVIDER);

async function getTimetable() {
    await untis.login();
    let timetable = await untis.getOwnTimetableForWeek(Date.now());
    timetable = timetable.filter(lesson => !lesson.is.cancelled);
    timetable = timetable.map(lesson => {
        return {
            name: lesson.studentGroup ? lesson.studentGroup.split("_")[0] : lesson.substText,
            date: lesson.date,
            startTime: lesson.startTime,
            endTime: lesson.endTime
        }
    });
    return timetable;
};

module.exports = {
    getTimetable
}
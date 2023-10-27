const webuntis = require("webuntis");
require("dotenv").config();

const untis = new webuntis.WebUntis(process.env.SCHOOL, process.env.USER, process.env.PASSW, process.env.PROVIDER);

let testDate = new Date('October 18, 2023 00:00:00')

async function timetable() {
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
    timetable
}
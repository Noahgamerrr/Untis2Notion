const webuntis = require("webuntis");
require("dotenv").config();

const untis = new webuntis.WebUntis(process.env.SCHOOL, process.env.USER, process.env.PASSW, process.env.PROVIDER);

const testDate = Date.parse('16 Oct, 2023')

function arrayIncludes(arr, next) {
    const existing = arr.find(e => 
        e.name == next.name &&
        e.date == next.date &&
        e.startTime == next.startTime &&
        e.endTime == next.endTime);
    if (existing) return true;
    return false;
}

async function getTimetable() {
    await untis.login();
    let timetable = await untis.getOwnTimetableForWeek(testDate);
    timetable = timetable.filter(lesson => 
        !lesson.is.cancelled &&
        lesson.substText != "EVA"
    );
    timetable = timetable.map(lesson => {
        return {
            name: lesson.studentGroup ? lesson.studentGroup.split("_")[0] : lesson.substText,
            date: lesson.date,
            startTime: lesson.startTime,
            endTime: lesson.endTime
        }
    });
    timetable.sort(
        (a, b) => 
        a.date - b.date || 
        a.startTime - b.startTime
    )
    timetable = timetable.reduce((acc, curr) => {
        if (arrayIncludes(acc, curr)) return acc;
        acc.push(curr);
        return acc;
    }, [])
    timetable = timetable.reduce((acc, curr) => {
        const lastSubject = acc[acc.length - 1];
        if (
            lastSubject &&
            lastSubject.name == curr.name &&
            lastSubject.date == curr.date &&
            lastSubject.endTime <= curr.startTime
        ) {
            lastSubject.endTime = curr.endTime
        } else acc.push(curr);
        return acc;
    }, []);
    console.log(timetable);
    return timetable;
};

module.exports = {
    getTimetable
}
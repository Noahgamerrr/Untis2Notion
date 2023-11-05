const webuntis = require("webuntis");
require("dotenv").config();

const untis = new webuntis.WebUntis(process.env.SCHOOL, process.env.USER, process.env.PASSW, process.env.PROVIDER);

function dateTimeToNotionString(date, startTime, endTime) {
    let dateStr = date.toString();

    let startTimeStr = startTime.toString();
    if (startTimeStr.length == 3) startTimeStr = '0' + startTimeStr;

    let endTimeStr = endTime.toString();
    if (endTimeStr.length == 3) endTimeStr = '0' + endTimeStr;

    let year = dateStr.substring(0, 4);
    let month = dateStr.substring(4, 6);
    let day = dateStr.substring(6);

    let startHour = startTimeStr.substring(0, 2);
    let startMinute = startTimeStr.substring(2);

    let endHour = endTimeStr.substring(0, 2);
    let endMinute = endTimeStr.substring(2);

    let notionStartTime = `${year}-${month}-${day}T${startHour}:${startMinute}:00.000`;
    let notionEndTime = `${year}-${month}-${day}T${endHour}:${endMinute}:00.000`;

    return [notionStartTime, notionEndTime];
}

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
    let timetable = await untis.getOwnTimetableForWeek(new Date());
    timetable = timetable.filter(lesson => 
        !lesson.is.cancelled &&
        lesson.substText != "EVA"
    );
    timetable = timetable.map(lesson => {
        let [startTime, endTime] = dateTimeToNotionString(lesson.date, lesson.startTime, lesson.endTime);
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
    timetable = timetable.map(lesson => {
        let [startTime, endTime] = dateTimeToNotionString(lesson.date, lesson.startTime, lesson.endTime);
        return {
            name: lesson.name,
            startTime: startTime,
            endTime: endTime
        }
    });
    //console.log(timetable);
    return timetable;
};

module.exports = {
    getTimetable
}
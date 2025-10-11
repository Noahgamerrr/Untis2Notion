// Notion SDK for JavaScript
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.API_KEY });

function getFirstDayOfWeek(date) {
    let day = date.getDay();
    let diff = date.getDate() - day + (day == 0 ? -6 : 1);
    return new Date(date.setDate(diff));
}

async function uploadTimetable(timetable) {
    const calendar = process.env.CALENDAR_ID;
    const date = getFirstDayOfWeek(new Date());
    const calBlock = await notion.dataSources.query({
        data_source_id: calendar,
        filter: {
            and: [
                {
                    property: 'Tags',
                    multi_select: {
                        contains: "Schule"
                    }
                },
                {
                    property: 'Date',
                    date: {
                        on_or_after: date,
                        on_or_before: new Date(date.setDate(date.getDate() + 5))
                    }
                }
            ]
        }
    })
    const awaitDeletion = [];
    for (let lesson of calBlock.results) {
        awaitDeletion.push(
            notion.pages.update({
                page_id: lesson.id,
                archived: true
            })
        );
    }
    await Promise.all(awaitDeletion);
    const awaitCreation = [];
    for (let lesson of timetable) {
        await new Promise(resolve => setTimeout(resolve, 200));
        awaitCreation.push(
            notion.pages.create({
                parent: {
                    data_source_id: calendar
                },
                properties: {
                    Name: {
                        title: [
                            {
                                text: {
                                    content: lesson.name
                                }
                            }
                        ]
                    },
                    Tags: {
                        multi_select: [
                            {
                                name: "Schule"
                            }
                        ]
                    },
                    Date: {
                        type: "date",
                        date: {
                            start: lesson.startTime,
                            end: lesson.endTime,
                            time_zone: "Europe/Vienna"
                        }
                    }
                }
            })
        );
    }
    await Promise.all(awaitCreation);
}

async function resetDailyGoals() {
    const pageId = process.env.GOALS_ID;
    const content = await notion.blocks.children.list({
        block_id: pageId
    });
    let toDoList = content.results.filter(b => b.to_do?.checked);
    let awaitUncheck = [];
    for (let toDo of toDoList) {
        awaitUncheck.push(
            notion.blocks.update({
                block_id: toDo.id,
                to_do: {
                    checked: false
                }
            })
        );
    }
    const res = await Promise.allSettled(awaitUncheck);
    const failedRequests = res.filter(r => r.status === "rejected");
    if (failedRequests) throw new Error(failedRequests);
}

module.exports = {
    uploadTimetable,
    resetDailyGoals
}
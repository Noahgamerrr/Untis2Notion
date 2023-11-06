// Notion SDK for JavaScript
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.API_KEY });

function getFirstDayOfWeek(date) {
    let day = date.getDay();
    let diff = date.getDate() - day + (day == 0 ? -6 : 1);
    return new Date(date.setDate(diff));
}

async function uploadTimetable(timetable) {
    const pageId = process.env.PAGE_ID;
    const contentList = await notion.blocks.children.list({
        block_id: pageId
    });
    const calendar = contentList.results.find(e => e.type === "child_database");
    const date = getFirstDayOfWeek(new Date());
    const calBlock = await notion.databases.query({
        database_id: calendar.id,
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
                        on_or_before: new Date(date.setDate(date.getDate() + 4))
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
        awaitCreation.push(
            notion.pages.create({
                parent: {
                    database_id: calendar.id
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

async function createMonthlyReportPage(database_id) {
    const date = new Date();
    const month = date.toLocaleString('default', {month: 'long'});
    const year = date.getFullYear();
    const monthNum = date.getMonth() + 1;
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    await notion.pages.create({
        parent: {
            type: "database_id",
            id: database_id
        },
        properties: {
            Name: {
                title: [
                    {
                        text: {
                            content: month +" " +year
                        }
                    }
                ]
            }
        },
        children: [
            {
                object: "block",
                table: {
                    table_width: daysInMonth,
                    has_column_header: true,
                    has_row_header: true,
                },
                object: "block",
                table_row
            }
        ]
    })
}

async function resetDailyGoals(content) {
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
    await Promise.all(awaitUncheck);
}

async function generateDailyReport() {
    const pageId = process.env.GOALS_ID;
    const content = await notion.blocks.children.list({
        block_id: pageId
    });
    const today = new Date();
    if (today.getDate() === 1) {
        let reportsList = content.results.filter(e => e.type === "child_database");
        await createMonthlyReportPage(reportsList.id);
    }
    //console.log(content);
    await resetDailyGoals(content);
}

module.exports = {
    uploadTimetable,
    generateDailyReport
}
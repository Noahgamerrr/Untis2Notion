// Notion SDK for JavaScript
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.API_KEY });

async function uploadTimetable(timetable) {
    const pageId = process.env.PAGE_ID;
    try {
        // Notion API request!
        const contentList = await notion.blocks.children.list({
            block_id: pageId
        });
        const calendar = contentList.results.find(e => e.type === "child_database");
        await notion.pages.create({
            parent: {
                database_id: calendar.id
            },
            properties: {
                Name: {
                    title: [
                        {
                            text: {
                                content: "Test"
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
                        start: '2023-11-01T10:00:00.000+01:00',
                        end: '2023-11-01T11:00:00.000+01:00'
                    }
                }
            }
        });
        /*const calBlock = await notion.databases.query({
            database_id: calendar.id,
            filter: {
                property: 'Tags',
                multi_select: {
                    contains: "Schule"
                }
            }
        })
        console.log(calBlock);
        console.log(calBlock.results[0].properties.Tags.multi_select);*/
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    uploadTimetable
}
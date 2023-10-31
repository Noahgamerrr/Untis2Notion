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
        const calBlock = await notion.databases.query({
            database_id: calendar.id,
            filter: {
                property: 'Tags',
                multi_select: {
                    contains: "Schule"
                }
            }
        })
        console.log(calBlock);
        console.log(calBlock.results[0].properties);
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    uploadTimetable
}
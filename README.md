# Untis2Notion
Display Untis Timetable in Notion. Makes use of the [Webuntis API repository](https://github.com/SchoolUtils/WebUntis).

## Requirements

This project requires you to have Node installed on your Computer, a Untis account as well as a Notion account. That's it.

## Setup

### Installing packages

Simply run ```npm i``` to install all packages required.

### Setting up environmental variables

This code makes use of the "dotenv" library to store variables in a .env-file which are supposed to be kept secret.
Simply create a new file in the project's root folder called ```.env``` and store the following values as shown below:

```
SCHOOL=[Your school code in Untis]
USER=[Your username for logging in into Untis]
PASSW=[Your password]
PROVIDER=[Your school's provider for Untis]
API_KEY=[Your Notion API Key]
CALENDAR_ID=[The ID of your Notion Calendar]
PORT=[The port where this code will be running on (for normal users 8080 fits perfectly)]
DATABASE_TAG=[String that identifies your timetable entries: Something like School, College etc.]
```

### How to get your Untis data

While the USER and the PASSW variables are trivial, the SCHOOL and the PROVIDER variables aren't. In order to find them:

* Go to https://webuntis.com
* Navigate to your school's Untis page.

There, you will find that the URL has changed a lot. As an example, here's the URL for my school:

https://asopo.webuntis.com/WebUntis/?school=htblva_villach#/basic/login

In this URL, you can find the two remaining variables to be set in order to succesfully create a connection.

SCHOOL: This variable can be found in the request params of the URL, in my case it would be "htblva_villach"\
PROVIDER: This is the URL's host which comes right after the URL-protocol, in this case "asopo.webuntis.com"

### Prepare your Notion database

If you create a new Notion database and try to connect the integration to it, this repository will fail. This is because it requires a property "Tags" that does not exist yet. To add this property:

* Navigate to your database
* Click on "settings"
* Click on "Edit properties"
* Click on "New property"
* Add a new property "Tags" of type "Multi-select"

### How to connect to your Notion database

#### Create a Notion integration

In order to use this code, you will need to create an API Integration for Notion.

* Go to https://www.notion.so/my-integrations
* Click on "+ New Integration"
* Give your integration a name
* In "Secrets", click on "Show" and then "Copy" in the input field
* Store the copied secret in your .env-file as ```API_KEY=[your secret]```

#### Connect integration to your data source

Now that the integration has been created, you will need to connect it to your data source. In your Notion app:

* Navigate to the page where your database is located at
* Click on the three dots in the top right
* Navigate to "Connections"
* Search for your integration
* Click on "Confirm"

Your integration now has access to your page as well as all its child blocks.

#### Get ID of your Notion database

Your final step would be to find the Database ID and saving it in your .env-file. In order to find the id

* Navigate to the page where your database is located at in the Notion Web-Client
* Navigate to your database
* Click on "settings"
* Click on "Manage data sources"
* Navigate to the source you want to load the timetable in
* Click on the three dots on the right
* Click on "Copy data source ID"

You should now receive a string that looks like ```a8aec433-84f4-47ed-8439-0e842c2e089e```. Save that string as:
```CALENDAR_ID=[your data_source_id]```

## Running the code

Now that the setup has been done, simply navigate in your terminal to the root folder of this project and then run ```npm start```. A server will be established on your computer on the port you provided in the .env-file.

## Making a request

Example requests have been written in the rest folder. Adapt the request ```generateTimeTable``` to your port and then run it. Your database should be filled with blocks of your school subjects. Note that every time this command runs, any existing blocks will be deleted.

Note that there is a second API point ```resetDailyGoals```, which has been created for my own purposes to reset a to-do list every day and which is not part of the main purpose of this repository. It has still been added to this repository because the repository is connected to a cyclic-server so that I don't need to run that request every day by hand.
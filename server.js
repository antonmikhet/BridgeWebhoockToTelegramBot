// Requiring in-built https for creating
// https server
const https = require("https");

// Express for handling GET and POST request
const express = require("express");
const app = express();

// Requiring file system to use local files
const fs = require("fs");

// Parsing the form of body to take
// input from forms
const bodyParser = require("body-parser");

// Creating object of key and certificate
// for SSL
const options = {
        key: fs.readFileSync("cert/key.pem"),
        cert: fs.readFileSync("cert/cert.pem")
};


// Creating https server by passing
// options and app object

https.createServer(options, app)
        .listen(9572, function(req, res) {

                SendMessage("Start Server");
                console.error('Server start port 9572');

        });
// Configuring express to use body-parser
// as middle-ware
app.use(bodyParser.urlencoded({
        limit: '100mb',
        parameterLimit: 100000000,
        extended: true
}));
app.use(bodyParser.json({
        limit: '100mb',
        extended: true
}));


var pushdata = {
        eventname: '',
        username: '',
        projectname: '',
        defaultbranch: '',
        commitmessage: '',
        commitstimestamp: '',
        addedfilelength: 0,
        modifyfilelength: 0,
        removefilelength: 0,
};

function formatString(str) {
        if (str == null || typeof str !== 'string') {
                return str;
        }
        return str.replace(/\//g, '%2F').replace(/\n/g, '%0A');
}

app.use(function(req, res) {
        try {
                res.setHeader('Content-Type', 'application/json');

                const commits = req.body.commits || [];
                const pushdata = {
                        eventname: formatString(req.body.event_name),
                        username: formatString(req.body.user_username),
                        projectname: formatString(req.body.project?.name),
                        commits: commits.map((commit) => ({
                                commitmessage: formatString(commit?.message),
                                commitstimestamp: formatString(commit?.timestamp),
                                addedfilelength: commit?.added?.length || 0,
                                modifyfilelength: commit?.modified?.length || 0,
                                removefilelength: commit?.removed?.length || 0,
                        })),
                        defaultbranch: formatString(req.body?.ref),
                };

                SendMessage(CreateString(pushdata));

                res.write('you posted:\n');
                res.end('Send successful');
        } catch (error) {
                console.error(error);
                res.write('you not posted:\n');
                res.end('Send error');
        }
});


function SendMessage(text) {
        var chatid = "-1001636262341";
        var token = "5923052853:AAETSve28RcrjpEXgKt0RF-NpdJh8M126kg";
        var url = "https://api.telegram.org/bot" + token + "/sendMessage?chat_id=" + chatid + "&parse_mode=HTML&text=%20" + text;
        console.error(url);
        https.get(url);
};

function CreateString(struct) {
        const commitsString = struct.commits
                .map((commit) => [
                        '<b>Commit message: </b>' + commit.commitmessage,
                        '<b>Time: </b>' + commit.commitstimestamp,
                        '<b>Added file count: </b>' + commit.addedfilelength,
                        '<b>Modify file count: </b>' + commit.modifyfilelength,
                        '<b>Remove file count: </b>' + commit.removefilelength,
                ].join(' %0A '))
                .join(' %0A ' +
                        '------------------------------------------------' +
                        ' %0A ');

        const ResultString =
                '<b>New event triggered</b> %0A ' +
                '<b>Project name: </b>' +
                struct.projectname +
                ' %0A ' +
                '<b>User name: </b>' +
                struct.username +
                ' %0A ' +
                '<b>Event name: </b>' +
                struct.eventname +
                ' %0A ' +
                '<b>Branch: </b>' +
                struct.defaultbranch +
                ' %0A ' +
                '------------------------------------------------' +
                ' %0A ' +
                commitsString +
                ' %0A '


        return ResultString;
}
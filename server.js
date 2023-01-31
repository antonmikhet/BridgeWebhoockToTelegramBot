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
  key:  fs.readFileSync("cert/key.pem"),
  cert: fs.readFileSync("cert/cert.pem")
};


// Creating https server by passing
// options and app object

https.createServer(options, app)
.listen(9572, function (req, res) {
    
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
  limit: '100mb', extended: true
}));

  
var pushdata = {
  eventname:        '',
  username:         '',
  projectname:      '',
  defaultbranch:    '',
  commitstimestamp: '',
  addedfilelength:   0,
  modifyfilelength:  0,
  removefilelength:  0,
};

app.use(function (req, res) {
  try{
    res.setHeader('Content-Type', 'application/json');

  
    pushdata.eventname =         JSON.stringify(req.body['event_name'], null, 2);
    pushdata.username =          JSON.stringify(req.body['user_username'], null, 2);
    pushdata.projectname =       JSON.stringify(req.body['project']['name'], null, 2);
    pushdata.commtsmessage =     JSON.stringify(req.body['commits'][0]['title'], null, 2);
    pushdata.commitstimestamp =  JSON.stringify(req.body['commits'][0]['timestamp'], null, 2);
    pushdata.addedfilelength =   JSON.stringify(req.body['commits'][0]['added'].length, null, 2);
    pushdata.modifyfilelength =  JSON.stringify(req.body['commits'][0]['modified'].length, null, 2);
    pushdata.removefilelength =  JSON.stringify(req.body['commits'][0]['removed'].length, null, 2);
  
    pushdata.defaultbranch =     JSON.stringify(req.body['ref'], null, 2);
    pushdata.defaultbranch =     `"` + pushdata.defaultbranch.substring(pushdata.defaultbranch.lastIndexOf('/') + 1);
  
    SendMessage(CreateString(pushdata));

    res.write    ('you posted:\n');
    res.end      ('Send successful');

  } catch {

    console.error('Invalid type');
    res.write    ('you not posted:\n');
    res.end      ('Send error');
  };
});

function SendMessage(text){
    var chatid = "-1001636262341";
    var token = "5923052853:AAETSve28RcrjpEXgKt0RF-NpdJh8M126kg";
    var url = "https://api.telegram.org/bot"+token+"/sendMessage?chat_id="+chatid+"&parse_mode=HTML&text=%20"+text;
    console.error(url);
    https.get(url);
};

function CreateString(struct){

  ResultString =  '<b>New event triggered</b> %0A '                             +
                  '<b>Project name: </b>'   + struct.projectname +      ' %0A ' +
                  '<b>User name: </b>'      + struct.username +         ' %0A ' +
                  '<b>Event name: </b>'     + struct.eventname +        ' %0A ' +
                  '<b>Commit message: </b>' + struct.commtsmessage +    ' %0A ' +
                  'Branch: '                + struct.defaultbranch +    ' %0A ' +
                  'Time: '                  + struct.commitstimestamp + ' %0A ' +
                  'Added file count: '      + struct.addedfilelength +  ' %0A ' +
                  'Modify file count: '     + struct.modifyfilelength + ' %0A ' +
                  'Remove file count: '     + struct.removefilelength + ' %0A ' ;
  return ResultString;
};
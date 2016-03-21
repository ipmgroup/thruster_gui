"use strict";

var http = require("http"),
    express = require("express"),
    estatic = require("express-static"),
    ws = require("ws"),
    handlers = require("./handlers");

var app = express(),
    web = http.createServer(app),
    wss = new ws.Server({ server: web });

var sockets = [];

app.use(estatic("static"));

wss.on("connection", function(ws) {
    var req = ws.upgradeReq, resp = { writeHead: {} };
    req.originalUrl = req.url;

    function removeWS() {
        ws.removeAllListeners();
        sockets.splice(sockets.indexOf(ws), 1);
    }

    sockets.push(ws);
    ws.on("close", removeWS);
    ws.on("error", removeWS);
    ws.on("message", function(text) {
        var msg = JSON.parse(text), type = msg.type;

        if (handlers[type])
            handlers[type](msg.data, function(data) {
                ws.send(JSON.stringify({ type: type, data: data, id: msg.id }));
            });
        else
            console.log("UNKNOWN_REQ", type);
    });
});

web.listen(10000);

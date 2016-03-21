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

    ws._eOpened = true;
    function removeWS() {
        ws.removeAllListeners();
        ws._eOpened = false;
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
            }, notify);
        else
            console.log("UNKNOWN_REQ", type);
    });
});

function notify(type, data) {
    var pdata = { type: type, data: data }, packed = JSON.stringify(pdata);
    sockets.forEach(function(ws) {
        if (ws._eOpened)
            ws.send(packed);
    });
}

web.listen(10000);

"use strict";

var spawn = require("child_process").spawn;

module.exports = {
    "test": function(data, resp, notify) {
        setTimeout(function() {
            data.foo = "bar";
            resp(data); // can be called only once
        }, 1000);
    },
    "ls": function(data, resp, notify) {
        var ls = spawn("ls", [ "-l", "/usr/share" ]), prefix = "";

        ls.on("close", function(code) {
            if (prefix !== "")
                notify("ls", prefix); // send stored rests

            resp(code);
        });

        ls.stdout.on("data", function(data) {
            var lines = data.toString("utf-8").split(/\r\n?|\n/);
            lines[0] = [ prefix, lines[0] ].join("");
            prefix = lines.pop();

            lines.forEach(function(line) {
                notify("ls", line); // can be called multiple times
            });
        });
    }
};

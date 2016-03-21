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
        var ls = spawn("ls", [ "-l", "/usr/share" ]);

        ls.on("close", function(code) {
            resp(code);
        });

        ls.stdout.on("data", function(data) {
            notify("ls", data.toString("utf8")); // can be called multiple times
        });
    }
};

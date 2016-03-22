"use strict";

var spawn = require("child_process").spawn;

module.exports = Server;

function Server(notify) {
    this.notify = notify;
    this.mon = {};
}

Server.prototype.handle = function(type, data, resp, notify) {
    switch (type) {
    case "test":
        setTimeout(function() {
            data.foo = "bar";
            resp(data); // can be called only once
        }, 1000);
        break;

    case "mon":
        console.log("Monitoring", data.name, data.value);
        if (Object.keys(this.mon).indexOf(data.name) <= 0){
            this.mon[data.name] = new Monitor(-1, data.name, this.notify);
        }

        var mon = this.mon[data.name], prefix = "";

        if(!mon.isOn){
            mon.start();
        }else if(mon.isOn){
            mon.stop();
        }

        mon.thread.on("close", function(code){
            if(prefix !== ""){
                notify("mon " + mon.id + "." + mon.name, prefix); // send stored rests
            }
            mon.stop();
            console.log("close " + mon.id + "." + mon.name, code);
            notify("close " + mon.id + "." + mon.name, code);
        });

        mon.thread.on("error", function(code){
            mon.stop();
            console.log("error" + mon.id + "." + mon.name, code);
            notify("error" + mon.id + "." + mon.name, code);
        });

        mon.thread.stdout.on("data", function(data){
            var lines = data.toString("utf-8").split(/\r\n?|\n/);
            lines[0] = [ prefix, lines[0] ].join("");
            prefix = lines.pop();

            lines.forEach(function(line) {
                notify("mon " + mon.id + "." + mon.name, +line); // can be called multiple times
            });
        });

        notify("monState", {id: mon.id, name: mon.name, isOn: mon.isOn});

        break;

    default:
        console.log("unsupported", type);
    }
};



// var tmp = {
//     "test": function(data, resp, notify) {
//
//     },
//     "ls": function(data, resp, notify) {
//         var ls = spawn("ls", [ "-l", "/usr/share" ]), prefix = "";
//
//         ls.on("close", function(code) {
//             if (prefix !== "")
//                 notify("ls", prefix); // send stored rests
//
//             console.log("close", code);
//             resp(code);
//         });
//
//         ls.on("error", function(code) {
//             console.log("err", code);
//             notify("error", {name: "ls", errno: code.errno});
//             //resp(code.errno);
//         });
//
//         ls.stdout.on("data", function(data) {
//             var lines = data.toString("utf-8").split(/\r\n?|\n/);
//             lines[0] = [ prefix, lines[0] ].join("");
//             prefix = lines.pop();
//
//             lines.forEach(function(line) {
//                 notify("ls", +line); // can be called multiple times
//             });
//         });
//     },
//     "asdf": function(data, resp, notify){
//         console.log("asdf", data);
//         resp({asdf: 1});
//         notify("asdf", Date.now());
//     }
// };

// var humidityMon = new Mon("./mon.sh", [ "-l", "humidity" ])
//
// humidityMon.start();
//
// function Mon(line, args) {
//     this.line = line;
//     this.args = args;
//     this.started = false;
// }
//
// Mon.prototype.start = function() {
//     if (this.started)
//         return;
//
//     this.proc = spawn(this.line, this.args);
// };
//
// Mon.prototype.stop = function() {
//     if (this.started)
//         this.proc.kill();
// };

function Monitor(id, name, notify){
    this.notify = notify;
    this.id = id;
    this.name = name;
    this.thread = null;
    this.isOn = 0;
}

Monitor.prototype.start = function(){
    if(!this.isOn){
        this.thread = spawn("./mon.sh", [ "-m", this.name ]);
        this.isOn = 1;
    }
}

Monitor.prototype.stop = function(){
    if(this.isOn){
        this.thread.kill();
        this.isOn = 0;
    }
}

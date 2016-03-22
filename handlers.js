"use strict";

// This object is used as an adapter between the requests from the client
// and the actual command line arguments of the console application.
var strAdapter = {
    // Path to the console application.
    App:            "./mon.sh",

    // Options.
    Monitoring:     "-m",

    // The following keys have to correspond with the names in the web app.
    // The values have to correspond with the command line arguments of the console app.
    Speed:          "speed",
    Acceleration:   "acceleration",
    Voltage:        "voltage",
    Current:        "current",
    Temperature:    "temperature",
    Humidity:       "humidity",
    Status:         "fault"
};

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
        if (Object.keys(this.mon).indexOf(data.name) < 0){
            this.mon[data.name] = new Monitor(-1, data.name, this.notify);
        }

        var mon = this.mon[data.name], prefix = "";
        //var retData = {id: mon.id, name: mon.name, state: mon.isOn, data: "--"};

        if(mon.content.status == 0 && data.value == 1){
            mon.start();

            mon.thread.on("close", function(code){
                if(prefix !== ""){
                    mon.content.data = prefix;
                    notify("mon", mon.content); // send stored rests
                }
                mon.stop();
                mon.content.data = code;
                console.log("mon_close", mon.content);
                notify("mon_close", mon.content);
            });

            mon.thread.on("error", function(code){
                mon.stop();
                mon.content.data = code;
                console.log("mon_error", mon.content);
                notify("mon_error", mon.content);
            });

            mon.thread.stdout.on("data", function(data){
                var lines = data.toString("utf-8").split(/\r\n?|\n/);
                lines[0] = [ prefix, lines[0] ].join("");
                prefix = lines.pop();

                lines.forEach(function(line) {
                    mon.content.data = line;//+line;
                    //console.log("line", mon.content.data);
                    notify("mon", mon.content); // can be called multiple times
                });
            });
        }else if(mon.content.status == 1 && data.value == 0){
            //console.log("stopping1");
            mon.stop();
            mon.content.data = "--";
            //break;
        }else{
            console.log("error", "bad request, status: " + mon.content.status + ", request: " + data.value);
            //break;
        }

        notify("mon", mon.content);
        resp(mon.content);
        break;

    default:
        console.log("unsupported", type);
    }
};


function Monitor(id, name, notify){
    this.notify = notify;
    this.thread = null;
    this.content = {/*type: "mon", */id: id, name: name, status: 0, data: "--"};
}

Monitor.prototype.start = function(){
    if(this.content.status == 0){
        this.thread = spawn(strAdapter.App, [ strAdapter.Monitoring, strAdapter[this.name] ]);
        this.content.status = 1;
    }
}

Monitor.prototype.stop = function(){
    //console.log("stopping2", this.content, this.thread);
    if(this.content.status == 1){
        //console.log("stopping3");
        this.thread.kill();
        this.content.status = 0;
    }
}

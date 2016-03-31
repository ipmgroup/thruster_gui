"use strict";

// This object is used as an adapter between the requests from the client
// and the actual command line arguments of the console application.
var strAdapter = {
    // Path to the console application.
    app:            "./mon.sh",
    //app:            "./tctl",

    // Options.
    monitoring:     "-m",
    nodeid:         "--nodeid=",

    // The following keys have to correspond with the names in the web app, but be lower case.
    // The values have to correspond with the command line arguments of the console app.
    controlword:    "quickstart",
    speed:          "speed",
    accel:          "acceleration",
    voltage:        "voltage",
    current:        "current",
    temperature:    "temperature",
    humidity:       "humidity",
    status:         "fault"
};

var spawn = require("child_process").spawn;

module.exports = Server;

function Server(notify) {
    this.notify = notify;
    this.mon = {}; // List of parameters that are being monitored. Check this to prevent creating redundant monitors.
    this.set = {}; // List of nodes that are already being written to. Check this to prevent redundant or colliding write attempts.
}

Server.prototype.handle = function(type, data, resp, notify) {
    var self = this;
    switch (type) {
    case "test":
        //setTimeout(function() {
            data.foo = "bar";
            resp(data); // can be called only once
        //}, 1000);
        break;

    case "mon":
        console.log("Monitoring", data.name, data.value);
        if (Object.keys(this.mon).indexOf(data.id + data.name) < 0){
            this.mon[data.id + data.name] = new Monitor(data.id, data.name, this.notify);
        }

        var mon = this.mon[data.id + data.name], prefix = "";
        //var retData = {id: mon.id, name: mon.name, state: mon.isOn, data: "--"};

        if((mon.content.status == 0 || mon.content.status == "0") && data.value == 1){
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
        }else if((mon.content.status == 1 || mon.content.status == "1") && data.value == 0){
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

    case "set":
        console.log("Setting", data.id, data.name, data.value);
        if(Object.keys(this.set).indexOf(data.id) < 0){
            this.set[data.id] = new Setter(data.id, data.name, this.notify);
        }
        var set = this.set[data.id], prefix = "";

        if(set.thread == null){
            set.content.data = data.value;
            set.apply();

            set.thread.on("close", function(code){
                if(prefix !== ""){
                    set.content.data = prefix;
                    notify("set", set.content); // send stored rests
                }
                set.abort();
                set.content.data = code;
                console.log("set_close", set.content);
                notify("set_close", set.content);
            });

            set.thread.on("error", function(code){
                set.abort();
                set.content.data = code;
                console.log("set_error", set.content);
                notify("set_error", set.content);
            });

            set.thread.stdout.on("data", function(data){
                var lines = data.toString("utf-8").split(/\r\n?|\n/);
                lines[0] = [ prefix, lines[0] ].join("");
                prefix = lines.pop();

                lines.forEach(function(line) {
                    set.content.data = line;//+line;
                    //console.log("line", set.content.data);
                    notify("set", set.content); // can be called multiple times
                });
            });
        }else{
            console.log("error", "busy", set.content.id, set.thread);
        }

        resp(set.content);
        break;
    case "setid": //Not necessary since the id is sent with every request.
        break;
    case "disable_hidden":
        var m = self.mon;
        for(var index in m){
            if(m.hasOwnProperty(index) && m[index].content.id != data.id){
                m[index].stop();
                console.log("deleting", index);
                delete self.mon[index]; // Free up memory.
            }
        }

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
    var self = this;
    if(this.content.status == 0 || this.content.status == "0"){
        console.log("shell_name", strAdapter[this.content.name.toLowerCase()]);
        this.thread = spawn(strAdapter.app, [ strAdapter.nodeid + this.content.id, strAdapter.monitoring, strAdapter[this.content.name.toLowerCase()] ]);
        this.content.status = 1;
    }
}

Monitor.prototype.stop = function(){
    //console.log("stopping2", this.content, this.thread);
    if(this.content.status == 1 || this.content.status == "1"){
        //console.log("stopping3");
        this.thread.kill();
        this.content.status = 0;
    }
}

function Setter(id, name, notify){
    this.notify = notify;
    this.thread = null;
    this.content = {/*type: "mon", */id: id, name: name, /*status: 0, */data: null};
}

Setter.prototype.apply = function(){
    if(this.thread == null){
        //console.log("applying", this.content);
        this.thread = spawn(strAdapter.app, [strAdapter.nodeid + this.content.id, "--" + strAdapter[this.content.name.toLowerCase()] + "=" + this.content.data]);
    }else{
        console.log("busy", this.content.id, this.thread);
    }
}

Setter.prototype.get = function(){
    if(this.thread == null){
        this.thread = spawn(strAdapter.app, [strAdapter.nodeid + this.content.id, "--" + strAdapter[this.content.name.toLowerCase()]]);
    }else{
        console.log("busy", this.content.id, this.thread);
    }
}

Setter.prototype.abort = function(){
    if(this.thread != null){
        this.thread.kill();
        this.thread = null;
    }
}

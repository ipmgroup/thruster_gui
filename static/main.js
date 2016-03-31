(function() {
    "use strict";

    var descr = {
        speed:          { name: "Speed",        unit: "rpm",   set: true,  mon: true  },
        accel:          { name: "Acceleration", unit: "rpm/s", set: true,  mon: false },
        voltage:        { name: "Voltage",      unit: "0.1 V", set: false, mon: true  },
        current:        { name: "Current",      unit: "mA",    set: false, mon: true  },
        temperature:    { name: "Temperature",  unit: "°C",    set: false, mon: true  },
        humidity:       { name: "Humidity",     unit: "%",     set: false, mon: true  },
        status:         { name: "Status",       unit: "",      set: false, mon: true  }
    };

    var flags = {
        system: {name: "System",                   bitPos: 0},
        motor:  {name: "Motor",                    bitPos: 1},
        fw:     {name: "Field weakening",          bitPos: 2},
        fa:     {name: "Force angle",              bitPos: 3},
        rr:     {name: "Resistance recalculation", bitPos: 4},
        pw:     {name: "Power wrap",               bitPos: 5}
    }

    var nodeid = "6";

    window.addEventListener("load", function() {
        var comm = new MotorControl.Comm(connected, notify);
        var nsfield = new MotorControl.NodeselectField(onNodeselect, nodeid);
        var cwfield = new MotorControl.ControlwordField(flags, onClick);
        var table = new MotorControl.ControlTable(descr, onClick);

        function connected() {
            comm.send("test", { test: 1 }, function(err, data) {
                console.log("RESP", err, data);
            });

            //comm.send("test", { ololo: 2 }, function(err, data) {
            //    console.log("RESP", err, data);
            //});
        }

        function notify(type, data) {
            console.log("NOTIFY", type, data);

            if(type == "mon" && data.id == nodeid){
                var strStat = (data.status == 1?"on":"off");
                table.setMonAction(data.name, (data.status == 1?0:1));
                table.setMonState(data.name, strStat);
                table.setActualValue(data.name, data.data);
            }
        }

        function onClick(param) {
            console.log("Clicked", param);
            if(param.type == "set"){
                table.setTarget(param.name, param.value);
                comm.send("set", {id: nodeid, name: param.name, value: param.value}, function(err, data){
                    console.log("RESP", err, data);
                });
            }else if(param.type == "mon"){
                comm.send("mon", {id: nodeid, name: param.name, value: param.value}, function(err, data){
                    console.log("RESP", err, data);
                });
            }
        }

        function onNodeselect(param){
            console.log("NodeSelect", param);
            if(param.type == "setid"){
                nodeid = param.id;
                table.resetTable();
                comm.send("setid", {id: param.id}, function(err, data){
                    console.log("RESP", err, data);
                });
            }else if(param.type == "disable_hidden"){
                comm.send("disable_hidden", {id: param.id}, function(err, data){
                    console.log("RESP", err, data);
                });
            }
        }

        //table.setMonState("voltage", "off");
        //table.setMonState("humidity", "off");
        Object.keys(descr).forEach(function(key){
            //console.log("key", descr[key].name.toLowerCase());
            table.setMonState(key/*descr[key].name.toLowerCase()*/, "off");
        });

        document.body.appendChild(nsfield.content);
        document.body.appendChild(cwfield.content);
        document.body.appendChild(table.content);
    });
})();

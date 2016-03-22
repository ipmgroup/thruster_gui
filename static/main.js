(function() {
    "use strict";

    var descr = {
        speed:          { name: "Speed",        set: true,  mon: true  },
        accel:          { name: "Accel",        set: true,  mon: false },
        voltage:        { name: "Voltage",      set: false, mon: true  },
        current:        { name: "Current",      set: false, mon: true  },
        temperature:    { name: "Temperature",  set: false, mon: true  },
        humidity:       { name: "Humidity",     set: false, mon: true  },
        status:         { name: "Status",       set: false, mon: true  }
    };

    window.addEventListener("load", function() {
        var comm = new MotorControl.Comm(connected, notify);
        var table = new MotorControl.ControlTable(descr, onClick);

        function connected() {
            comm.send("test", { ololo: 1 }, function(err, data) {
                console.log("RESP", err, data);
            });

            comm.send("test", { ololo: 2 }, function(err, data) {
                console.log("RESP", err, data);
            });

            // comm.send("ls", function(err, data) {
            //     console.log("ls finished:", data);
            // });
            //
            // comm.send("asdf", "fdsa", function(err, data){
            //     console.log("asdf", err, data);
            // })
        }

        function notify(type, data) {
            console.log("NOTIFY", type, data);
        }

        function onClick(param) {
            console.log("Clicked", param);

            if(param.type == "set"){
                table.setTarget(param.name, param.value);
            }else if(param.type == "mon"){
                comm.send("mon", {id: -1, name: param.name, value: param.value}, function(err, data){
                    console.log("RESP", err, data);
                });
            }
        }

        table.setMonState("voltage", "off");
        table.setMonState("humidity", "off");

        document.body.appendChild(table.content);
    });
})();

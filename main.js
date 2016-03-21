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
        var table = new MotorControl.ControlTable(descr, function(param) {
            console.log(param);
        });

        table.setMonState("voltage", "on");
        table.setMonState("humidity", "off");

        document.body.appendChild(table.content);
    });
})();

(function() {
    "use strict";

    window.addEventListener("load", function() {
        var mk = document.createElement.bind(document),
            table = mk("table");


        function mkInput(type, value) {
            var el = mk("input");
            el.setAttribute("type", type);
            el.setAttribute("value", value);
            return el;
        }

        var lines = [
            { name: "Speed",        set: true,  mon: true  },
            { name: "Accel",        set: true,  mon: false },
            { name: "Voltage",      set: false, mon: true  },
            { name: "Current",      set: false, mon: true  },
            { name: "Temperature",  set: false, mon: true  },
            { name: "Humidity",     set: false, mon: true  },
            { name: "Status",       set: false, mon: true  }
        ].map(function(conf) {
            var rs = {
                el: mk("tr"),
                tgtValIn: null,
                tgtSendBtn: null,
                tgtValOut: null,
                actValOut: null,
                onoffBtn: null,
                onoffSts: null
            };

            var cols = {};
            [ "name", "setter", "tgtVal", "actVal", "mon" ].forEach(function(name) {
                var el = cols[name] = mk("td");
                rs.el.appendChild(el);
            });

            cols.name.textContent = conf.name;

            if (conf.mon) {
                rs.onoffBtn = mkInput("button", "on");
                cols.mon.appendChild(rs.onoffBtn);
            }

            return rs;
        });

        lines.forEach(function(line) { table.appendChild(line.el); })

        table.addEventListener("click", clickHandler);

        function prop(name) {
            return function(obj) {
                return obj[name];
            };
        }

        function clickHandler(event) {
            //var i, onoff = lines.map(function(line) { return line["onoffBtn"]; });
            var i, onoff = lines.map(prop("onoffBtn"));

            if ((i = onoff.indexOf(event.target)) >= 0) {
                onoff[i].setAttribute("value", "...")
            }
        }

        document.body.appendChild(table);
    });
})();

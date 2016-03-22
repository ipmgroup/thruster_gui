(function(mk) {
    "use strict";

    window.MotorControl = window.MotorControl || {};
    window.MotorControl.ControlTable = ControlTable;

    function prop(name) { return function(obj) { return obj[name]; }; }
    function mkInput(type, value) {
        var el = mk("input");
        el.type = type;
        el.value = value;
        return el;
    }

    function ControlTable(descr, handler) {
        var self = this, table = self.content = mk("table");

        self._descr = descr;
        self._dnames = Object.keys(descr);

        self._genLines();
        self._attachHandler(handler);
    }

    ControlTable.prototype._genLines = function() {
        var self = this, table = self.content;

        var lines = self._lines = self._dnames.map(function(dname) {
            var conf = self._descr[dname], rs = {
                el: mk("tr"),
                setValue: null,
                setButton: null,
                tgt: null,
                act: null,
                monButton: null,
                monButtonAction: "on",
                monStatus: null
            };

            var cols = {};
            [ "name", "set", "tgt", "act", "mon" ].forEach(function(name) {
                var el = cols[name] = mk("td");
                rs.el.appendChild(el);
            });

            cols.name.textContent = conf.name;

            if (conf.set) {
                cols.set.appendChild(rs.setValue = mkInput("text", ""));
                cols.set.appendChild(rs.setButton = mkInput("button", "Apply"));
                cols.tgt.appendChild(rs.tgt = mk("span"));

                rs.tgt.classList.add("text-view");
                rs.tgt.textContent = "--";
            }

            if (conf.mon) {
                cols.act.appendChild(rs.act = mk("span"));

                rs.act.classList.add("text-view");
                rs.act.textContent = "--";

                cols.mon.appendChild(rs.monButton = mkInput("button", "..."));
                cols.mon.appendChild(rs.monStatus = mk("span"));

                rs.monButton.disabled = true;
                rs.monButton.classList.add("mon-button");
                rs.monStatus.classList.add("text-view");
                rs.monStatus.textContent = "?";
            }

            return rs;
        });

        var header = mk("tr");
        [ "Name", "Setter", "Target", "Actual", "Monitor" ].forEach(function(name) {
            var el = mk("th");
            el.textContent = name;
            header.appendChild(el);
        });

        table.appendChild(header);
        lines.forEach(function(line) { table.appendChild(line.el); })
    };

    ControlTable.prototype._attachHandler = function(handler) {
        var self = this;
        var setButtons = self._lines.map(prop("setButton"));
        var monButtons = self._lines.map(prop("monButton"));

        self.content.addEventListener("click", function(event){
            var tgt = event.target, idx = setButtons.indexOf(tgt);
            var param = { event: event };

            if(idx >= 0){
                param.type = "set";
                param.name = self._dnames[idx];
                param.value = self._lines[idx].setValue.value;
            }else if((idx = monButtons.indexOf(tgt)) >= 0){
                param.type = "mon";
                param.name = self._dnames[idx];
                param.value = monButtons[idx].value;

                self.setMonState(param.name, "?");
            }else{
                return;
            }

            handler(param);
        });
    };

    ControlTable.prototype.setMonState = function(name, state) {
        var self = this, idx = self._dnames.indexOf(name);

        if (idx >= 0) {
            var line = self._lines[idx];
            var button = line.monButton, text = line.monStatus;

            switch (state) {
            case "on":
                button.value = "off";
                button.disabled = false;
                text.textContent = "enabled";
                break;

            case "off":
                button.value = "on";
                button.disabled = false;
                text.textContent = "disabled";
                break;

            case "?":
                button.value = "...";
                button.disabled = true;
                text.textContent = "?";
                break;
            }
        }
    };

    ControlTable.prototype.setTarget = function(name, value) {
        var self = this, idx = self._dnames.indexOf(name);

        if (idx >= 0) {
            var line = self._lines[idx];
            var field = line.tgt;

            field.textContent = value;
        }
    }
})(document.createElement.bind(document));

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
        //table.width = "100%";

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
                monButtonAction: 1,
                monStatus: null
            };

            var cols = {};
            [ "name", /*"unit", */"set", "tgt", "act", "mon" ].forEach(function(name) {
                var el = cols[name] = mk("td");
                rs.el.appendChild(el);
            });

            cols.name.textContent = conf.name + ((conf.unit != "")?(" (" + conf.unit + ")"):"");
            //cols.unit.textContent = conf.unit;

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
        [ "Name", /*"Unit", */"Setter", "Target", "Actual", "Monitor" ].forEach(function(name) {
            var el = mk("th");
            el.textContent = name;
            header.appendChild(el);
        });

        table.appendChild(header);
        lines.forEach(function(line) { table.appendChild(line.el); })
    };

    ControlTable.prototype._attachHandler = function(handler) {
        var self = this;
        var setValues = self._lines.map(prop("setValue"));
        var setButtons = self._lines.map(prop("setButton"));
        var monButtons = self._lines.map(prop("monButton"));

        self.content.addEventListener("click", function(event){
            var tgt = event.target, idx = setButtons.indexOf(tgt);
            var param = { event: event };

            if(idx >= 0){
                param.type = "set";
                //param.id = nodeid;
                param.name = self._dnames[idx];
                param.value = self._lines[idx].setValue.value;
            }else if((idx = monButtons.indexOf(tgt)) >= 0){
                param.type = "mon";
                //param.id = nodeid;
                param.name = self._dnames[idx];
                param.value = self._lines[idx].monButtonAction;//monButtons[idx].value;

                self.setMonState(param.name, "?");
            }else{
                return;
            }

            handler(param);
        });

        self.content.addEventListener("keypress", function(event){
            var param = {event: event};
            var target = event.target;
            var key = event.which;
            var index = setValues.indexOf(target);
            if(key == 13 && target.type == "text"){
                var value = parseInt(target.value);
                param.type = "set";
                //param.id = nodeid;
                param.name = self._dnames[index];
                param.value = value.toString(10);
                handler(param);
            }
        });
    };

    ControlTable.prototype.setMonState = function(name, state) {
        var self = this, idx = self._dnames.indexOf(name);

        if (idx >= 0) {
            var line = self._lines[idx];
            var button = line.monButton, text = line.monStatus;

            if(button == null){
                return;
            }

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

    ControlTable.prototype.setMonAction = function(name, newAction){
        var self = this, idx = self._dnames.indexOf(name);

        if(idx >= 0){
            var line = self._lines[idx];
            line.monButtonAction = newAction;
        }
    };

    ControlTable.prototype.setActualValue = function(name, value){
        var self = this, idx = self._dnames.indexOf(name);

        if(idx >= 0){
            var line = self._lines[idx];
            line.act.textContent = value;
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

    ControlTable.prototype.resetActual = function(name){
        var self = this;
        var index = self._dnames.indexOf(name);

        if(index >= 0){
            var line = self._lines[index];
            var cell = line.act;
            if(cell != null && cell.textContent != ""){
                cell.textContent = "--";
            }
        }
    }

    ControlTable.prototype.resetTarget = function(name){
        var self = this;
        var index = self._dnames.indexOf(name);

        if(index >= 0){
            var line = self._lines[index];
            var cell = line.tgt;
            if(cell != null && cell.textContent != ""){
                cell.textContent = "--";
            }
        }
    }

    ControlTable.prototype.resetTable = function(){
        var self = this;
        self._dnames.forEach(function(name){
            self.resetActual(name);
            self.resetTarget(name);
            self.setMonState(name, "off");
            self.setMonAction(name, 1);
        });
    }

})(document.createElement.bind(document));

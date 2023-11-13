(function(mk){
    "use strict";

    window.MotorControl = window.MotorControl || {};
    window.MotorControl.NodeselectField = NodeselectField;

    function prop(name) { return function(obj) { return obj[name]; }; }

    function NodeselectField(handler, defaultNodeid){
        var self = this;
        var nsfield = self.content = mk("fieldset");

        self.nodeid = defaultNodeid;

        self._legend = null;
        self._label = null;
        self._input = null;
        self._setButton = null;
        self._disableHiddenButton = null;

        self._genField();
        self._attachHandler(handler);
    }

    function mkInput(type, name, value) {
        var el = mk("input");
        el.type = type;
        el.name = name;
        el.value = value;
        return el;
    }

    NodeselectField.prototype._genField = function(){
        var self = this;

        var legend = self._legend = mk("legend");
        legend.textContent = "Select Node";
        self.content.appendChild(legend);

        var label = self._label = mk("label");
        label.textContent = "Enter ID: ";
        self.content.appendChild(label);

        var input = self._input = mkInput("text", "nsinput", "0x" + self.nodeid);
        self._label.appendChild(input);

        var setButton = self._setButton = mkInput("button", "nsbutton", "Select");
        self.content.appendChild(setButton);

        var dhb = self._disableHiddenButton = mkInput("button", "dhb", "Disable hidden monitors");
        self.content.appendChild(dhb);
    }

    NodeselectField.prototype._attachHandler = function(handler){
        var self = this;
        var field = self.content;

        field.addEventListener("click", function(event){
            var param = {event: event};
            var target = event.target;
            //console.log(target);
            if(target.type == "button"){
                if(target.name == "nsbutton"){
                    var value = parseInt(self._input.value);
                    self.nodeid = value.toString(16);
                    param.type = "setid";
                    param.id = self.nodeid;
                    //console.log("nsbutton");
                }else if(target.name == "dhb"){
                    param.type = "disable_hidden";
                    param.id = self.nodeid.toString(16);
                    //console.log("disable_hidden");
                }

                handler(param);
            }
        });

        field.addEventListener("keypress", function(event){
            var param = {event: event};
            var target = event.target;
            var key = event.which;
            if(target.type == "text" && key == 13){
                var value = parseInt(self._input.value);
                self.nodeid = value.toString(16);
                param.type = "setid";
                param.id = self.nodeid;
                //console.log("nsbutton");
                handler(param);
            }
        });

    }

})(document.createElement.bind(document));

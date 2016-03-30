(function(mk){
    "use strict";

    window.MotorControl = window.MotorControl || {};
    window.MotorControl.ControlwordField = ControlwordField;

    function prop(name) { return function(obj) { return obj[name]; }; }

    function ControlwordField(flags, handler){
        var self = this;
        var cwfield = self.content = mk("fieldset");

        self._flags = flags;
        self._fnames = Object.keys(flags);

        self._legend = null;
        self._checkboxes = null;
        self._cblabels = null;
        self._input = null;
        self._cw = 0;
        self._button = null;

        self._genField();
        self._attachHandler(handler);
    }

    function mkInput(type, name/*, value*/) {
        var el = mk("input");
        el.type = type;
        el.name = name;
        //el.value = value;
        return el;
    }

    ControlwordField.prototype._genCheckboxes = function(){
        var self = this;
        //var field = self.content;
        var checkboxes = self._checkboxes = self._fnames.map(function(name){
            var el = mkInput("checkbox", name);
            //console.log("genCheckbox", el);
            //field.appendChild(el);
            return el;
        });
        //console.log("generated_checkboxes", self._checkboxes);
    }

    ControlwordField.prototype._genCbLabels = function(){
        var self = this;
        //var field = self.content;
        var labels = self._cblabels = self._fnames.map(function(name){
            var el = mk("label");
            el.textContent = self._flags[name].name;
            return el;
        });
    }

    ControlwordField.prototype._genField = function(){
        var self = this;
        self._genCheckboxes();
        self._genCbLabels();
        var checkboxes = self._checkboxes;
        var labels = self._cblabels;
        var legend = self._legend = mk("legend");
        legend.textContent = "Control Word";
        self.content.appendChild(legend);
        for(var i = 0; i < Object.keys(checkboxes).length && i < Object.keys(labels).length; i ++){
            labels[i].insertBefore(checkboxes[i], labels[i].firstChild)
            self.content.appendChild(labels[i]);
            self.content.appendChild(mk("br"));
        }
        var input = self._input = mkInput("text", "cwinput");
        input.value = "0x" + self._cw;
        self.content.appendChild(input);
        var button = self._button = mkInput("button", "cwbutton");
        button.value = "Apply";
        self.content.appendChild(button);
    }

    ControlwordField.prototype.updateCheckboxes = function(value){
        var self = this;
        self._cw = parseInt(value);
        self._checkboxes.forEach(function(cb){
            var pos = self._flags[cb.name].bitPos;
            cb.checked = self._cw & (1 << pos);
        });
    }

    ControlwordField.prototype._attachHandler = function(handler){
        var self = this;
        var field = self.content;

        field.addEventListener("change", function(event){
            var target = event.target;
            if(target.type == "checkbox"){
                var pos = self._flags[target.name].bitPos;
                console.log(target.name, target.checked + " (" + pos + ")");
                self._cw = ~(~(self._cw) | (1 << pos)) | (target.checked << pos);
                self._input.value = "0x" + self._cw.toString(16);
            }else if(target.type == "text"){
                console.log(target.name, target.value);
                self.updateCheckboxes(target.value);
            }
        });

        field.addEventListener("keypress", function(event){
            var target = event.target;
            var key = event.which;
            if(key == 13 && target.type == "text"){
                console.log(target.name, target.value);
                self.updateCheckboxes(target.value);
                //TODO: Send data to server.
            }
        });

        field.addEventListener("click", function(event){
            var target = event.target;
            if(target.type == "button"){
                var value = self._input.value;
                console.log(target.name, value);
                self.updateCheckboxes(value);
                //TODO: Send data to server.
            }
        });
    }

})(document.createElement.bind(document));

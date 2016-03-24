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
        var field = self.content;
        var checkboxes = self._checkboxes = self._fnames.map(function(name){
            var el = mkInput("checkbox", name);
            //console.log("genCheckbox", el);
            //field.appendChild(el);
            return el;
        });
        //console.log("generated_checkboxes", self._checkboxes);
    }

    ControlwordField.prototype._genField = function(){
        var self = this;
        self._genCheckboxes();
        var checkboxes = self._checkboxes;
        //console.log("checkboxes", self._checkboxes);
        checkboxes.forEach(function(cb){
            self.content.appendChild(cb);
        });
    }

    ControlwordField.prototype._attachHandler = function(handler){
        return;
    }

})(document.createElement.bind(document));

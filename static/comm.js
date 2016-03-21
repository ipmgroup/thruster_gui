(function(mk) {
    "use strict";

    window.MotorControl = window.MotorControl || {};
    window.MotorControl.Comm = Comm;

    function Comm(opened, notify) {
        var self = this;

        self._notify = notify;
        var ws = self._ws = new WebSocket([ "ws:", window.location.host ].join("//"));
        self._reqs = [];
        self._rid = -1;
        self._opened = false;

        ws.onopen = function() {
            self._opened = true;
            opened();
        };

        ws.onclose = ws.onerror = function() {
            ws.onclose = ws.onerror = function() {};
            ws.close();

            self._reqs = [];
            self._rid = -1;
            self._opened = false;
            self._ws = null;
        };

        ws.onmessage = function(event) {
            self._recv(JSON.parse(event.data));
        };
    }

    function id(req) { return req.id; }
    Comm.prototype._recv = function(data) {
        var self = this, i;

        // console.log("COMM_RECV", data.type, data.data);

        if (data.id !== undefined &&
            (i = self._reqs.map(id).indexOf(data.id)) >= 0 &&
            self._reqs[i].type === data.type) {
            self._reqs[i].handler(null, data.data);
            self._reqs.splice(i, 1);
        } else
            self._notify(data.type, data.data);
    };

    Comm.prototype.send = function(type, data, callback) {
        var self = this;

        if (typeof(data) === "function") {
            callback = data;
            data = {};
        }

        if (!self._opened)
            return callback && callback(new Error("connection lost"), null);

        // console.log("COMM_SEND", type, data);

        var id = ++self._rid;
        self._reqs.push({ type: type, id: id, handler: callback });
        self._ws.send(JSON.stringify({ type: type, data: data, id: id }));
    };
})();

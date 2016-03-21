"use strict";

module.exports = {
    "test": function(data, resp) {
        setTimeout(function() {
            data.foo = "bar";
            resp(data);
        }, 1000);
    }
};

(function() {
    function outcome() {
        return false;
    }

    function process(callbackSuccess, callbackFailure) {
        if (outcome())
            callbackSuccess();
        else
            callbackFailure();
    }

    process(function() {
        alert("OKAY");
    }, function() {
        alert("OOPS");
    })


        var exec = {
            try: function() {
                var fn, callback, ret;
                args = [];
                if (arguments.length) {
                    for (var i = 0; i < arguments.length; i++) {
                        args[i] = arguments[i];
                    }
                    callback = mod_type(args[args.length - 1]) === "fn" ? args.pop() : null;
                    if (1) {
                        try {
                            args[0].apply(args);
                            if (callback) {
                                callback(null, ret)
                            } else {
                                return ret;
                            }
                        } catch (e) {
                            if (callback) callback(e);
                        }
                    }
                }
            }
        }


    exec.try(function(data, type) {
        console.log(data, type);
        return null;
    }, 'hello', 'string', function(error, value) {
        error ? console.log(error) : console.log(value)
    })

    function mod_type(data) {
        var dict = {
            "[object Boolean]": "bool",
            "[object Undefined]": "undef",
            "[object Null]": "null",
            "[object Object]": "obj",
            "[object Array]": "arr",
            "[object Number]": "num",
            "[object String]": "str",
            "[object Function]": "fn"
        };
        var type = dict[Object.prototype.toString.call(data)];
        if (type) {
            return type === "number" && isNaN(data) ? "nan" : type;
        }
        return Object.prototype.toString.call(data).match(/\s([a-zA-Z]+)/)[1].toLowerCase().replace(/^html|element/igm, '')
    }

    function is_primitive(obj) {
        return ['[object Boolean]', "[object Undefined]", "[object Null]", "[object Object]", '[object String]'].indexOf(Object.prototype.toString.call(obj)) > -1;
    }

    function mod_len(obj) {
        switch (obj) {
            case undefined:
            case null:
            case NaN:
            case "":
            case Infinity:
            case false:
            case true:
            return 0;
            default:
            var type = mod_type(obj);
            if ("object" === type) {
                return ((obj).hasOwnProperty('length')) ? obj.length : Object.keys(obj).length;
            } else if (type === "array" || type === "string") {
                return obj.length;
            } else {
                return 0;
            }
            break;
        }
    };

    function mod_has(obj, key, cb = undefined, ctx = null) {
        if (is_primitive(obj)) return false;
        if (mod_type(obj) === 'object') {
            return Object.prototype.hasOwnProperty.call(obj, key) ? (cb ? cb(obj, key) : true) : false;
        }
    };

    mod_has({'name': true}, 'name', function cb(key) {console.log(this[key])})

    function parseURIDecode(url) {
        var uri = parseURI(url);
        uri.query_keys = lodash.mapValues(uri.query_keys, function(value, key, obj) {
            return decodeURIComponent(value);
        })
        for (var key in uri) {
            mod_has(uri, key)
        }
    }

})();

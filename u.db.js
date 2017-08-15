u.db = {
    check: function(type) {
        if (type) type = type === "session" ? "sessionStorage" : type === "local" ? "localStorage" : type;
        if (!type) type = 'localStorage';
        if (typeof this.supported !== 'undefined' && this.supported[type]) {
            return this.supported[type];
        }
        var db = type ? window[type] : window.localStorage;
        var supported = false;
        try {
            db.setItem("test", true);
            db.removeItem("test");
            supported = true
        } catch (e) {
            return false
        }
        this.supported = this.supported || {};
        this.supported[type] = supported;
        return supported
    },
    get: function(key, type) {
        if (!this.check(type)) {return;}
        if (type) {type = type === "session" ? "sessionStorage" : type === "local" ? "localStorage" : type;}
        if (!type) {type = 'localStorage';}
        var db = type ? window[type] : window.localStorage;
        var data, nkey, val;
        try {
            if (key.split(".")[1]) {
                nkey = key.split(".")[0];
                val =  key.split(".")[1];
                data = JSON.parse(db.getItem(nkey));
                if (null === data) {return {};}
                else {return data[val]}
            } else {
                data = db.getItem(key);
                if (null === data) return {};
                if (data && data.charAt[0] === '{') {
                    data = JSON.parse(data);
                    if (data) {return data} else {return {}}
                }
                else return data
            }
    } catch (e) {
        return {}
    }
},
set: function(name, obj, type) {
    if (!this.check(type)) return;
    if (type) type = type === "session" ? "sessionStorage" : type === "local" ? "localStorage" : type;
    if (!type) type = 'localStorage';
    var db = type ? window[type] : window.localStorage;
    var prev_data;
    var obj_type = kindof(obj);
    try {
        prev_data = db.getItem(name);
        if (prev_data && prev_data.charAt[0] === '{') {
            prev_data = JSON.parse(prev_data);
            if (obj_type === "object") {
                for (var key in obj) {
                    if (obj.hasOwnProperty(key) && kindof(prev_data) === 'object') {
                        prev_data[key] = obj[key];
                    }
                }
                db.setItem(name, JSON.stringify(prev_data))
            }
        }
        else if (obj_type === 'number' || obj_type === 'string' || obj_type === 'boolean' || obj_type === 'null') {db.setItem(name, obj)}
            return true
        } catch (e) {
            return false
        }
    }
};

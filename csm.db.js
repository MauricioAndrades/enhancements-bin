// 20170815.150895
// localstorage util.
// work in progress. Not done.
var db = (function() {
    return init();
    function init() {
        return {
            fetch: function(type) {
                function is_supported(type) {
                    if (typeof this.supported !== "undefined" && this.supported[type]) {
                        return this.supported[type];
                    }
                    var supported = false;
                    var db = window[type];
                    try {
                        db.setItem("test", true);
                        db.removeItem("test");
                        supported = true;
                    } catch (e) {
                        return false;
                    }
                    this.supported = this.supported || {};
                    this.supported[type] = supported;
                    return supported;
                };
                var dict = {
                    session: "sessionStorage",
                    local: "localStorage"
                },
                type = dict[type] ? dict[type] : 'localStorage';
                if (is_supported(type)) {
                    return window[type];
                } else {
                    return null
                };
            },
            kindof: function kindof(data, is) {
                var type = Object.prototype.toString.call(data).match(/\s([a-zA-Z]+)/)[1].toLowerCase().replace(/^html|element/gim, "");
                if (type === 'number' && isNaN(data)) {
                    type = 'nan';
                }
                if (is) {
                    return type === is;
                }
                return type;
            },
            get_seg: function(path) {
                var segments = [];
                if (/\[(.*?)\]/.test(path)) {
                    path = path.split(/\[(.*?)\]/).filter(function(p) {
                        return p !== "";
                    });
                    path.forEach(function(path) {
                        if (path[0] === '"' || path[0] === "'") {
                            segments.push(path.replace(/\'|\"/igm, ""));
                        } else {
                            if (path.split(".").length) {
                                let split_path = path.split(".");
                                while (split_path.length) {
                                    segments.push(split_path.splice(0, 1)[0]);
                                }
                            }
                        }
                    });
                } else {
                    var split = path.split(".");
                    while (split.length) {
                        segments.push(split.splice(0, 1)[0]);
                    }
                }
                segments = segments.filter(function(seg) {return seg !== "";});
                return segments;
            },
            is_leaf: function(value) {
                return !this.kindof(value, 'object');
            },
            fetch_seg: function fetch(root, segments, val) {
                var curr_node;
                if (segments.length) {
                    curr_node = root[segments.shift()];
                    if (typeof(curr_node) !== "undefined") {
                        if (!segments.length) {
                            if (val) {
                                curr_node = val;
                            }
                            return curr_node;
                        }
                        if (segments[1] && typeof curr_node[segments[1]] !== 'undefined') {
                            return this.fetch_seg(curr_node, segments.shift(), val)
                        } else {
                            return null;
                        }
                    } else {
                        return null;
                    }
                } else {
                    if (val) {root = val;}
                    return root;
                }
            },
            find: function(db, path) {
                if (arguments.length > 2) {for (var i = 2; i < arguments.length; i++) {path = path + '["' + arguments[i] + '"]';}}
                this.segments = this.get_seg(path);
                if (this.segments && this.segments.length) {
                    this.root = this.parse(db.getItem(this.segments.shift()));
                    if (this.kindof(this.root, 'object')) return this.fetch_seg(this.root, this.segments);
                    else return this.root;
                }
            },
            get: function(key, type) {
                if (key === 'session' || key === 'local') {return this.fetch(key);}
                var db = this.fetch(type);
                var data, nkey, val;
                if (db) {
                    try {
                        data = this.parse(this.find(db, key));
                        return typeof data === 'undefined' ? null : data;
                    } catch (e) {
                        return null;
                    }
                } else {
                    return null;
                }
            },
            set: function(name, val, type) {
                var db = this.fetch(type);
                if (!db) {return false}
                var prev_data;
                var obj_type = this.kindof(val);
                var prev_data = this.parse(this.find(db, name));
                this.segments = this.get_seg(name);
                function prep_path(root, segments) {
                    var curr_seg = segments.shift();
                    if (curr_seg) {
                        root = root[curr_seg]||{};
                        if (segments.length) {prep_path(root, segments)}
                    }
                }
                this.root_segment = this.segments.shift();
                this.root = this.parse(db.getItem(this.root_segment));
                if (null === this.root) {this.root = {};}
                if (this.segments.length) {
                    prep_path(this.root, Array.prototype.slice.call(this.segments));
                    this.fetch_seg(this.root, this.segments, val);
                }
                if (!this.segments.length) db.setItem(this.root_segment, JSON.stringify(this.root));
                return;
                try {
                    prev_data = this.parse(this.find(db, name));
                    if (prev_data) {
                        if (obj_type === "object") {
                            for (var key in val) {
                                if (val.hasOwnProperty(key) && this.kindof(prev_data) === "object") {
                                    prev_data[key] = val[key];
                                }
                            }
                            db.setItem(name, JSON.stringify(prev_data));
                        }
                    } else if (obj_type === "number" || obj_type === "string" || obj_type === "boolean" || obj_type === "null") {
                        db.setItem(name, val);
                    }
                    return true;
                } catch (e) {
                    return false;
                }
            },
            parse: function(value) {
                var ret;
                try {
                    return JSON.parse(value);
                } catch (e) {
                    return value;
                }
            },
            has: function(name) {
                var has = false;
                for (var key in this.lookup) {
                    if (this.lookup.hasOwnProperty(key) && this.is_supported(key)) {
                        if (this.get(name, key)) {
                            has = true;
                            break;
                        }
                    }
                }
                return has;
            }
        };
    }
})();

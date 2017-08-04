(function(global, undefined) {
    "use strict";
    if (global.setImmediate) {
        return
    }
    var nextHandle = 1;
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var registerImmediate;

    function setImmediate(callback) {
        if (typeof callback !== "function") {
            callback = new Function("" + callback)
        }
        var args = new Array(arguments.length - 1);
        for (var i = 0; i < args.length; i++) {
            args[i] = arguments[i + 1]
        }
        var task = {
            callback: callback,
            args: args
        };
        tasksByHandle[nextHandle] = task;
        registerImmediate(nextHandle);
        return nextHandle++
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle]
    }

    function run(task) {
        var callback = task.callback;
        var args = task.args;
        switch (args.length) {
            case 0:
            callback();
            break;
            case 1:
            callback(args[0]);
            break;
            case 2:
            callback(args[0], args[1]);
            break;
            case 3:
            callback(args[0], args[1], args[2]);
            break;
            default:
            callback.apply(undefined, args);
            break
        }
    }

    function runIfPresent(handle) {
        if (currentlyRunningATask) {
            setTimeout(runIfPresent, 0, handle)
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    run(task)
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false
                }
            }
        }
    }

    function installNextTickImplementation() {
        registerImmediate = function(handle) {
            process.nextTick(function() {
                runIfPresent(handle)
            })
        }
    }

    function canUsePostMessage() {
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous
        }
    }

    function installPostMessageImplementation() {
        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global && typeof event.data === "string" && event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length))
            }
        };
        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false)
        } else {
            global.attachEvent("onmessage", onGlobalMessage)
        }
        registerImmediate = function(handle) {
            global.postMessage(messagePrefix + handle, "*")
        }
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel;
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle)
        };
        registerImmediate = function(handle) {
            channel.port2.postMessage(handle)
        }
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        registerImmediate = function(handle) {
            var script = doc.createElement("script");
            script.onreadystatechange = function() {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null
            };
            html.appendChild(script)
        }
    }

    function installSetTimeoutImplementation() {
        registerImmediate = function(handle) {
            setTimeout(runIfPresent, 0, handle)
        }
    }
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;
    if ({}.toString.call(global.process) === "[object process]") {
        installNextTickImplementation()
    } else if (canUsePostMessage()) {
        installPostMessageImplementation()
    } else if (global.MessageChannel) {
        installMessageChannelImplementation()
    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        installReadyStateChangeImplementation()
    } else {
        installSetTimeoutImplementation()
    }
    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate
})(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self);

// load all tags;
window.csm = (function(exp) {
    var info = {
        "5": {
            "name": "Google Adwords Remarketing",
            "uid": "5"
        },
        "7": {
            "name": "Bing Ads Universal Event Tracking (uet)",
            "uid": "7"
        },
        "8": {
            "name": "Yahoo Dot",
            "uid": "8"
        },
        "10": {
            "name": "Clicktale Balkan",
            "uid": "10"
        },
        "11": {
            "name": "Kenshoo Conversion",
            "uid": "11"
        },
        "19": {
            "name": "Megamenu Coremetrics Kill Switch: Tealium Custom Container",
            "uid": "19"
        },
        "22": {
            "name": "Pinterest Conversion Tracking Pixel: Tealium Pixel (or Iframe) Container",
            "uid": "22"
        },
        "24": {
            "name": "Channeladvisor V2: Channel Advisor",
            "uid": "24"
        },
        "25": {
            "name": "Tell Apart",
            "uid": "25"
        },
        "27": {
            "name": "Facebook Buttons",
            "uid": "27"
        },
        "28": {
            "name": "Conversant (commission Junction)",
            "uid": "28"
        },
        "34": {
            "name": "Channel Advisor: Tealium Custom Container",
            "uid": "34"
        },
        "36": {
            "name": "See Why",
            "uid": "36"
        },
        "44": {
            "name": "Certona",
            "uid": "44"
        },
        "48": {
            "name": "Connect Commerce: Tealium Generic Tag",
            "uid": "48"
        },
        "53": {
            "name": "Doubleclick - Landing Tags: Doubleclick - Floodlight",
            "uid": "53"
        },
        "54": {
            "name": "Doubleclick - Order Confirmation: Doubleclick - Floodlight",
            "uid": "54"
        },
        "55": {
            "name": "Doubleclick Wedding Confirmation: Doubleclick - Floodlight",
            "uid": "55"
        },
        "59": {
            "name": "Adobe Analytics: Sitecatalyst Appmeasurement for Js",
            "uid": "59"
        },
        "63": {
            "name": "Google Adwords Conversion",
            "uid": "63"
        },
        "64": {
            "name": "Foresee Satisfaction Analytics",
            "uid": "64"
        },
        "66": {
            "name": "Inferclick: Tealium Generic Tag",
            "uid": "66"
        },
        "70": {
            "name": "Polyvore Conversion Pixel",
            "uid": "70"
        },
        "82": {
            "name": "True Fit Order Confirmation: Tealium Generic Tag",
            "uid": "82"
        },
        "84": {
            "name": "Datalogix: Tealium Custom Container",
            "uid": "84"
        },
        "86": {
            "name": "Type_ahead_used Event Code: Tealium Custom Container",
            "uid": "86"
        },
        "87": {
            "name": "Select_shipping Event Code: Tealium Custom Container",
            "uid": "87"
        },
        "88": {
            "name": "Search Click Handler: Tealium Custom Container",
            "uid": "88"
        },
        "89": {
            "name": "Bonus Offer Click for Bogo: Tealium Custom Container",
            "uid": "89"
        },
        "90": {
            "name": "App Download Event: Tealium Custom Container",
            "uid": "90"
        },
        "96": {
            "name": "Calphalon Bridal Tracking: Doubleclick - Floodlight",
            "uid": "96"
        },
        "97": {
            "name": "Facebook Tag",
            "uid": "97"
        },
        "101": {
            "name": "Belk.video 2.7.0.0: Tealium Custom Container",
            "uid": "101"
        },
        "105": {
            "name": "Bazaarvoice",
            "uid": "105"
        },
        "107": {
            "name": "True Fit: Tealium Custom Container",
            "uid": "107"
        },
        "135": {
            "name": "Opinion Lab Tab V2: Tealium Custom Container",
            "uid": "135"
        },
        "136": {
            "name": "Intersectionobserver Kill Switch: Tealium Custom Container",
            "uid": "136"
        },
        "139": {
            "name": "Liveperson Liveengage 2.0",
            "uid": "139"
        },
        "140": {
            "name": "Trigger Mail",
            "uid": "140"
        },
        "141": {
            "name": "Bluecore Purchase Pixel: Tealium Pixel (or Iframe) Container",
            "uid": "141"
        },
        "156": {
            "name": "Pinterest Add to Cart Pixel: Tealium Generic Tag",
            "uid": "156"
        },
        "157": {
            "name": "Twitter Universal Website Tag",
            "uid": "157"
        },
        "158": {
            "name": "Pinterest Pagevisit Pixel: Tealium Generic Tag",
            "uid": "158"
        },
        "159": {
            "name": "Pinterest Search Pixel: Tealium Generic Tag",
            "uid": "159"
        },
        "160": {
            "name": "Pinterest Checkout Pixel: Tealium Generic Tag",
            "uid": "160"
        },
        "165": {
            "name": "Checkout Sign-in Fix: Tealium Custom Container",
            "uid": "165"
        },
        "167": {
            "name": "Adobe Marketing Cloud Id Service",
            "uid": "167"
        },
        "168": {
            "name": "Adobe Analytics Appmeasurement for Js",
            "uid": "168"
        },
        "177": {
            "name": "C3 Site Tag: Tealium Generic Tag",
            "uid": "177"
        },
        "178": {
            "name": "C3 Store Locator Conversion: Tealium Generic Tag",
            "uid": "178"
        },
        "179": {
            "name": "C3 Purchase Conversion: Tealium Generic Tag",
            "uid": "179"
        },
        "183": {
            "name": "Pyg Gwp Copy Fix: Tealium Custom Container",
            "uid": "183"
        },
        "184": {
            "name": "Alt Image Fix: Tealium Custom Container",
            "uid": "184"
        },
        "185": {
            "name": "Bag Quick Edit Fix: Tealium Custom Container",
            "uid": "185"
        }
    };
    var before = (bfn, ofn) => ({
        bfn: bfn,
        ofn: ofn,
        exec() {
            var ret = bfn.apply(this, arguments);
            ret ? ofn.apply(this, ret) : ofn.apply(this, arguments);
        },
        init() {
            this.bfn = bfn;
            this.ofn = ofn;
            if (this.debug_config) {
                for (let i = 0; i < this.debug_config.length; i++) {
                    let type = this.debug_config[i];
                    if (type === "tags") {
                        for (var key in type) debug(utag.sender[key].send);
                    }
            }
            debug(this.ofn);
        }
        if (this.restore) {
            this.exec.restore = function() {
                return this.ofn;
            }.bind(this);
        }
        return this.exec;
    },
    debug() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
            args[i] = arguments[i]
        }
        this.debug_config = args;
        return this;
    },
    once() {
        this.restore = true;
        return this;
    }
});
    var after = (ofn, afn) => ({
        ofn: ofn,
        afn: afn,
        exec() {
            ofn.apply(this, arguments);
            afn.apply(this, arguments);
        },
        init() {
            this.ofn = ofn;
            this.afn = afn;
            if (this.debug) {
                debug(this.ofn);
                debug(this.afn);
            }
            if (this.restore) {
                this.exec.restore = function() {
                    return this.ofn;
                }.bind(this);
            }
            return this.exec;
        },
        debug() {
            this.debug = true;
            return this;
        },
        once() {
            this.restore = true;
            return this;
        }
    });
    var obj_diff = function(a, b) {
        var get_keys = function(obj) {
            return Object.keys(obj).length ? true : false;
        };
        var changed = diff.detailedDiff(a, b);
        var data = null;
        for (var key in changed) {
            if (get_keys(changed[key])) {
                data = data || {};
                data[key] = changed[key];
            }
        }
        return data;
    }
    exp.loadrules_ovrd = function() {
        return (function() {
            utag.handler.LR = after(utag.handler.LR, function afn() {
                logc("ovrd: utag.handler.LR");
                for (var key in utag.loader.cfg) {
                    if (utag.loader.cfg.hasOwnProperty(key)) {
                        utag.loader.cfg[key].load = 1;
                    }
                }
            }).debug().once().init();
        })();
    };
    exp.sender_ovrd = function() {
        var bfn = function bfn(a, b) {
            var udo = clone(b);
            if (this.extend && this.extend.length) {
                for (let i = 0; i < this.extend.length; i++) {
                    this.extend[i](a, b);
                }
            }
            if (this.info) {
                let name = "";
                if (info[this.info.UID].name) {
                    name = info[this.info.UID].name;
                }
                console.group("TAG UID: " + this.info.UID + ": " + name);
                console.log(this);
                console.group("b:");
                console.log(["@send:", b]);
                let diff = obj_diff(udo, b);
                if (diff) {
                    console.log(["@ext", diff]);
                }
                console.groupEnd("b:");
                console.groupEnd("TAG UID: " + this.info.UID);
                console.log("\n");
            }
        };
        for (var key in utag.sender) {
            if (utag.sender.hasOwnProperty(key)) {
                let u = utag.sender[key];
                u.info = {
                    UID: key
                };
                u.send = before(bfn, utag.sender[key].send).debug({
                    tags: [14]
                }).init();
            }
        }
    };
    exp.before = before;
    exp.after = after;
    return exp;
})({});

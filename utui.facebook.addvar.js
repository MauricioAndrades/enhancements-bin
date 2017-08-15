// fix for broken automator add variable.
// allows a serial sequence.
//
var add_udo_variable = function(name, type, description) {
    return new Promise(function(resolve, reject) {
        function build_variable_spec(name, type, description) {
            function validate_variable_spec(spec) {
                return spec.type && spec.name ? true : false;
            }
            if (!type || type === "udo" || type === "js") {
                type = "js";
            }
            if (type === "cookie" || type === "cp") {
                type = "cp";
            }
            if (type === "querystring" || type === "qs" || type === 'qp') {
                type = "qs";
            }
            description = description || "";
            var variable_spec = {
                title: '',
                name: name,
                type: type,
                desc: description
            }
            if (validate_variable_spec(variable_spec)) {
                return variable_spec;
            } else {
                console.log('missing variable spec params');
                return false;
            }
        };
        function add_var(variable_spec) {
            function get_highest_id() {
                var id, highestId = 0,
                lastdefineid = +utui.data.settings.lastdefineid;
                for (var i in utui.data.define) {
                    if (!utui.data.define.hasOwnProperty(i)) continue;
                    var id = utui.data.define[i]._id;
                    if (+id > highestId) {
                        highestId = +id;
                    }
                }
                if (lastdefineid > highestId) {
                    highestId = lastdefineid;
                }
                utui.data.settings.lastdefineid = highestId.toString();
                return highestId || 0;
            }
            function get_local_last_id() {
                var maxId = 0,
                lastSettingsId = utui.data.settings.lastdefineid;
                if (typeof lastSettingsId !== "undefined") {
                    maxId = +lastSettingsId || 0;
                }
                for (var i in utui.data.define) {
                    var num = +i;
                    if (num > maxId) {
                        maxId = num;
                    }
                }
                return (utui.data.settings.lastdefineid = this._nextId > maxId ? this._nextId - 1 : maxId);
            }
            var container = "newvariable";
            var namespace = "datasource_add_dialog";
            var addItem = function(nextId) {
                var varName = variable_spec.type + "." + variable_spec.name,
                delay = 300,
                setValInterval;
                function selectVar() {
                    if ($("#var").find('option[value="' + varName + '"]').length > 0) {
                        $("#var").val(varName);
                        clearInterval(setValInterval);
                    }
                }
                function selectSet() {
                    if ($("#" + _setContainer).find('option[value="' + varName + '"]').length > 0) {
                        $("#" + _setContainer).val(varName);
                        clearInterval(setValInterval);
                    }
                }
                utui.define.addDataSource(nextId, variable_spec.title, variable_spec.name, variable_spec.type, variable_spec.desc);
                delete utui.customizations.validationMap[container];
                if (container.split("_")[0] === "customize") {
                    if ($("#var").length > 0) {
                        setValInterval = setInterval(selectVar, delay);
                    } else if (typeof _setContainer != "undefined" && $("#" + _setContainer).length > 0) {
                        setValInterval = setInterval(selectSet, delay);
                    }
                }
                utui.define.lastAdded.push(variable_spec);
                $("#filter_showall").trigger("click");
            };
            function is_valid_data_source(container, variable_spec, namespace) {
                var $editName = $("#" + container + "_editname");
                var extensionVars = {};
                var invalidNameMsg = utui.define.isInvalidVariableName(variable_spec.name, variable_spec.type);
                utui.define.lastAdded = [];
                if (variable_spec.title.length + variable_spec.name.length + variable_spec.desc.length === 0) return false;
                for (var i in utui.data.define) {
                    if (utui.data.define[i].type === variable_spec.type) {
                        extensionVars[utui.data.define[i].name] = 1;
                    }
                }
                if (invalidNameMsg) {
                    return false;
                }
                if (typeof extensionVars[variable_spec.name] !== "undefined") {
                    console.log('duplicated');
                    return false;
                }
                return true;
            }
            if (is_valid_data_source(container, variable_spec, namespace)) {
                utui.define.getNextId.fromServer(1, null, function(providedLastId, count, nextId) {
                    addItem(nextId);
                    if (typeof _callback != "undefined") {
                        _callback(true);
                    }
                }, function(nextId) {
                    addItem(nextId);
                    if (typeof _callback != "undefined") {
                        _callback(true);
                    }
                });
            } else {
                if (typeof _callback != "undefined") {
                    _callback(false);
                }
            }
        }
        var variable_spec = build_variable_spec(name, type, description);
        if (variable_spec) {
            try {
                add_var(variable_spec);
                resolve(true);
            } catch (e) {
                reject(e);
                // statements
                console.log(e);
            }
        }
    })
}
var sequence = function(exec, tasks) {
    var sequence = Promise.resolve();
    tasks.forEach(function(task) {
        sequence = sequence.then(function() {
            return exec(task);
        }).then(function(result) {
            console.log('added ' + result);
            return result;
        });
    })
    return sequence;
}
var variables = Object.keys({
    'facebook.value': 'cart.value,purch.value',
    'facebook.currency': 'cart.currency,purch.currency',
    'facebook.content_name': 'cart.content_name,purch.content_name',
    'facebook.content_ids': 'cart.content_ids,purch.content_ids',
    'facebook.num_items': 'purch.num_items'
})
// console.log(variables);
sequence(add_udo_variable, variables)

function build_mappings(obj) {
    var arr = [];
    for(var key in obj) {
        arr.push({key: key,type: 'js',variable: obj[key]})
    }
    return arr;
}

var search = {
    tag: function(param, value) {
        var ext, id;
        var tags = utui.data.manage;
        for (let key in tags) {
            let tag = tags[key];
            if (tag[param] && _.escape(tag[param].toLowerCase()) === _.escape(value.toLowerCase())) {
                id = tag.id;
            }
        }
        return id;
    }
}

var create = {
    tag: {
        mappings: function build_mappings(obj) {
            if (!obj) return;
            if (typeof obj === 'string') {
                obj = this.defaults(obj);
            }
            var arr = [];
            for (var key in obj) {
                arr.push({
                    key: key,
                    type: 'js',
                    variable: obj[key]
                })
            }
            return arr;
        },
        defaults: function(name) {
            var configs = {
                facebook: {
                    'facebook.value': 'cart.value,purch.value',
                    'facebook.currency': 'cart.currency,purch.currency',
                    'facebook.content_name': 'cart.content_name,purch.content_name',
                    'facebook.content_ids': 'cart.content_ids,purch.content_ids',
                    'facebook.num_items': 'purch.num_items'
                }
            }
            if (configs[name]) return configs[name];
        }
    }
}

var mappings = build_mappings()
var tag_id = get_tag.by_title('Facebook Pixel');
utui.automator.addMapping(tag_id, mappings);



var add_udo_variable = function(name, type, description) {
    if (type === "udo" || type === "js") type = "js";
    if (type === "cookie" || type === "cp") type = "cp";
    if (type === "querystring" || type === "qs") type = "qs";
    if (!type) type = 'js';
    description = description || "";
    var variable_spec = {
        title: '',
        name: name,
        type: type,
        desc: description
    }
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
                // utui.ui.dialog.dispose(_namespace);
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
    add_var(variable_spec);
    // (function(variable_spec) {utui.automator.addVariable(variable_spec, function(new_id) {utui.util.pubsub.publish(utui.constants.variables.ADDED, {"action": "added_variable","type": "js","dataKey": variable_spec.type + "." + variable_spec.name});console.log("The new data source ID is: " + new_id);return '' + name + ':' + new_id;});})({title: '',name: name,type: type,desc: description});
}

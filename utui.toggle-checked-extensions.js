/**
 *  select some extensions in tiq (checkbox) and toggle their on/off state without the confirmation dialogue.
 *  @method  toggle_checked_extensions
 *  @param   {string}                   state  : 'on'|'off' will toggle the extension activity state.
 */
function toggle_checked_extensions(state) {
    if (!state || (state !== 'on' && state !== 'off')) {
        console.log('state must be a string with value on or off');
        return;
    }

    function is_active(extension_id) {
        if (extension_id) {
            if (utui.data.customizations[extension_id] && utui.data.customizations[extension_id].status === 'active') {
                return true;
            } else if (utui.data.customizations[extension_id] && utui.data.customizations[extension_id].status === 'inactive') {
                return false;
            }
        }
        return null;
    }

    function get_extension_from_id(extension_id) {
        if (!extension_id) {
            return null;
        }
        var selector = '#customize_content > div#customizations_' + extension_id;
        var extension = $(selector).get(0);
        return extension ? extension : null;
    }

    function get_mod_label(extension_id, callback) {
        if (!extension_id) return false;
        var extension = get_extension_from_id(extension_id);
        var mod_label = $(extension).find('h3>a>.container_mod.not_saved').get(0) || null;
        if (mod_label && callback) {
            callback(mod_label);
        } else {
            return mod_label;
        }
    }

    function should_have_mod_label(extension_id) {
        var should = false;
        var events = utui.historyManager._events;
        if (events && events.length) {
            for (var i = 0; i < events.length; i++) {
                if (events[i].action && events[i].action === "toggled_extension" && events[i].data && events[i].data.id && events[i].data.id === extension_id) {
                    should = true;
                    break;
                }
            }
        }
        return should;
    }

    function remove_mod_label(mod_label) {
        if (null === mod_label) return;
        $(mod_label).remove();
    }

    function can_deactivate(extension_id) {
        if (!extension_id || exapi.isImported(extension_id)) return false;
        var can_be_deactivated = false;
        var selector = '#customize_content > div#customizations_' + extension_id;
        var extension = $(selector).get(0);
        var active_state = $(extension).find('span[class^="container_status"]').attr('class').match(/active|inactive/igm)[0];
        if (active_state === 'active') {
            can_be_deactivated = true;
        }
        return can_be_deactivated;
    }

    function can_activate(extension_id) {
        if (!extension_id || exapi.isImported(extension_id)) return false;
        var can_be_activated = false;
        var selector = '#customize_content > div#customizations_' + extension_id;
        var extension = $(selector).get(0);
        var active_state = $(extension).find('span[class^="container_status"]').attr('class').match(/active|inactive/igm)[0];
        if (active_state === 'inactive') {
            can_be_activated = true;
        }
        return can_be_activated;
    }

    function get_selected_extensions_ids() {
        var selected = [];
        $('input[id^="customize_bulk_select"]:checked').each(function(i, input) {
            var extension = $(input).closest('.customize_container').get(0);
            if (extension && extension.hasAttribute('data-id')) selected.push(extension.getAttribute('data-id'));
        });
        return selected.length ? selected : null;
    }

    function toggle_active_state(extension_id) {
        var extension = utui.data.customizations[extension_id];
        var _namespace = "customizations";
        var containerId = _namespace + '_' + extension_id;
        if (exapi.isActive(extension_id)) {
            exapi.setStatus(extension_id, 'inactive');
            $('#' + _namespace + '_' + extension_id).find('.js-status-toggle').children('span').removeClass('container_status_active').addClass('container_status_inactive');
        } else {
            exapi.setStatus(extension_id, 'active');
            $('#' + _namespace + '_' + extension_id).find('.js-status-toggle').children('span').removeClass('container_status_inactive').addClass('container_status_active');
        }
        var status = exapi.getStatus(extension_id);
        if (typeof status !== 'undefined') {
            $('#' + _namespace + '_' + extension_id + '_status').val(status);
        }
        // Update any tags scoped to this extension.
        exapi.resetScopedTagTimestamps(extension_id);
        utui.profile.setActionPerformed({
            action: utui.constants.extensions.TOGGLED,
            data: {
                id: extension["_id"],
                name: extension.title,
                type: extension.id,
                status: extension.status,
                kind: utui.constants.extensions.TYPE,
                operation: utui.constants.operation.TOGGLED,
                container: containerId
            }
        }, true);
    }

    function check_unsaved_changes_button() {
        if (utui.historyManager._events && !utui.historyManager._events.length) {
            utui.profile.toggleUnsavedChangesBtn(true);
        }
    }

    function toggle_extensions(selected_extensions) {
        return new Promise(function(resolve, reject) {
            var changed = false;
            try {
                selected_extensions.forEach(function(extension_id) {
                    if (state === 'off' && is_active(extension_id) && can_deactivate(extension_id)) {
                        toggle_active_state(extension_id);
                        changed = true;
                    } else if (state === 'on' && !is_active(extension_id) && can_activate(extension_id)) {
                        toggle_active_state(extension_id);
                        changed = true;
                    }
                })
            } catch (e) {
                reject(e);
            }
            if (changed) resolve(changed);
            else {
                reject(changed)
            };
        })
    }

    function check_history_and_modlabels(selected_extensions) {
        return new Promise(function(resolve, reject) {
            selected_extensions.forEach(function(extension_id) {
                if (!should_have_mod_label(extension_id)) {
                    get_mod_label(extension_id, remove_mod_label);
                }
            })
            check_unsaved_changes_button();
            return true;
        })
    }

    var selected_extensions = get_selected_extensions_ids();
    if (selected_extensions) {
        if (!window.Promise) {
            selected_extensions.forEach(function(extension_id) {
                if (state === 'off' && is_active(extension_id) && can_deactivate(extension_id)) {
                    toggle_active_state(extension_id);
                }
                if (state === 'on' && !is_active(extension_id) && can_activate(extension_id)) {
                    toggle_active_state(extension_id);
                }
            })
            selected_extensions.forEach(function(extension_id) {
                if (!should_have_mod_label(extension_id)) {
                    get_mod_label(extension_id, remove_mod_label);
                }
            })
            check_unsaved_changes_button();
        } else {
            toggle_extensions(selected_extensions).then(function(changed) {
                return check_history_and_modlabels(selected_extensions);
            }).then(function(complete) {
                console.log('done')
            }).catch(function(error) {
                console.log('nuthin to do');
            })
        }
    }
}

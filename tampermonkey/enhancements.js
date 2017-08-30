// ==UserScript==
// @name          Enhancements 4.1
// @namespace     TIQ
// @require       http://code.jquery.com/jquery-2.1.1.min.js
// @require       https://raw.githubusercontent.com/ccampbell/mousetrap/master/mousetrap.min.js
// @require       https://raw.github.com/ccampbell/mousetrap/master/plugins/global-bind/mousetrap-global-bind.min.js
// @require       https://code.jquery.com/ui/1.11.2/jquery-ui.js
// @require       https://cdnjs.cloudflare.com/ajax/libs/localforage/1.5.0/localforage.min.js
// @run-at        document-end
// @version       2.34
// @description   Addons to TealiumIQ
// @include       https://my.tealiumiq.com/tms
// ==/UserScript==

// 20170502.150560
// added indexDB backup of utui object, and method to not edit loadrules inherited from libraries.
// 20170815.110847: Conditions check 2.0

(function() {

    console.log("Started TealiumIQ enhancements");
    function contentEval(source, execute) {
        // Check for function input.
        if ("function" === typeof source && execute) {
            // Execute this function with no arguments, by adding parentheses.
            // One set around the function, required for valid syntax, and a
            // second empty set calls the surrounded function.
            source = "(" + source + ")();";
        }
        // Create a script node holding this  source code.
        var script = document.createElement("script");
        script.setAttribute("type", "application/javascript");
        script.textContent = source;
        // Insert the script node into the page, so it will run
        document.body.appendChild(script);
    }
    var currentURL = window.location.toString();

    function currentURLMatches(listToMatch) {
        //console.log("Testing " + listToMatch);
        for (var i in listToMatch) {
            var pattern = listToMatch[i];
            var regex = new RegExp(pattern);
            if (currentURL.match(regex)) {
                return true;
            }
        }
    }
    var keepTrying = function(func, callback, sleep, maxAttempts) {
        if (typeof(sleep) === "undefined") {
            sleep = 100;
        }
        var totalAttempts = 0;
        var args = Array.prototype.slice.call(arguments, 2);
        var timer = setInterval(function() {
            if (func.apply(null, args)) {
                clearInterval(timer);
                // console.log('done trying: '+func);
                callback();
            } else {
                // console.log('tried: '+func);
                totalAttempts++;
                if (typeof maxAttempts !== "undefined") {
                    if (totalAttempts > maxAttempts) {
                        clearInterval(timer);
                        console.log("Reached maximum number of attepts.  Going to stop checking.");
                    }
                }
            }
        }, sleep);
    };
    var when = function(test, run, sleep, maxAttempts) {
        var args = Array.prototype.slice.call(arguments, 2);
        keepTrying(test, function() {
            run.apply(null, args);
        },
        sleep, maxAttempts);
    };
    //Natural sort function
    var alphaNumSort = function(a, b) {
        function chunkify(t) {
            var tz = new Array();
            var x = 0,
            y = -1,
            n = 0,
            i, j;
            while (i = (j = t.charAt(x++)).charCodeAt(0)) {
                var m = (i == 46 || (i >= 48 && i <= 57));
                if (m !== n) {
                    tz[++y] = "";
                    n = m;
                }
                tz[y] += j;
            }
            return tz;
        }
        var aa = chunkify(a);
        var bb = chunkify(b);
        for (x = 0; aa[x] && bb[x]; x++) {
            if (aa[x] !== bb[x]) {
                var c = Number(aa[x]),
                d = Number(bb[x]);
                if (c == aa[x] && d == bb[x]) {
                    return c - d;
                } else {
                    return (aa[x] > bb[x]) ? 1 : -1;
                }
            }
        }
        return aa.length - bb.length;
    };
    jQuery.fn.bindFirst = function(name, fn) {
        // bind as you normally would
        // don't want to miss out on any jQuery magic
        this.on(name, fn);
        // Thanks to a comment by @Martin, adding support for
        // namespaced events too.
        this.each(function() {
            var handlers = jQuery._data(this, "events")[name.split(".")[0]];
            // console.log(handlers);
            // take out the handler we just inserted from the end
            var handler = handlers.pop();
            // move it at the beginning
            handlers.splice(0, 0, handler);
        });
    };
    //jQuery extension to support afterShow event
    jQuery(function($) {
        var _oldShow = $.fn.show;
        $.fn.show = function(speed, oldCallback) {
            return $(this).each(function() {
                var obj = $(this),
                newCallback = function() {
                    if ($.isFunction(oldCallback)) {
                        oldCallback.apply(obj);
                    }
                    obj.trigger("afterShow");
                };
                // you can trigger a before show if you want
                obj.trigger("beforeShow");
                // now use the old function to show the element passing the new callback
                _oldShow.apply(obj, [speed, newCallback]);
            });
        };
    });

    function displayMessageBanner(message) {
        $("#messageBannerDiv").remove();
        $('<div id="messageBannerDiv"><span id="messageBannerClose">X</span><span id="messageBannerMessage">' + message + "</span></div>")
        .css("background-color", "#d9534f")
        .css("position", "absolute")
        .css("top", "10px")
        .css("width", "531px")
        .css("height", "30px")
        .css("margin-left", "27%")
        .css("border-radius", "6px")
        .css("text-align", "center")
        .appendTo("#app_header");
        $("#messageBannerMessage")
        .css("top", "5px")
        .css("color", "black")
        .css("position", "relative")
        .css("font-size", "15px");
        $("#messageBannerClose")
        .css("float", "left")
        .css("border", "1px solid black")
        .css("border-radius", "6px")
        .css("cursor", "pointer")
        .css("padding", "5.5px")
        .css("position", "relative")
        .css("font-size", "15px")
        .click(function() {
            $("#messageBannerDiv").remove();
        });
        return true;
    }
    window.truncate = function(str, len) {
        if (str.length > len) {
            str = str.substr(0, len - 3) + "...";
        }
        return str;
    };
    /************** Cleanup TAPID Start ***************************/
    try {
        console.log("Cleanup TAPID Loading");
        (function() {
            var max_profiles = 5;
            var myDate = new Date();
            var profiles = unsafeWindow.jQuery.cookie("TAPID");
            if (profiles === null) {
                profiles = [];
            } else {
                profiles = profiles.split("|");
            }
            var save_profiles = "";
            var len = (profiles.length > max_profiles ? max_profiles : profiles.length);
            for (var i = 0; i < len; i++) {
                if (profiles[i] !== "") {
                    save_profiles += profiles[i] + "|";
                }
            }
            myDate.setFullYear(myDate.getFullYear() + 10);
            unsafeWindow.document.cookie = "TAPID=" + save_profiles + ";domain=.tealiumiq.com;path=/;expires=" + myDate;
        })();
        console.log("Cleanup TAPID Loaded");
    } catch (e) {
        console.log("Cleanup TAPID Failed: " + e);
    }
    /************** Cleanup TAPID End ***************************/
    var observerConfig = {
        attributes: true,
        childList: true,
        characterData: true
    };
    /************** Setup TM Features List Start ***************************/
    var features = JSON.parse(localStorage.getItem("tiq_features")) || {};
    var featuresOptIn = localStorage.getItem("tiq_features_opt_in");
    if (featuresOptIn == null) {
        featuresOptIn = 1;
    }
    featuresOptIn = parseInt(featuresOptIn);
    /***** Section to remove old names that are no longer being used *******/
    delete features.quickSwitch;
    delete features.checkStalePermissions;
    /***********************************************************************/
    if (typeof features.saveAs === "undefined") {
        features.saveAs = {};
        features.saveAs.name = "Save As";
        features.saveAs.enabled = featuresOptIn;
    }
    if (typeof features.autoLogout === "undefined") {
        features.autoLogout = {};
        features.autoLogout.name = "Auto Logout";
        features.autoLogout.enabled = featuresOptIn;
    }
    if (typeof features.checkPermissions === "undefined") {
        features.checkPermissions = {};
        features.checkPermissions.name = "Check Permissions";
        features.checkPermissions.enabled = featuresOptIn;
    }
    if (typeof features.accountProfileHighlighter === "undefined") {
        features.accountProfileHighlighter = {};
        features.accountProfileHighlighter.name = "Account Profile Highlighter";
        features.accountProfileHighlighter.enabled = featuresOptIn;
    }
    if (typeof features.captureKeys === "undefined") {
        features.captureKeys = {};
        features.captureKeys.name = "Capture Keys";
        features.captureKeys.enabled = featuresOptIn;
    }
    if (typeof features.tagWizardShortcuts === "undefined") {
        features.tagWizardShortcuts = {};
        features.tagWizardShortcuts.name = "Tag Wizard Shortcuts";
        features.tagWizardShortcuts.enabled = featuresOptIn;
    }
    if (typeof features.quickSwitchV1 === "undefined") {
        features.quickSwitchV1 = {};
        features.quickSwitchV1.name = "Quick Switch v1";
        features.quickSwitchV1.enabled = 0;
    }
    if (typeof features.quickSwitchV2 === "undefined") {
        features.quickSwitchV2 = {};
        features.quickSwitchV2.name = "Quick Switch v2";
        features.quickSwitchV2.enabled = featuresOptIn;
    }
    if (typeof features.showLabels === "undefined") {
        features.showLabels = {};
        features.showLabels.name = "Show Labels";
        features.showLabels.enabled = featuresOptIn;
    }
    if (typeof features.localTimestamp === "undefined") {
        features.localTimestamp = {};
        features.localTimestamp.name = "Show Local Timestamp";
        features.localTimestamp.enabled = featuresOptIn;
    }
    if (typeof features.extensionSearch === "undefined") {
        features.extensionSearch = {};
        features.extensionSearch.name = "Extensions Search";
        features.extensionSearch.enabled = featuresOptIn;
    }
    if (typeof features.extensionShortcuts === "undefined") {
        features.extensionShortcuts = {};
        features.extensionShortcuts.name = "Extensions Shortcuts";
        features.extensionShortcuts.enabled = featuresOptIn;
    }
    if (typeof features.extensionScroll === "undefined") {
        features.extensionScroll = {};
        features.extensionScroll.name = "Extensions Scroll";
        features.extensionScroll.enabled = featuresOptIn;
    }
    if (typeof features.lookupSort === "undefined") {
        features.lookupSort = {};
        features.lookupSort.name = "Lookup Table Sort";
        features.lookupSort.enabled = featuresOptIn;
    }
    // if(typeof features.checkStalePermissions == 'undefined'){
    //   features.checkStalePermissions = {};
    //   features.checkStalePermissions.name = 'Check Stale Permissions';
    //   features.checkStalePermissions.enabled = featuresOptIn;
    // }
    if (typeof features.removeAlias === "undefined") {
        features.removeAlias = {};
        features.removeAlias.name = "Hide Alias";
        features.removeAlias.enabled = featuresOptIn;
    }
    if (typeof features.sendToTopBottom === "undefined") {
        features.sendToTopBottom = {};
        features.sendToTopBottom.name = "Send Rows to Top or Bottom";
        features.sendToTopBottom.enabled = featuresOptIn;
    }
    if (typeof features.globalMessage === "undefined") {
        features.globalMessage = {};
        features.globalMessage.name = "Global Message";
        features.globalMessage.enabled = featuresOptIn;
    }
    if (typeof features.autoSave === "undefined") {
        features.autoSave = {};
        features.autoSave.name = "Auto Save iQ";
        features.autoSave.enabled = featuresOptIn;
    }
    if (typeof features.newTagDisableProd === "undefined") {
        features.newTagDisableProd = {};
        features.newTagDisableProd.name = "New Tag Disable Prod";
        features.newTagDisableProd.enabled = featuresOptIn;
    }
    if (features.newTagDisableProd.name == "Auto Save iQ") {
        features.newTagDisableProd.name = "New Tag Disable Prod";
    }
    if (typeof features.tagSearch === "undefined") {
        features.tagSearch = {};
        features.tagSearch.name = "Tag Search";
        features.tagSearch.enabled = featuresOptIn;
    }
    if (typeof features.ecommExtension === "undefined") {
        features.ecommExtension = {};
        features.ecommExtension.name = "Add Ecomm Ext Button";
        features.ecommExtension.enabled = featuresOptIn;
    }
    if (typeof features.sitecatMappingSort === "undefined") {
        features.sitecatMappingSort = {};
        features.sitecatMappingSort.name = "Add Sitecat Mapping Sort";
        features.sitecatMappingSort.enabled = featuresOptIn;
    }
    if (typeof features.bulkLoadRules === "undefined") {
        features.bulkLoadRules = {};
        features.bulkLoadRules.name = "Bulk Load Rules Import";
        features.bulkLoadRules.enabled = featuresOptIn;
    }
    if (typeof features.enlargeIds === "undefined") {
        features.enlargeIds = {};
        features.enlargeIds.name = "Enlarge ID";
        features.enlargeIds.enabled = featuresOptIn;
    }
    if (typeof features.conditionCheck === "undefined") {
        features.conditionCheck = {};
        features.conditionCheck.name = "Condition Check";
        features.conditionCheck.enabled = featuresOptIn;
    }
    if (typeof features.addBulkDataSources === "undefined") {
        features.addBulkDataSources = {};
        features.addBulkDataSources.name = "Add Bulk DataSources";
        features.addBulkDataSources.enabled = featuresOptIn;
    }
    if (typeof features.updateTitle === "undefined") {
        features.updateTitle = {};
        features.updateTitle.name = "Update TiQ Title";
        features.updateTitle.enabled = featuresOptIn;
    }
    if (typeof features.fixConditions === "undefined") {
        features.fixConditions = {};
        features.fixConditions.name = "Fix Incomplete Conditions";
        features.fixConditions.enabled = featuresOptIn;
    }
    if (typeof features.extra_info === "undefined") {
        features.extra_info = {};
        features.extra_info.name = "extra info";
        features.extra_info.enabled = featuresOptIn;
    }
    if (typeof features.prettyPrint === "undefined") {
        features.prettyPrint = {};
        features.prettyPrint.name = "prettyPrint";
        features.prettyPrint.enabled = featuresOptIn;
    }
    localStorage.setItem("tiq_features", JSON.stringify(features));
    localStorage.setItem("tiq_features_opt_in", featuresOptIn);
    /************** Setup TM Features List End ***************************/
    /************** Update TM Features Start ***************************/
    try {
        console.log("Update TM Features Loading");

        function showManageFeatures(data) {
            //Make it so that you can see the whole feature list without scrolling
            $(".dialog-context-nav").css("max-height", "600px");
            //Make sure there isn't already a pop up before creating another one.
            $("#popup").remove();
            var buttons = $('<div><button id="saveFeatures">Save</button><button id="closePopup">Close</button></div>')
            .css("padding-top", "15px")
            .css("margin-left", "22%");
            $('<div id="popup"><h4 id="featuresMessage"></h4><form id="featuresForm"><table><thead><tr><th>Feature</th><th>Enabled?</th></tr></thead><tbody></tbody></table></form></div>')
            .css("position", "relative")
            .css("z-index", "5001")
            .css("border", "1px black solid")
            .css("padding", "15px")
            .css("border-radius", "6px")
            .css("background", "white")
            .append(buttons)
            .insertAfter($("#updateTMFeatures").parent());
            $("#featuresForm").css("height", "auto");
            $("#closePopup")
            .css("cursor", "pointer")
            .click(function() {
                $("#popup").remove();
            });
            $("#saveFeatures").click(function() {
                saveFeatures();
            });
            $('<li><a href="https://docs.google.com/a/tealium.com/document/d/1yrcJg7inHc5SbaUWVC89Bcm3GvC0gjUJtKfBQKtb7Sw/edit" id="documentTMFeatures" target="_blank">TM Documentation</a></li>')
            .click(function() {
                window.open("https://docs.google.com/a/tealium.com/document/d/1yrcJg7inHc5SbaUWVC89Bcm3GvC0gjUJtKfBQKtb7Sw/edit", "_blank");
            })
            .insertAfter("#featuresMessage");
            var enabled = featuresOptIn ? "checked" : "";
            $('<tr><td>Auto Enable Features</td><td><input type="checkbox" data-feature-name="tiq_features_opt_in" ' + enabled + " /></td></tr>")
            .appendTo("#featuresForm tbody");
            Object.keys(data).forEach(function(key) {
                var checked = data[key].enabled ? "checked" : "";
                $("<tr><td>" + data[key].name + '</td><td><input type="checkbox" data-feature-name="' + key + '" ' + checked + " /></td></tr>")
                .appendTo("#featuresForm tbody");
            });
        }

        function saveFeatures() {
            console.log("Saving Feature Preferences");
            $("#featuresForm tbody tr").each(function() {
                var checked = $(this).find("td:last input").is(":checked") ? 1 : 0;
                var featureName = $(this).find("td:last input").attr("data-feature-name");
                if (featureName == "tiq_features_opt_in") {
                    featuresOptIn = checked;
                } else {
                    features[featureName].enabled = checked;
                }
            });
            localStorage.setItem("tiq_features", JSON.stringify(features));
            localStorage.setItem("tiq_features_opt_in", featuresOptIn);
            console.log(features);
            $("#featuresMessage").html('Successfully Updated Your Preferences!<br/><br/><span style="color: red;"> You will need to refresh TIQ for updates to take effect.</span>');
        }
        var myiqObserver = new MutationObserver(function(mutations) {
            console.log("MutationObserver of the My iQ left navigation");
            if (!$("#updateTMFeatures").length) {
                $('<li class="tmui"><a href="#" id="getGlobalMessage">Show Global Message</a></li>')
                .click(function() {
                    unsafeWindow.__getGlobalMessageAllow = "true";
                    getGlobalMessage(true);
                })
                .insertAfter("#tabs-dashboard .dialog-context-nav li:last");
                $('<li class="tmui"><a href="#" id="updateTMFeatures">Enable/Disable TM Features</a></li>')
                .click(function() {
                    showManageFeatures(features);
                })
                .insertAfter("#tabs-dashboard .dialog-context-nav li:last");
            }
        });
        myiqObserver.observe(document.querySelector("#tabs-dashboard #my_site_context"), observerConfig);
        when(function() {
            return $("#tabs-dashboard #my_site_context").is(":visible");
        }, function() {
            if (!$("#updateTMFeatures").length) {
                $('<li class="tmui"><a href="#" id="getGlobalMessage">Show Global Message</a></li>')
                .click(function() {
                    unsafeWindow.__getGlobalMessageAllow = "true";
                    getGlobalMessage(true);
                })
                .insertAfter("#tabs-dashboard .dialog-context-nav li:last");
                $('<li class="tmui"><a href="#" id="updateTMFeatures">Enable/Disable TM Features</a></li>')
                .click(function() {
                    showManageFeatures(features);
                })
                .insertAfter("#tabs-dashboard .dialog-context-nav li:last");
            }
        });
        console.log("Update TM Features Loaded");
    } catch (e) {
        console.log("Update TM Features Failed: " + e);
    }
    /************** Update TM Features End ***************************/
    /************** Select SaveAs Start ***************************/
    if (features.saveAs.enabled) {
        try {
            console.log("Save As Loading");
            $("#global_save").click(function() {
                console.log("global_save clicked");
                var origSaveTitle = $("#profile_legend_revision").text().trim();
                var saveTitle = $("#profile_legend_revision").text().trim().replace(/\d{4}\.\d{2}\.\d{2}\.\d{4}/g, "").replace(/\d{4}\/\d{2}\/\d{2}\ \d{2}:\d{2}/g, "").trim();
                when(function() {
                    return ($("span:contains(Save As)").is(":visible"));
                }, function() {
                    $("span:contains(Save As)").click(function() {
                        console.log("Save As clicked");
                        if (!saveTitle.match(/ -$/)) {
                            saveTitle += " -";
                        }
                        when(function() {
                            return (origSaveTitle != $("#savepublish_version_title").val());
                        }, function() {
                            $("#savepublish_version_title").val($("#savepublish_version_title").val().replace(/Version/, saveTitle).replace(/(\d{4})\.(\d{2})\.(\d{2})\.(\d{2})(\d{2})/, "$1/$2/$3 $4:$5"));
                            setTimeout(function() {
                                $("#publish_notes").focus();
                            }, 150);
                        });
                        $("#checkBtn_dev").not(".publish_connector_connected").click();
                        $("#checkBtn_qa").not(".publish_connector_connected").click();
                        //Fix tab order
                        $("input[name*=forceFTP]").attr("tabindex", 999);
                        $(".ui-button-text:contains(Publish)").attr("tabindex", 1);
                    });
                    $("span:contains(Save As)")[0].click();
                    //Adding a hook for all key presses so we can find when we tab to the save title
                    $("body").keyup(function(e) { //look at all key ups
                        // console.log('keyup called');
                        var code = e.keyCode || e.which;
                        if (code == "9" && $(document.activeElement).attr("id") === "savepublish_version_title") {
                            //Find the number of characters until " -"
                            var end = $("#savepublish_version_title").val().indexOf(" -");
                            //Select the text from the beginning of the line until we get to " -"
                            $("#savepublish_version_title")[0].setSelectionRange(0, end);
                        }
                    });
                });
            });
            console.log("Save As Loaded");
        } catch (e) {
            console.log("Select Save As Failed: " + e);
        }
    }
    /************** Select SaveAs End ***************************/
    /************** No Auto Logout Start ***************************/
    if (features.autoLogout.enabled) {
        try {
            console.log("No Auto Logout Loading");
            setInterval(function() {
                unsafeWindow.utui.util.setSession();
            }, 300000);
            var ping_community_interval = setInterval(ping_community, 1500000); // 1,500,000ms = 25 minutes
            function ping_community() {
                utag.ut.loader({
                    "type": "img",
                    "src": "https://community.tealiumiq.com/"
                });
            }
            console.log("No Auto Logout Loaded");
        } catch (e) {
            console.log("No Auto Logout Failed: " + e);
        }
    }
    /************** No Auto Logout End ***************************/
    /************** No Permissions Message Start ***************************/
    if (features.checkPermissions.enabled) {
        try {
            console.log("No Permissions Message Loading");

            function checkForPermissions() {
                // console.log(utui.permissions.canPublishDev());
                // console.log(utui.permissions.getUserPermissions());
                when(function() {
                    return utui.permissions && utui.users && Object.keys(utui.permissions.getUserPermissions()).length > 0;
                }, function() {
                    if (!utui.permissions.canPublishDev()) {
                        displayMessageBanner("You can't publish to DEV. You are probably read only!");
                    } else {
                        $("#messageBannerDiv").remove();
                    }
                });
            }
            console.log("No Permissions Message Loaded");
        } catch (e) {
            console.log("No Permissions Message Failed: " + e);
        }
    }
    /************** No Permissions Message End ***************************/
    /************** Account/Profile Highlighter Start ***************************/
    if (features.accountProfileHighlighter.enabled) {
        try {
            console.log("Account/Profile Highlighter Loading");
            var highlightAccount = function() {
                $("#profile_account-autocomplete")[0].setSelectionRange(0, $("#profile_account-autocomplete").val().length);
            };
            var highlightProfile = function() {
                $("#profile_profileid-autocomplete")[0].setSelectionRange(0, $("#profile_profileid-autocomplete").val().length);
            };
            $("#ui-active-menuitem").on("click", function() {
                console.log("clicked on active menu item");
            });
            $("#profile_menu_wrapper").click(function() {
                $("#profile_account-autocomplete")
                .attr("type", "text")
                .click(highlightAccount)
                .change(function() {
                    console.log("account changed");
                    setTimeout(highlightProfile, 250);
                });
                // $('#profile_account-autocomplete').focusout(function(){
                //   console.log("Account updated");
                // });
                $("#lastaccount button").click(highlightAccount);
                $("#profile_profileid-autocomplete")
                .attr("type", "text")
                .click(highlightProfile);
                // $('#profile_profileid-autocomplete').focusout(function(){
                //   console.log("Profile updated");
                // });
                $("#lastprofile button").click(highlightProfile);
            });
            console.log("Account/Profile Highlighter Loaded");
        } catch (e) {
            console.log("Account/Profile Highlighter Failed: " + e);
        }
    }
    /************** Account/Profile Highlighter End ***************************/
    /************** Capture Keys Start ***************************/
    if (features.captureKeys.enabled) {
        try {
            console.log("Capture Keys Loading");
            //Capture Save
            Mousetrap.bindGlobal("mod+s", function(e) {
                e.preventDefault();
                console.log("User is trying to save");
                if ($('.admin_labelno:contains("Edit Your Existing Template")').is(":visible")) {
                    //Just save the template
                    $('span:contains("Save Profile Template")').click();
                    if (typeof markTagAsNotSaved === "function") {
                        markTagAsNotSaved();
                    }
                } else {
                    //Click Save and Publish
                    $("#global_save").click();
                }
            });
            //Remove existing escape catch for tag wizard
            // $('body').unbind('keydown');
            // $('[aria-labelledby=ui-dialog-title-manage_dialog_wizard]').unbind('keydown');
            //Capture Escape
            Mousetrap.bindGlobal("esc", function(e) {
                e.preventDefault();
                console.log("User hit escape");
                if ($('.admin_labelno:contains("Edit Your Existing Template")').is(":visible")) {
                    //Close the Template Wizard
                    $("[aria-labelledby=ui-dialog-title-admin_dialog] .ui-icon-closethick").click();
                } else if ($("[aria-labelledby=ui-dialog-title-savePublish_dialog] .ui-icon-closethick").is(":visible")) {
                    //Close the Save/Publish Window
                    $("[aria-labelledby=ui-dialog-title-savePublish_dialog] .ui-icon-closethick").click();
                } else if ($("#account_message_popup").is(":visible")) {
                    $("#account_message_popup").remove();
                } else {
                    //Close Tag Wizard
                    $("[aria-labelledby=ui-dialog-title-manage_dialog_wizard] .ui-icon-closethick").click();
                }
            });
            console.log("Capture Keys Loaded");
        } catch (e) {
            console.log("Capture Keys Failed: " + e);
        }
    }
    /************** Capture Save Keys End ***************************/
    /************** Content Eval Section Start ******************************/
    if (features.tagWizardShortcuts.enabled) {
        try {
            //This code will run in the context of the page
            contentEval(function() {
                /************** Add common utility functions Start ***************************/
                var keepTrying = function(func, callback, sleep) {
                    if (typeof(sleep) === "undefined") {
                        sleep = 100;
                    }
                    var args = Array.prototype.slice.call(arguments, 2);
                    var timer = setInterval(function() {
                        var functionResponse = func.apply(null, args);
                        // console.log('functionResponse: '+functionResponse);
                        if (functionResponse) {
                            clearInterval(timer);
                            // console.log('done trying: '+func);
                            callback();
                        } else {
                            // console.log('tried: '+func);
                        }
                    }, sleep);
                };
                var when = function(test, run, sleep) {
                    var args = Array.prototype.slice.call(arguments, 2);
                    keepTrying(test, function() {
                        run.apply(null, args);
                    },
                    sleep);
                };

                function displayMessageBanner(message) {
                    $("#messageBannerDiv").remove();
                    $('<div id="messageBannerDiv"><h3 id="messageBannerMessage">' + message + "</h3></div>")
                    .css("background-color", "#d9534f")
                    .css("position", "absolute")
                    .css("top", "10px")
                    .css("width", "25%")
                    .css("margin-left", "35%")
                    .css("margin-right", "35%")
                    .css("border-radius", "6px")
                    .css("text-align", "center")
                    .appendTo("body");
                    $("#messageBannerMessage").css("padding", "7px");
                    return true;
                }
                /************** Add common utility functions End ***************************/
                /************** Shortcuts and Optimazations for Tag Wizard Start ***************************/
                console.log("Shortcuts and Optimazations for Tag Wizard Loading");

                function setupDataMappingShortcuts() {
                    //Clear the mapping toolbox text so that we know once it has been updated.
                    $("#dialog-managetoolbox-content").text("");
                    //Auto click Select Destination when you change Data Source under Data Mappings
                    $("select[id*=mapselect]").on("change", function() {
                        var datasource = $(this).val().split(".");
                        $('span:contains("Select Destination")').click();
                        when(function() {
                            return ($("#ui-dialog-title-dialog-managetoolbox").length && $('#ui-dialog-title-dialog-managetoolbox:contains("' + datasource[1] + " (" + datasource[0] + ')")') && $("#dialog-managetoolbox-content").text().length);
                        }, function() {
                            // console.log('Mapping toolbox has finished loading');
                            //Add click handler to the cancel button to move focus to the last entry
                            $('div[aria-labelledby="ui-dialog-title-dialog-managetoolbox"] span:contains(Cancel)').click(function() {
                                //Put focus in the last entry
                                $("ul[id*=mapcontent] input[type=text]:last").focus();
                            });
                            if ($('#dialog-managetoolbox-content:contains("There is no toolbox available for this vendor")').length) {
                                // console.log('No toolbox available.  Clicking Cancel');
                                //Just click Cancel
                                $('div[aria-labelledby="ui-dialog-title-dialog-managetoolbox"] span:contains(Cancel)').click();
                            } else {
                                //If you doubleclick an option, auto select apply
                                $("div[id*=managetoolbox_] option").on("dblclick", function() {
                                    $('div[aria-labelledby="ui-dialog-title-dialog-managetoolbox"] span:contains(Apply)').click();
                                });
                            }
                        });
                    });
                    $('span:contains("Add Destination")').on("click", function() {
                        var variableText = $(this).closest(".managemap_div").find(".managemap_label").text().trim();
                        when(function() {
                            return ($("#ui-dialog-title-dialog-managetoolbox").length && $('#ui-dialog-title-dialog-managetoolbox:contains("' + variableText + '")') && $("#dialog-managetoolbox-content").text().length);
                        }, function() {
                            $("div[id*=managetoolbox_] option").on("dblclick", function() {
                                $('div[aria-labelledby="ui-dialog-title-dialog-managetoolbox"] span:contains(Apply)').click();
                            });
                        });
                    });
                    //Setup import/export tag mappings
                    if (!$("#mappingsBulkRow").length) {
                        $('<tr id="mappingsBulkRow" class="tmui"><td></td></tr>')
                        .appendTo("#wizard_variables_wrapper tbody");
                        $('<span id="mappingsImport" class="btn btn-small actionAddMapping i-color-add"><i class="icon-arrow-down"></i> Import from CSV</span>')
                        .appendTo("#mappingsBulkRow td")
                        .click(function() {
                            showImportExportPopup("", "body");
                        });
                        if ($('.noItemsMapVariable[style*="display: none;"]').length) {
                            $('<span id="mappingsExport" class="btn btn-small actionAddMapping i-color-add"><i class="icon-arrow-up"></i> Export to CSV</span>')
                            .css("margin-left", "10px")
                            .appendTo("#mappingsBulkRow td")
                            .click(exportMappings);
                        }
                    }
                    //CSS Fix
                    $(".variable_map_container").css("max-height", "330px");
                    $(".noItemsMapVariable").css("top", "75px");
                }

                function showImportExportPopup(content, prepend) {
                    $("#popup").remove();
                    var close = $('<button type="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only"><span class="ui-button-text">Close</span></button>').click(function() {
                        $("#popup").remove();
                    });
                    close.css("cursor", "pointer")
                    .css("float", "right")
                    .css("margin-right", "10px");
                    $('<div id="popup" class="ui-dialog ui-widget ui-widget-content ui-corner-all"><div class="ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix"><span class="ui-dialog-title">Bulk Add Data Mappings</span></div><span class="alert" style="color:red;margin-left:20px;font-size:16px;"></span><br/><span class="helpText" style="margin-left:20px; display:block;">Format: data layer variable, type (js,dom,meta,cp,qp,customization2), destination</span><textarea id="popupText" rows="10" cols="80" /></div>')
                    .attr("style", "position: absolute; z-index: 10000; left: 40%;top: 200px; width: 400px;")
                    .width(400)
                    .height(265)
                    .append(close)
                    .prependTo(prepend);
                    $("#popupText")
                    .css("width", "90%")
                    .css("margin-top", "4%")
                    .css("margin-left", "4%")
                    .css("margin-bottom", "5px")
                    .val(content);
                    if (!content) {
                        //Create import button
                        $('<button type="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only"><span class="ui-button-text">Import</span></button>')
                        .click(importMappings)
                        .css("cursor", "pointer")
                        .css("float", "left")
                        .css("margin-left", "10px")
                        .appendTo("#popup");
                        //Create import checkbox to create data elements
                        $('<input type="checkbox" id="createDataLayerOption" />')
                        .css("float", "left")
                        .css("margin-left", "10px")
                        .appendTo("#popup");
                        $('<label title="If data layer name isn\'t found, checking the box will create it.">Create Data Layer Elements?</label>')
                        .css("float", "left")
                        .css("margin-top", "3px")
                        .appendTo("#popup");
                        $("#popup .alert").text("");
                        //Insert helpful text
                        // $('#popup .helpText').text('Format: data layer variable, type (js,dom,meta,cp,qp), destination');
                    }
                    $("#popupText")[0].setSelectionRange(0, $("#popupText").val().length);
                }

                function getDataLayerNames() {
                    var data = utui.data.define;
                    var obj = {};
                    Object.keys(data).forEach(function(key) {
                        if (data[key].name) {
                            obj[data[key].name] = 1;
                        }
                    });
                    return obj;
                }

                function exportMappings() {
                    var csv = "";
                    var data = utui.data.manage[$("#manage_editmapping_id").val()].map;
                    Object.keys(data).forEach(function(key) {
                        csv += data[key].key + "," + data[key].type + "," + data[key].variable + "\n";
                    });
                    //Pass a message if there aren't any mappings when the user clicks export
                    if (!csv) {
                        csv = "NOTHING CURRENTLY MAPPED!";
                    }
                    showImportExportPopup(csv, "body");
                }

                function importMappings() {
                    var contentLines = $("#popupText").val().split("\n");
                    var inputData = [];
                    var dataLayer = getDataLayerNames();
                    for (var i = 0; i < contentLines.length; i++) {
                        if (contentLines[i].length) {
                            var obj = {};
                            var content = contentLines[i].split(",");
                            obj.key = content[0];
                            obj.type = content[1];
                            obj.variable = content.splice(2).join(",");
                            if ($("#createDataLayerOption").is(":checked")) {
                                //arguments are: title,name,type,desc,bundleobj(optional)
                                var id = dsapi.getNextId();
                                utui.define.addDataSource(id, "", obj.key, obj.type, "");
                            } else if (obj.type != "dom" && !obj.key.match(/_corder|_ctotal|_csubtotal|_cship|_ctax|_cstore|_ccurrency|_cpromo|_ctype|_ccustid|_ccity|_cstate|_czip|_ccountry|_cprod|_cprodname|_csku|_cbrand|_ccat|_ccat2|_cquan|_cprice|_cpdisc/) && !dataLayer[obj.key]) {
                                $("#popup .alert").text("'" + obj.type + "." + obj.key + "' is not in your data layer!");
                                return false;
                            }
                            inputData.push(obj);
                        }
                    }
                    if (!inputData.length) {
                        $("#popup .alert").text("No data to import!");
                        return false;
                    }
                    //Must close the mapping toolbox because the user can't see the mappings this way and it is very confusing
                    $("#popup span:contains(Close)").click();
                    //Existing Tag
                    $("span:contains(Apply):visible").click();
                    //New Tag
                    $("span:contains(Finish):visible").click();
                    console.log("Mapping data for tag id: " + $("#manage_editmapping_id").val());
                    console.log(JSON.stringify(inputData));
                    utui.automator.addMapping($("#manage_editmapping_id").val(), inputData);
                    (function(id) {
                        setTimeout(function() {
                            $('.manage_container div[data-uid="' + id + '"]').siblings(".container_variables").find(".variableValue").text("" + Object.keys(utui.data.manage[id].map).length);
                            $('.manage_container div[data-uid="' + id + '"]').siblings(".container_variables").addClass("valuePositive");
                            utui.profile.toggleUnsavedChangesBtn();
                        }, 250);
                    })($("#manage_editmapping_id").val());
                }
                //Wait for jquery before running code
                when(function() {
                    return typeof jQuery === "function";
                }, function() {
                    //When the user opens the tag template wizard
                    $(document).on("click", "span.actionEditSettings, span.actionEditRules, span.actionMapping", function(e) {
                        //Update text box length for pixel URL's
                        $("div.wizard_item input").not(".wizard_title").css("width", "495px");
                        //Create Edit Templates Button at the top
                        $('<div class="wizard_config"><div class="wizard_label"><a href="#" id="manage_advconfig_template_tooltip_top" class="actionAdvConfigEdit btn btn-small i-color-edit tmui" original-title="This will launch a window that will allow you to view and/or manage the code behind your tag."><i class="icon-edit"></i> Edit Templates</a></div></div><br/><br/>')
                        .insertBefore(".dialogSectionHeader:contains(Properties)");
                        //Create Edit Templates Button above advanced settings
                        $('<div class="wizard_config"><div class="wizard_label"><a href="#" id="manage_advconfig_template_tooltip_bottom" class="actionAdvConfigEdit btn btn-small i-color-edit tmui" original-title="This will launch a window that will allow you to view and/or manage the code behind your tag."><i class="icon-edit"></i> Edit Templates</a></div></div>')
                        .insertAfter("#tagConfigBasicSettings");
                        //Add click handler to open tag template
                        $("#manage_advconfig_template_tooltip_bottom,#manage_advconfig_template_tooltip_top").click(function() {
                            $("#manage_advconfig_template_tooltip").click();
                        });
                        //Auto expand advanced settings
                        $('div.dialogSectionHeader:contains("Advanced Settings")')
                        .unbind("click")
                        .click(function() {
                            $("#tagConfigAdvSettings .dialog_section_body").slideToggle({
                                duration: "fast",
                                queue: false
                            });
                            $("#tagConfigAdvSettings .dialogSectionHeader i").toggleClass("icon-caret-right").toggleClass("icon-caret-down");
                        })
                        .click();
                        setupDataMappingShortcuts();
                        //Add tag template change log in tips section
                        var div_id = $('#manage_dialog_wizard [name^="manage_content_"]:first').attr("id").match(/(manage_content_\d+)/)[1];
                        var tag_uid = $("#" + div_id).data("id");
                        var tag_id = utui.data.manage[tag_uid].tag_id;
                        if (!$('#manage_dialog_wizard [id="tagTemplateChangeLogModal"]:visible').length) {
                            $('<div id="tagTemplateChangeLogModal" class="tmui" style="position:relative;left:20px;width:155px;"><a href="#" class="btn btn-small tmui">Tag Template Change Log</a></div>')
                            .appendTo(".wizard_nav:visible")
                            .click(function() {
                                common.utils.openWindow("https://solutions.tealium.net/tools/tagchangelog?uid=" + tag_id, "_blank");
                            });
                        }
                    });
                    //When the user adds a new template
                    $(document).on("mousedown", "button.js-addtag-btn", function(e) {
                        //Wait for the tag template wizard to show up
                        when(function() {
                            return ($('div.dialogSectionHeader:contains("Advanced Settings")').is(":visible"));
                        }, function() {
                            //Update text box length for pixel URL's
                            $("div.wizard_item input").not(".wizard_title").css("width", "495px");
                            setupDataMappingShortcuts();
                        });
                    });
                    //Add edit templates button on manage screen
                    window.addEditTemplatesToManageScreen = function() {
                        if (!$("[id=manage_advconfig_template_tooltip_manage]:visible").length) {
                            $('<a href="#" id="manage_advconfig_template_tooltip_manage" data-container-id="' + $(".actionEditSettings:visible").closest(".manage_container").attr("id") + '" class="actionAdvConfigEdit btn btn-small i-color-edit tmui" original-title="This will launch a window that will allow you to view and/or manage the code behind your tag."><i class="icon-edit"></i> Edit Templates</a>')
                            .insertBefore($(".actionEditSettings:visible"))
                            .css("margin-right", "5px")
                            .css("display", "inline-block")
                            .click(function() {
                                utui.adminlib.getTemplateList($(this).closest(".manage_container").data("id"));
                            });
                        }
                    };
                    //Add tag template change log link on mamage screen
                    window.addTagTemplateChangeLogToManageScreen = function(context) {
                        $this = $(context);
                        if (!$this.find('[id="tagTemplateChangeLogManage"]:visible').length) {
                            $('<div id="tagTemplateChangeLogManage" class="tmui" style="position:relative;left:20px;width:155px;"><a href="#" class="btn btn-small tmui">Tag Template Change Log</a></div>')
                            .appendTo(".contextBox:visible")
                            .click(function() {
                                common.utils.openWindow("https://solutions.tealium.net/tools/tagchangelog?uid=" + utui.data.manage[$this.data("id")].tag_id, "_blank");
                            });
                        }
                    };
                    //When the user clicks to expand the tag
                    $(document).on("click", ".manage_container", function(e) {
                        addEditTemplatesToManageScreen();
                        addTagTemplateChangeLogToManageScreen(this);
                    });
                    //Update the add mappings function to update the accordion call
                    // utui.automator.addMapping = eval('('+utui.automator.addMapping.toString().replace('utui.manage.updateAccordion(true);','utui.manage.updateAccordion();').replace('return void 0;','').replace(/\(prefix/g, '(""')+')');
                    //When a user saves a tag template, perform a save on the tag too
                    $(document).on("mousedown", 'span:contains("Save Profile Template")', markTagAsNotSaved);

                    function markTagAsNotSaved() {
                        var tag_id = $('span:contains("Save Profile Template")').closest(".ui-dialog").find("#admin_template_select").val().match(/(\d+)/);
                        if (tag_id) {
                            var containerId = $('.manage_container[data-id="' + tag_id[1] + '"]').attr("id");
                            var tagObj = utui.manage.containerMap[containerId];
                            utui.profile.setActionPerformed({
                                action: utui.constants.tags.UPDATED,
                                data: {
                                    id: tagObj.id,
                                    tag_name: tagObj.tag_name || utui.util.getTagNameFromTagId(tagObj.tag_id),
                                    name: tagObj.title,
                                    kind: utui.constants.tags.TYPE,
                                    operation: utui.constants.operation.UPDATED,
                                    container: containerId
                                }
                            }, true);
                            utui.manage.newTagFlag = false;
                            utui.manage.saveData();
                            utui.util.pubsub.publish(utui.constants.tags.UPDATED, {
                                action: utui.constants.tags.UPDATED,
                                data: {
                                    id: tagObj.id,
                                    tag_name: tagObj.tag_name || utui.util.getTagNameFromTagId(tagObj.tag_id),
                                    name: tagObj.title
                                }
                            });
                        } else {
                            console.log("Saved a template that doesn't have a UID");
                        }
                    }
                    console.log("Shortcuts and Optimazations for Tag Wizard Loaded");
                });
/************** Shortcuts and Optimazations for Tag Wizard End ***************************/
}, 1);
} catch (e) {
    console.log("Content Eval Failed: " + e);
}
}
/************** Content Eval Section End ******************************/
/************** Setup Listener for Profile Load Event Start **********************/
try {
    console.log("Listener for Profile Load Event Loading");
        //Let's start the counter at 0
        utui.util.pubsub.subscribe(utui.constants.profile.LOADED, function() {
            console.log("Profile loaded event");
            if (typeof checkForPermissions === "function") {
                checkForPermissions();
            }
            if (features.extensionSearch.enabled) {
                setupExtensionSearch();
            }
            if (features.extensionShortcuts.enabled) {
                createExtensionShortcutButtons();
            }
            if (features.quickSwitchV2.enabled) {
                setupQuickSwitchV2();
            }
            // if(features.checkStalePermissions.enabled){
            //   checkStalePermissions();
            // }
            if (features.removeAlias.enabled) {
                hideAlias();
            }
            if (features.showLabels.enabled) {
                showLabels();
            }
            if (features.sendToTopBottom.enabled) {
                sendToTopBottomListener();
            }
            if (features.globalMessage.enabled) {
                when(function() {
                    return (typeof(unsafeWindow.utui) !== "undefined" && typeof(unsafeWindow.utui.login) !== "undefined" && typeof(unsafeWindow.utui.login.account) !== "undefined" && typeof(utui.data.publish_history) !== "undefined");
                }, function() {
                    unsafeWindow.__getGlobalMessageAllow = "true";
                    $("#account_message_popup").remove();
                    getGlobalMessage();
                });
            }
            if (features.newTagDisableProd.enabled) {
                newTagDisableProdListener();
            }
            if (features.tagSearch.enabled) {
                setupTagSearch();
            }
            if (features.ecommExtension.enabled) {
                createEcommExtensionButton();
            }
            if (features.sitecatMappingSort.enabled) {
                createSitecatMappingSortButton();
            }
            if (features.enlargeIds.enabled) {
                when(function() {
                    return (typeof(unsafeWindow.utui) !== "undefined" && typeof(unsafeWindow.utui.login) !== "undefined" && typeof(unsafeWindow.utui.login.account) !== "undefined" && typeof(utui.data.publish_history) !== "undefined");
                }, function() {
                    enlargeIds();
                });
            }
            if (features.updateTitle.enabled) {
                updateTiQTitle();
            }
            if (features.extra_info.enabled) {
                try {
                    extra_info();
                } catch (e) {};
            }
            if (features.prettyPrint.enabled) {
                addPrettyPrint();
                addSaveExtension();
            }
        });
        console.log("Listener for Profile Load Event Loaded");
    } catch (e) {
        console.log("Listener for Profile Load Event Failed: " + e);
    }
    /************** Setup Listener for Profile Load Event End ************************/
    /************** Add Quick Switch v1 Start ***************************/
    if (features.quickSwitchV1.enabled) {
        try {
            console.log("Quick Switch v1 Loading");
            if (typeof __tealium_quickswitch === "undefined") {
                __tealium_quickswitch = document.createElement("SCRIPT");
                __tealium_quickswitch.type = "text/javascript";
                __tealium_quickswitch.src = "//tags.tiqcdn.com/utag/tealium/chris.davison/prod/utag.78.js?_cb=";
                Math.random();
                document.getElementsByTagName("head")[0].appendChild(__tealium_quickswitch);
            } else if (typeof quickswitch !== "undefined") {
                quickswitch.init();
            }
            //Add Quick Switch link and hide Help Center
            // $('<a href="#" id="quickSwitchLink" class="utui-header-button">Quick Switch</a>')
            // .click(function(){$('#quickswitch_tab').click();})
            // .insertAfter('#helpCenterLink');
            // $('#helpCenterLink').hide();
            console.log("Quick Switch v1 Loaded");
        } catch (e) {
            console.log("Quick Switch v1 Failed: " + e);
        }
    }
    /************** Add Quick Switch v1 End ***************************/
    /************** Add Quick Switch v2 Start ***************************/
    if (features.quickSwitchV2.enabled) {
        try {
            console.log("Quick Switch v2 Loading");
            //Create a style sheet that will hide the original profile buttons and format the auto complete box
            $('<style id="quickSwitchStyleSheet">\
              #profile_account-autocomplete,#lastaccount button[title="Show All Items"],#profile_profileid-autocomplete,#lastprofile button[title="Show All Items"],#lastrevision{\
                display:none;\
            }\
            .menu_list_container{width: 205px;}\
            .ui-autocomplete{width: 160px !important;}\
            #select_account,#select_profile{width: 154px;}\
            #profile_menu_list input{max-width: 154px;}\
            .ui-autocomplete .ui-menu-item {\
                text-decoration: none;\
                display: block;\
                padding: .2em .4em;\
                line-height: 1.5;\
                zoom: 1;\
            }\
            .quickSwitch{\
                display: inline-block !important;\
                padding-left: 6px !important;\
            }\
            #quickSwitchSort{\
                padding-left: 10px !important;\
            }\
            .quickSwitchFavIcon{\
                color: #E8D033;\
                cursor: pointer;\
            }\
            </style>').appendTo("head");
            window.buildRecentHistory = function() {
                var html = '<div class="menulistheaderfont">Recent History (Sortable) &nbsp;&nbsp;&nbsp;<i id="acct_refresh" class="icon-refresh" style="cursor: pointer;" title="Refresh Account List"></i></div><ul id="quickSwitchSort" style="list-style-type:none;">';
                var recentProfiles = JSON.parse(localStorage.getItem("recent_history"));
                if (!recentProfiles) {
                    storeHistory();
                    recentProfiles = JSON.parse(localStorage.getItem("recent_history"));
                }
                for (var i = 0; i < recentProfiles.length; i++) {
                    var favIcon = recentProfiles[i].favorite ? "icon-star" : "icon-star-empty";
                    if (i === 0) {
                        //This is the default profile, change the icon
                        favIcon = "icon-user";
                    }
                    html += '<li><div class="menulistitem"><i class="' + favIcon + ' quickSwitchFavIcon"></i><a class="menulistfont wordwrap quickSwitch" href="#" data-account="' + recentProfiles[i].account + '" data-profile="' + recentProfiles[i].profile + '">' + i + ": " + truncate(recentProfiles[i].account + "/" + recentProfiles[i].profile, 25) + "</a></div></li>";
                }
                html += '</ul><div class="menudivider"></div>';
                return html;
            };
            window.storeHistory = function(account, profile, defaultProfile) {
                var updatedProfileList = [];
                var nonFavList = [];
                var profileMaxLength = 10;
                var recentProfiles = JSON.parse(localStorage.getItem("recent_history"));
                if (recentProfiles) {
                    // console.log('recent profiles:');
                    // console.log(recentProfiles);
                    var nonFavListCounter = 0;
                    for (var i = 1; i < recentProfiles.length; i++) {
                        if (!recentProfiles[i].favorite && !(recentProfiles[i].account === account && recentProfiles[i].profile === profile)) {
                            nonFavList.push(recentProfiles[i]);
                        }
                    }
                    // console.log('Non fav list:');
                    // console.log(nonFavList);
                    if (defaultProfile) {
                        recentProfiles[0].account = account;
                        recentProfiles[0].profile = profile;
                        recentProfiles[0].favorite = true;
                        $('.quickSwitch:contains("0: ")').text("0: " + account + "/" + profile);
                        $('.quickSwitch:contains("0: ")').attr("data-account", account);
                        $('.quickSwitch:contains("0: ")').attr("data-profile", profile);
                        updatedProfileList = recentProfiles;
                    } else {
                        if (recentProfiles[0].account === account && recentProfiles[0].profile === profile) {
                            //All we did was switch back to the default profile
                            return true;
                        }
                        //Default profile doesn't change.  Just add it.
                        updatedProfileList.push(recentProfiles[0]);
                        var accountProfileExists = 0;
                        for (var i = 1; i < recentProfiles.length; i++) {
                            if (recentProfiles[i].account === account && recentProfiles[i].profile === profile) {
                                // console.log('Account/Profile exists in index: '+i);
                                accountProfileExists = i;
                                if (recentProfiles[i].favorite) {
                                    //This is a favorite profile, return since no sorting is needed
                                    return true;
                                }
                                nonFavList.unshift(recentProfiles[i]);
                                break;
                            }
                        }
                        if (accountProfileExists) {
                            //Reorder the list based on favorites
                            for (var i = 1; i < recentProfiles.length; i++) {
                                // console.log('index == '+i+', '+JSON.stringify(recentProfiles[i]));
                                //Don't rewrite the account/profile we are swtiching to
                                if (accountProfileExists !== i) {
                                    if (!recentProfiles[i].favorite) {
                                        // console.log('This entry is not a favorite.  Going to place next available: '+JSON.stringify(nonFavList[nonFavListCounter]));
                                        updatedProfileList.push(nonFavList[nonFavListCounter]);
                                        nonFavListCounter++;
                                    } else {
                                        // console.log('This entry is a favorite.  placing: '+JSON.stringify(recentProfiles[i]));
                                        updatedProfileList.push(recentProfiles[i]);
                                    }
                                } else {
                                    // console.log('going to replace where the profile was with the next available one: '+JSON.stringify(nonFavList[nonFavListCounter]));
                                    updatedProfileList.push(nonFavList[nonFavListCounter]);
                                    nonFavListCounter++;
                                }
                            }
                        } else {
                            var obj = {};
                            obj.account = account;
                            obj.profile = profile;
                            obj["default"] = false;
                            obj.favorite = false;
                            //Add the new account/profile to the front of the nonFavList array
                            nonFavList.unshift(obj);
                            //Ensure that we won't add more than 10 items in the array.
                            var profileLength = recentProfiles.length > profileMaxLength ? profileMaxLength : recentProfiles.length;
                            for (var i = 1; i < profileLength; i++) {
                                if (!recentProfiles[i].favorite) {
                                    updatedProfileList.push(nonFavList[nonFavListCounter]);
                                    nonFavListCounter++;
                                } else {
                                    updatedProfileList.push(recentProfiles[i]);
                                }
                            }
                            // console.log('nonFavList[nonFavListCounter] == '+JSON.stringify(nonFavList[nonFavListCounter]));
                            // console.log('updatedProfileList.length == '+updatedProfileList.length);
                            if (typeof nonFavList[nonFavListCounter] !== "undefined" && updatedProfileList.length < profileMaxLength) {
                                // console.log('going to add another entry');
                                updatedProfileList.push(nonFavList[nonFavListCounter]);
                            }
                        }
                    }
                } else {
                    var obj = {};
                    obj.account = "services-" + $(".admin-menu-name").text().split(" ")[0].toLowerCase();
                    obj.profile = "main";
                    obj["default"] = true;
                    obj.favorite = true;
                    updatedProfileList.push(obj);
                }
                localStorage.setItem("recent_history", JSON.stringify(updatedProfileList));
                return true;
            };
            window.updateHistory = function() {
                var updatedProfileList = [];
                $("#quickSwitchSort .menulistitem").each(function(i) {
                    var obj = {};
                    obj.favorite = $(this).find("i").hasClass("icon-star");
                    var updatedText = $(this).find(".quickSwitch").text().replace(/\d+: /, i + ": ");
                    $(this).find(".quickSwitch").text(updatedText);
                    obj.account = $(this).find(".quickSwitch").data("account");
                    obj.profile = $(this).find(".quickSwitch").data("profile");
                    if (i) {
                        obj["default"] = false;
                    } else {
                        //Only set index 0 to true
                        obj["default"] = true;
                        obj.favorite = true;
                    }
                    updatedProfileList.push(obj);
                });
                localStorage.setItem("recent_history", JSON.stringify(updatedProfileList));
            };
            window.performSwitch = function(context, account, profile) {
                if (context) {
                    account = $(context).attr("data-account");
                    profile = $(context).attr("data-profile");
                }
                //Perform the switch
                utui.profile.getRevision({
                    account: account,
                    profile: profile,
                    revision: "latestversion"
                }, function() {
                    afterSwitch("", account, profile);
                });
            };
            window.afterSwitch = function(data, account, profile) {
                storeHistory(account, profile);
                $("#recentprofilesQuickSwitch").html(buildRecentHistory());
                $("#acct_refresh").click(function() {
                    updateAccountList();
                });
                $(".quickSwitch").click(function() {
                    performSwitch(this);
                });
                $("#quickSwitchSort").sortable({
                    items: "li:not(:first)",
                    update: function() {
                        updateHistory();
                    }
                });
                //Update the profile list
                getAccountProfiles(account);
                //Remove the status message about a publish message
                $("#global_status_close_icon").click();
            };
            window.getAccountProfiles = function(account) {
                if ($('#profile_account option[value="' + account + '"]').length) {
                    console.log("Going to get profiles for account: " + account);
                    utui.profile.getProfiles(null, {
                        account: account
                    }, function(data) {
                        if (data.profiles) {
                            //Put the profiles in alphabetical order
                            var profiles = data.profiles.sort();
                            $("#select_profile").autocomplete({
                                source: profiles,
                                delay: 0,
                                minLength: 0
                            });
                            $("#select_profile").val(profiles[0] || "");
                        } else {
                            console.log("No profiles returned in object");
                        }
                    }, null, 1);
                } else {
                    console.log(account + " isn't available for your account.  A search for profiles won't be done");
                }
            };
            window.updateAccountList = function() {
                // make an ajax request to get all of the accounts for this user
                $("#acct_refresh").animate({
                    "opacity": "0.3"
                }, 500);
                utui.service.get(utui.service.restapis.GET_ACCOUNTS, {}, null, function(data) {
                    $("#acct_refresh").animate({
                        "opacity": "1"
                    }, 200);
                    if (data) {
                        var accounts = data.accounts;
                        utui.login.accounts = accounts.sort();
                        //Grab all accounts
                        var sorted_accounts = utui.login.accounts.sort(utui.util.caseInsensitiveSort);
                        $("#select_account").autocomplete({
                            source: sorted_accounts,
                            delay: 0,
                            minLength: 0,
                            select: function(event, ui) {
                                getAccountProfiles(ui.item.label);
                            }
                        });
                        // Update TIQ select list
                        $profileSelect = $("#profile_account");
                        for (var i = 0; i < sorted_accounts.length; i++) {
                            var account = sorted_accounts[i];
                            $profileSelect.append($("<option></option>").attr("value", account).text(account));
                        }
                    }
                });
            };
            window.setupQuickSwitchV2 = function() {
                //Setup Recent History
                $("#recentprofiles").hide();
                if (!$("#recentprofilesQuickSwitch").length) {
                    $('<div id="recentprofilesQuickSwitch">' + buildRecentHistory() + "</div>").insertAfter("#recentprofiles");
                    $("#acct_refresh").click(function() {
                        updateAccountList();
                    });
                    $(".quickSwitch").click(function() {
                        performSwitch(this);
                    });
                    //Make the list sortable
                    $("#quickSwitchSort").sortable({
                        items: "li:not(:first)",
                        update: function() {
                            updateHistory();
                        }
                    });
                    //Hide the original load button and create our own.
                    $('button:contains("Load Version")').hide();
                    $('<div class="config"><button id="quickSwitchLoadVersion" class="btn">Load Version</button></div>')
                    .insertBefore("#loadversion_button")
                    .click(function() {
                        var account = $("#select_account").val();
                        var profile = $("#select_profile").val();
                        performSwitch(null, account, profile);
                    });
                    $('<li class="menu-li"><a id="quickSwitchDefaultProfile" href="#">Set Quick Switch Default Profile</a></li>')
                    .insertAfter($("#editUser_menuBtn").parent());
                    $("#quickSwitchDefaultProfile").click(function() {
                        $("#adminMenu_listing").hide();
                        var account = utui.data.settings.account;
                        var profile = utui.data.settings.profileid;
                        storeHistory(account, profile, true);
                    });
                    //Capture number inputs to allow for quick switch
                    Mousetrap.bindGlobal(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"], function(e, key) {
                        // console.log('User typed '+key);
                        // console.log('Recent History Visible = '+$('#recentprofilesQuickSwitch').is(':visible'));
                        if ($("#recentprofilesQuickSwitch").is(":visible")) {
                            setTimeout(function() {
                                // console.log('key: '+key);
                                // console.log('value: '+$('#profile_account-autocomplete').val());
                                if (key == $("#select_account").val()) {
                                    // console.log(key +' == '+ $('#select_account').val());
                                    // console.log($('#recentprofilesQuickSwitch a:contains("'+key+': ")'));
                                    $('#recentprofilesQuickSwitch a:contains("' + key + ': ")').click();
                                }
                            }, 300);
                        }
                    });
                    //Set default focus in the account field
                    $("#profile_menu_button").click(function() {
                        when(function() {
                            return ($("#lastaccount").is(":visible"));
                        }, function() {
                            //Update the text at the top of the history window
                            // $('.menulistheaderfont').text('Recent History (Sortable)');
                            //Get the current account and profile
                            var current_account = $("#profile_legend_account").text();
                            var current_profile = $("#profile_legend_profile").text();
                            //Grab all accounts
                            var accounts = [];
                            $("#profile_account option").each(function() {
                                accounts.push($(this).text());
                            });
                            //Create our own account selector
                            if (!$("#select_account").length) {
                                $('<input id="select_account" class="ui-widget ui-widget-content ui-corner-left" value="' + current_account + '"/>')
                                .insertAfter("#profile_account-autocomplete")
                                .change(function() {
                                    if ($(this).val().length > 1) {
                                        getAccountProfiles($(this).val());
                                    }
                                });
                                $('<button type="button" tabindex="-1" title="Show All Accounts" class="ui-button ui-widget ui-state-default ui-button-icon-only ui-corner-right ui-button-icon"><span class="ui-button-icon-primary ui-icon ui-icon-triangle-1-s"></span><span class="ui-button-text">&nbsp;</span></button>')
                                .insertAfter("#select_account")
                                .click(function() {
                                    $("#select_account").focus().autocomplete("search", "");
                                });
                                //Turn on auto complete for accounts
                                $("#select_account").autocomplete({
                                    source: accounts,
                                    delay: 0,
                                    minLength: 0,
                                    select: function(event, ui) {
                                        getAccountProfiles(ui.item.label);
                                    }
                                });
                            } else {
                                // $('<button type="button" tabindex="-1" title="Show All Accounts" class="ui-button ui-widget ui-state-default ui-button-icon-only ui-corner-right ui-button-icon"><span class="ui-button-icon-primary ui-icon ui-icon-triangle-1-s"></span><span class="ui-button-text">&nbsp;</span></button>')
                                //   .insertAfter('#select_account')
                                //   .click(function(){
                                //     setupShowAll(this);
                                //   });
                                $("#select_account").val(current_account);
                            }
                            //Grab all profiles
                            var profiles = [];
                            $("#profile_profileid option").each(function() {
                                profiles.push($(this).text());
                            });
                            //Create our own profile selector
                            if (!$("#select_profile").length) {
                                $('<input id="select_profile" class="ui-widget ui-widget-content ui-corner-left" value="' + current_profile + '"/>')
                                .insertAfter("#profile_profileid-autocomplete");
                                $('<button type="button" tabindex="-1" title="Show All Profiles" class="ui-button ui-widget ui-state-default ui-button-icon-only ui-corner-right ui-button-icon"><span class="ui-button-icon-primary ui-icon ui-icon-triangle-1-s"></span><span class="ui-button-text">&nbsp;</span></button>')
                                .insertAfter("#select_profile")
                                .click(function() {
                                    $("#select_profile").focus().autocomplete("search", "");
                                });
                                //Turn on auto complete for profiles
                                $("#select_profile").autocomplete({
                                    source: profiles,
                                    delay: 0,
                                    minLength: 0
                                });
                            } else {
                                // $('<button type="button" tabindex="-1" title="Show All Profiles" class="ui-button ui-widget ui-state-default ui-button-icon-only ui-corner-right ui-button-icon"><span class="ui-button-icon-primary ui-icon ui-icon-triangle-1-s"></span><span class="ui-button-text">&nbsp;</span></button>')
                                //   .insertAfter('#select_profile')
                                //   .click(function(){
                                //     setupShowAll(this);
                                //   });
                                $("#select_profile").val(current_profile);
                            }
                            //Add focus to the account box
                            $("#select_account").focus();
                            $("#select_account")[0].setSelectionRange(0, $("#select_account").val().length);
                            //Setup the tab index
                            $("#select_account").attr("tabindex", 1);
                            $("#select_profile").attr("tabindex", 2);
                            $("#quickSwitchLoadVersion").attr("tabindex", 3);
                            //Setup auto highlight of account and profile when there is focus
                            $("#select_account,#select_profile").on("focus", function() {
                                $(this)[0].setSelectionRange(0, $(this).val().length);
                            });
                            //Setup sticky/favorite profiles
                            $(".quickSwitchFavIcon").click(function() {
                                if ($(this).hasClass("icon-star")) {
                                    $(this).removeClass("icon-star");
                                    $(this).addClass("icon-star-empty");
                                } else if ($(this).hasClass("icon-star-empty")) {
                                    $(this).addClass("icon-star");
                                    $(this).removeClass("icon-star-empty");
                                }
                                updateHistory();
                            });
                        }, 100);
});
                    //Open the profile selection window
                    Mousetrap.bindGlobal("ctrl+z", function(e, key) {
                        console.log("User is requesting profile selection window");
                        $("#profile_menu_button").click();
                    });
                }
            };
            console.log("Quick Switch v2 Loaded");
        } catch (e) {
            console.log("Quick Switch Failed: " + e);
        }
    }
    /************** Add Quick Switch v2 End ***************************/
    /************** Add Show Labels Start ***************************/
    if (features.showLabels.enabled) {
        try {
            console.log("Add Show Labels Loading");

            function showLabels() {
                jQuery(".columnToggle").not(".selected").click();
                jQuery(".container_label.collapsed").removeClass("collapsed").addClass("expanded");
            }
            console.log("Add Show Labels Loaded");
        } catch (e) {
            console.log("Add Show Labels Failed: " + e);
        }
    }
    /************** Add Show Labels End ***************************/
    /************** Local Timestamp Start ***************************/
    if (features.localTimestamp.enabled) {
        try {
            console.log("Local Timestamp Loading");
            var selectors = {
                versions: [".hist_verEventDetailsContent", ".histEventDate:first"],
                summary: [".verEnvInfo", ".verDate:first"]
            },
            processDates = function(elements) {
                var idx = {
                    gmt: 0,
                    dates: 0
                },
                el, cl, local;
                idx.gmt = elements.length;
                while (idx.gmt--) {
                    idx.dates = elements[idx.gmt].length;
                    while (idx.dates--) {
                        e = jQuery(elements[idx.gmt][idx.dates]);
                        el = e.first();
                        cl = el.attr("class");
                        el.siblings("." + cl).remove();
                        local = new Date(el.text()).toLocaleString();
                        jQuery('<div class="' + cl + '">' + local + " (Local)</div>").insertAfter(el).addClass("tmui");
                    }
                }
            },
            processQueue = function(queue) {
                var $q = [],
                idx = queue.length;
                while (idx--) {
                    $q.push(jQuery(queue[idx][0]).find(queue[idx][1]));
                }
                processDates($q);
            };
            processQueue([selectors.versions, selectors.summary]);
            var hist_eventRow = new MutationObserver(function(mutations) {
                processQueue([selectors.versions]);
            });
            hist_eventRow.observe(document.querySelector(".hist_eventRow"), observerConfig);
            var dashboard_content = new MutationObserver(function(mutations) {
                processQueue([selectors.summary]);
            });
            dashboard_content.observe(document.querySelector("#dashboard_content"), observerConfig);
            console.log("Local Timestamp Loaded");
        } catch (e) {
            console.log("Local Timestamp Failed: " + e);
        }
    }
    /************** Local Timestamp End ***************************/
    /************** Extension Search Start ***************************/
    if (features.extensionSearch.enabled) {
        try {
            console.log("Extension Search Loading");
            localStorage.setItem("extensionSearchQuery", ""); //remove storage on login
            function searchExtensions(string) {
                // console.log('Running a search for "'+string+'"');
                localStorage.setItem("extensionSearchQuery", string);
                var re = new RegExp(".*" + string + ".*", "igm");
                var data = utui.data.customizations;
                var extensions = {};
                if (string !== "") {
                    Object.keys(data).forEach(function(id) {
                        // console.log(data[id]);
                        var extension = data[id];
                        Object.keys(extension).forEach(function(key) {
                            // console.log(key,extension[key]);
                            var extData = extension[key];
                            if (key != "labels" && key != "scope" && key != "scopevars" && key != "sort" && key != "status" && key != "type" && key != "_ignoreError" && !key.match(/_setoption/) && key != "settings") {
                                if (typeof extData === "string" && re.test(extData)) {
                                    extensions[extension.sort] = 1;
                                }
                            }
                        });
                    });
                }
                $("#customize_content .customize_container").each(function(i) {
                    if (extensions[i] == 1) {
                        $(this).find("h3").css("background-color", "yellow");
                    } else {
                        $(this).find("h3").css("background-color", "");
                    }
                });
            }

            function setupExtensionSearch() {
                if (!$("#extension_search").length) {
                    var searchTerm = localStorage.getItem("extensionSearchQuery") || "";
                    $('<div class="inputSearchContainer tmui"><input class="search" id="extension_search" value="' + searchTerm + '" type="text"></div>')
                    .css("float", "right")
                    .appendTo("#tabs-customizations .config_button_nofloat");
                    var keysPressed = 0;
                    $("#extension_search").bind("keydown", function() {
                        // console.log('keydown');
                        var grabKeyCount = ++keysPressed;
                        setTimeout(function() {
                            if (keysPressed == grabKeyCount) {
                                searchExtensions($("#extension_search").val());
                            }
                        }, 250);
                    });
                    searchExtensions($("#extension_search").val());
                }
            }
            when(function() {
                return utui.permissions && utui.users && Object.keys(utui.permissions.getUserPermissions()).length > 0;
            }, function() {
                var extensionTopObserver = new MutationObserver(function(mutations) {
                    setupExtensionSearch();
                });
                try {
                    extensionTopObserver.observe(document.querySelector("#customize_content"), observerConfig);
                } catch (e) {
                    console.log(e);
                }
            });
            console.log("Extension Search Loaded");
        } catch (e) {
            console.log("Extension Search Failed: " + e);
        }
    }
    /************** Extension Search End ***************************/
    /************** Add Extension Shortcuts Start ***************************/
    if (features.extensionShortcuts.enabled) {
        try {
            console.log("Extension Shortcuts Loading");
            var debugCode = "try{\n    /*Set the debug flag if that is in the query string*/\n    if(utag.data['qp.utagdb']){\n        if(utag.data['qp.utagdb'].match(/1|true/i)){\n            document.cookie='utagdb=true';\n            utag.data['cp.utagdb']='true';\n            utag.cfg.utagdb=true;\n        }else{\n            document.cookie='utagdb=false';\n            utag.data['cp.utagdb']='false';\n            utag.cfg.utagdb=false;\n        }\n    }\n    /*If environment isn't prod, enable the debug flag unless it was already set to false*/\n    if(utag.cfg.path.indexOf('/prod/')===-1&&(typeof utag.data['cp.utagdb']==='undefined'||utag.data['cp.utagdb']==='true')){\n        document.cookie='utagdb=true';\n        utag.cfg.utagdb=true;\n    }\n}catch(e){\n    utag.DB('Tealium Debugging Tools Failed: '+e);\n}";
            // var debugCode = "try{\n    /*Set the debug flag if that is in the query string*/\n    if(utag.data['qp.utagdb']){\n        if(utag.data['qp.utagdb'].match(/1|true/i)){\n            document.cookie='utagdb=true';\n            utag.data['cp.utagdb']='true';\n            utag.cfg.utagdb=true;\n        }else{\n            document.cookie='utagdb=false';\n            utag.data['cp.utagdb']='false';\n            utag.cfg.utagdb=false;\n        }\n    }\n    /*If environment isn't prod, enable the debug flag unless it was already set to false*/\n    if(utag.cfg.path.indexOf('/prod/')===-1&&(typeof utag.data['cp.utagdb']==='undefined'||utag.data['cp.utagdb']==='true')){\n        document.cookie='utagdb=true';\n        utag.cfg.utagdb=true;\n        utag.ut.loader({\"type\":\"script\",\"src\":\"//tags.tiqcdn.com/utag/tealium-solutions/main/prod/utag.7.js?_cb=\"+(function(d,s){d=new Date(); s=(d.getUTCFullYear())+ (\"0\"+(d.getUTCMonth()+1)).substr(-2) + (\"0\"+d.getUTCDate()).substr(-2) + (\"0\"+d.getUTCHours()).substr(-2); return s})()});\n    }\n}catch(e){\n    utag.DB('Tealium Debugging Tools Failed: '+e);\n}";
            var debugNotes = "To set debug in the browser console, add utagdb=1 to the url.\nhttp://www.domain.com/home.html?utagdb=1\nTo turn off the debug to the console, change 1 to 0\nhttp://www.domain.com/home.html?utagdb=0\nDebug is automatically enabled for environments that aren't prod";
            var debugTitle = "Tealium Debugging Tools";

            function findExtensionByTitle(title) {
                var data = utui.data.customizations;
                var matchFound = 0;
                if (title !== "") {
                    Object.keys(data).forEach(function(id) {
                        if (data[id].title == title) {
                            // console.log('Found a match. Extension '+id);
                            matchFound = id;
                        }
                    });
                }
                return matchFound;
            }

            function addDebugExtension() {
                //Should be 0 if extension doesn't exist, otherwise will be the ID of the extension
                var extensionID = findExtensionByTitle("Tealium Debugging Tools");
                if (!extensionID) {
                    var ext = {
                        "code": debugCode,
                        "id": "100011",
                        "notes": debugNotes,
                        "scope": "global",
                        "scopevars": "",
                        "sort": 0,
                        "status": "active",
                        "title": debugTitle,
                        "type": "new"
                    };
                    exapi.getNextIdFromServer(1, null,
                        // onSuccess
                        function(providedLastId, count, extId) {
                            // Add to Model
                            exapi.addExtension(extId, ext.id, ext);
                            // Add to View
                            utui.customizations.addItem(extId);
                            moveDebugExtensionToTop();
                        },
                        // onFailure
                        function(extId) {
                            // Add to Model
                            exapi.addExtension(extId, ext.id, ext);
                            // Add to View
                            utui.customizations.addItem(extId);
                            moveDebugExtensionToTop();
                        });
                } else if (utui.data.customizations[extensionID].code != debugCode || utui.data.customizations[extensionID].notes != debugNotes) {
                    console.log(debugTitle + " Extension Already Present, but Not Up To Date");
                    utui.data.customizations[extensionID].code = debugCode;
                    utui.data.customizations[extensionID].notes = debugNotes;
                    //Show the Save/Publish button
                    utui.profile.toggleUnsavedChangesBtn();
                } else {
                    console.log(debugTitle + " Extension Already Present and Up To Date!");
                }
                addDebugTag();
                //Go ahead and remove the button since it is no longer needed.
                $("#customize_addDebugBtn").fadeOut();
            }

            function addDebugTag() {
                var tagID = findTagByTitle("DEBUG: Real-Time Audit");
                if (!tagID) {
                    //Need to add the tag
                    var tag = {
                        "title": "DEBUG: Real-Time Audit",
                        "status": "active",
                        "tag_id": "20067",
                        "config_tagtype": "script",
                        "config_baseurl": "https://deploytealium.com/verify/realTime.php",
                        "config_staticparams": "account=" + utui.data.settings.account + "&profile=" + utui.data.settings.profileid + "",
                        selectedTargets: {
                            dev: "true",
                            qa: "true",
                            prod: "false"
                        }
                    };
                    utui.automator.addTag(tag);
                } else {
                    //Don't need to do anything
                }
            }

            function findTagByTitle(title) {
                var data = utui.data.manage;
                var matchFound = 0;
                if (title !== "") {
                    Object.keys(data).forEach(function(id) {
                        if (data[id].title == title) {
                            matchFound = id;
                        }
                    });
                }
                return matchFound;
            }

            function moveDebugExtensionToTop() {
                var extension_rev_order = [{
                    scope: "All Tags",
                    title: debugTitle
                }];
                for (var i = 0; i < extension_rev_order.length; i++) {
                    var name_match = extension_rev_order[i].title;
                    var scope_match = extension_rev_order[i].scope;
                    // get extensions by scope
                    $('div.container_scope:contains("' + scope_match + '")').closest("#customize_content>div").each(function(a, b) {
                        // Find the extension title
                        var titleText = $(b).find(".container_title").text().trim();
                        if (titleText.indexOf(name_match) >= 0) {
                            // Move it to the top of the list
                            $(b).prependTo("#customize_content");
                            // Grab the extension id
                            var id = $(b).attr("data-id");
                            // Figures out the new index
                            var newSort = $("#customize_content>div").index(b);
                            // Sets the sort index
                            utui.data.customizations[id].sort = newSort;
                            // Give the user some feedback
                            console.log("Moved: '" + titleText + "'");
                        }
                    });
                }
                // Refresh the accordion with the new sort order
                utui.customizations.drawJUIAccordion();
            }

            function moveExtensions(elements) {
                for (var i = 0; i < elements.length; i++) {
                    $(elements[i]).prependTo("#customize_content");
                }
            }

            function sortExtensions() {
                var preloader = [];
                var alltags = [];
                var vendortags = {};
                var domready = [];
                //Find out if the debug tag is in the account
                var debugtag = 0;
                $("#customize_content>div").each(function() {
                    var scope = $(this).find(".container_scope").text().trim();
                    if ($(this).find(".container_title").text().trim() == debugTitle) {
                        debugtag = 1;
                    }
                    switch (scope) {
                        case "Pre Loader":
                        preloader.push(this);
                        break;
                        case "All Tags":
                        alltags.push(this);
                        break;
                        case "DOM Ready":
                        domready.push(this);
                        break;
                        default:
                        if (typeof vendortags[scope] === "undefined") {
                            vendortags[scope] = [];
                        }
                        vendortags[scope].push(this);
                    }
                });
                //Must reverse the arrays becuase we will be applying the extensions in reverse order
                moveExtensions(domready.reverse());
                Object.keys(vendortags).reverse().forEach(function(key) {
                    moveExtensions(vendortags[key].reverse());
                });
                moveExtensions(alltags.reverse());
                moveExtensions(preloader.reverse());
                if (debugtag) {
                    //Add extension to the top of the list
                    $('.container_title:contains("' + debugTitle + '")').closest(".customize_container").prependTo("#customize_content");
                }
                //Update the sort index for all extensions
                $("#customize_content>div").each(function(index) {
                    // Grab the extension id
                    var id = $(this).attr("data-id");
                    // Sets the sort index
                    utui.data.customizations[id].sort = index;
                });
                // Refresh the accordion with the new sort order
                // Check to see if any extensions are already opened
                if (jQuery(".customize_container .ui-state-active").length) {
                    var uid = jQuery(".customize_container .ui-state-active").parent().data("id");
                    utui.customizations.drawJUIAccordion(uid);
                    //Scroll the extension into proper view if the user has enabled the feature
                    if (features.extensionScroll.enabled) {
                        try {
                            setTimeout(function() {
                                //Extensions
                                var myContainer = $("#customize_content");
                                var scrollTo = $("#customizations_" + uid);
                                scrollTopInt = scrollTo.offset().top - myContainer.offset().top + myContainer.scrollTop();
                                // console.log(scrollTopInt + " = " + scrollTo.offset().top + " - " + myContainer.offset().top + " + " + myContainer.scrollTop());
                                myContainer.animate({
                                    scrollTop: scrollTopInt,
                                    duration: 200
                                });
                            }, 250);
                        } catch (e) {
                            console.log("Failed to scroll extension into view: " + e);
                        }
                    }
                } else {
                    // No extensions are opened, so just redraw the accordion
                    utui.customizations.drawJUIAccordion();
                }
                //Show the Save/Publish button
                utui.profile.toggleUnsavedChangesBtn();
            }

            function createExtensionShortcutButtons() {
                if (!$("#customize_sortBtn").length) {
                    $('<span id="customize_sortBtn" class="btn btn-info tmui"><i class="icon-sort"></i> Sort Extensions</span>')
                    .css("float", "left")
                    .css("margin-left", "10px")
                    .click(sortExtensions)
                    .appendTo("#tabs-customizations .config_button_nofloat");
                }
                if (!$("#customize_addDebugBtn").length) {
                    var extensionID = findExtensionByTitle(debugTitle);
                    var classname = "btn tmui";
                    var buttonText = "Add Debug Extension";
                    if (extensionID) {
                        if (utui.data.customizations[extensionID].code != debugCode || utui.data.customizations[extensionID].notes != debugNotes) {
                            classname += " btn-danger";
                            buttonText = "Update Debug Extension";
                        }
                    }
                    $('<span id="customize_addDebugBtn" class="' + classname + '"><i class="icon-wrench"></i> ' + buttonText + "</span>")
                    .css("float", "left")
                    .css("margin-left", "10px")
                    .click(addDebugExtension)
                    .appendTo("#tabs-customizations .config_button_nofloat");
                }
            }
            when(function() {
                return utui.permissions && utui.users && Object.keys(utui.permissions.getUserPermissions()).length > 0;
            }, function() {
                var extensionTopObserver2 = new MutationObserver(function(mutations) {
                    createExtensionShortcutButtons();
                });
                try {
                    extensionTopObserver2.observe(document.querySelector("#customize_content"), observerConfig);
                } catch (e) {
                    console.log(e);
                }
            });
            console.log("Extension Shortcuts Loaded");
        } catch (e) {
            console.log("Extension Shortcuts Failed: " + e);
        }
    }
    /************** Add Extension Shortcuts End ***************************/
    /************** Hide TM Buttons Start ***************************/
    try {
        console.log("Hide TM Buttons Loading");
        var hideTMButtons = 0;
        //Create empty CSS style
        $('<style id="tmuiStyleSheet"></style>').appendTo("head");
        //Create the show hide button
        $('<span id="showHideTMButtons" title="Show/Hide TM Buttons">Show/Hide TM Buttons</span>')
        .insertAfter("#logoContainer")
        .css("cursor", "pointer")
        .css("left", "200px")
        .css("top", "15px")
        .css("position", "relative")
        .css("color", "white")
        .css("font-size", "larger")
        .click(function() {
            hideTMButtons = hideTMButtons ? 0 : 1;
            if (hideTMButtons == 1) {
                    // $('.tmui').hide();
                    $("#tmuiStyleSheet").html(".tmui{display:none !important;}");
                    $(".tmui-color").css("color", "#FFFFFF");
                    $("#globalMessageButton").css("cursor", "default").css("color", "#FFFFFF").addClass("tmui-color");
                    unsafeWindow.__getGlobalMessageAllow = "false";
                    console.log("Tampermonkey Buttons Are Currently Hidden");
                    if (features.removeAlias.enabled) {
                        restoreAlias();
                    }
                } else {
                    // $('.tmui').show();
                    $("#tmuiStyleSheet").html(".tmui{display:block;}");
                    $(".tmui-color").css("color", "#C71585");
                    $("#globalMessageButton").css("cursor", "pointer").css("color", "#C71585").addClass("tmui-color");
                    unsafeWindow.__getGlobalMessageAllow = "true";
                    console.log("Tampermonkey Buttons Are Currently Visible");
                    if (features.removeAlias.enabled) {
                        hideAlias();
                    }
                }
            });
        console.log("Hide TM Buttons Loaded");
    } catch (e) {
        console.log("Hide TM Buttons Failed: " + e);
    }
    /************** Hide TM Buttons End ***************************/
    /************** Add Extension Scroll Start ***************************/
    if (features.extensionScroll.enabled) {
        try {
            console.log("Extension Scroll Loading");
            jQuery(document.body).on("mousedown", "div[id^=customizations][data-id] h3", function(e) {
                window.extensionElementID = jQuery(this).parent().attr("data-id");
                when(function() {
                    return jQuery("#customizations_" + extensionElementID + "_accordionBody").is(":visible");
                }, function() {
                    // console.log('extension should be opened now');
                    //Extensions
                    var myContainer = $("#customize_content");
                    var scrollTo = $("#customizations_" + extensionElementID);
                    scrollTopInt = scrollTo.offset().top - myContainer.offset().top + myContainer.scrollTop();
                    // console.log(scrollTopInt + " = " + scrollTo.offset().top + " - " + myContainer.offset().top + " + " + myContainer.scrollTop());
                    myContainer.animate({
                        scrollTop: scrollTopInt,
                        duration: 50
                    });
                }, 100, 10);
                // //Only scroll when opening, not closing
                // if(jQuery(this).find('#customizations_'+extensionElementID+'_accordionBody').is(':visible')){
                //   //console.log("extensionElementID: " + extensionElementID);
                //   setTimeout(function(){
                //     //Extensions
                //     var myContainer = $('#customize_content');
                //     var scrollTo = $('#customizations_'+extensionElementID);
                //     scrollTopInt = scrollTo.offset().top - myContainer.offset().top + myContainer.scrollTop();
                //     // console.log(scrollTopInt + " = " + scrollTo.offset().top + " - " + myContainer.offset().top + " + " + myContainer.scrollTop());
                //     myContainer.animate({scrollTop: scrollTopInt, duration: 50});
                //   }, 250);
                // }
            });
            console.log("Extension Scroll Loaded");
        } catch (e) {
            console.log("Extension Scroll Failed: " + e);
        }
    }
    /************** Add Extension Scroll End ***************************/
    /************** Add Lookup Tables Sort Start ***************************/
    if (features.lookupSort.enabled) {
        try {
            console.log("Lookup Tables Sort Loading");
            utui.customizations_template[100020].addItem_old = utui.customizations_template[100020].addItem;
            utui.customizations_template[100020].addItem = function(a, b) {
                var _r = utui.customizations_template[100020].addItem_old(a, b);
                $("div.customization_div > div.customization_item:last > div").css("cursor", "ns-resize");
                return _r;
            };
            utui.customizations.drawJUIAccordion_old = utui.customizations.drawJUIAccordion;
            utui.customizations.drawJUIAccordion = function(extid) {
                utui.customizations.drawJUIAccordion_old(extid);
                if (extid && utui.data.customizations[extid].id === "100020") {
                    window._lkup($("#customizations_" + extid));
                }
            };
            window._lkup = function(sel) {
                $("div.ui-accordion-content.ui-helper-reset.ui-widget-content.ui-corner-bottom", sel).one("mouseover", function() {
                    var setAttr = function($el, _name) {
                        $el.attr("id", _name);
                        $el.attr("name", _name);
                    };
                    $("div.customization_div > div.customization_item:last > div", this).css("cursor", "ns-resize");
                    $("div.customization_div > div.customization_item:last", this)
                    .sortable({
                        axis: "y",
                        handle: "div",
                        update: function(e, ui) {
                            var extnID = $(this).attr("id").match(/(\d+)_/)[1],
                            extens = utui.data.customizations,
                            _n = "_name",
                            _v = "_value",
                            _c = "_comment",
                            _s = "_setitem";
                                //console.log("LoouUp Table re-sort",extnID, this);
                                for (var _prop in utui.util.getVars(extens[extnID])) {
                                    if (_prop.match(/\d+_/)) {
                                        try {
                                            delete extens[extnID][_prop];
                                        } catch (e) {}
                                    }
                                }
                                $("div.nooverflow", this).each(function() {
                                    var id = $(this).attr("id"),
                                    id_ts = id.replace(_s, "");
                                    var $name = $("#" + id_ts + _n),
                                    $val = $("#" + id_ts + _v),
                                    $comment = $("#" + id_ts + _c);
                                    var newTS = utui.util.getContainerId();
                                    $(this).attr("id", newTS + _s);
                                    setAttr($name, newTS + _n);
                                    setAttr($val, newTS + _v);
                                    setAttr($comment, newTS + _c);
                                    $("button.btn.btn-mini:first", this).attr("onclick", "if($('#" + newTS + _s + "').siblings().length>=1){utui.customizations_template[100020].removeItem('" + newTS + _s + "')};");
                                    extens[extnID][newTS + _c] = $comment.val();
                                    extens[extnID][newTS + _n] = $name.val();
                                    extens[extnID][newTS + _v] = $val.val();
                                });
                                var obj = extens[extnID],
                                con = utui.constants.extensions;
                                utui.profile.setActionPerformed({
                                    action: con.UPDATED,
                                    data: {
                                        id: obj._id,
                                        name: obj.title,
                                        type: obj.id,
                                        kind: con.TYPE,
                                        operation: utui.constants.operation.UPDATED,
                                        container: "customizations_" + obj._id
                                    }
                                }, true);
                            }
                        });
                });
            };
            $(document.body).on("mousedown", 'div.customize_container[data-template-id="100020"] > h3', function() {
                window._lkup($(this).parent());
            });
            console.log("Lookup Tables Sort Loaded");
        } catch (e) {
            console.log("Lookup Tables Sort Failed: " + e);
        }
    }
    /************** Add Lookup Tables Sort End ***************************/
    /************** Remove Alias Start ***************************/
    if (features.removeAlias.enabled) {
        try {
            console.log("Hide Alias Loading");

            function hideAlias() {
                //Go through each data source
                Object.keys(utui.data.define).forEach(function(uid) {
                    if (typeof utui.data.define[uid].title === "undefined") {
                        //This data source was created before the alias feature, so we can move on.
                        return;
                    }
                    if (typeof utui.data.define[uid]._title === "undefined") {
                        //Make a copy of the alias into a new property _title
                        utui.data.define[uid]._title = utui.data.define[uid].title;
                        //Clear out the current alias so that the UI uses the variable name
                        utui.data.define[uid].title = "";
                    }
                });
            }

            function restoreAlias() {
                //Go through each data source
                Object.keys(utui.data.define).forEach(function(uid) {
                    if (typeof utui.data.define[uid]._title !== "undefined") {
                        //Restore the alias
                        utui.data.define[uid].title = utui.data.define[uid]._title;
                        //Delete our placeholder
                        delete utui.data.define[uid]._title;
                    }
                });
            }
            //Add click handler for Save/Publish that will restore the alias
            $("#global_save").click(function() {
                restoreAlias();
                //Remove the alias again if the user closes the save/publish dialog
                setTimeout(function() {
                    when(function() {
                        return !$(".savePublishDialog:visible").length;
                    }, function() {
                        //Make sure there is enough time that the save took place on the existing object before altering it again.
                        setTimeout(function() {
                            hideAlias();
                        }, 750);
                    });
                }, 1000);
            });
            console.log("Hide Alias Loaded");
        } catch (e) {
            console.log("Hide Alias Failed: " + e);
        }
    }
    /************** Remove Alias End ***************************/
    /************** Setup Listener for Tab Click Event Start **********************/
    try {
        console.log("Listener for Tab Click Event Loading");
        utui.util.pubsub.subscribe(utui.constants.views.TAB_CLICK, function(e) {
            switch (e.page) {
                case "Dashboard":
                when(function() {
                    return $("#tabs_content .ui-state-active #tabs_dashboard").length;
                }, function() {});
                break;
                case "Data Sources":
                when(function() {
                    return $("#tabs_content .ui-state-active #tabs_define").length;
                }, function() {});
                break;
                case "Loadrules":
                when(function() {
                    return $("#tabs_content .ui-state-active #tabs_loadrules").length;
                }, function() {
                    if (features.showLabels.enabled) {
                        showLabels();
                    }
                    if (features.sendToTopBottom.enabled) {
                        sendToTopBottomListener();
                    }
                });
                break;
                case "Tags":
                when(function() {
                    return $("#tabs_content .ui-state-active #tabs_manage").length;
                }, function() {
                    if (features.showLabels.enabled) {
                        showLabels();
                    }
                    if (features.tagWizardShortcuts.enabled) {
                        addEditTemplatesToManageScreen();
                    }
                    if (features.sendToTopBottom.enabled) {
                        sendToTopBottomListener();
                    }
                    if (features.enlargeIds.enabled) {
                        enlargeIds();
                    }
                });
                break;
                case "Extensions":
                when(function() {
                    return $("#tabs_content .ui-state-active #tabs_customizations").length;
                }, function() {
                    if (features.showLabels.enabled) {
                        showLabels();
                    }
                    if (features.sendToTopBottom.enabled) {
                        sendToTopBottomListener();
                    }
                });
                break;
                case "Versions":
                when(function() {
                    return $("#tabs_content .ui-state-active #tabs_publish").length;
                }, function() {});
                break;
                case "Scenarios":
                when(function() {
                    return $("#tabs_content .ui-state-active #tabs_scenarios").length;
                }, function() {});
                break;
            }
        });
        console.log("Listener for Tab Click Load Event Loaded");
    } catch (e) {
        console.log("Listener for Tab Click Load Event Failed: " + e);
    }
    /************** Setup Listener for Tab Click Event End ************************/
    /************** Send to Top/Bottom Start ***************************/
    if (features.sendToTopBottom.enabled) {
        try {
            console.log("Send to Top/Bottom Loading");
            var sendToTopBottomListener = function() {
                // console.log('added the sendToTopBottomListener');
                //Let's first remove the listener before adding a new one.
                $(".label_select_checkbox").off("click");
                $(".label_select_checkbox").on("click", function() {
                    var tab = $(this).closest('div[id^="tabs-"]').attr("id");
                    // console.log('Clicked the checkbox in tab: '+tab);
                    if ($("#" + tab).find(".label_select_checkbox:checked").length) {
                        // console.log('Must have something checked');
                        //Only add the buttons if they don't exist already
                        if (!$("#" + tab + " #sendToTop").length) {
                            $('<div class="tab-menu-item"><button id="sendToTop" class="btn btn-success" style="margin-top:0;"><i class="icon-arrow-up"></i> Send to Top</button></div>')
                            .prependTo("#" + tab + ' div[id$="_headerControls"]');
                            $('<div class="tab-menu-item"><button id="sendToBottom" class="btn btn-success" style="margin-top:0;"><i class="icon-arrow-down"></i> Send to Bottom</button></div>')
                            .prependTo("#" + tab + ' div[id$="_headerControls"]');
                            //Add click handlers
                            $("#" + tab + " #sendToTop").click(function() {
                                sendToTop(tab);
                            });
                            $("#" + tab + " #sendToBottom").click(function() {
                                sendToBottom(tab);
                            });
                        }
                    } else {
                        // console.log('Nothing checked.');
                        $("#" + tab + " #sendToTop,#" + tab + " #sendToBottom").parent().remove();
                    }
                });
            }
            var sendToBottom = function(tab) {
                // console.log('going to send to bottom');
                var elements = getCheckedElements(tab);
                for (var i = 0; i < elements.length; i++) {
                    $(elements[i]).appendTo("#" + tab + ' div[id$="_content"]');
                }
                redrawUI(tab);
            }
            var sendToTop = function(tab) {
                // console.log('going to send to top');
                var elements = [];
                getCheckedElements(tab).each(function() {
                    elements.push(this);
                });
                elements = elements.reverse();
                for (var i = 0; i < elements.length; i++) {
                    $(elements[i]).prependTo("#" + tab + ' div[id$="_content"]');
                }
                if (tab === "tabs-loadrules") {
                    //Need to make sure that All Pages stays on top
                    $('div[data-id="all"]').prependTo("#" + tab + ' div[id$="_content"]');
                }
                redrawUI(tab);
            }
            var getCheckedElements = function(tab) {
                if (tab === "tabs-customizations") {
                    return $("#" + tab).find(".label_select_checkbox:checked").closest(".customize_container");
                } else {
                    return $("#" + tab).find(".label_select_checkbox:checked").closest('div[id*="_content_"]');
                }
            }
            var redrawUI = function(tab) {
                switch (tab) {
                    case "tabs-loadrules":
                    utui.loadrules.view.updateAccordion();
                    break;
                    case "tabs-manage":
                    utui.manage.updateAccordion();
                    break;
                    case "tabs-customizations":
                    utui.customizations.drawJUIAccordion();
                    break;
                    default:
                }
                //Show the Save/Publish button
                utui.profile.toggleUnsavedChangesBtn();
            }
            console.log("Send to Top/Bottom Loaded");
        } catch (e) {
            console.log("Send to Top/Bottom Failed: " + e);
        }
    }
    /************** Send to Top/Bottom End ***************************/
    /************** Global Message Start ***************************/
    if (features.globalMessage.enabled) {
        try {
            console.log("Global Message Loading");
            unsafeWindow.__getGlobalMessageAllow = "true";
            var showGlobalMessagePopup = function(message_obj, showAll) {
                if (typeof message_obj.account_message === "undefined") {
                    message_obj.account_message = "";
                }
                if (typeof message_obj.profile_message === "undefined") {
                    message_obj.profile_message = "";
                }
                if (typeof showAll === "undefined") {
                    showAll = false;
                }
                if (message_obj.account_message === "" && message_obj.profile_message === "") {
                    // return false;
                }
                $("#account_message_popup").remove();
                var html = '<button id="global_popup_update_btn" type="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only">';
                html += '<span class="ui-button-text">Update</span>';
                html += "</button>";
                var update = $(html);
                update.css("cursor", "pointer")
                .css("float", "right")
                .css("margin-right", "10px")
                .css("display", "none")
                .click(function() {
                    setGlobalMessage();
                });
                var html = '<button id="global_popup_close_btn" type="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only">';
                html += '<span class="ui-button-text">Close</span>';
                html += "</button>";
                var close = $(html);
                close.css("cursor", "pointer")
                .css("float", "right")
                .css("margin-right", "10px")
                .click(function() {
                    $("#account_message_popup").remove();
                });
                var html = '<div id="account_message_popup">';
                var width = 800;
                var left_px = Math.round(($(window).width() - width) / 2) + "px";
                // html .= '<span class="alert" style="color:red;margin-left:20px;font-size:18px;"></span><br/>';
                //  html += '<span class="global_help_text" style="margin-left:20px; font-size:20px;">Global Message for account ' + $('#profile_legend_account').text() + '</span>';
                html += '<span id="close_upper_right">&nbsp;X&nbsp;</span>';
                html += '<br><br><span id="important_popup_label">This is the Account Note and, cannot be edited from TiQ <a href="https://deploytealium.com/message/" target="_blank" style="text-decoration:none;">*</a></span>';
                html += '<textarea disabled id="important_popup_text" rows="10" cols="80" /><br>';
                html += '<span id="important_popup_last"></span>';
                html += "<br><br>";
                html += '<span id="global_popup_label">These shared Profile Notes can be edited by all Team Members, start typing to edit.</span>';
                html += '<textarea id="global_popup_text" rows="13" cols="80" />';
                html += '<span id="global_popup_last"></span>';
                html += "<br><br>";
                html += "</div>";
                global_help = $(html);
                global_help
                .css("position", "absolute")
                .css("z-index", "10000")
                .css("background-color", "white")
                .css("border-style", "solid")
                .css("border-width", "3px")
                .css("left", left_px)
                .css("top", "100px")
                .css("border-color", "#057ABD")
                .css("border-radius", "10px")
                .width(width)
                .height(560)
                .append(close)
                .append(update)
                .appendTo(document.body);
                $("#global_popup_label")
                .css("margin-left", "4%")
                .css("font-size", "small")
                .css("color", "#888888");
                $("#important_popup_label")
                .css("margin-left", "4%")
                .css("font-size", "small")
                .css("color", "#888888")
                .css("margin-top", "2a%");
                $("#global_popup_text")
                .css("width", "90%")
                .css("margin-left", "4%")
                .css("font-size", "medium")
                .css("margin-bottom", "0px")
                .val(message_obj.profile_message);
                $("#important_popup_text")
                .css("width", "90%")
                .css("margin-left", "4%")
                .css("font-size", "medium")
                .css("color", "mediumvioletred")
                .css("font-weight", "bold")
                .css("margin-bottom", "0px")
                .val(message_obj.account_message);
                $("#close_upper_right")
                .css("cursor", "pointer")
                .css("position", "absolute")
                .css("top", "0")
                .css("right", "0")
                .css("background-color", "#057ABD")
                .css("color", "white")
                .css("font-size", "medium")
                .css("border-bottom-left-radius", "4px")
                .click(function() {
                    $("#account_message_popup").remove();
                });
                $("#important_popup_last")
                .css("margin-left", "4%")
                .css("font-size", "x-small")
                .css("color", "#888888")
                .css("border-top", "0px")
                .css("border", "none");
                if (message_obj.account_date_modified == "") {
                    $("#important_popup_last").text("");
                } else {
                    $("#important_popup_last").text("Account Message Last Updated on " + message_obj.account_date_modified + " by " + message_obj.account_last_email);
                }
                $("#global_popup_last")
                .css("margin-left", "4%")
                .css("font-size", "x-small")
                .css("color", "#888888")
                .css("border-top", "0px")
                .css("border", "none");
                if (message_obj.profile_date_modified == "") {
                    $("#global_popup_last").text("");
                } else {
                    $("#global_popup_last").text("Profile Message Last Updated on " + message_obj.profile_date_modified + " by " + message_obj.profile_last_email);
                }
                $("#global_popup_text").keyup(function(e) {
                    $("#global_popup_update_btn").show();
                });
                $("#global_popup_close_btn").focus();
            };
            var getGlobalMessage = function(showAll) {
                if (unsafeWindow.__getGlobalMessageAllow === "false") {
                    return false;
                }
                if (typeof showAll === "undefined") {
                    showAll = false;
                }
                var account_name = unsafeWindow.utui.login.account;
                var profile_name = unsafeWindow.utui.login.profile;
                var user_email = unsafeWindow.utui.login.email;
                var publishHistory = Object.keys(unsafeWindow.utui.data.publish_history).sort().reverse();
                var emails = [];
                for (var i = 0; i < publishHistory.length; i++) {
                    var email = unsafeWindow.utui.data.publish_history[publishHistory[i]][unsafeWindow.utui.data.publish_history[publishHistory[i]].publishState["saved"]].operator;
                    if (emails.indexOf(email) === -1) {
                        emails.push(email);
                    }
                }
                jQuery.ajax({
                    async: true,
                    url: "https://deploytealium.com/message/globalMessage.php",
                    type: "POST",
                    data: JSON.stringify({
                        "debug": "true",
                        "action": "get_global_message",
                        "account_name": account_name,
                        "profile_name": profile_name,
                        "email": user_email,
                        "emails": JSON.stringify(emails)
                    }),
                    success: function(response) {
                        // var globalMessageAccountHide = JSON.parse(localStorage.getItem('global_history')) || {};
                        // if(typeof globalMessageAccountHide[account_name] === 'undefined'){
                        //   globalMessageAccountHide[account_name] = '';
                        // }
                        // if(globalMessageAccountHide[account_name] !== response.date_modified){
                        //   globalMessageAccountHide[account_name] = '';
                        // }
                        // localStorage.setItem("global_history", JSON.stringify(globalMessageAccountHide));
                        if (response.success) {
                            var account_message = "";
                            var profile_message = "";
                            if (response.account_message && response.account_message !== "") {
                                account_message = response.account_message;
                            }
                            if (response.profile_message && response.profile_message !== "") {
                                // if(globalMessageAccountHide[account_name] === ''){
                                    profile_message = response.profile_message;
                                // }
                                // unsafeWindow.account_message_date_modified = response.date_modified;
                            }
                            if (account_message !== "" || profile_message !== "" || showAll) {
                                showGlobalMessagePopup(response, showAll);
                                if (!showAll) {
                                    $("#globalMessageButton").css("cursor", "pointer").css("color", "#C71585").addClass("tmui-color").removeClass("hidden");
                                    unsafeWindow.__getGlobalMessageAllow = "true";
                                }
                            } else {
                                $("#globalMessageButton").css("cursor", "default").css("color", "#FFFFFF").removeClass("tmui-color").addClass("hidden");
                                unsafeWindow.__getGlobalMessageAllow = "false";
                            }
                        } else {
                            $("#globalMessageButton").css("cursor", "default").css("color", "#FFFFFF").removeClass("tmui-color").addClass("hidden");
                            unsafeWindow.__getGlobalMessageAllow = "false";
                        }
                    }
                });
            };
            // function hideGlobalMessage(){
            //   var account_name = $('#profile_legend_account').text();
            //   var globalMessageAccountHide = JSON.parse(localStorage.getItem('global_history')) || {};
            //   globalMessageAccountHide[account_name] = unsafeWindow.account_message_date_modified;
            //   localStorage.setItem("global_history", JSON.stringify(globalMessageAccountHide));
            //   $('#account_message_popup').remove();
            // }
            var setGlobalMessage = function() {
                $("#global_popup_update_btn").hide();
                var profile_message = $("#global_popup_text").val();
                var account_name = unsafeWindow.utui.login.account;
                var profile_name = unsafeWindow.utui.login.profile;
                var user_email = unsafeWindow.utui.login.email;
                jQuery.ajax({
                    async: true,
                    url: "https://deploytealium.com/message/globalMessage.php",
                    type: "POST",
                    data: JSON.stringify({
                        "action": "set_global_message",
                        "account_name": account_name,
                        "profile_name": profile_name,
                        "profile_message": profile_message,
                        "email": user_email
                    }),
                    success: function(response) {
                        if (response.success) {
                            var tmp_text = $("#account_message_popup .global_help_text").text();
                            $("#account_message_popup .global_help_text").text("Yay, you successfully updated the global message!").css("color", "green");
                            setTimeout(function() {
                                $("#account_message_popup .global_help_text").text(tmp_text).css("color", "black");
                            }, 3000);
                            $("#global_popup_update_btn").hide();
                        }
                    }
                });
            };
            $('<span id="globalMessageButton" title="Show Global Message">{ ! }</span>')
            .insertBefore("#showHideTMButtons")
            .css("cursor", "pointer")
            .css("left", "190px")
            .css("top", "15px")
            .css("position", "relative")
            .css("color", "#FFFFFF")
            .css("font-weight", "bold")
            .css("font-size", "larger")
            .css("width", "25px")
            .click(function() {
                unsafeWindow.__getGlobalMessageAllow = "true";
                getGlobalMessage();
            });
            console.log("Global Message Loaded");
        } catch (e) {
            console.log("Global Message Failed: " + e);
        }
    }
    /************** Global Message End ***************************/
    /************** AutoSave Start ***************************/
    if ( /*features.autoSave.enabled*/ true) {
        console.log("AutoSave currently turned off. Removing old items");
        for (var a in utui.util.getVars(localStorage)) {
            if (/^autoSave_.*/.test(a)) {
                localStorage.removeItem(a);
            }
        }
    } else {
        try {
            console.log("Auto Save Loading");
            (function() {
                var timeout = localStorage.getItem("autoSave_time") || 60000;
                var profile_loaded = function() {
                    if (localStorage.getItem(getLSName())) {
                        var v = "";
                        v += '<span id="global_status_close_icon" class="global_status_message_close"></span>';
                        v += '<span class="global_status_message_text">Auto Save detected. Would you like to merge?<br><div style="width: 50%;margin: 0 auto;"><a id="autosave_merge" style="text-decoration: underline;">Merge</a><a id="autosave_discard" style="float: right;text-decoration: underline;">Discard</a></div></span>';
                        $("#global_status_message").html(v);
                        $("#global_status_message_parent_div").show();
                        $("#global_status_close_icon").click(function() {
                            $("#global_status_message_parent_div").hide();
                        });
                        $("#autosave_merge").click(run_merge);
                        $("#autosave_discard").click(function() {
                            $("#global_status_message_parent_div").hide();
                            localStorage.removeItem(getLSName());
                        });
                        $("#global_status_message").css("cursor", "pointer");
                    }
                };
                var auto_save = function() {
                    if (utui.historyManager.getNetChanges().length === 0) {
                        return;
                    }
                    //console.log("Auto Save");
                    var toSave = $.extend(true, {}, utui.data); //Have to keep publish history
                    try {
                        localStorage.setItem(getLSName(), JSON.stringify(toSave));
                    } catch (e) {
                        console.log("failed to set LS");
                    }
                };
                utui.util.pubsub.subscribe(utui.constants.profile.LOADED, profile_loaded, this);
                utui.util.pubsub.subscribe(utui.constants.profile.LIBRARY_IMPORT_FINISHED, profile_loaded, this);
                utui.util.pubsub.subscribe(utui.constants.profile.CHANGED, auto_save, this);
                var clearLS = function() {
                    localStorage.removeItem(getLSName());
                };
                utui.util.pubsub.subscribe(utui.constants.profile.PUBLISHED, clearLS, this);
                utui.util.pubsub.subscribe(utui.constants.profile.SAVED, clearLS, this);
                utui.util.pubsub.subscribe(utui.constants.profile.SAVED_AS, clearLS, this);
                var getLSName = function() {
                    return "autoSave_" + utui.login.account + "_" + utui.login.profile;
                };
                setInterval(function() {
                    if (!utui.profile.dirty) {
                        return;
                    }
                    auto_save();
                }, timeout);

                function run_merge() {
                    $("#global_status_message_container").css("cursor", "");
                    $("#global_status_message_parent_div").hide();
                    var _merge = utui.diff.merge;
                    var toSave = JSON.parse(localStorage.getItem(getLSName()));
                    localStorage.removeItem(getLSName());
                    _merge.setLabelsData(utui.data.settings.revision, utui.data.labels);
                    if (toSave.labels && !utag.ut.isEmptyObject(toSave.labels)) {
                        _merge.setLabelsData(toSave.revision, toSave.labels);
                    } else {
                        _merge.setLabelsData(toSave.revision, {});
                    }
                    utui["incoming_data"] = $.extend(true, {}, toSave);
                    var profileKey = utui.data.settings.account + "_" + utui.data.settings.profileid;
                    diffapi.setStash(profileKey, "current", diffapi.runUtuiAnalysis("original_data", "data")); // your changes
                    diffapi.setStash(profileKey, "source", diffapi.runUtuiAnalysis("original_data", "incoming_data")); // incoming changes
                    _merge.onSave();
                }
                profile_loaded();
            }());
console.log("Auto Save Loaded");
} catch (e) {
    console.warn("AutoSave Failed: ", e);
}
}
/************** AutoSave End ***************************/
/************** New Tag Disable Publish To Prod Start ***************************/
if (features.newTagDisableProd.enabled) {
    try {
        console.log("New Tag Disable Publish To Prod Loading");
        var newTagDisableProdListener = function() {
            utui.util.pubsub.subscribe(utui.constants.tags.ADDED, function(e) {
                when(
                     function() {
                        return (jQuery("#manage_config_locations_prod2").length > 0);
                    },
                    function() {
                        if (jQuery("#manage_config_locations_prod2").is(":visible")) {
                            jQuery("#manage_config_locations_prod2").click();
                        }
                    }
                    );
            });
        }
        console.log("New Tag Disable Publish To Prod Loaded");
    } catch (e) {
        console.log("New Tag Disable Publish To Prod Failed: " + e);
    }
}
/************** New Tag Disable Publish To Prod End ***************************/
/************** Extension Search Start ***************************/
if (features.tagSearch.enabled) {
    try {
        console.log("Tag Search Loading");
            localStorage.setItem("tagSearchQuery", ""); //remove storage on login
            function searchTags(string) {
                // console.log('Running a search for "'+string+'"');
                localStorage.setItem("tagSearchQuery", string);
                var re = new RegExp(string, "i");
                var data = utui.data.manage;
                var tags = {};
                if (string !== "") {
                    Object.keys(data).forEach(function(id) {
                        // console.log(data[id]);
                        var tag = data[id];
                        Object.keys(tag).forEach(function(key) {
                            // console.log(key,extension[key]);
                            var tagData = tag[key];
                            // console.log(key);
                            if (key != "_id" && key != "id" && key != "labels" && key != "scope" && key != "hash" && key != "sort" && key != "status" && key != "new_flag" && key != "loadrule" && key != "publish_revisions" && key != "publishedTargets" && key != "selectedTargets" && key != "tag_id" && key != "map" && key != "beforeonload") {
                                if (typeof tagData === "string" && tagData.match(re)) {
                                    tags[tag.sort] = 1;
                                }
                            } else if (key === "map") {
                                Object.keys(tagData).forEach(function(mapping) {
                                    var tagDataMap = tagData[mapping];
                                    Object.keys(tagDataMap).forEach(function(map_key) {
                                        if (map_key != "dsID" && map_key != "type") {
                                            if (typeof tagDataMap[map_key] === "string" && tagDataMap[map_key].match(re)) {
                                                tags[tag.sort] = 1;
                                            }
                                        }
                                    });
                                });
                            }
                        });
                    });
                }
                $("#manage_content .manage_container").each(function(i) {
                    if (tags[i] == 1) {
                        $(this).find("h3").css("background-color", "yellow");
                        $(this).find("h3").css("background-image", "none");
                    } else {
                        $(this).find("h3").css("background-color", "");
                        $(this).find("h3").css("background-image", "");
                    }
                });
            }

            function setupTagSearch() {
                var searchTerm = localStorage.getItem("tagSearchQuery") || "";
                if (!$("#tag_search").length) {
                    $('<div class="inputSearchContainer tmui"><input class="search" id="tag_search" value="' + searchTerm + '" type="text"></div>')
                    .css("float", "right")
                    .appendTo("#tabs-manage .config_button_nofloat");
                    var keysPressed = 0;
                    $("#tag_search").bind("keydown", function() {
                        // console.log('keydown');
                        var grabKeyCount = ++keysPressed;
                        setTimeout(function() {
                            if (keysPressed == grabKeyCount) {
                                searchTags($("#tag_search").val());
                            }
                        }, 250);
                    });
                } else {
                    $("#tag_search").val(searchTerm);
                }
                searchTags($("#tag_search").val());
            }
            console.log("Tag Search Loaded");
        } catch (e) {
            console.log("Tag Search Failed: " + e);
        }
    }
    /************** Tag Search End ***************************/
    /************** Ecomm Button Start ***************************/
    if (features.ecommExtension.enabled) {
        try {
            console.log("Ecomm Ext Loading");
            var ecommMap = {
                corder: "order_id",
                ctotal: "order_total",
                csubtotal: "order_subtotal",
                cship: "order_shipping_amount",
                ctax: "order_tax_amount",
                cstore: "order_store",
                ccurrency: "order_currency_code",
                cpromo: "order_promo_code",
                ctype: "order_type",
                ccustid: "customer_id",
                ccity: "customer_city",
                cstate: "customer_state",
                czip: "customer_postal_code",
                ccountry: "customer_country",
                cprod: "product_id",
                cprodname: "product_name",
                csku: "product_sku",
                cbrand: "product_brand",
                ccat: "product_category",
                ccat2: "product_subcategory",
                cquan: "product_quantity",
                cprice: "product_price",
                cpdisc: "product_discount_amount"
            };

            function ecommExtensionExists() {
                var data = utui.data.customizations;
                var exists = false;
                Object.keys(data).forEach(function(id) {
                    if (data[id].id == "100005") {
                        exists = true;
                    }
                });
                return exists;
            }

            function configureEcommExtension(extId) {
                var ext = {
                    title: "E-Commerce"
                };
                exapi.addExtension(extId, "100005", ext);
                utui.customizations.addItem(extId);
                utui.customizations.drawJUIAccordion(extId);
                utui.labels.helper.renderLabels(extId, utui.customizations.id);
                $("#customize_content").animate({
                    scrollTop: $("#customizations_" + extId).offset().top - $("#customize_content").offset().top + $("#customize_content").scrollTop()
                }, "slow");
                for (var k in ecommMap) {
                    var opt = $("#" + k + " option[value='js." + ecommMap[k] + "']");
                    if (opt.length > 0) {
                        opt.attr("selected", "selected");
                        $("#s2id_" + k + " > a").removeClass("select2-default");
                        $("#s2id_" + k + " span.select2-chosen").text(opt.text());
                    }
                }
            }

            function addEcommExtension() {
                if (!ecommExtensionExists()) {
                    exapi.getNextIdFromServer(1, null,
                        // onSuccess
                        function(providedLastId, count, extId) {
                            configureEcommExtension(extId);
                            $("#customize_addEcommBtn").remove();
                        },
                        // onFailure
                        function(extId) {
                            configureEcommExtension(extId);
                            $("#customize_addEcommBtn").remove();
                        });
                }
            }

            function createEcommExtensionButton() {
                if (!$("#customize_addEcommBtn").length) {
                    if (!ecommExtensionExists()) {
                        $('<span id="customize_addEcommBtn" class="btn tmui"><i class="icon-wrench"></i> Add E-Commerce Extension</span>')
                        .css("float", "left")
                        .css("margin-left", "10px")
                        .click(addEcommExtension)
                        .appendTo("#tabs-customizations .config_button_nofloat");
                    }
                }
            }
            console.log("Ecomm Ext Loaded");
        } catch (e) {
            console.log("Ecomm Ext Failed: " + e);
        }
    }
    /************** Ecomm Button End ***************************/
    /************** Sitecat Mapping start ***************************/
    if (features.sitecatMappingSort.enabled) {
        try {
            console.log("Sitecat Sort Loading");

            function moveSitecatMappings(unordered, type) {
                // var clean = {};
                var ordered = [];
                var keys = [];
                keys = Object.keys(unordered);
                keys.sort(alphaNumSort).reverse();
                keys.forEach(function(key) {
                    ordered.push(unordered[key]);
                });
                for (var i = 0; i < ordered.length; i++) {
                    $(ordered[i]).prependTo("#wizard_variables_wrapper ul.variable_map_container");
                }
            }

            function prepareSitecatMappings() {
                var props = {};
                var evars = {};
                var events = {};
                var prods = {}; //product level evars and events
                var others = {};
                $("li.managemap_div").each(function() {
                    //we are going to sort on the first mapped variable
                    var type = $(this).find(".js-variable-input").attr("value").split(",")[0];
                    if (type.indexOf("prop") > -1) {
                        props[type] = this;
                    } else if (type.indexOf("PRODUCTS_") > -1) {
                        prods[type] = this;
                    } else if (type.indexOf("eVar") > -1) {
                        evars[type] = this;
                    } else if (type.indexOf(":") > -1) {
                        events[type] = this;
                    } else {
                        others[type] = this;
                    }
                });
                events = moveSitecatMappings(events, "events");
                prods = moveSitecatMappings(prods, "prods");
                evars = moveSitecatMappings(evars, "evars");
                props = moveSitecatMappings(props, "props");
                others = moveSitecatMappings(others, "others");
            }

            function createSitecatMappingSortButton() {
                //When the user opens the tag template wizard
                $(document).on("click", "span.actionMapping", function(e) {
                    //let's wait a tiny bit so that we don't have a race condition for adding the mappingsBulkRow div. This could be added by the import/export tag mappings feature
                    window.setTimeout(function() {
                        if ($("div.ui-dialog[aria-labelledby='ui-dialog-title-manage_dialog_wizard'] .ui-dialog-title:contains('SiteCat'), div.ui-dialog[aria-labelledby='ui-dialog-title-manage_dialog_wizard'] .ui-dialog-title:contains('AppMeasurement')").length) {
                            //first add the row if not there
                            if (!$("#mappingsBulkRow").length) {
                                $('<tr id="mappingsBulkRow" class="tmui"><td></td></tr>')
                                .appendTo("#wizard_variables_wrapper tbody");
                            }
                            //add the sort button
                            if (!$("#sitecatSort").length) {
                                $('<span id="sitecatSort" class="btn btn-small i-color-add"><i class="icon-sort"></i> Sort Mappings</span>')
                                .css("margin-left", "10px")
                                .appendTo("#mappingsBulkRow td")
                                .click(prepareSitecatMappings);
                            }
                        }
                    }, 250);
                });
            }
            console.log("Sitecat Sort Loaded");
        } catch (e) {
            console.log("Sitecat Sort Failed: " + e);
        }
    }
    /************** Sitecat mapping End ***************************/
    /************** Bulk Load Rules Start ***************************/
    if (features.bulkLoadRules.enabled) {
        try {
            var bulk_load_rules_import = function() {
                console.log("Bulk Load Rules Loading");
                var bulk_add_link = $('<div class="tab-menu-item tmui" style="float:right;"><span id="loadrules_button_import" class="btn btn-success" style="margin-top:0;"><i class="icon-plus"></i><span> Bulk Import</span></span></div>');
                var import_container = $('<div id="load_rules_container" class="ui-dialog ui-widget ui-widget-content ui-corner-all" tabindex="-1" role="dialog" aria-labelledby="ui-dialog-title-admin_dialog" style="display: none; z-index: 1002; outline: 0px; height: 400px; width: 500px; top: 92px; left: 475px;"><div class="ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix"><span class="ui-dialog-title">Bulk Add Load Rules</span><a href="#" class="ui-dialog-titlebar-close ui-corner-all" role="button"><span class="ui-icon ui-icon-closethick load_rules_btn"></span></a></div><div style="width: auto; height: auto;" class="ui-dialog-content ui-widget-content" scrolltop="0" scrollleft="0"><textarea id="csv_load_rules" cols="11" rows="25" style="margin-left:auto;display: block;margin-right: auto;margin-top: auto;margin-bottom: auto;"></textarea></div><div class="ui-dialog-buttonpane ui-widget-content ui-helper-clearfix"><div class="ui-dialog-buttonset"><button type="button" id="add_load_rules" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" role="button" aria-disabled="false" original-title="Click to import the load rules." title="Click to import the load rules."><span class="ui-button-text">Import</span></button><button type="button" style="float:left; margin-left: 12px" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" role="button" aria-disabled="false"><span class="ui-button-text load_rules_btn">Close</span></button></div></div></div>');
                $("#loadrulesContainer_headerControls").append(bulk_add_link);
                $("#tabs").append(import_container);
                $(".load_rules_btn").click(function() {
                    $("#csv_load_rules").val("");
                    $("#load_rules_container").hide();
                });
                $("#loadrules_button_import").click(function() {
                    $("#csv_load_rules").val("");
                    $("#load_rules_container").toggle();
                });
                $("#add_load_rules").click(function() {
                    var rules = $("#csv_load_rules").val();
                    if (rules) {
                        rules_rows = rules.split("\n");
                        for (row in rules_rows) {
                            if (rules_rows[row]) {
                                row_values = rules_rows[row].split(",");
                                udo_var = "js." + row_values[0].replace(/"|'/g, "");
                                operator = row_values[1].replace(/"|'/g, "").toLowerCase();
                                value_to_match = row_values[2].replace(/"|'/g, "");
                                title = "";
                                for (w in value_to_match.split("_")) {
                                    x = value_to_match.split("_")[w];
                                    x = x.charAt(0).toUpperCase() + x.slice(1);
                                    title += x + " ";
                                }
                                title = title + udo_var.split(".")[1].split("_")[0].charAt(0).toUpperCase() + udo_var.split(".")[1].split("_")[0].slice(1);
                                lr = {
                                    "0": {
                                        "input_0": udo_var,
                                        "operator_0": operator,
                                        "filter_0": value_to_match
                                    },
                                    "title": title,
                                    "status": "active",
                                    "startDate": "------------",
                                    "endDate": "------------",
                                    "editable": "true"
                                };
                                $("#csv_load_rules").val("");
                                utui.automator.addLoadrule(lr);
                                console.log("Added a load rule.");
                            }
                        }
                        $("#load_rules_container").toggle();
                    } else {
                        alert("Field cannot be blank!");
                    }
                });
                console.log("Bulk Load Rules Loaded");
            };
            bulk_load_rules_import();
        } catch (e) {
            console.log("Bulk Load Rules Failed: " + e);
        }
    }
    /************** Bulk Load Rules End ***************************/
    /************** Add Enlarge Ids Start ***************************/
    if (features.enlargeIds.enabled) {
        try {
            console.log("Add Enlarge Ids Loading");

            function enlargeIds() {
                var tid_len = 3,
                tid_len_this = 0;
                jQuery("#manage_content").find(".container_uid .uidValue").each(function() {
                    tid_len_this = jQuery(this).text().length;
                    if (tid_len_this > tid_len) {
                        tid_len = tid_len_this;
                    }
                });
                jQuery("#manage_content").find(".container_uid").css("width", ((tid_len * 9) + 5) + "px");
            }
            console.log("Add Enlarge Ids Loaded");
        } catch (e) {
            console.log("Add Enlarge Ids Failed: " + e);
        }
    }
    /************** Add Enlarge Ids End ***************************/
    /************** Add Condition Check Start ***************************/
    if (features.conditionCheck.enabled) {
        try {
            console.log("Add Conditon Check Loading");
            // called multiple times so store state in global variable
            var conditions_errors = {};
            var safe_variables = {};
            var checkConditions = function(e, context) {
                var $thisButton = jQuery(context);
                // console.log('CHRISTINA LOG: context: '+$thisButton.toString());
                var dropChoice1 = $thisButton.find("select.variableSelect").val();
                // console.log('CHRISTINA LOG: dropChoice1: '+dropChoice1);
                var dropChoice2 = $thisButton.find("select.loadrule_operatorselect").val();
                // console.log('CHRISTINA LOG: dropChoice2: '+dropChoice2);
                // create condition obj
                var condition_check = {
                    "contains_ignore_case": 1,
                    "contains": 1,
                    "does_not_contain_ignore_case": 1,
                    "does_not_end_with_ignore_case": 1,
                    "does_not_start_with_ignore_case": 1,
                    "equals_ignore_case": 1,
                    "starts_with_ignore_case": 1,
                    "less_than": 1,
                    "less_than_equal_to": 1,
                    "greater_than": 1,
                    "greater_than_equal_to": 1
                };
                if (dropChoice1 && dropChoice1.indexOf("dom.") < 0) {
                    // console.log('CHRISTINA LOG: dropChoices do not contain "dom."');
                    if (dropChoice2 == "defined" || dropChoice2 == "populated") { //confirm values
                        //console.log('CHRISTINA LOG: safe_variables: '+dropChoice1);
                        safe_variables[dropChoice1] = 1;
                    } else if (condition_check[dropChoice2] && !safe_variables[dropChoice1]) {
                        //console.log('CHRISTINA LOG: found an error in conditions: '+ dropChoice2);
                        // push dropChoice1 into array
                        conditions_errors[dropChoice1] = 1;
                        //draw a message to signify this line is the problem
                        $thisButton.find(".select2-chosen").attr("style", "color:#cd0a0a;");
                        // console.log('CHRISTINA LOG: conditions_errors: '+JSON.stringify(conditions_errors));
                    }
                }
            };
            var createErrorMsg = function(e, context) {
                //First delete the error div
                jQuery("#loadrules_dialog_error").remove();
                // console.log('CHRISTINA LOG: createErrorMsg called');
                jQuery('<div id="loadrules_dialog_error" class="ui-state-error ui-corner-all padded"><ul id="errorList" style="list-style-type: none;"></ul></div>').insertBefore("#loadrules_dialog_addmore");
                var $thisButton = jQuery(context);
                if (Object.keys(conditions_errors).length) {
                    // console.log('CHRISTINA LOG: found a problem in the conditions');
                    if ($thisButton.attr("id") === "loadrules_dialog_addmore_applyBtn") {
                        // console.log('CHRISTINA LOG: preventDefault');
                        e.preventDefault();
                        // hide apply button
                        // console.log('CHRISTINA LOG: hide apply button');
                        $thisButton.hide();
                        // turn off mousedown
                        // jQuery(document.body).off('mousedown', $thisButton.attr('id'));
                        // console.log('CHRISTINA LOG: turned off mousedown on apply button');
                        // display check again and proceed anyway buttons
                        jQuery('<button type="button" id="loadrules_dialog_addmore_proceedAnyway" class="nav-btn ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" role="button" aria-disabled="false"><span class="ui-button-text">Proceed Anyway</span></button><button type="button" id="loadrules_dialog_addmore_checkAgain" class="nav-btn ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" role="button" aria-disabled="false"><span class="ui-button-text">Check Again</span></button>').insertAfter("#loadrules_dialog_addmore_applyBtn");
                        // console.log('CHRISTINA LOG: added proceed anyway and check again buttons');
                        // add click handler to proceed anyway button - clicks on hidden apply button
                        jQuery(document.body).on("mousedown", "#loadrules_dialog_addmore_proceedAnyway", function() {
                            // console.log('CHRISTINA LOG: adding apply button click to proceed anyway button');
                            $thisButton.click();
                        });
                    }
                    if (Object.keys(conditions_errors).length >= 1) {
                        // console.log('CHRISTINA LOG: conditions_errors.length: '+Object.keys(conditions_errors).length+ ', so we are displaying error div');
                        jQuery("#loadrules_dialog_error").attr("style", "display: block;");
                    } else {
                        jQuery("#loadrules_dialog_error").attr("style", "display: none;");
                    }
                    // --- create div then add each message to it example below, but keep appending errors
                    // create for loop to loop over conditions_errors array change dc1 to condition_errors[i]
                    Object.keys(conditions_errors).forEach(function(key) {
                        jQuery("<li>Please add a select option to check if " + key + " is defined</li>").appendTo("#errorList");
                        // console.log('CHRISTINA LOG: added an error <li> for the current error');
                    });
                } else if ($thisButton.attr("id") != "loadrules_dialog_addmore_applyBtn") {
                    jQuery("#loadrules_dialog_error").attr("style", "display: block;border:1px solid #319b4a;background: #effff3 url(images/ui-bg_glass_95_fef1ec_1x400.png) 50% 50% repeat-x;color:#319b4a;");
                    //Display everything is good and remove the check again button and proceed anyway button
                    jQuery("<li>Everything looks great! Click Apply to finish.</li>").appendTo("#errorList");
                    // console.log('CHRISTINA LOG: add "everything is good" <li>');
                    //Get rid of old buttons
                    jQuery("#loadrules_dialog_addmore_proceedAnyway,#loadrules_dialog_addmore_checkAgain").remove();
                    // Re display apply button
                    jQuery("#loadrules_dialog_addmore_applyBtn").show();
                    // jQuery(document.body).on('mousedown', '#loadrules_dialog_addmore_applyBtn', function() {
                    //  this.click();
                    // });
                    // console.log('CHRISTINA LOG: show the apply more button');
                } else {
                    // console.log('CHRISTINA LOG: apply button clicked and there were no errors.');
                }
            };
            jQuery(document.body).on("mousedown", "#loadrules_dialog_addmore_applyBtn, #loadrules_dialog_addmore_checkAgain", function(e) {
                var $thisButtonId = jQuery(this).attr("id");
                // console.log('CHRISTINA LOG: '+$thisButtonId+' clicked');
                // If the checkAgain was clicked, we will clear out the previous check objects and clear the error to start over
                if ($thisButtonId === "loadrules_dialog_addmore_checkAgain") {
                    safe_variables = {};
                    condition_errors = {};
                    jQuery("#loadrules_dialog_error").remove();
                    jQuery(".select2-chosen").css("color", "black");
                }
                iterateOverCondtions(e, this);
            });

            function iterateOverCondtions(e, context) {
                // call condition checking button
                conditions_errors = {};
                jQuery("#loadrules_dialog_addmore_pane>div").each(function() {
                    // capture jQuery element
                    var $this = jQuery(this);
                    if ($this.attr("id").indexOf("_pane_or_clause_div") > -1) {
                        //Found OR statement
                        safe_variables = {};
                        // console.log('CHRISTINA LOG: cleared safe_variables object because this is a new OR statement');
                        return true;
                    }
                    $this.find('div[style="position:relative; clear:both;"]').each(function() {
                        checkConditions(e, this);
                    });
                });
                createErrorMsg(e, context);
            }
            jQuery(document.body).on("mousedown", "[id*=_editLoadRule], #loadrules_button_addmore", function() {
                jQuery("#loadrules_dialog_error").remove();
            });
            console.log("Add Condition Check Loaded");
        } catch (e) {
            console.log("Add Condition Check Failed: " + e);
        }
    }
    /************** Add Condition Check End ***************************/
    /************** Add Bulk Add DataSources Start ***************************/
    if (features.addBulkDataSources.enabled) {
        try {
            console.log("Add Bulk Add DataSources Loading");
            var check_for_errors = function() {
                when(
                     function() {
                        if (jQuery("#datasource_add_dialog").is(":visible") === true) {
                            return true;
                        } else {
                            return false;
                        }
                    },
                    function() {
                        jQuery("#datasource_add_dialog_replaceVars").parent().hide();
                    }
                    );
                when(
                     function() {
                        if (jQuery("#datasource_add_dialog").is(":visible") === false || jQuery("#datasource_add_dialog_bulkVarListErrs li").is(":visible") === true) {
                            return true;
                        } else {
                            return false;
                        }
                    },
                    function() {
                        if (jQuery("#datasource_add_dialog").is(":visible") === true) {
                            var a = {};
                            a.errors = {};
                            a.new = [];
                            jQuery("#datasource_add_dialog_bulkVarListErrs li").each(function() {
                                a.tmp = jQuery(this).text().replace(/^Line /, "").replace(/\: Variable.+?defined$/, "");
                                if (!isNaN(parseInt(a.tmp))) {
                                    a.tmp = a.tmp - 1;
                                    a["errors"][a.tmp] = 1;
                                }
                            });
                            a.current = jQuery("#datasource_add_dialog_bulkVarList").val().split("\n");
                            for (var i = 0; i < a.current.length; i++) {
                                if (typeof a.errors[i] === "undefined") {
                                    a.new.push(a.current[i]);
                                }
                            }
                            jQuery("#datasource_add_dialog_bulkVarList").val(a.new.join("\n"));
                            jQuery("#datasource_add_dialog_bulkVarListErrs").html("The Tampermonkey automation removed all the duplicate variables. Confirm and click Apply again");
                            jQuery("#datasource_add_dialogSaveBtn").mousedown(function() {
                                check_for_errors();
                            });
                        }
                    }
                    );
            };
            jQuery("#dataSources_addBulkDataSourceBtn").click(function() {
                check_for_errors();
            });
            console.log("Add Bulk Add DataSources Loaded");
        } catch (e) {
            console.log("Add Bulk Add DataSources Failed: " + e);
        }
    }
    /************** Add Bulk Add DataSources End ***************************/
    /************** Update TiQ Title Start ***************************/
    if (features.updateTitle.enabled) {
        try {
            console.log("Update TiQ Title Loading");

            function updateTiQTitle() {
                if (utui.data.settings.account) {
                    document.title = "TiQ - " + utui.data.settings.account;
                }
            }
            console.log("Update TiQ Title Loaded");
        } catch (e) {
            console.log("Update TiQ Title Failed: " + e);
        }
    }
    /************** Add Enlarge Ids End ***************************/
    /************** Add Condition Check Start ***************************/
    if (features.fixConditions.enabled) {
        (function(){require=function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}({lodash:[function(require,module,exports){(function(global){(function(){var undefined;var VERSION="4.17.4";var LARGE_ARRAY_SIZE=200;var CORE_ERROR_TEXT="Unsupported core-js use. Try https://npms.io/search?q=ponyfill.",FUNC_ERROR_TEXT="Expected a function";var HASH_UNDEFINED="__lodash_hash_undefined__";var MAX_MEMOIZE_SIZE=500;var PLACEHOLDER="__lodash_placeholder__";var CLONE_DEEP_FLAG=1,CLONE_FLAT_FLAG=2,CLONE_SYMBOLS_FLAG=4;var COMPARE_PARTIAL_FLAG=1,COMPARE_UNORDERED_FLAG=2;var WRAP_BIND_FLAG=1,WRAP_BIND_KEY_FLAG=2,WRAP_CURRY_BOUND_FLAG=4,WRAP_CURRY_FLAG=8,WRAP_CURRY_RIGHT_FLAG=16,WRAP_PARTIAL_FLAG=32,WRAP_PARTIAL_RIGHT_FLAG=64,WRAP_ARY_FLAG=128,WRAP_REARG_FLAG=256,WRAP_FLIP_FLAG=512;var DEFAULT_TRUNC_LENGTH=30,DEFAULT_TRUNC_OMISSION="...";var HOT_COUNT=800,HOT_SPAN=16;var LAZY_FILTER_FLAG=1,LAZY_MAP_FLAG=2,LAZY_WHILE_FLAG=3;var INFINITY=1/0,MAX_SAFE_INTEGER=9007199254740991,MAX_INTEGER=1.7976931348623157e308,NAN=0/0;var MAX_ARRAY_LENGTH=4294967295,MAX_ARRAY_INDEX=MAX_ARRAY_LENGTH-1,HALF_MAX_ARRAY_LENGTH=MAX_ARRAY_LENGTH>>>1;var wrapFlags=[["ary",WRAP_ARY_FLAG],["bind",WRAP_BIND_FLAG],["bindKey",WRAP_BIND_KEY_FLAG],["curry",WRAP_CURRY_FLAG],["curryRight",WRAP_CURRY_RIGHT_FLAG],["flip",WRAP_FLIP_FLAG],["partial",WRAP_PARTIAL_FLAG],["partialRight",WRAP_PARTIAL_RIGHT_FLAG],["rearg",WRAP_REARG_FLAG]];var argsTag="[object Arguments]",arrayTag="[object Array]",asyncTag="[object AsyncFunction]",boolTag="[object Boolean]",dateTag="[object Date]",domExcTag="[object DOMException]",errorTag="[object Error]",funcTag="[object Function]",genTag="[object GeneratorFunction]",mapTag="[object Map]",numberTag="[object Number]",nullTag="[object Null]",objectTag="[object Object]",promiseTag="[object Promise]",proxyTag="[object Proxy]",regexpTag="[object RegExp]",setTag="[object Set]",stringTag="[object String]",symbolTag="[object Symbol]",undefinedTag="[object Undefined]",weakMapTag="[object WeakMap]",weakSetTag="[object WeakSet]";var arrayBufferTag="[object ArrayBuffer]",dataViewTag="[object DataView]",float32Tag="[object Float32Array]",float64Tag="[object Float64Array]",int8Tag="[object Int8Array]",int16Tag="[object Int16Array]",int32Tag="[object Int32Array]",uint8Tag="[object Uint8Array]",uint8ClampedTag="[object Uint8ClampedArray]",uint16Tag="[object Uint16Array]",uint32Tag="[object Uint32Array]";var reEmptyStringLeading=/\b__p \+= '';/g,reEmptyStringMiddle=/\b(__p \+=) '' \+/g,reEmptyStringTrailing=/(__e\(.*?\)|\b__t\)) \+\n'';/g;var reEscapedHtml=/&(?:amp|lt|gt|quot|#39);/g,reUnescapedHtml=/[&<>"']/g,reHasEscapedHtml=RegExp(reEscapedHtml.source),reHasUnescapedHtml=RegExp(reUnescapedHtml.source);var reEscape=/<%-([\s\S]+?)%>/g,reEvaluate=/<%([\s\S]+?)%>/g,reInterpolate=/<%=([\s\S]+?)%>/g;var reIsDeepProp=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,reIsPlainProp=/^\w*$/,reLeadingDot=/^\./,rePropName=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;var reRegExpChar=/[\\^$.*+?()[\]{}|]/g,reHasRegExpChar=RegExp(reRegExpChar.source);var reTrim=/^\s+|\s+$/g,reTrimStart=/^\s+/,reTrimEnd=/\s+$/;var reWrapComment=/\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/,reWrapDetails=/\{\n\/\* \[wrapped with (.+)\] \*/,reSplitDetails=/,? & /;var reAsciiWord=/[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;var reEscapeChar=/\\(\\)?/g;var reEsTemplate=/\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;var reFlags=/\w*$/;var reIsBadHex=/^[-+]0x[0-9a-f]+$/i;var reIsBinary=/^0b[01]+$/i;var reIsHostCtor=/^\[object .+?Constructor\]$/;var reIsOctal=/^0o[0-7]+$/i;var reIsUint=/^(?:0|[1-9]\d*)$/;var reLatin=/[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;var reNoMatch=/($^)/;var reUnescapedString=/['\n\r\u2028\u2029\\]/g;var rsAstralRange="\\ud800-\\udfff",rsComboMarksRange="\\u0300-\\u036f",reComboHalfMarksRange="\\ufe20-\\ufe2f",rsComboSymbolsRange="\\u20d0-\\u20ff",rsComboRange=rsComboMarksRange+reComboHalfMarksRange+rsComboSymbolsRange,rsDingbatRange="\\u2700-\\u27bf",rsLowerRange="a-z\\xdf-\\xf6\\xf8-\\xff",rsMathOpRange="\\xac\\xb1\\xd7\\xf7",rsNonCharRange="\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf",rsPunctuationRange="\\u2000-\\u206f",rsSpaceRange=" \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000",rsUpperRange="A-Z\\xc0-\\xd6\\xd8-\\xde",rsVarRange="\\ufe0e\\ufe0f",rsBreakRange=rsMathOpRange+rsNonCharRange+rsPunctuationRange+rsSpaceRange;var rsApos="['’]",rsAstral="["+rsAstralRange+"]",rsBreak="["+rsBreakRange+"]",rsCombo="["+rsComboRange+"]",rsDigits="\\d+",rsDingbat="["+rsDingbatRange+"]",rsLower="["+rsLowerRange+"]",rsMisc="[^"+rsAstralRange+rsBreakRange+rsDigits+rsDingbatRange+rsLowerRange+rsUpperRange+"]",rsFitz="\\ud83c[\\udffb-\\udfff]",rsModifier="(?:"+rsCombo+"|"+rsFitz+")",rsNonAstral="[^"+rsAstralRange+"]",rsRegional="(?:\\ud83c[\\udde6-\\uddff]){2}",rsSurrPair="[\\ud800-\\udbff][\\udc00-\\udfff]",rsUpper="["+rsUpperRange+"]",rsZWJ="\\u200d";var rsMiscLower="(?:"+rsLower+"|"+rsMisc+")",rsMiscUpper="(?:"+rsUpper+"|"+rsMisc+")",rsOptContrLower="(?:"+rsApos+"(?:d|ll|m|re|s|t|ve))?",rsOptContrUpper="(?:"+rsApos+"(?:D|LL|M|RE|S|T|VE))?",reOptMod=rsModifier+"?",rsOptVar="["+rsVarRange+"]?",rsOptJoin="(?:"+rsZWJ+"(?:"+[rsNonAstral,rsRegional,rsSurrPair].join("|")+")"+rsOptVar+reOptMod+")*",rsOrdLower="\\d*(?:(?:1st|2nd|3rd|(?![123])\\dth)\\b)",rsOrdUpper="\\d*(?:(?:1ST|2ND|3RD|(?![123])\\dTH)\\b)",rsSeq=rsOptVar+reOptMod+rsOptJoin,rsEmoji="(?:"+[rsDingbat,rsRegional,rsSurrPair].join("|")+")"+rsSeq,rsSymbol="(?:"+[rsNonAstral+rsCombo+"?",rsCombo,rsRegional,rsSurrPair,rsAstral].join("|")+")";var reApos=RegExp(rsApos,"g");var reComboMark=RegExp(rsCombo,"g");var reUnicode=RegExp(rsFitz+"(?="+rsFitz+")|"+rsSymbol+rsSeq,"g");var reUnicodeWord=RegExp([rsUpper+"?"+rsLower+"+"+rsOptContrLower+"(?="+[rsBreak,rsUpper,"$"].join("|")+")",rsMiscUpper+"+"+rsOptContrUpper+"(?="+[rsBreak,rsUpper+rsMiscLower,"$"].join("|")+")",rsUpper+"?"+rsMiscLower+"+"+rsOptContrLower,rsUpper+"+"+rsOptContrUpper,rsOrdUpper,rsOrdLower,rsDigits,rsEmoji].join("|"),"g");var reHasUnicode=RegExp("["+rsZWJ+rsAstralRange+rsComboRange+rsVarRange+"]");var reHasUnicodeWord=/[a-z][A-Z]|[A-Z]{2,}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;var contextProps=["Array","Buffer","DataView","Date","Error","Float32Array","Float64Array","Function","Int8Array","Int16Array","Int32Array","Map","Math","Object","Promise","RegExp","Set","String","Symbol","TypeError","Uint8Array","Uint8ClampedArray","Uint16Array","Uint32Array","WeakMap","_","clearTimeout","isFinite","parseInt","setTimeout"];var templateCounter=-1;var typedArrayTags={};typedArrayTags[float32Tag]=typedArrayTags[float64Tag]=typedArrayTags[int8Tag]=typedArrayTags[int16Tag]=typedArrayTags[int32Tag]=typedArrayTags[uint8Tag]=typedArrayTags[uint8ClampedTag]=typedArrayTags[uint16Tag]=typedArrayTags[uint32Tag]=true;typedArrayTags[argsTag]=typedArrayTags[arrayTag]=typedArrayTags[arrayBufferTag]=typedArrayTags[boolTag]=typedArrayTags[dataViewTag]=typedArrayTags[dateTag]=typedArrayTags[errorTag]=typedArrayTags[funcTag]=typedArrayTags[mapTag]=typedArrayTags[numberTag]=typedArrayTags[objectTag]=typedArrayTags[regexpTag]=typedArrayTags[setTag]=typedArrayTags[stringTag]=typedArrayTags[weakMapTag]=false;var cloneableTags={};cloneableTags[argsTag]=cloneableTags[arrayTag]=cloneableTags[arrayBufferTag]=cloneableTags[dataViewTag]=cloneableTags[boolTag]=cloneableTags[dateTag]=cloneableTags[float32Tag]=cloneableTags[float64Tag]=cloneableTags[int8Tag]=cloneableTags[int16Tag]=cloneableTags[int32Tag]=cloneableTags[mapTag]=cloneableTags[numberTag]=cloneableTags[objectTag]=cloneableTags[regexpTag]=cloneableTags[setTag]=cloneableTags[stringTag]=cloneableTags[symbolTag]=cloneableTags[uint8Tag]=cloneableTags[uint8ClampedTag]=cloneableTags[uint16Tag]=cloneableTags[uint32Tag]=true;cloneableTags[errorTag]=cloneableTags[funcTag]=cloneableTags[weakMapTag]=false;var deburredLetters={"À":"A","Á":"A","Â":"A","Ã":"A","Ä":"A","Å":"A","à":"a","á":"a","â":"a","ã":"a","ä":"a","å":"a","Ç":"C","ç":"c","Ð":"D","ð":"d","È":"E","É":"E","Ê":"E","Ë":"E","è":"e","é":"e","ê":"e","ë":"e","Ì":"I","Í":"I","Î":"I","Ï":"I","ì":"i","í":"i","î":"i","ï":"i","Ñ":"N","ñ":"n","Ò":"O","Ó":"O","Ô":"O","Õ":"O","Ö":"O","Ø":"O","ò":"o","ó":"o","ô":"o","õ":"o","ö":"o","ø":"o","Ù":"U","Ú":"U","Û":"U","Ü":"U","ù":"u","ú":"u","û":"u","ü":"u","Ý":"Y","ý":"y","ÿ":"y","Æ":"Ae","æ":"ae","Þ":"Th","þ":"th","ß":"ss","Ā":"A","Ă":"A","Ą":"A","ā":"a","ă":"a","ą":"a","Ć":"C","Ĉ":"C","Ċ":"C","Č":"C","ć":"c","ĉ":"c","ċ":"c","č":"c","Ď":"D","Đ":"D","ď":"d","đ":"d","Ē":"E","Ĕ":"E","Ė":"E","Ę":"E","Ě":"E","ē":"e","ĕ":"e","ė":"e","ę":"e","ě":"e","Ĝ":"G","Ğ":"G","Ġ":"G","Ģ":"G","ĝ":"g","ğ":"g","ġ":"g","ģ":"g","Ĥ":"H","Ħ":"H","ĥ":"h","ħ":"h","Ĩ":"I","Ī":"I","Ĭ":"I","Į":"I","İ":"I","ĩ":"i","ī":"i","ĭ":"i","į":"i","ı":"i","Ĵ":"J","ĵ":"j","Ķ":"K","ķ":"k","ĸ":"k","Ĺ":"L","Ļ":"L","Ľ":"L","Ŀ":"L","Ł":"L","ĺ":"l","ļ":"l","ľ":"l","ŀ":"l","ł":"l","Ń":"N","Ņ":"N","Ň":"N","Ŋ":"N","ń":"n","ņ":"n","ň":"n","ŋ":"n","Ō":"O","Ŏ":"O","Ő":"O","ō":"o","ŏ":"o","ő":"o","Ŕ":"R","Ŗ":"R","Ř":"R","ŕ":"r","ŗ":"r","ř":"r","Ś":"S","Ŝ":"S","Ş":"S","Š":"S","ś":"s","ŝ":"s","ş":"s","š":"s","Ţ":"T","Ť":"T","Ŧ":"T","ţ":"t","ť":"t","ŧ":"t","Ũ":"U","Ū":"U","Ŭ":"U","Ů":"U","Ű":"U","Ų":"U","ũ":"u","ū":"u","ŭ":"u","ů":"u","ű":"u","ų":"u","Ŵ":"W","ŵ":"w","Ŷ":"Y","ŷ":"y","Ÿ":"Y","Ź":"Z","Ż":"Z","Ž":"Z","ź":"z","ż":"z","ž":"z","Ĳ":"IJ","ĳ":"ij","Œ":"Oe","œ":"oe","ŉ":"'n","ſ":"s"};var htmlEscapes={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};var htmlUnescapes={"&amp;":"&","&lt;":"<","&gt;":">","&quot;":'"',"&#39;":"'"};var stringEscapes={"\\":"\\","'":"'","\n":"n","\r":"r","\u2028":"u2028","\u2029":"u2029"};var freeParseFloat=parseFloat,freeParseInt=parseInt;var freeGlobal=typeof global=="object"&&global&&global.Object===Object&&global;var freeSelf=typeof self=="object"&&self&&self.Object===Object&&self;var root=freeGlobal||freeSelf||Function("return this")();var freeExports=typeof exports=="object"&&exports&&!exports.nodeType&&exports;var freeModule=freeExports&&typeof module=="object"&&module&&!module.nodeType&&module;var moduleExports=freeModule&&freeModule.exports===freeExports;var freeProcess=moduleExports&&freeGlobal.process;var nodeUtil=function(){try{return freeProcess&&freeProcess.binding&&freeProcess.binding("util")}catch(e){}}();var nodeIsArrayBuffer=nodeUtil&&nodeUtil.isArrayBuffer,nodeIsDate=nodeUtil&&nodeUtil.isDate,nodeIsMap=nodeUtil&&nodeUtil.isMap,nodeIsRegExp=nodeUtil&&nodeUtil.isRegExp,nodeIsSet=nodeUtil&&nodeUtil.isSet,nodeIsTypedArray=nodeUtil&&nodeUtil.isTypedArray;function addMapEntry(map,pair){map.set(pair[0],pair[1]);return map}function addSetEntry(set,value){set.add(value);return set}function apply(func,thisArg,args){switch(args.length){case 0:return func.call(thisArg);case 1:return func.call(thisArg,args[0]);case 2:return func.call(thisArg,args[0],args[1]);case 3:return func.call(thisArg,args[0],args[1],args[2])}return func.apply(thisArg,args)}function arrayAggregator(array,setter,iteratee,accumulator){var index=-1,length=array==null?0:array.length;while(++index<length){var value=array[index];setter(accumulator,value,iteratee(value),array)}return accumulator}function arrayEach(array,iteratee){var index=-1,length=array==null?0:array.length;while(++index<length){if(iteratee(array[index],index,array)===false){break}}return array}function arrayEachRight(array,iteratee){var length=array==null?0:array.length;while(length--){if(iteratee(array[length],length,array)===false){break}}return array}function arrayEvery(array,predicate){var index=-1,length=array==null?0:array.length;while(++index<length){if(!predicate(array[index],index,array)){return false}}return true}function arrayFilter(array,predicate){var index=-1,length=array==null?0:array.length,resIndex=0,result=[];while(++index<length){var value=array[index];if(predicate(value,index,array)){result[resIndex++]=value}}return result}function arrayIncludes(array,value){var length=array==null?0:array.length;return!!length&&baseIndexOf(array,value,0)>-1}function arrayIncludesWith(array,value,comparator){var index=-1,length=array==null?0:array.length;while(++index<length){if(comparator(value,array[index])){return true}}return false}function arrayMap(array,iteratee){var index=-1,length=array==null?0:array.length,result=Array(length);while(++index<length){result[index]=iteratee(array[index],index,array)}return result}function arrayPush(array,values){var index=-1,length=values.length,offset=array.length;while(++index<length){array[offset+index]=values[index]}return array}function arrayReduce(array,iteratee,accumulator,initAccum){var index=-1,length=array==null?0:array.length;if(initAccum&&length){accumulator=array[++index]}while(++index<length){accumulator=iteratee(accumulator,array[index],index,array)}return accumulator}function arrayReduceRight(array,iteratee,accumulator,initAccum){var length=array==null?0:array.length;if(initAccum&&length){accumulator=array[--length]}while(length--){accumulator=iteratee(accumulator,array[length],length,array)}return accumulator}function arraySome(array,predicate){var index=-1,length=array==null?0:array.length;while(++index<length){if(predicate(array[index],index,array)){return true}}return false}var asciiSize=baseProperty("length");function asciiToArray(string){return string.split("")}function asciiWords(string){return string.match(reAsciiWord)||[]}function baseFindKey(collection,predicate,eachFunc){var result;eachFunc(collection,function(value,key,collection){if(predicate(value,key,collection)){result=key;return false}});return result}function baseFindIndex(array,predicate,fromIndex,fromRight){var length=array.length,index=fromIndex+(fromRight?1:-1);while(fromRight?index--:++index<length){if(predicate(array[index],index,array)){return index}}return-1}function baseIndexOf(array,value,fromIndex){return value===value?strictIndexOf(array,value,fromIndex):baseFindIndex(array,baseIsNaN,fromIndex)}function baseIndexOfWith(array,value,fromIndex,comparator){var index=fromIndex-1,length=array.length;while(++index<length){if(comparator(array[index],value)){return index}}return-1}function baseIsNaN(value){return value!==value}function baseMean(array,iteratee){var length=array==null?0:array.length;return length?baseSum(array,iteratee)/length:NAN}function baseProperty(key){return function(object){return object==null?undefined:object[key]}}function basePropertyOf(object){return function(key){return object==null?undefined:object[key]}}function baseReduce(collection,iteratee,accumulator,initAccum,eachFunc){eachFunc(collection,function(value,index,collection){accumulator=initAccum?(initAccum=false,value):iteratee(accumulator,value,index,collection)});return accumulator}function baseSortBy(array,comparer){var length=array.length;array.sort(comparer);while(length--){array[length]=array[length].value}return array}function baseSum(array,iteratee){var result,index=-1,length=array.length;while(++index<length){var current=iteratee(array[index]);if(current!==undefined){result=result===undefined?current:result+current}}return result}function baseTimes(n,iteratee){var index=-1,result=Array(n);while(++index<n){result[index]=iteratee(index)}return result}function baseToPairs(object,props){return arrayMap(props,function(key){return[key,object[key]]})}function baseUnary(func){return function(value){return func(value)}}function baseValues(object,props){return arrayMap(props,function(key){return object[key]})}function cacheHas(cache,key){return cache.has(key)}function charsStartIndex(strSymbols,chrSymbols){var index=-1,length=strSymbols.length;while(++index<length&&baseIndexOf(chrSymbols,strSymbols[index],0)>-1){}return index}function charsEndIndex(strSymbols,chrSymbols){var index=strSymbols.length;while(index--&&baseIndexOf(chrSymbols,strSymbols[index],0)>-1){}return index}function countHolders(array,placeholder){var length=array.length,result=0;while(length--){if(array[length]===placeholder){++result}}return result}var deburrLetter=basePropertyOf(deburredLetters);var escapeHtmlChar=basePropertyOf(htmlEscapes);function escapeStringChar(chr){return"\\"+stringEscapes[chr]}function getValue(object,key){return object==null?undefined:object[key]}function hasUnicode(string){return reHasUnicode.test(string)}function hasUnicodeWord(string){return reHasUnicodeWord.test(string)}function iteratorToArray(iterator){var data,result=[];while(!(data=iterator.next()).done){result.push(data.value)}return result}function mapToArray(map){var index=-1,result=Array(map.size);map.forEach(function(value,key){result[++index]=[key,value]});return result}function overArg(func,transform){return function(arg){return func(transform(arg))}}function replaceHolders(array,placeholder){var index=-1,length=array.length,resIndex=0,result=[];while(++index<length){var value=array[index];if(value===placeholder||value===PLACEHOLDER){array[index]=PLACEHOLDER;result[resIndex++]=index}}return result}function setToArray(set){var index=-1,result=Array(set.size);set.forEach(function(value){result[++index]=value});return result}function setToPairs(set){var index=-1,result=Array(set.size);set.forEach(function(value){result[++index]=[value,value]});return result}function strictIndexOf(array,value,fromIndex){var index=fromIndex-1,length=array.length;while(++index<length){if(array[index]===value){return index}}return-1}function strictLastIndexOf(array,value,fromIndex){var index=fromIndex+1;while(index--){if(array[index]===value){return index}}return index}function stringSize(string){return hasUnicode(string)?unicodeSize(string):asciiSize(string)}function stringToArray(string){return hasUnicode(string)?unicodeToArray(string):asciiToArray(string)}var unescapeHtmlChar=basePropertyOf(htmlUnescapes);function unicodeSize(string){var result=reUnicode.lastIndex=0;while(reUnicode.test(string)){++result}return result}function unicodeToArray(string){return string.match(reUnicode)||[]}function unicodeWords(string){return string.match(reUnicodeWord)||[]}var runInContext=function runInContext(context){context=context==null?root:_.defaults(root.Object(),context,_.pick(root,contextProps));var Array=context.Array,Date=context.Date,Error=context.Error,Function=context.Function,Math=context.Math,Object=context.Object,RegExp=context.RegExp,String=context.String,TypeError=context.TypeError;var arrayProto=Array.prototype,funcProto=Function.prototype,objectProto=Object.prototype;var coreJsData=context["__core-js_shared__"];var funcToString=funcProto.toString;var hasOwnProperty=objectProto.hasOwnProperty;var idCounter=0;var maskSrcKey=function(){var uid=/[^.]+$/.exec(coreJsData&&coreJsData.keys&&coreJsData.keys.IE_PROTO||"");return uid?"Symbol(src)_1."+uid:""}();var nativeObjectToString=objectProto.toString;var objectCtorString=funcToString.call(Object);var oldDash=root._;var reIsNative=RegExp("^"+funcToString.call(hasOwnProperty).replace(reRegExpChar,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$");var Buffer=moduleExports?context.Buffer:undefined,Symbol=context.Symbol,Uint8Array=context.Uint8Array,allocUnsafe=Buffer?Buffer.allocUnsafe:undefined,getPrototype=overArg(Object.getPrototypeOf,Object),objectCreate=Object.create,propertyIsEnumerable=objectProto.propertyIsEnumerable,splice=arrayProto.splice,spreadableSymbol=Symbol?Symbol.isConcatSpreadable:undefined,symIterator=Symbol?Symbol.iterator:undefined,symToStringTag=Symbol?Symbol.toStringTag:undefined;var defineProperty=function(){try{var func=getNative(Object,"defineProperty");func({},"",{});return func}catch(e){}}();var ctxClearTimeout=context.clearTimeout!==root.clearTimeout&&context.clearTimeout,ctxNow=Date&&Date.now!==root.Date.now&&Date.now,ctxSetTimeout=context.setTimeout!==root.setTimeout&&context.setTimeout;var nativeCeil=Math.ceil,nativeFloor=Math.floor,nativeGetSymbols=Object.getOwnPropertySymbols,nativeIsBuffer=Buffer?Buffer.isBuffer:undefined,nativeIsFinite=context.isFinite,nativeJoin=arrayProto.join,nativeKeys=overArg(Object.keys,Object),nativeMax=Math.max,nativeMin=Math.min,nativeNow=Date.now,nativeParseInt=context.parseInt,nativeRandom=Math.random,nativeReverse=arrayProto.reverse;var DataView=getNative(context,"DataView"),Map=getNative(context,"Map"),Promise=getNative(context,"Promise"),Set=getNative(context,"Set"),WeakMap=getNative(context,"WeakMap"),nativeCreate=getNative(Object,"create");var metaMap=WeakMap&&new WeakMap;var realNames={};var dataViewCtorString=toSource(DataView),mapCtorString=toSource(Map),promiseCtorString=toSource(Promise),setCtorString=toSource(Set),weakMapCtorString=toSource(WeakMap);var symbolProto=Symbol?Symbol.prototype:undefined,symbolValueOf=symbolProto?symbolProto.valueOf:undefined,symbolToString=symbolProto?symbolProto.toString:undefined;function lodash(value){if(isObjectLike(value)&&!isArray(value)&&!(value instanceof LazyWrapper)){if(value instanceof LodashWrapper){return value}if(hasOwnProperty.call(value,"__wrapped__")){return wrapperClone(value)}}return new LodashWrapper(value)}var baseCreate=function(){function object(){}return function(proto){if(!isObject(proto)){return{}}if(objectCreate){return objectCreate(proto)}object.prototype=proto;var result=new object;object.prototype=undefined;return result}}();function baseLodash(){}function LodashWrapper(value,chainAll){this.__wrapped__=value;this.__actions__=[];this.__chain__=!!chainAll;this.__index__=0;this.__values__=undefined}lodash.templateSettings={escape:reEscape,evaluate:reEvaluate,interpolate:reInterpolate,variable:"",imports:{_:lodash}};lodash.prototype=baseLodash.prototype;lodash.prototype.constructor=lodash;LodashWrapper.prototype=baseCreate(baseLodash.prototype);LodashWrapper.prototype.constructor=LodashWrapper;function LazyWrapper(value){this.__wrapped__=value;this.__actions__=[];this.__dir__=1;this.__filtered__=false;this.__iteratees__=[];this.__takeCount__=MAX_ARRAY_LENGTH;this.__views__=[]}function lazyClone(){var result=new LazyWrapper(this.__wrapped__);result.__actions__=copyArray(this.__actions__);result.__dir__=this.__dir__;result.__filtered__=this.__filtered__;result.__iteratees__=copyArray(this.__iteratees__);result.__takeCount__=this.__takeCount__;result.__views__=copyArray(this.__views__);return result}function lazyReverse(){if(this.__filtered__){var result=new LazyWrapper(this);result.__dir__=-1;result.__filtered__=true}else{result=this.clone();result.__dir__*=-1}return result}function lazyValue(){var array=this.__wrapped__.value(),dir=this.__dir__,isArr=isArray(array),isRight=dir<0,arrLength=isArr?array.length:0,view=getView(0,arrLength,this.__views__),start=view.start,end=view.end,length=end-start,index=isRight?end:start-1,iteratees=this.__iteratees__,iterLength=iteratees.length,resIndex=0,takeCount=nativeMin(length,this.__takeCount__);if(!isArr||!isRight&&arrLength==length&&takeCount==length){return baseWrapperValue(array,this.__actions__)}var result=[];outer:while(length--&&resIndex<takeCount){index+=dir;var iterIndex=-1,value=array[index];while(++iterIndex<iterLength){var data=iteratees[iterIndex],iteratee=data.iteratee,type=data.type,computed=iteratee(value);if(type==LAZY_MAP_FLAG){value=computed}else if(!computed){if(type==LAZY_FILTER_FLAG){continue outer}else{break outer}}}result[resIndex++]=value}return result}LazyWrapper.prototype=baseCreate(baseLodash.prototype);LazyWrapper.prototype.constructor=LazyWrapper;function Hash(entries){var index=-1,length=entries==null?0:entries.length;this.clear();while(++index<length){var entry=entries[index];this.set(entry[0],entry[1])}}function hashClear(){this.__data__=nativeCreate?nativeCreate(null):{};this.size=0}function hashDelete(key){var result=this.has(key)&&delete this.__data__[key];this.size-=result?1:0;return result}function hashGet(key){var data=this.__data__;if(nativeCreate){var result=data[key];return result===HASH_UNDEFINED?undefined:result}return hasOwnProperty.call(data,key)?data[key]:undefined}function hashHas(key){var data=this.__data__;return nativeCreate?data[key]!==undefined:hasOwnProperty.call(data,key)}function hashSet(key,value){var data=this.__data__;this.size+=this.has(key)?0:1;data[key]=nativeCreate&&value===undefined?HASH_UNDEFINED:value;return this}Hash.prototype.clear=hashClear;Hash.prototype["delete"]=hashDelete;Hash.prototype.get=hashGet;Hash.prototype.has=hashHas;Hash.prototype.set=hashSet;function ListCache(entries){var index=-1,length=entries==null?0:entries.length;this.clear();while(++index<length){var entry=entries[index];this.set(entry[0],entry[1])}}function listCacheClear(){this.__data__=[];this.size=0}function listCacheDelete(key){var data=this.__data__,index=assocIndexOf(data,key);if(index<0){return false}var lastIndex=data.length-1;if(index==lastIndex){data.pop()}else{splice.call(data,index,1)}--this.size;return true}function listCacheGet(key){var data=this.__data__,index=assocIndexOf(data,key);return index<0?undefined:data[index][1]}function listCacheHas(key){return assocIndexOf(this.__data__,key)>-1}function listCacheSet(key,value){var data=this.__data__,index=assocIndexOf(data,key);if(index<0){++this.size;data.push([key,value])}else{data[index][1]=value}return this}ListCache.prototype.clear=listCacheClear;ListCache.prototype["delete"]=listCacheDelete;ListCache.prototype.get=listCacheGet;ListCache.prototype.has=listCacheHas;ListCache.prototype.set=listCacheSet;function MapCache(entries){var index=-1,length=entries==null?0:entries.length;this.clear();while(++index<length){var entry=entries[index];this.set(entry[0],entry[1])}}function mapCacheClear(){this.size=0;this.__data__={hash:new Hash,map:new(Map||ListCache),string:new Hash}}function mapCacheDelete(key){var result=getMapData(this,key)["delete"](key);this.size-=result?1:0;return result}function mapCacheGet(key){return getMapData(this,key).get(key)}function mapCacheHas(key){return getMapData(this,key).has(key)}function mapCacheSet(key,value){var data=getMapData(this,key),size=data.size;data.set(key,value);this.size+=data.size==size?0:1;return this}MapCache.prototype.clear=mapCacheClear;MapCache.prototype["delete"]=mapCacheDelete;MapCache.prototype.get=mapCacheGet;MapCache.prototype.has=mapCacheHas;MapCache.prototype.set=mapCacheSet;function SetCache(values){var index=-1,length=values==null?0:values.length;this.__data__=new MapCache;while(++index<length){this.add(values[index])}}function setCacheAdd(value){this.__data__.set(value,HASH_UNDEFINED);return this}function setCacheHas(value){return this.__data__.has(value)}SetCache.prototype.add=SetCache.prototype.push=setCacheAdd;SetCache.prototype.has=setCacheHas;function Stack(entries){var data=this.__data__=new ListCache(entries);this.size=data.size}function stackClear(){this.__data__=new ListCache;this.size=0}function stackDelete(key){var data=this.__data__,result=data["delete"](key);this.size=data.size;return result}function stackGet(key){return this.__data__.get(key)}function stackHas(key){return this.__data__.has(key)}function stackSet(key,value){var data=this.__data__;if(data instanceof ListCache){var pairs=data.__data__;if(!Map||pairs.length<LARGE_ARRAY_SIZE-1){pairs.push([key,value]);this.size=++data.size;return this}data=this.__data__=new MapCache(pairs)}data.set(key,value);this.size=data.size;return this}Stack.prototype.clear=stackClear;Stack.prototype["delete"]=stackDelete;Stack.prototype.get=stackGet;Stack.prototype.has=stackHas;Stack.prototype.set=stackSet;function arrayLikeKeys(value,inherited){var isArr=isArray(value),isArg=!isArr&&isArguments(value),isBuff=!isArr&&!isArg&&isBuffer(value),isType=!isArr&&!isArg&&!isBuff&&isTypedArray(value),skipIndexes=isArr||isArg||isBuff||isType,result=skipIndexes?baseTimes(value.length,String):[],length=result.length;for(var key in value){if((inherited||hasOwnProperty.call(value,key))&&!(skipIndexes&&(key=="length"||isBuff&&(key=="offset"||key=="parent")||isType&&(key=="buffer"||key=="byteLength"||key=="byteOffset")||isIndex(key,length)))){result.push(key)}}return result}function arraySample(array){var length=array.length;return length?array[baseRandom(0,length-1)]:undefined}function arraySampleSize(array,n){return shuffleSelf(copyArray(array),baseClamp(n,0,array.length))}function arrayShuffle(array){return shuffleSelf(copyArray(array))}function assignMergeValue(object,key,value){if(value!==undefined&&!eq(object[key],value)||value===undefined&&!(key in object)){baseAssignValue(object,key,value)}}function assignValue(object,key,value){var objValue=object[key];if(!(hasOwnProperty.call(object,key)&&eq(objValue,value))||value===undefined&&!(key in object)){baseAssignValue(object,key,value)}}function assocIndexOf(array,key){var length=array.length;while(length--){if(eq(array[length][0],key)){return length}}return-1}function baseAggregator(collection,setter,iteratee,accumulator){baseEach(collection,function(value,key,collection){setter(accumulator,value,iteratee(value),collection)});return accumulator}function baseAssign(object,source){return object&&copyObject(source,keys(source),object)}function baseAssignIn(object,source){return object&&copyObject(source,keysIn(source),object)}function baseAssignValue(object,key,value){if(key=="__proto__"&&defineProperty){defineProperty(object,key,{configurable:true,enumerable:true,value:value,writable:true})}else{object[key]=value}}function baseAt(object,paths){var index=-1,length=paths.length,result=Array(length),skip=object==null;while(++index<length){result[index]=skip?undefined:get(object,paths[index])}return result}function baseClamp(number,lower,upper){if(number===number){if(upper!==undefined){number=number<=upper?number:upper}if(lower!==undefined){number=number>=lower?number:lower}}return number}function baseClone(value,bitmask,customizer,key,object,stack){var result,isDeep=bitmask&CLONE_DEEP_FLAG,isFlat=bitmask&CLONE_FLAT_FLAG,isFull=bitmask&CLONE_SYMBOLS_FLAG;if(customizer){result=object?customizer(value,key,object,stack):customizer(value)}if(result!==undefined){return result}if(!isObject(value)){return value}var isArr=isArray(value);if(isArr){result=initCloneArray(value);if(!isDeep){return copyArray(value,result)}}else{var tag=getTag(value),isFunc=tag==funcTag||tag==genTag;if(isBuffer(value)){return cloneBuffer(value,isDeep)}if(tag==objectTag||tag==argsTag||isFunc&&!object){result=isFlat||isFunc?{}:initCloneObject(value);if(!isDeep){return isFlat?copySymbolsIn(value,baseAssignIn(result,value)):copySymbols(value,baseAssign(result,value))}}else{if(!cloneableTags[tag]){return object?value:{}}result=initCloneByTag(value,tag,baseClone,isDeep)}}stack||(stack=new Stack);var stacked=stack.get(value);if(stacked){return stacked}stack.set(value,result);var keysFunc=isFull?isFlat?getAllKeysIn:getAllKeys:isFlat?keysIn:keys;var props=isArr?undefined:keysFunc(value);arrayEach(props||value,function(subValue,key){if(props){key=subValue;subValue=value[key]}assignValue(result,key,baseClone(subValue,bitmask,customizer,key,value,stack))});return result}function baseConforms(source){var props=keys(source);return function(object){return baseConformsTo(object,source,props)}}function baseConformsTo(object,source,props){var length=props.length;if(object==null){return!length}object=Object(object);while(length--){var key=props[length],predicate=source[key],value=object[key];if(value===undefined&&!(key in object)||!predicate(value)){return false}}return true}function baseDelay(func,wait,args){if(typeof func!="function"){throw new TypeError(FUNC_ERROR_TEXT)}return setTimeout(function(){func.apply(undefined,args)},wait)}function baseDifference(array,values,iteratee,comparator){var index=-1,includes=arrayIncludes,isCommon=true,length=array.length,result=[],valuesLength=values.length;if(!length){return result}if(iteratee){values=arrayMap(values,baseUnary(iteratee))}if(comparator){includes=arrayIncludesWith;isCommon=false}else if(values.length>=LARGE_ARRAY_SIZE){includes=cacheHas;isCommon=false;values=new SetCache(values)}outer:while(++index<length){var value=array[index],computed=iteratee==null?value:iteratee(value);value=comparator||value!==0?value:0;if(isCommon&&computed===computed){var valuesIndex=valuesLength;while(valuesIndex--){if(values[valuesIndex]===computed){continue outer}}result.push(value)}else if(!includes(values,computed,comparator)){result.push(value)}}return result}var baseEach=createBaseEach(baseForOwn);var baseEachRight=createBaseEach(baseForOwnRight,true);function baseEvery(collection,predicate){var result=true;baseEach(collection,function(value,index,collection){result=!!predicate(value,index,collection);return result});return result}function baseExtremum(array,iteratee,comparator){var index=-1,length=array.length;while(++index<length){var value=array[index],current=iteratee(value);if(current!=null&&(computed===undefined?current===current&&!isSymbol(current):comparator(current,computed))){var computed=current,result=value}}return result}function baseFill(array,value,start,end){var length=array.length;start=toInteger(start);if(start<0){start=-start>length?0:length+start}end=end===undefined||end>length?length:toInteger(end);if(end<0){end+=length}end=start>end?0:toLength(end);while(start<end){array[start++]=value}return array}function baseFilter(collection,predicate){var result=[];baseEach(collection,function(value,index,collection){if(predicate(value,index,collection)){result.push(value)}});return result}function baseFlatten(array,depth,predicate,isStrict,result){var index=-1,length=array.length;predicate||(predicate=isFlattenable);result||(result=[]);while(++index<length){var value=array[index];if(depth>0&&predicate(value)){if(depth>1){baseFlatten(value,depth-1,predicate,isStrict,result)}else{arrayPush(result,value)}}else if(!isStrict){result[result.length]=value}}return result}var baseFor=createBaseFor();var baseForRight=createBaseFor(true);function baseForOwn(object,iteratee){return object&&baseFor(object,iteratee,keys)}function baseForOwnRight(object,iteratee){return object&&baseForRight(object,iteratee,keys)}function baseFunctions(object,props){return arrayFilter(props,function(key){return isFunction(object[key])})}function baseGet(object,path){path=castPath(path,object);var index=0,length=path.length;while(object!=null&&index<length){object=object[toKey(path[index++])]}return index&&index==length?object:undefined}function baseGetAllKeys(object,keysFunc,symbolsFunc){var result=keysFunc(object);return isArray(object)?result:arrayPush(result,symbolsFunc(object))}function baseGetTag(value){if(value==null){return value===undefined?undefinedTag:nullTag}return symToStringTag&&symToStringTag in Object(value)?getRawTag(value):objectToString(value)}function baseGt(value,other){return value>other}function baseHas(object,key){return object!=null&&hasOwnProperty.call(object,key)}function baseHasIn(object,key){return object!=null&&key in Object(object)}function baseInRange(number,start,end){return number>=nativeMin(start,end)&&number<nativeMax(start,end)}function baseIntersection(arrays,iteratee,comparator){var includes=comparator?arrayIncludesWith:arrayIncludes,length=arrays[0].length,othLength=arrays.length,othIndex=othLength,caches=Array(othLength),maxLength=Infinity,result=[];while(othIndex--){var array=arrays[othIndex];if(othIndex&&iteratee){array=arrayMap(array,baseUnary(iteratee))}maxLength=nativeMin(array.length,maxLength);caches[othIndex]=!comparator&&(iteratee||length>=120&&array.length>=120)?new SetCache(othIndex&&array):undefined}array=arrays[0];var index=-1,seen=caches[0];outer:while(++index<length&&result.length<maxLength){var value=array[index],computed=iteratee?iteratee(value):value;value=comparator||value!==0?value:0;if(!(seen?cacheHas(seen,computed):includes(result,computed,comparator))){othIndex=othLength;while(--othIndex){var cache=caches[othIndex];if(!(cache?cacheHas(cache,computed):includes(arrays[othIndex],computed,comparator))){continue outer}}if(seen){seen.push(computed)}result.push(value)}}return result}function baseInverter(object,setter,iteratee,accumulator){baseForOwn(object,function(value,key,object){setter(accumulator,iteratee(value),key,object)});return accumulator}function baseInvoke(object,path,args){path=castPath(path,object);object=parent(object,path);var func=object==null?object:object[toKey(last(path))];return func==null?undefined:apply(func,object,args)}function baseIsArguments(value){return isObjectLike(value)&&baseGetTag(value)==argsTag}function baseIsArrayBuffer(value){return isObjectLike(value)&&baseGetTag(value)==arrayBufferTag}function baseIsDate(value){return isObjectLike(value)&&baseGetTag(value)==dateTag}function baseIsEqual(value,other,bitmask,customizer,stack){if(value===other){return true}if(value==null||other==null||!isObjectLike(value)&&!isObjectLike(other)){return value!==value&&other!==other}return baseIsEqualDeep(value,other,bitmask,customizer,baseIsEqual,stack)}function baseIsEqualDeep(object,other,bitmask,customizer,equalFunc,stack){var objIsArr=isArray(object),othIsArr=isArray(other),objTag=objIsArr?arrayTag:getTag(object),othTag=othIsArr?arrayTag:getTag(other);objTag=objTag==argsTag?objectTag:objTag;othTag=othTag==argsTag?objectTag:othTag;var objIsObj=objTag==objectTag,othIsObj=othTag==objectTag,isSameTag=objTag==othTag;if(isSameTag&&isBuffer(object)){if(!isBuffer(other)){return false}objIsArr=true;objIsObj=false}if(isSameTag&&!objIsObj){stack||(stack=new Stack);return objIsArr||isTypedArray(object)?equalArrays(object,other,bitmask,customizer,equalFunc,stack):equalByTag(object,other,objTag,bitmask,customizer,equalFunc,stack)}if(!(bitmask&COMPARE_PARTIAL_FLAG)){var objIsWrapped=objIsObj&&hasOwnProperty.call(object,"__wrapped__"),othIsWrapped=othIsObj&&hasOwnProperty.call(other,"__wrapped__");if(objIsWrapped||othIsWrapped){var objUnwrapped=objIsWrapped?object.value():object,othUnwrapped=othIsWrapped?other.value():other;stack||(stack=new Stack);return equalFunc(objUnwrapped,othUnwrapped,bitmask,customizer,stack)}}if(!isSameTag){return false}stack||(stack=new Stack);return equalObjects(object,other,bitmask,customizer,equalFunc,stack)}function baseIsMap(value){return isObjectLike(value)&&getTag(value)==mapTag}function baseIsMatch(object,source,matchData,customizer){var index=matchData.length,length=index,noCustomizer=!customizer;if(object==null){return!length}object=Object(object);while(index--){var data=matchData[index];if(noCustomizer&&data[2]?data[1]!==object[data[0]]:!(data[0]in object)){return false}}while(++index<length){data=matchData[index];var key=data[0],objValue=object[key],srcValue=data[1];if(noCustomizer&&data[2]){if(objValue===undefined&&!(key in object)){return false}}else{var stack=new Stack;if(customizer){var result=customizer(objValue,srcValue,key,object,source,stack)}if(!(result===undefined?baseIsEqual(srcValue,objValue,COMPARE_PARTIAL_FLAG|COMPARE_UNORDERED_FLAG,customizer,stack):result)){return false}}}return true}function baseIsNative(value){if(!isObject(value)||isMasked(value)){return false}var pattern=isFunction(value)?reIsNative:reIsHostCtor;return pattern.test(toSource(value))}function baseIsRegExp(value){return isObjectLike(value)&&baseGetTag(value)==regexpTag}function baseIsSet(value){return isObjectLike(value)&&getTag(value)==setTag}function baseIsTypedArray(value){return isObjectLike(value)&&isLength(value.length)&&!!typedArrayTags[baseGetTag(value)]}function baseIteratee(value){if(typeof value=="function"){return value}if(value==null){return identity}if(typeof value=="object"){return isArray(value)?baseMatchesProperty(value[0],value[1]):baseMatches(value)}return property(value)}function baseKeys(object){if(!isPrototype(object)){return nativeKeys(object)}var result=[];for(var key in Object(object)){if(hasOwnProperty.call(object,key)&&key!="constructor"){result.push(key)}}return result}function baseKeysIn(object){if(!isObject(object)){return nativeKeysIn(object)}var isProto=isPrototype(object),result=[];for(var key in object){if(!(key=="constructor"&&(isProto||!hasOwnProperty.call(object,key)))){result.push(key)}}return result}function baseLt(value,other){return value<other}function baseMap(collection,iteratee){var index=-1,result=isArrayLike(collection)?Array(collection.length):[];baseEach(collection,function(value,key,collection){result[++index]=iteratee(value,key,collection)});return result}function baseMatches(source){var matchData=getMatchData(source);if(matchData.length==1&&matchData[0][2]){return matchesStrictComparable(matchData[0][0],matchData[0][1])}return function(object){return object===source||baseIsMatch(object,source,matchData)}}function baseMatchesProperty(path,srcValue){if(isKey(path)&&isStrictComparable(srcValue)){return matchesStrictComparable(toKey(path),srcValue)}return function(object){var objValue=get(object,path);return objValue===undefined&&objValue===srcValue?hasIn(object,path):baseIsEqual(srcValue,objValue,COMPARE_PARTIAL_FLAG|COMPARE_UNORDERED_FLAG)}}function baseMerge(object,source,srcIndex,customizer,stack){if(object===source){return}baseFor(source,function(srcValue,key){if(isObject(srcValue)){stack||(stack=new Stack);baseMergeDeep(object,source,key,srcIndex,baseMerge,customizer,stack)}else{var newValue=customizer?customizer(object[key],srcValue,key+"",object,source,stack):undefined;if(newValue===undefined){newValue=srcValue}assignMergeValue(object,key,newValue)}},keysIn)}function baseMergeDeep(object,source,key,srcIndex,mergeFunc,customizer,stack){var objValue=object[key],srcValue=source[key],stacked=stack.get(srcValue);if(stacked){assignMergeValue(object,key,stacked);return}var newValue=customizer?customizer(objValue,srcValue,key+"",object,source,stack):undefined;var isCommon=newValue===undefined;if(isCommon){var isArr=isArray(srcValue),isBuff=!isArr&&isBuffer(srcValue),isTyped=!isArr&&!isBuff&&isTypedArray(srcValue);newValue=srcValue;if(isArr||isBuff||isTyped){if(isArray(objValue)){newValue=objValue}else if(isArrayLikeObject(objValue)){newValue=copyArray(objValue)}else if(isBuff){isCommon=false;newValue=cloneBuffer(srcValue,true)}else if(isTyped){isCommon=false;newValue=cloneTypedArray(srcValue,true)}else{newValue=[]}}else if(isPlainObject(srcValue)||isArguments(srcValue)){newValue=objValue;if(isArguments(objValue)){newValue=toPlainObject(objValue)}else if(!isObject(objValue)||srcIndex&&isFunction(objValue)){newValue=initCloneObject(srcValue)}}else{isCommon=false}}if(isCommon){stack.set(srcValue,newValue);mergeFunc(newValue,srcValue,srcIndex,customizer,stack);stack["delete"](srcValue)}assignMergeValue(object,key,newValue)}function baseNth(array,n){var length=array.length;if(!length){return}n+=n<0?length:0;return isIndex(n,length)?array[n]:undefined}function baseOrderBy(collection,iteratees,orders){var index=-1;iteratees=arrayMap(iteratees.length?iteratees:[identity],baseUnary(getIteratee()));var result=baseMap(collection,function(value,key,collection){var criteria=arrayMap(iteratees,function(iteratee){return iteratee(value)});return{criteria:criteria,index:++index,value:value}});return baseSortBy(result,function(object,other){return compareMultiple(object,other,orders)})}function basePick(object,paths){return basePickBy(object,paths,function(value,path){return hasIn(object,path)})}function basePickBy(object,paths,predicate){var index=-1,length=paths.length,result={};while(++index<length){var path=paths[index],value=baseGet(object,path);if(predicate(value,path)){baseSet(result,castPath(path,object),value)}}return result}function basePropertyDeep(path){return function(object){return baseGet(object,path)}}function basePullAll(array,values,iteratee,comparator){var indexOf=comparator?baseIndexOfWith:baseIndexOf,index=-1,length=values.length,seen=array;if(array===values){values=copyArray(values)}if(iteratee){seen=arrayMap(array,baseUnary(iteratee))}while(++index<length){var fromIndex=0,value=values[index],computed=iteratee?iteratee(value):value;while((fromIndex=indexOf(seen,computed,fromIndex,comparator))>-1){if(seen!==array){splice.call(seen,fromIndex,1)}splice.call(array,fromIndex,1)}}return array}function basePullAt(array,indexes){var length=array?indexes.length:0,lastIndex=length-1;while(length--){var index=indexes[length];if(length==lastIndex||index!==previous){var previous=index;if(isIndex(index)){splice.call(array,index,1)}else{baseUnset(array,index)}}}return array}function baseRandom(lower,upper){return lower+nativeFloor(nativeRandom()*(upper-lower+1))}function baseRange(start,end,step,fromRight){var index=-1,length=nativeMax(nativeCeil((end-start)/(step||1)),0),result=Array(length);while(length--){result[fromRight?length:++index]=start;start+=step}return result}function baseRepeat(string,n){var result="";if(!string||n<1||n>MAX_SAFE_INTEGER){return result}do{if(n%2){result+=string}n=nativeFloor(n/2);if(n){string+=string}}while(n);return result}function baseRest(func,start){return setToString(overRest(func,start,identity),func+"")}function baseSample(collection){return arraySample(values(collection))}function baseSampleSize(collection,n){var array=values(collection);return shuffleSelf(array,baseClamp(n,0,array.length))}function baseSet(object,path,value,customizer){if(!isObject(object)){return object}path=castPath(path,object);var index=-1,length=path.length,lastIndex=length-1,nested=object;while(nested!=null&&++index<length){var key=toKey(path[index]),newValue=value;if(index!=lastIndex){var objValue=nested[key];newValue=customizer?customizer(objValue,key,nested):undefined;if(newValue===undefined){newValue=isObject(objValue)?objValue:isIndex(path[index+1])?[]:{}}}assignValue(nested,key,newValue);nested=nested[key]}return object}var baseSetData=!metaMap?identity:function(func,data){metaMap.set(func,data);return func};var baseSetToString=!defineProperty?identity:function(func,string){return defineProperty(func,"toString",{configurable:true,enumerable:false,value:constant(string),writable:true})};function baseShuffle(collection){return shuffleSelf(values(collection))}function baseSlice(array,start,end){var index=-1,length=array.length;if(start<0){start=-start>length?0:length+start}end=end>length?length:end;if(end<0){end+=length}length=start>end?0:end-start>>>0;start>>>=0;var result=Array(length);while(++index<length){result[index]=array[index+start]}return result}function baseSome(collection,predicate){var result;baseEach(collection,function(value,index,collection){result=predicate(value,index,collection);return!result});return!!result}function baseSortedIndex(array,value,retHighest){var low=0,high=array==null?low:array.length;if(typeof value=="number"&&value===value&&high<=HALF_MAX_ARRAY_LENGTH){while(low<high){var mid=low+high>>>1,computed=array[mid];if(computed!==null&&!isSymbol(computed)&&(retHighest?computed<=value:computed<value)){low=mid+1}else{high=mid}}return high}return baseSortedIndexBy(array,value,identity,retHighest)}function baseSortedIndexBy(array,value,iteratee,retHighest){value=iteratee(value);var low=0,high=array==null?0:array.length,valIsNaN=value!==value,valIsNull=value===null,valIsSymbol=isSymbol(value),valIsUndefined=value===undefined;while(low<high){var mid=nativeFloor((low+high)/2),computed=iteratee(array[mid]),othIsDefined=computed!==undefined,othIsNull=computed===null,othIsReflexive=computed===computed,othIsSymbol=isSymbol(computed);if(valIsNaN){var setLow=retHighest||othIsReflexive}else if(valIsUndefined){setLow=othIsReflexive&&(retHighest||othIsDefined)}else if(valIsNull){setLow=othIsReflexive&&othIsDefined&&(retHighest||!othIsNull)}else if(valIsSymbol){setLow=othIsReflexive&&othIsDefined&&!othIsNull&&(retHighest||!othIsSymbol)}else if(othIsNull||othIsSymbol){setLow=false}else{setLow=retHighest?computed<=value:computed<value}if(setLow){low=mid+1}else{high=mid}}return nativeMin(high,MAX_ARRAY_INDEX)}function baseSortedUniq(array,iteratee){var index=-1,length=array.length,resIndex=0,result=[];while(++index<length){var value=array[index],computed=iteratee?iteratee(value):value;if(!index||!eq(computed,seen)){var seen=computed;result[resIndex++]=value===0?0:value}}return result}function baseToNumber(value){if(typeof value=="number"){return value}if(isSymbol(value)){return NAN}return+value}function baseToString(value){if(typeof value=="string"){return value}if(isArray(value)){return arrayMap(value,baseToString)+""}if(isSymbol(value)){return symbolToString?symbolToString.call(value):""}var result=value+"";return result=="0"&&1/value==-INFINITY?"-0":result}function baseUniq(array,iteratee,comparator){var index=-1,includes=arrayIncludes,length=array.length,isCommon=true,result=[],seen=result;if(comparator){isCommon=false;includes=arrayIncludesWith}else if(length>=LARGE_ARRAY_SIZE){var set=iteratee?null:createSet(array);if(set){return setToArray(set)}isCommon=false;includes=cacheHas;seen=new SetCache}else{seen=iteratee?[]:result}outer:while(++index<length){var value=array[index],computed=iteratee?iteratee(value):value;value=comparator||value!==0?value:0;if(isCommon&&computed===computed){var seenIndex=seen.length;while(seenIndex--){if(seen[seenIndex]===computed){continue outer}}if(iteratee){seen.push(computed)}result.push(value)}else if(!includes(seen,computed,comparator)){if(seen!==result){seen.push(computed)}result.push(value)}}return result}function baseUnset(object,path){path=castPath(path,object);object=parent(object,path);return object==null||delete object[toKey(last(path))]}function baseUpdate(object,path,updater,customizer){return baseSet(object,path,updater(baseGet(object,path)),customizer)}function baseWhile(array,predicate,isDrop,fromRight){var length=array.length,index=fromRight?length:-1;while((fromRight?index--:++index<length)&&predicate(array[index],index,array)){}return isDrop?baseSlice(array,fromRight?0:index,fromRight?index+1:length):baseSlice(array,fromRight?index+1:0,fromRight?length:index)}function baseWrapperValue(value,actions){var result=value;if(result instanceof LazyWrapper){result=result.value()}return arrayReduce(actions,function(result,action){return action.func.apply(action.thisArg,arrayPush([result],action.args))},result)}function baseXor(arrays,iteratee,comparator){var length=arrays.length;if(length<2){return length?baseUniq(arrays[0]):[]}var index=-1,result=Array(length);while(++index<length){var array=arrays[index],othIndex=-1;while(++othIndex<length){if(othIndex!=index){result[index]=baseDifference(result[index]||array,arrays[othIndex],iteratee,comparator)}}}return baseUniq(baseFlatten(result,1),iteratee,comparator)}function baseZipObject(props,values,assignFunc){var index=-1,length=props.length,valsLength=values.length,result={};while(++index<length){var value=index<valsLength?values[index]:undefined;assignFunc(result,props[index],value)}return result}function castArrayLikeObject(value){return isArrayLikeObject(value)?value:[]}function castFunction(value){return typeof value=="function"?value:identity}function castPath(value,object){if(isArray(value)){return value}return isKey(value,object)?[value]:stringToPath(toString(value))}var castRest=baseRest;function castSlice(array,start,end){var length=array.length;end=end===undefined?length:end;return!start&&end>=length?array:baseSlice(array,start,end)}var clearTimeout=ctxClearTimeout||function(id){return root.clearTimeout(id)};function cloneBuffer(buffer,isDeep){if(isDeep){return buffer.slice()}var length=buffer.length,result=allocUnsafe?allocUnsafe(length):new buffer.constructor(length);buffer.copy(result);return result}function cloneArrayBuffer(arrayBuffer){var result=new arrayBuffer.constructor(arrayBuffer.byteLength);new Uint8Array(result).set(new Uint8Array(arrayBuffer));return result}function cloneDataView(dataView,isDeep){var buffer=isDeep?cloneArrayBuffer(dataView.buffer):dataView.buffer;return new dataView.constructor(buffer,dataView.byteOffset,dataView.byteLength)}function cloneMap(map,isDeep,cloneFunc){var array=isDeep?cloneFunc(mapToArray(map),CLONE_DEEP_FLAG):mapToArray(map);return arrayReduce(array,addMapEntry,new map.constructor)}function cloneRegExp(regexp){var result=new regexp.constructor(regexp.source,reFlags.exec(regexp));result.lastIndex=regexp.lastIndex;return result}function cloneSet(set,isDeep,cloneFunc){var array=isDeep?cloneFunc(setToArray(set),CLONE_DEEP_FLAG):setToArray(set);return arrayReduce(array,addSetEntry,new set.constructor)}function cloneSymbol(symbol){return symbolValueOf?Object(symbolValueOf.call(symbol)):{}}function cloneTypedArray(typedArray,isDeep){var buffer=isDeep?cloneArrayBuffer(typedArray.buffer):typedArray.buffer;return new typedArray.constructor(buffer,typedArray.byteOffset,typedArray.length)}function compareAscending(value,other){if(value!==other){var valIsDefined=value!==undefined,valIsNull=value===null,valIsReflexive=value===value,valIsSymbol=isSymbol(value);var othIsDefined=other!==undefined,othIsNull=other===null,othIsReflexive=other===other,othIsSymbol=isSymbol(other);if(!othIsNull&&!othIsSymbol&&!valIsSymbol&&value>other||valIsSymbol&&othIsDefined&&othIsReflexive&&!othIsNull&&!othIsSymbol||valIsNull&&othIsDefined&&othIsReflexive||!valIsDefined&&othIsReflexive||!valIsReflexive){return 1}if(!valIsNull&&!valIsSymbol&&!othIsSymbol&&value<other||othIsSymbol&&valIsDefined&&valIsReflexive&&!valIsNull&&!valIsSymbol||othIsNull&&valIsDefined&&valIsReflexive||!othIsDefined&&valIsReflexive||!othIsReflexive){return-1}}return 0}function compareMultiple(object,other,orders){var index=-1,objCriteria=object.criteria,othCriteria=other.criteria,length=objCriteria.length,ordersLength=orders.length;while(++index<length){var result=compareAscending(objCriteria[index],othCriteria[index]);if(result){if(index>=ordersLength){return result}var order=orders[index];return result*(order=="desc"?-1:1)}}return object.index-other.index}function composeArgs(args,partials,holders,isCurried){var argsIndex=-1,argsLength=args.length,holdersLength=holders.length,leftIndex=-1,leftLength=partials.length,rangeLength=nativeMax(argsLength-holdersLength,0),result=Array(leftLength+rangeLength),isUncurried=!isCurried;while(++leftIndex<leftLength){result[leftIndex]=partials[leftIndex]}while(++argsIndex<holdersLength){if(isUncurried||argsIndex<argsLength){result[holders[argsIndex]]=args[argsIndex]}}while(rangeLength--){result[leftIndex++]=args[argsIndex++]}return result}function composeArgsRight(args,partials,holders,isCurried){var argsIndex=-1,argsLength=args.length,holdersIndex=-1,holdersLength=holders.length,rightIndex=-1,rightLength=partials.length,rangeLength=nativeMax(argsLength-holdersLength,0),result=Array(rangeLength+rightLength),isUncurried=!isCurried;while(++argsIndex<rangeLength){result[argsIndex]=args[argsIndex]}var offset=argsIndex;while(++rightIndex<rightLength){result[offset+rightIndex]=partials[rightIndex]}while(++holdersIndex<holdersLength){if(isUncurried||argsIndex<argsLength){result[offset+holders[holdersIndex]]=args[argsIndex++]}}return result}function copyArray(source,array){var index=-1,length=source.length;array||(array=Array(length));while(++index<length){array[index]=source[index]}return array}function copyObject(source,props,object,customizer){var isNew=!object;object||(object={});var index=-1,length=props.length;while(++index<length){var key=props[index];var newValue=customizer?customizer(object[key],source[key],key,object,source):undefined;if(newValue===undefined){newValue=source[key]}if(isNew){baseAssignValue(object,key,newValue)}else{assignValue(object,key,newValue)}}return object}function copySymbols(source,object){return copyObject(source,getSymbols(source),object)}function copySymbolsIn(source,object){return copyObject(source,getSymbolsIn(source),object)}function createAggregator(setter,initializer){return function(collection,iteratee){var func=isArray(collection)?arrayAggregator:baseAggregator,accumulator=initializer?initializer():{};return func(collection,setter,getIteratee(iteratee,2),accumulator)}}function createAssigner(assigner){return baseRest(function(object,sources){var index=-1,length=sources.length,customizer=length>1?sources[length-1]:undefined,guard=length>2?sources[2]:undefined;customizer=assigner.length>3&&typeof customizer=="function"?(length--,customizer):undefined;if(guard&&isIterateeCall(sources[0],sources[1],guard)){customizer=length<3?undefined:customizer;length=1}object=Object(object);while(++index<length){var source=sources[index];if(source){assigner(object,source,index,customizer)}}return object})}function createBaseEach(eachFunc,fromRight){return function(collection,iteratee){if(collection==null){return collection}if(!isArrayLike(collection)){return eachFunc(collection,iteratee)}var length=collection.length,index=fromRight?length:-1,iterable=Object(collection);while(fromRight?index--:++index<length){if(iteratee(iterable[index],index,iterable)===false){break}}return collection}}function createBaseFor(fromRight){return function(object,iteratee,keysFunc){var index=-1,iterable=Object(object),props=keysFunc(object),length=props.length;while(length--){var key=props[fromRight?length:++index];if(iteratee(iterable[key],key,iterable)===false){break}}return object}}function createBind(func,bitmask,thisArg){var isBind=bitmask&WRAP_BIND_FLAG,Ctor=createCtor(func);function wrapper(){var fn=this&&this!==root&&this instanceof wrapper?Ctor:func;return fn.apply(isBind?thisArg:this,arguments)}return wrapper}function createCaseFirst(methodName){return function(string){string=toString(string);var strSymbols=hasUnicode(string)?stringToArray(string):undefined;var chr=strSymbols?strSymbols[0]:string.charAt(0);var trailing=strSymbols?castSlice(strSymbols,1).join(""):string.slice(1);return chr[methodName]()+trailing}}function createCompounder(callback){return function(string){return arrayReduce(words(deburr(string).replace(reApos,"")),callback,"")}}function createCtor(Ctor){return function(){var args=arguments;switch(args.length){case 0:return new Ctor;case 1:return new Ctor(args[0]);case 2:return new Ctor(args[0],args[1]);case 3:return new Ctor(args[0],args[1],args[2]);case 4:return new Ctor(args[0],args[1],args[2],args[3]);case 5:return new Ctor(args[0],args[1],args[2],args[3],args[4]);case 6:return new Ctor(args[0],args[1],args[2],args[3],args[4],args[5]);case 7:return new Ctor(args[0],args[1],args[2],args[3],args[4],args[5],args[6])}var thisBinding=baseCreate(Ctor.prototype),result=Ctor.apply(thisBinding,args);return isObject(result)?result:thisBinding}}function createCurry(func,bitmask,arity){var Ctor=createCtor(func);function wrapper(){var length=arguments.length,args=Array(length),index=length,placeholder=getHolder(wrapper);while(index--){args[index]=arguments[index]}var holders=length<3&&args[0]!==placeholder&&args[length-1]!==placeholder?[]:replaceHolders(args,placeholder);length-=holders.length;if(length<arity){return createRecurry(func,bitmask,createHybrid,wrapper.placeholder,undefined,args,holders,undefined,undefined,arity-length)}var fn=this&&this!==root&&this instanceof wrapper?Ctor:func;return apply(fn,this,args)}return wrapper}function createFind(findIndexFunc){return function(collection,predicate,fromIndex){var iterable=Object(collection);if(!isArrayLike(collection)){var iteratee=getIteratee(predicate,3);collection=keys(collection);predicate=function(key){return iteratee(iterable[key],key,iterable)}}var index=findIndexFunc(collection,predicate,fromIndex);return index>-1?iterable[iteratee?collection[index]:index]:undefined}}function createFlow(fromRight){return flatRest(function(funcs){var length=funcs.length,index=length,prereq=LodashWrapper.prototype.thru;if(fromRight){funcs.reverse()}while(index--){var func=funcs[index];if(typeof func!="function"){throw new TypeError(FUNC_ERROR_TEXT)}if(prereq&&!wrapper&&getFuncName(func)=="wrapper"){var wrapper=new LodashWrapper([],true)}}index=wrapper?index:length;while(++index<length){func=funcs[index];var funcName=getFuncName(func),data=funcName=="wrapper"?getData(func):undefined;if(data&&isLaziable(data[0])&&data[1]==(WRAP_ARY_FLAG|WRAP_CURRY_FLAG|WRAP_PARTIAL_FLAG|WRAP_REARG_FLAG)&&!data[4].length&&data[9]==1){wrapper=wrapper[getFuncName(data[0])].apply(wrapper,data[3])}else{wrapper=func.length==1&&isLaziable(func)?wrapper[funcName]():wrapper.thru(func)}}return function(){var args=arguments,value=args[0];if(wrapper&&args.length==1&&isArray(value)){return wrapper.plant(value).value()}var index=0,result=length?funcs[index].apply(this,args):value;while(++index<length){result=funcs[index].call(this,result)}return result}})}function createHybrid(func,bitmask,thisArg,partials,holders,partialsRight,holdersRight,argPos,ary,arity){var isAry=bitmask&WRAP_ARY_FLAG,isBind=bitmask&WRAP_BIND_FLAG,isBindKey=bitmask&WRAP_BIND_KEY_FLAG,isCurried=bitmask&(WRAP_CURRY_FLAG|WRAP_CURRY_RIGHT_FLAG),isFlip=bitmask&WRAP_FLIP_FLAG,Ctor=isBindKey?undefined:createCtor(func);function wrapper(){var length=arguments.length,args=Array(length),index=length;while(index--){args[index]=arguments[index]}if(isCurried){var placeholder=getHolder(wrapper),holdersCount=countHolders(args,placeholder)}if(partials){args=composeArgs(args,partials,holders,isCurried)}if(partialsRight){args=composeArgsRight(args,partialsRight,holdersRight,isCurried)}length-=holdersCount;if(isCurried&&length<arity){var newHolders=replaceHolders(args,placeholder);return createRecurry(func,bitmask,createHybrid,wrapper.placeholder,thisArg,args,newHolders,argPos,ary,arity-length)}var thisBinding=isBind?thisArg:this,fn=isBindKey?thisBinding[func]:func;length=args.length;if(argPos){args=reorder(args,argPos)}else if(isFlip&&length>1){args.reverse()}if(isAry&&ary<length){args.length=ary}if(this&&this!==root&&this instanceof wrapper){fn=Ctor||createCtor(fn)}return fn.apply(thisBinding,args)}return wrapper}function createInverter(setter,toIteratee){return function(object,iteratee){return baseInverter(object,setter,toIteratee(iteratee),{})}}function createMathOperation(operator,defaultValue){return function(value,other){var result;if(value===undefined&&other===undefined){return defaultValue}if(value!==undefined){result=value}if(other!==undefined){if(result===undefined){return other}if(typeof value=="string"||typeof other=="string"){value=baseToString(value);other=baseToString(other)}else{value=baseToNumber(value);other=baseToNumber(other)}result=operator(value,other)}return result}}function createOver(arrayFunc){return flatRest(function(iteratees){iteratees=arrayMap(iteratees,baseUnary(getIteratee()));return baseRest(function(args){var thisArg=this;return arrayFunc(iteratees,function(iteratee){return apply(iteratee,thisArg,args)})})})}function createPadding(length,chars){chars=chars===undefined?" ":baseToString(chars);var charsLength=chars.length;if(charsLength<2){return charsLength?baseRepeat(chars,length):chars}var result=baseRepeat(chars,nativeCeil(length/stringSize(chars)));return hasUnicode(chars)?castSlice(stringToArray(result),0,length).join(""):result.slice(0,length)}function createPartial(func,bitmask,thisArg,partials){var isBind=bitmask&WRAP_BIND_FLAG,Ctor=createCtor(func);function wrapper(){var argsIndex=-1,argsLength=arguments.length,leftIndex=-1,leftLength=partials.length,args=Array(leftLength+argsLength),fn=this&&this!==root&&this instanceof wrapper?Ctor:func;while(++leftIndex<leftLength){args[leftIndex]=partials[leftIndex]}while(argsLength--){args[leftIndex++]=arguments[++argsIndex]}return apply(fn,isBind?thisArg:this,args)}return wrapper}function createRange(fromRight){return function(start,end,step){if(step&&typeof step!="number"&&isIterateeCall(start,end,step)){end=step=undefined}start=toFinite(start);if(end===undefined){end=start;start=0}else{end=toFinite(end)}step=step===undefined?start<end?1:-1:toFinite(step);return baseRange(start,end,step,fromRight)}}function createRelationalOperation(operator){return function(value,other){if(!(typeof value=="string"&&typeof other=="string")){value=toNumber(value);other=toNumber(other)}return operator(value,other)}}function createRecurry(func,bitmask,wrapFunc,placeholder,thisArg,partials,holders,argPos,ary,arity){var isCurry=bitmask&WRAP_CURRY_FLAG,newHolders=isCurry?holders:undefined,newHoldersRight=isCurry?undefined:holders,newPartials=isCurry?partials:undefined,newPartialsRight=isCurry?undefined:partials;bitmask|=isCurry?WRAP_PARTIAL_FLAG:WRAP_PARTIAL_RIGHT_FLAG;bitmask&=~(isCurry?WRAP_PARTIAL_RIGHT_FLAG:WRAP_PARTIAL_FLAG);if(!(bitmask&WRAP_CURRY_BOUND_FLAG)){bitmask&=~(WRAP_BIND_FLAG|WRAP_BIND_KEY_FLAG)}var newData=[func,bitmask,thisArg,newPartials,newHolders,newPartialsRight,newHoldersRight,argPos,ary,arity];var result=wrapFunc.apply(undefined,newData);if(isLaziable(func)){setData(result,newData)}result.placeholder=placeholder;return setWrapToString(result,func,bitmask)}function createRound(methodName){var func=Math[methodName];return function(number,precision){number=toNumber(number);precision=precision==null?0:nativeMin(toInteger(precision),292);if(precision){var pair=(toString(number)+"e").split("e"),value=func(pair[0]+"e"+(+pair[1]+precision));pair=(toString(value)+"e").split("e");return+(pair[0]+"e"+(+pair[1]-precision))}return func(number)}}var createSet=!(Set&&1/setToArray(new Set([,-0]))[1]==INFINITY)?noop:function(values){return new Set(values)};function createToPairs(keysFunc){return function(object){var tag=getTag(object);if(tag==mapTag){return mapToArray(object)}if(tag==setTag){return setToPairs(object)}return baseToPairs(object,keysFunc(object))}}function createWrap(func,bitmask,thisArg,partials,holders,argPos,ary,arity){var isBindKey=bitmask&WRAP_BIND_KEY_FLAG;if(!isBindKey&&typeof func!="function"){throw new TypeError(FUNC_ERROR_TEXT)}var length=partials?partials.length:0;if(!length){bitmask&=~(WRAP_PARTIAL_FLAG|WRAP_PARTIAL_RIGHT_FLAG);partials=holders=undefined}ary=ary===undefined?ary:nativeMax(toInteger(ary),0);arity=arity===undefined?arity:toInteger(arity);length-=holders?holders.length:0;if(bitmask&WRAP_PARTIAL_RIGHT_FLAG){var partialsRight=partials,holdersRight=holders;partials=holders=undefined}var data=isBindKey?undefined:getData(func);var newData=[func,bitmask,thisArg,partials,holders,partialsRight,holdersRight,argPos,ary,arity];if(data){mergeData(newData,data)}func=newData[0];bitmask=newData[1];thisArg=newData[2];partials=newData[3];holders=newData[4];arity=newData[9]=newData[9]===undefined?isBindKey?0:func.length:nativeMax(newData[9]-length,0);if(!arity&&bitmask&(WRAP_CURRY_FLAG|WRAP_CURRY_RIGHT_FLAG)){bitmask&=~(WRAP_CURRY_FLAG|WRAP_CURRY_RIGHT_FLAG)}if(!bitmask||bitmask==WRAP_BIND_FLAG){var result=createBind(func,bitmask,thisArg)}else if(bitmask==WRAP_CURRY_FLAG||bitmask==WRAP_CURRY_RIGHT_FLAG){result=createCurry(func,bitmask,arity)}else if((bitmask==WRAP_PARTIAL_FLAG||bitmask==(WRAP_BIND_FLAG|WRAP_PARTIAL_FLAG))&&!holders.length){result=createPartial(func,bitmask,thisArg,partials)}else{result=createHybrid.apply(undefined,newData)}var setter=data?baseSetData:setData;return setWrapToString(setter(result,newData),func,bitmask)}function customDefaultsAssignIn(objValue,srcValue,key,object){if(objValue===undefined||eq(objValue,objectProto[key])&&!hasOwnProperty.call(object,key)){return srcValue}return objValue}function customDefaultsMerge(objValue,srcValue,key,object,source,stack){if(isObject(objValue)&&isObject(srcValue)){stack.set(srcValue,objValue);baseMerge(objValue,srcValue,undefined,customDefaultsMerge,stack);stack["delete"](srcValue)}return objValue}function customOmitClone(value){return isPlainObject(value)?undefined:value}function equalArrays(array,other,bitmask,customizer,equalFunc,stack){var isPartial=bitmask&COMPARE_PARTIAL_FLAG,arrLength=array.length,othLength=other.length;if(arrLength!=othLength&&!(isPartial&&othLength>arrLength)){return false}var stacked=stack.get(array);if(stacked&&stack.get(other)){return stacked==other}var index=-1,result=true,seen=bitmask&COMPARE_UNORDERED_FLAG?new SetCache:undefined;stack.set(array,other);stack.set(other,array);while(++index<arrLength){var arrValue=array[index],othValue=other[index];if(customizer){var compared=isPartial?customizer(othValue,arrValue,index,other,array,stack):customizer(arrValue,othValue,index,array,other,stack)}if(compared!==undefined){if(compared){continue}result=false;break}if(seen){if(!arraySome(other,function(othValue,othIndex){if(!cacheHas(seen,othIndex)&&(arrValue===othValue||equalFunc(arrValue,othValue,bitmask,customizer,stack))){return seen.push(othIndex)}})){result=false;break}}else if(!(arrValue===othValue||equalFunc(arrValue,othValue,bitmask,customizer,stack))){result=false;break}}stack["delete"](array);stack["delete"](other);return result}function equalByTag(object,other,tag,bitmask,customizer,equalFunc,stack){switch(tag){case dataViewTag:if(object.byteLength!=other.byteLength||object.byteOffset!=other.byteOffset){return false}object=object.buffer;other=other.buffer;case arrayBufferTag:if(object.byteLength!=other.byteLength||!equalFunc(new Uint8Array(object),new Uint8Array(other))){return false}return true;case boolTag:case dateTag:case numberTag:return eq(+object,+other);case errorTag:return object.name==other.name&&object.message==other.message;case regexpTag:case stringTag:return object==other+"";case mapTag:var convert=mapToArray;case setTag:var isPartial=bitmask&COMPARE_PARTIAL_FLAG;convert||(convert=setToArray);if(object.size!=other.size&&!isPartial){return false}var stacked=stack.get(object);if(stacked){return stacked==other}bitmask|=COMPARE_UNORDERED_FLAG;stack.set(object,other);var result=equalArrays(convert(object),convert(other),bitmask,customizer,equalFunc,stack);stack["delete"](object);return result;case symbolTag:if(symbolValueOf){return symbolValueOf.call(object)==symbolValueOf.call(other)}}return false}function equalObjects(object,other,bitmask,customizer,equalFunc,stack){var isPartial=bitmask&COMPARE_PARTIAL_FLAG,objProps=getAllKeys(object),objLength=objProps.length,othProps=getAllKeys(other),othLength=othProps.length;if(objLength!=othLength&&!isPartial){return false}var index=objLength;while(index--){var key=objProps[index];if(!(isPartial?key in other:hasOwnProperty.call(other,key))){return false}}var stacked=stack.get(object);if(stacked&&stack.get(other)){return stacked==other}var result=true;stack.set(object,other);stack.set(other,object);var skipCtor=isPartial;while(++index<objLength){key=objProps[index];var objValue=object[key],othValue=other[key];if(customizer){var compared=isPartial?customizer(othValue,objValue,key,other,object,stack):customizer(objValue,othValue,key,object,other,stack)}if(!(compared===undefined?objValue===othValue||equalFunc(objValue,othValue,bitmask,customizer,stack):compared)){result=false;break}skipCtor||(skipCtor=key=="constructor")}if(result&&!skipCtor){var objCtor=object.constructor,othCtor=other.constructor;if(objCtor!=othCtor&&("constructor"in object&&"constructor"in other)&&!(typeof objCtor=="function"&&objCtor instanceof objCtor&&typeof othCtor=="function"&&othCtor instanceof othCtor)){result=false}}stack["delete"](object);stack["delete"](other);return result}function flatRest(func){return setToString(overRest(func,undefined,flatten),func+"")}function getAllKeys(object){return baseGetAllKeys(object,keys,getSymbols)}function getAllKeysIn(object){return baseGetAllKeys(object,keysIn,getSymbolsIn)}var getData=!metaMap?noop:function(func){return metaMap.get(func)};function getFuncName(func){var result=func.name+"",array=realNames[result],length=hasOwnProperty.call(realNames,result)?array.length:0;while(length--){var data=array[length],otherFunc=data.func;if(otherFunc==null||otherFunc==func){return data.name}}return result}function getHolder(func){var object=hasOwnProperty.call(lodash,"placeholder")?lodash:func;return object.placeholder}function getIteratee(){var result=lodash.iteratee||iteratee;result=result===iteratee?baseIteratee:result;return arguments.length?result(arguments[0],arguments[1]):result}function getMapData(map,key){var data=map.__data__;return isKeyable(key)?data[typeof key=="string"?"string":"hash"]:data.map}function getMatchData(object){var result=keys(object),length=result.length;while(length--){var key=result[length],value=object[key];result[length]=[key,value,isStrictComparable(value)]}return result}function getNative(object,key){var value=getValue(object,key);return baseIsNative(value)?value:undefined}function getRawTag(value){var isOwn=hasOwnProperty.call(value,symToStringTag),tag=value[symToStringTag];try{value[symToStringTag]=undefined;var unmasked=true}catch(e){}var result=nativeObjectToString.call(value);if(unmasked){if(isOwn){value[symToStringTag]=tag}else{delete value[symToStringTag]}}return result}var getSymbols=!nativeGetSymbols?stubArray:function(object){if(object==null){return[]}object=Object(object);return arrayFilter(nativeGetSymbols(object),function(symbol){return propertyIsEnumerable.call(object,symbol)})};var getSymbolsIn=!nativeGetSymbols?stubArray:function(object){var result=[];while(object){arrayPush(result,getSymbols(object));object=getPrototype(object)}return result};var getTag=baseGetTag;if(DataView&&getTag(new DataView(new ArrayBuffer(1)))!=dataViewTag||Map&&getTag(new Map)!=mapTag||Promise&&getTag(Promise.resolve())!=promiseTag||Set&&getTag(new Set)!=setTag||WeakMap&&getTag(new WeakMap)!=weakMapTag){getTag=function(value){var result=baseGetTag(value),Ctor=result==objectTag?value.constructor:undefined,ctorString=Ctor?toSource(Ctor):"";if(ctorString){switch(ctorString){case dataViewCtorString:return dataViewTag;case mapCtorString:return mapTag;case promiseCtorString:return promiseTag;case setCtorString:return setTag;case weakMapCtorString:return weakMapTag}}return result}}function getView(start,end,transforms){var index=-1,length=transforms.length;while(++index<length){var data=transforms[index],size=data.size;switch(data.type){case"drop":start+=size;break;case"dropRight":end-=size;break;case"take":end=nativeMin(end,start+size);break;case"takeRight":start=nativeMax(start,end-size);break}}return{start:start,end:end}}function getWrapDetails(source){var match=source.match(reWrapDetails);return match?match[1].split(reSplitDetails):[]}function hasPath(object,path,hasFunc){path=castPath(path,object);var index=-1,length=path.length,result=false;while(++index<length){var key=toKey(path[index]);if(!(result=object!=null&&hasFunc(object,key))){break}object=object[key]}if(result||++index!=length){return result}length=object==null?0:object.length;return!!length&&isLength(length)&&isIndex(key,length)&&(isArray(object)||isArguments(object))}function initCloneArray(array){var length=array.length,result=array.constructor(length);if(length&&typeof array[0]=="string"&&hasOwnProperty.call(array,"index")){result.index=array.index;result.input=array.input}return result}function initCloneObject(object){return typeof object.constructor=="function"&&!isPrototype(object)?baseCreate(getPrototype(object)):{}}function initCloneByTag(object,tag,cloneFunc,isDeep){var Ctor=object.constructor;switch(tag){case arrayBufferTag:return cloneArrayBuffer(object);case boolTag:case dateTag:return new Ctor(+object);case dataViewTag:return cloneDataView(object,isDeep);case float32Tag:case float64Tag:case int8Tag:case int16Tag:case int32Tag:case uint8Tag:case uint8ClampedTag:case uint16Tag:case uint32Tag:return cloneTypedArray(object,isDeep);case mapTag:return cloneMap(object,isDeep,cloneFunc);case numberTag:case stringTag:return new Ctor(object);case regexpTag:return cloneRegExp(object);case setTag:return cloneSet(object,isDeep,cloneFunc);case symbolTag:return cloneSymbol(object)}}function insertWrapDetails(source,details){var length=details.length;if(!length){return source}var lastIndex=length-1;details[lastIndex]=(length>1?"& ":"")+details[lastIndex];details=details.join(length>2?", ":" ");return source.replace(reWrapComment,"{\n/* [wrapped with "+details+"] */\n")}function isFlattenable(value){return isArray(value)||isArguments(value)||!!(spreadableSymbol&&value&&value[spreadableSymbol])}function isIndex(value,length){length=length==null?MAX_SAFE_INTEGER:length;return!!length&&(typeof value=="number"||reIsUint.test(value))&&(value>-1&&value%1==0&&value<length)}function isIterateeCall(value,index,object){if(!isObject(object)){return false}var type=typeof index;if(type=="number"?isArrayLike(object)&&isIndex(index,object.length):type=="string"&&index in object){return eq(object[index],value)}return false}function isKey(value,object){if(isArray(value)){return false}var type=typeof value;if(type=="number"||type=="symbol"||type=="boolean"||value==null||isSymbol(value)){return true}return reIsPlainProp.test(value)||!reIsDeepProp.test(value)||object!=null&&value in Object(object)}function isKeyable(value){var type=typeof value;return type=="string"||type=="number"||type=="symbol"||type=="boolean"?value!=="__proto__":value===null}function isLaziable(func){var funcName=getFuncName(func),other=lodash[funcName];if(typeof other!="function"||!(funcName in LazyWrapper.prototype)){return false}if(func===other){return true}var data=getData(other);return!!data&&func===data[0]}function isMasked(func){return!!maskSrcKey&&maskSrcKey in func}var isMaskable=coreJsData?isFunction:stubFalse;function isPrototype(value){var Ctor=value&&value.constructor,proto=typeof Ctor=="function"&&Ctor.prototype||objectProto;return value===proto}function isStrictComparable(value){return value===value&&!isObject(value)}function matchesStrictComparable(key,srcValue){return function(object){if(object==null){return false}return object[key]===srcValue&&(srcValue!==undefined||key in Object(object))}}function memoizeCapped(func){var result=memoize(func,function(key){if(cache.size===MAX_MEMOIZE_SIZE){cache.clear()}return key});var cache=result.cache;return result}function mergeData(data,source){var bitmask=data[1],srcBitmask=source[1],newBitmask=bitmask|srcBitmask,isCommon=newBitmask<(WRAP_BIND_FLAG|WRAP_BIND_KEY_FLAG|WRAP_ARY_FLAG);var isCombo=srcBitmask==WRAP_ARY_FLAG&&bitmask==WRAP_CURRY_FLAG||srcBitmask==WRAP_ARY_FLAG&&bitmask==WRAP_REARG_FLAG&&data[7].length<=source[8]||srcBitmask==(WRAP_ARY_FLAG|WRAP_REARG_FLAG)&&source[7].length<=source[8]&&bitmask==WRAP_CURRY_FLAG;if(!(isCommon||isCombo)){return data}if(srcBitmask&WRAP_BIND_FLAG){data[2]=source[2];newBitmask|=bitmask&WRAP_BIND_FLAG?0:WRAP_CURRY_BOUND_FLAG}var value=source[3];if(value){var partials=data[3];data[3]=partials?composeArgs(partials,value,source[4]):value;data[4]=partials?replaceHolders(data[3],PLACEHOLDER):source[4]}value=source[5];if(value){partials=data[5];data[5]=partials?composeArgsRight(partials,value,source[6]):value;data[6]=partials?replaceHolders(data[5],PLACEHOLDER):source[6]}value=source[7];if(value){data[7]=value}if(srcBitmask&WRAP_ARY_FLAG){data[8]=data[8]==null?source[8]:nativeMin(data[8],source[8])}if(data[9]==null){data[9]=source[9]}data[0]=source[0];data[1]=newBitmask;return data}function nativeKeysIn(object){var result=[];if(object!=null){for(var key in Object(object)){result.push(key)}}return result}function objectToString(value){return nativeObjectToString.call(value)}function overRest(func,start,transform){start=nativeMax(start===undefined?func.length-1:start,0);return function(){var args=arguments,index=-1,length=nativeMax(args.length-start,0),array=Array(length);while(++index<length){array[index]=args[start+index]}index=-1;var otherArgs=Array(start+1);while(++index<start){otherArgs[index]=args[index]}otherArgs[start]=transform(array);return apply(func,this,otherArgs)}}function parent(object,path){return path.length<2?object:baseGet(object,baseSlice(path,0,-1))}function reorder(array,indexes){var arrLength=array.length,length=nativeMin(indexes.length,arrLength),oldArray=copyArray(array);while(length--){var index=indexes[length];array[length]=isIndex(index,arrLength)?oldArray[index]:undefined}return array}var setData=shortOut(baseSetData);var setTimeout=ctxSetTimeout||function(func,wait){return root.setTimeout(func,wait)};var setToString=shortOut(baseSetToString);function setWrapToString(wrapper,reference,bitmask){var source=reference+"";return setToString(wrapper,insertWrapDetails(source,updateWrapDetails(getWrapDetails(source),bitmask)))}function shortOut(func){var count=0,lastCalled=0;return function(){var stamp=nativeNow(),remaining=HOT_SPAN-(stamp-lastCalled);lastCalled=stamp;if(remaining>0){if(++count>=HOT_COUNT){return arguments[0]}}else{count=0}return func.apply(undefined,arguments)}}function shuffleSelf(array,size){var index=-1,length=array.length,lastIndex=length-1;size=size===undefined?length:size;while(++index<size){var rand=baseRandom(index,lastIndex),value=array[rand];array[rand]=array[index];array[index]=value}array.length=size;return array}var stringToPath=memoizeCapped(function(string){var result=[];if(reLeadingDot.test(string)){result.push("")}string.replace(rePropName,function(match,number,quote,string){result.push(quote?string.replace(reEscapeChar,"$1"):number||match)});return result});function toKey(value){if(typeof value=="string"||isSymbol(value)){return value}var result=value+"";return result=="0"&&1/value==-INFINITY?"-0":result}function toSource(func){if(func!=null){try{return funcToString.call(func)}catch(e){}try{return func+""}catch(e){}}return""}function updateWrapDetails(details,bitmask){arrayEach(wrapFlags,function(pair){var value="_."+pair[0];if(bitmask&pair[1]&&!arrayIncludes(details,value)){details.push(value)}});return details.sort()}function wrapperClone(wrapper){if(wrapper instanceof LazyWrapper){return wrapper.clone()}var result=new LodashWrapper(wrapper.__wrapped__,wrapper.__chain__);result.__actions__=copyArray(wrapper.__actions__);result.__index__=wrapper.__index__;result.__values__=wrapper.__values__;return result}function chunk(array,size,guard){if(guard?isIterateeCall(array,size,guard):size===undefined){size=1}else{size=nativeMax(toInteger(size),0)}var length=array==null?0:array.length;if(!length||size<1){return[]}var index=0,resIndex=0,result=Array(nativeCeil(length/size));while(index<length){result[resIndex++]=baseSlice(array,index,index+=size)}return result}function compact(array){var index=-1,length=array==null?0:array.length,resIndex=0,result=[];while(++index<length){var value=array[index];if(value){result[resIndex++]=value}}return result}function concat(){var length=arguments.length;if(!length){return[]}var args=Array(length-1),array=arguments[0],index=length;while(index--){args[index-1]=arguments[index]}return arrayPush(isArray(array)?copyArray(array):[array],baseFlatten(args,1))}var difference=baseRest(function(array,values){return isArrayLikeObject(array)?baseDifference(array,baseFlatten(values,1,isArrayLikeObject,true)):[]});var differenceBy=baseRest(function(array,values){var iteratee=last(values);if(isArrayLikeObject(iteratee)){iteratee=undefined}return isArrayLikeObject(array)?baseDifference(array,baseFlatten(values,1,isArrayLikeObject,true),getIteratee(iteratee,2)):[]});var differenceWith=baseRest(function(array,values){var comparator=last(values);if(isArrayLikeObject(comparator)){comparator=undefined}return isArrayLikeObject(array)?baseDifference(array,baseFlatten(values,1,isArrayLikeObject,true),undefined,comparator):[]});function drop(array,n,guard){var length=array==null?0:array.length;if(!length){return[]}n=guard||n===undefined?1:toInteger(n);return baseSlice(array,n<0?0:n,length)}function dropRight(array,n,guard){var length=array==null?0:array.length;if(!length){return[]}n=guard||n===undefined?1:toInteger(n);n=length-n;return baseSlice(array,0,n<0?0:n)}function dropRightWhile(array,predicate){return array&&array.length?baseWhile(array,getIteratee(predicate,3),true,true):[]}function dropWhile(array,predicate){return array&&array.length?baseWhile(array,getIteratee(predicate,3),true):[]}function fill(array,value,start,end){var length=array==null?0:array.length;if(!length){return[]}if(start&&typeof start!="number"&&isIterateeCall(array,value,start)){start=0;end=length}return baseFill(array,value,start,end)}function findIndex(array,predicate,fromIndex){var length=array==null?0:array.length;if(!length){return-1}var index=fromIndex==null?0:toInteger(fromIndex);if(index<0){index=nativeMax(length+index,0)}return baseFindIndex(array,getIteratee(predicate,3),index)}function findLastIndex(array,predicate,fromIndex){var length=array==null?0:array.length;if(!length){return-1}var index=length-1;if(fromIndex!==undefined){index=toInteger(fromIndex);index=fromIndex<0?nativeMax(length+index,0):nativeMin(index,length-1)}return baseFindIndex(array,getIteratee(predicate,3),index,true)}function flatten(array){var length=array==null?0:array.length;return length?baseFlatten(array,1):[]}function flattenDeep(array){var length=array==null?0:array.length;return length?baseFlatten(array,INFINITY):[]}function flattenDepth(array,depth){var length=array==null?0:array.length;if(!length){return[]}depth=depth===undefined?1:toInteger(depth);return baseFlatten(array,depth)}function fromPairs(pairs){var index=-1,length=pairs==null?0:pairs.length,result={};while(++index<length){var pair=pairs[index];result[pair[0]]=pair[1]}return result}function head(array){return array&&array.length?array[0]:undefined}function indexOf(array,value,fromIndex){var length=array==null?0:array.length;if(!length){return-1}var index=fromIndex==null?0:toInteger(fromIndex);if(index<0){index=nativeMax(length+index,0)}return baseIndexOf(array,value,index)}function initial(array){var length=array==null?0:array.length;return length?baseSlice(array,0,-1):[]}var intersection=baseRest(function(arrays){var mapped=arrayMap(arrays,castArrayLikeObject);return mapped.length&&mapped[0]===arrays[0]?baseIntersection(mapped):[]});var intersectionBy=baseRest(function(arrays){var iteratee=last(arrays),mapped=arrayMap(arrays,castArrayLikeObject);if(iteratee===last(mapped)){iteratee=undefined}else{mapped.pop()}return mapped.length&&mapped[0]===arrays[0]?baseIntersection(mapped,getIteratee(iteratee,2)):[]});var intersectionWith=baseRest(function(arrays){var comparator=last(arrays),mapped=arrayMap(arrays,castArrayLikeObject);comparator=typeof comparator=="function"?comparator:undefined;if(comparator){mapped.pop()}return mapped.length&&mapped[0]===arrays[0]?baseIntersection(mapped,undefined,comparator):[]});function join(array,separator){return array==null?"":nativeJoin.call(array,separator)}function last(array){var length=array==null?0:array.length;return length?array[length-1]:undefined}function lastIndexOf(array,value,fromIndex){var length=array==null?0:array.length;if(!length){return-1}var index=length;if(fromIndex!==undefined){index=toInteger(fromIndex);index=index<0?nativeMax(length+index,0):nativeMin(index,length-1)}return value===value?strictLastIndexOf(array,value,index):baseFindIndex(array,baseIsNaN,index,true)}function nth(array,n){return array&&array.length?baseNth(array,toInteger(n)):undefined}var pull=baseRest(pullAll);function pullAll(array,values){return array&&array.length&&values&&values.length?basePullAll(array,values):array}function pullAllBy(array,values,iteratee){return array&&array.length&&values&&values.length?basePullAll(array,values,getIteratee(iteratee,2)):array}function pullAllWith(array,values,comparator){return array&&array.length&&values&&values.length?basePullAll(array,values,undefined,comparator):array}var pullAt=flatRest(function(array,indexes){var length=array==null?0:array.length,result=baseAt(array,indexes);basePullAt(array,arrayMap(indexes,function(index){return isIndex(index,length)?+index:index}).sort(compareAscending));return result});function remove(array,predicate){var result=[];if(!(array&&array.length)){return result}var index=-1,indexes=[],length=array.length;predicate=getIteratee(predicate,3);while(++index<length){var value=array[index];if(predicate(value,index,array)){result.push(value);indexes.push(index)}}basePullAt(array,indexes);return result}function reverse(array){return array==null?array:nativeReverse.call(array)}function slice(array,start,end){var length=array==null?0:array.length;if(!length){return[]}if(end&&typeof end!="number"&&isIterateeCall(array,start,end)){start=0;end=length}else{start=start==null?0:toInteger(start);end=end===undefined?length:toInteger(end)}return baseSlice(array,start,end)}function sortedIndex(array,value){return baseSortedIndex(array,value)}function sortedIndexBy(array,value,iteratee){return baseSortedIndexBy(array,value,getIteratee(iteratee,2))}function sortedIndexOf(array,value){var length=array==null?0:array.length;if(length){var index=baseSortedIndex(array,value);if(index<length&&eq(array[index],value)){return index}}return-1}function sortedLastIndex(array,value){return baseSortedIndex(array,value,true)}function sortedLastIndexBy(array,value,iteratee){return baseSortedIndexBy(array,value,getIteratee(iteratee,2),true)}function sortedLastIndexOf(array,value){var length=array==null?0:array.length;if(length){var index=baseSortedIndex(array,value,true)-1;if(eq(array[index],value)){return index}}return-1}function sortedUniq(array){return array&&array.length?baseSortedUniq(array):[]}function sortedUniqBy(array,iteratee){return array&&array.length?baseSortedUniq(array,getIteratee(iteratee,2)):[]}function tail(array){var length=array==null?0:array.length;return length?baseSlice(array,1,length):[]}function take(array,n,guard){if(!(array&&array.length)){return[]}n=guard||n===undefined?1:toInteger(n);return baseSlice(array,0,n<0?0:n)}function takeRight(array,n,guard){var length=array==null?0:array.length;if(!length){return[]}n=guard||n===undefined?1:toInteger(n);n=length-n;return baseSlice(array,n<0?0:n,length)}function takeRightWhile(array,predicate){return array&&array.length?baseWhile(array,getIteratee(predicate,3),false,true):[]}function takeWhile(array,predicate){return array&&array.length?baseWhile(array,getIteratee(predicate,3)):[]}var union=baseRest(function(arrays){return baseUniq(baseFlatten(arrays,1,isArrayLikeObject,true))});var unionBy=baseRest(function(arrays){var iteratee=last(arrays);if(isArrayLikeObject(iteratee)){iteratee=undefined}return baseUniq(baseFlatten(arrays,1,isArrayLikeObject,true),getIteratee(iteratee,2))});var unionWith=baseRest(function(arrays){var comparator=last(arrays);comparator=typeof comparator=="function"?comparator:undefined;return baseUniq(baseFlatten(arrays,1,isArrayLikeObject,true),undefined,comparator)});function uniq(array){return array&&array.length?baseUniq(array):[]}function uniqBy(array,iteratee){return array&&array.length?baseUniq(array,getIteratee(iteratee,2)):[]}function uniqWith(array,comparator){comparator=typeof comparator=="function"?comparator:undefined;return array&&array.length?baseUniq(array,undefined,comparator):[]}function unzip(array){if(!(array&&array.length)){return[]}var length=0;array=arrayFilter(array,function(group){if(isArrayLikeObject(group)){length=nativeMax(group.length,length);return true}});return baseTimes(length,function(index){return arrayMap(array,baseProperty(index))})}function unzipWith(array,iteratee){if(!(array&&array.length)){return[]}var result=unzip(array);if(iteratee==null){return result}return arrayMap(result,function(group){return apply(iteratee,undefined,group)})}var without=baseRest(function(array,values){return isArrayLikeObject(array)?baseDifference(array,values):[]});var xor=baseRest(function(arrays){return baseXor(arrayFilter(arrays,isArrayLikeObject))});var xorBy=baseRest(function(arrays){var iteratee=last(arrays);if(isArrayLikeObject(iteratee)){iteratee=undefined}return baseXor(arrayFilter(arrays,isArrayLikeObject),getIteratee(iteratee,2))});var xorWith=baseRest(function(arrays){var comparator=last(arrays);comparator=typeof comparator=="function"?comparator:undefined;return baseXor(arrayFilter(arrays,isArrayLikeObject),undefined,comparator)});var zip=baseRest(unzip);function zipObject(props,values){return baseZipObject(props||[],values||[],assignValue)}function zipObjectDeep(props,values){return baseZipObject(props||[],values||[],baseSet)}var zipWith=baseRest(function(arrays){var length=arrays.length,iteratee=length>1?arrays[length-1]:undefined;iteratee=typeof iteratee=="function"?(arrays.pop(),iteratee):undefined;return unzipWith(arrays,iteratee)});function chain(value){var result=lodash(value);result.__chain__=true;return result}function tap(value,interceptor){interceptor(value);return value}function thru(value,interceptor){return interceptor(value)}var wrapperAt=flatRest(function(paths){var length=paths.length,start=length?paths[0]:0,value=this.__wrapped__,interceptor=function(object){return baseAt(object,paths)};if(length>1||this.__actions__.length||!(value instanceof LazyWrapper)||!isIndex(start)){return this.thru(interceptor)}value=value.slice(start,+start+(length?1:0));value.__actions__.push({func:thru,args:[interceptor],thisArg:undefined});return new LodashWrapper(value,this.__chain__).thru(function(array){if(length&&!array.length){array.push(undefined)}return array})});function wrapperChain(){return chain(this)}function wrapperCommit(){return new LodashWrapper(this.value(),this.__chain__)}function wrapperNext(){if(this.__values__===undefined){this.__values__=toArray(this.value())}var done=this.__index__>=this.__values__.length,value=done?undefined:this.__values__[this.__index__++];return{done:done,value:value}}function wrapperToIterator(){return this}function wrapperPlant(value){var result,parent=this;while(parent instanceof baseLodash){var clone=wrapperClone(parent);clone.__index__=0;clone.__values__=undefined;if(result){previous.__wrapped__=clone}else{result=clone}var previous=clone;parent=parent.__wrapped__}previous.__wrapped__=value;return result}function wrapperReverse(){var value=this.__wrapped__;if(value instanceof LazyWrapper){var wrapped=value;if(this.__actions__.length){wrapped=new LazyWrapper(this)}wrapped=wrapped.reverse();wrapped.__actions__.push({func:thru,args:[reverse],thisArg:undefined});return new LodashWrapper(wrapped,this.__chain__)}return this.thru(reverse)}function wrapperValue(){return baseWrapperValue(this.__wrapped__,this.__actions__)}var countBy=createAggregator(function(result,value,key){if(hasOwnProperty.call(result,key)){++result[key]}else{baseAssignValue(result,key,1)}});function every(collection,predicate,guard){var func=isArray(collection)?arrayEvery:baseEvery;if(guard&&isIterateeCall(collection,predicate,guard)){predicate=undefined}return func(collection,getIteratee(predicate,3))}function filter(collection,predicate){var func=isArray(collection)?arrayFilter:baseFilter;return func(collection,getIteratee(predicate,3))}var find=createFind(findIndex);var findLast=createFind(findLastIndex);function flatMap(collection,iteratee){return baseFlatten(map(collection,iteratee),1)}function flatMapDeep(collection,iteratee){return baseFlatten(map(collection,iteratee),INFINITY)}function flatMapDepth(collection,iteratee,depth){depth=depth===undefined?1:toInteger(depth);return baseFlatten(map(collection,iteratee),depth)}function forEach(collection,iteratee){var func=isArray(collection)?arrayEach:baseEach;return func(collection,getIteratee(iteratee,3))}function forEachRight(collection,iteratee){var func=isArray(collection)?arrayEachRight:baseEachRight;return func(collection,getIteratee(iteratee,3))}var groupBy=createAggregator(function(result,value,key){if(hasOwnProperty.call(result,key)){result[key].push(value)}else{baseAssignValue(result,key,[value])}});function includes(collection,value,fromIndex,guard){collection=isArrayLike(collection)?collection:values(collection);fromIndex=fromIndex&&!guard?toInteger(fromIndex):0;var length=collection.length;if(fromIndex<0){fromIndex=nativeMax(length+fromIndex,0)}return isString(collection)?fromIndex<=length&&collection.indexOf(value,fromIndex)>-1:!!length&&baseIndexOf(collection,value,fromIndex)>-1}var invokeMap=baseRest(function(collection,path,args){var index=-1,isFunc=typeof path=="function",result=isArrayLike(collection)?Array(collection.length):[];baseEach(collection,function(value){result[++index]=isFunc?apply(path,value,args):baseInvoke(value,path,args)});return result});var keyBy=createAggregator(function(result,value,key){baseAssignValue(result,key,value)});function map(collection,iteratee){var func=isArray(collection)?arrayMap:baseMap;return func(collection,getIteratee(iteratee,3))}function orderBy(collection,iteratees,orders,guard){if(collection==null){return[]}if(!isArray(iteratees)){iteratees=iteratees==null?[]:[iteratees]}orders=guard?undefined:orders;if(!isArray(orders)){orders=orders==null?[]:[orders]}return baseOrderBy(collection,iteratees,orders)}var partition=createAggregator(function(result,value,key){result[key?0:1].push(value)},function(){return[[],[]]});function reduce(collection,iteratee,accumulator){var func=isArray(collection)?arrayReduce:baseReduce,initAccum=arguments.length<3;return func(collection,getIteratee(iteratee,4),accumulator,initAccum,baseEach)}function reduceRight(collection,iteratee,accumulator){var func=isArray(collection)?arrayReduceRight:baseReduce,initAccum=arguments.length<3;return func(collection,getIteratee(iteratee,4),accumulator,initAccum,baseEachRight)}function reject(collection,predicate){var func=isArray(collection)?arrayFilter:baseFilter;return func(collection,negate(getIteratee(predicate,3)))}function sample(collection){var func=isArray(collection)?arraySample:baseSample;return func(collection)}function sampleSize(collection,n,guard){if(guard?isIterateeCall(collection,n,guard):n===undefined){n=1}else{n=toInteger(n)}var func=isArray(collection)?arraySampleSize:baseSampleSize;return func(collection,n)}function shuffle(collection){var func=isArray(collection)?arrayShuffle:baseShuffle;return func(collection)}function size(collection){if(collection==null){return 0}if(isArrayLike(collection)){return isString(collection)?stringSize(collection):collection.length}var tag=getTag(collection);if(tag==mapTag||tag==setTag){return collection.size}return baseKeys(collection).length}function some(collection,predicate,guard){var func=isArray(collection)?arraySome:baseSome;if(guard&&isIterateeCall(collection,predicate,guard)){predicate=undefined}return func(collection,getIteratee(predicate,3))}var sortBy=baseRest(function(collection,iteratees){if(collection==null){return[]}var length=iteratees.length;if(length>1&&isIterateeCall(collection,iteratees[0],iteratees[1])){iteratees=[]}else if(length>2&&isIterateeCall(iteratees[0],iteratees[1],iteratees[2])){iteratees=[iteratees[0]]}return baseOrderBy(collection,baseFlatten(iteratees,1),[])});var now=ctxNow||function(){return root.Date.now()};function after(n,func){if(typeof func!="function"){throw new TypeError(FUNC_ERROR_TEXT)}n=toInteger(n);return function(){if(--n<1){return func.apply(this,arguments)}}}function ary(func,n,guard){n=guard?undefined:n;n=func&&n==null?func.length:n;return createWrap(func,WRAP_ARY_FLAG,undefined,undefined,undefined,undefined,n)}function before(n,func){var result;if(typeof func!="function"){throw new TypeError(FUNC_ERROR_TEXT)}n=toInteger(n);return function(){if(--n>0){result=func.apply(this,arguments)}if(n<=1){func=undefined}return result}}var bind=baseRest(function(func,thisArg,partials){var bitmask=WRAP_BIND_FLAG;if(partials.length){var holders=replaceHolders(partials,getHolder(bind));bitmask|=WRAP_PARTIAL_FLAG}return createWrap(func,bitmask,thisArg,partials,holders)});var bindKey=baseRest(function(object,key,partials){var bitmask=WRAP_BIND_FLAG|WRAP_BIND_KEY_FLAG;if(partials.length){var holders=replaceHolders(partials,getHolder(bindKey));bitmask|=WRAP_PARTIAL_FLAG}return createWrap(key,bitmask,object,partials,holders)});function curry(func,arity,guard){arity=guard?undefined:arity;var result=createWrap(func,WRAP_CURRY_FLAG,undefined,undefined,undefined,undefined,undefined,arity);result.placeholder=curry.placeholder;return result}function curryRight(func,arity,guard){arity=guard?undefined:arity;var result=createWrap(func,WRAP_CURRY_RIGHT_FLAG,undefined,undefined,undefined,undefined,undefined,arity);result.placeholder=curryRight.placeholder;return result}function debounce(func,wait,options){var lastArgs,lastThis,maxWait,result,timerId,lastCallTime,lastInvokeTime=0,leading=false,maxing=false,trailing=true;if(typeof func!="function"){throw new TypeError(FUNC_ERROR_TEXT)}wait=toNumber(wait)||0;if(isObject(options)){leading=!!options.leading;maxing="maxWait"in options;maxWait=maxing?nativeMax(toNumber(options.maxWait)||0,wait):maxWait;trailing="trailing"in options?!!options.trailing:trailing}function invokeFunc(time){var args=lastArgs,thisArg=lastThis;lastArgs=lastThis=undefined;lastInvokeTime=time;result=func.apply(thisArg,args);return result}function leadingEdge(time){lastInvokeTime=time;timerId=setTimeout(timerExpired,wait);return leading?invokeFunc(time):result}function remainingWait(time){var timeSinceLastCall=time-lastCallTime,timeSinceLastInvoke=time-lastInvokeTime,result=wait-timeSinceLastCall;return maxing?nativeMin(result,maxWait-timeSinceLastInvoke):result}function shouldInvoke(time){var timeSinceLastCall=time-lastCallTime,timeSinceLastInvoke=time-lastInvokeTime;return lastCallTime===undefined||timeSinceLastCall>=wait||timeSinceLastCall<0||maxing&&timeSinceLastInvoke>=maxWait}function timerExpired(){var time=now();if(shouldInvoke(time)){return trailingEdge(time)}timerId=setTimeout(timerExpired,remainingWait(time))}function trailingEdge(time){timerId=undefined;if(trailing&&lastArgs){return invokeFunc(time)}lastArgs=lastThis=undefined;return result}function cancel(){if(timerId!==undefined){clearTimeout(timerId)}lastInvokeTime=0;lastArgs=lastCallTime=lastThis=timerId=undefined}function flush(){return timerId===undefined?result:trailingEdge(now())}function debounced(){var time=now(),isInvoking=shouldInvoke(time);lastArgs=arguments;lastThis=this;lastCallTime=time;if(isInvoking){if(timerId===undefined){return leadingEdge(lastCallTime)}if(maxing){timerId=setTimeout(timerExpired,wait);return invokeFunc(lastCallTime)}}if(timerId===undefined){timerId=setTimeout(timerExpired,wait)}return result}debounced.cancel=cancel;debounced.flush=flush;return debounced}var defer=baseRest(function(func,args){return baseDelay(func,1,args)});var delay=baseRest(function(func,wait,args){return baseDelay(func,toNumber(wait)||0,args)});function flip(func){return createWrap(func,WRAP_FLIP_FLAG)}function memoize(func,resolver){if(typeof func!="function"||resolver!=null&&typeof resolver!="function"){throw new TypeError(FUNC_ERROR_TEXT)}var memoized=function(){var args=arguments,key=resolver?resolver.apply(this,args):args[0],cache=memoized.cache;if(cache.has(key)){return cache.get(key)}var result=func.apply(this,args);memoized.cache=cache.set(key,result)||cache;return result};memoized.cache=new(memoize.Cache||MapCache);return memoized}memoize.Cache=MapCache;function negate(predicate){if(typeof predicate!="function"){throw new TypeError(FUNC_ERROR_TEXT)}return function(){var args=arguments;switch(args.length){case 0:return!predicate.call(this);case 1:return!predicate.call(this,args[0]);case 2:return!predicate.call(this,args[0],args[1]);case 3:return!predicate.call(this,args[0],args[1],args[2])}return!predicate.apply(this,args)}}function once(func){return before(2,func)}var overArgs=castRest(function(func,transforms){transforms=transforms.length==1&&isArray(transforms[0])?arrayMap(transforms[0],baseUnary(getIteratee())):arrayMap(baseFlatten(transforms,1),baseUnary(getIteratee()));var funcsLength=transforms.length;return baseRest(function(args){var index=-1,length=nativeMin(args.length,funcsLength);while(++index<length){args[index]=transforms[index].call(this,args[index])}return apply(func,this,args)})});var partial=baseRest(function(func,partials){var holders=replaceHolders(partials,getHolder(partial));return createWrap(func,WRAP_PARTIAL_FLAG,undefined,partials,holders)});var partialRight=baseRest(function(func,partials){var holders=replaceHolders(partials,getHolder(partialRight));return createWrap(func,WRAP_PARTIAL_RIGHT_FLAG,undefined,partials,holders)});var rearg=flatRest(function(func,indexes){return createWrap(func,WRAP_REARG_FLAG,undefined,undefined,undefined,indexes)});function rest(func,start){if(typeof func!="function"){throw new TypeError(FUNC_ERROR_TEXT)}start=start===undefined?start:toInteger(start);return baseRest(func,start)}function spread(func,start){if(typeof func!="function"){throw new TypeError(FUNC_ERROR_TEXT)}start=start==null?0:nativeMax(toInteger(start),0);return baseRest(function(args){var array=args[start],otherArgs=castSlice(args,0,start);if(array){arrayPush(otherArgs,array)}return apply(func,this,otherArgs)})}function throttle(func,wait,options){var leading=true,trailing=true;if(typeof func!="function"){throw new TypeError(FUNC_ERROR_TEXT)}if(isObject(options)){leading="leading"in options?!!options.leading:leading;trailing="trailing"in options?!!options.trailing:trailing}return debounce(func,wait,{leading:leading,maxWait:wait,trailing:trailing})}function unary(func){return ary(func,1)}function wrap(value,wrapper){return partial(castFunction(wrapper),value)}function castArray(){if(!arguments.length){return[]}var value=arguments[0];return isArray(value)?value:[value]}function clone(value){return baseClone(value,CLONE_SYMBOLS_FLAG)}function cloneWith(value,customizer){customizer=typeof customizer=="function"?customizer:undefined;return baseClone(value,CLONE_SYMBOLS_FLAG,customizer)}function cloneDeep(value){return baseClone(value,CLONE_DEEP_FLAG|CLONE_SYMBOLS_FLAG)}function cloneDeepWith(value,customizer){customizer=typeof customizer=="function"?customizer:undefined;return baseClone(value,CLONE_DEEP_FLAG|CLONE_SYMBOLS_FLAG,customizer)}function conformsTo(object,source){return source==null||baseConformsTo(object,source,keys(source))}function eq(value,other){return value===other||value!==value&&other!==other}var gt=createRelationalOperation(baseGt);var gte=createRelationalOperation(function(value,other){return value>=other});var isArguments=baseIsArguments(function(){return arguments}())?baseIsArguments:function(value){return isObjectLike(value)&&hasOwnProperty.call(value,"callee")&&!propertyIsEnumerable.call(value,"callee")};var isArray=Array.isArray;var isArrayBuffer=nodeIsArrayBuffer?baseUnary(nodeIsArrayBuffer):baseIsArrayBuffer;function isArrayLike(value){return value!=null&&isLength(value.length)&&!isFunction(value)}function isArrayLikeObject(value){return isObjectLike(value)&&isArrayLike(value)}function isBoolean(value){return value===true||value===false||isObjectLike(value)&&baseGetTag(value)==boolTag}var isBuffer=nativeIsBuffer||stubFalse;var isDate=nodeIsDate?baseUnary(nodeIsDate):baseIsDate;function isElement(value){return isObjectLike(value)&&value.nodeType===1&&!isPlainObject(value)}function isEmpty(value){if(value==null){return true}if(isArrayLike(value)&&(isArray(value)||typeof value=="string"||typeof value.splice=="function"||isBuffer(value)||isTypedArray(value)||isArguments(value))){return!value.length}var tag=getTag(value);if(tag==mapTag||tag==setTag){return!value.size}if(isPrototype(value)){return!baseKeys(value).length}for(var key in value){if(hasOwnProperty.call(value,key)){return false}}return true}function isEqual(value,other){return baseIsEqual(value,other)}function isEqualWith(value,other,customizer){customizer=typeof customizer=="function"?customizer:undefined;var result=customizer?customizer(value,other):undefined;return result===undefined?baseIsEqual(value,other,undefined,customizer):!!result}function isError(value){if(!isObjectLike(value)){return false}var tag=baseGetTag(value);return tag==errorTag||tag==domExcTag||typeof value.message=="string"&&typeof value.name=="string"&&!isPlainObject(value)}function isFinite(value){return typeof value=="number"&&nativeIsFinite(value)}function isFunction(value){if(!isObject(value)){return false}var tag=baseGetTag(value);return tag==funcTag||tag==genTag||tag==asyncTag||tag==proxyTag}function isInteger(value){return typeof value=="number"&&value==toInteger(value)}function isLength(value){return typeof value=="number"&&value>-1&&value%1==0&&value<=MAX_SAFE_INTEGER}function isObject(value){var type=typeof value;return value!=null&&(type=="object"||type=="function")}function isObjectLike(value){return value!=null&&typeof value=="object"}var isMap=nodeIsMap?baseUnary(nodeIsMap):baseIsMap;function isMatch(object,source){return object===source||baseIsMatch(object,source,getMatchData(source))}function isMatchWith(object,source,customizer){customizer=typeof customizer=="function"?customizer:undefined;return baseIsMatch(object,source,getMatchData(source),customizer)}function isNaN(value){return isNumber(value)&&value!=+value}function isNative(value){if(isMaskable(value)){throw new Error(CORE_ERROR_TEXT)}return baseIsNative(value)}function isNull(value){return value===null}function isNil(value){return value==null}function isNumber(value){return typeof value=="number"||isObjectLike(value)&&baseGetTag(value)==numberTag}function isPlainObject(value){if(!isObjectLike(value)||baseGetTag(value)!=objectTag){return false}var proto=getPrototype(value);if(proto===null){return true}var Ctor=hasOwnProperty.call(proto,"constructor")&&proto.constructor;return typeof Ctor=="function"&&Ctor instanceof Ctor&&funcToString.call(Ctor)==objectCtorString}var isRegExp=nodeIsRegExp?baseUnary(nodeIsRegExp):baseIsRegExp;function isSafeInteger(value){return isInteger(value)&&value>=-MAX_SAFE_INTEGER&&value<=MAX_SAFE_INTEGER}var isSet=nodeIsSet?baseUnary(nodeIsSet):baseIsSet;function isString(value){return typeof value=="string"||!isArray(value)&&isObjectLike(value)&&baseGetTag(value)==stringTag}function isSymbol(value){return typeof value=="symbol"||isObjectLike(value)&&baseGetTag(value)==symbolTag}var isTypedArray=nodeIsTypedArray?baseUnary(nodeIsTypedArray):baseIsTypedArray;function isUndefined(value){return value===undefined}function isWeakMap(value){return isObjectLike(value)&&getTag(value)==weakMapTag}function isWeakSet(value){return isObjectLike(value)&&baseGetTag(value)==weakSetTag}var lt=createRelationalOperation(baseLt);var lte=createRelationalOperation(function(value,other){return value<=other});function toArray(value){if(!value){return[]}if(isArrayLike(value)){return isString(value)?stringToArray(value):copyArray(value)}if(symIterator&&value[symIterator]){return iteratorToArray(value[symIterator]())}var tag=getTag(value),func=tag==mapTag?mapToArray:tag==setTag?setToArray:values;return func(value)}function toFinite(value){if(!value){return value===0?value:0}value=toNumber(value);if(value===INFINITY||value===-INFINITY){var sign=value<0?-1:1;return sign*MAX_INTEGER}return value===value?value:0}function toInteger(value){var result=toFinite(value),remainder=result%1;return result===result?remainder?result-remainder:result:0}function toLength(value){return value?baseClamp(toInteger(value),0,MAX_ARRAY_LENGTH):0}function toNumber(value){if(typeof value=="number"){return value}if(isSymbol(value)){return NAN}if(isObject(value)){var other=typeof value.valueOf=="function"?value.valueOf():value;value=isObject(other)?other+"":other}if(typeof value!="string"){return value===0?value:+value}value=value.replace(reTrim,"");var isBinary=reIsBinary.test(value);return isBinary||reIsOctal.test(value)?freeParseInt(value.slice(2),isBinary?2:8):reIsBadHex.test(value)?NAN:+value}function toPlainObject(value){return copyObject(value,keysIn(value))}function toSafeInteger(value){return value?baseClamp(toInteger(value),-MAX_SAFE_INTEGER,MAX_SAFE_INTEGER):value===0?value:0}function toString(value){return value==null?"":baseToString(value)}var assign=createAssigner(function(object,source){if(isPrototype(source)||isArrayLike(source)){copyObject(source,keys(source),object);return}for(var key in source){if(hasOwnProperty.call(source,key)){assignValue(object,key,source[key])}}});var assignIn=createAssigner(function(object,source){copyObject(source,keysIn(source),object)});var assignInWith=createAssigner(function(object,source,srcIndex,customizer){copyObject(source,keysIn(source),object,customizer)});var assignWith=createAssigner(function(object,source,srcIndex,customizer){copyObject(source,keys(source),object,customizer)});var at=flatRest(baseAt);function create(prototype,properties){var result=baseCreate(prototype);return properties==null?result:baseAssign(result,properties)}var defaults=baseRest(function(args){args.push(undefined,customDefaultsAssignIn);return apply(assignInWith,undefined,args)});var defaultsDeep=baseRest(function(args){args.push(undefined,customDefaultsMerge);return apply(mergeWith,undefined,args)});function findKey(object,predicate){return baseFindKey(object,getIteratee(predicate,3),baseForOwn)}function findLastKey(object,predicate){return baseFindKey(object,getIteratee(predicate,3),baseForOwnRight)}function forIn(object,iteratee){return object==null?object:baseFor(object,getIteratee(iteratee,3),keysIn)}function forInRight(object,iteratee){return object==null?object:baseForRight(object,getIteratee(iteratee,3),keysIn)}function forOwn(object,iteratee){return object&&baseForOwn(object,getIteratee(iteratee,3))}function forOwnRight(object,iteratee){return object&&baseForOwnRight(object,getIteratee(iteratee,3))}function functions(object){return object==null?[]:baseFunctions(object,keys(object))}function functionsIn(object){return object==null?[]:baseFunctions(object,keysIn(object))}function get(object,path,defaultValue){var result=object==null?undefined:baseGet(object,path);return result===undefined?defaultValue:result}function has(object,path){return object!=null&&hasPath(object,path,baseHas)}function hasIn(object,path){return object!=null&&hasPath(object,path,baseHasIn)}var invert=createInverter(function(result,value,key){result[value]=key},constant(identity));var invertBy=createInverter(function(result,value,key){if(hasOwnProperty.call(result,value)){result[value].push(key)}else{result[value]=[key]}},getIteratee);var invoke=baseRest(baseInvoke);function keys(object){return isArrayLike(object)?arrayLikeKeys(object):baseKeys(object)}function keysIn(object){return isArrayLike(object)?arrayLikeKeys(object,true):baseKeysIn(object)}function mapKeys(object,iteratee){var result={};iteratee=getIteratee(iteratee,3);baseForOwn(object,function(value,key,object){baseAssignValue(result,iteratee(value,key,object),value)});return result}function mapValues(object,iteratee){var result={};iteratee=getIteratee(iteratee,3);baseForOwn(object,function(value,key,object){baseAssignValue(result,key,iteratee(value,key,object))});return result}var merge=createAssigner(function(object,source,srcIndex){baseMerge(object,source,srcIndex)});var mergeWith=createAssigner(function(object,source,srcIndex,customizer){baseMerge(object,source,srcIndex,customizer)});var omit=flatRest(function(object,paths){var result={};if(object==null){return result}var isDeep=false;paths=arrayMap(paths,function(path){path=castPath(path,object);isDeep||(isDeep=path.length>1);return path});copyObject(object,getAllKeysIn(object),result);if(isDeep){result=baseClone(result,CLONE_DEEP_FLAG|CLONE_FLAT_FLAG|CLONE_SYMBOLS_FLAG,customOmitClone)}var length=paths.length;while(length--){baseUnset(result,paths[length])}return result});function omitBy(object,predicate){return pickBy(object,negate(getIteratee(predicate)))}var pick=flatRest(function(object,paths){return object==null?{}:basePick(object,paths)});function pickBy(object,predicate){if(object==null){return{}}var props=arrayMap(getAllKeysIn(object),function(prop){return[prop]});predicate=getIteratee(predicate);return basePickBy(object,props,function(value,path){return predicate(value,path[0])})}function result(object,path,defaultValue){path=castPath(path,object);var index=-1,length=path.length;if(!length){length=1;object=undefined}while(++index<length){var value=object==null?undefined:object[toKey(path[index])];if(value===undefined){index=length;value=defaultValue}object=isFunction(value)?value.call(object):value}return object}function set(object,path,value){return object==null?object:baseSet(object,path,value)}function setWith(object,path,value,customizer){customizer=typeof customizer=="function"?customizer:undefined;return object==null?object:baseSet(object,path,value,customizer)}var toPairs=createToPairs(keys);var toPairsIn=createToPairs(keysIn);function transform(object,iteratee,accumulator){var isArr=isArray(object),isArrLike=isArr||isBuffer(object)||isTypedArray(object);iteratee=getIteratee(iteratee,4);if(accumulator==null){var Ctor=object&&object.constructor;if(isArrLike){accumulator=isArr?new Ctor:[]}else if(isObject(object)){accumulator=isFunction(Ctor)?baseCreate(getPrototype(object)):{}}else{accumulator={}}}(isArrLike?arrayEach:baseForOwn)(object,function(value,index,object){return iteratee(accumulator,value,index,object)});return accumulator}function unset(object,path){return object==null?true:baseUnset(object,path)}function update(object,path,updater){return object==null?object:baseUpdate(object,path,castFunction(updater))}function updateWith(object,path,updater,customizer){customizer=typeof customizer=="function"?customizer:undefined;return object==null?object:baseUpdate(object,path,castFunction(updater),customizer)}function values(object){return object==null?[]:baseValues(object,keys(object))}function valuesIn(object){return object==null?[]:baseValues(object,keysIn(object))}function clamp(number,lower,upper){if(upper===undefined){upper=lower;lower=undefined}if(upper!==undefined){upper=toNumber(upper);upper=upper===upper?upper:0}if(lower!==undefined){lower=toNumber(lower);lower=lower===lower?lower:0}return baseClamp(toNumber(number),lower,upper)}function inRange(number,start,end){start=toFinite(start);if(end===undefined){end=start;start=0}else{end=toFinite(end)}number=toNumber(number);return baseInRange(number,start,end)}function random(lower,upper,floating){if(floating&&typeof floating!="boolean"&&isIterateeCall(lower,upper,floating)){upper=floating=undefined}if(floating===undefined){if(typeof upper=="boolean"){floating=upper;upper=undefined}else if(typeof lower=="boolean"){floating=lower;lower=undefined}}if(lower===undefined&&upper===undefined){lower=0;upper=1}else{lower=toFinite(lower);if(upper===undefined){upper=lower;lower=0}else{upper=toFinite(upper)}}if(lower>upper){var temp=lower;lower=upper;upper=temp}if(floating||lower%1||upper%1){var rand=nativeRandom();return nativeMin(lower+rand*(upper-lower+freeParseFloat("1e-"+((rand+"").length-1))),upper)}return baseRandom(lower,upper)}var camelCase=createCompounder(function(result,word,index){word=word.toLowerCase();return result+(index?capitalize(word):word)});function capitalize(string){return upperFirst(toString(string).toLowerCase())}function deburr(string){string=toString(string);return string&&string.replace(reLatin,deburrLetter).replace(reComboMark,"")}function endsWith(string,target,position){string=toString(string);target=baseToString(target);var length=string.length;position=position===undefined?length:baseClamp(toInteger(position),0,length);var end=position;position-=target.length;return position>=0&&string.slice(position,end)==target}function escape(string){string=toString(string);return string&&reHasUnescapedHtml.test(string)?string.replace(reUnescapedHtml,escapeHtmlChar):string}function escapeRegExp(string){string=toString(string);return string&&reHasRegExpChar.test(string)?string.replace(reRegExpChar,"\\$&"):string}var kebabCase=createCompounder(function(result,word,index){return result+(index?"-":"")+word.toLowerCase()});var lowerCase=createCompounder(function(result,word,index){return result+(index?" ":"")+word.toLowerCase()});var lowerFirst=createCaseFirst("toLowerCase");function pad(string,length,chars){string=toString(string);length=toInteger(length);var strLength=length?stringSize(string):0;if(!length||strLength>=length){return string}var mid=(length-strLength)/2;return createPadding(nativeFloor(mid),chars)+string+createPadding(nativeCeil(mid),chars)}function padEnd(string,length,chars){string=toString(string);length=toInteger(length);var strLength=length?stringSize(string):0;return length&&strLength<length?string+createPadding(length-strLength,chars):string}function padStart(string,length,chars){string=toString(string);length=toInteger(length);var strLength=length?stringSize(string):0;return length&&strLength<length?createPadding(length-strLength,chars)+string:string}function parseInt(string,radix,guard){if(guard||radix==null){radix=0}else if(radix){radix=+radix}return nativeParseInt(toString(string).replace(reTrimStart,""),radix||0)}function repeat(string,n,guard){if(guard?isIterateeCall(string,n,guard):n===undefined){n=1}else{n=toInteger(n)}return baseRepeat(toString(string),n)}function replace(){var args=arguments,string=toString(args[0]);return args.length<3?string:string.replace(args[1],args[2])}var snakeCase=createCompounder(function(result,word,index){return result+(index?"_":"")+word.toLowerCase()});function split(string,separator,limit){if(limit&&typeof limit!="number"&&isIterateeCall(string,separator,limit)){separator=limit=undefined}limit=limit===undefined?MAX_ARRAY_LENGTH:limit>>>0;if(!limit){return[]}string=toString(string);if(string&&(typeof separator=="string"||separator!=null&&!isRegExp(separator))){separator=baseToString(separator);if(!separator&&hasUnicode(string)){return castSlice(stringToArray(string),0,limit)}}return string.split(separator,limit)}var startCase=createCompounder(function(result,word,index){return result+(index?" ":"")+upperFirst(word)});function startsWith(string,target,position){string=toString(string);position=position==null?0:baseClamp(toInteger(position),0,string.length);target=baseToString(target);return string.slice(position,position+target.length)==target}function template(string,options,guard){var settings=lodash.templateSettings;if(guard&&isIterateeCall(string,options,guard)){options=undefined}string=toString(string);options=assignInWith({},options,settings,customDefaultsAssignIn);var imports=assignInWith({},options.imports,settings.imports,customDefaultsAssignIn),importsKeys=keys(imports),importsValues=baseValues(imports,importsKeys);var isEscaping,isEvaluating,index=0,interpolate=options.interpolate||reNoMatch,source="__p += '";var reDelimiters=RegExp((options.escape||reNoMatch).source+"|"+interpolate.source+"|"+(interpolate===reInterpolate?reEsTemplate:reNoMatch).source+"|"+(options.evaluate||reNoMatch).source+"|$","g");var sourceURL="//# sourceURL="+("sourceURL"in options?options.sourceURL:"lodash.templateSources["+ ++templateCounter+"]")+"\n";string.replace(reDelimiters,function(match,escapeValue,interpolateValue,esTemplateValue,evaluateValue,offset){interpolateValue||(interpolateValue=esTemplateValue);source+=string.slice(index,offset).replace(reUnescapedString,escapeStringChar);if(escapeValue){isEscaping=true;source+="' +\n__e("+escapeValue+") +\n'"}if(evaluateValue){isEvaluating=true;source+="';\n"+evaluateValue+";\n__p += '"}if(interpolateValue){source+="' +\n((__t = ("+interpolateValue+")) == null ? '' : __t) +\n'"}index=offset+match.length;return match});source+="';\n";var variable=options.variable;if(!variable){source="with (obj) {\n"+source+"\n}\n"}source=(isEvaluating?source.replace(reEmptyStringLeading,""):source).replace(reEmptyStringMiddle,"$1").replace(reEmptyStringTrailing,"$1;");source="function("+(variable||"obj")+") {\n"+(variable?"":"obj || (obj = {});\n")+"var __t, __p = ''"+(isEscaping?", __e = _.escape":"")+(isEvaluating?", __j = Array.prototype.join;\n"+"function print() { __p += __j.call(arguments, '') }\n":";\n")+source+"return __p\n}";var result=attempt(function(){return Function(importsKeys,sourceURL+"return "+source).apply(undefined,importsValues)});result.source=source;if(isError(result)){throw result}return result}function toLower(value){return toString(value).toLowerCase()}function toUpper(value){return toString(value).toUpperCase()}function trim(string,chars,guard){string=toString(string);if(string&&(guard||chars===undefined)){return string.replace(reTrim,"")}if(!string||!(chars=baseToString(chars))){return string}var strSymbols=stringToArray(string),chrSymbols=stringToArray(chars),start=charsStartIndex(strSymbols,chrSymbols),end=charsEndIndex(strSymbols,chrSymbols)+1;return castSlice(strSymbols,start,end).join("")}function trimEnd(string,chars,guard){string=toString(string);if(string&&(guard||chars===undefined)){return string.replace(reTrimEnd,"")}if(!string||!(chars=baseToString(chars))){return string}var strSymbols=stringToArray(string),end=charsEndIndex(strSymbols,stringToArray(chars))+1;return castSlice(strSymbols,0,end).join("")}function trimStart(string,chars,guard){string=toString(string);if(string&&(guard||chars===undefined)){return string.replace(reTrimStart,"")}if(!string||!(chars=baseToString(chars))){return string}var strSymbols=stringToArray(string),start=charsStartIndex(strSymbols,stringToArray(chars));return castSlice(strSymbols,start).join("")}function truncate(string,options){var length=DEFAULT_TRUNC_LENGTH,omission=DEFAULT_TRUNC_OMISSION;if(isObject(options)){var separator="separator"in options?options.separator:separator;length="length"in options?toInteger(options.length):length;omission="omission"in options?baseToString(options.omission):omission}string=toString(string);var strLength=string.length;if(hasUnicode(string)){var strSymbols=stringToArray(string);strLength=strSymbols.length}if(length>=strLength){return string}var end=length-stringSize(omission);if(end<1){return omission}var result=strSymbols?castSlice(strSymbols,0,end).join(""):string.slice(0,end);if(separator===undefined){return result+omission}if(strSymbols){end+=result.length-end}if(isRegExp(separator)){if(string.slice(end).search(separator)){var match,substring=result;if(!separator.global){separator=RegExp(separator.source,toString(reFlags.exec(separator))+"g")}separator.lastIndex=0;while(match=separator.exec(substring)){var newEnd=match.index}result=result.slice(0,newEnd===undefined?end:newEnd)}}else if(string.indexOf(baseToString(separator),end)!=end){var index=result.lastIndexOf(separator);if(index>-1){result=result.slice(0,index)}}return result+omission}function unescape(string){string=toString(string);return string&&reHasEscapedHtml.test(string)?string.replace(reEscapedHtml,unescapeHtmlChar):string}var upperCase=createCompounder(function(result,word,index){return result+(index?" ":"")+word.toUpperCase()});var upperFirst=createCaseFirst("toUpperCase");function words(string,pattern,guard){string=toString(string);pattern=guard?undefined:pattern;if(pattern===undefined){return hasUnicodeWord(string)?unicodeWords(string):asciiWords(string)}return string.match(pattern)||[]}var attempt=baseRest(function(func,args){try{return apply(func,undefined,args)}catch(e){return isError(e)?e:new Error(e)}});var bindAll=flatRest(function(object,methodNames){arrayEach(methodNames,function(key){key=toKey(key);baseAssignValue(object,key,bind(object[key],object))});return object});function cond(pairs){var length=pairs==null?0:pairs.length,toIteratee=getIteratee();pairs=!length?[]:arrayMap(pairs,function(pair){if(typeof pair[1]!="function"){throw new TypeError(FUNC_ERROR_TEXT)}return[toIteratee(pair[0]),pair[1]]});return baseRest(function(args){var index=-1;while(++index<length){var pair=pairs[index];if(apply(pair[0],this,args)){return apply(pair[1],this,args)}}})}function conforms(source){return baseConforms(baseClone(source,CLONE_DEEP_FLAG))}function constant(value){return function(){return value}}function defaultTo(value,defaultValue){return value==null||value!==value?defaultValue:value}var flow=createFlow();var flowRight=createFlow(true);function identity(value){return value}function iteratee(func){return baseIteratee(typeof func=="function"?func:baseClone(func,CLONE_DEEP_FLAG))}function matches(source){return baseMatches(baseClone(source,CLONE_DEEP_FLAG))}function matchesProperty(path,srcValue){return baseMatchesProperty(path,baseClone(srcValue,CLONE_DEEP_FLAG))}var method=baseRest(function(path,args){return function(object){return baseInvoke(object,path,args)}});var methodOf=baseRest(function(object,args){return function(path){return baseInvoke(object,path,args)}});function mixin(object,source,options){var props=keys(source),methodNames=baseFunctions(source,props);if(options==null&&!(isObject(source)&&(methodNames.length||!props.length))){options=source;source=object;object=this;methodNames=baseFunctions(source,keys(source))}var chain=!(isObject(options)&&"chain"in options)||!!options.chain,isFunc=isFunction(object);arrayEach(methodNames,function(methodName){var func=source[methodName];object[methodName]=func;if(isFunc){object.prototype[methodName]=function(){var chainAll=this.__chain__;if(chain||chainAll){var result=object(this.__wrapped__),actions=result.__actions__=copyArray(this.__actions__);actions.push({func:func,args:arguments,thisArg:object});result.__chain__=chainAll;return result}return func.apply(object,arrayPush([this.value()],arguments))}}});return object}function noConflict(){if(root._===this){root._=oldDash}return this}function noop(){}function nthArg(n){n=toInteger(n);return baseRest(function(args){return baseNth(args,n)})}var over=createOver(arrayMap);var overEvery=createOver(arrayEvery);var overSome=createOver(arraySome);function property(path){return isKey(path)?baseProperty(toKey(path)):basePropertyDeep(path)}function propertyOf(object){return function(path){return object==null?undefined:baseGet(object,path)}}var range=createRange();var rangeRight=createRange(true);function stubArray(){return[]}function stubFalse(){return false}function stubObject(){return{}}function stubString(){return""}function stubTrue(){return true}function times(n,iteratee){n=toInteger(n);if(n<1||n>MAX_SAFE_INTEGER){return[]}var index=MAX_ARRAY_LENGTH,length=nativeMin(n,MAX_ARRAY_LENGTH);iteratee=getIteratee(iteratee);n-=MAX_ARRAY_LENGTH;var result=baseTimes(length,iteratee);while(++index<n){iteratee(index)}return result}function toPath(value){if(isArray(value)){return arrayMap(value,toKey)}return isSymbol(value)?[value]:copyArray(stringToPath(toString(value)))}function uniqueId(prefix){var id=++idCounter;return toString(prefix)+id}var add=createMathOperation(function(augend,addend){return augend+addend},0);var ceil=createRound("ceil");var divide=createMathOperation(function(dividend,divisor){return dividend/divisor},1);var floor=createRound("floor");function max(array){return array&&array.length?baseExtremum(array,identity,baseGt):undefined}function maxBy(array,iteratee){return array&&array.length?baseExtremum(array,getIteratee(iteratee,2),baseGt):undefined}function mean(array){return baseMean(array,identity)}function meanBy(array,iteratee){return baseMean(array,getIteratee(iteratee,2))}function min(array){return array&&array.length?baseExtremum(array,identity,baseLt):undefined}function minBy(array,iteratee){return array&&array.length?baseExtremum(array,getIteratee(iteratee,2),baseLt):undefined}var multiply=createMathOperation(function(multiplier,multiplicand){return multiplier*multiplicand},1);var round=createRound("round");var subtract=createMathOperation(function(minuend,subtrahend){return minuend-subtrahend},0);function sum(array){return array&&array.length?baseSum(array,identity):0}function sumBy(array,iteratee){return array&&array.length?baseSum(array,getIteratee(iteratee,2)):0}lodash.after=after;lodash.ary=ary;lodash.assign=assign;lodash.assignIn=assignIn;lodash.assignInWith=assignInWith;lodash.assignWith=assignWith;lodash.at=at;lodash.before=before;lodash.bind=bind;lodash.bindAll=bindAll;lodash.bindKey=bindKey;lodash.castArray=castArray;lodash.chain=chain;lodash.chunk=chunk;lodash.compact=compact;lodash.concat=concat;lodash.cond=cond;lodash.conforms=conforms;lodash.constant=constant;lodash.countBy=countBy;lodash.create=create;lodash.curry=curry;lodash.curryRight=curryRight;lodash.debounce=debounce;lodash.defaults=defaults;lodash.defaultsDeep=defaultsDeep;lodash.defer=defer;lodash.delay=delay;lodash.difference=difference;lodash.differenceBy=differenceBy;lodash.differenceWith=differenceWith;lodash.drop=drop;lodash.dropRight=dropRight;lodash.dropRightWhile=dropRightWhile;lodash.dropWhile=dropWhile;lodash.fill=fill;lodash.filter=filter;lodash.flatMap=flatMap;lodash.flatMapDeep=flatMapDeep;lodash.flatMapDepth=flatMapDepth;lodash.flatten=flatten;lodash.flattenDeep=flattenDeep;lodash.flattenDepth=flattenDepth;lodash.flip=flip;lodash.flow=flow;lodash.flowRight=flowRight;lodash.fromPairs=fromPairs;lodash.functions=functions;lodash.functionsIn=functionsIn;lodash.groupBy=groupBy;lodash.initial=initial;lodash.intersection=intersection;lodash.intersectionBy=intersectionBy;lodash.intersectionWith=intersectionWith;lodash.invert=invert;lodash.invertBy=invertBy;lodash.invokeMap=invokeMap;lodash.iteratee=iteratee;lodash.keyBy=keyBy;lodash.keys=keys;lodash.keysIn=keysIn;lodash.map=map;lodash.mapKeys=mapKeys;lodash.mapValues=mapValues;lodash.matches=matches;lodash.matchesProperty=matchesProperty;lodash.memoize=memoize;lodash.merge=merge;lodash.mergeWith=mergeWith;lodash.method=method;lodash.methodOf=methodOf;lodash.mixin=mixin;lodash.negate=negate;lodash.nthArg=nthArg;lodash.omit=omit;lodash.omitBy=omitBy;lodash.once=once;lodash.orderBy=orderBy;lodash.over=over;lodash.overArgs=overArgs;lodash.overEvery=overEvery;lodash.overSome=overSome;lodash.partial=partial;lodash.partialRight=partialRight;lodash.partition=partition;lodash.pick=pick;lodash.pickBy=pickBy;lodash.property=property;lodash.propertyOf=propertyOf;lodash.pull=pull;lodash.pullAll=pullAll;lodash.pullAllBy=pullAllBy;lodash.pullAllWith=pullAllWith;lodash.pullAt=pullAt;lodash.range=range;lodash.rangeRight=rangeRight;lodash.rearg=rearg;lodash.reject=reject;lodash.remove=remove;lodash.rest=rest;lodash.reverse=reverse;lodash.sampleSize=sampleSize;lodash.set=set;lodash.setWith=setWith;lodash.shuffle=shuffle;lodash.slice=slice;lodash.sortBy=sortBy;lodash.sortedUniq=sortedUniq;lodash.sortedUniqBy=sortedUniqBy;lodash.split=split;lodash.spread=spread;lodash.tail=tail;lodash.take=take;lodash.takeRight=takeRight;lodash.takeRightWhile=takeRightWhile;lodash.takeWhile=takeWhile;lodash.tap=tap;lodash.throttle=throttle;lodash.thru=thru;lodash.toArray=toArray;lodash.toPairs=toPairs;lodash.toPairsIn=toPairsIn;lodash.toPath=toPath;lodash.toPlainObject=toPlainObject;lodash.transform=transform;lodash.unary=unary;lodash.union=union;lodash.unionBy=unionBy;lodash.unionWith=unionWith;lodash.uniq=uniq;lodash.uniqBy=uniqBy;lodash.uniqWith=uniqWith;lodash.unset=unset;lodash.unzip=unzip;lodash.unzipWith=unzipWith;lodash.update=update;lodash.updateWith=updateWith;lodash.values=values;lodash.valuesIn=valuesIn;lodash.without=without;lodash.words=words;lodash.wrap=wrap;lodash.xor=xor;lodash.xorBy=xorBy;lodash.xorWith=xorWith;lodash.zip=zip;lodash.zipObject=zipObject;lodash.zipObjectDeep=zipObjectDeep;lodash.zipWith=zipWith;lodash.entries=toPairs;lodash.entriesIn=toPairsIn;lodash.extend=assignIn;lodash.extendWith=assignInWith;mixin(lodash,lodash);lodash.add=add;lodash.attempt=attempt;lodash.camelCase=camelCase;lodash.capitalize=capitalize;lodash.ceil=ceil;lodash.clamp=clamp;lodash.clone=clone;lodash.cloneDeep=cloneDeep;lodash.cloneDeepWith=cloneDeepWith;lodash.cloneWith=cloneWith;lodash.conformsTo=conformsTo;lodash.deburr=deburr;lodash.defaultTo=defaultTo;lodash.divide=divide;lodash.endsWith=endsWith;lodash.eq=eq;lodash.escape=escape;lodash.escapeRegExp=escapeRegExp;lodash.every=every;lodash.find=find;lodash.findIndex=findIndex;lodash.findKey=findKey;lodash.findLast=findLast;lodash.findLastIndex=findLastIndex;lodash.findLastKey=findLastKey;lodash.floor=floor;lodash.forEach=forEach;lodash.forEachRight=forEachRight;lodash.forIn=forIn;lodash.forInRight=forInRight;lodash.forOwn=forOwn;lodash.forOwnRight=forOwnRight;lodash.get=get;lodash.gt=gt;lodash.gte=gte;lodash.has=has;lodash.hasIn=hasIn;lodash.head=head;lodash.identity=identity;lodash.includes=includes;lodash.indexOf=indexOf;lodash.inRange=inRange;lodash.invoke=invoke;lodash.isArguments=isArguments;lodash.isArray=isArray;lodash.isArrayBuffer=isArrayBuffer;lodash.isArrayLike=isArrayLike;lodash.isArrayLikeObject=isArrayLikeObject;lodash.isBoolean=isBoolean;lodash.isBuffer=isBuffer;lodash.isDate=isDate;lodash.isElement=isElement;lodash.isEmpty=isEmpty;lodash.isEqual=isEqual;lodash.isEqualWith=isEqualWith;lodash.isError=isError;lodash.isFinite=isFinite;lodash.isFunction=isFunction;lodash.isInteger=isInteger;lodash.isLength=isLength;lodash.isMap=isMap;lodash.isMatch=isMatch;lodash.isMatchWith=isMatchWith;lodash.isNaN=isNaN;lodash.isNative=isNative;lodash.isNil=isNil;lodash.isNull=isNull;lodash.isNumber=isNumber;lodash.isObject=isObject;lodash.isObjectLike=isObjectLike;lodash.isPlainObject=isPlainObject;lodash.isRegExp=isRegExp;lodash.isSafeInteger=isSafeInteger;lodash.isSet=isSet;lodash.isString=isString;lodash.isSymbol=isSymbol;lodash.isTypedArray=isTypedArray;lodash.isUndefined=isUndefined;lodash.isWeakMap=isWeakMap;lodash.isWeakSet=isWeakSet;lodash.join=join;lodash.kebabCase=kebabCase;lodash.last=last;lodash.lastIndexOf=lastIndexOf;lodash.lowerCase=lowerCase;lodash.lowerFirst=lowerFirst;lodash.lt=lt;lodash.lte=lte;lodash.max=max;lodash.maxBy=maxBy;lodash.mean=mean;lodash.meanBy=meanBy;lodash.min=min;lodash.minBy=minBy;lodash.stubArray=stubArray;lodash.stubFalse=stubFalse;lodash.stubObject=stubObject;lodash.stubString=stubString;lodash.stubTrue=stubTrue;lodash.multiply=multiply;lodash.nth=nth;lodash.noConflict=noConflict;lodash.noop=noop;lodash.now=now;lodash.pad=pad;lodash.padEnd=padEnd;lodash.padStart=padStart;lodash.parseInt=parseInt;lodash.random=random;lodash.reduce=reduce;lodash.reduceRight=reduceRight;lodash.repeat=repeat;lodash.replace=replace;lodash.result=result;lodash.round=round;lodash.runInContext=runInContext;lodash.sample=sample;lodash.size=size;lodash.snakeCase=snakeCase;lodash.some=some;lodash.sortedIndex=sortedIndex;lodash.sortedIndexBy=sortedIndexBy;lodash.sortedIndexOf=sortedIndexOf;lodash.sortedLastIndex=sortedLastIndex;lodash.sortedLastIndexBy=sortedLastIndexBy;lodash.sortedLastIndexOf=sortedLastIndexOf;lodash.startCase=startCase;lodash.startsWith=startsWith;lodash.subtract=subtract;lodash.sum=sum;lodash.sumBy=sumBy;lodash.template=template;lodash.times=times;lodash.toFinite=toFinite;lodash.toInteger=toInteger;lodash.toLength=toLength;lodash.toLower=toLower;lodash.toNumber=toNumber;lodash.toSafeInteger=toSafeInteger;lodash.toString=toString;lodash.toUpper=toUpper;lodash.trim=trim;lodash.trimEnd=trimEnd;lodash.trimStart=trimStart;lodash.truncate=truncate;lodash.unescape=unescape;lodash.uniqueId=uniqueId;lodash.upperCase=upperCase;lodash.upperFirst=upperFirst;lodash.each=forEach;lodash.eachRight=forEachRight;lodash.first=head;mixin(lodash,function(){var source={};baseForOwn(lodash,function(func,methodName){if(!hasOwnProperty.call(lodash.prototype,methodName)){source[methodName]=func}});return source}(),{chain:false});lodash.VERSION=VERSION;arrayEach(["bind","bindKey","curry","curryRight","partial","partialRight"],function(methodName){lodash[methodName].placeholder=lodash});arrayEach(["drop","take"],function(methodName,index){LazyWrapper.prototype[methodName]=function(n){n=n===undefined?1:nativeMax(toInteger(n),0);var result=this.__filtered__&&!index?new LazyWrapper(this):this.clone();if(result.__filtered__){result.__takeCount__=nativeMin(n,result.__takeCount__)}else{result.__views__.push({size:nativeMin(n,MAX_ARRAY_LENGTH),type:methodName+(result.__dir__<0?"Right":"")})}return result};LazyWrapper.prototype[methodName+"Right"]=function(n){return this.reverse()[methodName](n).reverse()}});arrayEach(["filter","map","takeWhile"],function(methodName,index){var type=index+1,isFilter=type==LAZY_FILTER_FLAG||type==LAZY_WHILE_FLAG;LazyWrapper.prototype[methodName]=function(iteratee){var result=this.clone();result.__iteratees__.push({iteratee:getIteratee(iteratee,3),type:type});result.__filtered__=result.__filtered__||isFilter;return result}});arrayEach(["head","last"],function(methodName,index){var takeName="take"+(index?"Right":"");LazyWrapper.prototype[methodName]=function(){return this[takeName](1).value()[0]}});arrayEach(["initial","tail"],function(methodName,index){var dropName="drop"+(index?"":"Right");LazyWrapper.prototype[methodName]=function(){return this.__filtered__?new LazyWrapper(this):this[dropName](1)}});LazyWrapper.prototype.compact=function(){return this.filter(identity)};LazyWrapper.prototype.find=function(predicate){return this.filter(predicate).head()};LazyWrapper.prototype.findLast=function(predicate){return this.reverse().find(predicate)};LazyWrapper.prototype.invokeMap=baseRest(function(path,args){if(typeof path=="function"){return new LazyWrapper(this)}return this.map(function(value){return baseInvoke(value,path,args)})});LazyWrapper.prototype.reject=function(predicate){return this.filter(negate(getIteratee(predicate)))};LazyWrapper.prototype.slice=function(start,end){start=toInteger(start);var result=this;if(result.__filtered__&&(start>0||end<0)){return new LazyWrapper(result)}if(start<0){result=result.takeRight(-start)}else if(start){result=result.drop(start)}if(end!==undefined){end=toInteger(end);result=end<0?result.dropRight(-end):result.take(end-start)}return result};LazyWrapper.prototype.takeRightWhile=function(predicate){return this.reverse().takeWhile(predicate).reverse()};LazyWrapper.prototype.toArray=function(){return this.take(MAX_ARRAY_LENGTH)};baseForOwn(LazyWrapper.prototype,function(func,methodName){var checkIteratee=/^(?:filter|find|map|reject)|While$/.test(methodName),isTaker=/^(?:head|last)$/.test(methodName),lodashFunc=lodash[isTaker?"take"+(methodName=="last"?"Right":""):methodName],retUnwrapped=isTaker||/^find/.test(methodName);if(!lodashFunc){return}lodash.prototype[methodName]=function(){var value=this.__wrapped__,args=isTaker?[1]:arguments,isLazy=value instanceof LazyWrapper,iteratee=args[0],useLazy=isLazy||isArray(value);var interceptor=function(value){var result=lodashFunc.apply(lodash,arrayPush([value],args));return isTaker&&chainAll?result[0]:result};if(useLazy&&checkIteratee&&typeof iteratee=="function"&&iteratee.length!=1){isLazy=useLazy=false}var chainAll=this.__chain__,isHybrid=!!this.__actions__.length,isUnwrapped=retUnwrapped&&!chainAll,onlyLazy=isLazy&&!isHybrid;if(!retUnwrapped&&useLazy){value=onlyLazy?value:new LazyWrapper(this);var result=func.apply(value,args);result.__actions__.push({func:thru,args:[interceptor],thisArg:undefined});return new LodashWrapper(result,chainAll)}if(isUnwrapped&&onlyLazy){return func.apply(this,args)}result=this.thru(interceptor);return isUnwrapped?isTaker?result.value()[0]:result.value():result}});arrayEach(["pop","push","shift","sort","splice","unshift"],function(methodName){var func=arrayProto[methodName],chainName=/^(?:push|sort|unshift)$/.test(methodName)?"tap":"thru",retUnwrapped=/^(?:pop|shift)$/.test(methodName);lodash.prototype[methodName]=function(){var args=arguments;if(retUnwrapped&&!this.__chain__){var value=this.value();return func.apply(isArray(value)?value:[],args)}return this[chainName](function(value){return func.apply(isArray(value)?value:[],args)})}});baseForOwn(LazyWrapper.prototype,function(func,methodName){var lodashFunc=lodash[methodName];if(lodashFunc){var key=lodashFunc.name+"",names=realNames[key]||(realNames[key]=[]);names.push({name:methodName,func:lodashFunc})}});realNames[createHybrid(undefined,WRAP_BIND_KEY_FLAG).name]=[{name:"wrapper",func:undefined}];LazyWrapper.prototype.clone=lazyClone;LazyWrapper.prototype.reverse=lazyReverse;LazyWrapper.prototype.value=lazyValue;lodash.prototype.at=wrapperAt;lodash.prototype.chain=wrapperChain;lodash.prototype.commit=wrapperCommit;lodash.prototype.next=wrapperNext;lodash.prototype.plant=wrapperPlant;lodash.prototype.reverse=wrapperReverse;lodash.prototype.toJSON=lodash.prototype.valueOf=lodash.prototype.value=wrapperValue;lodash.prototype.first=lodash.prototype.head;if(symIterator){lodash.prototype[symIterator]=wrapperToIterator}return lodash};var _=runInContext();if(typeof define=="function"&&typeof define.amd=="object"&&define.amd){root._=_;define(function(){return _})}else if(freeModule){(freeModule.exports=_)._=_;freeExports._=_}else{root._=_}}).call(this)}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{}]},{},[]);window.lodash=require("lodash")})();
    try {
        (function() {
          var mod_clone = function() {"use strict";function _instanceof(obj, type) {return type != null && obj instanceof type;}var nativeMap;try {nativeMap = Map;} catch (_) {nativeMap = function() {};}var nativeSet;try {nativeSet = Set;} catch (_) {nativeSet = function() {};}var nativePromise;try {nativePromise = Promise;} catch (_) {nativePromise = function() {};}function clone(parent, circular, depth, prototype, includeNonEnumerable) {if (typeof circular === "object") {depth = circular.depth;prototype = circular.prototype;includeNonEnumerable = circular.includeNonEnumerable;circular = circular.circular;}var allParents = [];var allChildren = [];var useBuffer = typeof Buffer != "undefined";if (typeof circular == "undefined") {circular = true;}if (typeof depth == "undefined") {depth = Infinity;}function _clone(parent, depth) {if (parent === null) {return null;}if (depth === 0) {return parent;}var child;var proto;if (typeof parent != "object") {return parent;}if (_instanceof(parent, nativeMap)) {child = new nativeMap;} else if (_instanceof(parent, nativeSet)) {child = new nativeSet;} else if (_instanceof(parent, nativePromise)) {child = new nativePromise(function(resolve, reject) {parent.then(function(value) {resolve(_clone(value, depth - 1));}, function(err) {reject(_clone(err, depth - 1));});});} else if (clone.__isArray(parent)) {child = [];} else if (clone.__isRegExp(parent)) {child = new RegExp(parent.source, __getRegExpFlags(parent));if (parent.lastIndex) {child.lastIndex = parent.lastIndex;}} else if (clone.__isDate(parent)) {child = new Date(parent.getTime());} else if (useBuffer && Buffer.isBuffer(parent)) {child = new Buffer(parent.length);parent.copy(child);return child;} else if (_instanceof(parent, Error)) {child = Object.create(parent);} else {if (typeof prototype == "undefined") {proto = Object.getPrototypeOf(parent);child = Object.create(proto);} else {child = Object.create(prototype);proto = prototype;}}if (circular) {var index = allParents.indexOf(parent);if (index != -1) {return allChildren[index];}allParents.push(parent);allChildren.push(child);}if (_instanceof(parent, nativeMap)) {parent.forEach(function(value, key) {var keyChild = _clone(key, depth - 1);var valueChild = _clone(value, depth - 1);child.set(keyChild, valueChild);});}if (_instanceof(parent, nativeSet)) {parent.forEach(function(value) {var entryChild = _clone(value, depth - 1);child.add(entryChild);});}for (var i in parent) {var attrs;if (proto) {attrs = Object.getOwnPropertyDescriptor(proto, i);}if (attrs && attrs.set == null) {continue;}child[i] = _clone(parent[i], depth - 1);}if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(parent);for (var i = 0; i < symbols.length; i++) {var symbol = symbols[i];var descriptor = Object.getOwnPropertyDescriptor(parent, symbol);if (descriptor && !descriptor.enumerable && !includeNonEnumerable) {continue;}child[symbol] = _clone(parent[symbol], depth - 1);if (!descriptor.enumerable) {Object.defineProperty(child, symbol, {enumerable: false});}}}if (includeNonEnumerable) {var allPropertyNames = Object.getOwnPropertyNames(parent);for (var i = 0; i < allPropertyNames.length; i++) {var propertyName = allPropertyNames[i];var descriptor = Object.getOwnPropertyDescriptor(parent, propertyName);if (descriptor && descriptor.enumerable) {continue;}child[propertyName] = _clone(parent[propertyName], depth - 1);Object.defineProperty(child, propertyName, {enumerable: false});}}return child;}return _clone(parent, depth);}clone.clonePrototype = function clonePrototype(parent) {if (parent === null) {return null;}var c = function() {};c.prototype = parent;return new c;};function __objToStr(o) {return Object.prototype.toString.call(o);}clone.__objToStr = __objToStr;function __isDate(o) {return typeof o === "object" && __objToStr(o) === "[object Date]";}clone.__isDate = __isDate;function __isArray(o) {return typeof o === "object" && __objToStr(o) === "[object Array]";}clone.__isArray = __isArray;function __isRegExp(o) {return typeof o === "object" && __objToStr(o) === "[object RegExp]";}clone.__isRegExp = __isRegExp;function __getRegExpFlags(re) {var flags = "";if (re.global) {flags += "g";}if (re.ignoreCase) {flags += "i";}if (re.multiline) {flags += "m";}return flags;}clone.__getRegExpFlags = __getRegExpFlags;return clone;}();
          /**
           *  util: methods for making sure we're doing the right thing.
           *  @type  {Object}
           */
          var check = {
            primitives: {number: true,boolean: true,string: true,null: true,undefined: true,symbol: true},
            is_primitive: function primitive(type) {return this.primitives.hasOwnProperty(type);},
            is_own: function is_own(obj, key) {return Object.prototype.hasOwnProperty.call(obj, key);},
            empty_obj: function empty_obj(data) {return Object.prototype.toString.call(data) === "[object Object]" && Object.keys(data).length === 0;},
            type: function kindof(data, key) {if (key) {data = data[key];}var type = Object.prototype.toString.call(data).match(/\s([a-zA-Z]+)/)[1].toLowerCase().replace(/^html|element/gim, "");if (type === "number") {return !isNaN(data) ? "number" : "nan";} else {return type;}},
            mod: function check_mod(obj, other) {
              var mod = false;
              function diff_types(a, b) {return check.type(a) !== check.type(b);}
              function diff_length(a, b) {return Object.keys(a).length !== Object.keys(b).length;}
              function diff_values(a, b) {return a !== b;}
              function loop_check(obj, other, key) {
                if (mod) return;
                for (var key in obj) {
                  if (check.is_own(obj, key)) {
                    let type = check.type(obj, key);
                    if (check.is_primitive(type)) {
                      mod = diff_values(obj[key], other[key]);
                      if (mod) {break;}
                    } else {
                      loop_check(obj[key], other[key]);
                    }
                  }
                }
              }
              loop_check(obj, other);
              return mod;
            }
          };
          /**
           *  creates the obj passed into utui.profile.showModifiedTabLabel and utui.historyManager.addEvent
           *  example call:
           *  utui.profile.showModifiedTabLabel(build_update_view_obj(utui.data.loadrules[id]))
           *  @param   {object}  rule  : the loadrule object.
           *  @return  {method}        : sets the dirty icon in the ui.
           */
           var build_update_view_obj = function(rule) {
            if (check.type(rule) === "object" && !check.empty_obj(rule)) {
              return {
                "action": "updated_loadrule",
                "data": {
                  "id": "" + rule._id,
                  "name": _.unescape(rule.title),
                  "kind": "Loadrule",
                  "operation": "updated",
                  "container": rule.containerId,
                  "tab_name": "loadrules"
                }
              };
            }
            return false;
          };
          var update_loadrule_value = function(id, key, value, container_id, loadrule_container) {
            function get_selector(id) {
              return ".loadrules_container[data-id=" + id + "]"
            };
            try {
              var $elem = $(get_selector(id));
              if ($elem.length) {
                container_id = $elem.attr('id');
                if (container_id) {
                  loadrule_container = utui.loadrules.containerMap[container_id];
                  if (loadrule_container && loadrule_container.editable === "true") {
                    utui.automator.getLoadruleById(id)[key] = value;
                    return true;
                  }
                }
              } else {
                return null;
              }
            } catch (e) {
              return null;
            };
          };
          /**
           *  returns an unflattend object whose's keys are grouped by the path of the key values.
           *  @param   {object}  table  : an object to iterate over.
           *  @return  {object}         : cloned obj with grouped keys.
           */
           var group = function(object) {
            var result = {};
            var cursor, len, prop, idx, char, start, end, bracket, dot;
            for (var path in object) {
              if (object.hasOwnProperty(path)) {
                cursor = result;
                len = path.length;
                prop = "";
                idx = 0;
                while (idx < len) {
                  char = path.charAt(idx);
                  if (char === "[") {
                    start = idx + 1;
                    end = path.indexOf("]", start);
                    cursor = cursor[prop] = cursor[prop] || [];
                    prop = path.slice(start, end);
                    idx = end + 1;
                  } else {
                    cursor = cursor[prop] = cursor[prop] || {};
                    start = char === "." ? idx + 1 : idx;
                    bracket = path.indexOf("[", start);
                    dot = path.indexOf(".", start);
                    if (bracket < 0 && dot < 0) {
                      end = idx = len;
                    } else if (bracket < 0) {
                      end = idx = dot;
                    } else if (dot < 0) {
                      end = idx = bracket;
                    } else {
                      end = idx = bracket < dot ? bracket : dot;
                    }
                    prop = path.slice(start, end);
                  }
                }
                cursor[prop] = object[path];
              }
            }
            return result[""];
          };

          var add_defined = function(loadrule) {
            var insert_is_defined = function(remap) {
              /**
               *  returns an array with an is defined loadrule pattern.
               *  @param   {string}  value  : the value of the input/source of this loadrule's block.
               *  @return  {array}          : the array we will prepent into the loadrule block.
               */
               var build_is_defined_pair = function(value) {
                return [
                ["input", value["input"]],
                ["operator", "defined"],
                ["filter", ""]
                ];
              };
              /**
               *  boolean check if we should be adding a is_defined check.
               *  @param   {string}   operator  : an input operator [is_defined, contains etc].
               *  @return  {Boolean}            : returns true if we should add an is_defined.
               */
               var is_allowed_operator = function(operator) {
                var excluded_operators = ["defined", "notdefined", "populated", "notpopulated", "is_badge_assigned"];
                return !excluded_operators.includes(operator);
              };
              /**
               *  boolean check if the udo param should be checked for existance. excludes TIQ added params guaranteed to be in UDO during loadrule execution.
               *  @param   {string}   input  : the udo param input value.
               *  @return  {Boolean}         : true if it's not a dom. param
               */
               var is_allowed_input = function(input) {
                return input.match(/^js\.|^cp\.|^meta\.|^js_page\.|^va\.|^qp\.|^channel_|^do_not_track|^previous_page_name/) ? true : false;
              };
              // the loadrule or block, or the only block in the loadrule
              var sub_cond = Object.assign({}, loadrule[key]);
              var keys = Object.keys(remap);
              var arr = [];
              var master = {};
              // we track if the input is already being safely handled here
              var safe_hash = {};
              /**
               *  handles updating the rules arr. prevents dupelicate keys etc. Mods to fix loadrules should be added here.
               *  @param   {array}  arr    : the loadrule subcondition bin. a subcondition is a single loadrule block or an or block.
               *  @param   {array}  value  : the loadrule statement we want to push into the block. format [['input', remap[key]['input']],['operator', 'defined'],['filter', '']];
               *  @return  {method}        : will selectively update the loadrule block.
               */
               var push_unique = function(array, value) {
                var last, len;
                var last_input, last_operator, last_filter;
                var curr_input, curr_operator, curr_filter;
                curr_input = value[0][1];
                curr_operator = value[1][1];
                curr_filter = value[2][1];
                // if it's the first condition, go ahead and push it but track if it's a is defined or is populated check
                if (array.length === 0) {
                  array.push(value);
                  if (curr_operator === "defined" || curr_operator === "populated" || curr_operator === "is_badge_assigned") {
                    safe_hash[curr_input] = curr_operator === "populated" ? 2 : 1;
                    safe_hash[curr_input + "_loc"] = arr.length - 1;
                  }
                  return;
                }
                // if we're deeper into the block
                if (array.length >= 1) {
                  len = array.length;
                  last = array[len - 1];
                  last_input = last[0][1];
                  last_operator = last[1][1];
                  last_filter = last[2][1];
                }
                if (curr_operator === "populated" && typeof(safe_hash[curr_input]) !== "undefined" && safe_hash[curr_input] === 1) {
                  arr[safe_hash[curr_input + "_loc"]][1][1] = "populated";
                  safe_hash[curr_input] = 2;
                }
                if (curr_operator === "populated" && typeof(safe_hash[curr_input]) !== "undefined" && safe_hash[curr_input] === 2) {
                  return;
                }
                if (curr_operator === "defined" && typeof(safe_hash[curr_input]) !== "undefined") {
                  return;
                }
                if (curr_operator === "is_badge_assigned" && typeof(safe_hash[curr_input]) !== "undefined") {
                  return;
                }
                /** check for dupes and prevent pushing unecessary is_defined checks to a lodrule statement */
                if (curr_input === last_input) {
                  if (curr_operator === "defined" && (last_operator === "defined" || last_operator === "populated" || typeof(safe_hash[curr_input]) !== "undefined")) {
                    return;
                  }
                }
                /** prevent dupes, update loadrule block and track if we're already check for is_defined */
                if (last_input + last_operator + last_filter !== curr_input + curr_operator + curr_filter) {
                  array.push(value);
                  if (curr_operator === "defined" || curr_operator === "populated") {
                    safe_hash[curr_input] = curr_operator === "populated" ? 2 : 1;
                    safe_hash[curr_input + "_loc"] = arr.length - 1;
                  }
                }
              };

              /** loadrule subcond redefined here */
              keys.forEach(function(key, i) {
                var input = remap[key]["input"];
                var operator = remap[key]["operator"];
                var filter = remap[key]["filter"];
                /** add is defined check to values that don't have them and are not added automatically by utag.js */
                if (is_allowed_operator(operator) && is_allowed_input(input)) {
                  // var is_defined_pair = [['input', remap[key]['input']],['operator', 'defined'],['filter', '']];
                  push_unique(arr, build_is_defined_pair(remap[key]));
                  /** push the current loadrule operator */
                  push_unique(arr, [
                              ["input", input],
                              ["operator", operator],
                              ["filter", filter]
                              ]);
                } else {
                  push_unique(arr, [
                              ["input", input],
                              ["operator", operator],
                              ["filter", filter]
                              ]);
                }
              });
              /** reordering of subcondition here. this is what allows us to prepend values */
              for (var i = 0; i < arr.length; i++) {
                arr[i][0][0] = arr[i][0][0] + "_" + i;
                arr[i][1][0] = arr[i][1][0] + "_" + i;
                arr[i][2][0] = arr[i][2][0] + "_" + i;
                /* left join */
                master = Object.assign(master, lodash.fromPairs(arr[i]));
              }
              return master;
            };
            var sub_cond, loadrule, sub_cond_remap, sub_cond_redef, loadrule_backup, new_load_rule = {};
            if (!loadrule) {
              return;
            }
            for (var key in loadrule) {
              if (loadrule.hasOwnProperty(key)) {
                /** impossible to guess how many loadrules subconditions we have so find all keys of type int in loadrule */
                if (!isNaN(parseInt(key))) {
                  // prime a slot
                  new_load_rule[key] = {};
                  sub_cond = mod_clone(loadrule[key]);
                  // prevents error on all_pages loadrule with no length. bug found by @Christina Sund
                  if (check.type(sub_cond) === "object" && !check.empty_obj(sub_cond)) {
                    try {
                      // we flip and remap the keys of the sub_condition from filter_0 to 0.filter
                      sub_cond_remap = group(lodash.mapKeys(sub_cond, function(v, k) {
                        return k.replace(/(\w+)(_)(\d)/, "$3\.$1");
                      }));
                      // here we insert is_defined checks...
                      sub_cond_redef = insert_is_defined(sub_cond_remap);
                      new_load_rule[key] = Object.assign(new_load_rule[key], sub_cond_redef);
                    } catch (e) {
                      console.log(e);
                      // restore key if we failed in redef
                      new_load_rule[key] = loadrule[key];
                    }
                  } else {
                    new_load_rule[key] = loadrule[key];
                  }
                }
              }
            }
            return new_load_rule;
          };
          /** created to force update view. currently unnecessary */
          var create_interface_elements = function(rule_entries) {
            var elements = [];
            var parent_or, and, or_group, keys;
            var create_elem = function(type, value) {
              var lookup = {
                "and": "LRsANDcondition",
                "or": "LRsORcondition",
                "filter": "LRsCase",
                "input": "LRsSource",
                "operator": "LRsFilter"
              };
              var elem = document.createElement("div");
              elem.classList.add(lookup[type]);
              if (type === "and" || type === "or") {
                return elem;
              }
              elem.textContent = value;
              return elem;
            };
            for (var key in rule_entries) {
              if (rule_entries.hasOwnProperty(key)) {
                parent_or = create_elem("or", null);
                keys = Object.keys(rule_entries[key]);
                while (keys.length) {
                  and = create_elem("and", null);
                  or_group = keys.splice(0, 3);
                  or_group.forEach(function(entry, i) {
                    var t = entry.match(/(\w+)_(\d)/)[1];
                    var v = entry.match(/(\w+)_(\d)/)[0];
                    and.appendChild(create_elem(t, rule_entries[key][v]));
                  });
                  parent_or.appendChild(and);
                }
                elements.push(parent_or);
              }
            }
            return elements;
          };
          // dispatcher: handles looping through an individual loadrule.
          // @param   {int}  id     :the id of the loadrule.
          // @return  {method}      :dispatches updating loadrule value, triggering ui view change and adding history event.
          var rebuild_loadrule = function(id) {
            // checks for a mod between a and b values.
            var elem, parent, data, elems, keys, cloned, mod_hash = {};
            // operate on a clone of the loadrule for safety
            cloned = mod_clone(utui.data.loadrules[id]);
            data = add_defined(cloned);
            if (data) {
              keys = Object.keys(data);
              if (keys.length) {
                keys.forEach(function(key, idx) {
                  var update_obj;
                  var updated = false;
                  var value = data[key];
                  /** if we modified a loadrule subcondition */
                  if (check.mod(utui.data.loadrules[id][key], value)) {
                    /** update the interface */
                    updated = update_loadrule_value("" + id, key, value);
                    /** if we haven't tracked a change yet */
                    if (updated && !mod_hash[id]) {
                      /** set change in mod lookup */
                      mod_hash[id] = 1;
                      /** @type {bool} :build the update obj */
                      update_obj = build_update_view_obj(utui.data.loadrules[id]);
                      if (update_obj) {
                        utui.profile.showModifiedTabLabel(update_obj);
                        utui.historyManager.addEvent(update_obj);
                      }
                    }
                  }
                });
              }
            }
          };

          function add_isDefinedAll() {
            localforage.keys().then(function(data) {
              if (data.length >= 10) {
                localforage.removeItem(data[data.length - 1]);
              }
              var curr_date = (new Date()).getTime();
              var label = curr_date + "." + utui.profile.lastAccount + "." + utui.profile.lastProfile + "." + "utui.data";
              var backup = mod_clone(utui.data);
              return localforage.setItem(label, backup)
            }).then(function() {
              var checked_loadrules = [];
              $("input[id^=loadrules_bulk_select]").each(function(i, elem) {if (elem.checked) {checked_loadrules.push(elem.value);}})
              if (checked_loadrules.length) {
                for (var i = 0; i < checked_loadrules.length; i++) {
                  if (utui.data.loadrules[checked_loadrules[i]].editable === "true") {
                    rebuild_loadrule(checked_loadrules[i]);
                  }
                }
              } else {
                for (var key in utui.data.loadrules) {
                  if (utui.data.loadrules.hasOwnProperty(key) && typeof utui.data.loadrules[key].editable !== "undefined" && utui.data.loadrules[key].editable === "true") {
                    rebuild_loadrule(key);
                  }
                }
              }
            }).catch(function(err) {
              if (err) {
                console.log(err);
              }
            });
          };

          jQuery("<button id=\"fixConditions\" class=\"btn btn-info tmui\" style=\"float: left;margin-top:0;margin-left:10px;\">Fix Conditions</button>").insertBefore("#loadrulesContainer_headerControls .tab-menu-item.labels_menu_list.labels_select_wrapper");
          jQuery(document.body).on("mousedown", "#fixConditions", function() {
            add_isDefinedAll()
          });
        })();
    } catch (e) {
                console.log("Add Condition Check Failed: " + e);
            }
        }
    /************** Add Condition Check End ***************************/
    /************** Add Condition Check Start ***************************/
    if (features.extra_info.enabled) {
        function extra_info() {
            var script = document.createElement('script');
            script.src = "https://rawgit.com/MauricioAndrades/enhancements-bin/master/tiq.qtip.config.js";
            document.head.appendChild(script);
            return (function() {
                // fastdom
                !function(t){function e(){var e=this;e.reads=[],e.writes=[],e.raf=u.bind(t)}function n(t){t.scheduled||(t.scheduled=!0,t.raf(i.bind(null,t)))}function i(t){var e,i=t.writes,o=t.reads;try{r(o),r(i)}catch(s){e=s}if(t.scheduled=!1,(o.length||i.length)&&n(t),e){if(!t["catch"]){throw e}t["catch"](e)}}function r(t){for(var e;e=t.shift();){e()}}function o(t,e){var n=t.indexOf(e);return!!~n&&!!t.splice(n,1)}function s(t,e){for(var n in e){e.hasOwnProperty(n)&&(t[n]=e[n])}}var u=t.requestAnimationFrame||t.webkitRequestAnimationFrame||t.mozRequestAnimationFrame||t.msRequestAnimationFrame||function(t){return setTimeout(t,16)};e.prototype={constructor:e,measure:function(t,e){var i=e?t.bind(e):t;return this.reads.push(i),n(this),i},mutate:function(t,e){var i=e?t.bind(e):t;return this.writes.push(i),n(this),i},clear:function(t){return o(this.reads,t)||o(this.writes,t)},extend:function(t){if("object"!==typeof t){throw new Error("expected object")}var e=Object.create(this);return s(e,t),e.fastdom=this,e.initialize&&e.initialize(),e},catch:null};var exports=t.fastdom=t.fastdom||new e;"f"==(typeof define)[0]?define(function(){return exports}):"o"==(typeof module)[0]&&(module.exports=exports)}("undefined"!==typeof window?window:this);
                window.csm = {};

                csm.prime_css=function(){var stylesheet=document.createElement("style");document.head.appendChild(stylesheet);stylesheet.sheet.addRule(".container_info::-webkit-scrollbar","display: none;");stylesheet.sheet.addRule(".container_info","overflow: scroll; max-width: 157px; font-size: 11px; vertical-align: middle; margin-top: -12px; white-space:nowrap;");stylesheet.sheet.addRule(".med","max-width: 150px !important");stylesheet.sheet.addRule(".long","max-width: 300px !important");stylesheet.sheet.addRule(".hidden","display: none;");stylesheet.sheet.addRule(".container_variables","max-width: 22px !important;");stylesheet.sheet.addRule(".px-width","width: 1px !important;");$(".container_variables").css("max-width","22px");$(".container_loadRules").css("width","150px !important");$("div[id*='_mappedVars']").css("width","12px")};
                //Define object that will contain all extensions scoped to a tag
                csm.parseHTML=function parseHTML(str){var tmp=document.implementation.createHTMLDocument();tmp.body.innerHTML=str;return tmp.body.children};
                csm.get_current_tab=function(){return utui.config.currentTab};
                csm.labels={find:function(element){if(!element){return null}return $(element).find(".container_label").get(0)},get_selector:function(){return".container_label"+'[data-type="'+csm.get_current_tab()+'"]'},hide:function(){var labels=document.querySelectorAll(csm.labels.get_selector());for(let i=0;i<labels.length;i++){window.requestAnimationFrame(function(){labels[i].classList.add("hidden")})}},show:function(){var labels=document.querySelectorAll(csm.labels.get_selector());for(let i=0;i<labels.length;i++){labels[i].classList.remove("hidden")}}};
                csm.remove_info=function(){return document.querySelectorAll(".container_info").forEach(function(o){o.parentNode.removeChild(o)})};
                csm.has_info = function() {return document.querySelector(".container_info") === null ? false : true;};
                csm.chkbox={get_state:function(){var checked=false;var curr_tab=csm.get_current_tab();if(curr_tab==="manage"){if(csm.chkbox.tags.lr.firstChild.checked||csm.chkbox.tags.ext.firstChild.checked){checked=true}}else if(curr_tab==="customizations"){if(csm.chkbox.extensions.scope.firstChild.checked){checked=true}}return checked},tags:{},extensions:{}};
                csm.create_checkbox = {
                    tags: function() {
                        document.querySelectorAll(".tab-menu-item.chkbox.manage").forEach(function(elem, i) {
                            elem.parentNode.removeChild(elem);
                        });
                        var selector = "#manageContainer_headerControls";
                        var node = document.querySelector(selector);
                        var chkboxes = {
                            lr: '<div class="tab-menu-item chkbox manage"><input class="chkbox_manage" id="loadrules_chkbox" type="checkbox" value="loadrules"><label for="loadrules_chkbox"><i class="icon-book mapping-icon"></i></label></div>',
                            ext: '<div class="tab-menu-item chkbox manage"><input class="chkbox_manage" id="ext_chkbox" type="checkbox" value="ext"><label for="ext_chkbox"><i class="icon-cog mapping-icon"></i></label></div>'
                        };
                        csm.chkbox.tags.lr = csm.parseHTML(chkboxes.lr)[0];
                        csm.chkbox.tags.ext = csm.parseHTML(chkboxes.ext)[0];
                        csm.chkbox.tags.lr.onchange = function() {
                            if (this.firstChild.checked || csm.chkbox.tags.ext.childNodes[0].checked) {
                                $(".container_info").remove();
                                csm.add_info();
                            } else {
                                $(".container_info").remove();
                                csm.labels.show();
                            }
                        };
                        csm.chkbox.tags.ext.onchange = function() {
                            if (this.firstChild.checked || csm.chkbox.tags.lr.childNodes[0].checked) {
                                $(".container_label").addClass("hidden");
                                $(".container_label").addClass("px-width");
                                $(".container_info").remove();
                                csm.add_info();
                            } else {
                                csm.remove_info();
                                $(".container_label").removeClass("hidden");
                            }
                        };
                        node.appendChild(csm.chkbox.tags.lr);
                        node.appendChild(csm.chkbox.tags.ext);
                    },
                    customizations: function() {
                        document.querySelectorAll(".tab-menu-item.chkbox.customizations").forEach(function(elem, i) {
                            elem.parentNode.removeChild(elem);
                        });
                        var selector = "#customizeContainer_headerControls";
                        var node = document.querySelector(selector);
                        var chkboxes = {
                            scope: '<div class="tab-menu-item chkbox customizations"><input class="chkbox_customizations" id="customizations_chkbox" type="checkbox" value="customizations"><label for="customizations_chkbox"><i class="icon-book mapping-icon"></i></label></div>'
                        };
                        csm.chkbox.extensions.scope = csm.parseHTML(chkboxes.scope)[0];
                        if (node) {
                            node.appendChild(csm.chkbox.extensions.scope);
                        }
                        csm.chkbox.extensions.scope.onchange = function() {
                            var self = this;
                            if (self.hasChildNodes() && self.firstChild.id === "customizations_chkbox" && self.firstChild.checked) {
                                $(".container_info").remove();
                                $(".container_label").addClass("px-width");
                                csm.add_info();
                                $(".container_label").addClass("hidden");
                            } else {
                                csm.remove_info();
                                $(".container_label").removeClass("hidden");
                            }
                        };
                        csm.checkbox_customizations = 1;
                    }
                };
                csm.get_checkbox_state = function() {
                    var current_tab = utui.config.currentTab;
                    var selector = ".chkbox" + "_" + current_tab;
                    var checked = false;
                    var check_boxes = document.querySelectorAll(selector);
                    if (check_boxes) {
                        for (let i = 0; i < check_boxes.length; i++) {
                            if (check_boxes[i].checked) {
                                checked = true;
                                break;
                            }
                        }
                    }
                    return checked;
                };
                csm.InfoContainer = class InfoContainer {
                    constructor(ext, lr) {
                        // ecluded all pages loadrule. request @jason-paddock.
                        if (lr && lr !== "all" && document.querySelector("#loadrules_chkbox").checked) {
                            this.lr = ['<div class="mapping-item mapping-lr"><i class="icon-book mapping-icon"></i><div class="lr" style="margin-left: 3px; width: auto; max-width:280px;">' + lr + "</div></div>"];
                        }
                        if (ext && document.querySelector("#ext_chkbox").checked) {
                            this.ext = ['<div class="mapping-item mapping-ext"><i class="icon-cog mapping-icon"></i><div class="ext" style="margin-left: 3px; width: auto; max-width:280px;">' + ext + "</div></div>"];
                        }
                    }
                    get content() {
                        return this.buildContent();
                    }
                    buildContent() {
                        function create_elem(type, value) {
                            // here we can add custom css to each element in the mapping container.
                            // format should be camelCalse. paddingLeft will be added as padding-left.
                            var css = {
                                div: {
                                    display: "inline-block",
                                    fontSize: "11px"
                                },
                                loadrule: {
                                    "marginLeft": "3px",
                                    "marginRight": "5px",
                                    "paddingLeft": "3px",
                                    "display": "inline-block",
                                    "height": "14px"
                                },
                                extension: {
                                    "marginLeft": "3px",
                                    "marginRight": "5px",
                                    "paddingLeft": "3px",
                                    "display:": "inline-block",
                                    "height": "14px"
                                }
                            };
                            var element;
                            if (type === "div") {
                                element = document.createElement("div");
                                element.classList.add("container_info");
                                for (let key in css[type]) {
                                    if (css[type].hasOwnProperty(key)) {
                                        element.style[key] = css[type][key];
                                    }
                                }
                                return element;
                            }
                            if (type === "loadrule") {
                                element = csm.parseHTML(value.join(""))[0];
                                for (let key in css[type]) {
                                    if (css[type].hasOwnProperty(key)) {
                                        element.style[key] = css[type][key];
                                    }
                                }
                                return element;
                            }
                            if (type === "extension") {
                                element = csm.parseHTML(value.join(""))[0];
                                for (var key in css[type]) {
                                    if (css[type].hasOwnProperty(key)) {
                                        element.style[key] = css[type][key];
                                    }
                                }
                                return element;
                            }
                        }
                        var div = create_elem("div");
                        if (this.lr) {
                            div.appendChild(create_elem("loadrule", this.lr));
                        }
                        if (this.ext) {
                            div.appendChild(create_elem("extension", this.ext));
                        }
                        return div;
                    }
                };
                csm.ExtensionsInfoContainer = class ExtensionsInfoContainer {
                    constructor(scope) {
                        if (scope) {
                            this.scope = ['<div class="mapping-item mapping-ext"><i class="icon-cog mapping-icon"></i><div class="ext" style="margin-left: 3px; width: auto">' + scope + "</div></div>"];
                        }
                    }
                    get content() {
                        return this.buildContent();
                    }
                    buildContent() {
                        function create_elem(type, value) {
                            var css = {
                                div: {
                                    display: "inline-block",
                                    fontSize: "11px"
                                },
                                scope: {
                                    "marginLeft": "3px",
                                    "marginRight": "5px",
                                    "paddingLeft": "3px",
                                    "display:": "inline-block",
                                    "height": "14px"
                                }
                            };
                            if (type === "div") {
                                let element = document.createElement("div");
                                element.classList.add("container_info");
                                for (let key in css[type]) {
                                    if (css[type].hasOwnProperty(key)) {
                                        element.style[key] = css[type][key];
                                    }
                                }
                                return element;
                            }
                            if (type === "scope") {
                                let element = csm.parseHTML(value.join(""))[0];
                                for (var key in css[type]) {
                                    if (css[type].hasOwnProperty(key)) {
                                        element.style[key] = css[type][key];
                                    }
                                }
                                return element;
                            }
                        }
                        var div = create_elem("div");
                        if (this.scope) {
                            div.appendChild(create_elem("scope", this.scope));
                        }
                        return div;
                    }
                };
                csm.build_info_container = function(element) {
                    if (element.dataset.extensions === "" && element.dataset.loadRules === "all") {
                        return;
                    }
                    var info_container = new csm.InfoContainer(element.dataset.extensions, element.dataset.loadRules);
                    var new_elem = info_container.buildContent();
                    if (new_elem.hasChildNodes()) {
                        let anchor = element.children[0].children[1].children[5];
                        if (anchor && anchor.hasAttribute('data-uid')) {
                            new_elem.dataset.id = anchor.getAttribute('data-uid');
                        }
                        anchor.parentNode.insertBefore(new_elem, anchor);
                    }
                };
                csm.build_scope = function(type) {
                    function build_extension_scope(elem) {
                        var curr_scope = (utui.data.customizations[elem.dataset.id].scope.split());
                        return curr_scope[0].split(",").map(function(scope) {
                            if (scope === "global") {
                                let new_scope = "AT";
                                let exec_option = utui.data.customizations[elem.dataset.id].advExecOption ? utui.data.customizations[elem.dataset.id].advExecOption : "";
                                if (exec_option) {
                                    exec_option = ":" + exec_option.toUpperCase();
                                    new_scope = new_scope + exec_option;
                                }
                                return new_scope;
                            } else if (scope === "preload") {
                                return "PRE";
                            } else if (scope === "domready") {
                                return "DOM";
                            } else {
                                return scope;
                            }
                        });
                    }
                    var scope = {};
                    if (type === "manage") {
                        var ext = utui.data.customizations;
                        Object.keys(ext).forEach(function(extension) {
                            if (ext[extension].scope) {
                                let curr_scope = ext[extension].scope.split(",");
                                curr_scope.forEach(function(e, i) {
                                    scope[e] = scope[e] || [];
                                    scope[e].push(extension);
                                });
                            }
                        });
                        return scope;
                    } else if (type === "customizations") {
                        $(".customize_container").each(function(i, elem) {
                            scope[elem.dataset.id] = build_extension_scope(elem);
                        });
                        return scope;
                    }
                };
                csm.add_info = function() {
                    var tags, extensions;
                    if (csm.chkbox.get_state() === false) {
                        return;
                    }
                    var curr_tab = csm.get_current_tab();
                    if (curr_tab === "manage") {
                        // build the data-set
                        tags = (function() {return {elems: jQuery(".manage_container").toArray(),scope: csm.build_scope(curr_tab)};}());
                        // add data-set to dom elements
                        tags.elems.map(function(elem) {
                            elem.dataset.loadRules = utui.data.manage[elem.dataset.id].loadrule;
                            if (tags.scope[elem.dataset.id]) {elem.dataset.extensions = tags.scope[elem.dataset.id].join(", ");}
                            else {elem.dataset.extensions = "";}
                            return elem;
                        });
                        tags.elems.forEach(function(elem) {csm.build_info_container(elem);})
                        window.setTimeout(function(){qtip_init({force: true,debug: false})},100)
                    }

                    else if (curr_tab === "customizations") {
                        extensions = (function() {return {elems: jQuery(".customize_container").toArray(),scope: csm.build_scope(curr_tab)};})();
                        extensions.elems.forEach(function(elem, i) {
                            var info_container;
                            if (extensions.scope[elem.dataset.id]) {
                                elem.dataset.scope = extensions.scope[elem.dataset.id].join(",");
                                info_container = new csm.ExtensionsInfoContainer(elem.dataset.scope).buildContent();
                                info_container.id = "info" + "_" + elem.dataset.id;
                                fastdom.mutate(() => {
                                    var anchor = elem.children[0].children[1].children[5];
                                    anchor.parentNode.insertBefore(info_container, anchor);
                                });
                            }
                        });
                    }
                };
                csm.add_restore_callback = function() {
                    $(".tabLabel").on("mouseup", function(e) {
                        csm.remove_info();
                        window.requestIdleCallback(function() {
                            csm.chkbox.get_state() ? $(".container_label").addClass("hidden") : $(".container_label").removeClass("hidden");
                            if (csm.has_info()) {
                                csm.remove_info();
                            }
                            csm.add_info();
                        });
                    });
                };
                csm.prime_css();
                if (!csm.checkbox_manage) {
                    csm.create_checkbox.tags();
                }
                if (!csm.checkbox_customizations) {
                    csm.create_checkbox.customizations();
                }
                csm.add_restore_callback();
            })();
        }
    }
    /************** Pretty Print JSCode Start ***************************/
    if (features.prettyPrint.enabled) {
     function getCodeEditor() {
          // javascript beautify
          var jsb = (function() {
                 require=function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}({1:[function(require,module,exports){(function(global){(function(){function mergeOpts(allOptions,targetType){var finalOpts={};var name;for(name in allOptions){if(name!==targetType){finalOpts[name]=allOptions[name]}}if(targetType in allOptions){for(name in allOptions[targetType]){finalOpts[name]=allOptions[targetType][name]}}return finalOpts}var lineBreak=/\r\n|[\n\r\u2028\u2029]/;var allLineBreaks=new RegExp(lineBreak.source,"g");function css_beautify(source_text,options){options=options||{};options=mergeOpts(options,"css");source_text=source_text||"";var newlinesFromLastWSEat=0;var indentSize=options.indent_size?parseInt(options.indent_size,10):4;var indentCharacter=options.indent_char||" ";var preserve_newlines=options.preserve_newlines===undefined?false:options.preserve_newlines;var selectorSeparatorNewline=options.selector_separator_newline===undefined?true:options.selector_separator_newline;var end_with_newline=options.end_with_newline===undefined?false:options.end_with_newline;var newline_between_rules=options.newline_between_rules===undefined?true:options.newline_between_rules;var space_around_combinator=options.space_around_combinator===undefined?false:options.space_around_combinator;space_around_combinator=space_around_combinator||(options.space_around_selector_separator===undefined?false:options.space_around_selector_separator);var eol=options.eol?options.eol:"auto";if(options.indent_with_tabs){indentCharacter="\t";indentSize=1}if(eol==="auto"){eol="\n";if(source_text&&lineBreak.test(source_text||"")){eol=source_text.match(lineBreak)[0]}}eol=eol.replace(/\\r/,"\r").replace(/\\n/,"\n");source_text=source_text.replace(allLineBreaks,"\n");var whiteRe=/^\s+$/;var pos=-1,ch;var parenLevel=0;function next(){ch=source_text.charAt(++pos);return ch||""}function peek(skipWhitespace){var result="";var prev_pos=pos;if(skipWhitespace){eatWhitespace()}result=source_text.charAt(pos+1)||"";pos=prev_pos-1;next();return result}function eatString(endChars){var start=pos;while(next()){if(ch==="\\"){next()}else if(endChars.indexOf(ch)!==-1){break}else if(ch==="\n"){break}}return source_text.substring(start,pos+1)}function peekString(endChar){var prev_pos=pos;var str=eatString(endChar);pos=prev_pos-1;next();return str}function eatWhitespace(preserve_newlines_local){var result=0;while(whiteRe.test(peek())){next();if(ch==="\n"&&preserve_newlines_local&&preserve_newlines){print.newLine(true);result++}}newlinesFromLastWSEat=result;return result}function skipWhitespace(){var result="";if(ch&&whiteRe.test(ch)){result=ch}while(whiteRe.test(next())){result+=ch}return result}function eatComment(singleLine){var start=pos;singleLine=peek()==="/";next();while(next()){if(!singleLine&&ch==="*"&&peek()==="/"){next();break}else if(singleLine&&ch==="\n"){return source_text.substring(start,pos)}}return source_text.substring(start,pos)+ch}function lookBack(str){return source_text.substring(pos-str.length,pos).toLowerCase()===str}function foundNestedPseudoClass(){var openParen=0;for(var i=pos+1;i<source_text.length;i++){var ch=source_text.charAt(i);if(ch==="{"){return true}else if(ch==="("){openParen+=1}else if(ch===")"){if(openParen===0){return false}openParen-=1}else if(ch===";"||ch==="}"){return false}}return false}var basebaseIndentString=source_text.match(/^[\t ]*/)[0];var singleIndent=new Array(indentSize+1).join(indentCharacter);var indentLevel=0;var nestedLevel=0;function indent(){indentLevel++;basebaseIndentString+=singleIndent}function outdent(){indentLevel--;basebaseIndentString=basebaseIndentString.slice(0,-indentSize)}var print={};print["{"]=function(ch){print.singleSpace();output.push(ch);if(!eatWhitespace(true)){print.newLine()}};print["}"]=function(newline){if(newline){print.newLine()}output.push("}");if(!eatWhitespace(true)){print.newLine()}};print._lastCharWhitespace=function(){return whiteRe.test(output[output.length-1])};print.newLine=function(keepWhitespace){if(output.length){if(!keepWhitespace&&output[output.length-1]!=="\n"){print.trim()}else if(output[output.length-1]===basebaseIndentString){output.pop()}output.push("\n");if(basebaseIndentString){output.push(basebaseIndentString)}}};print.singleSpace=function(){if(output.length&&!print._lastCharWhitespace()){output.push(" ")}};print.preserveSingleSpace=function(){if(isAfterSpace){print.singleSpace()}};print.trim=function(){while(print._lastCharWhitespace()){output.pop()}};var output=[];var insideRule=false;var insidePropertyValue=false;var enteringConditionalGroup=false;var top_ch="";var last_top_ch="";while(true){var whitespace=skipWhitespace();var isAfterSpace=whitespace!=="";var isAfterNewline=whitespace.indexOf("\n")!==-1;last_top_ch=top_ch;top_ch=ch;if(!ch){break}else if(ch==="/"&&peek()==="*"){var header=indentLevel===0;if(isAfterNewline||header){print.newLine()}output.push(eatComment());print.newLine();if(header){print.newLine(true)}}else if(ch==="/"&&peek()==="/"){if(!isAfterNewline&&last_top_ch!=="{"){print.trim()}print.singleSpace();output.push(eatComment());print.newLine()}else if(ch==="@"){print.preserveSingleSpace();if(peek()==="{"){output.push(eatString("}"))}else{output.push(ch);var variableOrRule=peekString(": ,;{}()[]/='\"");if(variableOrRule.match(/[ :]$/)){next();variableOrRule=eatString(": ").replace(/\s$/,"");output.push(variableOrRule);print.singleSpace()}variableOrRule=variableOrRule.replace(/\s$/,"");if(variableOrRule in css_beautify.NESTED_AT_RULE){nestedLevel+=1;if(variableOrRule in css_beautify.CONDITIONAL_GROUP_RULE){enteringConditionalGroup=true}}}}else if(ch==="#"&&peek()==="{"){print.preserveSingleSpace();output.push(eatString("}"))}else if(ch==="{"){if(peek(true)==="}"){eatWhitespace();next();print.singleSpace();output.push("{");print["}"](false);if(newlinesFromLastWSEat<2&&newline_between_rules&&indentLevel===0){print.newLine(true)}}else{indent();print["{"](ch);if(enteringConditionalGroup){enteringConditionalGroup=false;insideRule=indentLevel>nestedLevel}else{insideRule=indentLevel>=nestedLevel}}}else if(ch==="}"){outdent();print["}"](true);insideRule=false;insidePropertyValue=false;if(nestedLevel){nestedLevel--}if(newlinesFromLastWSEat<2&&newline_between_rules&&indentLevel===0){print.newLine(true)}}else if(ch===":"){eatWhitespace();if((insideRule||enteringConditionalGroup)&&!(lookBack("&")||foundNestedPseudoClass())&&!lookBack("(")){output.push(":");if(!insidePropertyValue){insidePropertyValue=true;print.singleSpace()}}else{if(lookBack(" ")&&output[output.length-1]!==" "){output.push(" ")}if(peek()===":"){next();output.push("::")}else{output.push(":")}}}else if(ch==='"'||ch==="'"){print.preserveSingleSpace();output.push(eatString(ch))}else if(ch===";"){insidePropertyValue=false;output.push(ch);if(!eatWhitespace(true)){print.newLine()}}else if(ch==="("){if(lookBack("url")){output.push(ch);eatWhitespace();if(next()){if(ch!==")"&&ch!=='"'&&ch!=="'"){output.push(eatString(")"))}else{pos--}}}else{parenLevel++;print.preserveSingleSpace();output.push(ch);eatWhitespace()}}else if(ch===")"){output.push(ch);parenLevel--}else if(ch===","){output.push(ch);if(!eatWhitespace(true)&&selectorSeparatorNewline&&!insidePropertyValue&&parenLevel<1){print.newLine()}else{print.singleSpace()}}else if((ch===">"||ch==="+"||ch==="~")&&!insidePropertyValue&&parenLevel<1){if(space_around_combinator){print.singleSpace();output.push(ch);print.singleSpace()}else{output.push(ch);eatWhitespace();if(ch&&whiteRe.test(ch)){ch=""}}}else if(ch==="]"){output.push(ch)}else if(ch==="["){print.preserveSingleSpace();output.push(ch)}else if(ch==="="){eatWhitespace();output.push("=");if(whiteRe.test(ch)){ch=""}}else{print.preserveSingleSpace();output.push(ch)}}var sweetCode="";if(basebaseIndentString){sweetCode+=basebaseIndentString}sweetCode+=output.join("").replace(/[\r\n\t ]+$/,"");if(end_with_newline){sweetCode+="\n"}if(eol!=="\n"){sweetCode=sweetCode.replace(/[\n]/g,eol)}return sweetCode}css_beautify.NESTED_AT_RULE={"@page":true,"@font-face":true,"@keyframes":true,"@media":true,"@supports":true,"@document":true};css_beautify.CONDITIONAL_GROUP_RULE={"@media":true,"@supports":true,"@document":true};if(typeof define==="function"&&define.amd){define([],function(){return{css_beautify:css_beautify}})}else if(typeof exports!=="undefined"){exports.css_beautify=css_beautify}else if(typeof window!=="undefined"){window.css_beautify=css_beautify}else if(typeof global!=="undefined"){global.css_beautify=css_beautify}})()}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{}],2:[function(require,module,exports){(function(global){(function(){function ltrim(s){return s.replace(/^\s+/g,"")}function rtrim(s){return s.replace(/\s+$/g,"")}function mergeOpts(allOptions,targetType){var finalOpts={};var name;for(name in allOptions){if(name!==targetType){finalOpts[name]=allOptions[name]}}if(targetType in allOptions){for(name in allOptions[targetType]){finalOpts[name]=allOptions[targetType][name]}}return finalOpts}var lineBreak=/\r\n|[\n\r\u2028\u2029]/;var allLineBreaks=new RegExp(lineBreak.source,"g");function style_html(html_source,options,js_beautify,css_beautify){var multi_parser,indent_inner_html,indent_body_inner_html,indent_head_inner_html,indent_size,indent_character,wrap_line_length,brace_style,unformatted,content_unformatted,preserve_newlines,max_preserve_newlines,indent_handlebars,wrap_attributes,wrap_attributes_indent_size,is_wrap_attributes_force,is_wrap_attributes_force_expand_multiline,is_wrap_attributes_force_aligned,end_with_newline,extra_liners,eol;options=options||{};options=mergeOpts(options,"html");if((options.wrap_line_length===undefined||parseInt(options.wrap_line_length,10)===0)&&(options.max_char!==undefined&&parseInt(options.max_char,10)!==0)){options.wrap_line_length=options.max_char}indent_inner_html=options.indent_inner_html===undefined?false:options.indent_inner_html;indent_body_inner_html=options.indent_body_inner_html===undefined?true:options.indent_body_inner_html;indent_head_inner_html=options.indent_head_inner_html===undefined?true:options.indent_head_inner_html;indent_size=options.indent_size===undefined?4:parseInt(options.indent_size,10);indent_character=options.indent_char===undefined?" ":options.indent_char;brace_style=options.brace_style===undefined?"collapse":options.brace_style;wrap_line_length=parseInt(options.wrap_line_length,10)===0?32786:parseInt(options.wrap_line_length||250,10);unformatted=options.unformatted||["a","abbr","area","audio","b","bdi","bdo","br","button","canvas","cite","code","data","datalist","del","dfn","em","embed","i","iframe","img","input","ins","kbd","keygen","label","map","mark","math","meter","noscript","object","output","progress","q","ruby","s","samp","select","small","span","strong","sub","sup","svg","template","textarea","time","u","var","video","wbr","text","acronym","address","big","dt","ins","strike","tt"];content_unformatted=options.content_unformatted||["pre"];preserve_newlines=options.preserve_newlines===undefined?true:options.preserve_newlines;max_preserve_newlines=preserve_newlines?isNaN(parseInt(options.max_preserve_newlines,10))?32786:parseInt(options.max_preserve_newlines,10):0;indent_handlebars=options.indent_handlebars===undefined?false:options.indent_handlebars;wrap_attributes=options.wrap_attributes===undefined?"auto":options.wrap_attributes;wrap_attributes_indent_size=isNaN(parseInt(options.wrap_attributes_indent_size,10))?indent_size:parseInt(options.wrap_attributes_indent_size,10);is_wrap_attributes_force=wrap_attributes.substr(0,"force".length)==="force";is_wrap_attributes_force_expand_multiline=wrap_attributes==="force-expand-multiline";is_wrap_attributes_force_aligned=wrap_attributes==="force-aligned";end_with_newline=options.end_with_newline===undefined?false:options.end_with_newline;extra_liners=typeof options.extra_liners==="object"&&options.extra_liners?options.extra_liners.concat():typeof options.extra_liners==="string"?options.extra_liners.split(","):"head,body,/html".split(",");eol=options.eol?options.eol:"auto";if(options.indent_with_tabs){indent_character="\t";indent_size=1}if(eol==="auto"){eol="\n";if(html_source&&lineBreak.test(html_source||"")){eol=html_source.match(lineBreak)[0]}}eol=eol.replace(/\\r/,"\r").replace(/\\n/,"\n");html_source=html_source.replace(allLineBreaks,"\n");function Parser(){this.pos=0;this.token="";this.current_mode="CONTENT";this.tags={parent:"parent1",parentcount:1,parent1:""};this.tag_type="";this.token_text=this.last_token=this.last_text=this.token_type="";this.newlines=0;this.indent_content=indent_inner_html;this.indent_body_inner_html=indent_body_inner_html;this.indent_head_inner_html=indent_head_inner_html;this.Utils={whitespace:"\n\r\t ".split(""),single_token:options.void_elements||["area","base","br","col","embed","hr","img","input","keygen","link","menuitem","meta","param","source","track","wbr","!doctype","?xml","?php","basefont","isindex"],extra_liners:extra_liners,in_array:function(what,arr){for(var i=0;i<arr.length;i++){if(what===arr[i]){return true}}return false}};this.is_whitespace=function(text){for(var n=0;n<text.length;n++){if(!this.Utils.in_array(text.charAt(n),this.Utils.whitespace)){return false}}return true};this.traverse_whitespace=function(){var input_char="";input_char=this.input.charAt(this.pos);if(this.Utils.in_array(input_char,this.Utils.whitespace)){this.newlines=0;while(this.Utils.in_array(input_char,this.Utils.whitespace)){if(preserve_newlines&&input_char==="\n"&&this.newlines<=max_preserve_newlines){this.newlines+=1}this.pos++;input_char=this.input.charAt(this.pos)}return true}return false};this.space_or_wrap=function(content){if(this.line_char_count>=this.wrap_line_length){this.print_newline(false,content);this.print_indentation(content);return true}else{this.line_char_count++;content.push(" ");return false}};this.get_content=function(){var input_char="",content=[],handlebarsStarted=0;while(this.input.charAt(this.pos)!=="<"||handlebarsStarted===2){if(this.pos>=this.input.length){return content.length?content.join(""):["","TK_EOF"]}if(handlebarsStarted<2&&this.traverse_whitespace()){this.space_or_wrap(content);continue}input_char=this.input.charAt(this.pos);if(indent_handlebars){if(input_char==="{"){handlebarsStarted+=1}else if(handlebarsStarted<2){handlebarsStarted=0}if(input_char==="}"&&handlebarsStarted>0){if(handlebarsStarted--===0){break}}var peek3=this.input.substr(this.pos,3);if(peek3==="{{#"||peek3==="{{/"){break}else if(peek3==="{{!"){return[this.get_tag(),"TK_TAG_HANDLEBARS_COMMENT"]}else if(this.input.substr(this.pos,2)==="{{"){if(this.get_tag(true)==="{{else}}"){break}}}this.pos++;this.line_char_count++;content.push(input_char)}return content.length?content.join(""):""};this.get_contents_to=function(name){if(this.pos===this.input.length){return["","TK_EOF"]}var content="";var reg_match=new RegExp("</"+name+"\\s*>","igm");reg_match.lastIndex=this.pos;var reg_array=reg_match.exec(this.input);var end_script=reg_array?reg_array.index:this.input.length;if(this.pos<end_script){content=this.input.substring(this.pos,end_script);this.pos=end_script}return content};this.record_tag=function(tag){if(this.tags[tag+"count"]){this.tags[tag+"count"]++;this.tags[tag+this.tags[tag+"count"]]=this.indent_level}else{this.tags[tag+"count"]=1;this.tags[tag+this.tags[tag+"count"]]=this.indent_level}this.tags[tag+this.tags[tag+"count"]+"parent"]=this.tags.parent;this.tags.parent=tag+this.tags[tag+"count"]};this.retrieve_tag=function(tag){if(this.tags[tag+"count"]){var temp_parent=this.tags.parent;while(temp_parent){if(tag+this.tags[tag+"count"]===temp_parent){break}temp_parent=this.tags[temp_parent+"parent"]}if(temp_parent){this.indent_level=this.tags[tag+this.tags[tag+"count"]];this.tags.parent=this.tags[temp_parent+"parent"]}delete this.tags[tag+this.tags[tag+"count"]+"parent"];delete this.tags[tag+this.tags[tag+"count"]];if(this.tags[tag+"count"]===1){delete this.tags[tag+"count"]}else{this.tags[tag+"count"]--}}};this.indent_to_tag=function(tag){if(!this.tags[tag+"count"]){return}var temp_parent=this.tags.parent;while(temp_parent){if(tag+this.tags[tag+"count"]===temp_parent){break}temp_parent=this.tags[temp_parent+"parent"]}if(temp_parent){this.indent_level=this.tags[tag+this.tags[tag+"count"]]}};this.get_tag=function(peek){var input_char="",content=[],comment="",space=false,first_attr=true,has_wrapped_attrs=false,tag_start,tag_end,tag_start_char,orig_pos=this.pos,orig_line_char_count=this.line_char_count,is_tag_closed=false,tail;peek=peek!==undefined?peek:false;do{if(this.pos>=this.input.length){if(peek){this.pos=orig_pos;this.line_char_count=orig_line_char_count}return content.length?content.join(""):["","TK_EOF"]}input_char=this.input.charAt(this.pos);this.pos++;if(this.Utils.in_array(input_char,this.Utils.whitespace)){space=true;continue}if(input_char==="'"||input_char==='"'){input_char+=this.get_unformatted(input_char);space=true}if(input_char==="="){space=false}tail=this.input.substr(this.pos-1);if(is_wrap_attributes_force_expand_multiline&&has_wrapped_attrs&&!is_tag_closed&&(input_char===">"||input_char==="/")){if(tail.match(/^\/?\s*>/)){space=false;is_tag_closed=true;this.print_newline(false,content);this.print_indentation(content)}}if(content.length&&content[content.length-1]!=="="&&input_char!==">"&&space){var wrapped=this.space_or_wrap(content);var indentAttrs=wrapped&&input_char!=="/"&&!is_wrap_attributes_force;space=false;if(is_wrap_attributes_force&&input_char!=="/"){var force_first_attr_wrap=false;if(is_wrap_attributes_force_expand_multiline&&first_attr){var is_only_attribute=tail.match(/^\S*(="([^"]|\\")*")?\s*\/?\s*>/)!==null;force_first_attr_wrap=!is_only_attribute}if(!first_attr||force_first_attr_wrap){this.print_newline(false,content);this.print_indentation(content);indentAttrs=true}}if(indentAttrs){has_wrapped_attrs=true;var alignment_size=wrap_attributes_indent_size;if(is_wrap_attributes_force_aligned){alignment_size=content.indexOf(" ")+1}for(var count=0;count<alignment_size;count++){content.push(" ")}}if(first_attr){for(var i=0;i<content.length;i++){if(content[i]===" "){first_attr=false;break}}}}if(indent_handlebars&&tag_start_char==="<"){if(input_char+this.input.charAt(this.pos)==="{{"){input_char+=this.get_unformatted("}}");if(content.length&&content[content.length-1]!==" "&&content[content.length-1]!=="<"){input_char=" "+input_char}space=true}}if(input_char==="<"&&!tag_start_char){tag_start=this.pos-1;tag_start_char="<"}if(indent_handlebars&&!tag_start_char){if(content.length>=2&&content[content.length-1]==="{"&&content[content.length-2]==="{"){if(input_char==="#"||input_char==="/"||input_char==="!"){tag_start=this.pos-3}else{tag_start=this.pos-2}tag_start_char="{"}}this.line_char_count++;content.push(input_char);if(content[1]&&(content[1]==="!"||content[1]==="?"||content[1]==="%")){content=[this.get_comment(tag_start)];break}if(indent_handlebars&&content[1]&&content[1]==="{"&&content[2]&&content[2]==="!"){content=[this.get_comment(tag_start)];break}if(indent_handlebars&&tag_start_char==="{"&&content.length>2&&content[content.length-2]==="}"&&content[content.length-1]==="}"){break}}while(input_char!==">");var tag_complete=content.join("");var tag_index;var tag_offset;if(tag_complete.indexOf(" ")!==-1){tag_index=tag_complete.indexOf(" ")}else if(tag_complete.indexOf("\n")!==-1){tag_index=tag_complete.indexOf("\n")}else if(tag_complete.charAt(0)==="{"){tag_index=tag_complete.indexOf("}")}else{tag_index=tag_complete.indexOf(">")}if(tag_complete.charAt(0)==="<"||!indent_handlebars){tag_offset=1}else{tag_offset=tag_complete.charAt(2)==="#"?3:2}var tag_check=tag_complete.substring(tag_offset,tag_index).toLowerCase();if(tag_complete.charAt(tag_complete.length-2)==="/"||this.Utils.in_array(tag_check,this.Utils.single_token)){if(!peek){this.tag_type="SINGLE"}}else if(indent_handlebars&&tag_complete.charAt(0)==="{"&&tag_check==="else"){if(!peek){this.indent_to_tag("if");this.tag_type="HANDLEBARS_ELSE";this.indent_content=true;this.traverse_whitespace()}}else if(this.is_unformatted(tag_check,unformatted)||this.is_unformatted(tag_check,content_unformatted)){comment=this.get_unformatted("</"+tag_check+">",tag_complete);content.push(comment);tag_end=this.pos-1;this.tag_type="SINGLE"}else if(tag_check==="script"&&(tag_complete.search("type")===-1||tag_complete.search("type")>-1&&tag_complete.search(/\b(text|application|dojo)\/(x-)?(javascript|ecmascript|jscript|livescript|(ld\+)?json|method|aspect)/)>-1)){if(!peek){this.record_tag(tag_check);this.tag_type="SCRIPT"}}else if(tag_check==="style"&&(tag_complete.search("type")===-1||tag_complete.search("type")>-1&&tag_complete.search("text/css")>-1)){if(!peek){this.record_tag(tag_check);this.tag_type="STYLE"}}else if(tag_check.charAt(0)==="!"){if(!peek){this.tag_type="SINGLE";this.traverse_whitespace()}}else if(!peek){if(tag_check.charAt(0)==="/"){this.retrieve_tag(tag_check.substring(1));this.tag_type="END"}else{this.record_tag(tag_check);if(tag_check.toLowerCase()!=="html"){this.indent_content=true}this.tag_type="START"}if(this.traverse_whitespace()){this.space_or_wrap(content)}if(this.Utils.in_array(tag_check,this.Utils.extra_liners)){this.print_newline(false,this.output);if(this.output.length&&this.output[this.output.length-2]!=="\n"){this.print_newline(true,this.output)}}}if(peek){this.pos=orig_pos;this.line_char_count=orig_line_char_count}return content.join("")};this.get_comment=function(start_pos){var comment="",delimiter=">",matched=false;this.pos=start_pos;var input_char=this.input.charAt(this.pos);this.pos++;while(this.pos<=this.input.length){comment+=input_char;if(comment.charAt(comment.length-1)===delimiter.charAt(delimiter.length-1)&&comment.indexOf(delimiter)!==-1){break}if(!matched&&comment.length<10){if(comment.indexOf("<![if")===0){delimiter="<![endif]>";matched=true}else if(comment.indexOf("<![cdata[")===0){delimiter="]]>";matched=true}else if(comment.indexOf("<![")===0){delimiter="]>";matched=true}else if(comment.indexOf("<!--")===0){delimiter="-->";matched=true}else if(comment.indexOf("{{!--")===0){delimiter="--}}";matched=true}else if(comment.indexOf("{{!")===0){if(comment.length===5&&comment.indexOf("{{!--")===-1){delimiter="}}";matched=true}}else if(comment.indexOf("<?")===0){delimiter="?>";matched=true}else if(comment.indexOf("<%")===0){delimiter="%>";matched=true}}input_char=this.input.charAt(this.pos);this.pos++}return comment};function tokenMatcher(delimiter){var token="";var add=function(str){var newToken=token+str.toLowerCase();token=newToken.length<=delimiter.length?newToken:newToken.substr(newToken.length-delimiter.length,delimiter.length)};var doesNotMatch=function(){return token.indexOf(delimiter)===-1};return{add:add,doesNotMatch:doesNotMatch}}this.get_unformatted=function(delimiter,orig_tag){if(orig_tag&&orig_tag.toLowerCase().indexOf(delimiter)!==-1){return""}var input_char="";var content="";var space=true;var delimiterMatcher=tokenMatcher(delimiter);do{if(this.pos>=this.input.length){return content}input_char=this.input.charAt(this.pos);this.pos++;if(this.Utils.in_array(input_char,this.Utils.whitespace)){if(!space){this.line_char_count--;continue}if(input_char==="\n"||input_char==="\r"){content+="\n";this.line_char_count=0;continue}}content+=input_char;delimiterMatcher.add(input_char);this.line_char_count++;space=true;if(indent_handlebars&&input_char==="{"&&content.length&&content.charAt(content.length-2)==="{"){content+=this.get_unformatted("}}")}}while(delimiterMatcher.doesNotMatch());return content};this.get_token=function(){var token;if(this.last_token==="TK_TAG_SCRIPT"||this.last_token==="TK_TAG_STYLE"){var type=this.last_token.substr(7);token=this.get_contents_to(type);if(typeof token!=="string"){return token}return[token,"TK_"+type]}if(this.current_mode==="CONTENT"){token=this.get_content();if(typeof token!=="string"){return token}else{return[token,"TK_CONTENT"]}}if(this.current_mode==="TAG"){token=this.get_tag();if(typeof token!=="string"){return token}else{var tag_name_type="TK_TAG_"+this.tag_type;return[token,tag_name_type]}}};this.get_full_indent=function(level){level=this.indent_level+level||0;if(level<1){return""}return Array(level+1).join(this.indent_string)};this.is_unformatted=function(tag_check,unformatted){if(!this.Utils.in_array(tag_check,unformatted)){return false}if(tag_check.toLowerCase()!=="a"||!this.Utils.in_array("a",unformatted)){return true}var next_tag=this.get_tag(true);var tag=(next_tag||"").match(/^\s*<\s*\/?([a-z]*)\s*[^>]*>\s*$/);if(!tag||this.Utils.in_array(tag[1],unformatted)){return true}else{return false}};this.printer=function(js_source,indent_character,indent_size,wrap_line_length,brace_style){this.input=js_source||"";this.input=this.input.replace(/\r\n|[\r\u2028\u2029]/g,"\n");this.output=[];this.indent_character=indent_character;this.indent_string="";this.indent_size=indent_size;this.brace_style=brace_style;this.indent_level=0;this.wrap_line_length=wrap_line_length;this.line_char_count=0;for(var i=0;i<this.indent_size;i++){this.indent_string+=this.indent_character}this.print_newline=function(force,arr){this.line_char_count=0;if(!arr||!arr.length){return}if(force||arr[arr.length-1]!=="\n"){if(arr[arr.length-1]!=="\n"){arr[arr.length-1]=rtrim(arr[arr.length-1])}arr.push("\n")}};this.print_indentation=function(arr){for(var i=0;i<this.indent_level;i++){arr.push(this.indent_string);this.line_char_count+=this.indent_string.length}};this.print_token=function(text){if(this.is_whitespace(text)&&!this.output.length){return}if(text||text!==""){if(this.output.length&&this.output[this.output.length-1]==="\n"){this.print_indentation(this.output);text=ltrim(text)}}this.print_token_raw(text)};this.print_token_raw=function(text){if(this.newlines>0){text=rtrim(text)}if(text&&text!==""){if(text.length>1&&text.charAt(text.length-1)==="\n"){this.output.push(text.slice(0,-1));this.print_newline(false,this.output)}else{this.output.push(text)}}for(var n=0;n<this.newlines;n++){this.print_newline(n>0,this.output)}this.newlines=0};this.indent=function(){this.indent_level++};this.unindent=function(){if(this.indent_level>0){this.indent_level--}}};return this}multi_parser=new Parser;multi_parser.printer(html_source,indent_character,indent_size,wrap_line_length,brace_style);while(true){var t=multi_parser.get_token();multi_parser.token_text=t[0];multi_parser.token_type=t[1];if(multi_parser.token_type==="TK_EOF"){break}switch(multi_parser.token_type){case"TK_TAG_START":multi_parser.print_newline(false,multi_parser.output);multi_parser.print_token(multi_parser.token_text);if(multi_parser.indent_content){if((multi_parser.indent_body_inner_html||!multi_parser.token_text.match(/<body(?:.*)>/))&&(multi_parser.indent_head_inner_html||!multi_parser.token_text.match(/<head(?:.*)>/))){multi_parser.indent()}multi_parser.indent_content=false}multi_parser.current_mode="CONTENT";break;case"TK_TAG_STYLE":case"TK_TAG_SCRIPT":multi_parser.print_newline(false,multi_parser.output);multi_parser.print_token(multi_parser.token_text);multi_parser.current_mode="CONTENT";break;case"TK_TAG_END":if(multi_parser.last_token==="TK_CONTENT"&&multi_parser.last_text===""){var tag_name=(multi_parser.token_text.match(/\w+/)||[])[0];var tag_extracted_from_last_output=null;if(multi_parser.output.length){tag_extracted_from_last_output=multi_parser.output[multi_parser.output.length-1].match(/(?:<|{{#)\s*(\w+)/)}if(tag_extracted_from_last_output===null||tag_extracted_from_last_output[1]!==tag_name&&!multi_parser.Utils.in_array(tag_extracted_from_last_output[1],unformatted)){multi_parser.print_newline(false,multi_parser.output)}}multi_parser.print_token(multi_parser.token_text);multi_parser.current_mode="CONTENT";break;case"TK_TAG_SINGLE":var tag_check=multi_parser.token_text.match(/^\s*<([a-z-]+)/i);if(!tag_check||!multi_parser.Utils.in_array(tag_check[1],unformatted)){multi_parser.print_newline(false,multi_parser.output)}multi_parser.print_token(multi_parser.token_text);multi_parser.current_mode="CONTENT";break;case"TK_TAG_HANDLEBARS_ELSE":var foundIfOnCurrentLine=false;for(var lastCheckedOutput=multi_parser.output.length-1;lastCheckedOutput>=0;lastCheckedOutput--){if(multi_parser.output[lastCheckedOutput]==="\n"){break}else{if(multi_parser.output[lastCheckedOutput].match(/{{#if/)){foundIfOnCurrentLine=true;break}}}if(!foundIfOnCurrentLine){multi_parser.print_newline(false,multi_parser.output)}multi_parser.print_token(multi_parser.token_text);if(multi_parser.indent_content){multi_parser.indent();multi_parser.indent_content=false}multi_parser.current_mode="CONTENT";break;case"TK_TAG_HANDLEBARS_COMMENT":multi_parser.print_token(multi_parser.token_text);multi_parser.current_mode="TAG";break;case"TK_CONTENT":multi_parser.print_token(multi_parser.token_text);multi_parser.current_mode="TAG";break;case"TK_STYLE":case"TK_SCRIPT":if(multi_parser.token_text!==""){multi_parser.print_newline(false,multi_parser.output);var text=multi_parser.token_text,_beautifier,script_indent_level=1;if(multi_parser.token_type==="TK_SCRIPT"){_beautifier=typeof js_beautify==="function"&&js_beautify}else if(multi_parser.token_type==="TK_STYLE"){_beautifier=typeof css_beautify==="function"&&css_beautify}if(options.indent_scripts==="keep"){script_indent_level=0}else if(options.indent_scripts==="separate"){script_indent_level=-multi_parser.indent_level}var indentation=multi_parser.get_full_indent(script_indent_level);if(_beautifier){var Child_options=function(){this.eol="\n"};Child_options.prototype=options;var child_options=new Child_options;text=_beautifier(text.replace(/^\s*/,indentation),child_options)}else{var white=text.match(/^\s*/)[0];var _level=white.match(/[^\n\r]*$/)[0].split(multi_parser.indent_string).length-1;var reindent=multi_parser.get_full_indent(script_indent_level-_level);text=text.replace(/^\s*/,indentation).replace(/\r\n|\r|\n/g,"\n"+reindent).replace(/\s+$/,"")}if(text){multi_parser.print_token_raw(text);multi_parser.print_newline(true,multi_parser.output)}}multi_parser.current_mode="TAG";break;default:if(multi_parser.token_text!==""){multi_parser.print_token(multi_parser.token_text)}break}multi_parser.last_token=multi_parser.token_type;multi_parser.last_text=multi_parser.token_text}var sweet_code=multi_parser.output.join("").replace(/[\r\n\t ]+$/,"");if(end_with_newline){sweet_code+="\n"}if(eol!=="\n"){sweet_code=sweet_code.replace(/[\n]/g,eol)}return sweet_code}if(typeof define==="function"&&define.amd){define(["require","./beautify","./beautify-css"],function(requireamd){var js_beautify=requireamd("./beautify");var css_beautify=requireamd("./beautify-css");return{html_beautify:function(html_source,options){return style_html(html_source,options,js_beautify.js_beautify,css_beautify.css_beautify)}}})}else if(typeof exports!=="undefined"){var js_beautify=require("./beautify.js");var css_beautify=require("./beautify-css.js");exports.html_beautify=function(html_source,options){return style_html(html_source,options,js_beautify.js_beautify,css_beautify.css_beautify)}}else if(typeof window!=="undefined"){window.html_beautify=function(html_source,options){return style_html(html_source,options,window.js_beautify,window.css_beautify)}}else if(typeof global!=="undefined"){global.html_beautify=function(html_source,options){return style_html(html_source,options,global.js_beautify,global.css_beautify)}}})()}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{"./beautify-css.js":1,"./beautify.js":3}],3:[function(require,module,exports){(function(global){if(!Object.values){Object.values=function(o){if(o!==Object(o)){
                 throw new TypeError("Object.values called on a non-object")}var k=[],p;for(p in o){if(Object.prototype.hasOwnProperty.call(o,p)){k.push(o[p])}}return k}}(function(){function mergeOpts(allOptions,targetType){var finalOpts={};var name;for(name in allOptions){if(name!==targetType){finalOpts[name]=allOptions[name]}}if(targetType in allOptions){for(name in allOptions[targetType]){finalOpts[name]=allOptions[targetType][name]}}return finalOpts}function js_beautify(js_source_text,options){var acorn={};(function(exports){var nonASCIIwhitespace=/[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/;var nonASCIIidentifierStartChars="ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԧԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠࢢ-ࢬऄ-हऽॐक़-ॡॱ-ॷॹ-ॿঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-ళవ-హఽౘౙౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൠൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛰᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤜᥐ-ᥭᥰ-ᥴᦀ-ᦫᧁ-ᧇᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⸯ々-〇〡-〩〱-〵〸-〼ぁ-ゖゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚗꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꪀ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ";var nonASCIIidentifierChars="̀-ͯ҃-֑҇-ׇֽֿׁׂׅׄؐ-ؚؠ-ىٲ-ۓۧ-ۨۻ-ۼܰ-݊ࠀ-ࠔࠛ-ࠣࠥ-ࠧࠩ-࠭ࡀ-ࡗࣤ-ࣾऀ-ःऺ-़ा-ॏ॑-ॗॢ-ॣ०-९ঁ-ঃ়া-ৄেৈৗয়-ৠਁ-ਃ਼ਾ-ੂੇੈੋ-੍ੑ੦-ੱੵઁ-ઃ઼ા-ૅે-ૉો-્ૢ-ૣ૦-૯ଁ-ଃ଼ା-ୄେୈୋ-୍ୖୗୟ-ୠ୦-୯ஂா-ூெ-ைொ-்ௗ௦-௯ఁ-ఃె-ైొ-్ౕౖౢ-ౣ౦-౯ಂಃ಼ಾ-ೄೆ-ೈೊ-್ೕೖೢ-ೣ೦-೯ംഃെ-ൈൗൢ-ൣ൦-൯ංඃ්ා-ුූෘ-ෟෲෳิ-ฺเ-ๅ๐-๙ິ-ູ່-ໍ໐-໙༘༙༠-༩༹༵༷ཁ-ཇཱ-྄྆-྇ྍ-ྗྙ-ྼ࿆က-ဩ၀-၉ၧ-ၭၱ-ၴႂ-ႍႏ-ႝ፝-፟ᜎ-ᜐᜠ-ᜰᝀ-ᝐᝲᝳក-ឲ៝០-៩᠋-᠍᠐-᠙ᤠ-ᤫᤰ-᤻ᥑ-ᥭᦰ-ᧀᧈ-ᧉ᧐-᧙ᨀ-ᨕᨠ-ᩓ᩠-᩿᩼-᪉᪐-᪙ᭆ-ᭋ᭐-᭙᭫-᭳᮰-᮹᯦-᯳ᰀ-ᰢ᱀-᱉ᱛ-ᱽ᳐-᳒ᴀ-ᶾḁ-ἕ‌‍‿⁀⁔⃐-⃥⃜⃡-⃰ⶁ-ⶖⷠ-ⷿ〡-〨゙゚Ꙁ-ꙭꙴ-꙽ꚟ꛰-꛱ꟸ-ꠀ꠆ꠋꠣ-ꠧꢀ-ꢁꢴ-꣄꣐-꣙ꣳ-ꣷ꤀-꤉ꤦ-꤭ꤰ-ꥅꦀ-ꦃ꦳-꧀ꨀ-ꨧꩀ-ꩁꩌ-ꩍ꩐-꩙ꩻꫠ-ꫩꫲ-ꫳꯀ-ꯡ꯬꯭꯰-꯹ﬠ-ﬨ︀-️︠-︦︳︴﹍-﹏０-９＿";var nonASCIIidentifierStart=new RegExp("["+nonASCIIidentifierStartChars+"]");var nonASCIIidentifier=new RegExp("["+nonASCIIidentifierStartChars+nonASCIIidentifierChars+"]");exports.newline=/[\n\r\u2028\u2029]/;exports.lineBreak=new RegExp("\r\n|"+exports.newline.source);exports.allLineBreaks=new RegExp(exports.lineBreak.source,"g");exports.isIdentifierStart=function(code){if(code<65)return code===36||code===64;if(code<91)return true;if(code<97)return code===95;if(code<123)return true;return code>=170&&nonASCIIidentifierStart.test(String.fromCharCode(code))};exports.isIdentifierChar=function(code){if(code<48)return code===36;if(code<58)return true;if(code<65)return false;if(code<91)return true;if(code<97)return code===95;if(code<123)return true;return code>=170&&nonASCIIidentifier.test(String.fromCharCode(code))}})(acorn);function in_array(what,arr){for(var i=0;i<arr.length;i+=1){if(arr[i]===what){return true}}return false}function trim(s){return s.replace(/^\s+|\s+$/g,"")}function ltrim(s){return s.replace(/^\s+/g,"")}function sanitizeOperatorPosition(opPosition){opPosition=opPosition||OPERATOR_POSITION.before_newline;var validPositionValues=Object.values(OPERATOR_POSITION);if(!in_array(opPosition,validPositionValues)){throw new Error("Invalid Option Value: The option 'operator_position' must be one of the following values\n"+validPositionValues+"\nYou passed in: '"+opPosition+"'")}return opPosition}var OPERATOR_POSITION={before_newline:"before-newline",after_newline:"after-newline",preserve_newline:"preserve-newline"};var OPERATOR_POSITION_BEFORE_OR_PRESERVE=[OPERATOR_POSITION.before_newline,OPERATOR_POSITION.preserve_newline];var MODE={BlockStatement:"BlockStatement",Statement:"Statement",ObjectLiteral:"ObjectLiteral",ArrayLiteral:"ArrayLiteral",ForInitializer:"ForInitializer",Conditional:"Conditional",Expression:"Expression"};function Beautifier(js_source_text,options){"use strict";var output;var tokens=[],token_pos;var Tokenizer;var current_token;var last_type,last_last_text,indent_string;var flags,previous_flags,flag_store;var prefix;var handlers,opt;var baseIndentString="";handlers={TK_START_EXPR:handle_start_expr,TK_END_EXPR:handle_end_expr,TK_START_BLOCK:handle_start_block,TK_END_BLOCK:handle_end_block,TK_WORD:handle_word,TK_RESERVED:handle_word,TK_SEMICOLON:handle_semicolon,TK_STRING:handle_string,TK_EQUALS:handle_equals,TK_OPERATOR:handle_operator,TK_COMMA:handle_comma,TK_BLOCK_COMMENT:handle_block_comment,TK_COMMENT:handle_comment,TK_DOT:handle_dot,TK_UNKNOWN:handle_unknown,TK_EOF:handle_eof};function create_flags(flags_base,mode){var next_indent_level=0;if(flags_base){next_indent_level=flags_base.indentation_level;if(!output.just_added_newline()&&flags_base.line_indent_level>next_indent_level){next_indent_level=flags_base.line_indent_level}}var next_flags={mode:mode,parent:flags_base,last_text:flags_base?flags_base.last_text:"",last_word:flags_base?flags_base.last_word:"",declaration_statement:false,declaration_assignment:false,multiline_frame:false,inline_frame:false,if_block:false,else_block:false,do_block:false,do_while:false,import_block:false,in_case_statement:false,in_case:false,case_body:false,indentation_level:next_indent_level,line_indent_level:flags_base?flags_base.line_indent_level:next_indent_level,start_line_index:output.get_line_number(),ternary_depth:0};return next_flags}options=options?options:{};options=mergeOpts(options,"js");opt={};if(options.brace_style==="expand-strict"){options.brace_style="expand"}else if(options.brace_style==="collapse-preserve-inline"){options.brace_style="collapse,preserve-inline"}else if(options.braces_on_own_line!==undefined){options.brace_style=options.braces_on_own_line?"expand":"collapse"}else if(!options.brace_style){options.brace_style="collapse"}var brace_style_split=options.brace_style.split(/[^a-zA-Z0-9_\-]+/);opt.brace_style=brace_style_split[0];opt.brace_preserve_inline=brace_style_split[1]?brace_style_split[1]:false;opt.indent_size=options.indent_size?parseInt(options.indent_size,10):4;opt.indent_char=options.indent_char?options.indent_char:" ";opt.eol=options.eol?options.eol:"auto";opt.preserve_newlines=options.preserve_newlines===undefined?true:options.preserve_newlines;opt.break_chained_methods=options.break_chained_methods===undefined?false:options.break_chained_methods;opt.max_preserve_newlines=options.max_preserve_newlines===undefined?0:parseInt(options.max_preserve_newlines,10);opt.space_in_paren=options.space_in_paren===undefined?false:options.space_in_paren;opt.space_in_empty_paren=options.space_in_empty_paren===undefined?false:options.space_in_empty_paren;opt.jslint_happy=options.jslint_happy===undefined?false:options.jslint_happy;opt.space_after_anon_function=options.space_after_anon_function===undefined?false:options.space_after_anon_function;opt.keep_array_indentation=options.keep_array_indentation===undefined?false:options.keep_array_indentation;opt.space_before_conditional=options.space_before_conditional===undefined?true:options.space_before_conditional;opt.unescape_strings=options.unescape_strings===undefined?false:options.unescape_strings;opt.wrap_line_length=options.wrap_line_length===undefined?0:parseInt(options.wrap_line_length,10);opt.e4x=options.e4x===undefined?false:options.e4x;opt.end_with_newline=options.end_with_newline===undefined?false:options.end_with_newline;opt.comma_first=options.comma_first===undefined?false:options.comma_first;opt.operator_position=sanitizeOperatorPosition(options.operator_position);opt.test_output_raw=options.test_output_raw===undefined?false:options.test_output_raw;if(opt.jslint_happy){opt.space_after_anon_function=true}if(options.indent_with_tabs){opt.indent_char="\t";opt.indent_size=1}if(opt.eol==="auto"){opt.eol="\n";if(js_source_text&&acorn.lineBreak.test(js_source_text||"")){opt.eol=js_source_text.match(acorn.lineBreak)[0]}}opt.eol=opt.eol.replace(/\\r/,"\r").replace(/\\n/,"\n");indent_string="";while(opt.indent_size>0){indent_string+=opt.indent_char;opt.indent_size-=1}var preindent_index=0;if(js_source_text&&js_source_text.length){while(js_source_text.charAt(preindent_index)===" "||js_source_text.charAt(preindent_index)==="\t"){baseIndentString+=js_source_text.charAt(preindent_index);preindent_index+=1}js_source_text=js_source_text.substring(preindent_index)}last_type="TK_START_BLOCK";last_last_text="";output=new Output(indent_string,baseIndentString);output.raw=opt.test_output_raw;flag_store=[];set_mode(MODE.BlockStatement);this.beautify=function(){var sweet_code;Tokenizer=new tokenizer(js_source_text,opt,indent_string);tokens=Tokenizer.tokenize();token_pos=0;current_token=get_token();while(current_token){handlers[current_token.type]();last_last_text=flags.last_text;last_type=current_token.type;flags.last_text=current_token.text;token_pos+=1;current_token=get_token()}sweet_code=output.get_code();if(opt.end_with_newline){sweet_code+="\n"}if(opt.eol!=="\n"){sweet_code=sweet_code.replace(/[\n]/g,opt.eol)}return sweet_code};function handle_whitespace_and_comments(local_token,preserve_statement_flags){var newlines=local_token.newlines;var keep_whitespace=opt.keep_array_indentation&&is_array(flags.mode);var temp_token=current_token;for(var h=0;h<local_token.comments_before.length;h++){current_token=local_token.comments_before[h];handle_whitespace_and_comments(current_token,preserve_statement_flags);handlers[current_token.type](preserve_statement_flags)}current_token=temp_token;if(keep_whitespace){for(var i=0;i<newlines;i+=1){print_newline(i>0,preserve_statement_flags)}}else{if(opt.max_preserve_newlines&&newlines>opt.max_preserve_newlines){newlines=opt.max_preserve_newlines}if(opt.preserve_newlines){if(local_token.newlines>1){print_newline(false,preserve_statement_flags);for(var j=1;j<newlines;j+=1){print_newline(true,preserve_statement_flags)}}}}}function split_linebreaks(s){s=s.replace(acorn.allLineBreaks,"\n");var out=[],idx=s.indexOf("\n");while(idx!==-1){out.push(s.substring(0,idx));s=s.substring(idx+1);idx=s.indexOf("\n")}if(s.length){out.push(s)}return out}var newline_restricted_tokens=["break","continue","return","throw"];function allow_wrap_or_preserved_newline(force_linewrap){force_linewrap=force_linewrap===undefined?false:force_linewrap;if(output.just_added_newline()){return}var shouldPreserveOrForce=opt.preserve_newlines&&current_token.wanted_newline||force_linewrap;var operatorLogicApplies=in_array(flags.last_text,Tokenizer.positionable_operators)||in_array(current_token.text,Tokenizer.positionable_operators);if(operatorLogicApplies){var shouldPrintOperatorNewline=in_array(flags.last_text,Tokenizer.positionable_operators)&&in_array(opt.operator_position,OPERATOR_POSITION_BEFORE_OR_PRESERVE)||in_array(current_token.text,Tokenizer.positionable_operators);shouldPreserveOrForce=shouldPreserveOrForce&&shouldPrintOperatorNewline}if(shouldPreserveOrForce){print_newline(false,true)}else if(opt.wrap_line_length){if(last_type==="TK_RESERVED"&&in_array(flags.last_text,newline_restricted_tokens)){return}var proposed_line_length=output.current_line.get_character_count()+current_token.text.length+(output.space_before_token?1:0);if(proposed_line_length>=opt.wrap_line_length){print_newline(false,true)}}}function print_newline(force_newline,preserve_statement_flags){if(!preserve_statement_flags){if(flags.last_text!==";"&&flags.last_text!==","&&flags.last_text!=="="&&last_type!=="TK_OPERATOR"){var next_token=get_token(1);while(flags.mode===MODE.Statement&&!(flags.if_block&&next_token&&next_token.type==="TK_RESERVED"&&next_token.text==="else")&&!flags.do_block){restore_mode()}}}if(output.add_new_line(force_newline)){flags.multiline_frame=true}}function print_token_line_indentation(){if(output.just_added_newline()){if(opt.keep_array_indentation&&is_array(flags.mode)&&current_token.wanted_newline){output.current_line.push(current_token.whitespace_before);output.space_before_token=false}else if(output.set_indent(flags.indentation_level)){flags.line_indent_level=flags.indentation_level}}}function print_token(printable_token){if(output.raw){output.add_raw_token(current_token);return}if(opt.comma_first&&last_type==="TK_COMMA"&&output.just_added_newline()){if(output.previous_line.last()===","){var popped=output.previous_line.pop();if(output.previous_line.is_empty()){output.previous_line.push(popped);output.trim(true);output.current_line.pop();output.trim()}print_token_line_indentation();output.add_token(",");output.space_before_token=true}}printable_token=printable_token||current_token.text;print_token_line_indentation();output.add_token(printable_token)}function indent(){flags.indentation_level+=1}function deindent(){if(flags.indentation_level>0&&(!flags.parent||flags.indentation_level>flags.parent.indentation_level)){flags.indentation_level-=1}}function set_mode(mode){if(flags){flag_store.push(flags);previous_flags=flags}else{previous_flags=create_flags(null,mode)}flags=create_flags(previous_flags,mode)}function is_array(mode){return mode===MODE.ArrayLiteral}function is_expression(mode){return in_array(mode,[MODE.Expression,MODE.ForInitializer,MODE.Conditional])}function restore_mode(){if(flag_store.length>0){previous_flags=flags;flags=flag_store.pop();if(previous_flags.mode===MODE.Statement){output.remove_redundant_indentation(previous_flags)}}}function start_of_object_property(){return flags.parent.mode===MODE.ObjectLiteral&&flags.mode===MODE.Statement&&(flags.last_text===":"&&flags.ternary_depth===0||last_type==="TK_RESERVED"&&in_array(flags.last_text,["get","set"]))}function start_of_statement(){if(last_type==="TK_RESERVED"&&in_array(flags.last_text,["var","let","const"])&&current_token.type==="TK_WORD"||last_type==="TK_RESERVED"&&flags.last_text==="do"||last_type==="TK_RESERVED"&&in_array(flags.last_text,["return","throw"])&&!current_token.wanted_newline||last_type==="TK_RESERVED"&&flags.last_text==="else"&&!(current_token.type==="TK_RESERVED"&&current_token.text==="if"&&!current_token.comments_before.length)||last_type==="TK_END_EXPR"&&(previous_flags.mode===MODE.ForInitializer||previous_flags.mode===MODE.Conditional)||last_type==="TK_WORD"&&flags.mode===MODE.BlockStatement&&!flags.in_case&&!(current_token.text==="--"||current_token.text==="++")&&last_last_text!=="function"&&current_token.type!=="TK_WORD"&&current_token.type!=="TK_RESERVED"||flags.mode===MODE.ObjectLiteral&&(flags.last_text===":"&&flags.ternary_depth===0||last_type==="TK_RESERVED"&&in_array(flags.last_text,["get","set"]))){set_mode(MODE.Statement);indent();handle_whitespace_and_comments(current_token,true);if(!start_of_object_property()){allow_wrap_or_preserved_newline(current_token.type==="TK_RESERVED"&&in_array(current_token.text,["do","for","if","while"]))}return true}return false}function all_lines_start_with(lines,c){for(var i=0;i<lines.length;i++){var line=trim(lines[i]);if(line.charAt(0)!==c){return false}}return true}function each_line_matches_indent(lines,indent){var i=0,len=lines.length,line;for(;i<len;i++){line=lines[i];if(line&&line.indexOf(indent)!==0){return false}}return true}function is_special_word(word){return in_array(word,["case","return","do","if","throw","else"])}function get_token(offset){var index=token_pos+(offset||0);return index<0||index>=tokens.length?null:tokens[index]}function handle_start_expr(){if(!start_of_statement()){handle_whitespace_and_comments(current_token)}var next_mode=MODE.Expression;if(current_token.text==="["){if(last_type==="TK_WORD"||flags.last_text===")"){if(last_type==="TK_RESERVED"&&in_array(flags.last_text,Tokenizer.line_starters)){output.space_before_token=true}set_mode(next_mode);print_token();indent();if(opt.space_in_paren){output.space_before_token=true}return}next_mode=MODE.ArrayLiteral;if(is_array(flags.mode)){if(flags.last_text==="["||flags.last_text===","&&(last_last_text==="]"||last_last_text==="}")){if(!opt.keep_array_indentation){print_newline()}}}}else{if(last_type==="TK_RESERVED"&&flags.last_text==="for"){next_mode=MODE.ForInitializer}else if(last_type==="TK_RESERVED"&&in_array(flags.last_text,["if","while"])){next_mode=MODE.Conditional}else{}}if(flags.last_text===";"||last_type==="TK_START_BLOCK"){print_newline()}else if(last_type==="TK_END_EXPR"||last_type==="TK_START_EXPR"||last_type==="TK_END_BLOCK"||flags.last_text==="."){allow_wrap_or_preserved_newline(current_token.wanted_newline)}else if(!(last_type==="TK_RESERVED"&&current_token.text==="(")&&last_type!=="TK_WORD"&&last_type!=="TK_OPERATOR"){output.space_before_token=true}else if(last_type==="TK_RESERVED"&&(flags.last_word==="function"||flags.last_word==="typeof")||flags.last_text==="*"&&(in_array(last_last_text,["function","yield"])||flags.mode===MODE.ObjectLiteral&&in_array(last_last_text,["{",","]))){if(opt.space_after_anon_function){output.space_before_token=true}}else if(last_type==="TK_RESERVED"&&(in_array(flags.last_text,Tokenizer.line_starters)||flags.last_text==="catch")){if(opt.space_before_conditional){output.space_before_token=true}}if(current_token.text==="("&&last_type==="TK_RESERVED"&&flags.last_word==="await"){output.space_before_token=true}if(current_token.text==="("){if(last_type==="TK_EQUALS"||last_type==="TK_OPERATOR"){if(!start_of_object_property()){allow_wrap_or_preserved_newline()}}}if(current_token.text==="("&&last_type!=="TK_WORD"&&last_type!=="TK_RESERVED"){allow_wrap_or_preserved_newline()}set_mode(next_mode);print_token();if(opt.space_in_paren){output.space_before_token=true}indent()}function handle_end_expr(){while(flags.mode===MODE.Statement){restore_mode()}handle_whitespace_and_comments(current_token);if(flags.multiline_frame){allow_wrap_or_preserved_newline(current_token.text==="]"&&is_array(flags.mode)&&!opt.keep_array_indentation)}if(opt.space_in_paren){if(last_type==="TK_START_EXPR"&&!opt.space_in_empty_paren){output.trim();output.space_before_token=false}else{output.space_before_token=true}}if(current_token.text==="]"&&opt.keep_array_indentation){print_token();restore_mode()}else{restore_mode();print_token()}output.remove_redundant_indentation(previous_flags);if(flags.do_while&&previous_flags.mode===MODE.Conditional){previous_flags.mode=MODE.Expression;flags.do_block=false;flags.do_while=false}}function handle_start_block(){handle_whitespace_and_comments(current_token);var next_token=get_token(1);var second_token=get_token(2);if(second_token&&(in_array(second_token.text,[":",","])&&in_array(next_token.type,["TK_STRING","TK_WORD","TK_RESERVED"])||in_array(next_token.text,["get","set","..."])&&in_array(second_token.type,["TK_WORD","TK_RESERVED"]))){if(!in_array(last_last_text,["class","interface"])){set_mode(MODE.ObjectLiteral)}else{set_mode(MODE.BlockStatement)}}else if(last_type==="TK_OPERATOR"&&flags.last_text==="=>"){set_mode(MODE.BlockStatement)}else if(in_array(last_type,["TK_EQUALS","TK_START_EXPR","TK_COMMA","TK_OPERATOR"])||last_type==="TK_RESERVED"&&in_array(flags.last_text,["return","throw","import","default"])){set_mode(MODE.ObjectLiteral)}else{set_mode(MODE.BlockStatement)}var empty_braces=!next_token.comments_before.length&&next_token.text==="}";var empty_anonymous_function=empty_braces&&flags.last_word==="function"&&last_type==="TK_END_EXPR";if(opt.brace_preserve_inline){var index=0;var check_token=null;flags.inline_frame=true;do{index+=1;check_token=get_token(index);if(check_token.wanted_newline){flags.inline_frame=false;break}}while(check_token.type!=="TK_EOF"&&!(check_token.type==="TK_END_BLOCK"&&check_token.opened===current_token))}if((opt.brace_style==="expand"||opt.brace_style==="none"&&current_token.wanted_newline)&&!flags.inline_frame){if(last_type!=="TK_OPERATOR"&&(empty_anonymous_function||last_type==="TK_EQUALS"||last_type==="TK_RESERVED"&&is_special_word(flags.last_text)&&flags.last_text!=="else")){output.space_before_token=true}else{print_newline(false,true)}}else{if(is_array(previous_flags.mode)&&(last_type==="TK_START_EXPR"||last_type==="TK_COMMA")){if(last_type==="TK_COMMA"||opt.space_in_paren){output.space_before_token=true}if(last_type==="TK_COMMA"||last_type==="TK_START_EXPR"&&flags.inline_frame){allow_wrap_or_preserved_newline();previous_flags.multiline_frame=previous_flags.multiline_frame||flags.multiline_frame;flags.multiline_frame=false}}if(last_type!=="TK_OPERATOR"&&last_type!=="TK_START_EXPR"){if(last_type==="TK_START_BLOCK"&&!flags.inline_frame){print_newline()}else{output.space_before_token=true}}}print_token();indent()}function handle_end_block(){handle_whitespace_and_comments(current_token);while(flags.mode===MODE.Statement){restore_mode()}var empty_braces=last_type==="TK_START_BLOCK";if(flags.inline_frame&&!empty_braces){output.space_before_token=true}else if(opt.brace_style==="expand"){if(!empty_braces){print_newline()}}else{if(!empty_braces){if(is_array(flags.mode)&&opt.keep_array_indentation){opt.keep_array_indentation=false;print_newline();opt.keep_array_indentation=true}else{print_newline()}}}restore_mode();print_token()}function handle_word(){if(current_token.type==="TK_RESERVED"){if(in_array(current_token.text,["set","get"])&&flags.mode!==MODE.ObjectLiteral){current_token.type="TK_WORD"}else if(in_array(current_token.text,["as","from"])&&!flags.import_block){current_token.type="TK_WORD"}else if(flags.mode===MODE.ObjectLiteral){var next_token=get_token(1);if(next_token.text===":"){current_token.type="TK_WORD"}}}if(start_of_statement()){if(last_type==="TK_RESERVED"&&in_array(flags.last_text,["var","let","const"])&&current_token.type==="TK_WORD"){flags.declaration_statement=true}}else if(current_token.wanted_newline&&!is_expression(flags.mode)&&(last_type!=="TK_OPERATOR"||(flags.last_text==="--"||flags.last_text==="++"))&&last_type!=="TK_EQUALS"&&(opt.preserve_newlines||!(last_type==="TK_RESERVED"&&in_array(flags.last_text,["var","let","const","set","get"])))){handle_whitespace_and_comments(current_token);print_newline()}else{handle_whitespace_and_comments(current_token)}if(flags.do_block&&!flags.do_while){if(current_token.type==="TK_RESERVED"&&current_token.text==="while"){output.space_before_token=true;print_token();output.space_before_token=true;flags.do_while=true;return}else{print_newline();flags.do_block=false}}if(flags.if_block){if(!flags.else_block&&(current_token.type==="TK_RESERVED"&&current_token.text==="else")){flags.else_block=true}else{while(flags.mode===MODE.Statement){restore_mode()}flags.if_block=false;flags.else_block=false}}if(current_token.type==="TK_RESERVED"&&(current_token.text==="case"||current_token.text==="default"&&flags.in_case_statement)){print_newline();if(flags.case_body||opt.jslint_happy){deindent();flags.case_body=false}print_token();flags.in_case=true;flags.in_case_statement=true;return}if(last_type==="TK_COMMA"||last_type==="TK_START_EXPR"||last_type==="TK_EQUALS"||last_type==="TK_OPERATOR"){if(!start_of_object_property()){allow_wrap_or_preserved_newline()}}if(current_token.type==="TK_RESERVED"&&current_token.text==="function"){if(in_array(flags.last_text,["}",";"])||output.just_added_newline()&&!(in_array(flags.last_text,["(","[","{",":","=",","])||last_type==="TK_OPERATOR")){if(!output.just_added_blankline()&&!current_token.comments_before.length){print_newline();print_newline(true)}}if(last_type==="TK_RESERVED"||last_type==="TK_WORD"){if(last_type==="TK_RESERVED"&&in_array(flags.last_text,["get","set","new","return","export","async"])){output.space_before_token=true}else if(last_type==="TK_RESERVED"&&flags.last_text==="default"&&last_last_text==="export"){output.space_before_token=true}else{print_newline()}}else if(last_type==="TK_OPERATOR"||flags.last_text==="="){output.space_before_token=true}else if(!flags.multiline_frame&&(is_expression(flags.mode)||is_array(flags.mode))){}else{print_newline()}print_token();flags.last_word=current_token.text;return}prefix="NONE";if(last_type==="TK_END_BLOCK"){if(previous_flags.inline_frame){prefix="SPACE"}else if(!(current_token.type==="TK_RESERVED"&&in_array(current_token.text,["else","catch","finally","from"]))){prefix="NEWLINE"}else{if(opt.brace_style==="expand"||opt.brace_style==="end-expand"||opt.brace_style==="none"&&current_token.wanted_newline){prefix="NEWLINE"}else{prefix="SPACE";output.space_before_token=true}}}else if(last_type==="TK_SEMICOLON"&&flags.mode===MODE.BlockStatement){prefix="NEWLINE"}else if(last_type==="TK_SEMICOLON"&&is_expression(flags.mode)){prefix="SPACE"}else if(last_type==="TK_STRING"){prefix="NEWLINE"}else if(last_type==="TK_RESERVED"||last_type==="TK_WORD"||flags.last_text==="*"&&(in_array(last_last_text,["function","yield"])||flags.mode===MODE.ObjectLiteral&&in_array(last_last_text,["{",","]))){prefix="SPACE"}else if(last_type==="TK_START_BLOCK"){if(flags.inline_frame){prefix="SPACE"}else{prefix="NEWLINE"}}else if(last_type==="TK_END_EXPR"){output.space_before_token=true;prefix="NEWLINE"}if(current_token.type==="TK_RESERVED"&&in_array(current_token.text,Tokenizer.line_starters)&&flags.last_text!==")"){if(flags.inline_frame||flags.last_text==="else"||flags.last_text==="export"){prefix="SPACE"}else{prefix="NEWLINE"}}if(current_token.type==="TK_RESERVED"&&in_array(current_token.text,["else","catch","finally"])){if((!(last_type==="TK_END_BLOCK"&&previous_flags.mode===MODE.BlockStatement)||opt.brace_style==="expand"||opt.brace_style==="end-expand"||opt.brace_style==="none"&&current_token.wanted_newline)&&!flags.inline_frame){print_newline()}else{output.trim(true);var line=output.current_line;if(line.last()!=="}"){print_newline()}output.space_before_token=true}}else if(prefix==="NEWLINE"){if(last_type==="TK_RESERVED"&&is_special_word(flags.last_text)){output.space_before_token=true}else if(last_type!=="TK_END_EXPR"){if((last_type!=="TK_START_EXPR"||!(current_token.type==="TK_RESERVED"&&in_array(current_token.text,["var","let","const"])))&&flags.last_text!==":"){if(current_token.type==="TK_RESERVED"&&current_token.text==="if"&&flags.last_text==="else"){output.space_before_token=true}else{print_newline()}}}else if(current_token.type==="TK_RESERVED"&&in_array(current_token.text,Tokenizer.line_starters)&&flags.last_text!==")"){print_newline()}}else if(flags.multiline_frame&&is_array(flags.mode)&&flags.last_text===","&&last_last_text==="}"){print_newline()}else if(prefix==="SPACE"){output.space_before_token=true}print_token();flags.last_word=current_token.text;if(current_token.type==="TK_RESERVED"){if(current_token.text==="do"){flags.do_block=true}else if(current_token.text==="if"){flags.if_block=true}else if(current_token.text==="import"){flags.import_block=true}else if(flags.import_block&&current_token.type==="TK_RESERVED"&&current_token.text==="from"){flags.import_block=false}}}function handle_semicolon(){if(start_of_statement()){output.space_before_token=false}else{handle_whitespace_and_comments(current_token)}var next_token=get_token(1);while(flags.mode===MODE.Statement&&!(flags.if_block&&next_token&&next_token.type==="TK_RESERVED"&&next_token.text==="else")&&!flags.do_block){restore_mode()}if(flags.import_block){flags.import_block=false}print_token()}function handle_string(){if(start_of_statement()){output.space_before_token=true}else{handle_whitespace_and_comments(current_token);if(last_type==="TK_RESERVED"||last_type==="TK_WORD"||flags.inline_frame){output.space_before_token=true}else if(last_type==="TK_COMMA"||last_type==="TK_START_EXPR"||last_type==="TK_EQUALS"||last_type==="TK_OPERATOR"){if(!start_of_object_property()){allow_wrap_or_preserved_newline()}}else{print_newline()}}print_token()}function handle_equals(){if(start_of_statement()){}else{handle_whitespace_and_comments(current_token)}if(flags.declaration_statement){flags.declaration_assignment=true}output.space_before_token=true;print_token();output.space_before_token=true}function handle_comma(){handle_whitespace_and_comments(current_token,true);print_token();output.space_before_token=true;if(flags.declaration_statement){if(is_expression(flags.parent.mode)){flags.declaration_assignment=false}if(flags.declaration_assignment){flags.declaration_assignment=false;print_newline(false,true)}else if(opt.comma_first){allow_wrap_or_preserved_newline()}}else if(flags.mode===MODE.ObjectLiteral||flags.mode===MODE.Statement&&flags.parent.mode===MODE.ObjectLiteral){if(flags.mode===MODE.Statement){restore_mode()}if(!flags.inline_frame){print_newline()}}else if(opt.comma_first){allow_wrap_or_preserved_newline()}}function handle_operator(){var isGeneratorAsterisk=current_token.text==="*"&&(last_type==="TK_RESERVED"&&in_array(flags.last_text,["function","yield"])||in_array(last_type,["TK_START_BLOCK","TK_COMMA","TK_END_BLOCK","TK_SEMICOLON"]));var isUnary=in_array(current_token.text,["-","+"])&&(in_array(last_type,["TK_START_BLOCK","TK_START_EXPR","TK_EQUALS","TK_OPERATOR"])||in_array(flags.last_text,Tokenizer.line_starters)||flags.last_text===",");if(start_of_statement()){}else{var preserve_statement_flags=!isGeneratorAsterisk;handle_whitespace_and_comments(current_token,preserve_statement_flags)}if(last_type==="TK_RESERVED"&&is_special_word(flags.last_text)){output.space_before_token=true;print_token();return}if(current_token.text==="*"&&last_type==="TK_DOT"){print_token();return}if(current_token.text==="::"){print_token();return}if(last_type==="TK_OPERATOR"&&in_array(opt.operator_position,OPERATOR_POSITION_BEFORE_OR_PRESERVE)){allow_wrap_or_preserved_newline()}if(current_token.text===":"&&flags.in_case){flags.case_body=true;indent();print_token();print_newline();flags.in_case=false;return}var space_before=true;var space_after=true;var in_ternary=false;if(current_token.text===":"){if(flags.ternary_depth===0){space_before=false}else{flags.ternary_depth-=1;in_ternary=true}}else if(current_token.text==="?"){flags.ternary_depth+=1}if(!isUnary&&!isGeneratorAsterisk&&opt.preserve_newlines&&in_array(current_token.text,Tokenizer.positionable_operators)){var isColon=current_token.text===":";var isTernaryColon=isColon&&in_ternary;var isOtherColon=isColon&&!in_ternary;switch(opt.operator_position){case OPERATOR_POSITION.before_newline:output.space_before_token=!isOtherColon;print_token();if(!isColon||isTernaryColon){allow_wrap_or_preserved_newline()}output.space_before_token=true;return;case OPERATOR_POSITION.after_newline:output.space_before_token=true;if(!isColon||isTernaryColon){if(get_token(1).wanted_newline){print_newline(false,true)}else{allow_wrap_or_preserved_newline()}}else{output.space_before_token=false}print_token();output.space_before_token=true;return;case OPERATOR_POSITION.preserve_newline:if(!isOtherColon){allow_wrap_or_preserved_newline()}space_before=!(output.just_added_newline()||isOtherColon);output.space_before_token=space_before;print_token();output.space_before_token=true;return}}if(isGeneratorAsterisk){allow_wrap_or_preserved_newline();space_before=false;var next_token=get_token(1);space_after=next_token&&in_array(next_token.type,["TK_WORD","TK_RESERVED"])}else if(current_token.text==="..."){allow_wrap_or_preserved_newline();space_before=last_type==="TK_START_BLOCK";space_after=false}else if(in_array(current_token.text,["--","++","!","~"])||isUnary){space_before=false;space_after=false;if(current_token.wanted_newline&&(current_token.text==="--"||current_token.text==="++")){print_newline(false,true)}if(flags.last_text===";"&&is_expression(flags.mode)){space_before=true}if(last_type==="TK_RESERVED"){space_before=true}else if(last_type==="TK_END_EXPR"){space_before=!(flags.last_text==="]"&&(current_token.text==="--"||current_token.text==="++"))}else if(last_type==="TK_OPERATOR"){space_before=in_array(current_token.text,["--","-","++","+"])&&in_array(flags.last_text,["--","-","++","+"]);if(in_array(current_token.text,["+","-"])&&in_array(flags.last_text,["--","++"])){space_after=true}}if((flags.mode===MODE.BlockStatement&&!flags.inline_frame||flags.mode===MODE.Statement)&&(flags.last_text==="{"||flags.last_text===";")){print_newline()}}output.space_before_token=output.space_before_token||space_before;print_token();output.space_before_token=space_after}function handle_block_comment(preserve_statement_flags){if(output.raw){output.add_raw_token(current_token);
                 if(current_token.directives&&current_token.directives.preserve==="end"){output.raw=opt.test_output_raw}return}if(current_token.directives){print_newline(false,preserve_statement_flags);print_token();if(current_token.directives.preserve==="start"){output.raw=true}print_newline(false,true);return}if(!acorn.newline.test(current_token.text)&&!current_token.wanted_newline){output.space_before_token=true;print_token();output.space_before_token=true;return}var lines=split_linebreaks(current_token.text);var j;var javadoc=false;var starless=false;var lastIndent=current_token.whitespace_before;var lastIndentLength=lastIndent.length;print_newline(false,preserve_statement_flags);if(lines.length>1){javadoc=all_lines_start_with(lines.slice(1),"*");starless=each_line_matches_indent(lines.slice(1),lastIndent)}print_token(lines[0]);for(j=1;j<lines.length;j++){print_newline(false,true);if(javadoc){print_token(" "+ltrim(lines[j]))}else if(starless&&lines[j].length>lastIndentLength){print_token(lines[j].substring(lastIndentLength))}else{output.add_token(lines[j])}}print_newline(false,preserve_statement_flags)}function handle_comment(preserve_statement_flags){if(current_token.wanted_newline){print_newline(false,preserve_statement_flags)}else{output.trim(true)}output.space_before_token=true;print_token();print_newline(false,preserve_statement_flags)}function handle_dot(){if(start_of_statement()){}else{handle_whitespace_and_comments(current_token,true)}if(last_type==="TK_RESERVED"&&is_special_word(flags.last_text)){output.space_before_token=true}else{allow_wrap_or_preserved_newline(flags.last_text===")"&&opt.break_chained_methods)}print_token()}function handle_unknown(preserve_statement_flags){print_token();if(current_token.text[current_token.text.length-1]==="\n"){print_newline(false,preserve_statement_flags)}}function handle_eof(){while(flags.mode===MODE.Statement){restore_mode()}handle_whitespace_and_comments(current_token)}}function OutputLine(parent){var _character_count=0;var _indent_count=-1;var _items=[];var _empty=true;this.set_indent=function(level){_character_count=parent.baseIndentLength+level*parent.indent_length;_indent_count=level};this.get_character_count=function(){return _character_count};this.is_empty=function(){return _empty};this.last=function(){if(!this._empty){return _items[_items.length-1]}else{return null}};this.push=function(input){_items.push(input);_character_count+=input.length;_empty=false};this.pop=function(){var item=null;if(!_empty){item=_items.pop();_character_count-=item.length;_empty=_items.length===0}return item};this.remove_indent=function(){if(_indent_count>0){_indent_count-=1;_character_count-=parent.indent_length}};this.trim=function(){while(this.last()===" "){_items.pop();_character_count-=1}_empty=_items.length===0};this.toString=function(){var result="";if(!this._empty){if(_indent_count>=0){result=parent.indent_cache[_indent_count]}result+=_items.join("")}return result}}function Output(indent_string,baseIndentString){baseIndentString=baseIndentString||"";this.indent_cache=[baseIndentString];this.baseIndentLength=baseIndentString.length;this.indent_length=indent_string.length;this.raw=false;var lines=[];this.baseIndentString=baseIndentString;this.indent_string=indent_string;this.previous_line=null;this.current_line=null;this.space_before_token=false;this.add_outputline=function(){this.previous_line=this.current_line;this.current_line=new OutputLine(this);lines.push(this.current_line)};this.add_outputline();this.get_line_number=function(){return lines.length};this.add_new_line=function(force_newline){if(this.get_line_number()===1&&this.just_added_newline()){return false}if(force_newline||!this.just_added_newline()){if(!this.raw){this.add_outputline()}return true}return false};this.get_code=function(){var sweet_code=lines.join("\n").replace(/[\r\n\t ]+$/,"");return sweet_code};this.set_indent=function(level){if(lines.length>1){while(level>=this.indent_cache.length){this.indent_cache.push(this.indent_cache[this.indent_cache.length-1]+this.indent_string)}this.current_line.set_indent(level);return true}this.current_line.set_indent(0);return false};this.add_raw_token=function(token){for(var x=0;x<token.newlines;x++){this.add_outputline()}this.current_line.push(token.whitespace_before);this.current_line.push(token.text);this.space_before_token=false};this.add_token=function(printable_token){this.add_space_before_token();this.current_line.push(printable_token)};this.add_space_before_token=function(){if(this.space_before_token&&!this.just_added_newline()){this.current_line.push(" ")}this.space_before_token=false};this.remove_redundant_indentation=function(frame){if(frame.multiline_frame||frame.mode===MODE.ForInitializer||frame.mode===MODE.Conditional){return}var index=frame.start_line_index;var output_length=lines.length;while(index<output_length){lines[index].remove_indent();index++}};this.trim=function(eat_newlines){eat_newlines=eat_newlines===undefined?false:eat_newlines;this.current_line.trim(indent_string,baseIndentString);while(eat_newlines&&lines.length>1&&this.current_line.is_empty()){lines.pop();this.current_line=lines[lines.length-1];this.current_line.trim()}this.previous_line=lines.length>1?lines[lines.length-2]:null};this.just_added_newline=function(){return this.current_line.is_empty()};this.just_added_blankline=function(){if(this.just_added_newline()){if(lines.length===1){return true}var line=lines[lines.length-2];return line.is_empty()}return false}}var InputScanner=function(input){var _input=input;var _input_length=_input.length;var _position=0;this.back=function(){_position-=1};this.hasNext=function(){return _position<_input_length};this.next=function(){var val=null;if(this.hasNext()){val=_input.charAt(_position);_position+=1}return val};this.peek=function(index){var val=null;index=index||0;index+=_position;if(index>=0&&index<_input_length){val=_input.charAt(index)}return val};this.peekCharCode=function(index){var val=0;index=index||0;index+=_position;if(index>=0&&index<_input_length){val=_input.charCodeAt(index)}return val};this.test=function(pattern,index){index=index||0;pattern.lastIndex=_position+index;return pattern.test(_input)};this.testChar=function(pattern,index){var val=this.peek(index);return val!==null&&pattern.test(val)};this.match=function(pattern){pattern.lastIndex=_position;var pattern_match=pattern.exec(_input);if(pattern_match&&pattern_match.index===_position){_position+=pattern_match[0].length}else{pattern_match=null}return pattern_match}};var Token=function(type,text,newlines,whitespace_before,parent){this.type=type;this.text=text;this.comments_before=[];this.comments_after=[];this.newlines=newlines||0;this.wanted_newline=newlines>0;this.whitespace_before=whitespace_before||"";this.parent=parent||null;this.opened=null;this.directives=null};function tokenizer(input_string,opts){var whitespace="\n\r\t ".split("");var digit=/[0-9]/;var digit_bin=/[01]/;var digit_oct=/[01234567]/;var digit_hex=/[0123456789abcdefABCDEF]/;this.positionable_operators="!= !== % & && * ** + - / : < << <= == === > >= >> >>> ? ^ | ||".split(" ");var punct=this.positionable_operators.concat("! %= &= *= **= ++ += , -- -= /= :: <<= = => >>= >>>= ^= |= ~ ...".split(" "));this.line_starters="continue,try,throw,return,var,let,const,if,switch,case,default,for,while,break,function,import,export".split(",");var reserved_words=this.line_starters.concat(["do","in","of","else","get","set","new","catch","finally","typeof","yield","async","await","from","as"]);var block_comment_pattern=/([\s\S]*?)((?:\*\/)|$)/g;var comment_pattern=/([^\n\r\u2028\u2029]*)/g;var directives_block_pattern=/\/\* beautify( \w+[:]\w+)+ \*\//g;var directive_pattern=/ (\w+)[:](\w+)/g;var directives_end_ignore_pattern=/([\s\S]*?)((?:\/\*\sbeautify\signore:end\s\*\/)|$)/g;var template_pattern=/((<\?php|<\?=)[\s\S]*?\?>)|(<%[\s\S]*?%>)/g;var n_newlines,whitespace_before_token,in_html_comment,tokens;var input;this.tokenize=function(){input=new InputScanner(input_string);in_html_comment=false;tokens=[];var next,last;var token_values;var open=null;var open_stack=[];var comments=[];while(!(last&&last.type==="TK_EOF")){token_values=tokenize_next();next=new Token(token_values[1],token_values[0],n_newlines,whitespace_before_token);while(next.type==="TK_COMMENT"||next.type==="TK_BLOCK_COMMENT"||next.type==="TK_UNKNOWN"){if(next.type==="TK_BLOCK_COMMENT"){next.directives=token_values[2]}comments.push(next);token_values=tokenize_next();next=new Token(token_values[1],token_values[0],n_newlines,whitespace_before_token)}if(comments.length){next.comments_before=comments;comments=[]}if(next.type==="TK_START_BLOCK"||next.type==="TK_START_EXPR"){next.parent=last;open_stack.push(open);open=next}else if((next.type==="TK_END_BLOCK"||next.type==="TK_END_EXPR")&&(open&&(next.text==="]"&&open.text==="["||next.text===")"&&open.text==="("||next.text==="}"&&open.text==="{"))){next.parent=open.parent;next.opened=open;open=open_stack.pop()}tokens.push(next);last=next}return tokens};function get_directives(text){if(!text.match(directives_block_pattern)){return null}var directives={};directive_pattern.lastIndex=0;var directive_match=directive_pattern.exec(text);while(directive_match){directives[directive_match[1]]=directive_match[2];directive_match=directive_pattern.exec(text)}return directives}function tokenize_next(){var resulting_string;var whitespace_on_this_line=[];n_newlines=0;whitespace_before_token="";var c=input.next();if(c===null){return["","TK_EOF"]}var last_token;if(tokens.length){last_token=tokens[tokens.length-1]}else{last_token=new Token("TK_START_BLOCK","{")}while(in_array(c,whitespace)){if(acorn.newline.test(c)){if(!(c==="\n"&&input.peek(-2)==="\r")){n_newlines+=1;whitespace_on_this_line=[]}}else{whitespace_on_this_line.push(c)}c=input.next();if(c===null){return["","TK_EOF"]}}if(whitespace_on_this_line.length){whitespace_before_token=whitespace_on_this_line.join("")}if(digit.test(c)||c==="."&&input.testChar(digit)){var allow_decimal=true;var allow_e=true;var local_digit=digit;if(c==="0"&&input.testChar(/[XxOoBb]/)){allow_decimal=false;allow_e=false;if(input.testChar(/[Bb]/)){local_digit=digit_bin}else if(input.testChar(/[Oo]/)){local_digit=digit_oct}else{local_digit=digit_hex}c+=input.next()}else if(c==="."){allow_decimal=false}else{c="";input.back()}while(input.testChar(local_digit)){c+=input.next();if(allow_decimal&&input.peek()==="."){c+=input.next();allow_decimal=false}if(allow_e&&input.testChar(/[Ee]/)){c+=input.next();if(input.testChar(/[+-]/)){c+=input.next()}allow_e=false;allow_decimal=false}}return[c,"TK_WORD"]}if(acorn.isIdentifierStart(input.peekCharCode(-1))){if(input.hasNext()){while(acorn.isIdentifierChar(input.peekCharCode())){c+=input.next();if(!input.hasNext()){break}}}if(!(last_token.type==="TK_DOT"||last_token.type==="TK_RESERVED"&&in_array(last_token.text,["set","get"]))&&in_array(c,reserved_words)){if(c==="in"||c==="of"){return[c,"TK_OPERATOR"]}return[c,"TK_RESERVED"]}return[c,"TK_WORD"]}if(c==="("||c==="["){return[c,"TK_START_EXPR"]}if(c===")"||c==="]"){return[c,"TK_END_EXPR"]}if(c==="{"){return[c,"TK_START_BLOCK"]}if(c==="}"){return[c,"TK_END_BLOCK"]}if(c===";"){return[c,"TK_SEMICOLON"]}if(c==="/"){var comment="";var comment_match;if(input.peek()==="*"){input.next();comment_match=input.match(block_comment_pattern);comment="/*"+comment_match[0];var directives=get_directives(comment);if(directives&&directives.ignore==="start"){comment_match=input.match(directives_end_ignore_pattern);comment+=comment_match[0]}comment=comment.replace(acorn.allLineBreaks,"\n");return[comment,"TK_BLOCK_COMMENT",directives]}if(input.peek()==="/"){input.next();comment_match=input.match(comment_pattern);comment="//"+comment_match[0];return[comment,"TK_COMMENT"]}}var startXmlRegExp=/<()([-a-zA-Z:0-9_.]+|{[\s\S]+?}|!\[CDATA\[[\s\S]*?\]\])(\s+{[\s\S]+?}|\s+[-a-zA-Z:0-9_.]+|\s+[-a-zA-Z:0-9_.]+\s*=\s*('[^']*'|"[^"]*"|{[\s\S]+?}))*\s*(\/?)\s*>/g;if(c==="`"||c==="'"||c==='"'||(c==="/"||opts.e4x&&c==="<"&&input.test(startXmlRegExp,-1))&&(last_token.type==="TK_RESERVED"&&in_array(last_token.text,["return","case","throw","else","do","typeof","yield"])||last_token.type==="TK_END_EXPR"&&last_token.text===")"&&last_token.parent&&last_token.parent.type==="TK_RESERVED"&&in_array(last_token.parent.text,["if","while","for"])||in_array(last_token.type,["TK_COMMENT","TK_START_EXPR","TK_START_BLOCK","TK_END_BLOCK","TK_OPERATOR","TK_EQUALS","TK_EOF","TK_SEMICOLON","TK_COMMA"]))){var sep=c,esc=false,has_char_escapes=false;resulting_string=c;if(sep==="/"){var in_char_class=false;while(input.hasNext()&&((esc||in_char_class||input.peek()!==sep)&&!input.testChar(acorn.newline))){resulting_string+=input.peek();if(!esc){esc=input.peek()==="\\";if(input.peek()==="["){in_char_class=true}else if(input.peek()==="]"){in_char_class=false}}else{esc=false}input.next()}}else if(opts.e4x&&sep==="<"){var xmlRegExp=/[\s\S]*?<(\/?)([-a-zA-Z:0-9_.]+|{[\s\S]+?}|!\[CDATA\[[\s\S]*?\]\])(\s+{[\s\S]+?}|\s+[-a-zA-Z:0-9_.]+|\s+[-a-zA-Z:0-9_.]+\s*=\s*('[^']*'|"[^"]*"|{[\s\S]+?}))*\s*(\/?)\s*>/g;input.back();var xmlStr="";var match=input.match(startXmlRegExp);if(match){var rootTag=match[2].replace(/^{\s+/,"{").replace(/\s+}$/,"}");var isCurlyRoot=rootTag.indexOf("{")===0;var depth=0;while(match){var isEndTag=!!match[1];var tagName=match[2];var isSingletonTag=!!match[match.length-1]||tagName.slice(0,8)==="![CDATA[";if(!isSingletonTag&&(tagName===rootTag||isCurlyRoot&&tagName.replace(/^{\s+/,"{").replace(/\s+}$/,"}"))){if(isEndTag){--depth}else{++depth}}xmlStr+=match[0];if(depth<=0){break}match=input.match(xmlRegExp)}if(!match){xmlStr+=input.match(/[\s\S]*/g)[0]}xmlStr=xmlStr.replace(acorn.allLineBreaks,"\n");return[xmlStr,"TK_STRING"]}}else{var parse_string=function(delimiter,allow_unescaped_newlines,start_sub){var current_char;while(input.hasNext()){current_char=input.peek();if(!(esc||current_char!==delimiter&&(allow_unescaped_newlines||!acorn.newline.test(current_char)))){break}if((esc||allow_unescaped_newlines)&&acorn.newline.test(current_char)){if(current_char==="\r"&&input.peek(1)==="\n"){input.next();current_char=input.peek()}resulting_string+="\n"}else{resulting_string+=current_char}if(esc){if(current_char==="x"||current_char==="u"){has_char_escapes=true}esc=false}else{esc=current_char==="\\"}input.next();if(start_sub&&resulting_string.indexOf(start_sub,resulting_string.length-start_sub.length)!==-1){if(delimiter==="`"){parse_string("}",allow_unescaped_newlines,"`")}else{parse_string("`",allow_unescaped_newlines,"${")}if(input.hasNext()){resulting_string+=input.next()}}}};if(sep==="`"){parse_string("`",true,"${")}else{parse_string(sep)}}if(has_char_escapes&&opts.unescape_strings){resulting_string=unescape_string(resulting_string)}if(input.peek()===sep){resulting_string+=sep;input.next();if(sep==="/"){while(input.hasNext()&&acorn.isIdentifierStart(input.peekCharCode())){resulting_string+=input.next()}}}return[resulting_string,"TK_STRING"]}if(c==="#"){if(tokens.length===0&&input.peek()==="!"){resulting_string=c;while(input.hasNext()&&c!=="\n"){c=input.next();resulting_string+=c}return[trim(resulting_string)+"\n","TK_UNKNOWN"]}var sharp="#";if(input.hasNext()&&input.testChar(digit)){do{c=input.next();sharp+=c}while(input.hasNext()&&c!=="#"&&c!=="=");if(c==="#"){}else if(input.peek()==="["&&input.peek(1)==="]"){sharp+="[]";input.next();input.next()}else if(input.peek()==="{"&&input.peek(1)==="}"){sharp+="{}";input.next();input.next()}return[sharp,"TK_WORD"]}}if(c==="<"&&(input.peek()==="?"||input.peek()==="%")){input.back();var template_match=input.match(template_pattern);if(template_match){c=template_match[0];c=c.replace(acorn.allLineBreaks,"\n");return[c,"TK_STRING"]}}if(c==="<"&&input.match(/\!--/g)){c="<!--";while(input.hasNext()&&!input.testChar(acorn.newline)){c+=input.next()}in_html_comment=true;return[c,"TK_COMMENT"]}if(c==="-"&&in_html_comment&&input.match(/->/g)){in_html_comment=false;return["-->","TK_COMMENT"]}if(c==="."){if(input.peek()==="."&&input.peek(1)==="."){c+=input.next()+input.next();return[c,"TK_OPERATOR"]}return[c,"TK_DOT"]}if(in_array(c,punct)){while(input.hasNext()&&in_array(c+input.peek(),punct)){c+=input.next();if(!input.hasNext()){break}}if(c===","){return[c,"TK_COMMA"]}else if(c==="="){return[c,"TK_EQUALS"]}else{return[c,"TK_OPERATOR"]}}return[c,"TK_UNKNOWN"]}function unescape_string(s){var out="",escaped=0;var input_scan=new InputScanner(s);var matched=null;while(input_scan.hasNext()){matched=input_scan.match(/([\s]|[^\\]|\\\\)+/g);if(matched){out+=matched[0]}if(input_scan.peek()==="\\"){input_scan.next();if(input_scan.peek()==="x"){matched=input_scan.match(/x([0-9A-Fa-f]{2})/g)}else if(input_scan.peek()==="u"){matched=input_scan.match(/u([0-9A-Fa-f]{4})/g)}else{out+="\\";if(input_scan.hasNext()){out+=input_scan.next()}continue}if(!matched){return s}escaped=parseInt(matched[1],16);if(escaped>126&&escaped<=255&&matched[0].indexOf("x")===0){return s}else if(escaped>=0&&escaped<32){out+="\\"+matched[0];continue}else if(escaped===34||escaped===39||escaped===92){out+="\\"+String.fromCharCode(escaped)}else{out+=String.fromCharCode(escaped)}}}return out}}var beautifier=new Beautifier(js_source_text,options);return beautifier.beautify()}if(typeof define==="function"&&define.amd){define([],function(){return{js_beautify:js_beautify}})}else if(typeof exports!=="undefined"){exports.js_beautify=js_beautify}else if(typeof window!=="undefined"){window.js_beautify=js_beautify}else if(typeof global!=="undefined"){global.js_beautify=js_beautify}})()}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{}],"js-beautify":[function(require,module,exports){function get_beautify(js_beautify,css_beautify,html_beautify){var beautify=function(src,config){return js_beautify.js_beautify(src,config)};beautify.js=js_beautify.js_beautify;beautify.css=css_beautify.css_beautify;beautify.html=html_beautify.html_beautify;beautify.js_beautify=js_beautify.js_beautify;beautify.css_beautify=css_beautify.css_beautify;beautify.html_beautify=html_beautify.html_beautify;return beautify}if(typeof define==="function"&&define.amd){define(["./lib/beautify","./lib/beautify-css","./lib/beautify-html"],function(js_beautify,css_beautify,html_beautify){return get_beautify(js_beautify,css_beautify,html_beautify)})}else{(function(mod){var js_beautify=require("./lib/beautify");var css_beautify=require("./lib/beautify-css");var html_beautify=require("./lib/beautify-html");mod.exports=get_beautify(js_beautify,css_beautify,html_beautify)})(module)}},{"./lib/beautify":3,"./lib/beautify-css":1,"./lib/beautify-html":2}]},{},[]);
                 return require('js-beautify').js_beautify;
          })();

         // get code editor from focused element.
         function findCodeEditor() {
             var templates = utui.customizations_template;
             var container = $("h3.ui-state-active").closest(".customize_container");
             var extension_id = container.data().id;
             var template_id = container.attr('data-template-id');
             var template = templates[template_id];
             if (template && template.editor) return template.editor[extension_id];
         }
         var jsb_config = {"indent_size": 2,"indent_char": " ","indent_with_tabs": false,"eol": "\n","end_with_newline": false,"indent_level": 0,"preserve_newlines": true,"max_preserve_newlines": 10,"space_in_paren": false,"space_in_empty_paren": false,"jslint_happy": false,"space_after_anon_function": false,"brace_style": "collapse","break_chained_methods": false,"keep_array_indentation": false,"unescape_strings": false,"wrap_line_length": 0,"e4x": false,"comma_first": false,"operator_position": "before-newline"}
         var codeEditor = findCodeEditor();
         if (!codeEditor) return;
         codeEditor.getCode = function() {
             return this.getValue();
         }
         codeEditor.getJSBeautifulCode = function(code) {
             code = code || codeEditor.getCode();
             return jsb(code, {
                 "indent_size": 2,
                 "indent_char": " ",
                 "indent_with_tabs": false,
                 "eol": "\n",
                 "end_with_newline": false,
                 "indent_level": 0,
                 "preserve_newlines": false,
                 "max_preserve_newlines": 0,
                 "space_in_paren": false,
                 "space_in_empty_paren": false,
                 "jslint_happy": false,
                 "space_after_anon_function": false,
                 "brace_style": "collapse",
                 "break_chained_methods": false,
                 "keep_array_indentation": false,
                 "unescape_strings": false,
                 "wrap_line_length": 0,
                 "e4x": false,
                 "comma_first": false,
                 "operator_position": "before-newline"
             })
          };
         codeEditor.setJSBeautifulCode = function() {codeEditor.setValue(codeEditor.getJSBeautifulCode());}
         codeEditor.getClosureCompiledCode = function(code) {
             code = code || this.getCode();
             if (!code) {return}
             function makeAJAXRequest(data) {
                 if (!data) return;
                 return $.ajax({
                     url: "https://closure-compiler.appspot.com/compile",
                     type: "POST",
                     async: true,
                     data: {
                         js_code: data,
                         compilation_level: "WHITESPACE_ONLY",
                         output_format: "text",
                         output_info: "compiled_code"
                     },
                     accepts: {
                         "*": "*/*",
                         text: "text/plain",
                         html: "text/html",
                         xml: "application/xml, text/xml",
                         json: "application/json, text/javascript"
                     },
                     cache: true,
                     headers: {
                         "Content-type": "application/x-www-form-urlencoded"
                     }
                 });
             }
             var req = makeAJAXRequest(code);
             req.done(function(data) {return data;})
             return req;
         }
         codeEditor.setMinifiedCode = function(code) {
             if (!code) code = this.getCode();
             var req = this.getClosureCompiledCode(code);
             req.done(function(data) {
                 codeEditor.setValue(data);
             })
         }
         return codeEditor;
     }


     var dateFormat=function(){var token=/d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,timezone=/(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)/g,timezoneClip=/[^-+\dA-Z]/g,pad=function(val,len){val=String(val);len=len||2;while(val.length<len){val="0"+val}return val};return function(date,mask,utc){var dF=dateFormat;if(arguments.length===1&&Object.prototype.toString.call(date)==="[object String]"&&!/\d/.test(date)){mask=date;date=undefined}date=date?new Date(date):new Date;if(isNaN(date)){throw SyntaxError("invalid date")}mask=String(dF.masks[mask]||mask||dF.masks["default"]);if(mask.slice(0,4)==="UTC:"){mask=mask.slice(4);utc=true}var _=utc?"getUTC":"get",d=date[_+"Date"](),D=date[_+"Day"](),m=date[_+"Month"](),y=date[_+"FullYear"](),H=date[_+"Hours"](),M=date[_+"Minutes"](),s=date[_+"Seconds"](),L=date[_+"Milliseconds"](),o=utc?0:date.getTimezoneOffset(),flags={d:d,dd:pad(d),ddd:dF.i18n.dayNames[D],dddd:dF.i18n.dayNames[D+7],m:m+1,mm:pad(m+1),mmm:dF.i18n.monthNames[m],mmmm:dF.i18n.monthNames[m+12],yy:String(y).slice(2),yyyy:y,h:H%12||12,hh:pad(H%12||12),H:H,HH:pad(H),M:M,MM:pad(M),s:s,ss:pad(s),l:pad(L,3),L:pad(L>99?Math.round(L/10):L),t:H<12?"a":"p",tt:H<12?"am":"pm",T:H<12?"A":"P",TT:H<12?"AM":"PM",Z:utc?"UTC":(String(date).match(timezone)||[""]).pop().replace(timezoneClip,""),o:(o>0?"-":"+")+pad(Math.floor(Math.abs(o)/60)*100+Math.abs(o)%60,4),S:["th","st","nd","rd"][d%10>3?0:(d%100-d%10!==10)*d%10]};return mask.replace(token,function($0){return $0 in flags?flags[$0]:$0.slice(1,$0.length-1)})}}();dateFormat.masks={default:"ddd mmm dd yyyy HH:MM:ss",shortDate:"m/d/yy",mediumDate:"mmm d, yyyy",longDate:"mmmm d, yyyy",fullDate:"dddd, mmmm d, yyyy",shortTime:"h:MM TT",mediumTime:"h:MM:ss TT",longTime:"h:MM:ss TT Z",isoDate:"yyyy-mm-dd",isoTime:"HH:MM:ss",isoDateTime:"yyyy-mm-dd'T'HH:MM:ss",modisoDateTime:"yyyy-mm-ddHMS",isoUtcDateTime:"UTC:yyyy-mm-dd'T'HH:MM:ss'Z'",modDate:"yyyy-mm-dd",modFileDate:"yyyymmdd-HHMMss"};dateFormat.i18n={dayNames:["Sun","Mon","Tue","Wed","Thu","Fri","Sat","Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],monthNames:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","January","February","March","April","May","June","July","August","September","October","November","December"]};Date.prototype.format=function(mask,utc){return dateFormat(this,mask,utc)};

     function save_template(data, type) {
      var id, title, curr_date;
      data = data || utui.adminlib.editor.getValue();
      if (dateFormat) {
        curr_date = (dateFormat('isoDate').replace(/-/igm, '') + '-' + dateFormat('shortTime')).replace(/ |:/igm, '');
       }
      //var curr_date = (new Date()).getTime();
      if (type === 'tag') {
        id = $("#manage_content").find('.ui-accordion-content-active').get(0).parentNode.dataset.id;
        if (id) {
          title = utui.data.manage[id].title;
        }
      } else if (type === 'extension') {
        id = $("h3.ui-state-active").closest(".customize_container").data().id;
        if (id) {
          title = utui.data.customizations[49] ? utui.data.customizations[49].title : "";
        }

      }
      var label = curr_date + '.' + utui.profile.lastAccount + '.' + utui.profile.lastProfile + '.UID:' + id + '.' + title + '.js';
      console.save(data, label);
    }

     function addPrettyPrint() {
         if (!$("#customize_prettyPrint").length) {
             var classname = "btn tmui";
             var buttonText = "Pretty Print";
             $('<span id="customize_prettyPrint" class="' + classname + '"><i class="icon-wrench"></i> ' + buttonText + "</span>")
             .css("float", "left")
             .css("margin-left", "10px")
             .click(function(e) {
                 code_editor = getCodeEditor();
                 if (code_editor) code_editor.setJSBeautifulCode();
             })
             .appendTo("#tabs-customizations .config_button_nofloat");
         }
     }
     function addSaveExtension() {
         if (!$("#customize_saveExtension").length) {
             var classname = "btn tmui";
             var buttonText = "save Extension";
             $('<span id="customize_saveExtension" class="' + classname + '"><i class="icon-wrench"></i> ' + buttonText + "</span>")
             .css("float", "left")
             .css("margin-left", "10px")
             .click(function(e) {
                 code_editor = getCodeEditor();
                 if (code_editor) {
                    let data = code_editor.getValue();
                    if (data) save_template(data, 'extension');
                 }
             })
             .appendTo("#tabs-customizations .config_button_nofloat");
         }
     }
    }
    /************** Pretty Print JSCode End ***************************/
    console.log("Finished TealiumIQ enhancements");
})();

// ==UserScript==
// @name          Enhancements 4.1 min
// @namespace     TIQ
// @require       https://rawgit.com/MauricioAndrades/enhancements-bin/master/tampermonkey/jquery.debug.js
// @require       https://raw.githubusercontent.com/ccampbell/mousetrap/master/mousetrap.min.js
// @require       https://raw.github.com/ccampbell/mousetrap/master/plugins/global-bind/mousetrap-global-bind.min.js
// @require       https://code.jquery.com/ui/1.11.2/jquery-ui.js
// @run-at        document-end
// @version       4.1
// @description   Addons to TealiumIQ
// @include       https://my.tealiumiq.com/tms
// ==/UserScript==
// 20170502.150560
// added indexDB backup of utui object, and method to not edit loadrules inherited from libraries.
// 20170815.110847: Conditions check 2.0
(function() {
  console.groupCollapsed("TealiumIQ Enhancements");
  console.log("Started TealiumIQ Enhancements");

  /* solutions methods */
  var get = {'tapid_cookie': function tapid_cookie() {return document.cookie.split('; ').filter((elem, i) => {return elem.indexOf('TAPID') > -1}).toString() || [];}}
  var try_catch = function try_catch(fn, args = [], ctx = null) {try {return fn.apply(ctx, args);} catch (e) {console.log(e);}}
  var async_request = function async_request(url) {return new Promise(request_xhr); function request_xhr(successCallback, failureCallback) {function onReadyStateChanged() {if (xhr.readyState !== XMLHttpRequest.DONE) {return;} if (xhr.status !== 200) {xhr.onreadystatechange = null; failureCallback(new Error(xhr.status)); return;} xhr.onreadystatechange = null; successCallback(xhr.responseText);} var xhr = new XMLHttpRequest; xhr.withCredentials = false; xhr.open("GET", url, true); xhr.onreadystatechange = onReadyStateChanged; xhr.send(null);} }
  var sync_request = function sync_request(params) {if (!params || params.src === "") return;var script = document.createElement("script");script.async = false;script.type = "application/javascript";for (var key in params) {if (params.hasOwnProperty(key)) {script[key] = params[key];}}document.head.appendChild(script);};
  var async_exec = function async_exec(data, id) {return new Promise(exec); function exec(resolve, reject) {try {if (!data) {console.log("async_request: could not load: " + id); return;} var script = document.createElement("script"); script.type = "text/javascript"; script.innerHTML = data; script.id = id; document.body.appendChild(script); resolve(true);} catch (e) {reject(e);} } }
  var kindof = function kindof(d) {var t = Object.prototype.toString.call(d).match(/\s([a-zA-Z]+)/)[1].toLowerCase().replace(/^html|element/gim,""); switch(t) {case"number":return isNaN(d) ? "nan" : "number"; default:return t;}}
  var cachebust = function cachebust() {return (function() {var rep = /.*\?.*/;var links = document.getElementsByTagName("link");var scripts = document.getElementsByTagName("script");var process_scripts = true;for (let i = 0; i < links.length; i++) {var link = links[i];href = link.hasAttribute("href") ? link.getAttribute("href") : "";if (rep.test(href)) {link.href = href + "&_cb=" + Date.now();} else {link.href = href + "?_cb=" + Date.now();}}if (process_scripts) {for (let i = 0; i < scripts.length; i++) {var script = scripts[i],src = script.hasAttribute("src") ? script.getAttribute("src") : "";if (src && rep.test(src)) {script.src = src + "&_cb=" + Date.now();} else if (src) {script.src = src + "?_cb=" + Date.now();}}}})();};
  /* end solution */

  var features, featuresOptIn;

  var currentURL = window.location.toString();
  function contentEval(source,execute) {if("function" === typeof source && execute) {source = "(" + source + ")();";}var script = document.createElement("script"); script.setAttribute("type","application/javascript"); script.textContent = source; document.body.appendChild(script);}
  function currentURLMatches(listToMatch) {for(var i in listToMatch) {var pattern = listToMatch[i]; var regex = new RegExp(pattern); if(currentURL.match(regex)) {return true;}}}
  function keepTrying(func,callback,sleep,maxAttempts) {if(typeof sleep === "undefined") {sleep = 100;}var totalAttempts = 0; var args = Array.prototype.slice.call(arguments,2); var timer = setInterval(function() {if(func.apply(null,args)) {clearInterval(timer); callback();}else{totalAttempts++; if(typeof maxAttempts !== "undefined") {if(totalAttempts > maxAttempts) {clearInterval(timer); console.log("Reached maximum number of attepts.  Going to stop checking.");}}}},sleep);}
  function when(test,run,sleep,maxAttempts) {var args = Array.prototype.slice.call(arguments,2); keepTrying(test,function() {run.apply(null,args);},sleep,maxAttempts);}
  //Natural sort function
  function alphaNumSort(a,b) {function chunkify(t) {var tz = new Array; var x = 0,y = -1,n = 0,i,j; while(i = (j = t.charAt(x++)).charCodeAt(0)) {var m = i == 46 || i >= 48 && i <= 57; if(m !== n) {tz[++y] = ""; n = m;}tz[y] += j;}return tz;}var aa = chunkify(a); var bb = chunkify(b); for(x = 0; aa[x] && bb[x]; x++) {if(aa[x] !== bb[x]) {var c = Number(aa[x]),d = Number(bb[x]); if(c == aa[x] && d == bb[x]) {return c - d;}else{return aa[x] > bb[x] ? 1 : -1;}}}return aa.length - bb.length;}
  jQuery.fn.bindFirst = function(name,fn) {this.on(name,fn); this.each(function() {var handlers = jQuery._data(this,"events")[name.split(".")[0]]; var handler = handlers.pop(); handlers.splice(0,0,handler);});};
  //jQuery extension to support afterShow event
  jQuery(function($) {var _oldShow = $.fn.show; $.fn.show = function(speed,oldCallback) {return $(this).each(function() {var obj = $(this),newCallback = function() {if($.isFunction(oldCallback)) {oldCallback.apply(obj);}obj.trigger("afterShow");}; obj.trigger("beforeShow"); _oldShow.apply(obj,[speed,newCallback]);});};});
  function displayMessageBanner(message) {$("#messageBannerDiv").remove(); $('<div id="messageBannerDiv"><span id="messageBannerClose">X</span><span id="messageBannerMessage">' + message + "</span></div>").css("background-color","#d9534f").css("position","absolute").css("top","10px").css("width","531px").css("height","30px").css("margin-left","27%").css("border-radius","6px").css("text-align","center").appendTo("#app_header"); $("#messageBannerMessage").css("top","5px").css("color","black").css("position","relative").css("font-size","15px"); $("#messageBannerClose").css("float","left").css("border","1px solid black").css("border-radius","6px").css("cursor","pointer").css("padding","5.5px").css("position","relative").css("font-size","15px").click(function() {$("#messageBannerDiv").remove();}); return true;}
  window.truncate = function(str,len) {if(str.length > len) {str = str.substr(0,len - 3) + "...";}return str;};

  /************** Cleanup TAPID Start ***************************/
  try {
    console.log("Cleanup TAPID Loading");
    (function() {
      if (!unsafeWindow.jQuery) {return;}
      var save_profiles = "";
      var len;
      var max_profiles = 5;
      var myDate = new Date;
      var profiles = unsafeWindow.jQuery.cookie("TAPID");
      var profile_type = kindof(profiles);
      if ("null" === profile_type) {
        profiles = [];
      } else if (profile_type === "string") {
        profiles = profiles.split("|").filter((elem) => elem !== "");
        len = profiles.length > max_profiles ? max_profiles : profiles.length;
        for (var i = 0; i < len; i++) {
          if (profiles[i] !== "") {
            save_profiles += profiles[i] + "|";
          }
        }
        myDate.setFullYear(myDate.getFullYear() + 10);
        unsafeWindow.document.cookie = "TAPID=" + save_profiles + ";domain=.tealiumiq.com;path=/;expires=" + myDate;
      }
    })();
    console.log("Cleanup TAPID Loaded");
  } catch (e) {
    console.log("Cleanup TAPID Failed: " + e);
  }
  /************** Cleanup TAPID End ***************************/
  var observerConfig = {attributes: true,childList: true,characterData: true};
  /************** Setup TM Features List Start ***************************/
  (function() {
      features = JSON.parse(localStorage.getItem("tiq_features")) || {};
      featuresOptIn = Number(localStorage.getItem("tiq_features_opt_in")) || 1;
      /***** Section to remove old names that are no longer being used *******/
      if (features.quickSwitch) {delete features.quickSwitch;}
      if (features.checkStalePermissions) {delete features.checkStalePermissions;}
      /***********************************************************************/
      if (typeof features.saveAs === "undefined") {features.saveAs = {}; features.saveAs.name = "Save As"; features.saveAs.enabled = featuresOptIn; }
      if (typeof features.autoLogout === "undefined") {features.autoLogout = {}; features.autoLogout.name = "Auto Logout"; features.autoLogout.enabled = featuresOptIn; }
      if (typeof features.checkPermissions === "undefined") {features.checkPermissions = {}; features.checkPermissions.name = "Check Permissions"; features.checkPermissions.enabled = featuresOptIn; }
      if (typeof features.accountProfileHighlighter === "undefined") {features.accountProfileHighlighter = {}; features.accountProfileHighlighter.name = "Account Profile Highlighter"; features.accountProfileHighlighter.enabled = featuresOptIn; }
      if (typeof features.captureKeys === "undefined") {features.captureKeys = {}; features.captureKeys.name = "Capture Keys"; features.captureKeys.enabled = featuresOptIn; }
      if (typeof features.tagWizardShortcuts === "undefined") {features.tagWizardShortcuts = {}; features.tagWizardShortcuts.name = "Tag Wizard Shortcuts"; features.tagWizardShortcuts.enabled = featuresOptIn; }
      if (typeof features.quickSwitchV1 === "undefined") {features.quickSwitchV1 = {}; features.quickSwitchV1.name = "Quick Switch v1"; features.quickSwitchV1.enabled = 0; }
      if (typeof features.quickSwitchV2 === "undefined") {features.quickSwitchV2 = {}; features.quickSwitchV2.name = "Quick Switch v2"; features.quickSwitchV2.enabled = featuresOptIn; }
      if (typeof features.showLabels === "undefined") {features.showLabels = {}; features.showLabels.name = "Show Labels"; features.showLabels.enabled = featuresOptIn; }
      if (typeof features.localTimestamp === "undefined") {features.localTimestamp = {}; features.localTimestamp.name = "Show Local Timestamp"; features.localTimestamp.enabled = featuresOptIn; }
      if (typeof features.extensionSearch === "undefined") {features.extensionSearch = {}; features.extensionSearch.name = "Extensions Search"; features.extensionSearch.enabled = featuresOptIn; }
      if (typeof features.extensionShortcuts === "undefined") {features.extensionShortcuts = {}; features.extensionShortcuts.name = "Extensions Shortcuts"; features.extensionShortcuts.enabled = featuresOptIn; }
      if (typeof features.extensionScroll === "undefined") {features.extensionScroll = {}; features.extensionScroll.name = "Extensions Scroll"; features.extensionScroll.enabled = featuresOptIn; }
      if (typeof features.lookupSort === "undefined") {features.lookupSort = {}; features.lookupSort.name = "Lookup Table Sort"; features.lookupSort.enabled = featuresOptIn; }
      // if(typeof features.checkStalePermissions == 'undefined'){features.checkStalePermissions = {};features.checkStalePermissions.name = 'Check Stale Permissions';features.checkStalePermissions.enabled = featuresOptIn;}
      if (typeof features.removeAlias === "undefined") {features.removeAlias = {}; features.removeAlias.name = "Hide Alias"; features.removeAlias.enabled = featuresOptIn; }
      if (typeof features.sendToTopBottom === "undefined") {features.sendToTopBottom = {}; features.sendToTopBottom.name = "Send Rows to Top or Bottom"; features.sendToTopBottom.enabled = featuresOptIn; }
      if (typeof features.globalMessage === "undefined") {features.globalMessage = {}; features.globalMessage.name = "Global Message"; features.globalMessage.enabled = featuresOptIn; }
      if (typeof features.autoSave === "undefined") {features.autoSave = {}; features.autoSave.name = "Auto Save iQ"; features.autoSave.enabled = featuresOptIn; }
      if (typeof features.newTagDisableProd === "undefined") {features.newTagDisableProd = {}; features.newTagDisableProd.name = "New Tag Disable Prod"; features.newTagDisableProd.enabled = featuresOptIn; }
      if (features.newTagDisableProd.name == "Auto Save iQ") {features.newTagDisableProd.name = "New Tag Disable Prod"; }
      if (typeof features.tagSearch === "undefined") {features.tagSearch = {}; features.tagSearch.name = "Tag Search"; features.tagSearch.enabled = featuresOptIn; }
      if (typeof features.ecommExtension === "undefined") {features.ecommExtension = {}; features.ecommExtension.name = "Add Ecomm Ext Button"; features.ecommExtension.enabled = featuresOptIn; }
      if (typeof features.sitecatMappingSort === "undefined") {features.sitecatMappingSort = {}; features.sitecatMappingSort.name = "Add Sitecat Mapping Sort"; features.sitecatMappingSort.enabled = featuresOptIn; }
      if (typeof features.bulkLoadRules === "undefined") {features.bulkLoadRules = {}; features.bulkLoadRules.name = "Bulk Load Rules Import"; features.bulkLoadRules.enabled = featuresOptIn; }
      if (typeof features.enlargeIds === "undefined") {features.enlargeIds = {}; features.enlargeIds.name = "Enlarge ID"; features.enlargeIds.enabled = featuresOptIn; }
      if (typeof features.conditionCheck === "undefined") {features.conditionCheck = {}; features.conditionCheck.name = "Condition Check"; features.conditionCheck.enabled = featuresOptIn; }
      if (typeof features.addBulkDataSources === "undefined") {features.addBulkDataSources = {}; features.addBulkDataSources.name = "Add Bulk DataSources"; features.addBulkDataSources.enabled = featuresOptIn; }
      if (typeof features.updateTitle === "undefined") {features.updateTitle = {}; features.updateTitle.name = "Update TiQ Title"; features.updateTitle.enabled = featuresOptIn; }
      /************** Solutions ********************************/
      if (typeof features.solutions_fix_conditions === "undefined") {features.solutions_fix_conditions = {};features.solutions_fix_conditions.url = "https://cdn.rawgit.com/MauricioAndrades/enhancements-bin/1.8/tampermonkey/solutions.fix_conditions.js";features.solutions_fix_conditions.name = "Fix Incomplete Conditions";features.solutions_fix_conditions.enabled = featuresOptIn;}
      if (typeof features.solutions_extra_info === "undefined") {features.solutions_extra_info = {};features.solutions_extra_info.url = "https://cdn.rawgit.com/MauricioAndrades/enhancements-bin/1.8/tampermonkey/solutions.extra_info.js";features.solutions_extra_info.name = "Solutions: Extra Info";features.solutions_extra_info.enabled = featuresOptIn;}
      if (typeof features.solutions_code_enh === "undefined") {features.solutions_code_enh = {};features.solutions_code_enh.url = "https://rawgit.com/MauricioAndrades/enhancements-bin/1.8/tampermonkey/solutions.code_enh.js";features.solutions_code_enh.name = "Solutions: Code Enh";features.solutions_code_enh.enabled = featuresOptIn;}
      /************** End Solutions ***************************/
      localStorage.setItem("tiq_features", JSON.stringify(features));
      localStorage.setItem("tiq_features_opt_in", featuresOptIn);
    })();
    /************** Setup TM Features List End ***************************/
    /************** Update TM Features Start ***************************/
    console.log("Update TM Features Loading");
    try {
      (function() {
      function showManageFeatures(data) {
        $(".dialog-context-nav").css("max-height", "600px");
        $("#popup").remove();
        var buttons = $('<div><button id="saveFeatures">Save</button><button id="closePopup">Close</button></div>').css("padding-top", "15px").css("margin-left", "22%");
        $('<div id="popup"><h4 id="featuresMessage"></h4><form id="featuresForm"><table><thead><tr><th>Feature</th><th>Enabled?</th></tr></thead><tbody></tbody></table></form></div>').css("position", "relative").css("z-index", "5001").css("border", "1px black solid").css("padding", "15px").css("border-radius", "6px").css("background", "white").append(buttons).insertAfter($("#updateTMFeatures").parent());
        $("#featuresForm").css("height", "auto");
        $("#closePopup").css("cursor", "pointer").click(function() {$("#popup").remove();});
        $("#saveFeatures").click(function() {saveFeatures();});
        $('<li><a href="https://docs.google.com/a/tealium.com/document/d/1yrcJg7inHc5SbaUWVC89Bcm3GvC0gjUJtKfBQKtb7Sw/edit" id="documentTMFeatures" target="_blank">TM Documentation</a></li>').click(function() {
          window.open("https://docs.google.com/a/tealium.com/document/d/1yrcJg7inHc5SbaUWVC89Bcm3GvC0gjUJtKfBQKtb7Sw/edit", "_blank");
        }).insertAfter("#featuresMessage");
        var enabled = featuresOptIn ? "checked" : "";
        $('<tr><td>Auto Enable Features</td><td><input type="checkbox" data-feature-name="tiq_features_opt_in" ' + enabled + " /></td></tr>").appendTo("#featuresForm tbody");
        Object.keys(data).forEach(function(key) {
          var checked = data[key].enabled ? "checked" : "";
          $("<tr><td>" + data[key].name + '</td><td><input type="checkbox" data-feature-name="' + key + '" ' + checked + " /></td></tr>").appendTo("#featuresForm tbody");
        });
      }
        function saveFeatures() {console.log("Saving Feature Preferences"); $("#featuresForm tbody tr").each(function() {var checked = $(this).find("td:last input").is(":checked") ? 1 : 0; var featureName = $(this).find("td:last input").attr("data-feature-name"); if(featureName == "tiq_features_opt_in") {featuresOptIn = checked;}else{features[featureName].enabled = checked;}}); localStorage.setItem("tiq_features",JSON.stringify(features)); localStorage.setItem("tiq_features_opt_in",featuresOptIn); console.log(features); $("#featuresMessage").html('Successfully Updated Your Preferences!<br/><br/><span style="color: red;"> You will need to refresh TIQ for updates to take effect.</span>');}
        var myiqObserver = new MutationObserver(function(mutations) {console.log("MutationObserver of the My iQ left navigation"); if(!$("#updateTMFeatures").length) {$('<li class="tmui"><a href="#" id="getGlobalMessage">Show Global Message</a></li>').click(function() {unsafeWindow.__getGlobalMessageAllow = "true"; getGlobalMessage(true);}).insertAfter("#tabs-dashboard .dialog-context-nav li:last"); $('<li class="tmui"><a href="#" id="updateTMFeatures">Enable/Disable TM Features</a></li>').click(function() {showManageFeatures(features);}).insertAfter("#tabs-dashboard .dialog-context-nav li:last");}});
        myiqObserver.observe(document.querySelector("#tabs-dashboard #my_site_context"), observerConfig);
        when(function() {return $("#tabs-dashboard #my_site_context").is(":visible");},function() {if(!$("#updateTMFeatures").length) {$('<li class="tmui"><a href="#" id="getGlobalMessage">Show Global Message</a></li>').click(function() {unsafeWindow.__getGlobalMessageAllow = "true"; getGlobalMessage(true);}).insertAfter("#tabs-dashboard .dialog-context-nav li:last"); $('<li class="tmui"><a href="#" id="updateTMFeatures">Enable/Disable TM Features</a></li>').click(function() {showManageFeatures(features);}).insertAfter("#tabs-dashboard .dialog-context-nav li:last");}});
        console.log("Update TM Features Loaded");
      })();
    } catch (e) {
      console.log("Update TM Features Failed: " + e);
    }
    /************** Update TM Features End ***************************/
    /************** Select SaveAs Start ***************************/
    if(features.saveAs.enabled) {try{console.log("Save As Loading"); $("#global_save").click(function() {console.log("global_save clicked"); var origSaveTitle = $("#profile_legend_revision").text().trim(); var saveTitle = $("#profile_legend_revision").text().trim().replace(/\d{4}\.\d{2}\.\d{2}\.\d{4}/g,"").replace(/\d{4}\/\d{2}\/\d{2}\ \d{2}:\d{2}/g,"").trim(); when(function() {return $("span:contains(Save As)").is(":visible");},function() {$("span:contains(Save As)").click(function() {console.log("Save As clicked"); if(!saveTitle.match(/ -$/)) {saveTitle += " -";}when(function() {return origSaveTitle != $("#savepublish_version_title").val();},function() {$("#savepublish_version_title").val($("#savepublish_version_title").val().replace(/Version/,saveTitle).replace(/(\d{4})\.(\d{2})\.(\d{2})\.(\d{2})(\d{2})/,"$1/$2/$3 $4:$5")); setTimeout(function() {$("#publish_notes").focus();},150);}); $("#checkBtn_dev").not(".publish_connector_connected").click(); $("#checkBtn_qa").not(".publish_connector_connected").click(); $("input[name*=forceFTP]").attr("tabindex",999); $(".ui-button-text:contains(Publish)").attr("tabindex",1);}); $("span:contains(Save As)")[0].click(); $("body").keyup(function(e) {var code = e.keyCode || e.which; if(code == "9" && $(document.activeElement).attr("id") === "savepublish_version_title") {var end = $("#savepublish_version_title").val().indexOf(" -"); $("#savepublish_version_title")[0].setSelectionRange(0,end);}});});}); console.log("Save As Loaded");}catch(e) {console.log("Select Save As Failed: " + e);}}
    /************** Select SaveAs End ***************************/
    /************** No Auto Logout Start ***************************/
    if (false && features.autoLogout.enabled) {
      try {
        (function() {
          if(!unsafeWindow.utag) {return;}
          console.log("No Auto Logout Loading");
          setInterval(function() {
            unsafeWindow.utui.util.setSession();
          }, 3e5);
          var ping_community_interval = setInterval(ping_community, 15e5);

          function ping_community() {
            if (!unsafeWindow.utag) {return;}
            utag.ut.loader({
              "type": "img",
              "src": "https://community.tealiumiq.com/"
            });
          }
          console.log("No Auto Logout Loaded");

        })();
      } catch (e) {
        console.log("No Auto Logout Failed: " + e);
      }
    }
    /************** No Auto Logout End ***************************/
    /************** No Permissions Message Start ***************************/
    if (features.checkPermissions.enabled) {
      (function() {
        try {
          console.log("No Permissions Message Loading");
          function checkForPermissions() {
            when(function() {
              var utui;
              if (unsafeWindow && unsafeWindow.utui) {
                utui = unsafeWindow.utui;
              }

              if (window.utui) {utui = window.utui;}
              return utui && utui.permissions && utui.users && Object.keys(utui.permissions.getUserPermissions()).length > 0;
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
      })();
    }
    /************** No Permissions Message End ***************************/
    /************** Account/Profile Highlighter Start ***************************/
    if(features.accountProfileHighlighter.enabled) {try{console.log("Account/Profile Highlighter Loading"); var highlightAccount = function() {$("#profile_account-autocomplete")[0].setSelectionRange(0,$("#profile_account-autocomplete").val().length);}; var highlightProfile = function() {$("#profile_profileid-autocomplete")[0].setSelectionRange(0,$("#profile_profileid-autocomplete").val().length);}; $("#ui-active-menuitem").on("click",function() {console.log("clicked on active menu item");}); $("#profile_menu_wrapper").click(function() {$("#profile_account-autocomplete").attr("type","text").click(highlightAccount).change(function() {console.log("account changed"); setTimeout(highlightProfile,250);}); $("#lastaccount button").click(highlightAccount); $("#profile_profileid-autocomplete").attr("type","text").click(highlightProfile); $("#lastprofile button").click(highlightProfile);}); console.log("Account/Profile Highlighter Loaded");}catch(e) {console.log("Account/Profile Highlighter Failed: " + e);}}
    /************** Account/Profile Highlighter End ***************************/
    /************** Capture Keys Start ***************************/
    if(features.captureKeys.enabled) {try{console.log("Capture Keys Loading"); Mousetrap.bindGlobal("mod+s",function(e) {e.preventDefault(); console.log("User is trying to save"); if($('.admin_labelno:contains("Edit Your Existing Template")').is(":visible")) {$('span:contains("Save Profile Template")').click(); if(typeof markTagAsNotSaved === "function") {markTagAsNotSaved();}}else{$("#global_save").click();}}); Mousetrap.bindGlobal("esc",function(e) {e.preventDefault(); console.log("User hit escape"); if($('.admin_labelno:contains("Edit Your Existing Template")').is(":visible")) {$("[aria-labelledby=ui-dialog-title-admin_dialog] .ui-icon-closethick").click();}else if($("[aria-labelledby=ui-dialog-title-savePublish_dialog] .ui-icon-closethick").is(":visible")) {$("[aria-labelledby=ui-dialog-title-savePublish_dialog] .ui-icon-closethick").click();}else if($("#account_message_popup").is(":visible")) {$("#account_message_popup").remove();}else{$("[aria-labelledby=ui-dialog-title-manage_dialog_wizard] .ui-icon-closethick").click();}}); console.log("Capture Keys Loaded");}catch(e) {console.log("Capture Keys Failed: " + e);}}
    /************** Capture Save Keys End ***************************/
    /************** Content Eval Section Start ******************************/
    if (features.tagWizardShortcuts.enabled) {
      try {
        contentEval(function() {
          var keepTrying = function(func, callback, sleep) {
            if (typeof sleep === "undefined") {
              sleep = 100;
            }
            var args = Array.prototype.slice.call(arguments, 2);
            var timer = setInterval(function() {
              var functionResponse = func.apply(null, args);
              if (functionResponse) {
                clearInterval(timer);
                callback();
              } else {}
            }, sleep);
          };
          var when = function(test, run, sleep) {
            var args = Array.prototype.slice.call(arguments, 2);
            keepTrying(test, function() {
              run.apply(null, args);
            }, sleep);
          };

          function displayMessageBanner(message) {
            $("#messageBannerDiv").remove();
            $('<div id="messageBannerDiv"><h3 id="messageBannerMessage">' + message + "</h3></div>").css("background-color", "#d9534f").css("position", "absolute").css("top", "10px").css("width", "25%").css("margin-left", "35%").css("margin-right", "35%").css("border-radius", "6px").css("text-align", "center").appendTo("body");
            $("#messageBannerMessage").css("padding", "7px");
            return true;
          }
          console.log("Shortcuts and Optimazations for Tag Wizard Loading");

          function setupDataMappingShortcuts() {
            $("#dialog-managetoolbox-content").text("");
            $("select[id*=mapselect]").on("change", function() {
              var datasource = $(this).val().split(".");
              $('span:contains("Select Destination")').click();
              when(function() {
                return $("#ui-dialog-title-dialog-managetoolbox").length && $('#ui-dialog-title-dialog-managetoolbox:contains("' + datasource[1] + " (" + datasource[0] + ')")') && $("#dialog-managetoolbox-content").text().length;
              }, function() {
                $('div[aria-labelledby="ui-dialog-title-dialog-managetoolbox"] span:contains(Cancel)').click(function() {
                  $("ul[id*=mapcontent] input[type=text]:last").focus();
                });
                if ($('#dialog-managetoolbox-content:contains("There is no toolbox available for this vendor")').length) {
                  $('div[aria-labelledby="ui-dialog-title-dialog-managetoolbox"] span:contains(Cancel)').click();
                } else {
                  $("div[id*=managetoolbox_] option").on("dblclick", function() {
                    $('div[aria-labelledby="ui-dialog-title-dialog-managetoolbox"] span:contains(Apply)').click();
                  });
                }
              });
            });
            $('span:contains("Add Destination")').on("click", function() {
              var variableText = $(this).closest(".managemap_div").find(".managemap_label").text().trim();
              when(function() {
                return $("#ui-dialog-title-dialog-managetoolbox").length && $('#ui-dialog-title-dialog-managetoolbox:contains("' + variableText + '")') && $("#dialog-managetoolbox-content").text().length;
              }, function() {
                $("div[id*=managetoolbox_] option").on("dblclick", function() {
                  $('div[aria-labelledby="ui-dialog-title-dialog-managetoolbox"] span:contains(Apply)').click();
                });
              });
            });
            if (!$("#mappingsBulkRow").length) {
              $('<tr id="mappingsBulkRow" class="tmui"><td></td></tr>').appendTo("#wizard_variables_wrapper tbody");
              $('<span id="mappingsImport" class="btn btn-small actionAddMapping i-color-add"><i class="icon-arrow-down"></i> Import from CSV</span>').appendTo("#mappingsBulkRow td").click(function() {
                showImportExportPopup("", "body");
              });
              if ($('.noItemsMapVariable[style*="display: none;"]').length) {
                $('<span id="mappingsExport" class="btn btn-small actionAddMapping i-color-add"><i class="icon-arrow-up"></i> Export to CSV</span>').css("margin-left", "10px").appendTo("#mappingsBulkRow td").click(exportMappings);
              }
            }
            $(".variable_map_container").css("max-height", "330px");
            $(".noItemsMapVariable").css("top", "75px");
          }

          function showImportExportPopup(content, prepend) {
            $("#popup").remove();
            var close = $('<button type="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only"><span class="ui-button-text">Close</span></button>').click(function() {
              $("#popup").remove();
            });
            close.css("cursor", "pointer").css("float", "right").css("margin-right", "10px");
            $('<div id="popup" class="ui-dialog ui-widget ui-widget-content ui-corner-all"><div class="ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix"><span class="ui-dialog-title">Bulk Add Data Mappings</span></div><span class="alert" style="color:red;margin-left:20px;font-size:16px;"></span><br/><span class="helpText" style="margin-left:20px; display:block;">Format: data layer variable, type (js,dom,meta,cp,qp,customization2), destination</span><textarea id="popupText" rows="10" cols="80" /></div>').attr("style", "position: absolute; z-index: 10000; left: 40%;top: 200px; width: 400px;").width(400).height(265).append(close).prependTo(prepend);
            $("#popupText").css("width", "90%").css("margin-top", "4%").css("margin-left", "4%").css("margin-bottom", "5px").val(content);
            if (!content) {
              $('<button type="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only"><span class="ui-button-text">Import</span></button>').click(importMappings).css("cursor", "pointer").css("float", "left").css("margin-left", "10px").appendTo("#popup");
              $('<input type="checkbox" id="createDataLayerOption" />').css("float", "left").css("margin-left", "10px").appendTo("#popup");
              $('<label title="If data layer name isn\'t found, checking the box will create it.">Create Data Layer Elements?</label>').css("float", "left").css("margin-top", "3px").appendTo("#popup");
              $("#popup .alert").text("");
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
            $("#popup span:contains(Close)").click();
            $("span:contains(Apply):visible").click();
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
          when(function() {
            return typeof jQuery === "function";
          }, function() {
            $(document).on("click", "span.actionEditSettings, span.actionEditRules, span.actionMapping", function(e) {
              $("div.wizard_item input").not(".wizard_title").css("width", "495px");
              $('<div class="wizard_config"><div class="wizard_label"><a href="#" id="manage_advconfig_template_tooltip_top" class="actionAdvConfigEdit btn btn-small i-color-edit tmui" original-title="This will launch a window that will allow you to view and/or manage the code behind your tag."><i class="icon-edit"></i> Edit Templates</a></div></div><br/><br/>').insertBefore(".dialogSectionHeader:contains(Properties)");
              $('<div class="wizard_config"><div class="wizard_label"><a href="#" id="manage_advconfig_template_tooltip_bottom" class="actionAdvConfigEdit btn btn-small i-color-edit tmui" original-title="This will launch a window that will allow you to view and/or manage the code behind your tag."><i class="icon-edit"></i> Edit Templates</a></div></div>').insertAfter("#tagConfigBasicSettings");
              $("#manage_advconfig_template_tooltip_bottom,#manage_advconfig_template_tooltip_top").click(function() {
                $("#manage_advconfig_template_tooltip").click();
              });
              $('div.dialogSectionHeader:contains("Advanced Settings")').unbind("click").click(function() {
                $("#tagConfigAdvSettings .dialog_section_body").slideToggle({
                  duration: "fast",
                  queue: false
                });
                $("#tagConfigAdvSettings .dialogSectionHeader i").toggleClass("icon-caret-right").toggleClass("icon-caret-down");
              }).click();
              setupDataMappingShortcuts();
              var div_id = $('#manage_dialog_wizard [name^="manage_content_"]:first').attr("id").match(/(manage_content_\d+)/)[1];
              var tag_uid = $("#" + div_id).data("id");
              var tag_id = utui.data.manage[tag_uid].tag_id;
              if (!$('#manage_dialog_wizard [id="tagTemplateChangeLogModal"]:visible').length) {
                $('<div id="tagTemplateChangeLogModal" class="tmui" style="position:relative;left:20px;width:155px;"><a href="#" class="btn btn-small tmui">Tag Template Change Log</a></div>').appendTo(".wizard_nav:visible").click(function() {
                  common.utils.openWindow("https://solutions.tealium.net/tools/tagchangelog?uid=" + tag_id, "_blank");
                });
              }
            });
            $(document).on("mousedown", "button.js-addtag-btn", function(e) {
              when(function() {
                return $('div.dialogSectionHeader:contains("Advanced Settings")').is(":visible");
              }, function() {
                $("div.wizard_item input").not(".wizard_title").css("width", "495px");
                setupDataMappingShortcuts();
              });
            });
            window.addEditTemplatesToManageScreen = function() {
              if (!$("[id=manage_advconfig_template_tooltip_manage]:visible").length) {
                $('<a href="#" id="manage_advconfig_template_tooltip_manage" data-container-id="' + $(".actionEditSettings:visible").closest(".manage_container").attr("id") + '" class="actionAdvConfigEdit btn btn-small i-color-edit tmui" original-title="This will launch a window that will allow you to view and/or manage the code behind your tag."><i class="icon-edit"></i> Edit Templates</a>').insertBefore($(".actionEditSettings:visible")).css("margin-right", "5px").css("display", "inline-block").click(function() {
                  utui.adminlib.getTemplateList($(this).closest(".manage_container").data("id"));
                });
              }
            };
            window.addTagTemplateChangeLogToManageScreen = function(context) {
              $this = $(context);
              if (!$this.find('[id="tagTemplateChangeLogManage"]:visible').length) {
                $('<div id="tagTemplateChangeLogManage" class="tmui" style="position:relative;left:20px;width:155px;"><a href="#" class="btn btn-small tmui">Tag Template Change Log</a></div>').appendTo(".contextBox:visible").click(function() {
                  common.utils.openWindow("https://solutions.tealium.net/tools/tagchangelog?uid=" + utui.data.manage[$this.data("id")].tag_id, "_blank");
                });
              }
            };
            // better method for adding edit button
            if (window.utui) {
              utui.util.pubsub.unsubscribe(utui.constants.tags.ACCORDION_EXPANDED, window.addEditTemplatesToManageScreen);
              utui.util.pubsub.subscribe(utui.constants.tags.ACCORDION_EXPANDED, window.addEditTemplatesToManageScreen);
            }
            $(document).on("click", ".manage_container", function(e) {addTagTemplateChangeLogToManageScreen(this);});
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
}, 1);
} catch (e) {
  console.log("Content Eval Failed: " + e);
}
}
/************** Content Eval Section End ******************************/
/************** Setup Listener for Profile Load Event Start **********************/
try {
  console.log("Listener for Profile Load Event Loading");
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
        return typeof unsafeWindow.utui !== "undefined" && typeof unsafeWindow.utui.login !== "undefined" && typeof unsafeWindow.utui.login.account !== "undefined" && typeof utui.data.publish_history !== "undefined";
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
        return typeof unsafeWindow.utui !== "undefined" && typeof unsafeWindow.utui.login !== "undefined" && typeof unsafeWindow.utui.login.account !== "undefined" && typeof utui.data.publish_history !== "undefined";
      }, function() {
        enlargeIds();
      });
    }
    if (features.updateTitle.enabled) {
      updateTiQTitle();
    }
  });
  console.log("Listener for Profile Load Event Loaded");
} catch (e) {
  console.log("Listener for Profile Load Event Failed: " + e);
}
/************** Setup Listener for Profile Load Event End ************************/
/************** Add Quick Switch v1 Start ***************************/
if(features.quickSwitchV1.enabled) {try{console.log("Quick Switch v1 Loading"); if(typeof __tealium_quickswitch === "undefined") {__tealium_quickswitch = document.createElement("SCRIPT"); __tealium_quickswitch.type = "text/javascript"; __tealium_quickswitch.src = "//tags.tiqcdn.com/utag/tealium/chris.davison/prod/utag.78.js?_cb="; Math.random(); document.getElementsByTagName("head")[0].appendChild(__tealium_quickswitch);}else if(typeof quickswitch !== "undefined") {quickswitch.init();}console.log("Quick Switch v1 Loaded");}catch(e) {console.log("Quick Switch v1 Failed: " + e);}}
/************** Add Quick Switch v1 End ***************************/
/************** Add Quick Switch v2 Start ***************************/
if(features.quickSwitchV2.enabled) {try{console.log("Quick Switch v2 Loading"); $('<style id="quickSwitchStyleSheet">              #profile_account-autocomplete,#lastaccount button[title="Show All Items"],#profile_profileid-autocomplete,#lastprofile button[title="Show All Items"],#lastrevision{                display:none;            }            .menu_list_container{width: 205px;}            .ui-autocomplete{width: 160px !important;}            #select_account,#select_profile{width: 154px;}            #profile_menu_list input{max-width: 154px;}            .ui-autocomplete .ui-menu-item {                text-decoration: none;                display: block;                padding: .2em .4em;                line-height: 1.5;                zoom: 1;            }            .quickSwitch{                display: inline-block !important;                padding-left: 6px !important;            }            #quickSwitchSort{                padding-left: 10px !important;            }            .quickSwitchFavIcon{                color: #E8D033;                cursor: pointer;            }            </style>').appendTo("head"); window.buildRecentHistory = function() {var html = '<div class="menulistheaderfont">Recent History (Sortable) &nbsp;&nbsp;&nbsp;<i id="acct_refresh" class="icon-refresh" style="cursor: pointer;" title="Refresh Account List"></i></div><ul id="quickSwitchSort" style="list-style-type:none;">'; var recentProfiles = JSON.parse(localStorage.getItem("recent_history")); if(!recentProfiles) {storeHistory(); recentProfiles = JSON.parse(localStorage.getItem("recent_history"));}for(var i = 0; i < recentProfiles.length; i++) {var favIcon = recentProfiles[i].favorite ? "icon-star" : "icon-star-empty"; if(i === 0) {favIcon = "icon-user";}html += '<li><div class="menulistitem"><i class="' + favIcon + ' quickSwitchFavIcon"></i><a class="menulistfont wordwrap quickSwitch" href="#" data-account="' + recentProfiles[i].account + '" data-profile="' + recentProfiles[i].profile + '">' + i + ": " + truncate(recentProfiles[i].account + "/" + recentProfiles[i].profile,25) + "</a></div></li>";}html += '</ul><div class="menudivider"></div>'; return html;}; window.storeHistory = function(account,profile,defaultProfile) {var updatedProfileList = []; var nonFavList = []; var profileMaxLength = 10; var recentProfiles = JSON.parse(localStorage.getItem("recent_history")); if(recentProfiles) {var nonFavListCounter = 0; for(var i = 1; i < recentProfiles.length; i++) {if(!recentProfiles[i].favorite && !(recentProfiles[i].account === account && recentProfiles[i].profile === profile)) {nonFavList.push(recentProfiles[i]);}}if(defaultProfile) {recentProfiles[0].account = account; recentProfiles[0].profile = profile; recentProfiles[0].favorite = true; $('.quickSwitch:contains("0: ")').text("0: " + account + "/" + profile); $('.quickSwitch:contains("0: ")').attr("data-account",account); $('.quickSwitch:contains("0: ")').attr("data-profile",profile); updatedProfileList = recentProfiles;}else{if(recentProfiles[0].account === account && recentProfiles[0].profile === profile) {return true;}updatedProfileList.push(recentProfiles[0]); var accountProfileExists = 0; for(var i = 1; i < recentProfiles.length; i++) {if(recentProfiles[i].account === account && recentProfiles[i].profile === profile) {accountProfileExists = i; if(recentProfiles[i].favorite) {return true;}nonFavList.unshift(recentProfiles[i]); break;}}if(accountProfileExists) {for(var i = 1; i < recentProfiles.length; i++) {if(accountProfileExists !== i) {if(!recentProfiles[i].favorite) {updatedProfileList.push(nonFavList[nonFavListCounter]); nonFavListCounter++;}else{updatedProfileList.push(recentProfiles[i]);}}else{updatedProfileList.push(nonFavList[nonFavListCounter]); nonFavListCounter++;}}}else{var obj = {}; obj.account = account; obj.profile = profile; obj["default"] = false; obj.favorite = false; nonFavList.unshift(obj); var profileLength = recentProfiles.length > profileMaxLength ? profileMaxLength : recentProfiles.length; for(var i = 1; i < profileLength; i++) {if(!recentProfiles[i].favorite) {updatedProfileList.push(nonFavList[nonFavListCounter]); nonFavListCounter++;}else{updatedProfileList.push(recentProfiles[i]);}}if(typeof nonFavList[nonFavListCounter] !== "undefined" && updatedProfileList.length < profileMaxLength) {updatedProfileList.push(nonFavList[nonFavListCounter]);}}}}else{var obj = {}; obj.account = "services-" + $(".admin-menu-name").text().split(" ")[0].toLowerCase(); obj.profile = "main"; obj["default"] = true; obj.favorite = true; updatedProfileList.push(obj);}localStorage.setItem("recent_history",JSON.stringify(updatedProfileList)); return true;}; window.updateHistory = function() {var updatedProfileList = []; $("#quickSwitchSort .menulistitem").each(function(i) {var obj = {}; obj.favorite = $(this).find("i").hasClass("icon-star"); var updatedText = $(this).find(".quickSwitch").text().replace(/\d+: /,i + ": "); $(this).find(".quickSwitch").text(updatedText); obj.account = $(this).find(".quickSwitch").data("account"); obj.profile = $(this).find(".quickSwitch").data("profile"); if(i) {obj["default"] = false;}else{obj["default"] = true; obj.favorite = true;}updatedProfileList.push(obj);}); localStorage.setItem("recent_history",JSON.stringify(updatedProfileList));}; window.performSwitch = function(context,account,profile) {if(context) {account = $(context).attr("data-account"); profile = $(context).attr("data-profile");}utui.profile.getRevision({account,profile,revision: "latestversion"},function() {afterSwitch("",account,profile);});}; window.afterSwitch = function(data,account,profile) {storeHistory(account,profile); $("#recentprofilesQuickSwitch").html(buildRecentHistory()); $("#acct_refresh").click(function() {updateAccountList();}); $(".quickSwitch").click(function() {performSwitch(this);}); $("#quickSwitchSort").sortable({items: "li:not(:first)",update: function() {updateHistory();}}); getAccountProfiles(account); $("#global_status_close_icon").click();}; window.getAccountProfiles = function(account) {if($('#profile_account option[value="' + account + '"]').length) {console.log("Going to get profiles for account: " + account); utui.profile.getProfiles(null,{account},function(data) {if(data.profiles) {var profiles = data.profiles.sort(); $("#select_profile").autocomplete({source: profiles,delay: 0,minLength: 0}); $("#select_profile").val(profiles[0] || "");}else{console.log("No profiles returned in object");}},null,1);}else{console.log(account + " isn't available for your account.  A search for profiles won't be done");}}; window.updateAccountList = function() {$("#acct_refresh").animate({"opacity": "0.3"},500); utui.service.get(utui.service.restapis.GET_ACCOUNTS,{},null,function(data) {$("#acct_refresh").animate({"opacity": "1"},200); if(data) {var accounts = data.accounts; utui.login.accounts = accounts.sort(); var sorted_accounts = utui.login.accounts.sort(utui.util.caseInsensitiveSort); $("#select_account").autocomplete({source: sorted_accounts,delay: 0,minLength: 0,select: function(event,ui) {getAccountProfiles(ui.item.label);}}); $profileSelect = $("#profile_account"); for(var i = 0; i < sorted_accounts.length; i++) {var account = sorted_accounts[i]; $profileSelect.append($("<option></option>").attr("value",account).text(account));}}});}; window.setupQuickSwitchV2 = function() {$("#recentprofiles").hide(); if(!$("#recentprofilesQuickSwitch").length) {$('<div id="recentprofilesQuickSwitch">' + buildRecentHistory() + "</div>").insertAfter("#recentprofiles"); $("#acct_refresh").click(function() {updateAccountList();}); $(".quickSwitch").click(function() {performSwitch(this);}); $("#quickSwitchSort").sortable({items: "li:not(:first)",update: function() {updateHistory();}}); $('button:contains("Load Version")').hide(); $('<div class="config"><button id="quickSwitchLoadVersion" class="btn">Load Version</button></div>').insertBefore("#loadversion_button").click(function() {var account = $("#select_account").val(); var profile = $("#select_profile").val(); performSwitch(null,account,profile);}); $('<li class="menu-li"><a id="quickSwitchDefaultProfile" href="#">Set Quick Switch Default Profile</a></li>').insertAfter($("#editUser_menuBtn").parent()); $("#quickSwitchDefaultProfile").click(function() {$("#adminMenu_listing").hide(); var account = utui.data.settings.account; var profile = utui.data.settings.profileid; storeHistory(account,profile,true);}); Mousetrap.bindGlobal(["0","1","2","3","4","5","6","7","8","9"],function(e,key) {if($("#recentprofilesQuickSwitch").is(":visible")) {setTimeout(function() {if(key == $("#select_account").val()) {$('#recentprofilesQuickSwitch a:contains("' + key + ': ")').click();}},300);}}); $("#profile_menu_button").click(function() {when(function() {return $("#lastaccount").is(":visible");},function() {var current_account = $("#profile_legend_account").text(); var current_profile = $("#profile_legend_profile").text(); var accounts = []; $("#profile_account option").each(function() {accounts.push($(this).text());}); if(!$("#select_account").length) {$('<input id="select_account" class="ui-widget ui-widget-content ui-corner-left" value="' + current_account + '"/>').insertAfter("#profile_account-autocomplete").change(function() {if($(this).val().length > 1) {getAccountProfiles($(this).val());}}); $('<button type="button" tabindex="-1" title="Show All Accounts" class="ui-button ui-widget ui-state-default ui-button-icon-only ui-corner-right ui-button-icon"><span class="ui-button-icon-primary ui-icon ui-icon-triangle-1-s"></span><span class="ui-button-text">&nbsp;</span></button>').insertAfter("#select_account").click(function() {$("#select_account").focus().autocomplete("search","");}); $("#select_account").autocomplete({source: accounts,delay: 0,minLength: 0,select: function(event,ui) {getAccountProfiles(ui.item.label);}});}else{$("#select_account").val(current_account);}var profiles = []; $("#profile_profileid option").each(function() {profiles.push($(this).text());}); if(!$("#select_profile").length) {$('<input id="select_profile" class="ui-widget ui-widget-content ui-corner-left" value="' + current_profile + '"/>').insertAfter("#profile_profileid-autocomplete"); $('<button type="button" tabindex="-1" title="Show All Profiles" class="ui-button ui-widget ui-state-default ui-button-icon-only ui-corner-right ui-button-icon"><span class="ui-button-icon-primary ui-icon ui-icon-triangle-1-s"></span><span class="ui-button-text">&nbsp;</span></button>').insertAfter("#select_profile").click(function() {$("#select_profile").focus().autocomplete("search","");}); $("#select_profile").autocomplete({source: profiles,delay: 0,minLength: 0});}else{$("#select_profile").val(current_profile);}$("#select_account").focus(); $("#select_account")[0].setSelectionRange(0,$("#select_account").val().length); $("#select_account").attr("tabindex",1); $("#select_profile").attr("tabindex",2); $("#quickSwitchLoadVersion").attr("tabindex",3); $("#select_account,#select_profile").on("focus",function() {$(this)[0].setSelectionRange(0,$(this).val().length);}); $(".quickSwitchFavIcon").click(function() {if($(this).hasClass("icon-star")) {$(this).removeClass("icon-star"); $(this).addClass("icon-star-empty");}else if($(this).hasClass("icon-star-empty")) {$(this).addClass("icon-star"); $(this).removeClass("icon-star-empty");}updateHistory();});},100);}); Mousetrap.bindGlobal("ctrl+z",function(e,key) {console.log("User is requesting profile selection window"); $("#profile_menu_button").click();});}}; console.log("Quick Switch v2 Loaded");}catch(e) {console.log("Quick Switch Failed: " + e);}}
/************** Add Quick Switch v2 End ***************************/
/************** Add Show Labels Start ***************************/
if(features.showLabels.enabled) {try{console.log("Add Show Labels Loading"); function showLabels() {jQuery(".columnToggle").not(".selected").click(); jQuery(".container_label.collapsed").removeClass("collapsed").addClass("expanded");}console.log("Add Show Labels Loaded");}catch(e) {console.log("Add Show Labels Failed: " + e);}}
/************** Add Show Labels End ***************************/
/************** Local Timestamp Start ***************************/
if(features.localTimestamp.enabled) {try{console.log("Local Timestamp Loading"); var selectors = {versions: [".hist_verEventDetailsContent",".histEventDate:first"],summary: [".verEnvInfo",".verDate:first"]},processDates = function(elements) {var idx = {gmt: 0,dates: 0},el,cl,local; idx.gmt = elements.length; while(idx.gmt--) {idx.dates = elements[idx.gmt].length; while(idx.dates--) {e = jQuery(elements[idx.gmt][idx.dates]); el = e.first(); cl = el.attr("class"); el.siblings("." + cl).remove(); local = new Date(el.text()).toLocaleString(); jQuery('<div class="' + cl + '">' + local + " (Local)</div>").insertAfter(el).addClass("tmui");}}},processQueue = function(queue) {var $q = [],idx = queue.length; while(idx--) {$q.push(jQuery(queue[idx][0]).find(queue[idx][1]));}processDates($q);}; processQueue([selectors.versions,selectors.summary]); var hist_eventRow = new MutationObserver(function(mutations) {processQueue([selectors.versions]);}); hist_eventRow.observe(document.querySelector(".hist_eventRow"),observerConfig); var dashboard_content = new MutationObserver(function(mutations) {processQueue([selectors.summary]);}); dashboard_content.observe(document.querySelector("#dashboard_content"),observerConfig); console.log("Local Timestamp Loaded");}catch(e) {console.log("Local Timestamp Failed: " + e);}}
/************** Local Timestamp End ***************************/
/************** Extension Search Start ***************************/
if(features.extensionSearch.enabled) {try{console.log("Extension Search Loading"); localStorage.setItem("extensionSearchQuery",""); function searchExtensions(string) {localStorage.setItem("extensionSearchQuery",string); var re = new RegExp(".*" + string + ".*","igm"); var data = utui.data.customizations; var extensions = {}; if(string !== "") {Object.keys(data).forEach(function(id) {var extension = data[id]; Object.keys(extension).forEach(function(key) {var extData = extension[key]; if(key != "labels" && key != "scope" && key != "scopevars" && key != "sort" && key != "status" && key != "type" && key != "_ignoreError" && !key.match(/_setoption/) && key != "settings") {if(typeof extData === "string" && re.test(extData)) {extensions[extension.sort] = 1;}}});});}$("#customize_content .customize_container").each(function(i) {if(extensions[i] == 1) {$(this).find("h3").css("background-color","yellow");}else{$(this).find("h3").css("background-color","");}});}function setupExtensionSearch() {if(!$("#extension_search").length) {var searchTerm = localStorage.getItem("extensionSearchQuery") || ""; $('<div class="inputSearchContainer tmui"><input class="search" id="extension_search" value="' + searchTerm + '" type="text"></div>').css("float","right").appendTo("#tabs-customizations .config_button_nofloat"); var keysPressed = 0; $("#extension_search").bind("keydown",function() {var grabKeyCount = ++keysPressed; setTimeout(function() {if(keysPressed == grabKeyCount) {searchExtensions($("#extension_search").val());}},250);}); searchExtensions($("#extension_search").val());}}when(function() {return utui.permissions && utui.users && Object.keys(utui.permissions.getUserPermissions()).length > 0;},function() {var extensionTopObserver = new MutationObserver(function(mutations) {setupExtensionSearch();}); try{extensionTopObserver.observe(document.querySelector("#customize_content"),observerConfig);}catch(e) {console.log(e);}}); console.log("Extension Search Loaded");}catch(e) {console.log("Extension Search Failed: " + e);}}
/************** Extension Search End ***************************/
/************** Add Extension Shortcuts Start ***************************/
if(features.extensionShortcuts.enabled) {try{console.log("Extension Shortcuts Loading"); var debugCode = "try{\n    /*Set the debug flag if that is in the query string*/\n    if(utag.data['qp.utagdb']){\n        if(utag.data['qp.utagdb'].match(/1|true/i)){\n            document.cookie='utagdb=true';\n            utag.data['cp.utagdb']='true';\n            utag.cfg.utagdb=true;\n        }else{\n            document.cookie='utagdb=false';\n            utag.data['cp.utagdb']='false';\n            utag.cfg.utagdb=false;\n        }\n    }\n    /*If environment isn't prod, enable the debug flag unless it was already set to false*/\n    if(utag.cfg.path.indexOf('/prod/')===-1&&(typeof utag.data['cp.utagdb']==='undefined'||utag.data['cp.utagdb']==='true')){\n        document.cookie='utagdb=true';\n        utag.cfg.utagdb=true;\n    }\n}catch(e){\n    utag.DB('Tealium Debugging Tools Failed: '+e);\n}"; var debugNotes = "To set debug in the browser console, add utagdb=1 to the url.\nhttp://www.domain.com/home.html?utagdb=1\nTo turn off the debug to the console, change 1 to 0\nhttp://www.domain.com/home.html?utagdb=0\nDebug is automatically enabled for environments that aren't prod"; var debugTitle = "Tealium Debugging Tools"; function findExtensionByTitle(title) {var data = utui.data.customizations; var matchFound = 0; if(title !== "") {Object.keys(data).forEach(function(id) {if(data[id].title == title) {matchFound = id;}});}return matchFound;}function addDebugExtension() {var extensionID = findExtensionByTitle("Tealium Debugging Tools"); if(!extensionID) {var ext = {"code": debugCode,"id": "100011","notes": debugNotes,"scope": "global","scopevars": "","sort": 0,"status": "active","title": debugTitle,"type": "new"}; exapi.getNextIdFromServer(1,null,function(providedLastId,count,extId) {exapi.addExtension(extId,ext.id,ext); utui.customizations.addItem(extId); moveDebugExtensionToTop();},function(extId) {exapi.addExtension(extId,ext.id,ext); utui.customizations.addItem(extId); moveDebugExtensionToTop();});}else if(utui.data.customizations[extensionID].code != debugCode || utui.data.customizations[extensionID].notes != debugNotes) {console.log(debugTitle + " Extension Already Present, but Not Up To Date"); utui.data.customizations[extensionID].code = debugCode; utui.data.customizations[extensionID].notes = debugNotes; utui.profile.toggleUnsavedChangesBtn();}else{console.log(debugTitle + " Extension Already Present and Up To Date!");}addDebugTag(); $("#customize_addDebugBtn").fadeOut();}function addDebugTag() {var tagID = findTagByTitle("DEBUG: Real-Time Audit"); if(!tagID) {var tag = {"title": "DEBUG: Real-Time Audit","status": "active","tag_id": "20067","config_tagtype": "script","config_baseurl": "https://deploytealium.com/verify/realTime.php","config_staticparams": "account=" + utui.data.settings.account + "&profile=" + utui.data.settings.profileid + "",selectedTargets: {dev: "true",qa: "true",prod: "false"}}; utui.automator.addTag(tag);}else{}}function findTagByTitle(title) {var data = utui.data.manage; var matchFound = 0; if(title !== "") {Object.keys(data).forEach(function(id) {if(data[id].title == title) {matchFound = id;}});}return matchFound;}function moveDebugExtensionToTop() {var extension_rev_order = [{scope: "All Tags",title: debugTitle}]; for(var i = 0; i < extension_rev_order.length; i++) {var name_match = extension_rev_order[i].title; var scope_match = extension_rev_order[i].scope; $('div.container_scope:contains("' + scope_match + '")').closest("#customize_content>div").each(function(a,b) {var titleText = $(b).find(".container_title").text().trim(); if(titleText.indexOf(name_match) >= 0) {$(b).prependTo("#customize_content"); var id = $(b).attr("data-id"); var newSort = $("#customize_content>div").index(b); utui.data.customizations[id].sort = newSort; console.log("Moved: '" + titleText + "'");}});}utui.customizations.drawJUIAccordion();}function moveExtensions(elements) {for(var i = 0; i < elements.length; i++) {$(elements[i]).prependTo("#customize_content");}}function sortExtensions() {var preloader = []; var alltags = []; var vendortags = {}; var domready = []; var debugtag = 0; $("#customize_content>div").each(function() {var scope = $(this).find(".container_scope").text().trim(); if($(this).find(".container_title").text().trim() == debugTitle) {debugtag = 1;}switch(scope) {case"Pre Loader":preloader.push(this); break; case"All Tags":alltags.push(this); break; case"DOM Ready":domready.push(this); break; default:if(typeof vendortags[scope] === "undefined") {vendortags[scope] = [];}vendortags[scope].push(this);}}); moveExtensions(domready.reverse()); Object.keys(vendortags).reverse().forEach(function(key) {moveExtensions(vendortags[key].reverse());}); moveExtensions(alltags.reverse()); moveExtensions(preloader.reverse()); if(debugtag) {$('.container_title:contains("' + debugTitle + '")').closest(".customize_container").prependTo("#customize_content");}$("#customize_content>div").each(function(index) {var id = $(this).attr("data-id"); utui.data.customizations[id].sort = index;}); if(jQuery(".customize_container .ui-state-active").length) {var uid = jQuery(".customize_container .ui-state-active").parent().data("id"); utui.customizations.drawJUIAccordion(uid); if(features.extensionScroll.enabled) {try{setTimeout(function() {var myContainer = $("#customize_content"); var scrollTo = $("#customizations_" + uid); scrollTopInt = scrollTo.offset().top - myContainer.offset().top + myContainer.scrollTop(); myContainer.animate({scrollTop: scrollTopInt,duration: 200});},250);}catch(e) {console.log("Failed to scroll extension into view: " + e);}}}else{utui.customizations.drawJUIAccordion();}utui.profile.toggleUnsavedChangesBtn();}function createExtensionShortcutButtons() {if(!$("#customize_sortBtn").length) {$('<span id="customize_sortBtn" class="btn btn-info tmui"><i class="icon-sort"></i> Sort Extensions</span>').css("float","left").css("margin-left","10px").click(sortExtensions).appendTo("#tabs-customizations .config_button_nofloat");}if(!$("#customize_addDebugBtn").length) {var extensionID = findExtensionByTitle(debugTitle); var classname = "btn tmui"; var buttonText = "Add Debug Extension"; if(extensionID) {if(utui.data.customizations[extensionID].code != debugCode || utui.data.customizations[extensionID].notes != debugNotes) {classname += " btn-danger"; buttonText = "Update Debug Extension";}}$('<span id="customize_addDebugBtn" class="' + classname + '"><i class="icon-wrench"></i> ' + buttonText + "</span>").css("float","left").css("margin-left","10px").click(addDebugExtension).appendTo("#tabs-customizations .config_button_nofloat");}}when(function() {return utui.permissions && utui.users && Object.keys(utui.permissions.getUserPermissions()).length > 0;},function() {var extensionTopObserver2 = new MutationObserver(function(mutations) {createExtensionShortcutButtons();}); try{extensionTopObserver2.observe(document.querySelector("#customize_content"),observerConfig);}catch(e) {console.log(e);}}); console.log("Extension Shortcuts Loaded");}catch(e) {console.log("Extension Shortcuts Failed: " + e);}}
/************** Add Extension Shortcuts End ***************************/
/************** Hide TM Buttons Start ***************************/
try{console.log("Hide TM Buttons Loading"); var hideTMButtons = 0; $('<style id="tmuiStyleSheet"></style>').appendTo("head"); $('<span id="showHideTMButtons" title="Show/Hide TM Buttons">Show/Hide TM Buttons</span>').insertAfter("#logoContainer").css("cursor","pointer").css("left","200px").css("top","15px").css("position","relative").css("color","white").css("font-size","larger").click(function() {hideTMButtons = hideTMButtons ? 0 : 1; if(hideTMButtons == 1) {$("#tmuiStyleSheet").html(".tmui{display:none !important;}"); $(".tmui-color").css("color","#FFFFFF"); $("#globalMessageButton").css("cursor","default").css("color","#FFFFFF").addClass("tmui-color"); unsafeWindow.__getGlobalMessageAllow = "false"; console.log("Tampermonkey Buttons Are Currently Hidden"); if(features.removeAlias.enabled) {restoreAlias();}}else{$("#tmuiStyleSheet").html(".tmui{display:block;}"); $(".tmui-color").css("color","#C71585"); $("#globalMessageButton").css("cursor","pointer").css("color","#C71585").addClass("tmui-color"); unsafeWindow.__getGlobalMessageAllow = "true"; console.log("Tampermonkey Buttons Are Currently Visible"); if(features.removeAlias.enabled) {hideAlias();}}}); console.log("Hide TM Buttons Loaded");}catch(e) {console.log("Hide TM Buttons Failed: " + e);}
/************** Hide TM Buttons End ***************************/
/************** Add Extension Scroll Start ***************************/
if(features.extensionScroll.enabled) {try{console.log("Extension Scroll Loading"); jQuery(document.body).on("mousedown","div[id^=customizations][data-id] h3",function(e) {window.extensionElementID = jQuery(this).parent().attr("data-id"); when(function() {return jQuery("#customizations_" + extensionElementID + "_accordionBody").is(":visible");},function() {var myContainer = $("#customize_content"); var scrollTo = $("#customizations_" + extensionElementID); scrollTopInt = scrollTo.offset().top - myContainer.offset().top + myContainer.scrollTop(); myContainer.animate({scrollTop: scrollTopInt,duration: 50});},100,10);}); console.log("Extension Scroll Loaded");}catch(e) {console.log("Extension Scroll Failed: " + e);}}
/************** Add Extension Scroll End ***************************/
/************** Add Lookup Tables Sort Start ***************************/
if(features.lookupSort.enabled) {try{console.log("Lookup Tables Sort Loading"); utui.customizations_template[100020].addItem_old = utui.customizations_template[100020].addItem; utui.customizations_template[100020].addItem = function(a,b) {var _r = utui.customizations_template[100020].addItem_old(a,b); $("div.customization_div > div.customization_item:last > div").css("cursor","ns-resize"); return _r;}; utui.customizations.drawJUIAccordion_old = utui.customizations.drawJUIAccordion; utui.customizations.drawJUIAccordion = function(extid) {utui.customizations.drawJUIAccordion_old(extid); if(extid && utui.data.customizations[extid].id === "100020") {window._lkup($("#customizations_" + extid));}}; window._lkup = function(sel) {$("div.ui-accordion-content.ui-helper-reset.ui-widget-content.ui-corner-bottom",sel).one("mouseover",function() {var setAttr = function($el,_name) {$el.attr("id",_name); $el.attr("name",_name);}; $("div.customization_div > div.customization_item:last > div",this).css("cursor","ns-resize"); $("div.customization_div > div.customization_item:last",this).sortable({axis: "y",handle: "div",update: function(e,ui) {var extnID = $(this).attr("id").match(/(\d+)_/)[1],extens = utui.data.customizations,_n = "_name",_v = "_value",_c = "_comment",_s = "_setitem"; for(var _prop in utui.util.getVars(extens[extnID])) {if(_prop.match(/\d+_/)) {try{delete extens[extnID][_prop];}catch(e) {}}}$("div.nooverflow",this).each(function() {var id = $(this).attr("id"),id_ts = id.replace(_s,""); var $name = $("#" + id_ts + _n),$val = $("#" + id_ts + _v),$comment = $("#" + id_ts + _c); var newTS = utui.util.getContainerId(); $(this).attr("id",newTS + _s); setAttr($name,newTS + _n); setAttr($val,newTS + _v); setAttr($comment,newTS + _c); $("button.btn.btn-mini:first",this).attr("onclick","if($('#" + newTS + _s + "').siblings().length>=1){utui.customizations_template[100020].removeItem('" + newTS + _s + "')};"); extens[extnID][newTS + _c] = $comment.val(); extens[extnID][newTS + _n] = $name.val(); extens[extnID][newTS + _v] = $val.val();}); var obj = extens[extnID],con = utui.constants.extensions; utui.profile.setActionPerformed({action: con.UPDATED,data: {id: obj._id,name: obj.title,type: obj.id,kind: con.TYPE,operation: utui.constants.operation.UPDATED,container: "customizations_" + obj._id}},true);}});});}; $(document.body).on("mousedown",'div.customize_container[data-template-id="100020"] > h3',function() {window._lkup($(this).parent());}); console.log("Lookup Tables Sort Loaded");}catch(e) {console.log("Lookup Tables Sort Failed: " + e);}}
/************** Add Lookup Tables Sort End ***************************/
/************** Remove Alias Start ***************************/
if(features.removeAlias.enabled) {try{console.log("Hide Alias Loading"); function hideAlias() {Object.keys(utui.data.define).forEach(function(uid) {if(typeof utui.data.define[uid].title === "undefined") {return;}if(typeof utui.data.define[uid]._title === "undefined") {utui.data.define[uid]._title = utui.data.define[uid].title; utui.data.define[uid].title = "";}});}function restoreAlias() {Object.keys(utui.data.define).forEach(function(uid) {if(typeof utui.data.define[uid]._title !== "undefined") {utui.data.define[uid].title = utui.data.define[uid]._title; delete utui.data.define[uid]._title;}});}$("#global_save").click(function() {restoreAlias(); setTimeout(function() {when(function() {return!$(".savePublishDialog:visible").length;},function() {setTimeout(function() {hideAlias();},750);});},1e3);}); console.log("Hide Alias Loaded");}catch(e) {console.log("Hide Alias Failed: " + e);}}
/************** Remove Alias End ***************************/
/************** Setup Listener for Tab Click Event Start **********************/
try{console.log("Listener for Tab Click Event Loading"); utui.util.pubsub.subscribe(utui.constants.views.TAB_CLICK,function(e) {switch(e.page) {case"Dashboard":when(function() {return $("#tabs_content .ui-state-active #tabs_dashboard").length;},function() {}); break; case"Data Sources":when(function() {return $("#tabs_content .ui-state-active #tabs_define").length;},function() {}); break; case"Loadrules":when(function() {return $("#tabs_content .ui-state-active #tabs_loadrules").length;},function() {if(features.showLabels.enabled) {showLabels();}if(features.sendToTopBottom.enabled) {sendToTopBottomListener();}}); break; case"Tags":when(function() {return $("#tabs_content .ui-state-active #tabs_manage").length;},function() {if(features.showLabels.enabled) {showLabels();}if(features.tagWizardShortcuts.enabled) {addEditTemplatesToManageScreen();}if(features.sendToTopBottom.enabled) {sendToTopBottomListener();}if(features.enlargeIds.enabled) {enlargeIds();}}); break; case"Extensions":when(function() {return $("#tabs_content .ui-state-active #tabs_customizations").length;},function() {if(features.showLabels.enabled) {showLabels();}if(features.sendToTopBottom.enabled) {sendToTopBottomListener();}}); break; case"Versions":when(function() {return $("#tabs_content .ui-state-active #tabs_publish").length;},function() {}); break; case"Scenarios":when(function() {return $("#tabs_content .ui-state-active #tabs_scenarios").length;},function() {}); break;}}); console.log("Listener for Tab Click Load Event Loaded");}catch(e) {console.log("Listener for Tab Click Load Event Failed: " + e);}
/************** Setup Listener for Tab Click Event End ************************/
/************** Send to Top/Bottom Start ***************************/
if(features.sendToTopBottom.enabled) {try{console.log("Send to Top/Bottom Loading"); var sendToTopBottomListener = function() {$(".label_select_checkbox").off("click"); $(".label_select_checkbox").on("click",function() {var tab = $(this).closest('div[id^="tabs-"]').attr("id"); if($("#" + tab).find(".label_select_checkbox:checked").length) {if(!$("#" + tab + " #sendToTop").length) {$('<div class="tab-menu-item"><button id="sendToTop" class="btn btn-success" style="margin-top:0;"><i class="icon-arrow-up"></i> Send to Top</button></div>').prependTo("#" + tab + ' div[id$="_headerControls"]'); $('<div class="tab-menu-item"><button id="sendToBottom" class="btn btn-success" style="margin-top:0;"><i class="icon-arrow-down"></i> Send to Bottom</button></div>').prependTo("#" + tab + ' div[id$="_headerControls"]'); $("#" + tab + " #sendToTop").click(function() {sendToTop(tab);}); $("#" + tab + " #sendToBottom").click(function() {sendToBottom(tab);});}}else{$("#" + tab + " #sendToTop,#" + tab + " #sendToBottom").parent().remove();}});}; var sendToBottom = function(tab) {var elements = getCheckedElements(tab); for(var i = 0; i < elements.length; i++) {$(elements[i]).appendTo("#" + tab + ' div[id$="_content"]');}redrawUI(tab);}; var sendToTop = function(tab) {var elements = []; getCheckedElements(tab).each(function() {elements.push(this);}); elements = elements.reverse(); for(var i = 0; i < elements.length; i++) {$(elements[i]).prependTo("#" + tab + ' div[id$="_content"]');}if(tab === "tabs-loadrules") {$('div[data-id="all"]').prependTo("#" + tab + ' div[id$="_content"]');}redrawUI(tab);}; var getCheckedElements = function(tab) {if(tab === "tabs-customizations") {return $("#" + tab).find(".label_select_checkbox:checked").closest(".customize_container");}else{return $("#" + tab).find(".label_select_checkbox:checked").closest('div[id*="_content_"]');}}; var redrawUI = function(tab) {switch(tab) {case"tabs-loadrules":utui.loadrules.view.updateAccordion(); break; case"tabs-manage":utui.manage.updateAccordion(); break; case"tabs-customizations":utui.customizations.drawJUIAccordion(); break; default:}utui.profile.toggleUnsavedChangesBtn();}; console.log("Send to Top/Bottom Loaded");}catch(e) {console.log("Send to Top/Bottom Failed: " + e);}}
/************** Send to Top/Bottom End ***************************/
/************** Global Message Start ***************************/
if(features.globalMessage.enabled) {try{console.log("Global Message Loading"); unsafeWindow.__getGlobalMessageAllow = "true"; var showGlobalMessagePopup = function(message_obj,showAll) {if(typeof message_obj.account_message === "undefined") {message_obj.account_message = "";}if(typeof message_obj.profile_message === "undefined") {message_obj.profile_message = "";}if(typeof showAll === "undefined") {showAll = false;}if(message_obj.account_message === "" && message_obj.profile_message === "") {}$("#account_message_popup").remove(); var html = '<button id="global_popup_update_btn" type="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only">'; html += '<span class="ui-button-text">Update</span>'; html += "</button>"; var update = $(html); update.css("cursor","pointer").css("float","right").css("margin-right","10px").css("display","none").click(function() {setGlobalMessage();}); var html = '<button id="global_popup_close_btn" type="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only">'; html += '<span class="ui-button-text">Close</span>'; html += "</button>"; var close = $(html); close.css("cursor","pointer").css("float","right").css("margin-right","10px").click(function() {$("#account_message_popup").remove();}); var html = '<div id="account_message_popup">'; var width = 800; var left_px = Math.round(($(window).width() - width) / 2) + "px"; html += '<span id="close_upper_right">&nbsp;X&nbsp;</span>'; html += '<br><br><span id="important_popup_label">This is the Account Note and, cannot be edited from TiQ <a href="https://deploytealium.com/message/" target="_blank" style="text-decoration:none;">*</a></span>'; html += '<textarea disabled id="important_popup_text" rows="10" cols="80" /><br>'; html += '<span id="important_popup_last"></span>'; html += "<br><br>"; html += '<span id="global_popup_label">These shared Profile Notes can be edited by all Team Members, start typing to edit.</span>'; html += '<textarea id="global_popup_text" rows="13" cols="80" />'; html += '<span id="global_popup_last"></span>'; html += "<br><br>"; html += "</div>"; global_help = $(html); global_help.css("position","absolute").css("z-index","10000").css("background-color","white").css("border-style","solid").css("border-width","3px").css("left",left_px).css("top","100px").css("border-color","#057ABD").css("border-radius","10px").width(width).height(560).append(close).append(update).appendTo(document.body); $("#global_popup_label").css("margin-left","4%").css("font-size","small").css("color","#888888"); $("#important_popup_label").css("margin-left","4%").css("font-size","small").css("color","#888888").css("margin-top","2a%"); $("#global_popup_text").css("width","90%").css("margin-left","4%").css("font-size","medium").css("margin-bottom","0px").val(message_obj.profile_message); $("#important_popup_text").css("width","90%").css("margin-left","4%").css("font-size","medium").css("color","mediumvioletred").css("font-weight","bold").css("margin-bottom","0px").val(message_obj.account_message); $("#close_upper_right").css("cursor","pointer").css("position","absolute").css("top","0").css("right","0").css("background-color","#057ABD").css("color","white").css("font-size","medium").css("border-bottom-left-radius","4px").click(function() {$("#account_message_popup").remove();}); $("#important_popup_last").css("margin-left","4%").css("font-size","x-small").css("color","#888888").css("border-top","0px").css("border","none"); if(message_obj.account_date_modified == "") {$("#important_popup_last").text("");}else{$("#important_popup_last").text("Account Message Last Updated on " + message_obj.account_date_modified + " by " + message_obj.account_last_email);}$("#global_popup_last").css("margin-left","4%").css("font-size","x-small").css("color","#888888").css("border-top","0px").css("border","none"); if(message_obj.profile_date_modified == "") {$("#global_popup_last").text("");}else{$("#global_popup_last").text("Profile Message Last Updated on " + message_obj.profile_date_modified + " by " + message_obj.profile_last_email);}$("#global_popup_text").keyup(function(e) {$("#global_popup_update_btn").show();}); $("#global_popup_close_btn").focus();}; var getGlobalMessage = function(showAll) {if(unsafeWindow.__getGlobalMessageAllow === "false") {return false;}if(typeof showAll === "undefined") {showAll = false;}var account_name = unsafeWindow.utui.login.account; var profile_name = unsafeWindow.utui.login.profile; var user_email = unsafeWindow.utui.login.email; var publishHistory = Object.keys(unsafeWindow.utui.data.publish_history).sort().reverse(); var emails = []; for(var i = 0; i < publishHistory.length; i++) {var email = unsafeWindow.utui.data.publish_history[publishHistory[i]][unsafeWindow.utui.data.publish_history[publishHistory[i]].publishState["saved"]].operator; if(emails.indexOf(email) === -1) {emails.push(email);}}jQuery.ajax({async: true,url: "https://deploytealium.com/message/globalMessage.php",type: "POST",data: JSON.stringify({"debug": "true","action": "get_global_message","account_name": account_name,"profile_name": profile_name,"email": user_email,"emails": JSON.stringify(emails)}),success: function(response) {if(response.success) {var account_message = ""; var profile_message = ""; if(response.account_message && response.account_message !== "") {account_message = response.account_message;}if(response.profile_message && response.profile_message !== "") {profile_message = response.profile_message;}if(account_message !== "" || profile_message !== "" || showAll) {showGlobalMessagePopup(response,showAll); if(!showAll) {$("#globalMessageButton").css("cursor","pointer").css("color","#C71585").addClass("tmui-color").removeClass("hidden"); unsafeWindow.__getGlobalMessageAllow = "true";}}else{$("#globalMessageButton").css("cursor","default").css("color","#FFFFFF").removeClass("tmui-color").addClass("hidden"); unsafeWindow.__getGlobalMessageAllow = "false";}}else{$("#globalMessageButton").css("cursor","default").css("color","#FFFFFF").removeClass("tmui-color").addClass("hidden"); unsafeWindow.__getGlobalMessageAllow = "false";}}});}; var setGlobalMessage = function() {$("#global_popup_update_btn").hide(); var profile_message = $("#global_popup_text").val(); var account_name = unsafeWindow.utui.login.account; var profile_name = unsafeWindow.utui.login.profile; var user_email = unsafeWindow.utui.login.email; jQuery.ajax({async: true,url: "https://deploytealium.com/message/globalMessage.php",type: "POST",data: JSON.stringify({"action": "set_global_message","account_name": account_name,"profile_name": profile_name,"profile_message": profile_message,"email": user_email}),success: function(response) {if(response.success) {var tmp_text = $("#account_message_popup .global_help_text").text(); $("#account_message_popup .global_help_text").text("Yay, you successfully updated the global message!").css("color","green"); setTimeout(function() {$("#account_message_popup .global_help_text").text(tmp_text).css("color","black");},3e3); $("#global_popup_update_btn").hide();}}});}; $('<span id="globalMessageButton" title="Show Global Message">{ ! }</span>').insertBefore("#showHideTMButtons").css("cursor","pointer").css("left","190px").css("top","15px").css("position","relative").css("color","#FFFFFF").css("font-weight","bold").css("font-size","larger").css("width","25px").click(function() {unsafeWindow.__getGlobalMessageAllow = "true"; getGlobalMessage();}); console.log("Global Message Loaded");}catch(e) {console.log("Global Message Failed: " + e);}}
/************** Global Message End ***************************/
/************** AutoSave Start ***************************/
if(true) {console.log("AutoSave currently turned off. Removing old items"); for(var a in utui.util.getVars(localStorage)) {if(/^autoSave_.*/.test(a)) {localStorage.removeItem(a);}}}else{try{console.log("Auto Save Loading"); (function() {var timeout = localStorage.getItem("autoSave_time") || 6e4; var profile_loaded = function() {if(localStorage.getItem(getLSName())) {var v = ""; v += '<span id="global_status_close_icon" class="global_status_message_close"></span>'; v += '<span class="global_status_message_text">Auto Save detected. Would you like to merge?<br><div style="width: 50%;margin: 0 auto;"><a id="autosave_merge" style="text-decoration: underline;">Merge</a><a id="autosave_discard" style="float: right;text-decoration: underline;">Discard</a></div></span>'; $("#global_status_message").html(v); $("#global_status_message_parent_div").show(); $("#global_status_close_icon").click(function() {$("#global_status_message_parent_div").hide();}); $("#autosave_merge").click(run_merge); $("#autosave_discard").click(function() {$("#global_status_message_parent_div").hide(); localStorage.removeItem(getLSName());}); $("#global_status_message").css("cursor","pointer");}}; var auto_save = function() {if(utui.historyManager.getNetChanges().length === 0) {return;}var toSave = $.extend(true,{},utui.data); try{localStorage.setItem(getLSName(),JSON.stringify(toSave));}catch(e) {console.log("failed to set LS");}}; utui.util.pubsub.subscribe(utui.constants.profile.LOADED,profile_loaded,this); utui.util.pubsub.subscribe(utui.constants.profile.LIBRARY_IMPORT_FINISHED,profile_loaded,this); utui.util.pubsub.subscribe(utui.constants.profile.CHANGED,auto_save,this); var clearLS = function() {localStorage.removeItem(getLSName());}; utui.util.pubsub.subscribe(utui.constants.profile.PUBLISHED,clearLS,this); utui.util.pubsub.subscribe(utui.constants.profile.SAVED,clearLS,this); utui.util.pubsub.subscribe(utui.constants.profile.SAVED_AS,clearLS,this); var getLSName = function() {return"autoSave_" + utui.login.account + "_" + utui.login.profile;}; setInterval(function() {if(!utui.profile.dirty) {return;}auto_save();},timeout); function run_merge() {$("#global_status_message_container").css("cursor",""); $("#global_status_message_parent_div").hide(); var _merge = utui.diff.merge; var toSave = JSON.parse(localStorage.getItem(getLSName())); localStorage.removeItem(getLSName()); _merge.setLabelsData(utui.data.settings.revision,utui.data.labels); if(toSave.labels && !utag.ut.isEmptyObject(toSave.labels)) {_merge.setLabelsData(toSave.revision,toSave.labels);}else{_merge.setLabelsData(toSave.revision,{});}utui["incoming_data"] = $.extend(true,{},toSave); var profileKey = utui.data.settings.account + "_" + utui.data.settings.profileid; diffapi.setStash(profileKey,"current",diffapi.runUtuiAnalysis("original_data","data")); diffapi.setStash(profileKey,"source",diffapi.runUtuiAnalysis("original_data","incoming_data")); _merge.onSave();}profile_loaded();})(); console.log("Auto Save Loaded");}catch(e) {console.warn("AutoSave Failed: ",e);}}
/************** AutoSave End ***************************/
/************** New Tag Disable Publish To Prod Start ***************************/
if(features.newTagDisableProd.enabled) {try{console.log("New Tag Disable Publish To Prod Loading"); var newTagDisableProdListener = function() {utui.util.pubsub.subscribe(utui.constants.tags.ADDED,function(e) {when(function() {return jQuery("#manage_config_locations_prod2").length > 0;},function() {if(jQuery("#manage_config_locations_prod2").is(":visible")) {jQuery("#manage_config_locations_prod2").click();}});});}; console.log("New Tag Disable Publish To Prod Loaded");}catch(e) {console.log("New Tag Disable Publish To Prod Failed: " + e);}}
/************** New Tag Disable Publish To Prod End ***************************/
/************** Extension Search Start ***************************/
if(features.tagSearch.enabled) {try{console.log("Tag Search Loading"); localStorage.setItem("tagSearchQuery",""); function searchTags(string) {localStorage.setItem("tagSearchQuery",string); var re = new RegExp(string,"i"); var data = utui.data.manage; var tags = {}; if(string !== "") {Object.keys(data).forEach(function(id) {var tag = data[id]; Object.keys(tag).forEach(function(key) {var tagData = tag[key]; if(key != "_id" && key != "id" && key != "labels" && key != "scope" && key != "hash" && key != "sort" && key != "status" && key != "new_flag" && key != "loadrule" && key != "publish_revisions" && key != "publishedTargets" && key != "selectedTargets" && key != "tag_id" && key != "map" && key != "beforeonload") {if(typeof tagData === "string" && tagData.match(re)) {tags[tag.sort] = 1;}}else if(key === "map") {Object.keys(tagData).forEach(function(mapping) {var tagDataMap = tagData[mapping]; Object.keys(tagDataMap).forEach(function(map_key) {if(map_key != "dsID" && map_key != "type") {if(typeof tagDataMap[map_key] === "string" && tagDataMap[map_key].match(re)) {tags[tag.sort] = 1;}}});});}});});}$("#manage_content .manage_container").each(function(i) {if(tags[i] == 1) {$(this).find("h3").css("background-color","yellow"); $(this).find("h3").css("background-image","none");}else{$(this).find("h3").css("background-color",""); $(this).find("h3").css("background-image","");}});}function setupTagSearch() {var searchTerm = localStorage.getItem("tagSearchQuery") || ""; if(!$("#tag_search").length) {$('<div class="inputSearchContainer tmui"><input class="search" id="tag_search" value="' + searchTerm + '" type="text"></div>').css("float","right").appendTo("#tabs-manage .config_button_nofloat"); var keysPressed = 0; $("#tag_search").bind("keydown",function() {var grabKeyCount = ++keysPressed; setTimeout(function() {if(keysPressed == grabKeyCount) {searchTags($("#tag_search").val());}},250);});}else{$("#tag_search").val(searchTerm);}searchTags($("#tag_search").val());}console.log("Tag Search Loaded");}catch(e) {console.log("Tag Search Failed: " + e);}}
/************** Tag Search End ***************************/
/************** Ecomm Button Start ***************************/
if(features.ecommExtension.enabled) {try{console.log("Ecomm Ext Loading"); var ecommMap = {corder: "order_id",ctotal: "order_total",csubtotal: "order_subtotal",cship: "order_shipping_amount",ctax: "order_tax_amount",cstore: "order_store",ccurrency: "order_currency_code",cpromo: "order_promo_code",ctype: "order_type",ccustid: "customer_id",ccity: "customer_city",cstate: "customer_state",czip: "customer_postal_code",ccountry: "customer_country",cprod: "product_id",cprodname: "product_name",csku: "product_sku",cbrand: "product_brand",ccat: "product_category",ccat2: "product_subcategory",cquan: "product_quantity",cprice: "product_price",cpdisc: "product_discount_amount"}; function ecommExtensionExists() {var data = utui.data.customizations; var exists = false; Object.keys(data).forEach(function(id) {if(data[id].id == "100005") {exists = true;}}); return exists;}function configureEcommExtension(extId) {var ext = {title: "E-Commerce"}; exapi.addExtension(extId,"100005",ext); utui.customizations.addItem(extId); utui.customizations.drawJUIAccordion(extId); utui.labels.helper.renderLabels(extId,utui.customizations.id); $("#customize_content").animate({scrollTop: $("#customizations_" + extId).offset().top - $("#customize_content").offset().top + $("#customize_content").scrollTop()},"slow"); for(var k in ecommMap) {var opt = $("#" + k + " option[value='js." + ecommMap[k] + "']"); if(opt.length > 0) {opt.attr("selected","selected"); $("#s2id_" + k + " > a").removeClass("select2-default"); $("#s2id_" + k + " span.select2-chosen").text(opt.text());}}}function addEcommExtension() {if(!ecommExtensionExists()) {exapi.getNextIdFromServer(1,null,function(providedLastId,count,extId) {configureEcommExtension(extId); $("#customize_addEcommBtn").remove();},function(extId) {configureEcommExtension(extId); $("#customize_addEcommBtn").remove();});}}function createEcommExtensionButton() {if(!$("#customize_addEcommBtn").length) {if(!ecommExtensionExists()) {$('<span id="customize_addEcommBtn" class="btn tmui"><i class="icon-wrench"></i> Add E-Commerce Extension</span>').css("float","left").css("margin-left","10px").click(addEcommExtension).appendTo("#tabs-customizations .config_button_nofloat");}}}console.log("Ecomm Ext Loaded");}catch(e) {console.log("Ecomm Ext Failed: " + e);}}
/************** Ecomm Button End ***************************/
/************** Sitecat Mapping start ***************************/
if(features.sitecatMappingSort.enabled) {try{console.log("Sitecat Sort Loading"); function moveSitecatMappings(unordered,type) {var ordered = []; var keys = []; keys = Object.keys(unordered); keys.sort(alphaNumSort).reverse(); keys.forEach(function(key) {ordered.push(unordered[key]);}); for(var i = 0; i < ordered.length; i++) {$(ordered[i]).prependTo("#wizard_variables_wrapper ul.variable_map_container");}}function prepareSitecatMappings() {var props = {}; var evars = {}; var events = {}; var prods = {}; var others = {}; $("li.managemap_div").each(function() {var type = $(this).find(".js-variable-input").attr("value").split(",")[0]; if(type.indexOf("prop") > -1) {props[type] = this;}else if(type.indexOf("PRODUCTS_") > -1) {prods[type] = this;}else if(type.indexOf("eVar") > -1) {evars[type] = this;}else if(type.indexOf(":") > -1) {events[type] = this;}else{others[type] = this;}}); events = moveSitecatMappings(events,"events"); prods = moveSitecatMappings(prods,"prods"); evars = moveSitecatMappings(evars,"evars"); props = moveSitecatMappings(props,"props"); others = moveSitecatMappings(others,"others");}function createSitecatMappingSortButton() {$(document).on("click","span.actionMapping",function(e) {window.setTimeout(function() {if($("div.ui-dialog[aria-labelledby='ui-dialog-title-manage_dialog_wizard'] .ui-dialog-title:contains('SiteCat'), div.ui-dialog[aria-labelledby='ui-dialog-title-manage_dialog_wizard'] .ui-dialog-title:contains('AppMeasurement')").length) {if(!$("#mappingsBulkRow").length) {$('<tr id="mappingsBulkRow" class="tmui"><td></td></tr>').appendTo("#wizard_variables_wrapper tbody");}if(!$("#sitecatSort").length) {$('<span id="sitecatSort" class="btn btn-small i-color-add"><i class="icon-sort"></i> Sort Mappings</span>').css("margin-left","10px").appendTo("#mappingsBulkRow td").click(prepareSitecatMappings);}}},250);});}console.log("Sitecat Sort Loaded");}catch(e) {console.log("Sitecat Sort Failed: " + e);}}
/************** Sitecat mapping End ***************************/
/************** Bulk Load Rules Start ***************************/
if (features.bulkLoadRules.enabled) {try {var bulk_load_rules_import = function() {console.log("Bulk Load Rules Loading"); var bulk_add_link = $('<div class="tab-menu-item tmui" style="float:right;"><span id="loadrules_button_import" class="btn btn-success" style="margin-top:0;"><i class="icon-plus"></i><span> Bulk Import</span></span></div>'); var import_container = $('<div id="load_rules_container" class="ui-dialog ui-widget ui-widget-content ui-corner-all" tabindex="-1" role="dialog" aria-labelledby="ui-dialog-title-admin_dialog" style="display: none; z-index: 1002; outline: 0px; height: 400px; width: 500px; top: 92px; left: 475px;"><div class="ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix"><span class="ui-dialog-title">Bulk Add Load Rules</span><a href="#" class="ui-dialog-titlebar-close ui-corner-all" role="button"><span class="ui-icon ui-icon-closethick load_rules_btn"></span></a></div><div style="width: auto; height: auto;" class="ui-dialog-content ui-widget-content" scrolltop="0" scrollleft="0"><textarea id="csv_load_rules" cols="11" rows="25" style="margin-left:auto;display: block;margin-right: auto;margin-top: auto;margin-bottom: auto;"></textarea></div><div class="ui-dialog-buttonpane ui-widget-content ui-helper-clearfix"><div class="ui-dialog-buttonset"><button type="button" id="add_load_rules" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" role="button" aria-disabled="false" original-title="Click to import the load rules." title="Click to import the load rules."><span class="ui-button-text">Import</span></button><button type="button" style="float:left; margin-left: 12px" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" role="button" aria-disabled="false"><span class="ui-button-text load_rules_btn">Close</span></button></div></div></div>'); $("#loadrulesContainer_headerControls").append(bulk_add_link); $("#tabs").append(import_container); $(".load_rules_btn").click(function() {$("#csv_load_rules").val(""); $("#load_rules_container").hide();}); $("#loadrules_button_import").click(function() {$("#csv_load_rules").val(""); $("#load_rules_container").toggle();}); $("#add_load_rules").click(function() {var rules = $("#csv_load_rules").val(); if (rules) {rules_rows = rules.split("\n"); for (row in rules_rows) {if (rules_rows[row]) {row_values = rules_rows[row].split(","); udo_var = "js." + row_values[0].replace(/"|'/g, ""); operator = row_values[1].replace(/"|'/g, "").toLowerCase(); value_to_match = row_values[2].replace(/"|'/g, ""); title = ""; for (w in value_to_match.split("_")) {x = value_to_match.split("_")[w]; x = x.charAt(0).toUpperCase() + x.slice(1); title += x + " ";} title = title + udo_var.split(".")[1].split("_")[0].charAt(0).toUpperCase() + udo_var.split(".")[1].split("_")[0].slice(1); lr = {0: {"input_0": udo_var, "operator_0": operator, "filter_0": value_to_match}, "title": title, "status": "active", "startDate": "------------", "endDate": "------------", "editable": "true"}; $("#csv_load_rules").val(""); utui.automator.addLoadrule(lr); console.log("Added a load rule.");} } $("#load_rules_container").toggle();} else {alert("Field cannot be blank!");} }); console.log("Bulk Load Rules Loaded");}; bulk_load_rules_import();} catch (e) {console.log("Bulk Load Rules Failed: " + e);} }
/************** Bulk Load Rules End ***************************/
/************** Add Enlarge Ids Start ***************************/
if(features.enlargeIds.enabled) {try{console.log("Add Enlarge Ids Loading"); function enlargeIds() {var tid_len = 3,tid_len_this = 0; jQuery("#manage_content").find(".container_uid .uidValue").each(function() {tid_len_this = jQuery(this).text().length; if(tid_len_this > tid_len) {tid_len = tid_len_this;}}); jQuery("#manage_content").find(".container_uid").css("width",tid_len * 9 + 5 + "px");}console.log("Add Enlarge Ids Loaded");}catch(e) {console.log("Add Enlarge Ids Failed: " + e);}}
/************** Add Enlarge Ids End ***************************/
/************** Add Condition Check Start ***************************/
if(features.conditionCheck.enabled) {try{console.log("Add Conditon Check Loading"); var conditions_errors = {}; var safe_variables = {}; var checkConditions = function(e,context) {var $thisButton = jQuery(context); var dropChoice1 = $thisButton.find("select.variableSelect").val(); var dropChoice2 = $thisButton.find("select.loadrule_operatorselect").val(); var condition_check = {"contains_ignore_case": 1,"contains": 1,"does_not_contain_ignore_case": 1,"does_not_end_with_ignore_case": 1,"does_not_start_with_ignore_case": 1,"equals_ignore_case": 1,"starts_with_ignore_case": 1,"less_than": 1,"less_than_equal_to": 1,"greater_than": 1,"greater_than_equal_to": 1}; if(dropChoice1 && dropChoice1.indexOf("dom.") < 0) {if(dropChoice2 == "defined" || dropChoice2 == "populated") {safe_variables[dropChoice1] = 1;}else if(condition_check[dropChoice2] && !safe_variables[dropChoice1]) {conditions_errors[dropChoice1] = 1; $thisButton.find(".select2-chosen").attr("style","color:#cd0a0a;");}}}; var createErrorMsg = function(e,context) {jQuery("#loadrules_dialog_error").remove(); jQuery('<div id="loadrules_dialog_error" class="ui-state-error ui-corner-all padded"><ul id="errorList" style="list-style-type: none;"></ul></div>').insertBefore("#loadrules_dialog_addmore"); var $thisButton = jQuery(context); if(Object.keys(conditions_errors).length) {if($thisButton.attr("id") === "loadrules_dialog_addmore_applyBtn") {e.preventDefault(); $thisButton.hide(); jQuery('<button type="button" id="loadrules_dialog_addmore_proceedAnyway" class="nav-btn ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" role="button" aria-disabled="false"><span class="ui-button-text">Proceed Anyway</span></button><button type="button" id="loadrules_dialog_addmore_checkAgain" class="nav-btn ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" role="button" aria-disabled="false"><span class="ui-button-text">Check Again</span></button>').insertAfter("#loadrules_dialog_addmore_applyBtn"); jQuery(document.body).on("mousedown","#loadrules_dialog_addmore_proceedAnyway",function() {$thisButton.click();});}if(Object.keys(conditions_errors).length >= 1) {jQuery("#loadrules_dialog_error").attr("style","display: block;");}else{jQuery("#loadrules_dialog_error").attr("style","display: none;");}Object.keys(conditions_errors).forEach(function(key) {jQuery("<li>Please add a select option to check if " + key + " is defined</li>").appendTo("#errorList");});}else if($thisButton.attr("id") != "loadrules_dialog_addmore_applyBtn") {jQuery("#loadrules_dialog_error").attr("style","display: block;border:1px solid #319b4a;background: #effff3 url(images/ui-bg_glass_95_fef1ec_1x400.png) 50% 50% repeat-x;color:#319b4a;"); jQuery("<li>Everything looks great! Click Apply to finish.</li>").appendTo("#errorList"); jQuery("#loadrules_dialog_addmore_proceedAnyway,#loadrules_dialog_addmore_checkAgain").remove(); jQuery("#loadrules_dialog_addmore_applyBtn").show();}else{}}; jQuery(document.body).on("mousedown","#loadrules_dialog_addmore_applyBtn, #loadrules_dialog_addmore_checkAgain",function(e) {var $thisButtonId = jQuery(this).attr("id"); if($thisButtonId === "loadrules_dialog_addmore_checkAgain") {safe_variables = {}; condition_errors = {}; jQuery("#loadrules_dialog_error").remove(); jQuery(".select2-chosen").css("color","black");}iterateOverCondtions(e,this);}); function iterateOverCondtions(e,context) {conditions_errors = {}; jQuery("#loadrules_dialog_addmore_pane>div").each(function() {var $this = jQuery(this); if($this.attr("id").indexOf("_pane_or_clause_div") > -1) {safe_variables = {}; return true;}$this.find('div[style="position:relative; clear:both;"]').each(function() {checkConditions(e,this);});}); createErrorMsg(e,context);}jQuery(document.body).on("mousedown","[id*=_editLoadRule], #loadrules_button_addmore",function() {jQuery("#loadrules_dialog_error").remove();}); console.log("Add Condition Check Loaded");}catch(e) {console.log("Add Condition Check Failed: " + e);}}
/************** Add Condition Check End ***************************/
/************** Add Bulk Add DataSources Start ***************************/
if(features.addBulkDataSources.enabled) {try{console.log("Add Bulk Add DataSources Loading"); var check_for_errors = function() {when(function() {if(jQuery("#datasource_add_dialog").is(":visible") === true) {return true;}else{return false;}},function() {jQuery("#datasource_add_dialog_replaceVars").parent().hide();}); when(function() {if(jQuery("#datasource_add_dialog").is(":visible") === false || jQuery("#datasource_add_dialog_bulkVarListErrs li").is(":visible") === true) {return true;}else{return false;}},function() {if(jQuery("#datasource_add_dialog").is(":visible") === true) {var a = {}; a.errors = {}; a.new = []; jQuery("#datasource_add_dialog_bulkVarListErrs li").each(function() {a.tmp = jQuery(this).text().replace(/^Line /,"").replace(/\: Variable.+?defined$/,""); if(!isNaN(parseInt(a.tmp))) {a.tmp = a.tmp - 1; a["errors"][a.tmp] = 1;}}); a.current = jQuery("#datasource_add_dialog_bulkVarList").val().split("\n"); for(var i = 0; i < a.current.length; i++) {if(typeof a.errors[i] === "undefined") {a.new.push(a.current[i]);}}jQuery("#datasource_add_dialog_bulkVarList").val(a.new.join("\n")); jQuery("#datasource_add_dialog_bulkVarListErrs").html("The Tampermonkey automation removed all the duplicate variables. Confirm and click Apply again"); jQuery("#datasource_add_dialogSaveBtn").mousedown(function() {check_for_errors();});}});}; jQuery("#dataSources_addBulkDataSourceBtn").click(function() {check_for_errors();}); console.log("Add Bulk Add DataSources Loaded");}catch(e) {console.log("Add Bulk Add DataSources Failed: " + e);}}
/************** Add Bulk Add DataSources End ***************************/
/************** Update TiQ Title Start ***************************/
if(features.updateTitle.enabled) {try{console.log("Update TiQ Title Loading"); function updateTiQTitle() {if(utui.data.settings.account) {document.title = "TiQ - " + utui.data.settings.account;}}console.log("Update TiQ Title Loaded");}catch(e) {console.log("Update TiQ Title Failed: " + e);}}
/************** Add Enlarge Ids End ***************************/
/************** Add Condition Check Start ***************************/
if (features.solutions_fix_conditions.enabled) {async_request("https://cdn.rawgit.com/MauricioAndrades/enhancements-bin/2.5/tampermonkey/solutions.fix_conditions.js").then((data) => {return async_exec(data, "solutions_fix_conditions");}).then((done) => {console.log("Solutions: Fix Conditions: " + done);}).catch((e)  =>  {console.log("Solutions: Fix Conditions: " + e);}); }
/************** Add Condition Check End ***************************/
/************** Solutions Extra Info ***************************/
if (features.solutions_extra_info.enabled) {async_request("https://cdn.rawgit.com/MauricioAndrades/enhancements-bin/2.5/tampermonkey/solutions.extra_info.js").then((data) => {return async_exec(data, "solutions_extra_info");}).then((done)=>{console.log("Solutions Extra Info:" + done);}).catch((e) => {console.log("Solutions Extra Info:" + e);}); }
/************** Solutions Extra Info End ***************************/
/************** Solutions Code Enh Start ***************************/
if (features.solutions_code_enh.enabled) {async_request("https://cdn.rawgit.com/MauricioAndrades/enhancements-bin/2.5/tampermonkey/solutions.code_enh.js").then((data) => {return async_exec(data, "solutions_code_enh");}).then((done)=>{console.log("Solutions Code Enh: " + done);}).catch((e) => {console.log("Solutions Code Enh: " + e);}); }
/************** Solutions Code Enh End ***************************/
console.log("Finished TealiumIQ enhancements");
console.groupEnd("TealiumIQ Enhancements");
})();

 if (typeof features.solutions_extra_info === "undefined") {
      features.solutions_extra_info = {};
      features.solutions_extra_info.url = "https://cdn.rawgit.com/MauricioAndrades/enhancements-bin/master/tampermonkey/solutions.extra_info.js";
      features.solutions_extra_info.name = "Solutions: Extra Info";
      features.solutions_extra_info.enabled = featuresOptIn;
    }var create_button = function() {
    return window.requestIdleCallback(function(){
          jQuery('<button id="fixConditions" class="btn btn-info tmui" style="float: left;margin-top:0;margin-left:10px;">Fix Conditions</button>').insertBefore("#loadrulesContainer_headerControls .tab-menu-item.labels_menu_list.labels_select_wrapper");
          jQuery(document.body).on("mousedown","#fixConditions",function(){try{add_isDefinedAll()}catch(e){}});
    })
  }
  // loadblock
  utui.util.pubsub.subscribe(utui.constants.profile.LOADED, create_button); var create_button = function() {
    return window.requestIdleCallback(function(){
          jQuery('<button id="fixConditions" class="btn btn-info tmui" style="float: left;margin-top:0;margin-left:10px;">Fix Conditions</button>').insertBefore("#loadrulesContainer_headerControls .tab-menu-item.labels_menu_list.labels_select_wrapper");
          jQuery(document.body).on("mousedown","#fixConditions",function(){try{add_isDefinedAll()}catch(e){}});
    })
  }
  // loadblock
  utui.util.pubsub.subscribe(utui.constants.profile.LOADED, create_button);

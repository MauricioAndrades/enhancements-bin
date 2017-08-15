if (!b.tealium_timestamp_local) {
  (function() {
    utag.ut.toISOString = function() {
      function pad(number) {if (number < 10) {return "0" + number;}return number;}
      try {
        var date = (new Date());
        var iso_date = (date.getUTCFullYear() + "-" + pad(date.getUTCMonth() + 1) + "-" + pad(date.getUTCDate()) + "T" + pad(date.getUTCHours()) + ":" + pad(date.getUTCMinutes()) + ":" + pad(date.getUTCSeconds()) + "." + (date.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) + "Z");
        return iso_date.replace("Z", "");
      } catch(e) {return "";}
    };
    b["tealium_timestamp_local"] = utag.ut.toISOString();
  }());
}

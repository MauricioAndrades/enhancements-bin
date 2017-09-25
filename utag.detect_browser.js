/**
 *  Browser Detection via utag.js util.
 *  @method
 *  @param   {obj}   udo     : the datalayer object available in this scope.
 *  @param   {obj}   params  : declare custom export values here. defaults to udo['nav.browser_type'] & udo['nav.browser_version'].
 *  @param   {bool}  force   : optional flag to force execute the extension.
 */
(function(udo, params, force) {
  udo = udo || {};
  params = params || {type:"nav.browser_type", version:"nav.browser_version"};
  if (!udo[params.type] || force) {
    utag.ut.detect_browser = function(udo, params) {
      var agent, browser = null;
      if (window.navigator && navigator.userAgent) {
        agent = navigator.userAgent;
        try {
          browser = [["edge", /Edge\/([0-9\._]+)/],["yandexbrowser", /YaBrowser\/([0-9\._]+)/],["vivaldi", /Vivaldi\/([0-9\.]+)/],["kakaotalk", /KAKAOTALK\s([0-9\.]+)/],["chrome", /(?!Chrom.*OPR)Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/],["crios", /CriOS\/([0-9\.]+)(:?\s|$)/],["firefox", /Firefox\/([0-9\.]+)(?:\s|$)/],["fxios", /FxiOS\/([0-9\.]+)/],["opera", /Opera\/([0-9\.]+)(?:\s|$)/],["opera", /OPR\/([0-9\.]+)(:?\s|$)$/],["ie", /Trident\/7\.0.*rv\:([0-9\.]+).*\).*Gecko$/],["ie", /MSIE\s([0-9\.]+);.*Trident\/[4-7].0/],["ie", /MSIE\s(7\.0)/],["bb10", /BB10;\sTouch.*Version\/([0-9\.]+)/],["android", /Android\s([0-9\.]+)/],["ios", /Version\/([0-9\._]+).*Mobile.*Safari.*/],["safari", /Version\/([0-9\._]+).*Safari/]].map(function(regex) {
            if (regex[1].test(agent)) {
              var found = regex[1].exec(agent),
              o = found && found[1].split(/[._]/).slice(0, 3);
              return o && o.length < 3 && Array.prototype.push.apply(o, 1 == o.length ? [0, 0] : [0]), {
                type: regex[0],
                version: o.join(".")
              }
            }
          }).filter(Boolean).shift();
          if (browser) {
            udo[params.type] = browser.type ? browser.type : "";
            udo[params.version] = browser.version ? browser.version : "";
            utag.DB("utag.ut.detect_browser: exporting browser info to UDO");
          }
        } catch (error) {
          utag.DB("utag.ut.detect_browser: could not id browser.");
        }
      }
    };
    utag.ut.detect_browser(udo, params);
  }
})(b, {type:"nav.browser_type", version:"nav.browser_version"}, true);

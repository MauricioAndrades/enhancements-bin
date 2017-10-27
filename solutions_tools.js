utag.solutions = utag.solutions || {
  /**
   * prev page extension updated for spa
   * @param  {string} a :utag event type
   * @param  {object} b :udo
   * @return {none}     :sets cookie
   * scope: all-tags (before or after loadrules)
   * example: sol_eng.prev_page_spa(a, b)
   */
  prev_page_spa: function(a, b) {
    if ("view" !== a) {
      return;
    }
    utag.runonce = utag.runonce || {};
    if (!utag.runonce["prev_page"] || utag.runonce.url && utag.runonce.url !== document.URL) {
      utag.runonce.url = document.URL;
      utag.runonce["prev_page"] = 1;
      b["previous_page"] = b["cp.utag_main__prevpage"];
      utag.loader.SC("utag_main", {
        "_prevpage": b["page"] + ";exp-1h"
      });
    }
  },
  /**
   * init a runonce function... easy peasy
   * @param  {string}   id       : any label for your oncetime fn.
   * @param  {function} callback : a callback that will runonce.
   * @param  {object}   ctx      : optional context.
   * @return {function}          : returns a onetime fn.
   * example one:
   *   var log_once = utag.solutions.exec_once('10', function(value) {console.log(value)});
   *   log_once('first') --> 'first';
   *   log_once('second') --> will not execute a second time. returns undefined;
   * example two:
   *   var with_context = utag.solutions.exec_once('some_label', function(){console.log(this)}, document);
   *   with_context() --> document;
   *   with_context() --> '';
   */
  exec_once: function(id, callback, ctx) {
    if (!id || !callback) return;
    ctx = ctx === null || ctx ? ctx : undefined;
    if (!check(id)) {
      return function() {
        if (!utag.ut.runonce[id]) {
          utag.ut.runonce[id] = 1;
          callback.apply((ctx||this), arguments);
        }
      }
    }
    function check(id) {
      if ("object" !== typeof utag.ut) {utag.ut = {};}
      if ("object" !== typeof utag.ut.runonce) {utag.ut.runonce = {};}
      return utag.ut.runonce[id] ? true : false;
    };
  }
}

utag.JSONp = {
  /**
   *  builds querystring params
   *  @method  getURL
   *  @param   {string}  url   : the base_url of the call.
   *  @param   {[type]}  data  : an object of querytring params to append.
   */
  getURL: function(url, data) {
    var uri, params;
    if (data && utag.ut.typeOf(data) === "object") {
      params = Object.keys(data).map(function(key, i) {
        return key + "=" + encodeURIComponent(data[key]);
      })
      if (params) {
        return url + "?" + params.join("&");
      } else {
        return url;
      }
    }
  },
  /**
   *  promised based, async xhr loader.
   *  @method  loadXHR
   *  @param   {string}  url  : the url request to make.
   *  @return  {promise}
   */
  loadXHR: function(url) {
    return new Promise(load);

    function load(resolve, reject) {
      function on_ready_state_changed() {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
          return;
        }
        if (xhr.status !== 200) {
          xhr.onreadystatechange = null;
          reject(new Error(xhr.status));
          return;
        }
        xhr.onreadystatechange = null;
        resolve(xhr.responseText);
      }
      var xhr = new XMLHttpRequest;
      xhr.withCredentials = true;
      xhr.open("GET", url, true);
      xhr.setRequestHeader("Content-Type", "application/javascript");
      xhr.setRequestHeader("Accept-Language", "en-US,en;q=0.8");
      xhr.setRequestHeader("Cache-Control", "no-cache");
      xhr.onreadystatechange = on_ready_state_changed;
      xhr.send(null);
    }
  },
  /**
   *  execute the jsonp code without eval. or make the request if no promises in window.
   *  @method  exec
   *  @param   {string}  data  : either the jsonp response or the url string.
   *  @param   {boolean}  mod  : boolean flag. Chooses execution path.
   */
  exec: function(data, mod) {
    var s, script = document.createElement('script');
    script.type = "application/javascript";
    if (mod) {
      script.src = data;
      s = document.getElementsByTagName("script")[0];
      s.parentNode.insertBefore(script, s);
      return;
    } else {
      script.innerHTML = data
    }
    document.head.appendChild(script);
    document.head.removeChild(script);
    utag.DB("utagJSONp: executed");
    return;
  },
  // response may fail to deliver data but still resolve properly.
  // we handle this after we resolve the response.
  fetch: function(url, opts, success_cb, error_cb) {
    var JSONp = this;
    var src = JSONp.getURL(url, opts);
    try {
      if (!window.Promise) {
        JSONp.exec(src, true);
        return;
      }
      JSONp.loadXHR(src).then(function(response) {
        // check if we got it, but it's empty.
        if (response === 'utag.ut.getvisitorid({"tvt":[]});') {
          // throw new error to move in catch block.
          // no problem because we're still in a try catch.
          throw new Error("uJSONp: empty response");
        } else {
          JSONp.exec(response);
          success_cb.call(response);
          return;
        }
      }).catch(function(e) {
        return error_cb.call(null, e);
      });
    } catch (e) {}
  }
};

// utag.JSON.fetch(url, config_obj, success_cb, failure_cb)
utag.JSONp.fetch("http://datacloud.tealiumiq.com/ti/main/16/i.js", {
  "jsonp": "utag.ut.getvisitorid"
}, function(success) {
  utag.DB("uJSONp: done");
}, function(error) {
  utag.DB("uJSONp: could not retrieve visitor id, firing utag.link");
  utag.link(utag.data, null, [89]);
});

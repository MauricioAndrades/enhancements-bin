utag.currency_converter = function(config) {
  var noop = function() {};
  var msg = config.log ? {log: console.log.bind(console),info: console.info.bind(console)} : {log: noop,info: noop};
  if (a !== config.event) {msg.info("currency: exiting early, events don't match");return;}
  if (!window.tealiumiq_currency) {msg.info("currency: missing global tealiumiq_instance, loading");}
  // if we're calling the currency converter but we haven't attempted to load the script:
  if (config.udo && !config.udo.tealiumiq_currency_requested) {if (window.tealiumiq_currency_load) {tealiumiq_currency_load();}}

  function get_rates(item) {
    var cached;
    if (window.tealiumiq_currency && typeof(tealiumiq_currency.rates) === "object") {
      try {sessionStorage.setItem((item || "rates"), JSON.stringify(tealiumiq_currency.rates));cached = Object.assign({}, tealiumiq_currency.rates);} catch (e) {}
      return cached;
    } else {try {cached = JSON.parse(sessionStorage.getItem((item || "rates")));return typeof(cached) === "object" && Object.keys(cached).length ? cached : null;} catch (e) {return null;}}
  };
  var converter = {
    log: config.log || false,
    event: config.event,
    udo: config.udo,
    rates: config.rates || get_rates("rates"),
    keys: config.keys || [],
    conv: {
      dest: config.conv.dest || "USD",
      src: "",
      active: null,
      complete: []
    },
    rules: config.rules,
    codes: function codes(country) {
      return {"algeria": "DZD","angola": "AOA","argentina": "ARS","armenia": "AMD","aruba": "AWG","australia": "AUD","azerbaijan": "AZN","bahamas": "BSD","bahrain": "BHD","bangladesh": "BDT","barbados": "BBD","belarus": "BYN","belize": "BZD","bermuda": "BMD","bhutan": "BTN","bolivia": "BOB","bosnia and herzegovina": "BAM","botswana": "BWP","brazil": "BRL","brunei darussalam": "BND","bulgaria": "BGN","burundi": "BIF","cambodia": "KHR","canada": "CAD","cape verde": "CVE","cayman islands": "KYD","chile": "CLP","china": "CNY","colombia": "COP","comorian": "KMF","congo": "CDF","costa rica": "CRC","croatia": "HRK","cuba convertible": "CUC","cuba": "CUP","czech republic": "CZK","denmark": "DKK","djibouti": "DJF","dominican republic": "DOP","east caribbean": "XCD","egypt": "EGP","el salvador": "SVC","eritrea": "ERN","ethiopia": "ETB","euro zone": "EUR","malvinas": "FKP","faulkland island": "FKP","fiji": "FJD","gambia": "GMD","georgia": "GEL","ghana": "GHS","gibraltar": "GIP","guatemala": "GTQ","guernsey": "GGP","guinea": "GNF","guyana": "GYD","haiti": "HTG","honduras": "HNL","hong kong": "HKD","hungary": "HUF","iceland": "ISK","india": "INR","indonesia": "IDR","imf": "XDR","iran": "IRR","iraq": "IQD","isle of man": "IMP","israel": "ILS","jamaica": "JMD","japan": "JPY","jersey": "JEP","jordan": "JOD","kazakhstan": "KZT","kenya": "KES","north korea": "KPW","south korea": "KRW","kuwait": "KWD","kyrgyzstan": "KGS","laos": "LAK","lebanon": "LBP","lesotho": "LSL","liberia": "LRD","libya": "LYD","macau": "MOP","macedonia": "MKD","madagascar": "MGA","malawi": "MWK","malaysia": "MYR","maldives": "MVR","mauritania": "MRO","mauritius": "MUR","mexico": "MXN","moldova": "MDL","mongolia": "MNT","morocco": "MAD","mozambique": "MZN","myanmar": "MMK","burma": "MMK","namibia": "NAD","nepal": "NPR","netherlands antilles": "ANG","new zealand": "NZD","nicaragua": "NIO","nigeria": "NGN","norway": "NOK","oman": "OMR","pakistan": "PKR","panama": "PAB","papua new guinea": "PGK","paraguay": "PYG","peru": "PEN","philippines": "PHP","poland": "PLN","qatar": "QAR","romania": "RON","russia": "RUB","rwanda": "RWF","saint helena": "SHP","samoa": "WST","sao tome and principe": "STD","saudi arabia": "SAR","serbia": "RSD","seychelles": "SCR","sierra leone": "SLL","singapore": "SGD","solomon islands": "SBD","somalia": "SOS","south africa": "ZAR","sri lanka": "LKR","sudan": "SDG","suriname": "SRD","swaziland": "SZL","sweden": "SEK","switzerland": "CHF","syria": "SYP","taiwan": "TWD","tajikistan": "TJS","tanzania": "TZS","thailand": "THB","tonga": "TOP","trinidad and tobago": "TTD","tunisia": "TND","turkey": "TRY","turkmenistan": "TMT","tuvalu": "TVD","uganda": "UGX","ukraine": "UAH","united arab emirates": "AED","united kingdom": "GBP","united states": "USD","uruguay": "UYU","uzbekistan": "UZS","vanuatu": "VUV","venezuela": "VEF","viet nam": "VND","yemen": "YER","zambia": "ZMW","zimbabwe": "ZWD"}[country] || "";
    },
    normalize: function(s) {type = typeof s;if (type === "string") {return s.toLowerCase().trim();} else if (!isNaN(Number(s))) {return Number(s).toPrecision(4);} else {return "";}},
    set_conv_src: function(a, b) {var pass = false;for (var key in converter.rules) {if (converter.rules.hasOwnProperty(key)) {try {pass = converter.rules[key].call(converter, a, b);if (pass) {converter.conv.src = converter.codes(key);msg.info("currency: setting codes");break;}} catch (e) {msg.info("no conversion value found:", e);}}}},
    kindof: function kindof(d) {var t = Object.prototype.toString.call(d).match(/\s([a-zA-Z]+)/)[1].toLowerCase();switch (t) {case "number":return isNaN(d) ? "nan" : "number";default:return t;}},
    convert: function(list, src_currency, dest_currency, rates, udo) {
      var kindof = this.kindof;
      if (kindof(rates) !== "object" && !Object.keys(rates).length) {return;}
      var standard, is_string, conv, key, value, value_type, tmp;
      // standardize and clean the list.
      list = ([]).concat(list).filter(function(key, i) {return udo[key] && udo[key] !== "";});
      if (list.length) {
        for (var i = 0; i < list.length; i++) {
          key = list[i];
          if (converter.conv.complete.includes(key)) {msg.log("utag currency: " + key + " already converted, continue.");continue;}
          type = udo[key] ? kindof(Number(udo[key])) : null;
          if ("number" !== type) {continue;}
          if (udo[key] > 0 && rates[src_currency] > 0 && rates[dest_currency] > 0) {
            conv = udo[key] / (rates[src_currency] * rates[dest_currency]);
            if (kindof(conv) === "number") {
              msg.info("converted:" + list[i] + " " + udo[key] + " -> " + conv.toFixed(udo[key].length));
              udo[key] = Number(conv).toFixed(2);
              converter.conv.complete.push(key);
            }
          }
        }
      }
    },
    eval_rules: function(a, b) {
      if (window.tealiumiq_currency && window.tealiumiq_currency.rates) {
        converter.set_conv_src.call(converter, a, b);
        if (converter.conv.src) {
          msg.info("currency: found code: " + converter.conv.src);
          converter.convert(converter.keys, converter.conv.src, converter.conv.dest, converter.rates, b);
          return converter;
        }
      } else {
        return null;
      }
    }
  };
  return converter;
};

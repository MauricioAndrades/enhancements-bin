(function(a, b) {
  var currency_factory = function(config, a, b) {
    var noop = function() {};
    // logger. for testing. to turn off set config to log false.
    var msg = config.log && window.console && Function.prototype.bind ? {
      log: console.log.bind(console),
      info: console.info.bind(console)
    } : {
      log: noop,
      info: noop
    };
    /**
     *  fetch the currency rates we requested from sessionStorage if they are there.
     *  @method  get_rates
     *  @param   {string}   key_name  :the name of the key in sessionStorage.
     *  @return  {object}             : returns the parsed rates or null.
     */
    function get_rates(key_name) {
      var cached;
      if (window.tealiumiq_currency && typeof tealiumiq_currency.rates === "object") {
        try {
          sessionStorage.setItem(key_name || "rates", JSON.stringify(tealiumiq_currency.rates));
          cached = Object.assign({}, tealiumiq_currency.rates);
        } catch (e) {}
        return cached;
      } else {
        try {
          cached = JSON.parse(sessionStorage.getItem(key_name || "rates"));
          return typeof cached === "object" && Object.keys(cached).length ? cached : null;
        } catch (e) {
          return null;
        }
      }
    }
    // initialize the currency converter object that will be exported to utag
    var converter = {
      log: config.log || false,
      event: a,
      udo: b,
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
        return {
          "algeria": "DZD",
          "angola": "AOA",
          "argentina": "ARS",
          "armenia": "AMD",
          "aruba": "AWG",
          "australia": "AUD",
          "azerbaijan": "AZN",
          "bahamas": "BSD",
          "bahrain": "BHD",
          "bangladesh": "BDT",
          "barbados": "BBD",
          "belarus": "BYN",
          "belize": "BZD",
          "bermuda": "BMD",
          "bhutan": "BTN",
          "bolivia": "BOB",
          "bosnia and herzegovina": "BAM",
          "botswana": "BWP",
          "brazil": "BRL",
          "brunei darussalam": "BND",
          "bulgaria": "BGN",
          "burundi": "BIF",
          "cambodia": "KHR",
          "canada": "CAD",
          "cape verde": "CVE",
          "cayman islands": "KYD",
          "chile": "CLP",
          "china": "CNY",
          "colombia": "COP",
          "comorian": "KMF",
          "congo": "CDF",
          "costa rica": "CRC",
          "croatia": "HRK",
          "cuba convertible": "CUC",
          "cuba": "CUP",
          "czech republic": "CZK",
          "denmark": "DKK",
          "djibouti": "DJF",
          "dominican republic": "DOP",
          "east caribbean": "XCD",
          "egypt": "EGP",
          "el salvador": "SVC",
          "eritrea": "ERN",
          "ethiopia": "ETB",
          "euro zone": "EUR",
          "malvinas": "FKP",
          "faulkland island": "FKP",
          "fiji": "FJD",
          "gambia": "GMD",
          "georgia": "GEL",
          "ghana": "GHS",
          "gibraltar": "GIP",
          "guatemala": "GTQ",
          "guernsey": "GGP",
          "guinea": "GNF",
          "guyana": "GYD",
          "haiti": "HTG",
          "honduras": "HNL",
          "hong kong": "HKD",
          "hungary": "HUF",
          "iceland": "ISK",
          "india": "INR",
          "indonesia": "IDR",
          "imf": "XDR",
          "iran": "IRR",
          "iraq": "IQD",
          "isle of man": "IMP",
          "israel": "ILS",
          "jamaica": "JMD",
          "japan": "JPY",
          "jersey": "JEP",
          "jordan": "JOD",
          "kazakhstan": "KZT",
          "kenya": "KES",
          "north korea": "KPW",
          "south korea": "KRW",
          "kuwait": "KWD",
          "kyrgyzstan": "KGS",
          "laos": "LAK",
          "lebanon": "LBP",
          "lesotho": "LSL",
          "liberia": "LRD",
          "libya": "LYD",
          "macau": "MOP",
          "macedonia": "MKD",
          "madagascar": "MGA",
          "malawi": "MWK",
          "malaysia": "MYR",
          "maldives": "MVR",
          "mauritania": "MRO",
          "mauritius": "MUR",
          "mexico": "MXN",
          "moldova": "MDL",
          "mongolia": "MNT",
          "morocco": "MAD",
          "mozambique": "MZN",
          "myanmar": "MMK",
          "burma": "MMK",
          "namibia": "NAD",
          "nepal": "NPR",
          "netherlands antilles": "ANG",
          "new zealand": "NZD",
          "nicaragua": "NIO",
          "nigeria": "NGN",
          "norway": "NOK",
          "oman": "OMR",
          "pakistan": "PKR",
          "panama": "PAB",
          "papua new guinea": "PGK",
          "paraguay": "PYG",
          "peru": "PEN",
          "philippines": "PHP",
          "poland": "PLN",
          "qatar": "QAR",
          "romania": "RON",
          "russia": "RUB",
          "rwanda": "RWF",
          "saint helena": "SHP",
          "samoa": "WST",
          "sao tome and principe": "STD",
          "saudi arabia": "SAR",
          "serbia": "RSD",
          "seychelles": "SCR",
          "sierra leone": "SLL",
          "singapore": "SGD",
          "solomon islands": "SBD",
          "somalia": "SOS",
          "south africa": "ZAR",
          "sri lanka": "LKR",
          "sudan": "SDG",
          "suriname": "SRD",
          "swaziland": "SZL",
          "sweden": "SEK",
          "switzerland": "CHF",
          "syria": "SYP",
          "taiwan": "TWD",
          "tajikistan": "TJS",
          "tanzania": "TZS",
          "thailand": "THB",
          "tonga": "TOP",
          "trinidad and tobago": "TTD",
          "tunisia": "TND",
          "turkey": "TRY",
          "turkmenistan": "TMT",
          "tuvalu": "TVD",
          "uganda": "UGX",
          "ukraine": "UAH",
          "united arab emirates": "AED",
          "united kingdom": "GBP",
          "united states": "USD",
          "uruguay": "UYU",
          "uzbekistan": "UZS",
          "vanuatu": "VUV",
          "venezuela": "VEF",
          "viet nam": "VND",
          "yemen": "YER",
          "zambia": "ZMW",
          "zimbabwe": "ZWD"
        }[country] || "";
      },
      normalize: function(s) {
        type = typeof s;
        if (type === "string") {
          return s.toLowerCase().trim();
        } else if (!isNaN(Number(s))) {
          return Number(s).toPrecision(4);
        } else {
          return "";
        }
      },
      set_conv_src: function(a, b) {
        var pass = false;
        for (var key in converter.rules) {
          if (converter.rules.hasOwnProperty(key)) {
            try {
              pass = converter.rules[key].call(converter, a, b);
              if (pass) {
                converter.conv.src = converter.codes(key);
                msg.info("currency: setting codes");
                break;
              }
            } catch (e) {
              msg.info("no conversion value found:", e);
            }
          }
        }
      },
      kindof: function kindof(d) {
        var t = Object.prototype.toString.call(d).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
        switch (t) {
          case "number":
            return isNaN(d) ? "nan" : "number";
          default:
            return t;
        }
      },
      convert: function(list, src_currency, dest_currency, rates, udo) {
        var convert_multiple = function(arr, key) {
          var success;
          var converted = [];
          var conv;
          if (kindof(arr) === 'array') {
            for (var i = 0; i < arr.length; i++) {
              conv = null;
              if (kindof(arr[i]) === 'number' && arr[i] > 0 && rates[src_currency] > 0 && rates[dest_currency] > 0) {
                conv = arr[i] / (rates[src_currency] * rates[dest_currency]);
                if (kindof(conv) === 'number') {
                  converted.push(conv.toFixed(2));
                  success = true
                }
              } else {
                converted.push(arr[i])
              }
            }
          }
          if (converted.length && success) {
            msg.info('converted: ' + key + ' ' + udo[key] + ' -> ' + converted);
            udo['conv.' + key] = converted;
            converter.conv.complete.push(key)
          }
        };
        var convert_single = function(value, key) {
          if (value > 0 && rates[src_currency] > 0 && rates[dest_currency] > 0) {
            conv = value / (rates[src_currency] * rates[dest_currency]);
            if (kindof(conv) === 'number') {
              msg.info('converted:' + list[i] + ' ' + udo[key] + ' -> ' + conv.toFixed(udo[key].length));
              udo['conv.' + key] = Number(conv).toFixed(2);
              converter.conv.complete.push(key)
            }
          }
        };
        // a udo param value. like '1200.00' or ['1200.00']
        var value;
        var standard, is_string, conv, key, value, value_type, tmp;
        var kindof = this.kindof;
        // if we do have currency rates, exit.
        if (kindof(rates) !== "object" && !Object.keys(rates).length) {
          return;
        }
        // pre-remove target conversions if they are not in the udo.
        list = [].concat(list).filter(function(key, i) {
          return udo[key] && udo[key] !== "";
        });
        // if we keys to convert.
        if (list.length) {
          for (var i = 0; i < list.length; i++) {
            key = list[i];
            // ensure we only convert each key once.
            // if (converter.conv.complete.includes(key)) {msg.log("utag currency: " + key + " already converted, continue.");continue;}

            // preformat values for conversion.
            if (udo[key]) {
              type = kindof(udo[key]);
              // preformat the value of the udo param to remove chars that will cause us to retur NaN.
              if (type === "string" && udo[key] !== "") {
                value = Number(udo[key].replace(",", ""));
              }
              // handle array.
              if (type === "array") {
                value = udo[key].map(function(val, i) {
                  return Number(val.replace(",", ""))
                });
              }
            }
            type = kindof(value);
            if (type !== "array" && type !== "number") {
              msg.info('utag.currency: convert call exiting conversion for ' + key + ' because the conversion target is not the correct format');
            }
            if (type === "array" && value.length) {
              try {
                convert_multiple(value, key);
              } catch (e) {
                msg.info(e);
                continue;
              }
            }
            if (type === "number" && value > 0) {
              try {
                convert_single(value, key);
              } catch (e) {
                msg.info(e);
                continue;
              }
            }
          }
        }
      },
      eval_rules: function(a, b) {
        if (b) {
          converter.udo = b;
        }
        if (window.tealiumiq_currency && window.tealiumiq_currency.rates) {
          try {
            converter.set_conv_src.call(converter, converter.event, converter.udo);
          } catch (e) {
            msg.log(e)
          }
          if (converter.conv.src) {
            msg.info("currency: found code: " + converter.conv.src);
            converter.convert(converter.keys, converter.conv.src, converter.conv.dest, converter.rates, converter.udo);
            return converter;
          }
        } else {
          return null;
        }
      }
    };
    return converter;
  };
  /**
   *  creates the config object passed into our currency converter factory.
   *  @method  currency_config_factory
   *  @param   {string}                 a  udo event: 'view' or 'link'.
   *  @param   {object}                 b  udo
   *  @return  {object}                    returns a configuration object.
   */
  var currency_config_factory = function(a, b) {
    return {
      log: true,
      udo: b,
      event: a,
      keys: ["tm_local_ordertotal", "_csubtotal", "order_subtotal", "_cprice", "_ctotal", "tm_local_package_price"],
      conv: {
        src: "USD"
      },
      rules: {
        "hong kong": function(a, b) {
          return typeof(b.tm_global_currency_code) === "string" && b.tm_global_currency_code.toUpperCase() === "HKD";
        },
        "taiwan": function(a, b) {
          return typeof(b.tm_global_currency_code) === "string" && b.tm_global_currency_code.toUpperCase() === "TWD";
        },
        "singapore": function(a, b) {
          return typeof(b.tm_global_currency_code) === "string" && b.tm_global_currency_code.toUpperCase() === "SGD";
        },
        "new zealand": function(a, b) {
          return typeof(b.tm_global_currency_code) === "string" && b.tm_global_currency_code.toUpperCase() === "NZD";
        },
        "australia": function(a, b) {
          return typeof(b.tm_global_$(document.body).on('click', 'a.sel-resultsLink.sel-webLink', function doc_data_handler(e) {
  function format_key(key) {
    var result = key.trim().replace(/\u0020/igm, '_').toLowerCase();
    if (result === 'doctor') {
      result = 'name';
    }
    return result;
  }
  function format_value(value) {
    if (!value) {
      return "";
    }
    return value.trim();
  }
  var data = {};
  $(this).closest('tr').find('td[data-name]').each(function(i, elem) {
    data['doc.' + format_key(elem.dataset.name)] = format_value(elem.textContent);
  })
  console.log(data);
})
currency_code) === "string" && b.tm_global_currency_code.toUpperCase() === "AUD";
        },
        "india": function(a, b) {
          return typeof(b.tm_global_currency_code) === "string" && b.tm_global_currency_code.toUpperCase() === "INR";
        },
        "china": function(a, b) {
          return typeof(b.tm_global_currency_code) === "string" && b.tm_global_currency_code.toUpperCase() === "CNY";
        },
        "malaysia": function(a, b) {
          return typeof(b.tm_global_currency_code) === "string" && b.tm_global_currency_code.toUpperCase() === "MYR";
        }
      }
    };
  };
  utag.currency_config = currency_config_factory(a, b);
  try {
    utag.currency_config.rates = JSON.parse(sessionStorage.getItem("rates"));
  } catch (e) {}
  if (window.tealiumiq_currency && window.tealiumiq_currency.rates) {
    utag.currency_config.rates = window.tealiumiq_currency.rates;
    try {
      sessionStorage.setItem("rates", JSON.stringify(window.tealiumiq_currency.rates));
    } catch (e) {}
  }
  if (utag.currency_config.rates) {
    utag.currency = utag.currency || currency_factory(utag.currency_config, a, b);
    if (utag.currency && utag.currency.rates) {
      utag.currency.eval_rules(a, b);
    }
  }
})(a, b);

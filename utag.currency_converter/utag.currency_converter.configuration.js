var config = {
  log: false,
  udo: b,
  event: a,
  keys: ["tm_order_local", "_csubtotal", "order_subtotal"],
  conv: {
    src: "USD"
  },
  rates: "",
  rules: {
    "taiwan": function(a, b) {
      return document.URL.toLowerCase().indexOf("culture=zh-tw") > -1;
    },
    "singapore": function(a, b) {
      return document.URL.toLowerCase().indexOf("culture=en-sg") > -1;
    },
    "new zeland": function(a, b) {
      return document.URL.toLowerCase().indexOf("culture=en-nz") > -1
    },
    "australia": function(a, b) {
      return document.URL.toLowerCase().indexOf("culture=en-au") > -1;
    },
    "india": function(a, b) {
      return document.URL.toLowerCase().indexOf("culture=en-in") > -1;
    },
    "china": function(a, b) {
      return document.URL.toLowerCase().indexOf("culture=zh-cn") > -1;
    }
  }
};
try {
  config.rates = JSON.parse(sessionStorage.getItem("rates"));
} catch (e) {}
if (window.tealiumiq_currency && window.tealiumiq_currency.rates) {
  config.rates = window.tealiumiq_currency.rates;
}
if (config.rates) {
  utag.currency = utag.currency_converter(config);
  if (utag.currency && utag.currency.rates) {
    utag.currency.eval_rules(a, b);
  };
}

// 1. hover over desired emails in zendesk cc's list so the pop up with the emails shows up.
// now execute:
(function() {
    function zd_get_emails() {
        return $(".zd-tag-item.user._tooltip,.zd-tag-item._tooltip").map(function(i, elem) {
            var name = $(elem).find('a[role=menuitem]').get(0);
            if (name) name = name.textContent.replace(',', '');
            var email = elem.getAttribute('data-original-title');
            if (name && email) {
                return name + ' <' + email + '>';
            };
        }).toArray().filter(function(value, index, self) {
            return self.indexOf(value) === index;
        });
    }

    try {
        var cc_list = zd_get_emails();
        if (cc_list) copy(cc_list.join(', '));
        console.log(cc_list.join(',\n'));
        console.log('check your clipboard');
    } catch (e) {
        console.log('whoops: did you forget to hover on the emails?');
        console.log(e);
    }
})();

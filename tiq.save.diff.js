(function() {
    function saveDiff() {
        console.save = function(data, filename) {
            if (!data) return;
            if (!filename) {
                var date = new Date;
                filename = date.getTime().toString() + "." + document.location.pathname.replace(/\/|:/gim, "-").replace(/---/, ".") + ".json"
            }
            if (typeof data === "object") {
                data = jstpc(data, {
                    maxlength: 20000
                })
            }
            var blob = new Blob([data], {
                type: "text/json"
            }),
            e = document.createEvent("MouseEvents"),
            a = document.createElement("a");
            a.download = filename;
            a.href = window.URL.createObjectURL(blob);
            a.dataset.downloadurl = ["text/json", a.download, a.href].join(":");
            e.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            a.dispatchEvent(e)
        };
        (function(global) {
            function walkTheDOM(node, func) {
                if (!node) return;
                func(node);
                node = node.firstChild;
                while (node) {
                    walkTheDOM(node, func);
                    node = node.nextSibling
                }
            }
            var elem = document.querySelector("#diff-table-body");

            walkTheDOM(elem, function(node) {
                if (!node) return;
                if (node.tagName === "TR") {
                    node.children[1].classList.add("diffleft");
                    node.children[3].classList.add("diffright")
                }
            });

            var setImmediate = function(callback) {
                var args = [...arguments].slice(1);
                Promise.resolve().then(() => callback(...args));
                return 0;
            };

            $(".diffleft").css('word-wrap', 'normal');
            window.left_data = "//" + utui.util.safeEscape($(".diff-details-left").text().trim()) + "\n";
            document.querySelectorAll(".diffleft").forEach(function(el, i) {left_data += el.textContent + "\n"});
            // console.save(left_data, 'a.data.js');

            $(".diffright").css('word-wrap', 'normal');
            window.right_data = "//" + utui.util.safeEscape($(".diff-details-right").text().trim()) + "\n";
            document.querySelectorAll(".diffright").forEach(function(el, i) {right_data += el.textContent + "\n"});
            // setTimeout(function() {console.save(right_data, 'b.data.js');}, 200)
            setImmediate(function() {
                console.save(left_data, 'a.data.js');
                console.save(right_data, 'b.data.js');
                window.requestAnimationFrame(function() {
                    $(".diffright,.diffleft").css('word-wrap', 'break-word');
                })
            })

        })(window);
    }
    function parseHTML(str) {
        var tmp = document.implementation.createHTMLDocument();
        tmp.body.innerHTML = str;
        return tmp.body.children[0];
    }
    var footer = document.querySelector('#utui_distro_compare_closeBtn');
    var btn = parseHTML("<button id=\"Save Diff\" class=\"btn btn-info tmui\" style=\"float: right;margin:10px;\">Save Diff</button>");
    footer.parentNode.appendChild(btn);
    $(btn).on('click', function(e) {
        saveDiff()
    })
})();

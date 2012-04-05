(function() {
    function $(selector) {
        return [].slice.call( document.querySelectorAll( selector ), 0);
    }

    function createToc() {
        var nodes = document.querySelectorAll("section > *"),
            toc = document.querySelector('.toc'),
            openH3 = false,
            html = '';

        nodes = [].slice.call(nodes, 0);

        nodes.forEach(function(node) {
            if (node.tagName === "H3") {
                if (openH3) {
                    html += "</ul>";
                    openH3 = false;
                }

                html += ''.concat(
                    '<li><a href="#' + node.id + '">',
                    node.innerHTML,
                    '</a></li>',
                    '<ul>'
                );

                openH3 = true;
            }

            if (node.tagName === "ARTICLE") {
                html += ''.concat(
                    '<li><a href="#' + node.id + '">',
                    node.querySelector("h1").innerHTML,
                    '</a></li>'
                );
            }
        });

        toc.innerHTML = html;
    }

    // For Rainbow.js
    function addLanguage() {
        $("pre code").forEach(function(node) {
            node.dataset.language = "javascript";
        });
    }

    if (document.querySelector) {
        createToc();
        addLanguage();
    } else {
        var content = document.getElementById('content'),
            html = ''.concat(
                '<p><strong>This website is best viewed in something else than an old ',
                'version of Internet Explorer :)</strong></p>'
            );

        content.innerHTML = html + content.innerHTML;
    }
})();
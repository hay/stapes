window.App = (function() {
    return Stapes.subclass({
        constructor : function() {
            this.$toc = $("#toc");
            this.$content = $("#content");
            this.createToc();
            this.addSyntaxHighlighting();

            if ($(window).width() > 960) {
                this.addAffix();
                this.addScrollspy();
                $("#toc").parent().addClass('pull-right');
            }
        },

        addAffix : function() {
            this.$toc.affix({
                offset : {
                    top: this.$toc.offset().top
                }
            });
        },

        addScrollspy : function() {
            $("body").scrollspy({
                offset : 80,
                target : '#toc .nav'
            });
        },

        addSyntaxHighlighting : function() {
            $("pre").each(function() {
                $(this).attr('data-language', 'javascript');
            });
        },

        createToc : function() {
            var menu = [];
            var first = true;

            // This could be better :)
            var $headings = this.$content.find("h3, h4");
            var headingsCount = $headings.length - 1;

            $headings.each(function(index) {
                var $el = $(this);
                var id = $el.attr('id');

                if (!id) {
                    id = $el.parent().attr('id');
                }

                var li = ('<a href="#' + id + '">' + $el.text() + '</a>');

                if ($el.is('h3')) {
                    li = '<li>' + li;

                    if (first) {
                        first = false;
                    } else {
                        li = '</ul>' + li;
                    }

                    if (index < headingsCount) {
                        li = li + '<ul class="nav">';
                    }
                } else {
                    li = '<li>' + li + '</li>';
                }

                menu.push(li);
            });

            this.$toc.find("ul").append( menu.join('') );
        }
    });
})();
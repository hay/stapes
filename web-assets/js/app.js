window.App = (function() {
    return Stapes.subclass({
        constructor : function() {
            this.$toc = $("#toc");
            this.$content = $("#content");
            this.createToc();
            this.addAffix();
            this.addSyntaxHighlighting();
        },

        addAffix : function() {
            this.$toc.affix({
                offset : {
                    top: this.$toc.offset().top
                }
            });
        },

        addSyntaxHighlighting : function() {
            $("pre").each(function() {
                $(this).attr('data-language', 'javascript');
            });
        },

        createToc : function() {
            var menu = [];

            this.$content.find("h3").each(function() {
                var $el = $(this);
                var id = $el.attr('id');
                menu.push('<li><a href="#' + id + '">' + $el.text() + '</a></li>');
            });

            this.$toc.find("ul").append( menu.join('') );
        }
    });
})();
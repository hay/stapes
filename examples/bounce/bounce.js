(function() {
    var SCREEN_WIDTH = $(window).width();
    var SCREEN_HEIGHT;

    function rand(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    function range(val, min, max) {
        return (val >= min) && (val <= max);
    }

    function isiOS() {
        return !!navigator.userAgent.match(/(iPad|iPhone|iPod)/i);
    }

    var Sound = Stapes.subclass({
        constructor : function() {
            if (!("Audio" in window)) return;

            $("body").append(''.concat(
                '<audio id="sound">',
                    '<source src="sound.mp3" type="audio/mpeg" />',
                    '<source src="sound.ogg" type="audio/ogg" />',
                '</audio>'
            ));

            this.el = $("#sound").get(0);
        },

        "sprites" : [
            [0, 0.5],
            [1, 1.5],
            [2, 2.5],
            [3, 3.5]
        ],

        "play" : function(index) {
            // Sigh.. iPhone doesn't work
            if (isiOS()) return;

            // And IE < 9 too
            if (!("Audio" in window)) return;

            var data = this.sprites[index];
            var self = this;

            this.el.currentTime = data[0];
            this.el.play();

            (function doPause() {
                setTimeout(function() {
                    if (self.el.currentTime >= data[1]) {
                        self.el.pause();
                    } else {
                        doPause();
                    }
                }, 10);
            })();
        }
    });

    var Ball = Stapes.subclass({
        constructor : function() {
            this.set({
                "direction" : rand(35, 65),
                "x" : rand(50, 900),
                "y" : 1,
                "width" : 20,
                "height" : 20,
                "speed" : 15,
            });
        },

        "getSpeedDirection" : function() {
            var d = this.get('direction');

            // Right.. this should be simpler *somehow*
            function range(min, max) {
                return (d >= min) && (d <= max);
            }

            var x = (d / 25),
                y = 1 - x;

            if (range(0, 25)) {
                y = y * -1;
            }

            if (range(25, 50)) {
                y = y * -1;
                x = x - (y * 2);
            }

            if (range(51, 75)) {
                x = x - 2;
                y = (y * -1) - (x * 2);
                x = x * -1;
            }

            if (range(76, 100)) {
                y = y+ 2;
                x = -1 - y;
            }

            x = x * this.get('speed');
            y = y * this.get('speed');

            return {
                x : Math.round(this.get('x') + x),
                y : Math.round(this.get('y') + y)
            };
        },

        "isOutOfBounds" : function() {
            var x = this.get('x'),
                y = this.get('y');

            return (x < 0) || (x > SCREEN_WIDTH) ||
                   (y < 0) || (y > SCREEN_HEIGHT);
        },

        "move" : function() {
            this.set( this.getSpeedDirection() );
            this.render();
        },

        "render" : function() {
            if (!this.$el) {
                this.$el= $('<div class="ball"></div>').css({
                    "position" : "absolute",
                    "width" : this.get('width'),
                    "height" : this.get('height'),
                    "background-color" : "red"
                });

                $("body").append( this.$el );
            }

            this.$el.css({
                "top" : this.get('y'),
                "left" : this.get('x')
            });
        },

        "reverseDirection" : function() {
            this.update('direction', function(d) {
                d = d - 50;
                if (d < 0) d = d * -1;
                return d;
            });
        }
    });

    var Block = Stapes.subclass({
        "isHit" : function(obj) {
            var a = (obj.getAll) ? (obj.getAll()) : obj,
                b = this.getAll();

            var check = ((a.x > b.x) && (a.y > b.y) && (a.x < (b.x + b.width)) && (a.y < (b.y + b.height)));
            return check;
        },

        "render" : function(id) {
            var $block = $('<div class="block"></div>').css({
                "position" : "absolute",
                "top" : this.get('y'),
                "left" : this.get('x'),
                "width" : this.get('width'),
                "height" : this.get('height'),
                "background-color" : this.get('color')
            });

            $("body").append( $block );
        }
    });

    var Blocks = Stapes.subclass({
        "addBlock" : function(x, y) {
            var block = new Block();
            var self = this;

            block.set({
                "x" : Math.round(x),
                "y" : Math.round(y),
                "color" : "black",
                "width" : Blocks.blockWidth,
                "height" : Blocks.blockHeight
            });

            this.push(block);
            block.render();
        },

        "isHit" : function(obj) {
            return this.get(function(block) {
                return block.isHit(obj);
            });
        }
    });

    Blocks.extend({
        "blockWidth" : 60,
        "blockHeight" : 20
    })

    var Timer = Stapes.subclass({
        "constructor" : function(interval) {
            this.interval = interval;
        },

        start : function() {
            setInterval(function() {
                this.emit('tick');
            }.bind(this), this.interval);
        }
    });

    var Bounce = Stapes.subclass({
        constructor : function() {
            this.blocks = new Blocks();
            this.timer = new Timer( 1000 / 60 );
            this.ball = new Ball();
            this.sound = new Sound();

            this.bindEventHandlers();
            this.timer.start();

            $(this.el).append(''.concat(
                '<pre style="position:fixed;top:0;left:0;width:300px;height:300px;">',
                '</pre>'
            ));
        },

        "el" : $("body").get(0),

        "bindEventHandlers" : function() {
            var self = this;

            $("#wrapper").css('overflow', 'hidden');

            $(this.el).on('click', function(e) {
                if (!$(e.target).is("a, input, textarea, button")) {
                    e.preventDefault();
                    var x = e.pageX - $(self.el).offset().left - Blocks.blockWidth / 2,
                        y = e.pageY - $(self.el).offset().top - Blocks.blockHeight / 2;

                    self.blocks.addBlock(x, y);
                    self.sound.play(2);
                }
            });

            $("#work").height(400);

            SCREEN_HEIGHT = $(this.el).height();

            this.timer.on('tick', function() {
                if (this.ball.isOutOfBounds()) {
                    var x = this.ball.get('x');

                    if (x < 0) {
                        this.ball.set('x', SCREEN_WIDTH - 30);
                    } else if (x > SCREEN_WIDTH) {
                        this.ball.set('x', 20);
                    } else {
                        this.sound.play(0);
                        this.ball.reverseDirection();
                    }
                }

                var hittedBlock = this.blocks.isHit( this.ball );

                if (hittedBlock) {
                    hittedBlock.set('color', 'green');
                    hittedBlock.render();
                    this.sound.play(1);
                    this.ball.reverseDirection();
                }

                this.ball.move();
            }, this);
        }
    });

    window.bounce = new Bounce();
})();
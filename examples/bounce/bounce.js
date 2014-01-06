// .bind shim for IE8
if (!Function.prototype.bind) {
    Function.prototype.bind = function(context) {
        var self = this;
        return function() {
            return self.apply(context, arguments);
        };
    };
}

(function() {
    var SCREEN_WIDTH = $(window).width();
    var SCREEN_HEIGHT;

    var util = {
        rand : function(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        },

        isiOS : function() {
            return !!navigator.userAgent.match(/(iPad|iPhone|iPod)/i);
        }
    };

    var Sound = Stapes.subclass({
        constructor : function(id) {
            if (!("Audio" in window)) return;

            $("body").append(''.concat(
                '<audio id="sound">',
                    '<source src="sound.mp3" type="audio/mpeg" />',
                    '<source src="sound.ogg" type="audio/ogg" />',
                '</audio>'
            ));

            this.el = $("#sound").get(0);

            this.el.addEventListener('timeupdate', function(e) {
                if (this.el.currentTime >= this.playRange[1]) {
                    this.el.pause();
                }
            }.bind(this), false);

            this.playRange = this.sprites[id];
        },

        "sprites" : [
            [0, 0.5],
            [1, 1.5],
            [2, 2.5],
            [3, 3.5]
        ],

        "play" : function() {
            // Sigh.. iPhone and IE9 don't work
            if (util.isiOS() || !("Audio" in window)) return;

            this.el.currentTime = this.playRange[0];
            this.el.play();
        }
    });

    var Ball = Stapes.subclass({
        constructor : function() {
            this.set({
                "direction" : util.rand(35, 65),
                "x" : util.rand(50, 900),
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
            this.sound1 = new Sound(0);
            this.sound2 = new Sound(1);

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
                    self.sound2.play();
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
                        this.sound1.play();
                        this.ball.reverseDirection();
                    }
                }

                var hittedBlock = this.blocks.isHit( this.ball );

                if (hittedBlock) {
                    hittedBlock.set('color', 'green');
                    hittedBlock.render();
                    this.sound2.play();
                    this.ball.reverseDirection();
                }

                this.ball.move();
            }, this);
        }
    });

    window.bounce = new Bounce();
})();
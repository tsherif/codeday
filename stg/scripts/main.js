define([ 'jquery', 'underscore', 'backbone', 'color', 'socialite' ], function( $, _, Backbone, Color, Socialite  ) {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };

    var LadyGenerator = Backbone.View.extend({
        baseColors: {
            hair:  ['#000000', '#000000', '#000000', '#fff02a', '#fff02a', '#a7a9ac', '#754c2c', '#754c2c', '#754c2c'],
            flesh: ['#A7744E', '#E0A16B', '#D8835A', '#FCC295', '#E0A16B', '#FDC485']
        },
        ladyWidth: 200,
        speed: 0.1, // pixels per ms 

        initialize: function(opts) {
            var self = this;

            _.bindAll(self);

            self.$container = opts.$container;

            self.$ladyForms = $('#lady-forms', self.$container);
            self.$destination = $('#lady-world', self.$container).children().first();
            self.ladyCounter = 0;
            self.running = false;
            self.rafHandle = null;
            self.lastTime = Date.now();

            self.pos = 0;
            self.$firstLady = null;

            self.$window = $(window);

            self.currentLadyCount = 0;
            self.resizeHandler();
        },

        events: {
            "resize": "resizeHandler"
        },

        resizeHandler: function(e) {
            var self = this;

            self.desiredLadyCount = Math.floor(self.$window.width() / self.ladyWidth) + 2;
            self.updateLadies();
        },

        updateLadies: function() {
            var self = this;

            if (self.desiredLadyCount > self.currentLadyCount) {
                // need more ladies, let's generate some
                for (var i = self.currentLadyCount; i < self.desiredLadyCount; i++) {
                    var $newLady = self.generateLady();

                    if (!self.$firstLady)
                        self.$firstLady = $newLady;

                    $newLady.appendTo(self.$destination);
                }

            } else if (self.desiredLadyCount < self.currentLadyCount) {
                // too many ladies, let's optimize

                for (var i = self.currentLadyCount; i > self.desiredLadyCount; i--) {
                    $('.lady', self.$desination).eq(i - 1).remove();
                }

            }

            self.currentLadyCount = self.desiredLadyCount;
        },

        generateLady: function() {
            var self = this;
            var $newLady = $('<article>')
                                .addClass('lady'); 


            var $instance  = self.$ladyForms.children().eq(_.random(self.$ladyForms.children().length - 1)).clone();

            var hairColor  = self.tweakColor(self.baseColors.hair[_.random(self.baseColors.hair.length - 1)], 'hair');
            var fleshColor = self.tweakColor(self.baseColors.flesh[_.random(self.baseColors.flesh.length - 1)], 'flesh');

            $('g', $instance).each(function() {
                var $el = $(this);

                if ($el.attr('id') && $el.attr('id').length) {
                    if ($el.attr('id').match(/^Skin/)) {
                        $el.find('*').each(function() {
                            var $shape = $(this);

                            if (!$shape.is('g')) {
                                $shape.attr('style', 'fill:'+fleshColor+';');
                            }
                        });
                    } else if ($el.attr('id').match(/^Hair/)) {
                        $el.find('*').each(function() {
                            var $shape = $(this);

                            if (!$shape.is('g')) {
                                $shape.attr('style', 'fill:'+hairColor+';');
                            }
                        });
                    }

                    $el.attr('id', $el.attr('id') + '--' + self.ladyCounter)
                }
            });

            $instance
                    .appendTo($newLady);


            self.ladyCounter++;

            return $newLady;
        },

        tweakColor: function(color, type) {
            var c = Color(color);

            var max_factors = {
                hair: 15,
                flesh: 8
            };
            var factor = _.random(max_factors[type])/100;

            var functions = [
                c.lightenByAmount,
                c.darkenByAmount
            ];

            var operation = functions[_.random(functions.length - 1)];
            return operation.call(c, factor);
        },

        run: function() {
            var self = this;

            if (!self.running) {
                self.running = true;
                self.rafHandle = requestAnimationFrame(self.step);
            }
        },

        stop: function() {
            var self = this;

            if (self.running) {
                self.running = false;
                if (self.rafHandle && cancelAnimationFrame)
                    cancelAnimationFrame(self.rafHandle);
            }
        },

        step: function() {
            var self = this;

            if (self.running) {
                var threshold = self.$firstLady.width();

                if (self.pos * -1 >= threshold) {
                    var $newLady = self.generateLady();
                    $newLady.appendTo(self.$destination);
                    self.$firstLady.remove();

                    self.$firstLady = self.$destination.children().first();

                    self.pos += threshold;
                }

                var currentTime = Date.now();
                var distance = (currentTime - self.lastTime) * self.speed;

                var value = 'translate3d(' + (self.pos) + 'px' + ', 0, 0)';

                self.$destination.css({
                    webkitTransform: value,
                    MozTransform: value,
                    transform: value
                });

                self.pos -= distance;
                self.lastTime = currentTime;

                self.rafHandle = requestAnimationFrame(self.step);
            }
        }
    });

    var IndicatorHandler = Backbone.View.extend({
        triggerDelay: 4000,
        nagDelay: 300,

        events: {
            "scroll": "scrollHandler"
        },

        initialize: function(opts) {
            var self = this;

            _.bindAll(self);

            self.$html = opts.$html;
            self.$indicator = opts.$indicator; 
        },

        run: function() {
            var self = this;

            if (self.$el.scrollTop() == 0 && !self.$html.hasClass('ie')) {
                self.$html.addClass('ready');
                self.hasScrolled = false;

                self.triggerHandle = setTimeout(function() {
                        self.hasAnimated = true;

                        self.$indicator
                            .attr('class', 'positioned');
                            
                        setTimeout(function() {
                            self.$indicator
                                    .attr('class', 'positioned nagging');
                        }, self.nagDelay);
                    }, self.triggerDelay);
            } else {
                self.$html.addClass('instant');
                self.hasScrolled = true;
            }
        },

        scrollHandler: function(e) {
            var self = this;

            if (!self.hasAnimated) {
                if (self.triggerHandle)
                    clearTimeout(self.triggerHandle);
            } else {
                self.$indicator.attr('class', '');
            }


            self.hasScrolled = true;
        }
    });

    var SocialHandler = Backbone.View.extend({
        threshold: 100,

        events: {
            "scroll": "update",
            "resize": "update"
        },

        initialize: function(opts) {
            var self = this;

            _.bindAll(self);

            self.$social = opts.$container;
            self.initialized = false;
            self.running = false;
        },

        update: function(e) {
            var self = this;
            
            if (self.running && !self.initialized) {
                var $window = self.$el;
                var offset = self.$social.offset().top;

                if ($window.scrollTop() + $window.height() > offset - self.threshold) {
                    Socialite.load(self.$social);

                    self.initialized = true;
                }
            }
        },

        run: function() {
            var self = this;

            self.running = true;

            self.update();
        }
    });

    $(function() {
        var $html      = $('html');
        var $window    = $(window);
        var $indicator = $('#scroll-indicator');
        var $hundreds  = $('#hundreds');
        var $social    = $('#social');

        $hundreds.data('controller', new LadyGenerator({ el: $window, $container: $hundreds }));
        $hundreds.data('controller').run();

        $window.data('controller', new IndicatorHandler({ el: $window, $html: $html, $indicator: $indicator }));
        $window.data('controller').run();

        $social.data('controller', new SocialHandler({ el: $window, $container: $social }));
        $social.data('controller').run();
    });
});

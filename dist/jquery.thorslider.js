/*
 *  ThorSlider - v0.0.1
 *  A jump-start for jQuery plugins development.
 *  http://arnaudritti.github.io/ThorSlider/
 *
 *  Made by Arnaud Ritti
 *  Under MIT License
 */
// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

	"use strict";
		// undefined is used here as the undefined global variable in ECMAScript 3 is
		// mutable (ie. it can be changed by someone else). undefined isn"t really being
		// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
		// can no longer be modified.

		// window and document are passed through as local variable rather than global
		// as this (slightly) quickens the resolution process and can be more efficiently
		// minified (especially when both are regularly referenced in your plugin).

		// Create the defaults once
		var pluginName = "thorSlider",
				defaults = {
					speed: 800,
					infinite: true,
					easing: "linear",
					fade: false,
					dots: true,
					arrows: true,
					nextArrow: "thor-next",
					prevArrow: "thor-prev",
					upArrow: "thor-up",
					downArrow: "thor-down",
					autoplay: false,
					autoplaySpeed: 1000,
					touch: true,
					pauseOnHover: true
		};

		var self;

		// The actual plugin constructor
		function ThorSlider ( element, options ) {


				this.element = element;
				// jQuery has an extend method which merges the contents of two or
				// more objects, storing the result in the first object. The first object
				// is generally empty as we don"t want to alter the default options for
				// future instances of the plugin
				this.settings = jQuery.extend( {}, defaults, options );
				this._defaults = defaults;
				this._name = pluginName;

				this.initials = {
	        currSlide : 0,
	        $currSlide: null,
	        totalSlides : false,
	      };
				jQuery("body")
					.on("click","."+this.settings.nextArrow+"",{direction:"right"},this.changeSlide)
					.on("click","."+this.settings.prevArrow+"",{direction:"left"},this.changeSlide)
					.on("click","."+this.settings.upArrow+"",{direction:"top"},this.changeSlide)
					.on("click","."+this.settings.downArrow+"",{direction:"bottom"},this.changeSlide)
					.on("click",".thor-dots li",this.changeSlide);

				this.init();

		}

		var _next = function (e,direction) {
			// If the event was triggered by a slide indicator, we store the data-index value of that indicator
			var index = (typeof e !== "undefined" ? jQuery(e.currentTarget).data("index") : undefined);

			//Logic for determining the next slide
			switch(true){
				//If the event was triggered by an indicator, we set the next slide based on index
				 case( typeof index !== "undefined"):
					if (self.currSlide === index){
						self.startTimer();
						return false;
					}
					self.currSlide = index;
				break;
				case(direction === "right" && self.currSlide < (self.totalSlides - 1)):
					self.currSlide++;
				break;
				case(direction === "right"):
					self.currSlide = 0;
				break;
				case(direction === "top" && self.currSlide < (self.totalSlides - 1)):
					self.currSlide++;
				break;
				case(direction === "top"):
					self.currSlide = 0;
				break;
				case(direction === "left" && self.currSlide === 0):
					self.currSlide = (self.totalSlides - 1);
				break;
				case(direction === "left"):
					self.currSlide--;
				break;
				case(direction === "bottom" && self.currSlide === 0):
					self.currSlide = (self.totalSlides - 1);
				break;
				case(direction === "bottom"):
					self.currSlide--;
				break;
			}
			return true;
		};

		// Avoid Plugin.prototype conflicts
		jQuery.extend(ThorSlider.prototype, {
				init: function () {
						// Place initialization logic here
						// You already have access to the DOM element and
						// the options via the instance, e.g. self.element
						// and this.settings
						// you can add more functions like the one below and
						// call them like so: self.yourOtherFunction(self.element, this.settings).
						self = this;
						this.$el = jQuery(this.element);
						this.$el.addClass("thor-slider");

						if(this.settings.dots){
							var indicators = this.$el.append("<ul class=\"thor-dots\" >").find(".thor-dots");
							this.totalSlides = this.$el.find(".thor-slide").length;
							for(var i = 0; i < this.totalSlides; i++) {indicators.append("<li data-index=\""+i+"\" "+(i === 0 ? "class=\"active\"" : "")+">");}
						}

						if(this.settings.arrows){
							var arrows = self.$el.append("<div class=\"thor-arrows\" >").find(".thor-arrows");
							self.totalSlides = self.$el.find(".thor-slide").length;
							arrows.append("<button class=\""+this.settings.upArrow+"\">Up</button>");
							arrows.append("<button class=\""+this.settings.prevArrow+"\">Prev</button>");
							arrows.append("<button class=\""+this.settings.nextArrow+"\">Next</button>");
							arrows.append("<button class=\""+this.settings.downArrow+"\">Down</button>");
						}

						if(this.settings.autoplay){
							this.startTimer();
						}


						this.currSlide = 0;
						this.$currSlide = this.$el.find(".thor-slide").eq(0);
						this.$currSlide.addClass("active");
				},
				initTimer: function () {
					if (this.timer) {clearInterval(this.timer);}
					this.timer = setInterval(this.changeSlide, this.settings.autoplaySpeed);
				},
				startTimer: function () {
					this.initTimer();
					this.throttle = false;
				},
				clearTimer: function () {
					if (this.timer) {clearInterval(this.timer);}
				},
				changeSlide: function (e) {

					//Ensure that animations are triggered one at a time
					if (self.throttle) {return;}
					this.throttle = true;

					if(self.settings.autoplay){
						//Stop the timer as the animation is getting carried out
						if (this.timer) {this.clearTimer();}
					}


					// Returns the animation direction (left or right)
					var dir;
					if (typeof e !== "undefined"){dir = (typeof e.data === "undefined" ? "right" : e.data.direction);
				} else {dir = "right";}

					// Selects the next slide
					var animate = _next(e,dir);
					if (!animate) {return;}

					//Active the next slide to scroll into view
					var $nextSlide = self.$el.find(".thor-slide").eq(self.currSlide);
					$nextSlide.addClass(dir + " active");
					self._jsAnimation($nextSlide,dir);
				},
				_jsAnimation: function ($nextSlide,direction) {
					//Cache this reference for use inside animate functions

					var _ = this;


			     var animation = {};
					animation[direction] = "0%";

					var animationPrev = {};
					animationPrev[direction] = "100%";

					//Animation: Current slide
					self.$currSlide.animate({opacity: "0"},self.settings.speed);
					//Animation: Next slide
					$nextSlide.animate({opacity: "1"},this.settings.speed,"swing",function(){

						//Get rid of any JS animation residue
						self.$currSlide.removeClass("active");
						//Cache the next slide after classes and inline styles have been removed
						self.$currSlide = $nextSlide.removeClass(direction);
						_._updateIndicators();
						if(_.settings.autoplay){
							_.startTimer();
						}
					});
				},
				_updateIndicators: function () {
					self.$el.find(".thor-dots li").removeClass("active").eq(self.currSlide).addClass("active");
				}
		});

		// A really lightweight plugin wrapper around the constructor,
		// preventing against multiple instantiations
		jQuery.fn[ pluginName ] = function ( options ) {
				return this.each(function() {
						if ( !jQuery.data( this, "plugin_" + pluginName ) ) {
								jQuery.data( this, "plugin_" + pluginName, new ThorSlider( this, options ) );
						}
				});
		};

})( jQuery, window, document );

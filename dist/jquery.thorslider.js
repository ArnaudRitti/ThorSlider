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
					speed: 300,
					infinite: true,
					easing: "linear",
					fade: false,
					dots: true,
					arrows: true,
					nextArrow: "thor-next",
					prevArrow: "thor-prev",
					autoplay: false,
					autoplaySpeed: 3000,
					touch: true,
					pauseOnHover: true
		};

		// The actual plugin constructor
		function Plugin ( element, options ) {
				this.element = element;
				// jQuery has an extend method which merges the contents of two or
				// more objects, storing the result in the first object. The first object
				// is generally empty as we don"t want to alter the default options for
				// future instances of the plugin
				this.settings = $.extend( {}, defaults, options );
				this._defaults = defaults;
				this._name = pluginName;

				this.initials = {
	        currSlide : 0,
	        $currSlide: null,
	        totalSlides : false,
	      };

				this.init();
		}

		// Avoid Plugin.prototype conflicts
		$.extend(Plugin.prototype, {
				init: function () {
						// Place initialization logic here
						// You already have access to the DOM element and
						// the options via the instance, e.g. this.element
						// and this.settings
						// you can add more functions like the one below and
						// call them like so: this.yourOtherFunction(this.element, this.settings).
						console.log(this.element);
						this.$el = $(this.element);
						this.$el.addClass("thor-slider");

						if(this.settings.dots){
							var indicators = this.$el.append("<ul class=\"thor-dots\" >").find(".thor-slide");
							this.totalSlides = this.$el.find(".thor-slide").length;
							for(var i = 0; i < this.totalSlides; i++) {indicators.append("<li data-index=\""+i+"\">");}
						}

						$("body")
							.on("click",this.settings.nextArrow,{direction:"right"},this.changeSlide)
							.on("click",this.settings.prevArrow,{direction:"left"},this.changeSlide)
							.on("click",".thor-dots li",this.changeSlide);

						this.$currSlide = this.$el.find(".thor-slide").eq(0);
						this.$el.find(".thor-dots li").eq(0).addClass("active");
				},
				initTimer: function () {
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
					if (this.throttle) {return;}
					this.throttle = true;

					//Stop the timer as the animation is getting carried out
					this.clearTimer();

					// Returns the animation direction (left or right)
					var direction = this._direction(e);

					// Selects the next slide
					var animate = this._next(e,direction);
					if (!animate) {return;}

					//Active the next slide to scroll into view
					var $nextSlide = this.$el.find(".slide").eq(this.currSlide).addClass(direction + " active");

					this._jsAnimation($nextSlide,direction);
				},
				_direction: function(e){
					var direction;

					// Default to forward movement
					if (typeof e !== "undefined"){
						direction = (typeof e.data === "undefined" ? "right" : e.data.direction);
					} else {
						direction = "right";
					}
					return direction;
				},
				_next: function (e,direction) {
					// If the event was triggered by a slide indicator, we store the data-index value of that indicator
					var index = (typeof e !== "undefined" ? $(e.currentTarget).data("index") : undefined);

					//Logic for determining the next slide
					switch(true){
						//If the event was triggered by an indicator, we set the next slide based on index
						 case( typeof index !== "undefined"):
							if (this.currSlide === index){
								this.startTimer();
								return false;
							}
							this.currSlide = index;
						break;
						case(direction === "right" && this.currSlide < (this.totalSlides - 1)):
							this.currSlide++;
						break;
						case(direction === "right"):
							this.currSlide = 0;
						break;
						case(direction === "left" && this.currSlide === 0):
							this.currSlide = (this.totalSlides - 1);
						break;
						case(direction === "left"):
							this.currSlide--;
						break;
					}
					return true;
				},
				_jsAnimation: function ($nextSlide,direction) {
					//Cache this reference for use inside animate functions
					var _ = this;

			     // See CSS for explanation of .js-reset-left
					if(direction === "right") {_.$currSlide.addClass("js-reset-left");}

			     var animation = {};
					animation[direction] = "0%";

					var animationPrev = {};
					animationPrev[direction] = "100%";

					//Animation: Current slide
					this.$currSlide.animate(animationPrev,this.settings.speed);

					//Animation: Next slide
					$nextSlide.animate(animation,this.settings.speed,"swing",function(){
						//Get rid of any JS animation residue
						_.$currSlide.removeClass("active js-reset-left").attr("style","");
						//Cache the next slide after classes and inline styles have been removed
						_.$currSlide = $nextSlide.removeClass(direction).attr("style","");
						_._updateIndicators();
						_.startTimer();
					});
				},
				_updateIndicators: function () {
					this.$el.find(".indicators li").removeClass("active").eq(this.currSlide).addClass("active");
				}
		});

		// A really lightweight plugin wrapper around the constructor,
		// preventing against multiple instantiations
		$.fn[ pluginName ] = function ( options ) {
				return this.each(function() {
						if ( !$.data( this, "plugin_" + pluginName ) ) {
								$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
						}
				});
		};

})( jQuery, window, document );

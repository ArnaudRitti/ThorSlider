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
					autoplay: true,
					autoplaySpeed: 5000,
					arrows_bg : false
				};

				var	support = Modernizr.csstransitions,
	// transition end event
	// https://github.com/twitter/bootstrap/issues/2870
	transEndEventNames = {
		"WebkitTransition" : "webkitTransitionEnd",
		"MozTransition" : "transitionend",
		"OTransition" : "oTransitionEnd",
		"msTransition" : "MSTransitionEnd",
		"transition" : "transitionend"
	},
	// its name
	transEndEventName = transEndEventNames[ Modernizr.prefixed( "transition" ) ];
	var _ = this;

		// The actual plugin constructor
		function ThorSlider ( element, options ) {
				this.element = element;
				// jQuery has an extend method which merges the contents of two or
				// more objects, storing the result in the first object. The first object
				// is generally empty as we don"t want to alter the default options for
				// future instances of the plugin
				this.settings = $.extend( {}, defaults, options );
				this._defaults = defaults;
				this._name = pluginName;


				this.$container = $(this.element),
				this.$contentwrapper = this.$container.children( "div.ts-contentwrapper" ),
				// the items (description elements for the slides/products)
				this.$items = this.$contentwrapper.children( "div.ts-content" ),
				this.itemsCount = this.$items.length,
				this.$slidewrapper = this.$container.children( "div.ts-slidewrapper" ),
				// the slides (product images)
				this.$slidescontainer = this.$slidewrapper.find( "div.ts-slides" ),
				this.$slides = this.$slidescontainer.children( "div" ),
				// navigation arrows
				this.$navprev = this.$slidewrapper.find( "nav > a.ts-prev" ),
				this.$navnext = this.$slidewrapper.find( "nav > a.ts-next" ),
				// this.current index for items and slides
				this.current = 0,
				// checks if the transition is in progress
				this.isAnimating = false;


				this.init();
		}

		// Avoid Plugin.prototype conflicts
		$.extend(ThorSlider.prototype, {
				init: function () {

					_ = this;

					// show first item
						var $currentItem = _.$items.eq( this.current ),
							$currentSlide = _.$slides.eq( this.current ),
							initCSS = {
								top : 0,
								zIndex : 999
							};
						$currentItem.css( initCSS );
						$currentSlide.css( initCSS );

						if(_.settings.autoplay){
							_.initTimer();
						}

						// update nav images
						_.updateNavImages();

						// initialize some events
						_.initEvents();
				},
				initTimer: function () {
					_.timer = setInterval(function() {
						_.slide("next");
					}, _.settings.autoplaySpeed);
				},
				startTimer: function () {
					_.initTimer();
				},
				clearTimer: function () {
					if (_.timer) {clearInterval(_.timer);}
				},
				updateNavImages : function () {


					if(_.settings.arrows_bg){
						// updates the background image for the navigation arrows
						var configPrev = ( _.current > 0 ) ? _.$slides.eq( _.current - 1 ).css( "background-image" ) : _.$slides.eq( _.itemsCount - 1 ).css( "background-image" ),
							configNext = ( _.current < _.itemsCount - 1 ) ? _.$slides.eq( _.current + 1 ).css( "background-image" ) : _.$slides.eq( 0 ).css( "background-image" );

						_.$navprev.css( "background-image", configPrev );
						_.$navnext.css( "background-image", configNext );
					}
				},
				initEvents : function () {
					_.$navprev.on( "click", function( ) {
						if( !_.isAnimating ) {
							_.clearTimer();
							_.slide( "prev" );
						}
						return false;
					} );

					_.$navnext.on( "click", function( ) {
						if( !_.isAnimating ) {
							_.clearTimer();
							_.slide( "next" );
						}
						return false;
					} );


					// transition end event
					_.$items.on( transEndEventName, _.removeTransition );
					_.$slides.on( transEndEventName, _.removeTransition );
				},
				removeTransition : function () {
					_.isAnimating = false;
					$(this).removeClass("ts-move");
				},
				slide : function (dir) {


					_.isAnimating = true;


					var $currentItem = _.$items.eq( _.current ),
						$currentSlide = _.$slides.eq( _.current );

					// update this.current value
					if( dir === "next" ) {
						( _.current < _.itemsCount - 1 ) ? ++_.current : _.current = 0;
					}
					else if( dir === "prev" ) {
						( _.current > 0 ) ? --_.current : _.current = _.itemsCount - 1;
					}
						// new item that will be shown
					var $newItem = _.$items.eq( _.current ),
						// new slide that will be shown
						$newSlide = _.$slides.eq( _.current );

					// position the new item up or down the viewport depending on the direction
					$newItem.css( {
						top : ( dir === "next" ) ? "-100%" : "100%",
						zIndex : 999
					} );

					$newSlide.css( {
						top : ( dir === "next" ) ? "100%" : "-100%",
						zIndex : 999
					} );

					setTimeout( function() {

						// move the this.current item and slide to the top or bottom depending on the direction
						$currentItem.addClass( "ts-move" ).css( {
							top : ( dir === "next" ) ? "100%" : "-100%",
							zIndex : 1
						} );

						$currentSlide.addClass( "ts-move" ).css( {
							top : ( dir === "next" ) ? "-100%" : "100%",
							zIndex : 1
						} );

						// move the new ones to the main viewport
						$newItem.addClass( "ts-move" ).css( "top", 0 );
						$newSlide.addClass( "ts-move" ).css( "top", 0 );

						// if no CSS transitions set the isAnimating flag to false
						if( !support ) {
							isAnimating = false;
						}



						// update nav images
						_.updateNavImages();


					}, 0 );


					_.startTimer();



				}
		});

		// A really lightweight plugin wrapper around the constructor,
		// preventing against multiple instantiations
		$.fn[ pluginName ] = function ( options ) {
				return this.each(function() {
						if ( !$.data( this, "plugin_" + pluginName ) ) {
								$.data( this, "plugin_" + pluginName, new ThorSlider( this, options ) );
						}
				});
		};

})( jQuery, window, document );

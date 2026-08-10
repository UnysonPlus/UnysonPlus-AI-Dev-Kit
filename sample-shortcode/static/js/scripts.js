/**
 * Sample Shortcode — front-end behaviour.
 *
 * ============================================================================
 * THE ONE RULE: SCOPE TO THE INSTANCE.
 * ============================================================================
 * A source demo owns the whole document, so it is written with
 * `document.querySelector('.next')` — which finds the FIRST match on the page
 * and nothing else. Drop two copies of that element on one page and the
 * second one's buttons drive the first one.
 *
 * The fix, used throughout this file:
 *   · select all roots with querySelectorAll
 *   · inside the per-root function, query from `root`, never from `document`
 *   · mark each root as initialised so a re-init (AJAX, the live editor) does
 *     not double-bind
 *
 * The framework does not impose a JS framework. Vanilla is fine, and is
 * preferred — it keeps the element dependency-free.
 * ============================================================================
 */

( function () {
	'use strict';

	var ROOT_SELECTOR = '.sample-shortcode';
	var INIT_FLAG = 'ssInitialised';   // becomes data-ss-initialised

	/**
	 * Initialise ONE instance. Everything is queried from `root`.
	 *
	 * @param {HTMLElement} root the element's outer wrapper
	 */
	function initInstance( root ) {
		// Guard against double-binding. This runs again whenever content is
		// injected after load, and binding twice makes every click fire twice.
		if ( root.dataset[ INIT_FLAG ] === '1' ) {
			return;
		}
		root.dataset[ INIT_FLAG ] = '1';

		/*
		 * Read configuration from data-* attributes set by view.php. Never
		 * from an inline <script> block: no inline script keeps the page
		 * CSP-friendly and this file cacheable.
		 *
		 * Everything arrives as a STRING — parse it.
		 */
		// var autoplay = root.dataset.autoplay === '1';
		// var interval = parseInt( root.dataset.interval, 10 ) || 5000;

		/*
		 * Scoped queries. Note `root.querySelector`, NOT `document.querySelector`.
		 */
		// var buttons = root.querySelectorAll( '.sample-shortcode__button' );

		// …behaviour goes here.
	}

	/**
	 * Find and initialise every instance in a subtree.
	 *
	 * @param {ParentNode} [scope] defaults to the document
	 */
	function initAll( scope ) {
		( scope || document ).querySelectorAll( ROOT_SELECTOR ).forEach( initInstance );
	}

	/*
	 * Boot. The script is enqueued in the footer, so the DOM is usually
	 * already parsed — but check, because a plugin may have moved it.
	 */
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', function () {
			initAll();
		} );
	} else {
		initAll();
	}

	/*
	 * Re-initialise for content added after load — the live editor, AJAX
	 * pagination, a modal opening. Without this the element works on page
	 * load and appears broken everywhere else.
	 */
	document.addEventListener( 'fw:sample-shortcode:refresh', function ( e ) {
		initAll( e.detail && e.detail.scope );
	} );
} )();


/* ============================================================================
 * REFERENCE BLOCK — commented out. Nothing below runs.
 * ==========================================================================*/

/*
 * REDUCED MOTION. Check it in JS too, not just CSS: a timer that advances
 * content is motion even when the transition is disabled. Respect the
 * preference by not starting the timer at all.
 *
 *   var reduced = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
 *   if ( autoplay && ! reduced ) { start(); }
 */

/*
 * AUTOPLAY, done properly. Pause on hover AND on keyboard focus — a
 * keyboard user who tabs into the element must not have it move under them.
 * Also pause when the tab is hidden, so a backgrounded page is not burning
 * cycles.
 *
 *   var timer = null;
 *   function start() { stop(); timer = window.setInterval( next, interval ); }
 *   function stop()  { if ( timer ) { window.clearInterval( timer ); timer = null; } }
 *
 *   root.addEventListener( 'mouseenter', stop );
 *   root.addEventListener( 'mouseleave', start );
 *   root.addEventListener( 'focusin', stop );
 *   root.addEventListener( 'focusout', start );
 *   document.addEventListener( 'visibilitychange', function () {
 *       document.hidden ? stop() : start();
 *   } );
 */

/*
 * DELEGATED CLICKS. One listener on the root instead of one per button, so
 * controls added later still work. `closest` is scoped to the root's subtree
 * because the event only fires for descendants of root.
 *
 *   root.addEventListener( 'click', function ( e ) {
 *       var btn = e.target.closest( '[data-dir]' );
 *       if ( ! btn ) { return; }
 *       btn.dataset.dir === 'prev' ? prev() : next();
 *   } );
 */

/*
 * KEYBOARD. If the element has a visual next/previous concept, arrow keys
 * should drive it once it has focus. Give the root `tabindex="0"` and an
 * accessible name in view.php if you do this.
 *
 *   root.addEventListener( 'keydown', function ( e ) {
 *       if ( e.key === 'ArrowLeft' )  { prev(); }
 *       if ( e.key === 'ArrowRight' ) { next(); }
 *   } );
 */

/*
 * TOUCH / SWIPE, without a library.
 *
 *   var startX = 0;
 *   root.addEventListener( 'touchstart', function ( e ) {
 *       startX = e.changedTouches[ 0 ].clientX;
 *   }, { passive: true } );
 *   root.addEventListener( 'touchend', function ( e ) {
 *       var dx = e.changedTouches[ 0 ].clientX - startX;
 *       if ( Math.abs( dx ) > 40 ) { dx < 0 ? next() : prev(); }
 *   }, { passive: true } );
 */

/*
 * DOM-ORDER ANIMATION — a technique worth knowing, because several popular
 * slider demos are built on it and it ports cleanly.
 *
 * If the CSS positions children by `:nth-child()` and puts a `transition` on
 * the child itself, then simply MOVING a node in the DOM animates every other
 * node to its new slot. The JS does no styling and computes no positions:
 *
 *   function next() { track.appendChild( track.firstElementChild ); }
 *   function prev() { track.prepend( track.lastElementChild ); }
 *
 * Two things a demo version usually gets wrong, both worth fixing in a port:
 *   · it queries `document`, so it breaks with two instances (see above);
 *   · moving a focused element in the DOM drops focus. If the user clicked a
 *     control, restore focus afterwards.
 */

/*
 * LAZY / EXPENSIVE WORK. If the element does something costly (canvas, WebGL,
 * an observer per child), only start once it is near the viewport.
 *
 *   var io = new IntersectionObserver( function ( entries ) {
 *       entries.forEach( function ( entry ) {
 *           if ( entry.isIntersecting ) { io.unobserve( entry.target ); begin(); }
 *       } );
 *   }, { rootMargin: '200px' } );
 *   io.observe( root );
 */

/*
 * DO NOT:
 *   · document.querySelector(...)      breaks with two instances on a page
 *   · document.getElementById(...)     same, plus ids must not be hardcoded
 *   · element.style.left = '...'       fights the stylesheet; set a class or a
 *                                      custom property instead
 *   · load a library from a CDN        a ported element adds no external
 *                                      request; vendor it or reuse a handle
 *                                      another element already registers
 *   · assume jQuery is present         it is not a dependency unless you
 *                                      declare it in static.php
 */

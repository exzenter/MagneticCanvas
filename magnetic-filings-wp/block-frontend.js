( function () {
	'use strict';

	function initCanvas( canvas ) {
		var ctx = canvas.getContext( '2d' );
		var filingColor = canvas.dataset.filingColor || '#e0e0e0';
		var filingLength = parseInt( canvas.dataset.filingLength, 10 ) || 20;
		var filingWidth = parseInt( canvas.dataset.filingWidth, 10 ) || 2;
		var cols = parseInt( canvas.dataset.cols, 10 ) || 20;
		var rows = parseInt( canvas.dataset.rows, 10 ) || 20;
		var half = filingLength / 2;
		var smoothness = 0.25;

		var filings = [];
		var mouse = { x: 0, y: 0 };
		var targetMouse = { x: 0, y: 0 };
		var canvasWidth = 0;
		var canvasHeight = 0;
		var animationId = null;
		var isVisible = false;
		var canvasRect = null;

		function setup() {
			var dpr = window.devicePixelRatio || 1;
			var rect = canvas.getBoundingClientRect();
			canvas.width = rect.width * dpr;
			canvas.height = rect.height * dpr;
			ctx.scale( dpr, dpr );

			canvasWidth = rect.width;
			canvasHeight = rect.height;
			canvasRect = rect;

			var spacingX = canvasWidth / cols;
			var spacingY = canvasHeight / rows;

			filings = [];
			for ( var r = 0; r < rows; r++ ) {
				for ( var c = 0; c < cols; c++ ) {
					filings.push( {
						x: ( c + 0.5 ) * spacingX,
						y: ( r + 0.5 ) * spacingY,
						angle: 0,
						targetAngle: 0,
					} );
				}
			}

			mouse.x = targetMouse.x = canvasWidth / 2;
			mouse.y = targetMouse.y = canvasHeight / 2;
		}

		function update() {
			mouse.x += ( targetMouse.x - mouse.x ) * smoothness;
			mouse.y += ( targetMouse.y - mouse.y ) * smoothness;

			for ( var i = 0, len = filings.length; i < len; i++ ) {
				var f = filings[ i ];
				var dx = mouse.x - f.x;
				var dy = mouse.y - f.y;
				f.targetAngle = Math.atan2( dy, dx );

				var diff = f.targetAngle - f.angle;
				diff = ( ( diff + Math.PI ) % ( Math.PI * 2 ) + Math.PI * 2 ) % ( Math.PI * 2 ) - Math.PI;
				f.angle += diff * smoothness;
			}
		}

		function draw() {
			ctx.clearRect( 0, 0, canvasWidth, canvasHeight );
			ctx.strokeStyle = filingColor;
			ctx.lineWidth = filingWidth;
			ctx.lineCap = 'round';

			ctx.beginPath();
			for ( var i = 0, len = filings.length; i < len; i++ ) {
				var f = filings[ i ];
				var cos = Math.cos( f.angle );
				var sin = Math.sin( f.angle );
				var dx = cos * half;
				var dy = sin * half;
				ctx.moveTo( f.x - dx, f.y - dy );
				ctx.lineTo( f.x + dx, f.y + dy );
			}
			ctx.stroke();
		}

		function animate() {
			if ( ! isVisible ) return;
			update();
			draw();
			animationId = requestAnimationFrame( animate );
		}

		// Intersection Observer — only animate when visible
		var observer = new IntersectionObserver( function ( entries ) {
			var visible = entries[ 0 ].isIntersecting;
			if ( visible && ! isVisible ) {
				isVisible = true;
				animate();
			} else if ( ! visible ) {
				isVisible = false;
				if ( animationId ) {
					cancelAnimationFrame( animationId );
					animationId = null;
				}
			}
		}, { threshold: 0 } );
		observer.observe( canvas );

		// Mouse tracking — listen on entire document so filings react to cursor anywhere on the page
		document.addEventListener( 'mousemove', function ( e ) {
			var rect = canvas.getBoundingClientRect();
			targetMouse.x = e.clientX - rect.left;
			targetMouse.y = e.clientY - rect.top;
		} );

		// Debounced resize
		var resizeTimer;
		window.addEventListener( 'resize', function () {
			clearTimeout( resizeTimer );
			resizeTimer = setTimeout( setup, 100 );
		} );

		setup();
	}

	// Initialize all magnetic filings canvases on the page
	function initAll() {
		var canvases = document.querySelectorAll( '.magnetic-filings-canvas' );
		for ( var i = 0; i < canvases.length; i++ ) {
			initCanvas( canvases[ i ] );
		}
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', initAll );
	} else {
		initAll();
	}
} )();

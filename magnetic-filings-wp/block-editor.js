( function () {
	var el = wp.element.createElement;
	var useState = wp.element.useState;
	var useEffect = wp.element.useEffect;
	var useRef = wp.element.useRef;
	var registerBlockType = wp.blocks.registerBlockType;
	var InspectorControls = wp.blockEditor.InspectorControls;
	var useBlockProps = wp.blockEditor.useBlockProps;
	var PanelBody = wp.components.PanelBody;
	var SelectControl = wp.components.SelectControl;
	var RangeControl = wp.components.RangeControl;
	var ColorPicker = wp.components.ColorPicker;
	var BaseControl = wp.components.BaseControl;
	var __ = wp.i18n.__;

	/**
	 * Minimal canvas preview that runs inside the editor.
	 */
	function CanvasPreview( props ) {
		var canvasRef = useRef( null );
		var animRef = useRef( null );
		var filingsRef = useRef( [] );
		var mouseRef = useRef( { x: 0, y: 0 } );
		var targetMouseRef = useRef( { x: 0, y: 0 } );

		var filingColor = props.filingColor;
		var filingLength = props.filingLength;
		var filingWidth = props.filingWidth;
		var cols = props.cols;
		var rows = props.rows;

		useEffect( function () {
			var canvas = canvasRef.current;
			if ( ! canvas ) return;

			var ctx = canvas.getContext( '2d' );
			var running = true;

			function setup() {
				var dpr = window.devicePixelRatio || 1;
				var rect = canvas.getBoundingClientRect();
				canvas.width = rect.width * dpr;
				canvas.height = rect.height * dpr;
				ctx.scale( dpr, dpr );

				var cw = rect.width;
				var ch = rect.height;

				var spacingX = cw / cols;
				var spacingY = ch / rows;

				var filings = [];
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

				filingsRef.current = filings;
				mouseRef.current = { x: cw / 2, y: ch / 2 };
				targetMouseRef.current = { x: cw / 2, y: ch / 2 };

				return { cw: cw, ch: ch };
			}

			var dims = setup();
			var smoothness = 0.25;
			var half = filingLength / 2;

			function animate() {
				if ( ! running ) return;

				var mouse = mouseRef.current;
				var target = targetMouseRef.current;
				mouse.x += ( target.x - mouse.x ) * smoothness;
				mouse.y += ( target.y - mouse.y ) * smoothness;

				var filings = filingsRef.current;
				for ( var i = 0; i < filings.length; i++ ) {
					var f = filings[ i ];
					var dx = mouse.x - f.x;
					var dy = mouse.y - f.y;
					f.targetAngle = Math.atan2( dy, dx );
					var diff = f.targetAngle - f.angle;
					diff = ( ( diff + Math.PI ) % ( Math.PI * 2 ) + Math.PI * 2 ) % ( Math.PI * 2 ) - Math.PI;
					f.angle += diff * smoothness;
				}

				ctx.clearRect( 0, 0, dims.cw, dims.ch );
				ctx.strokeStyle = filingColor;
				ctx.lineWidth = filingWidth;
				ctx.lineCap = 'round';
				ctx.beginPath();
				for ( var j = 0; j < filings.length; j++ ) {
					var fl = filings[ j ];
					var cos = Math.cos( fl.angle );
					var sin = Math.sin( fl.angle );
					var ddx = cos * half;
					var ddy = sin * half;
					ctx.moveTo( fl.x - ddx, fl.y - ddy );
					ctx.lineTo( fl.x + ddx, fl.y + ddy );
				}
				ctx.stroke();

				animRef.current = requestAnimationFrame( animate );
			}

			animate();

			function onMouseMove( e ) {
				var rect = canvas.getBoundingClientRect();
				targetMouseRef.current = {
					x: e.clientX - rect.left,
					y: e.clientY - rect.top,
				};
			}

			canvas.addEventListener( 'mousemove', onMouseMove );

			return function () {
				running = false;
				if ( animRef.current ) cancelAnimationFrame( animRef.current );
				canvas.removeEventListener( 'mousemove', onMouseMove );
			};
		}, [ filingColor, filingLength, filingWidth, cols, rows ] );

		return el( 'canvas', {
			ref: canvasRef,
			className: 'magnetic-filings-canvas',
			style: { backgroundColor: props.backgroundColor },
		} );
	}

	registerBlockType( 'magnetic/filings', {
		apiVersion: 3,
		title: __( 'Magnetic Filings', 'magnetic-filings' ),
		icon: 'admin-customizer',
		category: 'design',
		description: __( 'Interactive magnetic filings canvas effect.', 'magnetic-filings' ),
		supports: {
			align: [ 'wide', 'full' ],
			html: false,
		},

		edit: function ( props ) {
			var attributes = props.attributes;
			var setAttributes = props.setAttributes;

			var blockProps = useBlockProps( {
				className: 'magnetic-filings-block',
			} );

			// Convert aspect ratio to padding percentage for the wrapper
			var parts = attributes.aspectRatio.split( ':' );
			var padding = ( parseFloat( parts[ 1 ] ) / parseFloat( parts[ 0 ] ) ) * 100;

			return el(
				'div',
				blockProps,
				el(
					InspectorControls,
					null,
					el(
						PanelBody,
						{ title: __( 'Layout', 'magnetic-filings' ), initialOpen: true },
						el( SelectControl, {
							label: __( 'Aspect Ratio', 'magnetic-filings' ),
							value: attributes.aspectRatio,
							options: [
								{ label: '16:9', value: '16:9' },
								{ label: '4:3', value: '4:3' },
								{ label: '3:2', value: '3:2' },
								{ label: '1:1', value: '1:1' },
								{ label: '21:9', value: '21:9' },
								{ label: '9:16', value: '9:16' },
							],
							onChange: function ( val ) {
								setAttributes( { aspectRatio: val } );
							},
						} )
					),
					el(
						PanelBody,
						{ title: __( 'Colors', 'magnetic-filings' ), initialOpen: true },
						el(
							BaseControl,
							{ label: __( 'Filing Color', 'magnetic-filings' ) },
							el( ColorPicker, {
								color: attributes.filingColor,
								onChangeComplete: function ( val ) {
									setAttributes( { filingColor: val.hex } );
								},
							} )
						),
						el(
							BaseControl,
							{ label: __( 'Background Color', 'magnetic-filings' ) },
							el( ColorPicker, {
								color: attributes.backgroundColor,
								onChangeComplete: function ( val ) {
									setAttributes( { backgroundColor: val.hex } );
								},
							} )
						)
					),
					el(
						PanelBody,
						{ title: __( 'Filings', 'magnetic-filings' ), initialOpen: true },
						el( RangeControl, {
							label: __( 'Shaving Length', 'magnetic-filings' ),
							value: attributes.filingLength,
							onChange: function ( val ) {
								setAttributes( { filingLength: val } );
							},
							min: 4,
							max: 60,
						} ),
						el( RangeControl, {
							label: __( 'Shaving Width', 'magnetic-filings' ),
							value: attributes.filingWidth,
							onChange: function ( val ) {
								setAttributes( { filingWidth: val } );
							},
							min: 1,
							max: 10,
						} ),
						el( RangeControl, {
							label: __( 'Amount X (Columns)', 'magnetic-filings' ),
							value: attributes.amountX,
							onChange: function ( val ) {
								setAttributes( { amountX: val } );
							},
							min: 2,
							max: 60,
						} ),
						el( RangeControl, {
							label: __( 'Amount Y (Rows)', 'magnetic-filings' ),
							value: attributes.amountY,
							onChange: function ( val ) {
								setAttributes( { amountY: val } );
							},
							min: 2,
							max: 60,
						} )
					)
				),
				el(
					'div',
					{
						className: 'magnetic-filings-ratio',
						style: { paddingBottom: padding + '%' },
					},
					el( CanvasPreview, {
						filingColor: attributes.filingColor,
						backgroundColor: attributes.backgroundColor,
						filingLength: attributes.filingLength,
						filingWidth: attributes.filingWidth,
						cols: attributes.amountX,
						rows: attributes.amountY,
					} )
				)
			);
		},

		save: function () {
			// Rendered via PHP render_callback
			return null;
		},
	} );
} )();

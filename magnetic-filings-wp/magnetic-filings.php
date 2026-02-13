<?php
/**
 * Plugin Name: Magnetic Filings
 * Description: Interactive magnetic filings canvas effect — filings follow the cursor like iron filings near a magnet.
 * Version: 1.0.0
 * Author: Magnetic
 * License: GPL-2.0-or-later
 * Text Domain: magnetic-filings
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function magnetic_filings_register_block() {
	$asset_dir = plugin_dir_url( __FILE__ );

	// Editor script
	wp_register_script(
		'magnetic-filings-editor',
		$asset_dir . 'block-editor.js',
		array( 'wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n' ),
		'1.0.0',
		true
	);

	// Frontend script
	wp_register_script(
		'magnetic-filings-frontend',
		$asset_dir . 'block-frontend.js',
		array(),
		'1.0.0',
		true
	);

	// Editor styles
	wp_register_style(
		'magnetic-filings-editor',
		$asset_dir . 'block-editor.css',
		array(),
		'1.0.0'
	);

	// Frontend styles (loaded in both editor and frontend)
	wp_register_style(
		'magnetic-filings-style',
		$asset_dir . 'block-style.css',
		array(),
		'1.0.0'
	);

	register_block_type( 'magnetic/filings', array(
		'editor_script'   => 'magnetic-filings-editor',
		'editor_style'    => 'magnetic-filings-editor',
		'style'           => 'magnetic-filings-style',
		'view_script'     => 'magnetic-filings-frontend',
		'render_callback' => 'magnetic_filings_render_block',
		'attributes'      => array(
			'aspectRatio' => array(
				'type'    => 'string',
				'default' => '16:9',
			),
			'filingColor' => array(
				'type'    => 'string',
				'default' => '#e0e0e0',
			),
			'backgroundColor' => array(
				'type'    => 'string',
				'default' => '#1a1a2e',
			),
			'filingLength' => array(
				'type'    => 'number',
				'default' => 20,
			),
			'filingWidth' => array(
				'type'    => 'number',
				'default' => 2,
			),
			'amountX' => array(
				'type'    => 'number',
				'default' => 20,
			),
			'amountY' => array(
				'type'    => 'number',
				'default' => 20,
			),
		),
	) );
}
add_action( 'init', 'magnetic_filings_register_block' );

function magnetic_filings_render_block( $attributes ) {
	$id          = wp_unique_id( 'magnetic-filings-' );
	$aspect      = esc_attr( $attributes['aspectRatio'] );
	$color       = esc_attr( $attributes['filingColor'] );
	$bg          = esc_attr( $attributes['backgroundColor'] );
	$length      = intval( $attributes['filingLength'] );
	$width       = intval( $attributes['filingWidth'] );
	$cols        = intval( $attributes['amountX'] );
	$rows        = intval( $attributes['amountY'] );

	// Convert aspect ratio string to padding-bottom percentage
	$parts = explode( ':', $aspect );
	$ratio_w = floatval( $parts[0] );
	$ratio_h = floatval( $parts[1] );
	$padding = ( $ratio_h / $ratio_w ) * 100;

	$wrapper_attrs = get_block_wrapper_attributes( array(
		'class' => 'magnetic-filings-block',
	) );

	return sprintf(
		'<div %s>
			<div class="magnetic-filings-ratio" style="padding-bottom: %s%%;">
				<canvas
					id="%s"
					class="magnetic-filings-canvas"
					style="background-color: %s;"
					data-filing-color="%s"
					data-filing-length="%d"
					data-filing-width="%d"
					data-cols="%d"
					data-rows="%d"
				></canvas>
			</div>
		</div>',
		$wrapper_attrs,
		$padding,
		$id,
		$bg,
		$color,
		$length,
		$width,
		$cols,
		$rows
	);
}

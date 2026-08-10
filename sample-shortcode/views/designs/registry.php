<?php if ( ! defined( 'FW' ) ) {
	die( 'Forbidden' );
}

/**
 * ============================================================================
 * OPTIONAL — only for an element that ships MULTIPLE LAYOUTS.
 * ============================================================================
 *
 * A "design" is a layout variant the element offers in a Design image-picker.
 * If your element has one layout, delete this whole `designs/` folder and
 * render directly from views/view.php.
 *
 * Use designs when the variants differ STRUCTURALLY (a grid vs. a carousel
 * vs. a masonry wall). Do NOT use them for colour or spacing differences —
 * those are Style-tab options, and turning them into designs multiplies the
 * templates you have to maintain.
 *
 * ----------------------------------------------------------------------------
 * HOW THE PIECES FIT
 * ----------------------------------------------------------------------------
 *   registry.php        this file — declares the built-in designs
 *   <key>.php           one render partial per design, in this folder
 *   ../view.php         becomes a thin DISPATCHER: prepares shared data,
 *                       resolves the design, includes the partial (which
 *                       inherits every variable by scope)
 *   ../../static/css/designs/<key>.css   per-design CSS, loaded only for
 *                                        instances that pick that design
 *   ../../static/img/designs/<key>.svg   the picker tile
 *
 * Adding a design then means: drop a partial + register it here. view.php
 * never changes.
 *
 * ----------------------------------------------------------------------------
 * WHY THE SHARED LAYER, NOT A PLAIN SELECT
 * ----------------------------------------------------------------------------
 * Routing through fw_sc_design_*() means the element's design list is the
 * UNION of these built-ins AND any design PACKS an admin has installed from a
 * .zip on the Shortcodes admin page. A hand-rolled select only ever knows
 * about the built-ins, so the element silently opts out of design packs.
 *
 *   options.php   fw_sc_design_picker_choices( '<tag>' )   → picker choices
 *                 fw_sc_design_pack_option_fragments()     → pack options
 *   view.php      fw_sc_design_resolve( '<tag>', $atts, 'default' )
 *                 fw_sc_design_partial( '<tag>', $design )
 *   static.php    fw_sc_design_enqueue( '<tag>', $design )
 *
 * ----------------------------------------------------------------------------
 * RULES
 * ----------------------------------------------------------------------------
 * · A design keyed `default` MUST exist. It is the fallback for an unknown
 *   key AND for legacy instances saved before the element had designs — which
 *   is what stops old content from breaking when you add this layer.
 * · Keys are stable identifiers stored in the DB. Renaming one orphans every
 *   instance that chose it. Choose carefully; treat as permanent.
 * · `css` / `js` are FILENAMES relative to static/{css,js}/designs/. Omit a
 *   key when the design needs no extra asset — the element's base
 *   styles.css / scripts.js always load.
 *
 * The array below is real and harmless: it declares only `default`, matching
 * the single default.php partial beside it.
 */

return array(

	'default' => array(
		'label' => __( 'Default', 'fw' ),
		'thumb' => 'default.svg',   // static/img/designs/default.svg
		// 'css' => 'default.css',  // static/css/designs/default.css
		// 'js'  => 'default.js',   // static/js/designs/default.js
	),

	/*
	// A second design. Needs: designs/wide.php, static/img/designs/wide.svg,
	// and (if it has its own styling) static/css/designs/wide.css.
	'wide' => array(
		'label' => __( 'Wide', 'fw' ),
		'thumb' => 'wide.svg',
		'css'   => 'wide.css',
	),
	*/
);

<?php if ( ! defined( 'FW' ) ) {
	die( 'Forbidden' );
}

/**
 * options.php — the element's edit-modal fields. REQUIRED.
 *
 * ============================================================================
 * THIS FILE IS THE CONTRACT
 * ============================================================================
 * What you declare here IS the `atts` object stored in the page-builder JSON,
 * and IS the shape an AI generator must emit to create this element
 * programmatically. Front-end code reads only from here. Mirror it in
 * AGENTS.md and keep the two in sync — a stale schema means generated JSON is
 * rejected on import.
 *
 * Define `$options`. Do NOT `return`.
 *
 * ----------------------------------------------------------------------------
 * THE REQUIRED OUTER SHAPE
 * ----------------------------------------------------------------------------
 *   tab container → group container → leaf fields
 *
 * `tab` and `group` are NOT stored — they are layout only, so saved atts are
 * FLAT:
 *
 *     tab_content > group_main > title    →    $atts['title']
 *     NOT $atts['tab_content']['group_main']['title']
 *
 * That is why you can add, remove or rename a group without touching a single
 * saved value. The ONE container that DOES nest into the value is
 * `multi-picker` (see the reference block below).
 *
 * Conventional tab order: Content · Design · Style · Animations · Advanced.
 * The last two come from the framework — never hand-roll them.
 *
 * ----------------------------------------------------------------------------
 * KEYS EVERY LEAF FIELD ACCEPTS
 * ----------------------------------------------------------------------------
 *   type    (required) the option type id
 *   label   visible name; `false` hides the label column
 *   desc    one line under the label — say what it DOES
 *   help    the (?) tooltip — the longer "why / when"
 *   value   the DEFAULT (omit to use the type's own default)
 *   attr    raw HTML attributes on the input, e.g. array('placeholder' => '…')
 *
 * Per-type extras (`choices`, `properties`, `units`, `popup-options`, …) are
 * documented in the kit: docs/option-types/declaring-options.md is the index.
 * ============================================================================
 */

$options = array(

	/* ======================================================================
	 * CONTENT — what the user types.
	 * ==================================================================== */
	'tab_content' => array(
		'title'   => __( 'Content', 'fw' ),
		'type'    => 'tab',
		'options' => array(

			'group_main' => array(
				'type'    => 'group',
				'options' => array(

					'title' => array(
						'type'  => 'text',
						'label' => __( 'Title', 'fw' ),
						'desc'  => __( 'Shown as the element heading.', 'fw' ),
						'value' => '',
					),

					'text' => array(
						'type'  => 'textarea',
						'label' => __( 'Text', 'fw' ),
						'desc'  => __( 'Supporting copy.', 'fw' ),
						'value' => '',
					),

					/*
					 * REQUIRED on any element that renders a heading.
					 *
					 * The correct level depends on where the user drops the
					 * element, which only they know. Never hardcode a level,
					 * and never pick a deeper tag to get smaller text — the
					 * Style tab's size control does that. Skipping a level
					 * downward fails the heading-order accessibility audit.
					 */
					'heading_tag' => array(
						'type'    => 'select',
						'label'   => __( 'Heading Tag', 'fw' ),
						'value'   => 'h2',
						'choices' => array(
							'h2'  => 'H2',
							'h3'  => 'H3',
							'h4'  => 'H4',
							'div' => __( 'Div (not in the outline)', 'fw' ),
						),
						'desc' => __( 'Pick the level that fits this element\'s position on the page.', 'fw' ),
						'help' => __( 'Headings must descend without gaps. Choose by outline position, never by the size you want.', 'fw' ),
					),
				),
			),
		),
	),

	/* ======================================================================
	 * DESIGN — dimensions + behaviour. Every magic number from a source
	 * design belongs here. See the REFERENCE BLOCK at the bottom for
	 * unit-input, switch, slider, select, icon and multi-picker.
	 * ==================================================================== */
	'tab_design' => array(
		'title'   => __( 'Design', 'fw' ),
		'type'    => 'tab',
		'options' => array(

			'group_layout' => array(
				'type'    => 'group',
				'options' => array(

					'alignment' => array(
						'type'    => 'select',
						'label'   => __( 'Alignment', 'fw' ),
						'value'   => 'left',
						'choices' => array(
							'left'   => __( 'Left', 'fw' ),
							'center' => __( 'Center', 'fw' ),
							'right'  => __( 'Right', 'fw' ),
						),
						'desc' => __( 'Horizontal alignment of the content.', 'fw' ),
					),
				),
			),
		),
	),

	/* ======================================================================
	 * STYLE — colours + spacing.
	 * ==================================================================== */
	'tab_style' => array(
		'title'   => __( 'Style', 'fw' ),
		'type'    => 'tab',
		'options' => array(

			'group_colors' => array(
				'type'    => 'group',
				'options' => array(

					/*
					 * NEVER declare a raw 'color-picker' for an element
					 * colour. sc_color_field_compact() builds a preset
					 * dropdown — populated live from Theme Settings → Colors —
					 * PLUS an inline custom picker, so the element follows
					 * the site palette instead of freezing a hex.
					 *
					 * Stored shape: {predefined:'text-red'|'bg-red'|'',
					 *                custom:'#hex'|''}   (preset wins)
					 *
					 * 'kind' sets the choice prefix AND the CSS property used
					 * when only `custom` is set: 'text' → color, 'bg' →
					 * background.
					 *
					 * Resolve it in the view with sc_normalize_color_value().
					 * Never echo the raw value.
					 *
					 * THE ONE EXCEPTION: the UI that DEFINES the palette (you
					 * cannot pick a preset to define a preset). Everything
					 * that CONSUMES a colour uses this helper.
					 *
					 * Outside the shortcodes extension, guard the call:
					 *   function_exists('sc_color_field_compact')
					 *       ? sc_color_field_compact(…)
					 *       : array('type' => 'color-picker', …)
					 */
					/*
					 * ⚠ RESERVED IDS — WIRED FOR FREE.
					 *
					 * `text_color` and `bg_color` are among a small set of att
					 * ids the framework consumes AUTOMATICALLY and applies to
					 * the wrapper via sc_build_wrapper_attr(). Declare them
					 * here and write NO view code:
					 *
					 *   text_color  bg_color  font_size_preset  spacing
					 *   margin[_top|_bottom|_start|_end]
					 *   padding[_top|_bottom|_start|_end]
					 *
					 * Resolving one of these in the view as well applies it
					 * TWICE — a duplicated class and a duplicated inline
					 * style. Use these exact ids for wrapper-level styling,
					 * and different ids for anything you apply yourself.
					 */
					'text_color' => sc_color_field_compact( array(
						'label' => __( 'Text Color', 'fw' ),
						'kind'  => 'text',
						'desc'  => __( 'Colour of the text.', 'fw' ),
					) ),

					'bg_color' => sc_color_field_compact( array(
						'label' => __( 'Background Color', 'fw' ),
						'kind'  => 'bg',
						'desc'  => __( 'Background behind the element.', 'fw' ),
					) ),

					/*
					 * A PER-ELEMENT colour: a non-reserved id, targeting an
					 * inner node rather than the wrapper. This is the case
					 * where the view resolves the value itself with
					 * sc_normalize_color_value() — see views/view.php.
					 *
					 * Give these a `desc` that says what they OVERRIDE, or
					 * users cannot tell them apart from Text Color.
					 */
					'title_color' => sc_color_field_compact( array(
						'label' => __( 'Title Color', 'fw' ),
						'kind'  => 'text',
						'desc'  => __( 'Overrides Text Color for the heading only.', 'fw' ),
					) ),
				),
			),

			'group_spacing' => array(
				'type'    => 'group',
				'options' => array(

					/*
					 * The shared spacing control. Its value is turned into
					 * utility classes on the wrapper automatically by
					 * sc_build_wrapper_attr() — declare it and do nothing
					 * else. Never invent a per-element margin option; every
					 * element uses this one so the site's spacing scale stays
					 * coherent.
					 */
					'spacing' => array(
						'type'  => 'spacing',
						'label' => __( 'Margin & Padding', 'fw' ),
						'desc'  => __( 'All Sides applies everywhere; a per-side value overrides it for that direction.', 'fw' ),
						'help'  => sc_styling_help_text( 'spacing' ),
					),
				),
			),
		),
	),

	/* ======================================================================
	 * ANIMATIONS + ADVANCED — framework-supplied. Copy both blocks VERBATIM
	 * into every new element.
	 *
	 * sc_get_animation_fields() gives the element every Animation Engine slot
	 * (entrance animation, scroll motion, hover interaction, parallax, text
	 * effects…). sc_get_advanced_tab() gives CSS ID / CSS Class / per-element
	 * Custom CSS / position / overflow / responsive visibility / dynamic
	 * visibility rules.
	 *
	 * Both are consumed by sc_build_wrapper_attr() in the view — you write no
	 * code for either. Omit them and your element is the only one on the page
	 * that cannot be animated or targeted with CSS.
	 * ==================================================================== */
	'tab_animation' => array(
		'title'   => __( 'Animations', 'fw' ),
		'type'    => 'tab',
		'options' => sc_get_animation_fields(),
	),

	'tab_advanced' => array(
		'title'   => __( 'Advanced', 'fw' ),
		'type'    => 'tab',
		'options' => array(
			'advanced_settings' => array(
				'type'    => 'group',
				'options' => sc_get_advanced_tab(),
			),
		),
	),
);


/* ============================================================================
 * ============================================================================
 * REFERENCE BLOCK — every commonly-needed field, ready to paste.
 *
 * All of it is commented out. Move what you need into the tabs above and
 * delete the rest. Nothing below executes.
 * ============================================================================
 * ==========================================================================*/

/* ----------------------------------------------------------------------------
 * REPEATER — `addable-popup`
 *
 * A sortable list whose rows are edited in a sub-modal. The right choice
 * whenever the source design has "N of the same thing". Hardcoded repetition
 * in a source design is ALWAYS a repeater in the port — never ship a fixed
 * number of anything.
 *
 * Stored: an array of row objects. Row field ids are the keys.
 *
 *   'items' => array(
 *       'type'        => 'addable-popup',
 *       'label'       => __( 'Items', 'fw' ),
 *       'desc'        => __( 'Each entry becomes one card.', 'fw' ),
 *       'popup-title' => __( 'Add / Edit Item', 'fw' ),
 *       'size'        => 'medium',            // sub-modal width
 *       'template'    => '{{- heading }}',    // collapsed row label
 *       'limit'       => 0,                   // 0 = unlimited
 *       'value'       => array(),
 *       'popup-options' => array(
 *           'heading' => array( 'type' => 'text',     'label' => __( 'Heading', 'fw' ) ),
 *           'text'    => array( 'type' => 'textarea', 'label' => __( 'Text', 'fw' ) ),
 *           'image'   => array( 'type' => 'upload',   'label' => __( 'Image', 'fw' ), 'images_only' => true ),
 *       ),
 *   ),
 *
 * THE ROW `template` uses the SAME Underscore delimiters as config.php's
 * title_template — `{{ }}` evaluate, `{{- }}` escaped, `{{= }}` RAW — with
 * two differences:
 *
 *   · the row's fields are BARE IDS at the top level: `{{- heading }}`, not
 *     `{{- o["heading"] }}`;
 *   · errors are VISIBLE. A row whose template throws renders
 *     "[Template Error] <message>" inline in the list — unlike
 *     title_template, which swallows the exception and silently falls back.
 *     A useful difference to remember when debugging either one.
 *
 * Use `{{- }}` for the row label: it is user-typed text.
 *
 * Siblings: `addable-option` (a flat list of ONE repeated field, edited
 * inline) and `addable-box` (rows expand in place instead of in a modal).
 * ------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------
 * MEDIA — `upload`
 *
 * The Media Library picker. THE most important field in any conversion: a
 * source design's hardcoded image URL must become one of these, or the user
 * cannot change the image from the builder and the site hot-links a third
 * party.
 *
 * Stored: array('attachment_id' => int, 'url' => string) — or '' (an empty
 * STRING, not an empty object) when nothing is selected. ALWAYS test
 * !empty($v['attachment_id']) before reading url.
 *
 *   'image' => array(
 *       'type'        => 'upload',
 *       'label'       => __( 'Image', 'fw' ),
 *       'desc'        => __( 'Upload or choose an image.', 'fw' ),
 *       'images_only' => true,             // false + files_ext for any file
 *       // 'files_ext'  => array( 'pdf', 'zip' ),
 *       // 'sizes'      => array( 'thumbnail', 'large' ),  // adds a `sizes` key
 *   ),
 *
 * Sibling: `multi-upload` for a gallery (stores an array of the same shape).
 * ------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------
 * DIMENSIONS — `unit-input`
 *
 * A number plus a unit dropdown. Stored:
 *     array( 'value' => '<numeric string>', 'unit' => '<unit>' )
 *
 * Join the two halves before use — see sc_sample_unit_to_css() in static.php.
 * Offering vh/%/rem (not just px) is what makes an element usable in layouts
 * the source design never considered.
 *
 *   'max_width' => array(
 *       'type'  => 'unit-input',
 *       'label' => __( 'Max Width', 'fw' ),
 *       'value' => array( 'value' => '600', 'unit' => 'px' ),
 *       'units' => array( 'px', '%', 'vw', 'rem' ),   // first = default
 *       'min'   => 0,
 *       'max'   => 2000,
 *       'step'  => 1,
 *   ),
 *
 * Sibling: `responsive` wraps a unit-input into per-breakpoint values —
 * array( 'base' => {…}, 'md' => {…}, 'lg' => {…} ).
 * ------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------
 * BOOLEAN — `switch`
 *
 * Stores the STRINGS 'yes' / 'no' — NEVER a boolean. Consumers test
 * `=== 'yes'`. Both choice blocks are required; omit them and the switch
 * renders with blank labels.
 *
 *   'autoplay' => array(
 *       'type'         => 'switch',
 *       'label'        => __( 'Autoplay', 'fw' ),
 *       'value'        => 'no',
 *       'right-choice' => array( 'value' => 'yes', 'label' => __( 'Yes', 'fw' ) ),
 *       'left-choice'  => array( 'value' => 'no',  'label' => __( 'No', 'fw' ) ),
 *       'desc'         => __( 'Advance on a timer.', 'fw' ),
 *   ),
 * ------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------
 * BOUNDED NUMBER — `slider`
 *
 * A drag handle. Stored as a NUMBER (float). Bounds live in `properties`,
 * which is passed through to ion.rangeSlider.
 *
 *   'opacity' => array(
 *       'type'       => 'slider',
 *       'label'      => __( 'Opacity (%)', 'fw' ),
 *       'value'      => 40,
 *       'properties' => array( 'min' => 0, 'max' => 100, 'step' => 5 ),
 *   ),
 *
 * For an unbounded number use `number` (config: min / max / step /
 * numeric_type). Note `number` casts an untouched field to 0 on save, so
 * treat 0 as "unset" where that matters.
 * ------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------
 * ICON — `icon`
 *
 * The framework icon picker (icon fonts, SVG library, custom upload). Stored
 * as a TYPED OBJECT, e.g.
 *     array( 'type' => 'svg', 'svg-source' => 'library', 'svg-id' => 'lucide/arrow-left' )
 *
 * Render with sc_icon_render(), which also enqueues whichever icon pack the
 * value needs.
 *
 * A ported element must NEVER add an external icon CDN — the framework ships
 * icons and the site owner picks them.
 *
 *   'icon' => array(
 *       'type'         => 'icon',
 *       'label'        => __( 'Icon', 'fw' ),
 *       'preview_size' => 'small',     // small | medium | large
 *       'modal_size'   => 'medium',
 *   ),
 * ------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------
 * RICH TEXT — `wp-editor`
 *
 * The full TinyMCE editor. Stored as an HTML string.
 *
 * Prefer `textarea` for anything that is one short paragraph in a fixed-width
 * slot: a full editor lets authors paste headings and lists that break the
 * design, and invites classes on prose (which violates the clean-DOM rule).
 *
 *   'content' => array(
 *       'type'    => 'wp-editor',
 *       'label'   => __( 'Content', 'fw' ),
 *       'size'    => 'large',
 *       'teeny'   => false,
 *       'reinit'  => false,
 *   ),
 * ------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------
 * CONDITIONAL FIELDS — `multi-picker`
 *
 * A picker whose choice REVEALS a different set of sub-options. The one
 * container type whose value DOES nest:
 *
 *     array( '<picker_id>' => '<choice_key>',
 *            '<choice_key>' => array( …the revealed values… ) )
 *
 * Rules that are easy to get wrong:
 *   · INLINE picker  → label/desc go on the PICKER sub-option; the top level
 *     is 'label' => false, 'desc' => false.
 *   · POPOVER picker ('popover' => true) → the OPPOSITE: label/desc on the
 *     TOP LEVEL, and the picker sub-option is 'label' => false.
 *   · The picker is ONE entry. The default lives in the top-level `value`,
 *     never inside the picker sub-option.
 *   · Choice keys must be NON-EMPTY strings. Use 'auto', never ''.
 *   · `choices` only needs an entry for choices that reveal something.
 *   · Add 'show_borders' => false.
 *
 * MIGRATION WARNING: converting an EXISTING scalar option (a select storing a
 * string) into a multi-picker (storing an array) is a breaking value-shape
 * change. get_value_from_attributes() is NOT called on normal builder editor
 * load, so a legacy string reaches the option's PHP render and the modal opens
 * BLANK with "error:". Fix it by migrating JS-side in the item's scripts.js
 * before the modal opens, in addition to the PHP migration. New options have
 * no saved data, so this only bites on conversions.
 *
 *   'layout' => array(
 *       'type'         => 'multi-picker',
 *       'label'        => false,
 *       'desc'         => false,
 *       'show_borders' => false,
 *       'picker'       => array(
 *           'mode' => array(
 *               'label'   => __( 'Layout', 'fw' ),
 *               'type'    => 'select',
 *               'choices' => array(
 *                   'grid'     => __( 'Grid', 'fw' ),
 *                   'carousel' => __( 'Carousel', 'fw' ),
 *               ),
 *               'desc' => __( 'How items are arranged.', 'fw' ),
 *           ),
 *       ),
 *       'value'   => array( 'mode' => 'grid' ),
 *       'choices' => array(
 *           'grid' => array(
 *               'columns' => array(
 *                   'type'    => 'select',
 *                   'label'   => __( 'Columns', 'fw' ),
 *                   'value'   => '3',
 *                   'choices' => array( '2' => '2', '3' => '3', '4' => '4' ),
 *               ),
 *           ),
 *           'carousel' => array(
 *               'interval' => array(
 *                   'type'  => 'text',
 *                   'label' => __( 'Interval (ms)', 'fw' ),
 *                   'value' => '5000',
 *               ),
 *           ),
 *       ),
 *   ),
 * ------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------
 * DESIGN VARIANTS — the pluggable-designs layer
 *
 * If the element ships multiple LAYOUTS (not just colour tweaks), use the
 * shared layer rather than a bespoke select: it merges your built-in designs
 * with any design PACKS an admin has installed from a .zip.
 *
 * Requires views/designs/registry.php + one partial per design. See
 * views/designs/registry.php in this template.
 *
 *   'design_settings' => array(
 *       'type'         => 'multi-picker',
 *       'label'        => false,
 *       'desc'         => false,
 *       'show_borders' => false,
 *       'picker'       => array(
 *           'design' => array(
 *               'label'   => __( 'Design', 'fw' ),
 *               'type'    => 'image-picker',
 *               'choices' => fw_sc_design_picker_choices( 'sample_shortcode' ),
 *               'desc'    => __( 'Pick the layout.', 'fw' ),
 *           ),
 *       ),
 *       'value'   => array( 'design' => 'default' ),
 *       'choices' => array(
 *           // 'wide' => array( …options only the Wide design needs… ),
 *       ),
 *   ),
 *
 * …and at the very END of this file, merge in installed packs' fragments:
 *
 *   if ( function_exists( 'fw_sc_design_pack_option_fragments' ) ) {
 *       foreach ( fw_sc_design_pack_option_fragments( 'sample_shortcode' ) as $k => $frag ) {
 *           $options['tab_design']['options']['group_layout']['options']['design_settings']['choices'][ $k ] = $frag;
 *       }
 *   }
 * ------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------
 * OTHER SHARED FIELD BUILDERS (shortcodes extension, includes/)
 *
 *   sc_color_field_compact( $args )   preset + custom colour   (used above)
 *   sc_font_size_field( $args )       named size preset
 *   sc_card_box_style_field( $args )  Theme Settings Box Preset picker
 *   sc_styling_help_text( $context )  the standard (?) copy for a styling field
 *   sc_get_animation_fields()         the whole Animations tab   (used above)
 *   sc_get_advanced_tab()             the whole Advanced tab     (used above)
 *
 * Prefer these over hand-rolled equivalents: they keep every element's
 * controls identical and tie them to Theme Settings.
 * ------------------------------------------------------------------------- */

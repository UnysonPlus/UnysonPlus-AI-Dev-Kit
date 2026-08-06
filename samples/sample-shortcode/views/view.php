<?php if ( ! defined( 'FW' ) ) {
	die( 'Forbidden' );
}

/**
 * views/view.php — the front-end markup. REQUIRED.
 *
 * @var array $atts     the saved option values, keyed by the LEAF ids from
 *                      options.php (FLAT — tab/group containers do not nest
 *                      into the value)
 * @var string $content the rendered inner items. Only meaningful for a
 *                      section-like (container) element; empty for a leaf.
 *
 * Included ONCE PER INSTANCE on the page. Two consequences that bite people:
 *
 *   1. Never declare a bare `function` here — the second instance fatals on
 *      redeclaration. Helpers go in static.php.
 *   2. Never emit a hardcoded id — two instances would collide. Scope by
 *      class, and let the JS scope itself to each wrapper.
 *
 * Escape at the point of output, every time. There is no "trusted" att: an
 * editor can type anything, and an imported page-builder JSON can carry
 * anything.
 */

/* -------------------------------------------------------------------------
 * 1. READ + SANITISE
 * ---------------------------------------------------------------------- */

$title = isset( $atts['title'] ) ? trim( (string) $atts['title'] ) : '';
$text  = isset( $atts['text'] ) ? trim( (string) $atts['text'] ) : '';

/*
 * Bail early when there is nothing to show. Returning nothing is right for
 * the front end — a shell of empty divs is worse than absence. The builder
 * canvas still shows the empty state from config.php's title_template, so
 * the author is not left guessing.
 */
if ( $title === '' && $text === '' ) {
	return;
}

/*
 * Whitelist anything that reaches a tag name or an attribute name. `$atts`
 * is data; interpolating it straight into a tag is how you get
 * `<h2 onload=…>`. The whitelist IS the sanitiser.
 */
$heading_tag = isset( $atts['heading_tag'] ) ? $atts['heading_tag'] : 'h2';
if ( ! in_array( $heading_tag, array( 'h2', 'h3', 'h4', 'div' ), true ) ) {
	$heading_tag = 'h2';
}

$alignment = isset( $atts['alignment'] ) ? $atts['alignment'] : 'left';
if ( ! in_array( $alignment, array( 'left', 'center', 'right' ), true ) ) {
	$alignment = 'left';
}

/* -------------------------------------------------------------------------
 * 2. COLOURS
 *
 * ⚠ RESERVED ATT IDS — DO NOT RE-APPLY THESE YOURSELF.
 *
 * A handful of att ids are consumed AUTOMATICALLY by the framework and put
 * onto the wrapper by sc_build_wrapper_attr():
 *
 *     text_color   bg_color   font_size_preset
 *     margin  margin_top  margin_bottom  margin_start  margin_end
 *     padding padding_top padding_bottom padding_start padding_end
 *     spacing
 *
 * Name an option one of those and it is wired for free — declare it in
 * options.php and write NO view code. Resolve it yourself as well and you get
 * the value applied twice: a duplicated class and a duplicated inline style.
 * (That is a real bug this template shipped with once; it is invisible until
 * you read the rendered class attribute.)
 *
 * So `text_color` and `bg_color` are deliberately absent from this section —
 * they are already on the wrapper.
 *
 * ---------------------------------------------------------------------------
 * PER-ELEMENT colours are the case where you DO resolve manually: a colour
 * that targets an inner node rather than the wrapper.
 *
 * A compact colour value is array('predefined' => …, 'custom' => …) and must
 * NOT be echoed directly. sc_normalize_color_value() funnels that shape AND
 * the legacy plain-string shape into array('class' => …, 'style' => …):
 *
 *   preset picked → class: 'text-red'      (live-linked to Theme Settings)
 *   custom hex    → style: 'color: #eee'
 *
 * Preset wins when both are set. Calling this helper is what makes an
 * element's colours follow the site palette when the palette changes.
 * ---------------------------------------------------------------------- */

$title_color = sc_normalize_color_value( isset( $atts['title_color'] ) ? $atts['title_color'] : '', 'text' );

/* -------------------------------------------------------------------------
 * 3. THE WRAPPER
 *
 * sc_build_wrapper_attr() is not optional decoration — it is what makes the
 * element a first-class citizen of the builder. One call folds in:
 *
 *   · the base class + a per-instance unique class
 *   · the Advanced tab's CSS ID and CSS Class
 *   · per-element Custom CSS scoping (the `.u{hash}` target that the
 *     `selector` keyword resolves to)
 *   · Position / Z-Index / Overflow
 *   · the Style tab's spacing utility classes
 *   · every Animation Engine effect (entrance, scroll motion, hover,
 *     parallax, text effects…) as the data attributes its runtime reads
 *
 * Skip it and your element is the only one on the page that cannot be
 * animated, spaced, or targeted with CSS. There is no partial version:
 * call it, and put its output on the OUTERMOST node.
 *
 * `base_class` is your element's root class. `unique_id_prefix` prefixes the
 * per-instance class. `extra_attrs` is the supported way to add your own
 * attributes without hand-merging arrays afterwards.
 * ---------------------------------------------------------------------- */

$atts['base_class']       = 'sample-shortcode';
$atts['unique_id_prefix'] = 'ss-';
$atts['extra_attrs']      = array(
	// Hand behaviour options to the JS as data-*, never as an inline
	// <script> block: no inline script keeps the page CSP-friendly, keeps
	// the JS file cacheable, and lets each instance configure itself.
	// 'data-autoplay' => '1',
);

$attr = sc_build_wrapper_attr( $atts );

// Add your own classes by APPENDING — assigning would drop what the helper
// produced (the base class, the unique class, spacing utilities, the Advanced
// tab's CSS Class, the reserved colour atts).
$attr['class'] = trim( ( isset( $attr['class'] ) ? $attr['class'] : '' ) . ' is-align-' . $alignment );

// Same for style — Position and Overflow write there too, so never assign:
// $attr['style'] = ( ! empty( $attr['style'] ) ? rtrim( $attr['style'], '; ' ) . ';' : '' ) . $your_css;

?>
<div <?php echo fw_attr_to_html( $attr ); ?>>

	<?php if ( $title !== '' ) : ?>
		<?php
		// Build the attribute string first. Spreading attributes across
		// several PHP lines inside a tag emits the linebreaks and indentation
		// into the markup — harmless, but it makes the output ugly to read,
		// which matters when the DOM is part of what you are selling.
		$title_attr = ' class="' . esc_attr( trim( 'sample-shortcode__title ' . $title_color['class'] ) ) . '"';
		if ( $title_color['style'] ) {
			$title_attr .= ' style="' . esc_attr( $title_color['style'] ) . '"';
		}
		?>
		<<?php echo $heading_tag . $title_attr; // tag whitelisted above ?>><?php echo esc_html( $title ); ?></<?php echo $heading_tag; ?>>
	<?php endif; ?>

	<?php if ( $text !== '' ) : ?>
		<?php
		/*
		 * esc_html + nl2br — NOT wpautop, and NO class on the prose beyond
		 * the element's own. Clean-DOM rule: prose carries no styling hooks;
		 * the parent class does the styling. An author who needs a
		 * differently-styled block uses a second element.
		 */
		?>
		<p class="sample-shortcode__text"><?php echo nl2br( esc_html( $text ) ); ?></p>
	<?php endif; ?>

</div>

<?php
/* ============================================================================
 * REFERENCE BLOCK — commented out. Nothing below executes.
 * ==========================================================================*/

/* ----------------------------------------------------------------------------
 * REPEATER ROWS + REPLACEABLE MEDIA
 *
 * Note the <img>, NOT a CSS background-image. Three reasons, all of which
 * apply to every conversion:
 *   · a CSS background never lazy-loads, so every image downloads on first
 *     paint;
 *   · importers and search-replace tools can re-point an `src`, but not a URL
 *     buried in a style attribute;
 *   · it can carry alt text.
 *
 *   $items = isset( $atts['items'] ) && is_array( $atts['items'] ) ? $atts['items'] : array();
 *   foreach ( $items as $item ) :
 *       // An upload stores '' (a STRING) when empty — test attachment_id.
 *       $img = ! empty( $item['image']['attachment_id'] ) ? $item['image']['url'] : '';
 *       $heading = isset( $item['heading'] ) ? trim( (string) $item['heading'] ) : '';
 *       ?>
 *       <div class="sample-shortcode__item">
 *           <?php if ( $img ) : ?>
 *               <img class="sample-shortcode__image"
 *                    src="<?php echo esc_url( $img ); ?>"
 *                    alt="<?php echo esc_attr( $heading ); ?>"
 *                    loading="lazy" decoding="async" />
 *           <?php endif; ?>
 *           <?php
 *           // Descriptive link text + external-tab handling live in the helper.
 *           echo sc_sample_link_html(
 *               isset( $item['link_label'] ) ? $item['link_label'] : '',
 *               isset( $item['link_url'] ) ? $item['link_url'] : '',
 *               $heading
 *           );
 *           ?>
 *       </div>
 *   <?php endforeach;
 * ------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------
 * DIMENSIONS → CSS CUSTOM PROPERTIES
 *
 * The pattern worth copying: options become CSS variables on the wrapper and
 * the stylesheet does the rest. The alternatives are worse — a per-instance
 * <style> block duplicates rules for every element on the page, and inline
 * styles on each child cannot express calc() relationships. With variables
 * the stylesheet stays static and cacheable, and one `style` attribute
 * carries the whole configuration.
 *
 *   $max_width = sc_sample_unit_to_css( isset( $atts['max_width'] ) ? $atts['max_width'] : null, '600px' );
 *   $css_vars  = sprintf( '--ss-max-w:%s;', $max_width );
 *   $attr['style'] = ( ! empty( $attr['style'] ) ? rtrim( $attr['style'], '; ' ) . ';' : '' ) . $css_vars;
 *
 * When a value must drive something CSS cannot compute from a variable (an
 * `nth-child(n + X)` threshold, say), emit a CLASS instead and write one
 * small rule per supported value:
 *
 *   $attr['class'] .= ' is-count-' . max( 1, min( 5, (int) $atts['count'] ) );
 * ------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------
 * NUMBERS FOR CSS — locale trap
 *
 * PHP's float-to-string honours the locale in some builds, so a raw echo can
 * emit "0,4" and silently break the declaration. Format explicitly:
 *
 *   number_format( $alpha, 2, '.', '' )
 * ------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------
 * ICONS
 *
 * sc_icon_render() turns the typed icon value into markup AND enqueues
 * whichever icon pack it needs. Always provide a self-contained inline-SVG
 * fallback so the element is never empty when no icon is picked — never fall
 * back to a CDN icon font.
 *
 *   $icon = sc_icon_render(
 *       isset( $atts['icon'] ) ? $atts['icon'] : '',
 *       array( 'class' => 'sample-shortcode__icon' )
 *   );
 *   if ( $icon === '' ) {
 *       $icon = '<svg class="sample-shortcode__icon" viewBox="0 0 24 24" width="1em" height="1em"'
 *             . ' aria-hidden="true" focusable="false"><path d="M10 5l7 7-7 7" fill="none"'
 *             . ' stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
 *   }
 *   echo $icon;   // already escaped by the renderer
 * ------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------
 * SECTION-LIKE (CONTAINER) ELEMENTS
 *
 * If this element holds rows/columns rather than being a leaf, `$content` is
 * the rendered inner tree. Echo it inside your wrapper — and read
 * class-fw-shortcode-sample-shortcode.php in this template, which a
 * container element also requires.
 *
 *   <section <?php echo fw_attr_to_html( $attr ); ?>>
 *       <?php echo $content; ?>
 *   </section>
 * ------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------
 * MULTIPLE DESIGNS
 *
 * With the pluggable-designs layer, view.php becomes a thin dispatcher: it
 * prepares shared data and includes the chosen partial, which inherits every
 * variable by scope. Adding a design then never touches this file.
 *
 *   $design      = fw_sc_design_resolve( 'sample_shortcode', $atts, 'default' );
 *   $design_file = fw_sc_design_partial( 'sample_shortcode', $design );
 *   if ( ! $design_file || ! file_exists( $design_file ) ) {
 *       $design_file = dirname( __FILE__ ) . '/designs/default.php';
 *   }
 *   $attr['class'] = trim( $attr['class'] . ' design-' . $design );
 *   include $design_file;
 * ------------------------------------------------------------------------- */

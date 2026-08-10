<?php if ( ! defined( 'FW' ) ) {
	die( 'Forbidden' );
}

/**
 * ============================================================================
 * OPTIONAL — a design PARTIAL. Only used with the designs layer.
 * ============================================================================
 *
 * Included by views/view.php acting as a dispatcher (see the reference block
 * at the bottom of that file). It is `include`d, not required as a value, so
 * it INHERITS EVERY VARIABLE view.php prepared — `$atts`, `$attr`, resolved
 * colours, the content array, and so on. It declares none of its own.
 *
 * That inheritance is the point: all the reading, sanitising and resolving
 * happens ONCE in the dispatcher, and each partial is pure markup. When you
 * add a fifth design you write markup, not another copy of the data prep.
 *
 * Two rules:
 *   1. Emit the wrapper with `fw_attr_to_html( $attr )`. `$attr` already
 *      carries the base class, the Advanced tab's settings, spacing and every
 *      Animation Engine hook — do not hand-build a wrapper here.
 *   2. Escape at output, exactly as in view.php. A partial is not "inside"
 *      anything that escapes for it.
 *
 * As shipped this is a minimal working partial, so the designs layer can be
 * switched on by uncommenting the dispatcher in view.php without writing
 * anything new first.
 */

?>
<div <?php echo fw_attr_to_html( $attr ); ?>>
	<?php if ( ! empty( $title ) ) : ?>
		<<?php echo $heading_tag; ?> class="sample-shortcode__title"><?php echo esc_html( $title ); ?></<?php echo $heading_tag; ?>>
	<?php endif; ?>

	<?php if ( ! empty( $text ) ) : ?>
		<p class="sample-shortcode__text"><?php echo nl2br( esc_html( $text ) ); ?></p>
	<?php endif; ?>
</div>

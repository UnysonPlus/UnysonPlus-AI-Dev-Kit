<?php if ( ! defined( 'FW' ) ) {
	die( 'Forbidden' );
}

/**
 * ============================================================================
 * OPTIONAL — ONLY for a SECTION-LIKE (container) element.
 * ============================================================================
 *
 * This file is inert as shipped: nothing loads it unless
 * class-fw-shortcode-{your-folder}.php `require`s it (see that file's
 * `_action_register_builder_item_types()`). A LEAF element deletes this whole
 * `includes/` folder.
 *
 * Folder naming is not free-form — the class file requires this exact path:
 *
 *     includes/page-builder-{your_type}-item/class-page-builder-{your_type}-item.php
 *
 * where {your_type} is the snake_case tag (folder name, dashes → underscores).
 *
 * ----------------------------------------------------------------------------
 * WHAT EXTENDING Page_Builder_Section_Like_Item GIVES YOU, FOR FREE
 * ----------------------------------------------------------------------------
 *   · registration with the section-like registry on the editor-render path
 *   · items-corrector opt-outs, so your type is not auto-wrapped in [section]
 *   · `_items` recursion, so inner rows/columns/leaves still get corrected
 *   · the shared `.column-title` slot the section sorter reads for labels
 *   · the save-as-template control on the canvas
 *   · hierarchy guards (columns may land inside; leaves may not land at root)
 *
 * ----------------------------------------------------------------------------
 * ADMIN-SIDE ASSETS (optional)
 * ----------------------------------------------------------------------------
 * Drop them at, and do NOT register them — the parent class auto-locates:
 *
 *     includes/page-builder-{your_type}-item/static/css/styles.css
 *     includes/page-builder-{your_type}-item/static/js/scripts.js
 *
 * These style the element's card ON THE BUILDER CANVAS, not the front end.
 *
 * A JS-side option MIGRATOR also lives in that scripts.js. It is the fix for
 * the one migration trap worth memorising: if you change an EXISTING option's
 * value SHAPE (a scalar select becoming a multi-picker, say), a PHP migration
 * alone is not enough. `get_value_from_attributes()` does NOT run on a normal
 * builder editor load — the modal opens with the RAW saved atts — so a legacy
 * value reaches the option's PHP render, throws, and the modal shows a blank
 * "error:" on pre-existing items only. Mirror the migration in JS here and
 * `this.model.set('atts', migrated)` so a save persists the new shape.
 *
 * ============================================================================
 * Uncomment and substitute {YourType} / {your_type}.
 * ============================================================================
 */

/*

class Page_Builder_{YourType}_Item extends Page_Builder_Section_Like_Item {

	public function get_type() {
		return '{your_type}';
	}

	// Override ONLY if the shortcode tag differs from the item type (rare).
	// public function get_shortcode_slug() {
	//     return '{your_shortcode_tag}';
	// }
}

// File-scope registration. Safe because the action handler `require`s this
// file (not require_once) and the action fires once per request. If you ever
// wire this file in from somewhere else, switch to require_once or you get a
// redeclaration fatal.
FW_Option_Type_Builder::register_item_type( 'Page_Builder_{YourType}_Item' );

*/

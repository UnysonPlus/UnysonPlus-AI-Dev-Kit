<?php
/**
 * Apply a Site Creator STYLE to a WordPress install — the design-system half of a build.
 *
 * A style is site-wide Theme Settings (see docs/site-creator/styles/README.md): palette, type, buttons,
 * shape, surfaces, measure. This writes those, so a page built afterwards INHERITS them rather than
 * carrying colours on each element.
 *
 *   WP_LOAD=D:/xampp/htdocs/testsite/wp-load.php php apply-style.php <style-id> [--dry]
 *
 * Run it BEFORE building pages. That order is not cosmetic: build sections first and each one acquires
 * values that then fight the design system when it arrives.
 *
 * Three things here are the way they are because the alternative was measurably wrong:
 *
 * 1. WE SET THE PALETTE AND LET THE BUTTONS FOLLOW. The button presets reference palette roles by slug
 *    (bg=primary, text=white), so moving `theme_colors` Primary recolours every Primary button for
 *    free. Writing custom hex into all six button slots would LOOK equivalent and silently sever that
 *    link, so a user who later edited Primary in Theme Settings would watch their buttons ignore it.
 *    Per-style button overrides are therefore SPARSE — only the slots a style genuinely needs, and the
 *    resting fill stays on the role wherever the role already says the right thing.
 * 2. SURFACES ARE RECOLOURED IN PLACE AND NEVER RENAMED. A section stores its surface as a `variant`
 *    SLUG, and unysonplus_section_style_choices() derives that slug from the preset's NAME — so
 *    renaming Alt to "Tint" silently turns `variant:'alt'` into a dangling reference, and every style
 *    would also invent its own slug vocabulary, making one page tree unable to render under a second
 *    style. The shipped names (Alt / Light / Dark) are therefore load-bearing: we change what those
 *    three surfaces LOOK like and never what they are called. That is what lets a single demo page be
 *    rendered under all seven styles.
 * 3. THE PRESET CSS IS REGENERATED AT THE END. A programmatic write does not rebuild
 *    uploads/unysonplus/css/presets-*.css — only the admin save flow does. Skip it and the site serves
 *    the stock palette while the database holds a perfect one, which reads as "the style failed" and
 *    sends you debugging the wrong layer entirely.
 */

if ( ! defined( 'ABSPATH' ) ) {
	// NOT $wp: at global scope that clobbers WordPress's own global $wp (the WP object), and
	// create_initial_taxonomies() then calls add_query_var() on a string before we reach our own code.
	$wp_load_path = getenv( 'WP_LOAD' ) ?: 'D:/xampp/htdocs/wp-load.php';
	require $wp_load_path;   // Windows PHP needs the D:/ form, not /d/
}

$argv_ = isset( $argv ) ? $argv : array();
$style = '';
$dry   = false;
foreach ( array_slice( $argv_, 1 ) as $a ) {
	if ( '--dry' === $a ) {
		$dry = true;
	} elseif ( '' === $style && '-' !== substr( $a, 0, 1 ) ) {
		$style = $a;
	}
}
if ( '' === $style ) { $style = 'monochrome'; }

/* ---------------------------------------------------------------------------
 * The styles, as values. These mirror docs/site-creator/styles/<id>.md — that file is the prose and the
 * reasoning, this is the same decision in the shapes Theme Settings stores. A style whose doc says 0
 * radius and whose table writes 8 is worse than no style at all, so the two change together.
 *
 *   roles     palette role => hex. Buttons and links follow these without being written.
 *   btn       SPARSE overrides: preset name => state => slot => hex. Anything unlisted keeps its role.
 *   surfaces  in preset ORDER (the three shipped slots), each renamed and recoloured.
 * ------------------------------------------------------------------------- */
$STYLES = array(

	/* NOTE on the Muted role, found by rendering rather than by reading the options: the theme uses
	 * Muted as a TEXT colour - the small eyebrow label above a heading, metadata, captions - and not
	 * only as a quiet FILL. Several briefs name a pale surface for "muted" (Bauhaus #E0E0E0, Flat
	 * #F3F4F6, Swiss #F2F2F2), and taking those literally painted the eyebrow label at 1.16:1 on
	 * Bauhaus - invisible, and invisible in a way no stored-value check would show. Every Muted below
	 * is therefore a readable TEXT value measured against that style's own page colour; the pale fill
	 * those briefs meant lives on the Alt surface instead, which is what it was describing.
	 */

	'monochrome' => array(
		'label'   => 'Monochrome editorial',
		// These are the brief's values, not approximations of them. The brief says pure black is the
		// accent and grey is the single concession, for secondary text and hairlines only.
		'roles'   => array( 'Primary' => '#000000', 'Secondary' => '#525252', 'Accent' => '#000000', 'Muted' => '#525252' ),
		// The serif PAIRING is load-bearing in this style - a sans makes the page read as a wireframe of
		// itself - so the display and the text face are two different serifs, not one family at two weights.
		'heading' => array( 'family' => 'Playfair Display', 'variation' => 'regular' ),
		'body'    => array( 'family' => 'Source Serif 4', 'variation' => 'regular', 'size' => 17, 'line-height' => 1.625, 'color' => '#000000' ),
		'weight'  => 'regular',
		// Dramatic scale: the brief asks a display line to reach 7-9rem on a wide screen. Tracking is the
		// brief's -0.025em expressed in px at each size, and the display line takes line-height 1.
		'scale'   => array( 'h1' => array( 120, 1.00, -3.0 ), 'h2' => array( 56, 1.05, -1.4 ), 'h3' => array( 28, 1.30, -0.7 ), 'h4' => array( 19, 1.40, 0 ) ),
		'radius'  => 0,
		// Resting Primary is already right through the palette (white on black). Only the HOVER needs
		// saying, because the shipped hover points at the Indigo role - a colour this style has no use for.
		'btn'     => array(
			'Primary' => array( 'hover' => array( 'text_color' => '#000000', 'bg_color' => '#ffffff', 'border_color' => '#000000' ) ),
		),
		// Slot order is the shipped Alt / Light / Dark. Names are NOT set here on purpose (note 2).
		'surfaces' => array(
			array( 'bg' => '#f5f5f5', 'text' => '#000000', 'head' => '#000000', 'link' => '#000000' ), // Alt - the brief's muted surface
			array( 'bg' => '#ffffff', 'text' => '#000000', 'head' => '#000000', 'link' => '#000000' ), // Light
			array( 'bg' => '#000000', 'text' => '#f5f5f5', 'head' => '#ffffff', 'link' => '#ffffff' ), // Dark
		),
		'container' => 768,
		// A monochrome style makes Primary the same ink as the Dark surface, so a primary button on that
		// band is invisible (measured 1:1 against it - only the white label showed). Inverting it there is
		// a STYLE-level rule, scoped to the surface, so every primary button on every dark band is fixed
		// at once rather than each one being patched on the page.
		'css'    => ".section--dark .btn-primary{background-color:#ffffff;border-color:#ffffff;color:#000000}
"
		            . ".section--dark .btn-primary:hover{background-color:#000000;border-color:#ffffff;color:#ffffff}",
		'footer' => array( 'bg' => '#000000', 'text' => '#e5e5e5' ),
		'page'   => '#ffffff',
	),

	'modern-dark' => array(
		'label'   => 'Modern dark',
		// The brief's indigo, not a mint. Note that the palette carries TWO indigos: #5E6AD2 is the FILL
		// and #6872D9 is the same colour for TEXT, because the fill value used as type on the canvas
		// measures 4.33:1 and misses AA while the brighter one makes 4.85:1. One value for both is the
		// quiet failure in this palette - it looks fine and is not. Accent carries the text value, since
		// that is the role links follow.
		'roles'   => array( 'Primary' => '#5e6ad2', 'Secondary' => '#8a8f98', 'Accent' => '#6872d9', 'Muted' => '#8a8f98' ),
		'heading' => array( 'family' => 'Inter', 'variation' => '600' ),
		'body'    => array( 'family' => 'Inter', 'variation' => 'regular', 'size' => 16, 'line-height' => 1.7, 'color' => '#ededef' ),
		'weight'  => '600',
		'scale'   => array( 'h1' => array( 60, 1.05, -1.8 ), 'h2' => array( 40, 1.15, -1.2 ), 'h3' => array( 22, 1.35, -0.4 ), 'h4' => array( 18, 1.45, 0 ) ),
		'radius'  => 8,
		'btn'     => array(
			// Primary takes the SHIPPED white label: white on #5E6AD2 is 4.70:1 and clears AA, so there is
			// nothing to override on the resting state. Only the hover fill needs saying.
			'Primary' => array(
				'hover' => array( 'bg_color' => '#6872d9', 'border_color' => '#6872d9' ),
			),
			// Secondary is the opposite case, and it was found by measuring rather than by looking: the
			// shipped preset puts WHITE on the Secondary role, and white on #8A8F98 is 3.25:1 - under AA.
			// The canvas colour on that same grey is 6.27:1. A light grey role needs dark text.
			'Secondary' => array(
				'default' => array( 'text_color' => '#050506' ),
				'hover'   => array( 'text_color' => '#050506', 'bg_color' => '#a8aeb6', 'border_color' => '#a8aeb6' ),
			),
		),
		// A dark style inverts what the slots MEAN (its "Light" is near-black) but keeps their names,
		// so a page written against alt/light/dark renders correctly here too. The brief's three layers
		// are raised / canvas / deepest, in that order. Never pure #000000.
		'surfaces' => array(
			array( 'bg' => '#0a0a0c', 'text' => '#ededef', 'head' => '#ffffff', 'link' => '#6872d9' ), // Alt - raised
			array( 'bg' => '#050506', 'text' => '#ededef', 'head' => '#ffffff', 'link' => '#6872d9' ), // Light - canvas
			array( 'bg' => '#020203', 'text' => '#ededef', 'head' => '#ffffff', 'link' => '#6872d9' ), // Dark - deepest
		),
		'container' => 896,
		// Hairlines in this style are "nearly invisible" by instruction - 6% white - and that is a
		// style-level decision rather than a per-element one, so it lives here with the rest of the skin.
		'css'    => '.section--alt,.section--light,.section--dark{border-color:rgba(255,255,255,.06)}',
		'footer' => array( 'bg' => '#020203', 'text' => '#8a8f98' ),
		'page'   => '#050506',
	),

	/* -----------------------------------------------------------------------
	 * The presets below were added together, and every button-text decision in
	 * them is a MEASUREMENT, not a preference. The theme's shipped button preset
	 * puts WHITE on the Primary role; that is right for a dark saturated fill and
	 * wrong for a bright one, and the difference is invisible until measured. The
	 * rule applied throughout: white stays only where it reaches 4.5:1 on that
	 * role, otherwise the style's own dark ink takes over. The ratio is in the
	 * comment beside each override so a later edit can see what it is undoing.
	 * --------------------------------------------------------------------- */

	'bauhaus' => array(
		'label'   => 'Bauhaus',
		'roles'   => array( 'Primary' => '#d02020', 'Secondary' => '#1040c0', 'Accent' => '#f0c020', 'Muted' => '#3f3f3f' ),
		'heading' => array( 'family' => 'Outfit', 'variation' => '700' ),
		'body'    => array( 'family' => 'Outfit', 'variation' => 'regular', 'size' => 17, 'line-height' => 1.6, 'color' => '#121212' ),
		'weight'  => '700',
		'scale'   => array( 'h1' => array( 88, 1.00, -2.5 ), 'h2' => array( 48, 1.05, -1.2 ), 'h3' => array( 26, 1.25, -0.3 ), 'h4' => array( 18, 1.40, 0 ) ),
		'radius'  => 0,
		// Red carries white at 5.37:1 and blue at 8.34:1, so both button roles keep the shipped label.
		// The YELLOW is the one that would fail (1.71:1), which is why it is the Accent and not a role
		// any button fill follows.
		'btn'     => array(),
		'surfaces' => array(
			array( 'bg' => '#e0e0e0', 'text' => '#121212', 'head' => '#121212', 'link' => '#d02020' ),
			array( 'bg' => '#f0f0f0', 'text' => '#121212', 'head' => '#121212', 'link' => '#d02020' ),
			array( 'bg' => '#121212', 'text' => '#f0f0f0', 'head' => '#ffffff', 'link' => '#f0c020' ),
		),
		'container' => 1140,
		'css'    => '',
		'footer' => array( 'bg' => '#121212', 'text' => '#f0f0f0' ),
		'page'   => '#f0f0f0',
	),

	'newsprint' => array(
		'label'   => 'Newsprint',
		'roles'   => array( 'Primary' => '#cc0000', 'Secondary' => '#111111', 'Accent' => '#cc0000', 'Muted' => '#6b6b6b' ),
		'heading' => array( 'family' => 'Playfair Display', 'variation' => '700' ),
		'body'    => array( 'family' => 'Lora', 'variation' => 'regular', 'size' => 17, 'line-height' => 1.6, 'color' => '#111111' ),
		'weight'  => '700',
		'scale'   => array( 'h1' => array( 84, 1.02, -1.8 ), 'h2' => array( 44, 1.10, -0.8 ), 'h3' => array( 24, 1.30, -0.2 ), 'h4' => array( 18, 1.40, 0 ) ),
		'radius'  => 0,
		// Editorial red carries white at 5.89:1. Ninety-nine per cent of this style is black on
		// off-white anyway - the red is a badge colour, not a surface.
		'btn'     => array(),
		'surfaces' => array(
			array( 'bg' => '#f2f2ee', 'text' => '#111111', 'head' => '#111111', 'link' => '#cc0000' ),
			array( 'bg' => '#f9f9f7', 'text' => '#111111', 'head' => '#111111', 'link' => '#cc0000' ),
			array( 'bg' => '#111111', 'text' => '#f9f9f7', 'head' => '#ffffff', 'link' => '#ffffff' ),
		),
		'container' => 1200,
		'css'    => '',
		'footer' => array( 'bg' => '#111111', 'text' => '#d4d4d0' ),
		'page'   => '#f9f9f7',
	),

	'saas' => array(
		'label'   => 'Minimalist Modern',
		'roles'   => array( 'Primary' => '#0052ff', 'Secondary' => '#64748b', 'Accent' => '#0052ff', 'Muted' => '#556175' ),
		'heading' => array( 'family' => 'Calistoga', 'variation' => 'regular' ),
		'body'    => array( 'family' => 'Inter', 'variation' => 'regular', 'size' => 17, 'line-height' => 1.7, 'color' => '#0f172a' ),
		'weight'  => 'regular',
		'scale'   => array( 'h1' => array( 84, 1.05, -1.7 ), 'h2' => array( 46, 1.15, -0.9 ), 'h3' => array( 24, 1.35, 0 ), 'h4' => array( 18, 1.45, 0 ) ),
		'radius'  => 12,
		// The brief's trap is the GRADIENT, whose light end fails under white. A Theme Settings button
		// is a flat fill, so the trap does not arise here: white on #0052FF is 5.75:1. Secondary is the
		// one to watch - white on #64748B is 4.76:1, which passes but with almost nothing to spare, so
		// a later darkening of that role has to be re-measured rather than assumed.
		'btn'     => array(),
		'surfaces' => array(
			array( 'bg' => '#f1f5f9', 'text' => '#0f172a', 'head' => '#0f172a', 'link' => '#0052ff' ),
			array( 'bg' => '#fafafa', 'text' => '#0f172a', 'head' => '#0f172a', 'link' => '#0052ff' ),
			array( 'bg' => '#0f172a', 'text' => '#e2e8f0', 'head' => '#ffffff', 'link' => '#93b4ff' ),
		),
		'container' => 1140,
		'css'    => '',
		'footer' => array( 'bg' => '#0f172a', 'text' => '#94a3b8' ),
		'page'   => '#fafafa',
	),

	'luxury' => array(
		'label'   => 'Luxury editorial',
		// Gold is an ACCENT only and never a large area, so it is not the Primary role - buttons follow
		// Primary, and a gold button is exactly the large gold area the brief forbids.
		'roles'   => array( 'Primary' => '#1a1a1a', 'Secondary' => '#6c6863', 'Accent' => '#d4af37', 'Muted' => '#6c6863' ),
		'heading' => array( 'family' => 'Playfair Display', 'variation' => 'regular' ),
		'body'    => array( 'family' => 'Inter', 'variation' => 'regular', 'size' => 17, 'line-height' => 1.75, 'color' => '#1a1a1a' ),
		'weight'  => 'regular',
		'scale'   => array( 'h1' => array( 92, 1.05, -2.0 ), 'h2' => array( 48, 1.15, -1.0 ), 'h3' => array( 26, 1.35, 0 ), 'h4' => array( 18, 1.45, 0 ) ),
		'radius'  => 0,
		// White on charcoal is 17.4:1 and on the warm grey 5.53:1 - both shipped labels stand.
		'btn'     => array(),
		'surfaces' => array(
			array( 'bg' => '#ebe5de', 'text' => '#1a1a1a', 'head' => '#1a1a1a', 'link' => '#1a1a1a' ),
			array( 'bg' => '#f9f8f6', 'text' => '#1a1a1a', 'head' => '#1a1a1a', 'link' => '#1a1a1a' ),
			array( 'bg' => '#1a1a1a', 'text' => '#ebe5de', 'head' => '#f9f8f6', 'link' => '#d4af37' ),
		),
		'container' => 1080,
		'css'    => '',
		'footer' => array( 'bg' => '#1a1a1a', 'text' => '#b8b2aa' ),
		'page'   => '#f9f8f6',
	),

	'terminal' => array(
		'label'   => 'Terminal',
		'roles'   => array( 'Primary' => '#33ff00', 'Secondary' => '#ffb000', 'Accent' => '#33ff00', 'Muted' => '#2fb52f' ),
		'heading' => array( 'family' => 'JetBrains Mono', 'variation' => '700' ),
		'body'    => array( 'family' => 'JetBrains Mono', 'variation' => 'regular', 'size' => 16, 'line-height' => 1.7, 'color' => '#33ff00' ),
		'weight'  => '700',
		'scale'   => array( 'h1' => array( 56, 1.10, 0 ), 'h2' => array( 34, 1.20, 0 ), 'h3' => array( 21, 1.35, 0 ), 'h4' => array( 17, 1.45, 0 ) ),
		'radius'  => 0,
		// Phosphor and amber are the two BRIGHTEST fills in the whole set. White on them is 1.36:1 and
		// 1.83:1 - invisible. The ground colour on the same fills is 15.44:1 and 11.46:1.
		'btn'     => array(
			'Primary'   => array(
				'default' => array( 'text_color' => '#0a0a0a' ),
				'hover'   => array( 'text_color' => '#0a0a0a', 'bg_color' => '#5cff33', 'border_color' => '#5cff33' ),
			),
			'Secondary' => array(
				'default' => array( 'text_color' => '#0a0a0a' ),
				'hover'   => array( 'text_color' => '#0a0a0a', 'bg_color' => '#ffc233', 'border_color' => '#ffc233' ),
			),
		),
		'surfaces' => array(
			array( 'bg' => '#101410', 'text' => '#33ff00', 'head' => '#33ff00', 'link' => '#ffb000' ),
			array( 'bg' => '#0a0a0a', 'text' => '#33ff00', 'head' => '#33ff00', 'link' => '#ffb000' ),
			array( 'bg' => '#050505', 'text' => '#33ff00', 'head' => '#33ff00', 'link' => '#ffb000' ),
		),
		'container' => 960,
		'css'    => '',
		'footer' => array( 'bg' => '#050505', 'text' => '#33ff00' ),
		'page'   => '#0a0a0a',
	),

	'swiss' => array(
		'label'   => 'Swiss International',
		'roles'   => array( 'Primary' => '#000000', 'Secondary' => '#ff3000', 'Accent' => '#ff3000', 'Muted' => '#5c5c5c' ),
		'heading' => array( 'family' => 'Inter', 'variation' => '700' ),
		'body'    => array( 'family' => 'Inter', 'variation' => 'regular', 'size' => 17, 'line-height' => 1.6, 'color' => '#000000' ),
		'weight'  => '700',
		'scale'   => array( 'h1' => array( 104, 1.00, -3.0 ), 'h2' => array( 52, 1.05, -1.5 ), 'h3' => array( 26, 1.30, -0.3 ), 'h4' => array( 18, 1.40, 0 ) ),
		'radius'  => 0,
		// The signal red is the trap here: white on #FF3000 is 3.70:1 and misses AA, while black on it
		// is 5.67:1. A red button therefore carries black - which also suits a style whose every other
		// mark is black.
		'btn'     => array(
			'Secondary' => array(
				'default' => array( 'text_color' => '#000000' ),
				'hover'   => array( 'text_color' => '#000000', 'bg_color' => '#ff5733', 'border_color' => '#ff5733' ),
			),
		),
		'surfaces' => array(
			array( 'bg' => '#f2f2f2', 'text' => '#000000', 'head' => '#000000', 'link' => '#ff3000' ),
			array( 'bg' => '#ffffff', 'text' => '#000000', 'head' => '#000000', 'link' => '#ff3000' ),
			array( 'bg' => '#000000', 'text' => '#ffffff', 'head' => '#ffffff', 'link' => '#ff3000' ),
		),
		'container' => 1280,
		'css'    => '',
		'footer' => array( 'bg' => '#000000', 'text' => '#f2f2f2' ),
		'page'   => '#ffffff',
	),

	'kinetic' => array(
		'label'   => 'Kinetic typography',
		'roles'   => array( 'Primary' => '#dfe104', 'Secondary' => '#a1a1aa', 'Accent' => '#dfe104', 'Muted' => '#a1a1aa' ),
		'heading' => array( 'family' => 'Space Grotesk', 'variation' => '700' ),
		'body'    => array( 'family' => 'Space Grotesk', 'variation' => 'regular', 'size' => 17, 'line-height' => 1.6, 'color' => '#fafafa' ),
		'weight'  => '700',
		'scale'   => array( 'h1' => array( 128, 0.90, -4.0 ), 'h2' => array( 60, 0.95, -2.0 ), 'h3' => array( 28, 1.25, -0.4 ), 'h4' => array( 19, 1.40, 0 ) ),
		'radius'  => 2,
		// Acid yellow at 14.91:1 under black and 1.41:1 under white, and the grey secondary at 8.19
		// versus 2.56. Both roles are light, so both take the ground colour as their label.
		'btn'     => array(
			'Primary'   => array(
				'default' => array( 'text_color' => '#09090b' ),
				'hover'   => array( 'text_color' => '#09090b', 'bg_color' => '#eef02e', 'border_color' => '#eef02e' ),
			),
			'Secondary' => array(
				'default' => array( 'text_color' => '#09090b' ),
				'hover'   => array( 'text_color' => '#09090b', 'bg_color' => '#c4c4cb', 'border_color' => '#c4c4cb' ),
			),
		),
		'surfaces' => array(
			array( 'bg' => '#121214', 'text' => '#fafafa', 'head' => '#fafafa', 'link' => '#dfe104' ),
			array( 'bg' => '#09090b', 'text' => '#fafafa', 'head' => '#fafafa', 'link' => '#dfe104' ),
			array( 'bg' => '#dfe104', 'text' => '#09090b', 'head' => '#09090b', 'link' => '#09090b' ),
		),
		'container' => 1320,
		// The third surface in this style is an INVERSION rather than a darker step - an acid band with
		// black type - so the primary button on it would be yellow on yellow. It is inverted there for
		// the same reason monochrome inverts on its dark band.
		'css'    => '.section--dark .btn-primary{background-color:#09090b;border-color:#09090b;color:#dfe104}',
		'footer' => array( 'bg' => '#09090b', 'text' => '#a1a1aa' ),
		'page'   => '#09090b',
	),

	'flat-design' => array(
		'label'   => 'Flat design',
		// The theme paints the SKIP LINK and body links with the Primary role, so Primary has to work
		// both as a fill and as text. The brief's #3B82F6 does neither: it is 3.68:1 on white in both
		// directions, and only passes with the ink ON it. #1D4ED8 is the same hue at 6.70:1 either way
		// round, so it carries a white label as a button AND reads as a link. The bright blue is still in
		// the style - as the large decorative shapes the brief describes - just not as a role.
		'roles'   => array( 'Primary' => '#1d4ed8', 'Secondary' => '#10b981', 'Accent' => '#1d4ed8', 'Muted' => '#4b5563' ),
		'heading' => array( 'family' => 'Outfit', 'variation' => '700' ),
		'body'    => array( 'family' => 'Outfit', 'variation' => 'regular', 'size' => 17, 'line-height' => 1.65, 'color' => '#111827' ),
		'weight'  => '700',
		'scale'   => array( 'h1' => array( 76, 1.05, -1.8 ), 'h2' => array( 42, 1.15, -0.8 ), 'h3' => array( 24, 1.35, 0 ), 'h4' => array( 18, 1.45, 0 ) ),
		'radius'  => 8,
		// Emerald is the one that still needs saying: white on it is 2.54:1 and the ink 8.28:1. (The
		// brief's amber is the same story at 2.15 versus 9.80, which is why it is not a button role.)
		// Primary now carries white at 6.70:1 and keeps the shipped label.
		'btn'     => array(
			'Secondary' => array(
				'default' => array( 'text_color' => '#111827' ),
				'hover'   => array( 'text_color' => '#111827', 'bg_color' => '#34d399', 'border_color' => '#34d399' ),
			),
		),
		'surfaces' => array(
			array( 'bg' => '#f3f4f6', 'text' => '#111827', 'head' => '#111827', 'link' => '#1d4ed8' ),
			array( 'bg' => '#ffffff', 'text' => '#111827', 'head' => '#111827', 'link' => '#1d4ed8' ),
			array( 'bg' => '#111827', 'text' => '#f3f4f6', 'head' => '#ffffff', 'link' => '#60a5fa' ),
		),
		'container' => 1140,
		'css'    => '',
		'footer' => array( 'bg' => '#111827', 'text' => '#d1d5db' ),
		'page'   => '#ffffff',
	),

	'art-deco' => array(
		'label'   => 'Art Deco',
		// Midnight is the Secondary rather than the pewter grey: white on pewter is 3.54:1 and fails,
		// while white on midnight is 11.25:1. The grey stays as the muted TEXT colour, where it is
		// 5.6:1 on the obsidian and perfectly safe.
		'roles'   => array( 'Primary' => '#d4af37', 'Secondary' => '#1e3d59', 'Accent' => '#d4af37', 'Muted' => '#888888' ),
		'heading' => array( 'family' => 'Marcellus', 'variation' => 'regular' ),
		'body'    => array( 'family' => 'Josefin Sans', 'variation' => 'regular', 'size' => 17, 'line-height' => 1.7, 'color' => '#f2f0e4' ),
		'weight'  => 'regular',
		'scale'   => array( 'h1' => array( 80, 1.10, 2.0 ), 'h2' => array( 44, 1.20, 1.5 ), 'h3' => array( 24, 1.35, 1.0 ), 'h4' => array( 18, 1.45, 0.8 ) ),
		'radius'  => 0,
		// Gold is a BRIGHT fill: white on it is 2.10:1, the obsidian 9.99:1.
		'btn'     => array(
			'Primary' => array(
				'default' => array( 'text_color' => '#0a0a0a' ),
				'hover'   => array( 'text_color' => '#0a0a0a', 'bg_color' => '#e0c158', 'border_color' => '#e0c158' ),
			),
		),
		'surfaces' => array(
			array( 'bg' => '#141414', 'text' => '#f2f0e4', 'head' => '#d4af37', 'link' => '#d4af37' ),
			array( 'bg' => '#0a0a0a', 'text' => '#f2f0e4', 'head' => '#d4af37', 'link' => '#d4af37' ),
			array( 'bg' => '#1e3d59', 'text' => '#f2f0e4', 'head' => '#d4af37', 'link' => '#d4af37' ),
		),
		'container' => 1080,
		'css'    => '',
		'footer' => array( 'bg' => '#0a0a0a', 'text' => '#888888' ),
		'page'   => '#0a0a0a',
	),

	'material-design' => array(
		'label'   => 'Material You',
		'roles'   => array( 'Primary' => '#6750a4', 'Secondary' => '#7d5260', 'Accent' => '#6750a4', 'Muted' => '#605a68' ),
		'heading' => array( 'family' => 'Roboto', 'variation' => '500' ),
		'body'    => array( 'family' => 'Roboto', 'variation' => 'regular', 'size' => 16, 'line-height' => 1.55, 'color' => '#1c1b1f' ),
		'weight'  => '500',
		'scale'   => array( 'h1' => array( 56, 1.15, 0 ), 'h2' => array( 40, 1.20, 0 ), 'h3' => array( 24, 1.30, 0 ), 'h4' => array( 18, 1.45, 0 ) ),
		// Every button a PILL - the single most identifiable trait of this system. 999 rather than a
		// large px value so it stays a pill at any height.
		'radius'  => 999,
		// Both roles carry white comfortably (6.44:1 and 6.47:1), so the shipped labels stand.
		'btn'     => array(),
		'surfaces' => array(
			array( 'bg' => '#f3edf7', 'text' => '#1c1b1f', 'head' => '#1c1b1f', 'link' => '#6750a4' ),
			array( 'bg' => '#fffbfe', 'text' => '#1c1b1f', 'head' => '#1c1b1f', 'link' => '#6750a4' ),
			array( 'bg' => '#e8def8', 'text' => '#1d192b', 'head' => '#1d192b', 'link' => '#6750a4' ),
		),
		'container' => 1140,
		// Tone alone is not a boundary: the card surface against the page is 1.12:1. The brief's rule is
		// "no border IN ADDITION TO elevation", so where there is no shadow there is an outline.
		'css'    => '.section--alt,.section--dark{border:1px solid #cac4d0}',
		'footer' => array( 'bg' => '#1c1b1f', 'text' => '#e6e1e5' ),
		'page'   => '#fffbfe',
	),

	'neo-brutalism' => array(
		'label'   => 'Neo-brutalism',
		'roles'   => array( 'Primary' => '#ff6b6b', 'Secondary' => '#ffd93d', 'Accent' => '#c4b5fd', 'Muted' => '#3d3d3d' ),
		'heading' => array( 'family' => 'Space Grotesk', 'variation' => '700' ),
		'body'    => array( 'family' => 'Space Grotesk', 'variation' => '500', 'size' => 17, 'line-height' => 1.5, 'color' => '#000000' ),
		'weight'  => '700',
		'scale'   => array( 'h1' => array( 96, 0.88, -3.0 ), 'h2' => array( 52, 0.92, -1.6 ), 'h3' => array( 28, 1.20, -0.4 ), 'h4' => array( 19, 1.40, 0 ) ),
		'radius'  => 0,
		// These are highlighter colours and highlighters are written on in black: white on the red is
		// 2.78:1 and on the yellow 1.38:1, while black is 7.57:1 and 15.24:1.
		'btn'     => array(
			'Primary'   => array(
				'default' => array( 'text_color' => '#000000' ),
				'hover'   => array( 'text_color' => '#000000', 'bg_color' => '#ff8787', 'border_color' => '#000000' ),
			),
			'Secondary' => array(
				'default' => array( 'text_color' => '#000000' ),
				'hover'   => array( 'text_color' => '#000000', 'bg_color' => '#ffe066', 'border_color' => '#000000' ),
			),
		),
		'surfaces' => array(
			array( 'bg' => '#fff8e6', 'text' => '#000000', 'head' => '#000000', 'link' => '#000000' ),
			array( 'bg' => '#fffdf5', 'text' => '#000000', 'head' => '#000000', 'link' => '#000000' ),
			array( 'bg' => '#000000', 'text' => '#fffdf5', 'head' => '#ffffff', 'link' => '#ffd93d' ),
		),
		'container' => 1240,
		// Two style-level rules, and the second was found by rendering rather than by reading options.
		// 1. The style IS the border and the hard shadow; neither is a Theme Settings value.
		// 2. The theme paints the SKIP LINK and the SITE TITLE with the Primary role, and this Primary
		//    is a highlighter red: on the cream page it measures 2.72:1 as text. It cannot simply be
		//    darkened, because the same value has to carry BLACK as a button fill - a colour dark
		//    enough to read as text on cream is too dark to carry black. The fill is what the style is
		//    about, so the fill keeps the red and the two chrome elements take the ink.
		'css'    => '.btn{border:4px solid #000!important;box-shadow:4px 4px 0 0 #000}'
		            . '.btn:active{transform:translate(4px,4px);box-shadow:none}'
		            . '.skip-link,.site-title-text{color:#000}',
		'footer' => array( 'bg' => '#ffd93d', 'text' => '#000000' ),
		'page'   => '#fffdf5',
	),

	'bold-typography' => array(
		'label'   => 'Bold typography',
		// The spec's own muted grey #737373 is 4.18:1 on this canvas and fails; #8C8C8C is 5.89:1.
		'roles'   => array( 'Primary' => '#ff3d00', 'Secondary' => '#8c8c8c', 'Accent' => '#ff3d00', 'Muted' => '#8c8c8c' ),
		'heading' => array( 'family' => 'Inter Tight', 'variation' => '600' ),
		'body'    => array( 'family' => 'Inter Tight', 'variation' => 'regular', 'size' => 16, 'line-height' => 1.6, 'color' => '#fafafa' ),
		'weight'  => '600',
		'scale'   => array( 'h1' => array( 128, 1.00, -7.0 ), 'h2' => array( 64, 1.05, -2.6 ), 'h3' => array( 28, 1.25, -0.6 ), 'h4' => array( 18, 1.45, 0 ) ),
		'radius'  => 0,
		// Vermillion under white is 3.55:1 and under the canvas colour 5.92:1; the grey is 3.36 versus
		// 6.25. Both roles take dark labels.
		'btn'     => array(
			'Primary'   => array(
				'default' => array( 'text_color' => '#0a0a0a' ),
				'hover'   => array( 'text_color' => '#0a0a0a', 'bg_color' => '#ff5c26', 'border_color' => '#ff5c26' ),
			),
			'Secondary' => array(
				'default' => array( 'text_color' => '#0a0a0a' ),
				'hover'   => array( 'text_color' => '#0a0a0a', 'bg_color' => '#a6a6a6', 'border_color' => '#a6a6a6' ),
			),
		),
		'surfaces' => array(
			array( 'bg' => '#1a1a1a', 'text' => '#fafafa', 'head' => '#fafafa', 'link' => '#ff3d00' ),
			array( 'bg' => '#0a0a0a', 'text' => '#fafafa', 'head' => '#fafafa', 'link' => '#ff3d00' ),
			array( 'bg' => '#fafafa', 'text' => '#0a0a0a', 'head' => '#0a0a0a', 'link' => '#ff3d00' ),
		),
		'container' => 1200,
		// The third surface inverts to near-white, so the outline/secondary button on it would go
		// light-on-light. Scoped once, here, rather than patched per page.
		'css'    => '.section--dark .btn-secondary{background-color:#0a0a0a;border-color:#0a0a0a;color:#fafafa}',
		'footer' => array( 'bg' => '#0a0a0a', 'text' => '#8c8c8c' ),
		'page'   => '#0a0a0a',
	),

	'academia' => array(
		'label'   => 'Academia',
		// Crimson is the SECONDARY and never an ink: as text on the mahogany it is 2.05:1, but as a
		// button fill carrying white it is 8.65:1 and entirely safe.
		'roles'   => array( 'Primary' => '#c9a962', 'Secondary' => '#8b2635', 'Accent' => '#c9a962', 'Muted' => '#9c8b7a' ),
		'heading' => array( 'family' => 'Cormorant Garamond', 'variation' => 'regular' ),
		'body'    => array( 'family' => 'Crimson Pro', 'variation' => 'regular', 'size' => 18, 'line-height' => 1.625, 'color' => '#e8dfd4' ),
		'weight'  => 'regular',
		'scale'   => array( 'h1' => array( 72, 1.10, -0.5 ), 'h2' => array( 44, 1.15, -0.3 ), 'h3' => array( 26, 1.30, 0 ), 'h4' => array( 19, 1.45, 0 ) ),
		'radius'  => 4,
		// Brass is bright: white on it is 2.10:1, the mahogany 9.99:1. Crimson is dark and keeps white.
		'btn'     => array(
			'Primary' => array(
				'default' => array( 'text_color' => '#1c1714' ),
				'hover'   => array( 'text_color' => '#1c1714', 'bg_color' => '#d4b872', 'border_color' => '#d4b872' ),
			),
		),
		'surfaces' => array(
			array( 'bg' => '#251e19', 'text' => '#e8dfd4', 'head' => '#e8dfd4', 'link' => '#c9a962' ),
			array( 'bg' => '#1c1714', 'text' => '#e8dfd4', 'head' => '#e8dfd4', 'link' => '#c9a962' ),
			array( 'bg' => '#3d332b', 'text' => '#e8dfd4', 'head' => '#e8dfd4', 'link' => '#c9a962' ),
		),
		'container' => 1120,
		// Secondary text must stay OFF the leather surface: #9C8B7A on #3D332B is 3.74:1, while it is
		// 5.40 on the canvas and 5.00 on the oak. The third surface therefore raises its muted text.
		'css'    => '.section--dark .text-muted,.section--dark .muted{color:#c4b5a4}',
		'footer' => array( 'bg' => '#1c1714', 'text' => '#9c8b7a' ),
		'page'   => '#1c1714',
	),

	'cyberpunk' => array(
		'label'   => 'Cyberpunk',
		// The spec's mutedForeground #6B7280 fails on all three of its own surfaces (4.09 / 3.85 /
		// 3.46). #9AA3B2 is 7.76:1 on the void.
		'roles'   => array( 'Primary' => '#00ff88', 'Secondary' => '#ff00ff', 'Accent' => '#00d4ff', 'Muted' => '#9aa3b2' ),
		'heading' => array( 'family' => 'Orbitron', 'variation' => '700' ),
		'body'    => array( 'family' => 'JetBrains Mono', 'variation' => 'regular', 'size' => 16, 'line-height' => 1.7, 'color' => '#e0e0e0' ),
		'weight'  => '700',
		'scale'   => array( 'h1' => array( 72, 1.05, 1.5 ), 'h2' => array( 42, 1.10, 1.5 ), 'h3' => array( 22, 1.30, 1.0 ), 'h4' => array( 17, 1.45, 0.8 ) ),
		'radius'  => 0,
		// The ink on the neon is 1.02:1 - identical luminance, so the label simply is not there. The
		// void on it is 15.66:1. Magenta is the same story at 3.14 versus 6.70.
		'btn'     => array(
			'Primary'   => array(
				'default' => array( 'text_color' => '#0a0a0f' ),
				'hover'   => array( 'text_color' => '#0a0a0f', 'bg_color' => '#33ffa3', 'border_color' => '#33ffa3' ),
			),
			'Secondary' => array(
				'default' => array( 'text_color' => '#0a0a0f' ),
				'hover'   => array( 'text_color' => '#0a0a0f', 'bg_color' => '#ff4dff', 'border_color' => '#ff4dff' ),
			),
		),
		'surfaces' => array(
			array( 'bg' => '#12121a', 'text' => '#e0e0e0', 'head' => '#e0e0e0', 'link' => '#00ff88' ),
			array( 'bg' => '#0a0a0f', 'text' => '#e0e0e0', 'head' => '#e0e0e0', 'link' => '#00ff88' ),
			array( 'bg' => '#1c1c2e', 'text' => '#e0e0e0', 'head' => '#e0e0e0', 'link' => '#00d4ff' ),
		),
		'container' => 1180,
		'css'    => '',
		'footer' => array( 'bg' => '#0a0a0f', 'text' => '#9aa3b2' ),
		'page'   => '#0a0a0f',
	),

	'web3' => array(
		'label'   => 'Web3',
		'roles'   => array( 'Primary' => '#f7931a', 'Secondary' => '#ffd600', 'Accent' => '#f7931a', 'Muted' => '#94a3b8' ),
		'heading' => array( 'family' => 'Space Grotesk', 'variation' => '600' ),
		'body'    => array( 'family' => 'Inter', 'variation' => 'regular', 'size' => 17, 'line-height' => 1.65, 'color' => '#ffffff' ),
		'weight'  => '600',
		'scale'   => array( 'h1' => array( 72, 1.08, -1.4 ), 'h2' => array( 44, 1.15, -0.8 ), 'h3' => array( 24, 1.35, 0 ), 'h4' => array( 18, 1.45, 0 ) ),
		// Pills - the brief makes every button fully round.
		'radius'  => 999,
		// Both fills are bright: white on the orange is 2.30:1 and on the gold 1.41:1, while the void
		// is 9.14:1 and 14.87:1.
		'btn'     => array(
			'Primary'   => array(
				'default' => array( 'text_color' => '#030304' ),
				'hover'   => array( 'text_color' => '#030304', 'bg_color' => '#ffa838', 'border_color' => '#ffa838' ),
			),
			'Secondary' => array(
				'default' => array( 'text_color' => '#030304' ),
				'hover'   => array( 'text_color' => '#030304', 'bg_color' => '#ffe14d', 'border_color' => '#ffe14d' ),
			),
		),
		'surfaces' => array(
			array( 'bg' => '#0f1115', 'text' => '#ffffff', 'head' => '#ffffff', 'link' => '#f7931a' ),
			array( 'bg' => '#030304', 'text' => '#ffffff', 'head' => '#ffffff', 'link' => '#f7931a' ),
			array( 'bg' => '#0a0a0c', 'text' => '#ffffff', 'head' => '#ffffff', 'link' => '#ffd600' ),
		),
		'container' => 1180,
		// Hairlines at 10% white, by instruction - "delicate boundaries without visual weight".
		'css'    => '.section--alt,.section--light,.section--dark{border-color:rgba(255,255,255,.1)}',
		'footer' => array( 'bg' => '#030304', 'text' => '#94a3b8' ),
		'page'   => '#030304',
	),

	'minimal-dark' => array(
		'label'   => 'Minimalist Dark',
		// The spec's mutedForeground #71717A fails on BOTH of its own surfaces - 4.09:1 on the canvas
		// and 3.57:1 on the card, which is lighter than the page. #8D8D99 is 6.02 and 5.26.
		'roles'   => array( 'Primary' => '#f59e0b', 'Secondary' => '#8d8d99', 'Accent' => '#f59e0b', 'Muted' => '#8d8d99' ),
		'heading' => array( 'family' => 'Space Grotesk', 'variation' => '700' ),
		'body'    => array( 'family' => 'Inter', 'variation' => 'regular', 'size' => 17, 'line-height' => 1.7, 'color' => '#fafafa' ),
		'weight'  => '700',
		'scale'   => array( 'h1' => array( 72, 1.05, -1.8 ), 'h2' => array( 40, 1.15, -1.0 ), 'h3' => array( 24, 1.35, 0 ), 'h4' => array( 18, 1.45, 0 ) ),
		'radius'  => 8,
		// An amber button LOOKS dark and is not: white on it is 2.15:1, the canvas colour 9.20:1.
		// The grey secondary is the same story at 2.9 versus 6.0.
		'btn'     => array(
			'Primary'   => array(
				'default' => array( 'text_color' => '#0a0a0f' ),
				'hover'   => array( 'text_color' => '#0a0a0f', 'bg_color' => '#fbbf24', 'border_color' => '#fbbf24' ),
			),
			'Secondary' => array(
				'default' => array( 'text_color' => '#0a0a0f' ),
				'hover'   => array( 'text_color' => '#0a0a0f', 'bg_color' => '#a6a6b0', 'border_color' => '#a6a6b0' ),
			),
		),
		'surfaces' => array(
			array( 'bg' => '#12121a', 'text' => '#fafafa', 'head' => '#fafafa', 'link' => '#f59e0b' ),
			array( 'bg' => '#0a0a0f', 'text' => '#fafafa', 'head' => '#fafafa', 'link' => '#f59e0b' ),
			array( 'bg' => '#1a1a24', 'text' => '#fafafa', 'head' => '#fafafa', 'link' => '#f59e0b' ),
		),
		'container' => 1140,
		// Borders at 8% white, by instruction - they define an edge without asking to be looked at.
		'css'    => '.section--alt,.section--light,.section--dark{border-color:rgba(255,255,255,.08)}',
		'footer' => array( 'bg' => '#0a0a0f', 'text' => '#8d8d99' ),
		'page'   => '#0a0a0f',
	),

	'playful-geometric' => array(
		'label'   => 'Playful geometric',
		// The brand violet the spec gives, #8B5CF6, fails in BOTH directions as a button: white on it
		// is 4.23:1 and the slate ink 3.45:1, so no label rescues it - and as text on the cream it is
		// 4.16:1. One step darker, #7C3AED, fixes all three at once (5.70 under white, 5.60 as text).
		// The bright violet is still in the style, as a decorative shape fill, just not as a role.
		'roles'   => array( 'Primary' => '#7c3aed', 'Secondary' => '#f472b6', 'Accent' => '#7c3aed', 'Muted' => '#475569' ),
		'heading' => array( 'family' => 'Outfit', 'variation' => '800' ),
		'body'    => array( 'family' => 'Plus Jakarta Sans', 'variation' => 'regular', 'size' => 17, 'line-height' => 1.65, 'color' => '#1e293b' ),
		'weight'  => '800',
		'scale'   => array( 'h1' => array( 76, 1.05, -1.6 ), 'h2' => array( 44, 1.15, -0.8 ), 'h3' => array( 26, 1.30, 0 ), 'h4' => array( 19, 1.45, 0 ) ),
		'radius'  => 16,
		// The confetti colours all fail under white and pass under the slate: pink 2.65 vs 5.52,
		// amber 1.67 vs 8.76, mint 1.92 vs 7.61. Pink is the only one that is a button role.
		'btn'     => array(
			'Secondary' => array(
				'default' => array( 'text_color' => '#1e293b' ),
				'hover'   => array( 'text_color' => '#1e293b', 'bg_color' => '#f9a8d4', 'border_color' => '#1e293b' ),
			),
		),
		'surfaces' => array(
			array( 'bg' => '#f1f5f9', 'text' => '#1e293b', 'head' => '#1e293b', 'link' => '#7c3aed' ),
			array( 'bg' => '#fffdf5', 'text' => '#1e293b', 'head' => '#1e293b', 'link' => '#7c3aed' ),
			array( 'bg' => '#1e293b', 'text' => '#fffdf5', 'head' => '#ffffff', 'link' => '#fbbf24' ),
		),
		'container' => 1200,
		// The sticker look IS the 2px border and the hard offset shadow, which grows on hover and
		// collapses on press. Neither is a Theme Settings value, so both are written once here.
		'css'    => '.btn{border:2px solid #1e293b!important;box-shadow:4px 4px 0 0 #1e293b}'
		            . '.btn:hover{box-shadow:6px 6px 0 0 #1e293b}'
		            . '.btn:active{box-shadow:2px 2px 0 0 #1e293b;transform:translate(2px,2px)}'
		            // On the slate band the sticker shadow is the SAME colour as the surface, so the
		            // sticker stops being a sticker. It flips to the page cream there.
		            . '.section--dark .btn{border-color:#fffdf5!important;box-shadow:4px 4px 0 0 #fffdf5}'
		            . '.section--dark .btn:hover{box-shadow:6px 6px 0 0 #fffdf5}'
		            . '.section--dark .btn:active{box-shadow:2px 2px 0 0 #fffdf5}',
		'footer' => array( 'bg' => '#1e293b', 'text' => '#e2e8f0' ),
		'page'   => '#fffdf5',
	),

	'claymorphism' => array(
		'label'   => 'Claymorphism',
		// This spec gets its two text colours right and says why - "never go lighter than this value"
		// about the muted grey, which is 5.58:1. Rare enough in this set to be worth keeping as given.
		'roles'   => array( 'Primary' => '#7c3aed', 'Secondary' => '#db2777', 'Accent' => '#7c3aed', 'Muted' => '#635f69' ),
		'heading' => array( 'family' => 'Nunito', 'variation' => '800' ),
		'body'    => array( 'family' => 'DM Sans', 'variation' => 'regular', 'size' => 17, 'line-height' => 1.625, 'color' => '#332f3a' ),
		'weight'  => '800',
		'scale'   => array( 'h1' => array( 88, 1.10, -2.0 ), 'h2' => array( 48, 1.15, -1.0 ), 'h3' => array( 26, 1.30, 0 ), 'h4' => array( 19, 1.45, 0 ) ),
		// 20px buttons, by instruction. The spec forbids 4-6px outright: a small radius reads as
		// generic and undoes the material in one stroke.
		'radius'  => 20,
		// The spec's primary button is a GRADIENT from #A78BFA to #7C3AED carrying white, and white on
		// the light end is 2.72:1 while on the dark end it is 5.70. A Theme Settings button is a flat
		// fill, so the preset simply uses the dark end and the trap does not arise. Hot pink carries
		// white at 4.60:1.
		'btn'     => array(),
		'surfaces' => array(
			array( 'bg' => '#ebe7f5', 'text' => '#332f3a', 'head' => '#332f3a', 'link' => '#7c3aed' ),
			array( 'bg' => '#f4f1fa', 'text' => '#332f3a', 'head' => '#332f3a', 'link' => '#7c3aed' ),
			array( 'bg' => '#332f3a', 'text' => '#f4f1fa', 'head' => '#ffffff', 'link' => '#a78bfa' ),
		),
		'container' => 1140,
		// The convex bulge and the squish. A clay shadow is TINTED with the object's own hue - a grey
		// shadow here is neumorphism, which is the thing this style defines itself against.
		'css'    => '.btn{box-shadow:12px 12px 24px rgba(124,58,237,.3),-6px -6px 16px rgba(255,255,255,.7)}'
		            . '.btn:hover{transform:translateY(-2px)}'
		            . '.btn:active{transform:scale(.95);box-shadow:inset 8px 8px 16px rgba(94,44,180,.35),inset -6px -6px 12px rgba(255,255,255,.25)}'
		            // The specular highlight assumes a light surface behind it. On the charcoal band it
		            // reads as a white haze around the button rather than as light on its upper ridge.
		            . '.section--dark .btn{box-shadow:12px 12px 24px rgba(124,58,237,.35),-4px -4px 12px rgba(255,255,255,.12)}',
		'footer' => array( 'bg' => '#332f3a', 'text' => '#d9d4e3' ),
		'page'   => '#f4f1fa',
	),

	'professional' => array(
		'label'   => 'Professional editorial',
		// The spec pairs accent #B8860B with accentForeground #FFFFFF, and the gold fails in BOTH
		// directions: 3.11:1 as text on the ivory and 3.25:1 under white. #8C6A0A is the same
		// burnished gold a few steps down - 4.81 as text, 5.02 under white - so one value serves the
		// link, the rule and the button fill, which is what a single-accent style needs.
		'roles'   => array( 'Primary' => '#8c6a0a', 'Secondary' => '#1a1a1a', 'Accent' => '#8c6a0a', 'Muted' => '#6b6b6b' ),
		'heading' => array( 'family' => 'Playfair Display', 'variation' => 'regular' ),
		'body'    => array( 'family' => 'Source Sans 3', 'variation' => 'regular', 'size' => 17, 'line-height' => 1.7, 'color' => '#1a1a1a' ),
		'weight'  => 'regular',
		'scale'   => array( 'h1' => array( 80, 1.08, -1.6 ), 'h2' => array( 44, 1.15, -0.8 ), 'h3' => array( 25, 1.35, 0 ), 'h4' => array( 18, 1.45, 0 ) ),
		'radius'  => 6,
		'btn'     => array(),
		'surfaces' => array(
			array( 'bg' => '#f5f3f0', 'text' => '#1a1a1a', 'head' => '#1a1a1a', 'link' => '#8c6a0a' ),
			array( 'bg' => '#fafaf8', 'text' => '#1a1a1a', 'head' => '#1a1a1a', 'link' => '#8c6a0a' ),
			array( 'bg' => '#1a1a1a', 'text' => '#f5f3f0', 'head' => '#ffffff', 'link' => '#d4a84b' ),
		),
		'container' => 1080,
		// Hairlines are the structure in this style - fine rules creating rhythm without weight - and
		// they are warmer than a neutral grey, which is the detail that keeps the ivory from reading
		// as a cheap off-white.
		'css'    => '.section--alt,.section--light{border-color:#e8e4df}',
		'footer' => array( 'bg' => '#1a1a1a', 'text' => '#d9d5d0' ),
		'page'   => '#fafaf8',
	),

	'botanical' => array(
		'label'   => 'Botanical',
		// The sage the spec names as "Primary/Accent" cannot be a role: 2.79:1 as text on the paper,
		// 2.97:1 under white, 4.01:1 under the forest ink - it fails every way round. The spec's own
		// primary BUTTON is deep forest with white (11.92:1), so forest is the role and the sage stays
		// what it actually is: a surface and a border colour.
		'roles'   => array( 'Primary' => '#2d3a31', 'Secondary' => '#5a6b55', 'Accent' => '#5a6b55', 'Muted' => '#5a6b55' ),
		'heading' => array( 'family' => 'Playfair Display', 'variation' => 'regular' ),
		'body'    => array( 'family' => 'Source Sans 3', 'variation' => 'regular', 'size' => 17, 'line-height' => 1.75, 'color' => '#2d3a31' ),
		'weight'  => 'regular',
		'scale'   => array( 'h1' => array( 80, 1.10, -1.4 ), 'h2' => array( 44, 1.20, -0.6 ), 'h3' => array( 25, 1.35, 0 ), 'h4' => array( 18, 1.45, 0 ) ),
		// Pills, by instruction - the primary button is rounded-full.
		'radius'  => 999,
		'btn'     => array(),
		'surfaces' => array(
			array( 'bg' => '#f2f0eb', 'text' => '#2d3a31', 'head' => '#2d3a31', 'link' => '#5a6b55' ),
			array( 'bg' => '#f9f8f4', 'text' => '#2d3a31', 'head' => '#2d3a31', 'link' => '#5a6b55' ),
			array( 'bg' => '#2d3a31', 'text' => '#f2f0eb', 'head' => '#ffffff', 'link' => '#dccfc2' ),
		),
		'container' => 1120,
		'css'    => '.section--alt,.section--light{border-color:#e6e2da}',
		'footer' => array( 'bg' => '#2d3a31', 'text' => '#dccfc2' ),
		'page'   => '#f9f8f4',
	),

	'vaporwave' => array(
		'label'   => 'Vaporwave',
		// Magenta and cyan are the hero colours and both are BRIGHT: white on the magenta is 3.14:1
		// and on the cyan 1.25:1. The void on them is 6.55 and 16.39. As TEXT on the void they are
		// 6.55 and 16.39 as well, so the same two values serve links and fills - which is lucky,
		// because this style uses them for both.
		'roles'   => array( 'Primary' => '#ff00ff', 'Secondary' => '#00ffff', 'Accent' => '#00ffff', 'Muted' => '#a79bc8' ),
		'heading' => array( 'family' => 'Orbitron', 'variation' => '700' ),
		'body'    => array( 'family' => 'Share Tech Mono', 'variation' => 'regular', 'size' => 16, 'line-height' => 1.7, 'color' => '#e0e0e0' ),
		'weight'  => '700',
		'scale'   => array( 'h1' => array( 72, 1.05, 2.0 ), 'h2' => array( 42, 1.15, 1.5 ), 'h3' => array( 24, 1.30, 1.0 ), 'h4' => array( 18, 1.45, 0.8 ) ),
		// Aggressively geometric - radius 0, by instruction.
		'radius'  => 0,
		'btn'     => array(
			'Primary'   => array(
				'default' => array( 'text_color' => '#090014' ),
				'hover'   => array( 'text_color' => '#090014', 'bg_color' => '#ff4dff', 'border_color' => '#ff4dff' ),
			),
			'Secondary' => array(
				'default' => array( 'text_color' => '#090014' ),
				'hover'   => array( 'text_color' => '#090014', 'bg_color' => '#66ffff', 'border_color' => '#66ffff' ),
			),
		),
		'surfaces' => array(
			array( 'bg' => '#1a103c', 'text' => '#e0e0e0', 'head' => '#00ffff', 'link' => '#00ffff' ),
			array( 'bg' => '#090014', 'text' => '#e0e0e0', 'head' => '#ff00ff', 'link' => '#00ffff' ),
			array( 'bg' => '#2d1b4e', 'text' => '#e0e0e0', 'head' => '#00ffff', 'link' => '#ff9900' ),
		),
		'container' => 1180,
		// Borders here are neon light tubes rather than dividers, which is a statement about WIDTH as
		// much as colour - a hairline cannot read as a tube.
		'css'    => '.section--alt,.section--dark{border-color:#2d1b4e}',
		'footer' => array( 'bg' => '#090014', 'text' => '#a79bc8' ),
		'page'   => '#090014',
	),

	'enterprise' => array(
		'label'   => 'Enterprise SaaS',
		'roles'   => array( 'Primary' => '#4f46e5', 'Secondary' => '#7c3aed', 'Accent' => '#4f46e5', 'Muted' => '#556175' ),
		'heading' => array( 'family' => 'Plus Jakarta Sans', 'variation' => '800' ),
		'body'    => array( 'family' => 'Plus Jakarta Sans', 'variation' => 'regular', 'size' => 17, 'line-height' => 1.7, 'color' => '#0f172a' ),
		'weight'  => '800',
		'scale'   => array( 'h1' => array( 72, 1.08, -1.6 ), 'h2' => array( 42, 1.15, -0.8 ), 'h3' => array( 24, 1.35, 0 ), 'h4' => array( 18, 1.45, 0 ) ),
		'radius'  => 12,
		// Indigo and violet both carry white comfortably (6.29 and 5.70). The EMERALD does not - 2.54
		// under white, 7.04 under the slate ink - so it stays a success indicator rather than becoming
		// a button role, which is what the spec uses it for anyway.
		'btn'     => array(),
		'surfaces' => array(
			array( 'bg' => '#f1f5f9', 'text' => '#0f172a', 'head' => '#0f172a', 'link' => '#4f46e5' ),
			array( 'bg' => '#f8fafc', 'text' => '#0f172a', 'head' => '#0f172a', 'link' => '#4f46e5' ),
			array( 'bg' => '#0f172a', 'text' => '#e2e8f0', 'head' => '#ffffff', 'link' => '#a5b4fc' ),
		),
		'container' => 1200,
		'css'    => '.section--alt,.section--light{border-color:#e2e8f0}',
		'footer' => array( 'bg' => '#0f172a', 'text' => '#94a3b8' ),
		'page'   => '#f8fafc',
	),

	'sketch' => array(
		'label'   => 'Sketchbook',
		// The correction-marker red fails three ways at normal size: 3.16:1 as text on the paper,
		// 3.27:1 under white, 4.21:1 under the pencil ink. #D63333 is the same marker red with the
		// saturation kept and the lightness pulled down - 4.64 as text, 4.79 under white.
		'roles'   => array( 'Primary' => '#d63333', 'Secondary' => '#2d5da1', 'Accent' => '#d63333', 'Muted' => '#5c5c5c' ),
		'heading' => array( 'family' => 'Kalam', 'variation' => '700' ),
		'body'    => array( 'family' => 'Patrick Hand', 'variation' => 'regular', 'size' => 19, 'line-height' => 1.65, 'color' => '#2d2d2d' ),
		'weight'  => '700',
		'scale'   => array( 'h1' => array( 76, 1.10, 0 ), 'h2' => array( 44, 1.20, 0 ), 'h3' => array( 27, 1.35, 0 ), 'h4' => array( 21, 1.45, 0 ) ),
		'radius'  => 12,
		'btn'     => array(),
		'surfaces' => array(
			array( 'bg' => '#f5f1e8', 'text' => '#2d2d2d', 'head' => '#2d2d2d', 'link' => '#2d5da1' ),
			array( 'bg' => '#fdfbf7', 'text' => '#2d2d2d', 'head' => '#2d2d2d', 'link' => '#2d5da1' ),
			array( 'bg' => '#2d2d2d', 'text' => '#fdfbf7', 'head' => '#ffffff', 'link' => '#ff9b9b' ),
		),
		'container' => 1080,
		// The hand-drawn line IS the style: a 2px pencil border with an irregular radius, so no two
		// corners match. A uniform radius here reads as a normal card with a funny font.
		'css'    => '.btn{border:2px solid #2d2d2d!important;border-radius:14px 22px 16px 20px}'
		            . '.btn:hover{border-radius:20px 14px 22px 16px}',
		'footer' => array( 'bg' => '#2d2d2d', 'text' => '#e5e0d8' ),
		'page'   => '#fdfbf7',
	),

	'industrial' => array(
		'label'   => 'Industrial control',
		// The alert red fails every way at normal size: 2.64:1 as text on the chassis, 3.34:1 under
		// white, 3.80:1 under the ink. #B82430 keeps the signal quality at 4.98 as text and 6.30
		// under white - and in a control-panel style the red IS a signal, so it has to be legible.
		'roles'   => array( 'Primary' => '#b82430', 'Secondary' => '#2d3436', 'Accent' => '#b82430', 'Muted' => '#4a5568' ),
		'heading' => array( 'family' => 'Inter', 'variation' => '800' ),
		'body'    => array( 'family' => 'Inter', 'variation' => 'regular', 'size' => 17, 'line-height' => 1.7, 'color' => '#2d3436' ),
		'weight'  => '800',
		'scale'   => array( 'h1' => array( 68, 1.05, -2.0 ), 'h2' => array( 40, 1.15, -1.0 ), 'h3' => array( 24, 1.35, 0 ), 'h4' => array( 18, 1.45, 0 ) ),
		'radius'  => 12,
		'btn'     => array(),
		'surfaces' => array(
			array( 'bg' => '#d1d9e6', 'text' => '#2d3436', 'head' => '#2d3436', 'link' => '#b82430' ),
			array( 'bg' => '#e0e5ec', 'text' => '#2d3436', 'head' => '#2d3436', 'link' => '#b82430' ),
			array( 'bg' => '#2d3436', 'text' => '#e0e5ec', 'head' => '#ffffff', 'link' => '#ff8a93' ),
		),
		'container' => 1200,
		// The extruded chassis: a light source top-left, so a raised control carries a white highlight
		// on that side and a dark shadow on the other. Two shadows, never one - one shadow is just a
		// card with a drop shadow, which is the thing this style is not.
		'css'    => '.btn{box-shadow:6px 6px 12px #babecc,-6px -6px 12px #ffffff}'
		            . '.btn:active{box-shadow:inset 4px 4px 8px #a3b1c6,inset -4px -4px 8px #ffffff}'
		            // The highlight half of the extrusion assumes a light chassis behind it. On the
		            // dark band it reads as a halo around the button instead of as light on its edge.
		            . '.section--dark .btn{box-shadow:6px 6px 14px rgba(0,0,0,.45),-4px -4px 10px rgba(255,255,255,.07)}',
		'footer' => array( 'bg' => '#2d3436', 'text' => '#c3cad6' ),
		'page'   => '#e0e5ec',
	),

	'neumorphism' => array(
		'label'   => 'Neumorphism',
		// The spec's accent #6C63FF fails in both directions on this very light chassis - 3.41:1 as
		// text and 4.32:1 under white - which is the recurring failure of soft-UI palettes: they are
		// chosen against a mid grey and then used on a near-white. #5048D6 is 5.12 and 6.48.
		'roles'   => array( 'Primary' => '#5048d6', 'Secondary' => '#246b67', 'Accent' => '#5048d6', 'Muted' => '#55606e' ),
		'heading' => array( 'family' => 'Plus Jakarta Sans', 'variation' => '700' ),
		'body'    => array( 'family' => 'DM Sans', 'variation' => 'regular', 'size' => 17, 'line-height' => 1.7, 'color' => '#3d4852' ),
		'weight'  => '700',
		'scale'   => array( 'h1' => array( 68, 1.10, -1.4 ), 'h2' => array( 40, 1.20, -0.8 ), 'h3' => array( 24, 1.35, 0 ), 'h4' => array( 18, 1.45, 0 ) ),
		'radius'  => 16,
		'btn'     => array(),
		'surfaces' => array(
			array( 'bg' => '#d6dbe3', 'text' => '#3d4852', 'head' => '#3d4852', 'link' => '#5048d6' ),
			array( 'bg' => '#e0e5ec', 'text' => '#3d4852', 'head' => '#3d4852', 'link' => '#5048d6' ),
			array( 'bg' => '#3d4852', 'text' => '#e0e5ec', 'head' => '#ffffff', 'link' => '#b3aeff' ),
		),
		'container' => 1140,
		// Extruded from the same surface rather than placed on it: a light shadow one way and a dark
		// one the other, inverted when pressed. The whole style lives in these two shadows.
		'css'    => '.btn{box-shadow:6px 6px 14px #babecc,-6px -6px 14px #ffffff}'
		            . '.btn:active{box-shadow:inset 5px 5px 10px #babecc,inset -5px -5px 10px #ffffff}'
		            // The highlight half of the extrusion assumes a light chassis behind it. On the
		            // dark band it reads as a halo around the button instead of as light on its edge.
		            . '.section--dark .btn{box-shadow:6px 6px 14px rgba(0,0,0,.45),-4px -4px 10px rgba(255,255,255,.07)}',
		'footer' => array( 'bg' => '#3d4852', 'text' => '#c6ccd4' ),
		'page'   => '#e0e5ec',
	),

	'organic' => array(
		'label'   => 'Organic',
		// Moss is a rare thing in this set: it works as a fill AND as text - 5.24:1 on the paper,
		// 5.38:1 under white - so one value does both jobs with nothing to reconcile. Terracotta does
		// not (2.85 / 2.93), so it stays a secondary surface and an outline colour, which is how the
		// spec uses it. The spec's own muted #78786C is 4.35:1 and just misses; #6B6B60 is 5.25.
		'roles'   => array( 'Primary' => '#5d7052', 'Secondary' => '#c18c5d', 'Accent' => '#5d7052', 'Muted' => '#6b6b60' ),
		'heading' => array( 'family' => 'Fraunces', 'variation' => '700' ),
		'body'    => array( 'family' => 'Nunito', 'variation' => 'regular', 'size' => 17, 'line-height' => 1.75, 'color' => '#2c2c24' ),
		'weight'  => '700',
		'scale'   => array( 'h1' => array( 76, 1.10, -1.2 ), 'h2' => array( 44, 1.20, -0.6 ), 'h3' => array( 25, 1.35, 0 ), 'h4' => array( 18, 1.45, 0 ) ),
		// Highly rounded, by instruction.
		'radius'  => 999,
		// Terracotta under white is 2.93:1 and under the loam ink 4.81:1, so a terracotta button takes
		// the ink.
		'btn'     => array(
			'Secondary' => array(
				'default' => array( 'text_color' => '#2c2c24' ),
				'hover'   => array( 'text_color' => '#2c2c24', 'bg_color' => '#d4a478', 'border_color' => '#d4a478' ),
			),
		),
		'surfaces' => array(
			array( 'bg' => '#f0ebe5', 'text' => '#2c2c24', 'head' => '#2c2c24', 'link' => '#5d7052' ),
			array( 'bg' => '#fdfcf8', 'text' => '#2c2c24', 'head' => '#2c2c24', 'link' => '#5d7052' ),
			array( 'bg' => '#2c2c24', 'text' => '#f0ebe5', 'head' => '#ffffff', 'link' => '#e6dccd' ),
		),
		'container' => 1120,
		'css'    => '.section--alt,.section--light{border-color:#ded8cf}',
		'footer' => array( 'bg' => '#2c2c24', 'text' => '#e6dccd' ),
		'page'   => '#fdfcf8',
	),

	'maximalism' => array(
		'label'   => 'Maximalism',
		// Five accents, and only the PURPLE carries white (5.69:1). Magenta is 2.94, cyan 1.40,
		// yellow 1.27, orange 2.84. All five read beautifully as TEXT on the void (3.39 to 15.21), so
		// the rule here is simple and absolute: a colour is either a fill with the void on it, or it
		// is type on the void. Never white on a fill.
		'roles'   => array( 'Primary' => '#ff3af2', 'Secondary' => '#00f5d4', 'Accent' => '#ffe600', 'Muted' => '#c9b8e8' ),
		'heading' => array( 'family' => 'Unbounded', 'variation' => '800' ),
		'body'    => array( 'family' => 'DM Sans', 'variation' => 'regular', 'size' => 17, 'line-height' => 1.65, 'color' => '#ffffff' ),
		'weight'  => '800',
		'scale'   => array( 'h1' => array( 96, 0.95, -2.4 ), 'h2' => array( 52, 1.05, -1.2 ), 'h3' => array( 26, 1.30, 0 ), 'h4' => array( 19, 1.45, 0 ) ),
		'radius'  => 0,
		'btn'     => array(
			'Primary'   => array(
				'default' => array( 'text_color' => '#0d0d1a' ),
				'hover'   => array( 'text_color' => '#0d0d1a', 'bg_color' => '#ff6bf5', 'border_color' => '#ff6bf5' ),
			),
			'Secondary' => array(
				'default' => array( 'text_color' => '#0d0d1a' ),
				'hover'   => array( 'text_color' => '#0d0d1a', 'bg_color' => '#4dffe2', 'border_color' => '#4dffe2' ),
			),
		),
		'surfaces' => array(
			array( 'bg' => '#1a1030', 'text' => '#ffffff', 'head' => '#ff3af2', 'link' => '#00f5d4' ),
			array( 'bg' => '#0d0d1a', 'text' => '#ffffff', 'head' => '#ffe600', 'link' => '#00f5d4' ),
			array( 'bg' => '#2d1b4e', 'text' => '#ffffff', 'head' => '#00f5d4', 'link' => '#ffe600' ),
		),
		'container' => 1320,
		// The stacked hard shadow - two or three solid offsets in different accents - is the whole
		// visual argument of the style. A blur anywhere turns it back into an ordinary card.
		'css'    => '.btn{border:3px solid #0d0d1a!important;box-shadow:8px 8px 0 #7b2fff,16px 16px 0 #ffe600}'
		            . '.btn:active{transform:translate(4px,4px);box-shadow:4px 4px 0 #7b2fff,8px 8px 0 #ffe600}',
		'footer' => array( 'bg' => '#0d0d1a', 'text' => '#c9b8e8' ),
		'page'   => '#0d0d1a',
	),

	'retro' => array(
		'label'   => 'Retro desktop',
		// The spec is right that there are "no grays for body text": #808080 on the silver chassis is
		// 2.17:1. Black is 11.54 and is the only body colour. The hyperlink blue works both ways
		// (4.72 as text, 8.59 under white), which is why it survives as the one accent; the pure red
		// does not (2.20 as text) and stays an emphasis colour on white panels only.
		'roles'   => array( 'Primary' => '#0000ff', 'Secondary' => '#000080', 'Accent' => '#0000ff', 'Muted' => '#000000' ),
		'heading' => array( 'family' => 'Archivo Black', 'variation' => 'regular' ),
		'body'    => array( 'family' => 'Inter', 'variation' => 'regular', 'size' => 16, 'line-height' => 1.55, 'color' => '#000000' ),
		'weight'  => 'regular',
		'scale'   => array( 'h1' => array( 56, 1.10, -0.5 ), 'h2' => array( 34, 1.20, 0 ), 'h3' => array( 22, 1.35, 0 ), 'h4' => array( 17, 1.45, 0 ) ),
		'radius'  => 0,
		'btn'     => array(),
		'surfaces' => array(
			array( 'bg' => '#ffffcc', 'text' => '#000000', 'head' => '#000000', 'link' => '#0000ff' ),
			array( 'bg' => '#c0c0c0', 'text' => '#000000', 'head' => '#000000', 'link' => '#0000ff' ),
			array( 'bg' => '#000080', 'text' => '#ffffff', 'head' => '#ffffff', 'link' => '#ffff00' ),
		),
		'container' => 1024,
		// The 3D bevel: white on the top and left, grey on the bottom and right, inverted when
		// pressed. It is the entire interface language of the era in four border colours.
		'css'    => '.btn{border-style:solid!important;border-width:2px!important;'
		            . 'border-color:#ffffff #808080 #808080 #ffffff!important}'
		            . '.btn:active{border-color:#808080 #ffffff #ffffff #808080!important}'
		            // On the navy band a blue button separates from its background at 2.44:1. The
		            // authentic control of this era is a silver face with black text anyway, which is
		            // both more faithful and legible.
		            . '.section--dark .btn{background-color:#c0c0c0!important;color:#000000!important}',
		'footer' => array( 'bg' => '#000080', 'text' => '#ffffff' ),
		'page'   => '#c0c0c0',
	),

);

if ( ! isset( $STYLES[ $style ] ) ) {
	fwrite( STDERR, "Unknown style '" . $style . "'. Known: " . implode( ', ', array_keys( $STYLES ) ) . "\n" );
	exit( 1 );
}
$S = $STYLES[ $style ];
$c = function ( $hex ) {
	return array( 'predefined' => '', 'custom' => (string) $hex );
};

echo 'Applying style: ' . $S['label'] . ( $dry ? '   (DRY RUN — nothing written)' : '' ) . "\n";
$plan  = array();
$notes = array();

/* 1 - Palette. Everything below leans on this, so it goes first. */
// START FROM THE SHIPPED DEFAULTS, not from what is currently saved. A preset sets only the few roles
// it cares about, so reading the saved palette would carry the PREVIOUS preset's roles underneath this
// one. Presets are applied one after another onto the same install to capture previews, so that is not
// a theoretical risk - it is the normal case.
$tc = function_exists( 'unysonplus_default_color_presets' )
	? unysonplus_default_color_presets()
	: (array) fw_get_db_settings_option( 'theme_colors', array() );
$hit = 0;
foreach ( $tc as &$p ) {
	if ( isset( $p['name'] ) && isset( $S['roles'][ $p['name'] ] ) ) {
		$p['color'] = $S['roles'][ $p['name'] ];
		$hit++;
	}
}
unset( $p );
$plan['theme_colors'] = $tc;
$notes[]              = 'palette roles set: ' . $hit . ' of ' . count( $S['roles'] ) . ' requested';
if ( $hit !== count( $S['roles'] ) ) {
	$notes[] = 'WARNING: a requested role name is not in the palette — check it against Theme Settings';
}

/* 2 - Type. */
$t                 = (array) fw_get_db_settings_option( 'typography', array() );
$t['heading_font'] = $S['heading'];
$t['body']         = array_merge( (array) ( isset( $t['body'] ) ? $t['body'] : array() ), $S['body'] );
foreach ( $S['scale'] as $tag => $v ) {
	$t[ $tag ] = array(
		'family'         => '',
		'variation'      => $S['weight'],
		'size'           => $v[0],
		'line-height'    => $v[1],
		'letter-spacing' => $v[2],
		'color'          => '',
	);
}
$plan['typography'] = $t;

/* 3 - Buttons: sparse overrides only (see note 1 at the top of this file). */
// Same reset, and this one was caught the hard way: monochrome overrides only Primary/hover, so when it
// was applied after modern-dark the Primary RESTING text stayed #0b0d10 and the hero button rendered
// black-on-black - an invisible label that every measurement of the dark band still called correct.
// Sparse means sparse relative to the shipped baseline, never relative to whatever ran last.
$bc = function_exists( 'unysonplus_default_button_color_presets' )
	? unysonplus_default_button_color_presets()
	: (array) fw_get_db_settings_option( 'button_colors', array() );
$touched = array();
foreach ( $bc as &$p ) {
	$name = isset( $p['color_name'] ) ? $p['color_name'] : '';
	if ( ! isset( $S['btn'][ $name ] ) ) {
		continue;
	}
	foreach ( $S['btn'][ $name ] as $state => $slots ) {
		foreach ( $slots as $slot => $hex ) {
			$p['states'][ $state ][ $slot ] = $c( $hex );
			$touched[]                      = $name . '/' . $state . '/' . $slot;
		}
	}
}
unset( $p );
$plan['button_colors'] = $bc;
$notes[]               = 'button slots overridden: ' . ( $touched ? implode( ', ', $touched ) : 'none (the palette already says it)' );

/* The radius goes on EVERY size. One rounded btn-sm surviving in a footer is what makes a zero-radius
 * site look half-reskinned rather than designed. */
$bs = (array) fw_get_db_settings_option( 'button_sizes', array() );
if ( empty( $bs ) && function_exists( 'unysonplus_default_button_size_presets' ) ) {
	$bs = unysonplus_default_button_size_presets();
}
foreach ( $bs as &$sz ) {
	$sz['border_radius'] = array( 'value' => (string) $S['radius'], 'unit' => 'px' );
}
unset( $sz );
$plan['button_sizes'] = $bs;
$notes[]              = 'radius ' . $S['radius'] . 'px applied to ' . count( $bs ) . ' button sizes';

/* 4 - Surfaces: rewritten IN PLACE so stored preset ids keep resolving (see note 2). */
$ss = (array) fw_get_db_settings_option( 'section_style_presets', array() );
$i  = 0;
foreach ( $ss as &$slot ) {
	if ( ! isset( $S['surfaces'][ $i ] ) ) {
		break;
	}
	$sk                                   = $S['surfaces'][ $i ];
	// style_name is deliberately left alone — it is what the `variant` slug is derived from (note 2).
	$slot['background']['color']['value'] = $c( $sk['bg'] );
	$slot['text_color']                   = $c( $sk['text'] );
	$slot['heading_color']                = $c( $sk['head'] );
	$slot['link_color']                   = $c( $sk['link'] );
	if ( isset( $slot['border_radius'] ) ) {
		$slot['border_radius'] = array( 'value' => (string) $S['radius'], 'unit' => 'px' );
	}
	$i++;
}
unset( $slot );
$plan['section_style_presets'] = $ss;
$notes[]                      = 'surfaces recoloured in place: ' . $i . ' of ' . count( $ss ) . ' presets (names/slugs untouched)';
if ( $i < count( $S['surfaces'] ) ) {
	$notes[] = 'NOTE: this style defines more surfaces than the install has preset slots; extras not added';
}

/* 5 - Measure. */
$gl                           = (array) fw_get_db_settings_option( 'general_layout', array() );
$gl['layout_container_width'] = array(
	'base' => array( 'value' => '100', 'unit' => '%' ),
	'md'   => array( 'value' => '720', 'unit' => 'px' ),
	'lg'   => array( 'value' => (string) $S['container'], 'unit' => 'px' ),
);
$plan['general_layout'] = $gl;

/* 5a - The PAGE background. A section with the Default variant wears no surface preset, so it falls
 * through to the site background - which a style that only recoloured the three surface presets never
 * set. On a dark style that is catastrophic and invisible in the data: the body text was correctly
 * light (#e8ecf1) while the page behind it stayed WHITE, so the hero and the type specimen rendered as
 * pale grey on white and were close to unreadable. The base surface is part of the style, not a
 * default to inherit. */
// NOTE the nesting: the theme reads `general_layout/site_background`, so this lives INSIDE the
// general_layout group. Written as a top-level `site_background` option it saves without complaint and
// is read by nothing at all - the stored value looked perfect while the page stayed white.
if ( isset( $S['page'] ) ) {
	$gl_bg                      = (array) fw_get_db_settings_option( 'general_layout', array() );
	$site_bg                    = isset( $gl_bg['site_background'] ) && is_array( $gl_bg['site_background'] )
		? $gl_bg['site_background'] : array();
	$site_bg['color']['value']  = $c( $S['page'] );
	// Written straight into the PLAN, because general_layout was assembled above and a later edit to
	// the local $gl would never reach it - the value saved cleanly into a copy nothing published.
	$plan['general_layout']['site_background'] = $site_bg;
	$notes[]                    = 'page background set to ' . $S['page'] . ' (general_layout/site_background)';
}

/* 5b - Chrome. The footer is NOT a section, so recolouring the surfaces leaves it on its own theme
 * default - measured at #1a1a1a while the Dark band was #111111, a mismatch you see immediately at the
 * bottom of the page and never in the stored options. A style owns the whole page, chrome included. */
if ( isset( $S['footer'] ) ) {
	$fb = (array) fw_get_db_settings_option( 'footer_background', array() );
	$fb['color']['value']          = $c( $S['footer']['bg'] );
	$plan['footer_background']     = $fb;
	$plan['footer_text_color']     = $c( $S['footer']['text'] );
	$notes[]                       = 'footer chrome set to ' . $S['footer']['bg'];
}

/* 5c - The style's own CSS. misc_custom_css is emitted at wp_head 999, after every stylesheet, and is
 * captured by design export - so it is where a rule that belongs to the STYLE (not to any one element)
 * goes. Per the house rule, element-level skins never carry this; the style does. */
// ALWAYS written, including when a style sets none. Skipping an empty one leaves the PREVIOUS style's
// rules in place, and because these presets are applied one after another onto the same install to
// capture previews, that silently contaminates the next preview - monochrome's invert-on-dark rule was
// found still live after modern-dark had been applied. A preset must fully determine the look, so
// anything it does not set is CLEARED rather than inherited.
$css_for_style             = isset( $S['css'] ) ? (string) $S['css'] : '';
$mc                        = (array) fw_get_db_settings_option( 'misc_custom_css', array() );
$mc['custom_css']          = $css_for_style;
$plan['misc_custom_css']   = $mc;
$notes[]                   = '' === $css_for_style
	? 'style CSS cleared (this style defines none)'
	: 'style CSS written: ' . strlen( $css_for_style ) . ' bytes';

foreach ( $plan as $k => $v ) {
	echo sprintf( "  %-24s %s\n", $k, $dry ? 'would write' : 'written' );
	if ( ! $dry ) {
		fw_set_db_settings_option( $k, $v );
	}
}
echo "\n";
foreach ( $notes as $n ) {
	echo '  - ' . $n . "\n";
}

if ( $dry ) {
	echo "\nDry run complete. Nothing written, no CSS regenerated.\n";
	exit( 0 );
}

/* 6 - REGENERATE (see note 3).
 *
 * The right function is unysonplus_ensure_preset_css_file() in framework/includes/css-tokens.php. Two
 * things about it that are easy to get wrong:
 *   - It is HASH-BASED and self-healing: the filename carries a hash of the preset state, and it purges
 *     other presets-*.css itself. So there is nothing to delete by hand, and a stale file is not the
 *     thing that breaks a restyle.
 *   - unysonplus_hf_regenerate_css() (the theme) is a DIFFERENT layer — header/footer CSS. It does not
 *     write presets-*.css, so calling it alone silently produces no preset file at all.
 *
 * And because the hash is computed from preset state AT CALL TIME, in the same process that just wrote
 * those options, a cached option value would quietly bake the OLD palette into the new file. So we do
 * not trust the call: we read the file back and require the style's own colour to be in it. */
$probe = isset( $S['roles']['Primary'] ) ? strtolower( $S['roles']['Primary'] ) : '';
if ( ! function_exists( 'unysonplus_ensure_preset_css_file' ) ) {
	echo "\n  WARNING: unysonplus_ensure_preset_css_file() missing — is the plugin active on this install?\n";
	exit( 1 );
}
$res = unysonplus_ensure_preset_css_file();
if ( ! is_array( $res ) ) {
	echo "\n  WARNING: preset CSS generation FAILED (returned false). The rendered page will NOT show this style.\n";
	exit( 1 );
}
$css   = (string) @file_get_contents( $res['path'] );
$bytes = strlen( $css );
echo "\n  preset CSS written: " . basename( $res['path'] ) . ' (' . number_format( $bytes ) . " bytes)\n";

$found = ( '' === $probe ) || ( false !== strpos( strtolower( $css ), $probe ) );
if ( $found ) {
	echo '  verified: the generated CSS contains this style\'s Primary (' . $probe . ")\n";
} else {
	echo '  *** FAILED: ' . $probe . " is NOT in the generated CSS.\n";
	echo "      The file was built from stale cached options. Re-run this script in a fresh process\n";
	echo "      (the options are already saved, so a second run regenerates from them correctly).\n";
}

/* Header/footer CSS is a separate layer and also goes stale on a palette change. */
if ( function_exists( 'unysonplus_hf_regenerate_css' ) ) {
	unysonplus_hf_regenerate_css();
	echo "  header/footer CSS regenerated\n";
}

echo "\nDone. Now check a RENDERED button, not the stored option: the stored value being right is\n";
echo "precisely what step 6 exists to stop you trusting.\n";
exit( $found ? 0 : 1 );

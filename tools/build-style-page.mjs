// Build the ONE demo page tree the style gallery renders under every style.
//
// The page's job is to make a style's decisions visible, so it is organised by the seven slots of the
// style model (docs/site-creator/styles/README.md) rather than by "what a landing page usually has":
// a hero (type scale + palette + button shape), a feature grid (card surface + icon treatment), an
// inverted band (the surface vocabulary), a type specimen (the scale, stated outright) and a CTA.
//
// ONE tree, seven styles. That is only possible because a section names its surface with a `variant`
// SLUG — alt / light / dark — and apply-style.php recolours those three presets without renaming them.
// If a style renamed them, this tree would have to be rebuilt per style and the gallery would stop
// being a comparison of the same page.
//
// Deliberately NOT here: anything whose look it would pre-empt. No per-element colours, no custom CSS,
// no inline font sizes. Every visible difference between two gallery entries must come from Theme
// Settings, because that is the claim the gallery exists to demonstrate. An element that carried its
// own colour would look identical under all seven and quietly prove the opposite.
//
//   node build-style-page.mjs            -> writes style-page.json
import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';

const uid = () => randomBytes(16).toString('hex');
const anim = () => ({ enable: 'no', yes: { effect: 'animate__fadeInUp', speed_preset: '', advanced_tweaks_heading: '', delay: 0, custom_duration: 0, repeat_count: 1, loop_forever: 'no', replay_on_scroll: 'no', easing: '' } });
const color = () => ({ predefined: '', custom: '' });
const spacing = () => ({ margin: { all: '', top: '', right: '', bottom: '', left: '' }, padding: { all: '', top: '', right: '', bottom: '', left: '' }, advanced: [] });
const bgImage = () => ({ type: 'custom', custom: '', predefined: '', data: { icon: '', css: [] } });
const bgPro = () => ({ color: { value: color() }, gradient: { data: { type: 'linear', angle: 90, stops: [] } }, image: { src: [], position: 'center center', size: { selected: 'cover', custom: '' }, repeat: 'no-repeat', attachment: 'scroll' }, video: { enabled: 'no', external_url: '', source_mp4: [], source_webm: [], poster: [], fallback: [], loop: 'yes', autoplay: 'yes', mute: 'yes', playsinline: 'yes' }, advanced: [] });
const common = (cls = '', id = '') => ({ unique_id: uid(), css_id: id, css_class: cls, custom_css: '', responsive_hide: [], custom_attrs: [], animation: anim() });

// `variant` is the surface preset slug: '' (theme default), 'alt', 'light', 'dark'.
const section = (variant, id, items) => ({ type: 'section', _items: items, atts: { variant, is_fullwidth: true, background_color: '', background_image: bgImage(), video: '', bleed_illustration: '', bleed_layout: { bleed_enabled: 'no', yes: {} }, bg_color: color(), padding_top: '', padding_bottom: '', gap: '', gap_x: '', gap_y: '', min_height: { preset: 'auto', custom: { custom_height: { value: '', unit: 'px' } } }, content_valign: 'top', background: bgPro(), ...common('', id) } });
const column = (width, items, align = 'default') => ({ type: 'column', width, _items: items, atts: { full_height: 'no', bg_color: color(), spacing: spacing(), mobile_order: '', w_phone: 'default', w_tablet: 'default', w_desktop: 'default', offset_phone: 'none', offset_tablet: 'none', offset_desktop: 'none', align_self: 'default', content_v: 'default', content_h: align, position: '', z_index: '', border_preset: '', inner_class: '', ...common('') } });
const leaf = (shortcode, atts = {}) => ({ type: 'simple', shortcode, _items: [], atts: { ...atts, ...common(atts.css_class || '') } });

const sh = (o) => leaf('special_heading', { title: o.title || '', overline: o.overline || '', subtitle: o.subtitle || '', heading: o.heading || 'h2', alignment: o.alignment || 'left', overline_align: o.alignment === 'center' ? 'center' : '', title_align: '', subtitle_align: '', overline_uppercase: 'yes', overline_marker: '', overline_marker_position: 'before', overline_container: '', element_spacing: '', block_max_width: { value: '', unit: 'px' }, display_size: '', subtitle_size: '', subtitle_max_width: { value: '', unit: 'rem' }, bg_color: color(), overline_color: color(), title_color: color(), subtitle_color: color(), spacing: spacing(), overline_class: '', title_class: '', subtitle_class: '' });
const tb = (html) => leaf('text_block', { text: html, text_color: color(), bg_color: color(), font_size_preset: '', spacing: spacing() });
const btn = (label, style = 'btn-primary', align = 'left') => leaf('button', { label, link: '#', target: '_self', icon: { type: 'none' }, icon_position: 'after', style, size: 'btn-lg', width: { mode: '', custom: { custom_width: { value: '', unit: 'px' } } }, alignment: align, state: '', hover_animation: '', spacing: spacing() });
const iconBox = (title, text) => leaf('icon_box', { icon: { type: 'none' }, custom_icon: '', title, title_tag: 'h4', content: `<p>${text}</p>`, style: 'top-title', icon_badge: 'none', icon_align: 'center', title_align: '', content_align: '', mobile_stack: true, box_link: '', link_target: false, link_rel: 'sponsored', bg_color: color(), font_size_preset: '', title_color: color(), content_color: color(), icon_color: color(), icon_badge_color: color(), spacing: spacing() });

/* The copy is about the STYLE, not about a fictional business. A gallery entry full of invented
 * testimonials from invented people is content the visitor has to look past to see the design, and it
 * would also be the exact "no invented content" rule the site spec enforces, broken in the showroom. */
const tree = [

	// 1 - Hero. The type scale and the button shape carry this; nothing here is coloured by hand.
	section('', 'sg-hero', [
		column('1_1', [
			sh({ overline: 'Style gallery', title: 'The design system decides.', heading: 'h1',
				subtitle: 'Every page on this site is built from the same elements as every other style in the gallery. Only the Theme Settings differ — palette, type, button shape, surfaces. Nothing below carries a colour of its own.' }),
			btn('See a section', 'btn-primary'),
		]),
	]),

	// 2 - Feature grid on the Alt surface. Three columns, so the card treatment and the heading
	//     rhythm are both visible at a glance.
	section('alt', 'sg-grid', [
		column('1_1', [ sh({ title: 'What a style sets', heading: 'h2', alignment: 'center',
			subtitle: 'Seven decisions, applied site-wide rather than per element.' }) ]),
		column('1_3', [ iconBox('Palette', 'Three roles — primary, secondary, accent — that buttons and links follow by reference, so changing one moves everything that uses it.') ]),
		column('1_3', [ iconBox('Type', 'A heading face, a body face and a scale. The jump from h1 to body is the loudest thing a visitor reads before any word of copy.') ]),
		column('1_3', [ iconBox('Shape', 'One radius, used everywhere. A single rounded control among square ones is what makes a site look half-finished rather than designed.') ]),
	]),

	// 3 - The inverted surface. This is the whole point of the surface vocabulary: the same markup,
	//     a different band, and the text/heading/link colours come along with it.
	section('dark', 'sg-dark', [
		column('1_1', [
			sh({ title: 'The same section, a different surface', heading: 'h2',
				subtitle: 'This band is identical to the one above it apart from the surface it names. Its text, headings and links are not set here — they come from the surface preset, which is why a dark style needs no separate dark-mode markup.' }),
			btn('A button on dark', 'btn-primary'),
		]),
	]),

	// 4 - The scale, stated outright. Headings in isolation make the ratios legible in a way a page
	//     of real content never does, and it is the fastest way to tell two styles apart.
	//
	//     NOTE the levels: h2 down to h5, never a second h1. A specimen is tempting to write as
	//     h1/h2/h3/h4 because that is the scale being shown, but the page already has its h1 in the
	//     hero, and a second one is a real document-outline defect — measured here as h1count: 2 before
	//     it was fixed. The h1 row is therefore described rather than reproduced.
	section('', 'sg-type', [
		column('1_2', [
			sh({ overline: 'h1 is the hero above', title: 'Heading two', heading: 'h2' }),
			sh({ title: 'Heading three', heading: 'h3' }),
			sh({ title: 'Heading four', heading: 'h4' }),
			sh({ title: 'Heading five', heading: 'h5' }),
		]),
		column('1_2', [
			tb('<p>Body copy at the size and measure this style sets. The line length here is the container width, which is part of the style rather than a per-page choice: a long measure reads as a document, a short one as a brochure, and the same words feel different in each.</p><p>A second paragraph, so the spacing between them is visible too — rhythm is easier to judge across a gap than inside one.</p>'),
			btn('Secondary', 'btn-secondary'),
		]),
	]),

	// 5 - CTA. Deliberately the plainest section on the page: one heading, one button, centred.
	section('alt', 'sg-cta', [
		column('1_1', [
			sh({ title: 'Build this with the create-site skill', heading: 'h2', alignment: 'center',
				subtitle: 'The gallery shows the styles. The skill applies one, then builds the pages on top of it.' }),
			btn('Open the creator', 'btn-primary', 'center'),
		], 'center'),
	]),
];

writeFileSync(new URL('./style-page.json', import.meta.url), JSON.stringify(tree));
console.log(`OK - style-page.json written (${tree.length} sections, surfaces: ${tree.map(s => s.atts.variant || 'default').join(', ')})`);

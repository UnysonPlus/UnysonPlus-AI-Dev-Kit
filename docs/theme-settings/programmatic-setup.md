# Programmatic Theme Settings setup (build-script reference)

Exact `fw_set_db_settings_option()` value shapes for standing up a site's **design system + chrome
from a script** (demo/import builders that boot as the site). This is the consolidated reference so a
build doesn't have to read plugin/theme PHP. Pair it with [site-build-protocol.md](../site-build-protocol.md)
(the order + rules) and [building-pages.md](../building-pages.md) (the page tree). All keys below are
top-level Theme Settings options unless noted; read a current value, merge, write back.

> Context: boot AS the site (set `$_SERVER['REQUEST_URI']` before `require wp-load.php`; on multisite
> `switch_to_blog()`), `wp_set_current_user(1)`. After writing settings outside the normal save flow,
> call **`unysonplus_hf_regenerate_css()`** and clear caches (`uploads/**/asset-optimizer/*`,
> `unysonplus/**/unysonplus-generated.css`, `presets-*.css`, `unysonplus/css/*.css`).

## 1. Colors — `theme_colors`
Preset list; the palette emits `--color-primary/secondary/accent/text/muted/bg` CSS tokens that
elements consume. Set role presets **by name** (seed defaults first if empty):
```php
$tc = fw_get_db_settings_option('theme_colors', array());
if (empty($tc) && function_exists('unysonplus_default_color_presets')) $tc = unysonplus_default_color_presets();
$roles = array('Primary'=>'#ff6b8b','Secondary'=>'#9d174d','Accent'=>'#facc15');
foreach ($tc as &$p) if (isset($p['name'],$p['color'],$roles[$p['name']])) $p['color'] = $roles[$p['name']];
unset($p); fw_set_db_settings_option('theme_colors', $tc);
```

## 2. Typography — `typography` (a `multi`)
`heading_font` + `body` + per-heading `h1`–`h6` overrides (each a typography-v2 value). Empty a
field to inherit. Match the source's measured scale (a Tailwind clone: H1≈72/H2≈48/H3≈24/H4≈18…).
```php
$t = (array) fw_get_db_settings_option('typography', array());
$t['heading_font'] = array('family'=>'Quicksand','variation'=>'700');
$t['body'] = array_merge((array)($t['body']??array()), array('family'=>'Quicksand','variation'=>'regular','size'=>20,'line-height'=>1.4,'color'=>'#543d3d'));
$ho = fn($sz,$lh,$ls,$c) => array('family'=>'','variation'=>'700','size'=>$sz,'line-height'=>$lh,'letter-spacing'=>$ls,'color'=>$c);
$t['h1']=$ho(72,1.05,-1.5,'#9d174d'); $t['h2']=$ho(48,1.12,-1,'#9d174d'); $t['h3']=$ho(24,1.3,-0.2,'#500724'); $t['h4']=$ho(18,1.4,0,'#500724');
fw_set_db_settings_option('typography', $t);
```

## 3. Layout — `general_layout` (a `multi`) → `layout_container_width`
Match the source's content max-width (default `lg` is **1170px**; `max-w-7xl`=1280, `max-w-6xl`=1152).
```php
$gl = (array) fw_get_db_settings_option('general_layout', array());
$gl['layout_container_width'] = array('base'=>array('value'=>'100','unit'=>'%'),'md'=>array('value'=>'720','unit'=>'px'),'lg'=>array('value'=>'1280','unit'=>'px'));
fw_set_db_settings_option('general_layout', $gl);
```

## 4. Nav menu
`wp_create_nav_menu('Primary')` (reuse by `wp_get_nav_menu_object`), `wp_update_nav_menu_item($id,0,['menu-item-title'=>…,'menu-item-url'=>'#anchor','menu-item-status'=>'publish','menu-item-type'=>'custom'])` per item, then `set_theme_mod('nav_menu_locations', ['primary'=>$id])`.

## 5. Header logo — `header_logo`
`logo_type` is a multi-picker; the lockup lives under `custom`. **Unset legacy flat keys first**
(`image`,`site_title`,`tagline`,`logo_icon`,…). `update_option('blogname'/'blogdescription')` (they sync).
```php
$hl['logo_type'] = array('logo_type'=>'custom','simple'=>array(),'custom'=>array(
  'site_title'=>'Pinky Bites','title_weight'=>'700','color'=>array('predefined'=>'','custom'=>'#9d174d'),
  'tagline_text'=>'Whimsical Cupcake Shop','tagline_color'=>array('predefined'=>'','custom'=>'#c98aa6'),
  'logo_layout'=>'stacked-left', // inline-*/stacked-*/eyebrow-*/icon-only ; stacked = tagline BELOW title
  'logo_icon'=>array('type'=>'svg','svg-source'=>'library','svg-id'=>'lucide/cake'),
  'logo_icon_frame'=>'circle', // none/rounded/squircle/circle/square/hexagon
  'logo_icon_color'=>array('predefined'=>'','custom'=>'#ff6b8b'),
  'logo_custom_css'=>"…", // brand polish; also how to set a RASTER logo: hide the svg + background-image the mark
));
```
**Source logo is a raster image?** Sideload it and set as the mark via `logo_custom_css`
(`.site-logo__mark svg{display:none}.site-logo__mark{background:url('…') center/contain no-repeat}`),
`logo_icon_frame=>'none'` — see the media rule in the protocol. Rendered classes: `.site-title-text`
(title), `.site-logo__sub` (tagline).

## 6. Header layout — `header_main` (a `multi`) → `main_left`/`main_center`/`main_right`
Each slot is an **addable-popup element list**. Element item shape:
`['element_type' => ['element' => '<type>', '<type>' => [...sub]]]`. Common: `logo`; `menu_area`
(`['menu_location'=>'primary']`); `cta_button` (`cta_text`/`cta_link`/`cta_style`/`cta_size`);
`custom_html` (`custom_html_content` — **runs `do_shortcode()`**, so `[wc_mini_cart …]` rides here).
```php
$hm['main_left']=array(array('element_type'=>array('element'=>'logo')));
$hm['main_center']=array(array('element_type'=>array('element'=>'menu_area','menu_area'=>array('menu_location'=>'primary'))));
$hm['main_right']=array(array('element_type'=>array('element'=>'custom_html','custom_html'=>array('custom_html_content'=>$minicart_shortcode))));
fw_set_db_settings_option('header_main', $hm);
```
Also **`header_menu`** (`menu_link_color`/`_hover_color`/`_font_size`) and **`header_topbar`**
(`topbar_center` = an element list, same shape) for an announcement strip.

## 7. Footer — `main_footer_columns` (multi-picker: count) + `footer_background` + `copyright_settings`
Nesting: `{ count:'N', 'N':{ main_footer_auto, main_footer_split, main_footer_col_1..N } }`. `split` =
array of `{w,name}` (widths sum to 100). **Use NATIVE elements per column** (see
[footer.md](footer.md) for every element's value shape) — `menu` (link columns), `icon_text`
(`icontext_icon`=`['type'=>'icon-font','icon-class'=>'fas fa-phone']`, `icontext_text`,
`icontext_link_type`,`icontext_link`), `social_icons` (profiles from Theme Settings → Social),
`text` (`text_content` WYSIWYG; column title = `<h2>` styled small) — **`custom_html` only for
bespoke markup** (e.g. a newsletter form).
```php
$el = fn($e,$s=array()) => array('element_type'=>array('element'=>$e,$e=>$s));
$mf = array('count'=>'4','4'=>array('main_footer_auto'=>'no',
  'main_footer_split'=>array(array('w'=>40,'name'=>''),array('w'=>20,'name'=>''),array('w'=>20,'name'=>''),array('w'=>20,'name'=>'')),
  'main_footer_col_1'=>array($el('text',array('text_content'=>'…blurb…')), $el('social_icons')),
  'main_footer_col_2'=>array($el('text',array('text_content'=>'<h2>Sweet Menu</h2>')), $el('menu',array('menu_id'=>$footerMenuId))),
  'main_footer_col_3'=>array($el('text',array('text_content'=>'<h2>Visiting Us</h2>')), $el('icon_text',array('icontext_icon'=>array('type'=>'icon-font','icon-class'=>'fas fa-phone'),'icontext_text'=>'+1 …','icontext_link_type'=>'phone','icontext_link'=>''))),
  'main_footer_col_4'=>array($el('text',array('text_content'=>'<h2>Sprinkles Club</h2><p>…</p>')), $el('custom_html',array('custom_html_content'=>'<form …></form>'))),
));
fw_set_db_settings_option('main_footer_columns', $mf);
```
**Header/footer bar styling → the section's `Custom Styling` block, NOT child CSS.** Each bar (header
`main`/`topbar`/`bottombar`, footer `pre_footer`/`main_footer`/`post_footer`/`copyright`) has a
`<prefix>_custom_styling` option for its **Background, Typography** (text size/weight/color), **Link
Color, Padding, Borders** — set the source's measured footer text spec here (e.g.
`main_footer_custom_styling.yes.main_footer_typography = {family,size,weight,color}`), not a
`.footer .builder-text-element{…}` rule. Full value shapes + the prefix→option-key table are in
[footer.md](footer.md#shared-custom-styling-block-prefix_custom_styling).

`footer_background` = full shape `{ color:{value:{predefined,custom}}, gradient, image, video, advanced }`.
`copyright_settings` = multi-picker `{ enabled:'yes', yes:{ copyright_columns:{ count:'1', '1':{ copyright_auto, copyright_split, copyright_col_1:[…text element…] } } } }` (`unysonplus_footer_equal_split($n)` for split).

## 8. Section padding (in the page-builder tree, not Theme Settings)
Section `padding_top`/`padding_bottom` are **responsive spacing-class** controls: value =
`{ base:'pt-9', md:'', lg:'' }` where the slug's number is the spacing scale (**0**=0, **5**=3rem/48px,
**9**=5rem/80px, 12=8rem). Prefix `pt`/`pb`. So `py-20`(80px)=`pt-9`/`pb-9`, `py-10`(40px)≈`pt-5`.

## Order + verify
Colors → Typography → Container width → Header (logo/main/menu/topbar) → Footer → THEN page sections.
Regenerate CSS + clear caches, then verify **region-by-region** against the source (see the protocol).

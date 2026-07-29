# image-style-picker

A dropdown of **image style presets** with a live visual preview of each. The image-side
counterpart to the button / border / table style pickers: the user picks a named preset defined
elsewhere (Theme Settings), and the element emits that preset's class.

## Stored value shape

```json
"imgs-polaroid"
```

A single **string** — the chosen preset's key, which is also the CSS class to emit. Default:
`''` (nothing selected) when `allow_none` is on.

## Declaring it

```php
'image_style' => [
	'type'        => 'image-style-picker',
	'label'       => __( 'Image Style', 'fw' ),
	'value'       => '',
	'choices'     => [ /* 'imgs-<slug>' => [ 'label' => …, … ] */ ],
	'placeholder' => __( '— Select an image style —', 'fw' ),
	'allow_none'  => true,
],
```

| Config | Default | Notes |
|---|---|---|
| `value` | `''` | The default preset key. |
| `choices` | `[]` | Preset key → preset info. Usually built from the live registry rather than hardcoded, so the dropdown tracks Theme Settings. |
| `placeholder` | `'— Select an image style —'` | Shown when nothing is chosen. |
| `allow_none` | `true` | When `false`, an empty submission falls back to `value` instead of storing `''`. |

## Consuming it

The stored key **is** the class:

```php
$style = isset( $atts['image_style'] ) ? trim( (string) $atts['image_style'] ) : '';
printf( '<img class="%s" src="%s" alt="%s" />',
	esc_attr( trim( 'my-element__image ' . $style ) ),
	esc_url( $url ),
	esc_attr( $alt )
);
```

## Notes / gotchas

- **Input is validated against `choices`.** A submitted value that is not a known key (or `''`
  when `allow_none`) silently falls back to the option's `value`. So a preset key that is
  renamed or removed does not corrupt saved data — it reverts to the default, which is usually
  what you want but is worth knowing when a user reports "my style reset itself".
- The preview styling comes from the admin's own token stylesheet, not from this option type —
  previews style themselves from the same `.imgs-*` rules the front end uses. Adding a preset in
  Theme Settings is enough; the picker needs no extra assets.
- Like every `*-style-picker`, this stores a **class key, not a set of declarations**. The
  visual definition lives in Theme Settings, so changing a preset there updates every element
  that uses it. That is the point — do not "improve" it into storing raw CSS.

See also: [button-style-picker.md](button-style-picker.md) ·
[border-style-picker.md](border-style-picker.md) · [table-style-picker.md](table-style-picker.md) ·
[image-picker.md](image-picker.md) (a different thing: choosing a *variant* by clicking a
thumbnail).

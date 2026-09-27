<?php
/**
 * SETTINGS AUDIT — will every value the Site Converter writes survive the user editing it?
 *
 * A Theme Settings option renders through a CONTROL, and a control can only hold values it is able to
 * represent. Hand a `select` a string that is not one of its choices and the field renders fine — then the
 * next save of that tab submits something the control CAN represent and the converter's value is gone. That
 * is invisible until a user opens the tab and clicks Save, which is why it reached a bug report
 * ("the top spacing of the entire footer disappears when I edit the footer settings") rather than a test.
 *
 * This walks EVERY key a real conversion writes, finds the option that will render it, and asks whether the
 * control can hold that value. It is a static check — no saving, no DB writes — so it is safe to run against
 * a live install.
 *
 * Usage:
 *   php D:/xampp/wp-cli.phar --path=D:/xampp/htdocs --allow-root eval-file \
 *       "D:/Web Dev/UnysonPlus-AI-Dev-Kit/tools/settings-audit/audit.php" [<capture-dir> ...]
 *
 * With no argument it audits the values currently stored on the site; with capture dirs it builds each one
 * through the real converter and audits what that conversion WOULD write.
 */

if ( ! function_exists( 'fw' ) || ! fw()->theme ) {
	echo "FAIL: Unyson not loaded (run through wp-cli eval-file against a WP install).\n";
	return;
}

@ini_set( 'memory_limit', '3072M' );

/* ---------------------------------------------------------------------------------------------
 * 1. The registered options, flattened to leaves keyed by option id.
 * ------------------------------------------------------------------------------------------- */
$OPTS = array();
$flatten = function ( $options, $path ) use ( &$flatten, &$OPTS ) {
	if ( ! is_array( $options ) ) { return; }
	foreach ( $options as $id => $opt ) {
		if ( ! is_array( $opt ) ) { continue; }
		// get_settings_options() returns a LIST of option maps (one per registered options file), so a
		// numeric key — or any entry with no `type` and no `options` — is a nested map, not an option.
		if ( is_int( $id ) || ( ! isset( $opt['type'] ) && ! isset( $opt['options'] ) ) ) { $flatten( $opt, $path ); continue; }
		$type = isset( $opt['type'] ) ? $opt['type'] : '';
		// containers hold other options and are not values themselves
		if ( in_array( $type, array( 'tab', 'box', 'group' ), true ) || ( '' === $type && isset( $opt['options'] ) ) ) {
			$flatten( isset( $opt['options'] ) ? $opt['options'] : array(), $path );
			continue;
		}
		if ( is_string( $id ) && '' !== $id ) { $OPTS[ $id ] = $opt; }
		// a multi-picker's own sub-options are addressed as `<id>/<choice>/<sub>` — record the picker
		if ( 'multi-picker' === $type ) {
			foreach ( (array) ( $opt['choices'] ?? array() ) as $ck => $sub ) {
				$flatten( is_array( $sub ) ? $sub : array(), $path );
			}
		}
	}
};
$flatten( fw()->theme->get_settings_options(), '' );

/* ---------------------------------------------------------------------------------------------
 * 2. Can this control hold this value?
 *    Returns '' when fine, else a one-line reason.
 * ------------------------------------------------------------------------------------------- */
$choice_keys = function ( $opt ) {
	$c = isset( $opt['choices'] ) ? $opt['choices'] : array();
	if ( is_callable( $c ) && ! is_string( $c ) ) { $c = call_user_func( $c ); }
	return is_array( $c ) ? array_map( 'strval', array_keys( $c ) ) : array();
};

/**
 * THE TEST: round-trip the value through its own control.
 *
 * Every control turns what it renders back into a stored value via get_value_from_input(). If a value
 * cannot survive that trip it is, by definition, a value the control cannot hold — so the moment the user
 * opens that tab and saves, it is replaced. This is empirical: it needs no per-type knowledge and catches
 * every class at once (a choice the select does not offer, an array handed to a scalar control, a shape a
 * multi-picker cannot read). The type-specific notes below only explain WHY a value failed.
 */
$round_trip = function ( $opt, $value ) {
	$type = isset( $opt['type'] ) ? $opt['type'] : '';
	if ( '' === $type ) { return array( true, '' ); }
	$ot = fw()->backend->option_type( $type );
	if ( ! $ot || is_a( $ot, 'FW_Option_Type_Undefined' ) ) { return array( true, '' ); }
	$prev = error_reporting( 0 ); // a mismatched shape can warn ("Array to string conversion") — that is the symptom, not the report
	try {
		$back = $ot->get_value_from_input( $opt, $value );
	} catch ( Throwable $e ) {
		// A control that ERRORS on a stored value is the same defect, louder: the option screen cannot
		// render or save that tab at all. Report it rather than letting it end the audit.
		error_reporting( $prev );
		return array( false, '(the control throws: ' . $e->getMessage() . ')' );
	}
	error_reporting( $prev );

	// A container control (multi / multi-picker) legitimately FILLS IN defaults for sub-options the stored
	// value does not mention, so the result is bigger than the input — that is normalisation, not loss. The
	// question that matters is narrower: does every leaf we actually wrote come back unchanged? Compare the
	// original's leaves against the result and ignore anything the control merely added.
	$lost = array();
	$walk = function ( $orig, $round, $path ) use ( &$walk, &$lost ) {
		if ( is_array( $orig ) ) {
			foreach ( $orig as $k => $v ) {
				$sub = is_array( $round ) && array_key_exists( $k, $round ) ? $round[ $k ] : null;
				if ( ! is_array( $round ) || ! array_key_exists( $k, $round ) ) {
					// Losing an EMPTY value is not losing anything — and a multi-picker legitimately drops the
					// branch of a choice that is not selected, which is always empty when the converter wrote
					// it only to shape the array. Report a dropped key only when it actually held something.
					if ( array() === $v || '' === $v || null === $v ) { continue; }
					$lost[] = ltrim( $path . '/' . $k, '/' ) . ' (dropped)';
					continue;
				}
				$walk( $v, $sub, $path . '/' . $k );
			}
			return;
		}
		// 0 vs "0" is the same value in a different PHP type — the form round-trips everything through
		// strings, so a numeric re-type is normalisation, not loss. Compare the MEANING.
		$same = ( wp_json_encode( $orig ) === wp_json_encode( $round ) )
			|| ( is_scalar( $orig ) && is_scalar( $round ) && ! is_bool( $orig ) && ! is_bool( $round ) && (string) $orig === (string) $round );
		if ( ! $same ) {
			$lost[] = ltrim( $path, '/' ) . ': ' . wp_json_encode( $orig ) . ' -> ' . wp_json_encode( $round );
		}
	};
	$walk( $value, $back, '' );

	return array( empty( $lost ), $lost ? implode( ' | ', array_slice( $lost, 0, 3 ) ) . ( count( $lost ) > 3 ? ' (+' . ( count( $lost ) - 3 ) . ' more)' : '' ) : $back );
};

$check = function ( $id, $opt, $value ) use ( $choice_keys, $round_trip ) {
	$type = isset( $opt['type'] ) ? $opt['type'] : '';

	list( $survives, $back ) = $round_trip( $opt, $value );
	if ( $survives ) { return ''; }
	$became = is_string( $back ) ? $back : wp_json_encode( $back );
	$became = substr( (string) $became, 0, 150 );

	// THE OPTION'S OWN DEFAULT IS THE GROUND TRUTH FOR SHAPE. An image-picker whose default is array('top')
	// is a MULTIPLE picker and an array value is correct; judging it by its type name alone reported a
	// false positive. Only flag a shape when it disagrees with the shape the option itself ships.
	if ( array_key_exists( 'value', $opt ) ) {
		if ( is_array( $opt['value'] ) && is_array( $value ) ) { return ''; }
	}

	// --- controls backed by a fixed CHOICE LIST: the value must be one of them -------------------
	if ( in_array( $type, array( 'select', 'radio', 'image-picker', 'radio-text', 'button-set', 'short-select' ), true ) ) {
		if ( is_array( $value ) ) { return "$type given an ARRAY; it stores a scalar choice"; }
		$keys = $choice_keys( $opt );
		if ( ! $keys ) { return ''; } // choices built at render time from live data — not statically checkable
		if ( ! in_array( (string) $value, $keys, true ) ) {
			return "$type cannot hold '" . (string) $value . "' — choices: " . implode( ', ', array_slice( $keys, 0, 8 ) ) . ( count( $keys ) > 8 ? ' …' : '' );
		}
	}

	if ( 'multi-select' === $type ) {
		$pop = isset( $opt['population'] ) ? $opt['population'] : 'array';
		if ( 'array' !== $pop ) { return ''; } // posts/taxonomy populations are dynamic
		$keys = $choice_keys( $opt );
		if ( ! $keys ) { return ''; }
		foreach ( (array) $value as $v ) {
			if ( ! in_array( (string) $v, $keys, true ) ) {
				return "multi-select cannot hold '" . (string) $v . "' — choices: " . implode( ', ', array_slice( $keys, 0, 8 ) );
			}
		}
	}

	if ( 'switch' === $type ) {
		$l = isset( $opt['left-choice']['value'] ) ? (string) $opt['left-choice']['value'] : 'no';
		$r = isset( $opt['right-choice']['value'] ) ? (string) $opt['right-choice']['value'] : 'yes';
		if ( ! in_array( (string) $value, array( $l, $r ), true ) ) {
			return "switch cannot hold '" . (string) $value . "' — it is $l / $r";
		}
	}

	// --- shaped controls: the VALUE SHAPE has to match or the field renders empty ------------------
	if ( 'unit-input' === $type ) {
		if ( ! is_array( $value ) ) { return 'unit-input given a scalar; it stores { value, unit }'; }
		$units = isset( $opt['units'] ) ? array_map( 'strval', (array) $opt['units'] ) : array();
		$u     = isset( $value['unit'] ) ? (string) $value['unit'] : '';
		if ( $units && '' !== $u && ! in_array( $u, $units, true ) ) {
			return "unit '$u' is not offered — units: " . implode( ', ', $units );
		}
	}

	if ( 'multi-picker' === $type ) {
		if ( ! is_array( $value ) ) { return 'multi-picker given a scalar; it stores { <picker>: choice, <choice>: {…} }'; }
		$picker = isset( $opt['picker'] ) && is_array( $opt['picker'] ) ? $opt['picker'] : array();
		$pid    = key( $picker );
		if ( null === $pid ) { return ''; }
		$pval = isset( $value[ $pid ] ) ? (string) $value[ $pid ] : '';
		$keys = $choice_keys( $picker[ $pid ] );
		if ( $keys && '' !== $pval && ! in_array( $pval, $keys, true ) ) {
			return "multi-picker '$pid' set to '$pval', which is not one of its choices — the modal opens blank";
		}
	}

	if ( in_array( $type, array( 'color-picker', 'rgba-color-picker', 'predefined-colors-color-picker', 'predefined-colors-color-picker-compact' ), true ) ) {
		// the compact/predefined pickers store { predefined, custom }; the plain ones a string
		if ( in_array( $type, array( 'predefined-colors-color-picker', 'predefined-colors-color-picker-compact' ), true ) ) {
			if ( ! is_array( $value ) ) { return 'predefined color picker given a scalar; it stores { predefined, custom }'; }
		} elseif ( is_array( $value ) ) {
			return "$type given an ARRAY; it stores a colour string";
		}
	}

	if ( 'typography' === $type && ! is_array( $value ) ) { return 'typography given a scalar; it stores an array'; }
	if ( 'spacing' === $type && ! is_array( $value ) ) { return 'spacing given a scalar; it stores an array'; }

	// The round trip failed and no rule above explains it — report what the control actually did.
	return "$type loses: $became";
};

/* ---------------------------------------------------------------------------------------------
 * 3. The values to audit.
 * ------------------------------------------------------------------------------------------- */
$dirs = array();
foreach ( (array) ( $args ?? array() ) as $a ) { if ( is_string( $a ) && is_dir( $a ) ) { $dirs[] = $a; } }
if ( ! $dirs ) {
	global $argv;
	foreach ( (array) $argv as $a ) { if ( is_string( $a ) && is_dir( $a ) && is_file( rtrim( $a, '/\\' ) . '/rendered.html' ) ) { $dirs[] = $a; } }
}

$sets = array();
if ( $dirs ) {
	$prev = error_reporting( 0 );
	foreach ( $dirs as $d ) {
		$html = (string) @file_get_contents( rtrim( $d, '/\\' ) . '/rendered.html' );
		if ( '' === trim( $html ) ) { continue; }
		$r = FW_Site_Converter_Sources::build_from_html( $html, 'Audit', array( 'dynamic_chrome' => true, 'hifi_css' => true ) );
		$v = $r['files']['theme-settings.json']['values'] ?? array();
		if ( $v ) { $sets[ basename( $d ) ] = $v; }
	}
	error_reporting( $prev );
} else {
	// The settings row is keyed by the FRAMEWORK's theme name, which is not the active stylesheet (a
	// converted child theme has its own slug). Find the row rather than guessing at its suffix.
	global $wpdb;
	$row = $wpdb->get_var( "SELECT option_name FROM {$wpdb->options} WHERE option_name LIKE 'fw_theme_settings_options:%' ORDER BY LENGTH(option_value) DESC LIMIT 1" );
	$sets[ '(stored on this site: ' . ( $row ? $row : 'none found' ) . ')' ] = $row ? (array) get_option( $row, array() ) : array();
}

/* ---------------------------------------------------------------------------------------------
 * 4. Report.
 * ------------------------------------------------------------------------------------------- */
echo "\n=== SITE CONVERTER -> THEME SETTINGS AUDIT ===\n";
echo 'registered options: ' . count( $OPTS ) . "\n";

$all_problems = array();
$unregistered = array();
$checked_total = 0;

foreach ( $sets as $label => $values ) {
	$problems = array();
	$checked  = 0;
	foreach ( $values as $id => $value ) {
		if ( ! isset( $OPTS[ $id ] ) ) { $unregistered[ $id ] = true; continue; }
		$checked++;
		$why = $check( $id, $OPTS[ $id ], $value );
		if ( '' !== $why ) {
			$problems[] = array( 'id' => $id, 'type' => $OPTS[ $id ]['type'] ?? '?', 'why' => $why, 'value' => $value );
			$all_problems[ $id ] = $why;
		}
	}
	$checked_total += $checked;
	printf( "\n%-46s  %d value(s) checked, %d problem(s)\n", $label, $checked, count( $problems ) );
	foreach ( $problems as $p ) {
		printf( "   %-34s [%s]\n      %s\n", $p['id'], $p['type'], $p['why'] );
	}
}

echo "\n--------------------------------------------------------------------------\n";
printf( "%d value(s) checked across %d set(s)\n", $checked_total, count( $sets ) );
printf( "%d DISTINCT option(s) a user could lose by opening the tab and saving\n", count( $all_problems ) );
if ( $unregistered ) {
	printf( "\n%d key(s) written that are NOT registered options (stored, but no control ever shows them):\n   %s\n",
		count( $unregistered ), implode( ', ', array_slice( array_keys( $unregistered ), 0, 25 ) ) );
}
echo "\n";

<?php
session_start();
require('includes/user.php');
require('includes/config.php');
$db = mysqli_connect($dbhost,$dbuname,$dbupass,$dbname);
$uid = $_SESSION['uid'];
$alvl = $_SESSION['access_level'];
date_default_timezone_set('America/New_York');

function sanitize($s) {
	global $db;
	// return htmlentities(br2nl(addslashes(mysqli_real_escape_string($db, $s))), ENT_QUOTES);
	return htmlentities(br2nl(mysqli_real_escape_string($db, $s)), ENT_QUOTES);
}
function msqle($s) {
	global $db;
	return mysqli_real_escape_string($db, $s);
}
function htmlencode($s) {
	return br2nl(htmlentities($s, ENT_QUOTES));
}
function desanitize($s) {
	//return nlTobr(html_entity_decode($s));
	return nlTobr($s);
}
function br2nl($s) {
    return preg_replace('/\<br(\s*)?\/?\>/i', "\n", $s);
}
function nlTobr($s) {
	return str_replace( "\n", '<br>', $s);
}
if(isset($_POST['edit_color'])) {
	$colorToEdit = sanitize($_POST['edit_color']);
	$colorToSet = sanitize($_POST['new_color']);

	//config after
	$cfg_orig = 'includes/config.php';
	$cfg_tmp = 'includes/config.php.tmp';

	$sh = fopen($cfg_orig, 'r');
	$th = fopen($cfg_tmp, 'w');
	while (!feof($sh)) {
	    $line = fgets($sh);
	    if (strpos($line, '"C_'.$colorToEdit . '" => "' . $custom_colors['C_'.$colorToEdit].'"') !== false) {
	    	if (substr(trim($line), -1) == ',') {
	    		//echo '<br>'.'ALPHABETALPHABETALPHABET'.'<br>';
	        	$line = '				"C_'.$colorToEdit . '" => "' . $colorToSet .'",'. PHP_EOL;
	        } else {
	        	$line = '				"C_'.$colorToEdit . '" => "' . $colorToSet .'"'. PHP_EOL;
	        }
	    }
	    fwrite($th, $line);
	}
	fclose($sh);
	fclose($th);
	unlink($cfg_orig);
	rename($cfg_tmp, $cfg_orig);
}
if(isset($_POST['use_color'])) {
	$colorToUse = sanitize($_POST['use_color']);
	//generate css file first
	$css_orig = 'css/foxfile.css';
	$css_cst = 'css/foxfile_custom.css';

	$sh = fopen($css_orig, 'r');
	$th = fopen($css_cst, 'w');
	while (!feof($sh)) {
	    $line = fgets($sh);
	    if ($colorToUse == 'custom') {
	    	$line = str_ireplace($colors['PRIMARY'], $custom_colors['C_PRIMARY'], $line);
	    	$line = str_ireplace($colors['SECONDARY'], $custom_colors['C_SECONDARY'], $line);
	    	$line = str_ireplace($colors['TEXT'], $custom_colors['C_TEXT'], $line);
	    	$line = str_ireplace($colors['TEXT_SECONDARY'], $custom_colors['C_TEXT_SECONDARY'], $line);
	    	$line = str_ireplace($colors['VERT_DIV'], $custom_colors['C_VERT_DIV'], $line);
	    	$line = str_ireplace($colors['HORIZ_DIV'], $custom_colors['C_HORIZ_DIV'], $line);
	    	$line = str_ireplace($colors['BACKGROUND'], $custom_colors['C_BACKGROUND'], $line);
	    } else { //set to default
	    	// do not copy
	    }

	    fwrite($th, $line);
	}
	fclose($sh);
	fclose($th);
	//change config
	$cfg_orig = 'includes/config.php';
	$cfg_tmp = 'includes/config.php.tmp';

	$sh = fopen($cfg_orig, 'r');
	$th = fopen($cfg_tmp, 'w');
	while (!feof($sh)) {
	    $line = fgets($sh);
	    if ($colorToUse == 'custom') {
	    	$line = str_ireplace('$useCustomColors = false', '$useCustomColors = true', $line);
	    } else {
	    	$line = str_ireplace('$useCustomColors = true', '$useCustomColors = false', $line);
	    }
	    fwrite($th, $line);
	}
	fclose($sh);
	fclose($th);
	unlink($cfg_orig);
	rename($cfg_tmp, $cfg_orig);
}

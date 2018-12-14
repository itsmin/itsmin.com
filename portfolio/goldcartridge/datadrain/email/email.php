<?php

/**
 * .hack//G.U. Data Drain (tm)
 * Email Challenge API
 * Sends e-mails to friends to challenge them to beat high scores
 * 
 * Author: Joseph Huckaby <jhuckaby@goldcartridge.com>
 * Copyright (c) 2007 Gold Cartridge.  All rights reserved.
 **/

// load our config file and logging library
require_once "../highscores/config.php";
require_once "../highscores/log.php";

// args array contains keys which fill placeholders in template
$args = array(
	'base_url' => ''
);

// load HTML e-mail template from disk
$template = file_get_contents( 'template.html' );

// process XML submission from client
if (!isset($_POST['xml'])) send_output(1, "Could not locate XML request in HTTP POST");
$input = $_POST['xml'];

// check for required elements in XML
foreach (array('FromName', 'FromEmail', 'ToName', 'ToEmail', 'Message', 'Score', 'ClickURL') as $key) {
	$value = get_xml_element($input, $key);
	if ($value == null) send_output(2, "Missing required element: $key");
	$args[$key] = $value;
}

// set base_url from ClickURL
if (!$args['base_url']) {
	$args['base_url'] = preg_replace("/\\?.*$/", "", $args['ClickURL']);
	$args['base_url'] = preg_replace("/\\/([\\w\\-]+\\.\\w+)$/", "", $args['base_url']);
	$args['base_url'] = preg_replace("/\\/$/", "", $args['base_url']);
	$args['base_url'] .= '/email';
}

// make sure e-mail addresses are valid
foreach (array('FromEmail', 'ToEmail') as $key) {
	if (!preg_match("/^[\\w\\-\\.]+\\@[\\w\\-\\.]+$/", $args[$key])) send_output(3, "Invalid e-mail address: " . $args[$key]);
}

// message is optional
if (!isset($args['Message']) || !strlen($args['Message'])) $args['Message'] = '';

// add most elements onto click URL as query params, encoded
foreach ($args as $key => $value) {
	if (($key != 'Message') && ($key != 'base_url') && ($key != 'ClickURL')) {
		if (!preg_match("/\\?/", $args['ClickURL'])) $args['ClickURL'] .= '?';
		else $args['ClickURL'] .= '&';
		$args['ClickURL'] .= $key . '=' . urlencode($value);
	}
}

// add commas to the score
$args['Score'] = number_format( $args['Score'] );

// perform placeholder substitution in template
foreach ($args as $key => $value) {
	$template = preg_replace("/\\[$key\\]/", $value, $template);
}

// setup e-mail
$subject = $args['FromName'] . ' has challenged you!  Can you beat ' . $args['Score'] . '?';
$headers  = 'MIME-Version: 1.0' . "\n";
$headers .= 'Content-type: text/html; charset=iso-8859-1' . "\n";

// additional headers
// $headers .= 'To: ' . $args['ToName'] . ' <' . $args['ToEmail'] . '>' . "\n";
$headers .= 'From: ' . $args['FromName'] . ' <' . $args['FromEmail'] . '>' . "\n";

// mail it
$result = mail($args['ToName'] . ' <' . $args['ToEmail'] . '>', $subject, $template, $headers);
if (!$result) send_output(4, "Failed to send e-mail. Please try again later.");

send_output(0, "Successfully sent e-mail to: " . $args['ToEmail']);

write_log(array(
	'game_id' => '',
	'command' => 'SendEmail',
	'category' => 'transaction', 
	'msg' => 'To: ' . $args['ToEmail'] . ', From: ' . $args['FromEmail'] . ', Score: ' . $args['Score']
));

exit();

function decode_entities($text) {
	// decode XML entities in text string
	$text = preg_replace("/\\&amp\\;/", "&", $text);
	$text = preg_replace("/\\&lt\\;/", "<", $text);
	$text = preg_replace("/\\&gt\\;/", ">", $text);
	return $text;
}

function get_xml_element($input, $key) {
	// locate XML element in input, return value
	// only works for simple text elements
	$matches = null;
	preg_match("/<$key>(.*?)<\\/$key>/", $input, $matches);
	if ($matches) return decode_entities($matches[1]);
	else return null;
}

function send_output($code, $desc) {
	// send XML output and exit
	$output = '<?xml version="1.0"?>' . "\n";
	$output .= '<DataDrainResponse>' . "\n";
	$output .= "\t" . '<Code>' . $code . '</Code>' . "\n";
	$output .= "\t" . '<Description>' . $desc . '</Description>' . "\n";
	$output .= '</DataDrainResponse>' . "\n";
	
	header("Content-Type: text/xml");
	print "$output";
	
	// log error if code is nonzero
	if ($code != 0) write_log(array(
		'game_id' => '',
		'command' => 'SendEmail',
		'category' => 'error', 
		'msg' => $code . ': ' . $desc
	));
	
	exit();
}

?>

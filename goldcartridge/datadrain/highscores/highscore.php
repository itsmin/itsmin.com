<?php

/**
 * .hack//G.U. Data Drain (tm)
 * High Score API
 * Maintains global list of high scores in MySQL database
 * 
 * Author: Joseph Huckaby <jhuckaby@goldcartridge.com>
 * Copyright (c) 2007 Gold Cartridge.  All rights reserved.
 **/

// load our config file and logging library
require_once "config.php";
require_once "log.php";

// database handle
$dbh = null;

// log arguments
$log_args = array();

global $db_hostname, $db_instance, $db_username, $db_password, $game_list;
if (!$db_hostname || !$db_instance || !$db_username || !$db_password)
	send_output(1, "Database is not configured, please edit config.php");

// process XML submission from client
if (!isset($_POST['xml'])) send_output(2, "Could not locate XML request in HTTP POST");
$input = $_POST['xml'];

// write_log(array('category' => 'debug', 'msg' => 'XML Request: ' . $input));

// check for required elements in XML
$args = require_elements(array('Command', 'GameID'), $input);

// store these in log_args for logging errors
$log_args['game_id'] = $args['GameID'];
$log_args['command'] = $args['Command'];

// make sure game is registered
if (!isset($game_list[$args['GameID']]))
	send_output(3, "Game is not registered: " . $args['GameID']);

// connect to database
$dbh = mysql_connect($db_hostname, $db_username, $db_password)
    or send_output(4, 'Could not connect to database: ' . $db_hostname . ': ' . mysql_error());

mysql_select_db($db_instance) or send_output(4, 'Could not select database: ' . $db_instance);

// invoke handler
$func = 'handler_' . $args['Command'];
if (!function_exists($func)) send_output(6, "Unknown handler: " . $args['Command']);
call_user_func( $func, $input );

// close DB handle and exit
mysql_close($dbh);
exit();

function handler_AddScore($input) {
	// add score to table
	global $game_list;
	
	$command = require_elements(array('GameID', 'Score', 'Name', 'Level'), $input);
	
	$total_scores = get_total_scores($command['GameID']);
	$max_scores = $game_list[$command['GameID']];
	
	// first make sure score is high enough to rank
	$sql = 'SELECT `score` FROM `highscores` WHERE game = \''.$command['GameID'].'\' ORDER BY `score` ASC LIMIT 1';
	$result = mysql_query($sql) or send_output(7, 'Database query failed: ' . mysql_error());
	$row = mysql_fetch_array($result, MYSQL_ASSOC);
	$lowest_score = $row['score'];
	mysql_free_result($result);
	
	if (($total_scores >= $max_scores) && ($command['Score'] <= $lowest_score)) 
		send_output(8, "Score is not eligible: " . $command['Score']);
	
	// insert into table
	$sql = 'INSERT INTO `highscores` (`score`, `name`, `ip`, `level`, `game`) ' . 
		'VALUES (\'' . $command['Score'] . '\', \'' . $command['Name'] . 
		'\', \'' . $_SERVER['REMOTE_ADDR'] . '\', \'' . $command['Level'] . 
		'\', \'' . $command['GameID'] . '\');';
	
	$result = mysql_query($sql) or send_output(7, 'Database query failed: ' . mysql_error());
	mysql_free_result($result);
	$total_scores++;
	
	// table maintenance
	while ($total_scores > $max_scores) {
		// too many scores in table, trim the list
		$sql = 'SELECT `id` FROM `highscores` WHERE game = \''.$command['GameID'].'\' ORDER BY `score` ASC LIMIT 1';
		$result = mysql_query($sql) or send_output(7, 'Database query failed: ' . mysql_error());
		$row = mysql_fetch_array($result, MYSQL_ASSOC);
		
		$delete_sql = 'DELETE FROM `highscores` WHERE game = \''.$command['GameID'].'\' AND id = \''.$row['id'].'\'';
		$delete_result = mysql_query($delete_sql) or send_output(7, 'Database query failed: ' . mysql_error());
		mysql_free_result($delete_result);
		mysql_free_result($result);
		
		$total_scores--;
	}
	
	$rank = get_rank($command['GameID'], $command['Score']);
	
	$output = '<?xml version="1.0"?>' . "\n";
	$output .= '<DataDrainResponse>' . "\n";
	$output .= "\t" . '<Code>0</Code>' . "\n";
	$output .= "\t" . '<Description>Score successfully added</Description>' . "\n";
	$output .= "\t" . '<Rank>'.$rank.'</Rank>' . "\n";
	$output .= '</DataDrainResponse>' . "\n";
	
	header("Content-Type: text/xml");
	print "$output";
	
	// log transaction
	write_log(array(
		'game_id' => $command['GameID'],
		'command' => 'AddScore',
		'category' => 'transaction',
		'msg' => 'Score: ' . $command['Score'] . ', Name: ' . $command['Name'] . ', Level: ' . $command['Level']
	));
}

function handler_GetScores($input) {
	// get top high scores
	$command = require_elements(array('GameID', 'Limit', 'Offset'), $input);
	
	// make sure elements are valid
	if (!preg_match("/^\\d+$/", $command['Limit'])) send_output(3, "Limit is invalid, must be integer.");
	if (!preg_match("/^\\d+$/", $command['Offset'])) send_output(3, "Offset is invalid, must be integer.");
	
	// get total scores
	$total_scores = get_total_scores($command['GameID']);
	
	// get selected score details
	$sql = 'SELECT * FROM `highscores` WHERE game =  \''.$command['GameID'].'\' ORDER BY `score` DESC LIMIT '.$command['Offset'].' , '.$command['Limit'];
	$result = mysql_query($sql) or send_output(7, 'Database query failed: ' . mysql_error());
	
	$output = '<?xml version="1.0"?>' . "\n";
	$output .= '<DataDrainResponse>' . "\n";
	$output .= "\t" . '<Code>0</Code>' . "\n";
	$output .= "\t" . '<Total>'.$total_scores.'</Total>' . "\n";
	$output .= "\t" . '<Scores>' . "\n";
	
	while ($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
		$output .= "\t\t" . '<Score ID="'.$row['id'].'">' . "\n";
		$output .= "\t\t\t" . '<Name>'.encode_entities($row['name']).'</Name>' . "\n";
		$output .= "\t\t\t" . '<Score>'.$row['score'].'</Score>' . "\n";
		$output .= "\t\t\t" . '<Level>'.$row['level'].'</Level>' . "\n";
		$output .= "\t\t\t" . '<Date>'.$row['date'].'</Date>' . "\n";
		$output .= "\t\t\t" . '<IP>'.$row['ip'].'</IP>' . "\n";
		$output .= "\t\t" . '</Score>' . "\n";
	}
	
	mysql_free_result($result);
	
	$output .= "\t" . '</Scores>' . "\n";
	$output .= '</DataDrainResponse>' . "\n";
	
	header("Content-Type: text/xml");
	print "$output";
}

function handler_DeleteScore($input) {
	// delete score from table
	global $master_key;
	
	$command = require_elements(array('GameID', 'ScoreID', 'AuthKey'), $input);
	
	// validate auth key against master key
	$good_key = md5( $command['GameID'] . $master_key );
	if ($command['AuthKey'] != $good_key) send_output(9, "Authentication failure");
	
	// delete score
	$delete_sql = 'DELETE FROM `highscores` WHERE game = \''.$command['GameID'].'\' AND id = \''.$command['ScoreID'].'\'';
	$delete_result = mysql_query($delete_sql) or send_output(7, 'Database query failed: ' . mysql_error());
	mysql_free_result($delete_result);
	
	send_output(0, "Score successfully deleted");
	
	// log transaction
	write_log(array(
		'game_id' => $command['GameID'],
		'command' => 'DeleteScore',
		'category' => 'transaction',
		'msg' => 'ScoreID: ' . $command['ScoreID']
	));
}

function handler_DeleteAllScores($input) {
	// delete ALL scores from table for a given game
	global $master_key;
	
	$command = require_elements(array('GameID', 'AuthKey'), $input);
	
	// validate auth key against master key
	$good_key = md5( $command['GameID'] . $master_key );
	if ($command['AuthKey'] != $good_key) send_output(9, "Authentication failure");
	
	// delete score
	$delete_sql = 'DELETE FROM `highscores` WHERE game = \''.$command['GameID'].'\'';
	$delete_result = mysql_query($delete_sql) or send_output(7, 'Database query failed: ' . mysql_error());
	mysql_free_result($delete_result);
	
	send_output(0, "All scores successfully deleted");
	
	// log transaction
	write_log(array(
		'game_id' => $command['GameID'],
		'command' => 'DeleteAllScores',
		'category' => 'transaction',
		'msg' => ''
	));
}

function get_rank($game_id, $score) {
	// determine our rank by counting the number of scores greater than or equal to ours
	$sql = 'SELECT count(*) FROM `highscores` WHERE game = \''.$game_id.'\' AND score >= \''.$score.'\'';
	$result = mysql_query($sql) or send_output(7, 'Database query failed: ' . mysql_error());
	$row = mysql_fetch_array($result, MYSQL_NUM);
	mysql_free_result($result);
	if ($row) return $row[0];
	else return 0;
}

function get_total_scores($game_id) {
	// locate total number of scores for game
	$sql = 'SELECT count(*) FROM `highscores` WHERE game = \''.$game_id.'\'';
	$result = mysql_query($sql) or send_output(7, 'Database query failed: ' . mysql_error());
	$row = mysql_fetch_array($result, MYSQL_NUM);
	mysql_free_result($result);
	if ($row) return $row[0];
	else return 0;
}

function require_elements($list, $input) {
	// fetch a number of XML elements, making sure each exists
	$obj = array();
	foreach ($list as $key) {
		$value = get_xml_element($input, $key);
		if ($value == null) send_output(3, "Missing required element: $key");
		$obj[$key] = $value;
	}
	return $obj;
}

function decode_entities($text) {
	// decode XML entities in text string
	$text = preg_replace("/\\&amp\\;/", "&", $text);
	$text = preg_replace("/\\&lt\\;/", "<", $text);
	$text = preg_replace("/\\&gt\\;/", ">", $text);
	return $text;
}

function encode_entities($text) {
	// encode XML entities in text string
	$text = preg_replace("/\\&/", "&amp;", $text);
	$text = preg_replace("/</", "&lt;", $text);
	$text = preg_replace("/>/", "&gt;", $text);
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
	global $dbh;
	global $log_args;
	
	$output = '<?xml version="1.0"?>' . "\n";
	$output .= '<DataDrainResponse>' . "\n";
	$output .= "\t" . '<Code>' . $code . '</Code>' . "\n";
	$output .= "\t" . '<Description>' . $desc . '</Description>' . "\n";
	$output .= '</DataDrainResponse>' . "\n";
	
	header("Content-Type: text/xml");
	print "$output";
	
	// log error if code is nonzero
	if ($code != 0) write_log(array(
		'game_id' => $log_args['game_id'],
		'command' => $log_args['command'],
		'category' => 'error', 
		'msg' => $code . ': ' . $desc
	));
	
	if ($dbh) mysql_close($dbh);
	exit();
}

?>

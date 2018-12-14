<?php

/**
 * .hack//G.U. Data Drain (tm)
 * Logging Library
 * Provides a simple CSV log file for transactions, errors and debug messages.
 * 
 * Author: Joseph Huckaby <jhuckaby@goldcartridge.com>
 * Copyright (c) 2007 Gold Cartridge.  All rights reserved.
 **/

function write_log($args) {
	// write entry to log
	global $log_file;
	global $log_columns;
	
	if (!$log_file || !$log_columns) return;
	if (!is_array($args)) $args = array('msg' => $args);
	
	list($usec, $sec) = explode(" ", microtime());
	$hires_epoch = ((float)$usec + (float)$sec);
	
	$hostname = '';
	if (isset($_SERVER['HOSTNAME'])) $hostname = $_SERVER['HOSTNAME'];
	else if (isset($_SERVER['HOST'])) $hostname = $_SERVER['HOST'];
	
	if (!isset($args['epoch_time'])) $args['epoch_time'] = $hires_epoch;
	if (!isset($args['human_date'])) $args['human_date'] = date("Y-m-d H:i:s", $hires_epoch);
	if (!isset($args['hostname'])) $args['hostname'] = $hostname;
	if (!isset($args['pid'])) $args['pid'] = getmypid();
	if (!isset($args['user_info'])) $args['user_info'] = $_SERVER['REMOTE_ADDR'] . '; ' . $_SERVER['HTTP_USER_AGENT'] . '; ' . $_SERVER['HTTP_X_FLASH_VERSION'];
	
	$row = '';
	foreach ($log_columns as $key) {
		if ($row) $row .= ', ';
		$row .= isset($args[$key]) ? preg_replace("/[\n\,]/", "", $args[$key]) : '';
	}
	
	$fh = fopen ($log_file, "a+");
	if ($fh) {
		if (!filesize($log_file)) fwrite ($fh, implode(", ", $log_columns) . "\n");
		fwrite ($fh, "$row\n"); 
		fclose($fh);
	}
}

?>
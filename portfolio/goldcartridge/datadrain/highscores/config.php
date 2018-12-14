<?php

/**
 * .hack//G.U. Data Drain (tm)
 * High Score API
 * Configuration file for database.
 * 
 * Author: Joseph Huckaby <jhuckaby@goldcartridge.com>
 * Copyright (c) 2007 Gold Cartridge.  All rights reserved.
 **/

global $db_hostname, $db_instance, $db_username, $db_password, $log_file, $log_columns, $game_list, $master_key;

// MySQL Database Configuration:
$db_hostname = ''; # database hostname, e.g. '127.0.0.1' for localhost
$db_instance = ''; # database instance name, e.g. 'highscores'
$db_username = ''; # database username, e.g. 'hscore' or 'ddrain'
$db_password = ''; # database user password

// Log Configuration, set $log_file to '' (empty string) to disable
$log_file = '';
$log_columns = array('epoch_time', 'human_date', 'hostname', 'pid', 'game_id', 'command', 'category', 'msg', 'user_info');

// List of active games in high score database
// Values are maximum number of scores to maintain for each game
$game_list = array(
	'datadrain' => 10
);

// Master encryption key
// This is used to generate MD5 hashes to authenticate administrative API calls
// such as deleting scores or clearing the scores table.  This is not used by games
// and NEVER sent over the wire as plaintext.
$master_key = '_gold+cart/2038';

?>

CREATE TABLE `highscores` (
`id` INT( 4 ) NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST ,
`game` VARCHAR( 256 ) NOT NULL ,
`score` INT( 4 ) NOT NULL ,
`name` VARCHAR( 256 ) NOT NULL ,
`ip` VARCHAR( 256 ) NOT NULL ,
`level` INT( 4 ) NOT NULL ,
`date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) TYPE = MYISAM COMMENT = 'Global High Scores';

ALTER TABLE `highscores` ADD INDEX ( `score` );
ALTER TABLE `highscores` ADD INDEX `game` ( `game` ( 256 ) );

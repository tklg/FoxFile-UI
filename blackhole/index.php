<?php /*

Title: Blackhole for Bad Bots
Description: Automatically trap and block bots that don't obey robots.txt rules
Project URL: http://perishablepress.com/blackhole-bad-bots/
Author: Jeff Starr (aka Perishable)
Version: 2.0
License: GPLv2 or later

This program is free software; you can redistribute it and/or modify it under the 
terms of the GNU General Public License as published by the Free Software Foundation; 
either version 2 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; 
without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
See the GNU General Public License for more details.

Credits: The Blackhole includes customized/modified versions of these fine scripts:
 - Network Query Tool @ http://www.drunkwerks.com/docs/NetworkQueryTool/
 - Kloth.net Bot Trap @ http://www.kloth.net/internet/bottrap.php

*/

$version = '2.0';

// variables
$from     = 'email@example.com'; // from email
$recip    = 'theo@kluge.ninja'; // to email
$subject  = 'Bad Bot Alert!';
$filename = 'blackhole.dat';
$message  = '';
$badbot   = 0;

$request   = sanitize($_SERVER['REQUEST_URI']);
$ipaddress = sanitize($_SERVER['REMOTE_ADDR']);
$useragent = sanitize($_SERVER['HTTP_USER_AGENT']);
$protocol  = sanitize($_SERVER['SERVER_PROTOCOL']);
$method    = sanitize($_SERVER['REQUEST_METHOD']);

// date_default_timezone_set('UTC');
date_default_timezone_set('America/Los_Angeles');
$date = date('l, F jS Y @ H:i:s');
$time = time();

// sanitize
function sanitize($string) {
	$string = trim($string); 
	$string = strip_tags($string);
	$string = htmlspecialchars($string, ENT_QUOTES, 'UTF-8');
	$string = str_replace("\n", "", $string);
	$string = trim($string); 
	return $string;
}

// whois lookup
function whois_lookup($ipaddress) {
	$msg = '';
	$server = 'whois.arin.net';
	if (!$ipaddress = gethostbyname($ipaddress)) {
		$msg .= 'Can&rsquo;t perform lookup without an IP address.' ."\n\n";
	} else {
		if (!$sock = fsockopen($server, 43, $num, $error, 20)) {
			unset($sock);
			$msg .= 'Timed-out connecting to $server (port 43).' ."\n\n";
		} else {
			//fputs($sock, "$ipaddress\n");
			fputs($sock, "n $ipaddress\n");
			$buffer = '';
			while (!feof($sock))
			$buffer .= fgets($sock, 10240); 
			fclose($sock);
		}
		if (eregi('RIPE.NET', $buffer)) {
			$nextServer = 'whois.ripe.net';
		} else if (eregi('whois.apnic.net', $buffer)) {
			$nextServer = 'whois.apnic.net';
		} else if (eregi('nic.ad.jp', $buffer)) {
			$nextServer = 'whois.nic.ad.jp';
			$extra = '/e'; // suppress JaPaNIC characters
		} else if (eregi('whois.registro.br', $buffer)) {
			$nextServer = 'whois.registro.br';
		}
		if (isset($nextServer)) {
			$buffer = '';
			$msg .= 'Deferred to specific whois server: '. $nextServer .'...' ."\n\n";
			if (!$sock = fsockopen($nextServer, 43, $num, $error, 10)) {
				unset($sock);
				$msg .= 'Timed-out connecting to ' . $nextServer . ' (port 43)' ."\n\n";
			} else {
				fputs($sock, $ipaddress . $extra ."\n");
				while (!feof($sock))
				$buffer .= fgets($sock, 10240);
				fclose($sock);
			}
		}
		$msg .= nl2br($buffer);
	}
	$msg = htmlspecialchars(trim(ereg_replace('#', '', strip_tags($msg))));
	$msg = preg_replace("/\\n\\n\\n\\n/i", "\n", $msg);
	$msg = preg_replace("/\\n\\n\\n/i", "\n\n", $msg);
	return $msg;
}
$whois = whois_lookup($ipaddress);

// check target | bugfix
if (!$ipaddress || !preg_match("/^[\w\d\.\-]+\.[\w\d]{1,4}$/i", $ipaddress)) { 
	exit('Error: You did not specify a valid target host or IP.');
}

// check bot
$fp = fopen($filename, 'r') or die('<p>Error opening file.</p>');
while ($line = fgets($fp)) {
	if (!preg_match("/(googlebot|slurp|msnbot|teoma|yandex)/i", $line)) {
		$u = explode(' ', $line);
		if ($u[0] == $ipaddress) ++$badbot;
	}
}
fclose($fp);

// record hit
if ($badbot == 0) {
	$message   = $date . "\n\n";
	$message  .= 'URL Request: ' . $request . "\n";
	$message  .= 'IP Address: ' . $ipaddress . "\n";
	$message  .= 'User Agent: '  . $useragent . "\n\n";
	$message  .= 'Whois Lookup: ' . "\n\n" . $whois . "\n";

	mail($recip, $subject, $message, 'From: '. $from);

	$fp = fopen($filename, 'a+');
	fwrite($fp, $ipaddress ." - ". $method ." - ". $protocol ." - ". $date ." - ". $useragent ."\n");
	fclose($fp);

// 1st visit (warning) ?>
<!DOCTYPE html>
	<title>Welcome to Blackhole!</title>
	<style>
		body { color: #fff; background-color: #851507; font: 14px/1.5 Helvetica, Arial, sans-serif; }
		#blackhole { margin: 20px auto; width: 700px; }
		pre { padding: 20px; white-space: pre-line; border-radius: 10px; background-color: #b34334; }
		a { color: #fff; }
	</style>
	<body>
		<div id="blackhole">
			<h1>You have fallen into a trap!</h1>
			<p>
				This site&rsquo;s <a href="../robots.txt">robots.txt</a> file explicitly forbids your presence at this location. 
				The following Whois data will be reviewed carefully. If it is determined that you suck, you will be banned from this site. 
				If you think this is a mistake, <em>now</em> is the time to <a href="mailto:theo@kluge.ninja">contact the administrator</a>.
			</p>
			<h3>Your IP Address is <?php echo $ipaddress; ?></h3>
			<pre>WHOIS Lookup for <?php echo $ipaddress ."\n". $date ."\n\n". $whois; ?></pre>
			<p><a href="http://perishablepress.com/blackhole-bad-bots/" title="Blackhole for Bad Bots">Blackhole v<?php echo $version; ?></a></p>
		</div>
	</body>
</html><?php 

// 2nd+ visit (banned)
} else if ($badbot > 0) {
	echo '<h1>You have been banned from this domain</h1>';
	echo '<p>If you think there has been a mistake, <a href="mailto:theo@kluge.ninja">contact the administrator</a> via proxy server.</p>';
} else { 
	die(); 
}
exit;
<?php
/* 
                                                              
   ad88                             ad88  88  88              
  d8"                              d8"    ""  88              
  88                               88         88              
MM88MMM  ,adPPYba,  8b,     ,d8  MM88MMM  88  88   ,adPPYba,  
  88    a8"     "8a  `Y8, ,8P'     88     88  88  a8P_____88  
  88    8b       d8    )888(       88     88  88  8PP"""""""  
  88    "8a,   ,a8"  ,d8" "8b,     88     88  88  "8b,   ,aa  
  88     `"YbbdP"'  8P'     `Y8    88     88  88   `"Ybbd8"'  
                                                                  
    Foxfile : auth.php 
    Copyright (C) 2016 Theodore Kluge
    https://tkluge.net
*/
session_start();
require('../includes/user.php');
require('../includes/cfgvars.php');

// add ip limit too
if (isset($_SESSION['lastreq']))
	if ((time() - $_SESSION['lastreq']) > 30) 
		$_SESSION['reqnum'] = 0;
if (!isset($_SESSION['reqnum'])) $_SESSION['reqnum'] = 0;
if ($_SESSION['reqnum'] == 15) die("reached max of 15 requests for this session: please wait 30 seconds before next request");
$_SESSION['reqnum'] = (int) $_SESSION['reqnum'] + 1;
if (isset($_SESSION['lastreq']))
	if ((time() - $_SESSION['lastreq']) < 3) die('one request pre 3 second allowed');
$_SESSION['lastreq'] = time();

$uri = $_SERVER['REQUEST_URI'];
if (strpos($uri, '/') !== false) {
    $uri = explode('/', $uri);
    $pageID = $uri[sizeof($uri) - 1];
} else {
    $pageID = substr($uri, 1);
}
if (strpos($pageID, '?') !== false) {
	$uri = explode('?', $pageID);
	$pageID = $uri[0];
}

//connect to database  
$db = mysqli_connect($dbhost,$dbuname,$dbupass,$dbname);

date_default_timezone_set('America/New_York');

function resp($code, $message) {
	header('Content-Type: application/json');
	http_response_code($code);
	$res = array(
		'status' => $code,
		'message' => $message
	);
	echo json_encode($res);
	die();
}
function sanitize($s) {
	global $db;
	return htmlentities(br2nl(mysqli_real_escape_string($db, $s)), ENT_QUOTES);
}
function br2nl($s) {
    return preg_replace('/\<br(\s*)?\/?\>/i', "\n", $s);
}
function sendVerification($email) {
	global $db;
	require_once './../includes/mailconf.php';
	$q = "SELECT account_status FROM users WHERE email='$email' LIMIT 1";
	if ($res = mysqli_query($db, $q)) {
		if (mysqli_num_rows($res) == 0) {
			resp(404, 'There is no account with that email');
		}
		$link = mysqli_fetch_object($res)->account_status;
		if ($link == 'verified') {
			resp(500, 'Your email is already verified');
		}

		//$cdir = 
		$link = 'https://'.$_SERVER['HTTP_HOST']."/foxfile/verify?key=".$link.'&from='.$email;
		$c = curl_init();
		curl_setopt($c, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
		curl_setopt($c, CURLOPT_USERPWD, 'api:'.$mailkey);
		curl_setopt($c, CURLOPT_RETURNTRANSFER, 1);

	    curl_setopt($c, CURLOPT_CUSTOMREQUEST, 'POST');
	    curl_setopt($c, CURLOPT_URL, $mailapi);
	    curl_setopt($c, CURLOPT_POSTFIELDS, array(
	    	'from' => 'FoxFile <foxfile@'.$_SERVER['HTTP_HOST'].'>',
	        'to' => $email,
	        'subject' => 'Foxfile email verification',
	        'html' => 'Click link to verify your email:<br><a href="'.$link.'">'.$link.'</a>',
	        'text' => 'Copy/paste link into the address bar to verify your email: '.$link
	        )
	    );

	    curl_exec($c);
	    $info = curl_getinfo($c);


	    if ($info['http_code'] != 200)
	        resp(500, "Failed to send mail: curl gave ".curl_error($c));

	    curl_close($c);
	    //resp(200, "Sent mail");
	} else {
		resp(500, 'failed to fetch link');
	}
}
function getOS() { 
    $user_agent = $_SERVER['HTTP_USER_AGENT'];
    $os_platform = "Unknown OS Platform";
    $os_array = array('/windows nt 10/i'=>'Windows 10', '/windows nt 6.3/i'=>'Windows 8.1', '/windows nt 6.2/i'=>'Windows 8', '/windows nt 6.1/i'=>'Windows 7', '/windows nt 6.0/i'=>'Windows Vista', '/windows nt 5.2/i'=>'Windows Server 2003/XP x64', '/windows nt 5.1/i'=>'Windows XP', '/windows xp/i'=>'Windows XP', '/windows nt 5.0/i'=>'Windows 2000', '/windows me/i'=>'Windows ME', '/win98/i'=>'Windows 98', '/win95/i'=>'Windows 95', '/win16/i'=>'Windows 3.11', '/macintosh|mac os x/i'=>'Mac OS X', '/mac_powerpc/i'=>'Mac OS 9', '/linux/i'=>'Linux', '/ubuntu/i'=>'Ubuntu', '/iphone/i'=>'iPhone', '/ipod/i'=>'iPod', '/ipad/i'=>'iPad', '/android/i'=>'Android', '/blackberry/i'=>'BlackBerry', '/webos/i'=>'Mobile'); foreach ($os_array as $regex => $value) {
        if (preg_match($regex, $user_agent)) {
            $os_platform = $value;
        }
    }   
    return $os_platform;
}
function getBrowser() {
	$user_agent = $_SERVER['HTTP_USER_AGENT'];
    $browser  = "Unknown Browser";
    $browser_array = array('/msie/i' => 'Internet Explorer', '/firefox/i' => 'Firefox', '/safari/i' => 'Safari', '/chrome/i' => 'Chrome', '/edge/i' => 'Edge', '/opera/i' => 'Opera', '/netscape/i' => 'Netscape', '/maxthon/i' => 'Maxthon', '/konqueror/i' => 'Konqueror', '/mobile/i' => 'Mobile Browser'); foreach ($browser_array as $regex => $value) {
        if (preg_match($regex, $user_agent)) {
            $browser = $value;
        }
    }
    return $browser;
}
function ip_info($ip = NULL, $purpose = "location", $deep_detect = TRUE) {
	// http://stackoverflow.com/questions/12553160/getting-visitors-country-from-their-ip
    $output = NULL;
    if (filter_var($ip, FILTER_VALIDATE_IP) === FALSE) {
        $ip = $_SERVER["REMOTE_ADDR"];
        if ($deep_detect) {
            if (filter_var(@$_SERVER['HTTP_X_FORWARDED_FOR'], FILTER_VALIDATE_IP))
                $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
            if (filter_var(@$_SERVER['HTTP_CLIENT_IP'], FILTER_VALIDATE_IP))
                $ip = $_SERVER['HTTP_CLIENT_IP'];
        }
    }
    $purpose    = str_replace(array("name", "\n", "\t", " ", "-", "_"), NULL, strtolower(trim($purpose)));
    $support    = array("country", "countrycode", "state", "region", "city", "location", "address");
    $continents = array(
        "AF" => "Africa",
        "AN" => "Antarctica",
        "AS" => "Asia",
        "EU" => "Europe",
        "OC" => "Australia (Oceania)",
        "NA" => "North America",
        "SA" => "South America"
    );
    if (filter_var($ip, FILTER_VALIDATE_IP) && in_array($purpose, $support)) {
    	if ($ip == 'localhost' || $ip == '::1') {
    		$ipdat = @json_decode(file_get_contents("http://www.geoplugin.net/json.gp"));
    	} else {
        	$ipdat = @json_decode(file_get_contents("http://www.geoplugin.net/json.gp?ip=" . $ip));
    	}
        if (@strlen(trim($ipdat->geoplugin_countryCode)) == 2) {
            switch ($purpose) {
                case "location":
                    $output = array(
                        "city"           => @$ipdat->geoplugin_city,
                        "state"          => @$ipdat->geoplugin_regionName,
                        "country"        => @$ipdat->geoplugin_countryName,
                        "country_code"   => @$ipdat->geoplugin_countryCode,
                        "continent"      => @$continents[strtoupper($ipdat->geoplugin_continentCode)],
                        "continent_code" => @$ipdat->geoplugin_continentCode
                    );
                    break;
                case "address":
                    $address = array($ipdat->geoplugin_countryName);
                    if (@strlen($ipdat->geoplugin_regionName) >= 1)
                        $address[] = $ipdat->geoplugin_regionName;
                    if (@strlen($ipdat->geoplugin_city) >= 1)
                        $address[] = $ipdat->geoplugin_city;
                    $output = implode(", ", array_reverse($address));
                    break;
                case "city":
                    $output = @$ipdat->geoplugin_city;
                    break;
                case "state":
                    $output = @$ipdat->geoplugin_regionName;
                    break;
                case "region":
                    $output = @$ipdat->geoplugin_regionName;
                    break;
                case "country":
                    $output = @$ipdat->geoplugin_countryName;
                    break;
                case "countrycode":
                    $output = @$ipdat->geoplugin_countryCode;
                    break;
            }
        }
    }
    return $output;
}
if($pageID == 'userexists') {
	$useremail = sanitize($_POST['useremail']);
	$result = mysqli_query($db, "SELECT 1 from users where email = '$useremail' LIMIT 1");  
	if(mysqli_num_rows($result)>0){  
	    echo 0;  
	} else {  
	    echo 1;  
	}
}
if($pageID == 'login') {
	if (isset($_POST['api_key'])) {
		$key = sanitize($_POST['api_key']);
		echo $key;
		$ip = $_SERVER['REMOTE_ADDR'];
		$country = ip_info($ip, "country");
		$q = "SELECT IF (TIMESTAMPDIFF(WEEK, last_mod , CURRENT_TIMESTAMP()) < 1, 'good', 'expired') as status, active from apikeys where api_key='$key' and created_by='$ip' and country='$country' LIMIT 1";
		if ($res = mysqli_query($db, $q)) {
			if (mysqli_num_rows($res) == 0) {
				resp(404, "That key does not exist. Please log in first");
			}
			$r = mysqli_fetch_object($res);
			if ($r->status === 'expired' || $r->active == 0) {
				resp(401, "That key has expired. Please log in again");
			} else {
				$sql2 = "UPDATE apikeys SET last_mod=NOW() where api_key='$key'";
				if (mysqli_query($db, $sql2)) {
					$r = array(
						'status'=>200,
						'key'=>$key
					);
					echo json_encode($r);
					die();
				} else {
					resp(500, 'failed to update token');
				}
			}

		}
	} else {
		$useremail = sanitize($_POST['useremail']);
		$sql = "SELECT * from users where email = '$useremail' LIMIT 1";
		if ($result = mysqli_query($db, $sql)) {
			if (mysqli_num_rows($result) == 0) {
				resp(404, "user does not exist");
			}
			$row = mysqli_fetch_object($result);
			$passToMatch = $row->password;
			$password = $_POST['userpass'];
			if (password_verify($password, $passToMatch)) {

			    $ip = $_SERVER['REMOTE_ADDR'];
			    $country = ip_info($ip, "country");
				$oid = $row->PID;
				$userAgent = sanitize(getBrowser().' on '.getOS());
				$sql = "SELECT api_key from apikeys where owner_id='$oid' and created_by='$ip' and user_agent='$userAgent' and country='$country' and active=1 limit 1";
				if ($res = mysqli_query($db, $sql)) {
					if (mysqli_num_rows($res) == 0) {
						//create a new token for this login
						$token = bin2hex(openssl_random_pseudo_bytes(24));
					    $sql2 = "INSERT INTO apikeys (owner_id, api_key, user_agent, created_by, country) VALUES ('$oid', '$token', '$userAgent', '$ip', '$country')";
					    if (mysqli_query($db, $sql2)) {
						    $r = array(
						    	'status'=>200,
						    	'key'=>$token
						    	);
						    echo json_encode($r);
						    die();
					    } else {
					    	resp(500, 'failed to create new token');
					    }
					} else {
						$token = mysqli_fetch_object($res)->api_key;
						$sql2 = "UPDATE apikeys SET last_mod=NOW() where api_key='$token' and owner_id='$oid'";
						if (mysqli_query($db, $sql2)) {
							$r = array(
						    	'status'=>200,
						    	'key'=>$token
						    	);
						    echo json_encode($r);
						    die();
						} else {
							resp(500, 'failed to update token');
						}

					}
				} else {
					resp(500, 'query failed');
				}
				/*session_destroy();
				foreach ($_SESSION as $value)
					$value = null;
				session_start();
				$_SESSION['foxfile_access_level'] = $row->access_level;
				$_SESSION['foxfile_uid'] = $row->PID;
				$_SESSION['foxfile_email'] = $useremail;
				$_SESSION['foxfile_uhd'] = $row->root_folder;
				$_SESSION['foxfile_firstname'] = $row->firstname;
				$_SESSION['foxfile_lastname'] = $row->lastname;
				$_SESSION['foxfile_username'] = $row->firstname.' '.$row->lastname;
				$_SESSION['foxfile_user_md5'] = md5($row->email);
				$_SESSION['foxfile_max_storage'] = $row->total_storage;
				$_SESSION['foxfile_verified_email'] = $row->account_status == 'verified' ? true : false;
				echo 0;*/
			} else {
				resp(401, 'incorrect password');
			}
		} else {
			resp(500, 'query failed');
		}
	}
}

if($pageID == 'logout') {
	session_destroy();
	foreach ($_SESSION as $value) {
		$value = null;
	}
	header('Location: ./');
}
if($pageID == 'new') {
	$gp = false;
	if ($foxfile_require_access_code) {
		$gp = true;
		if ($_POST['gpass'] == $foxfile_access_code) { //change this to use password_verify
			$v = true;
		} else {
			$v = false;
			echo 4;
			die();
		}
	} else {
		$gp = false;
	}
		if (!$gp || $v) {

	        $email = sanitize($_POST['useremail']);  
			$result = mysqli_query($db, "SELECT PID from users where email = '$email' LIMIT 1");  
			
			if(mysqli_num_rows($result) > 0){  
			    echo 2;
			    die();
			} else {  
				$upass = password_hash($_POST['userpass'], PASSWORD_BCRYPT);
				$userfirst = sanitize($_POST['userfirst']);
				$userlast = sanitize($_POST['userlast']);
				require '../plugins/hashids/Hashids.php';
				$sql = "REPLACE INTO idgen (hashes) VALUES ('a')";
				if ($result = mysqli_query($db, $sql)) {
					$newIdObj = mysqli_insert_id($db);
					$hashids = new Hashids\Hashids('foxfilesaltisstillbestsalt', 12);
					$root_folder = $hashids->encode($newIdObj);
					$bytes;
					if (function_exists('random_bytes'))
						$bytes = bin2hex(random_bytes(20));
					else 
						$bytes = bin2hex(openssl_random_pseudo_bytes(20));

					$privk = sanitize($_POST['privkey']);
					$pubk = sanitize($_POST['pubkey']);
					$sql = "INSERT INTO users (firstname, lastname, email, password, access_level, root_folder, total_storage, account_status, privkey, pubkey)
			                VALUES ('$userfirst',
			                '$userlast',
			                '$email',
			                '$upass',
			                '1',
			                '$root_folder',
			                2147483648,
			                '$bytes',
			                '$privk',
			                '$pubk')";
					if (mysqli_query($db,$sql)) {
						mkdir('../files/'.$root_folder.'/');
						sendVerification($email);
						//mkdir('../trashes/'.$root_folder.'/');
						echo 0;
						die();
			        } else {
			        	//echo mysqli_error($db);
			            echo 6;
			            die();
			        }
			    } else {
			    	echo 5;
			    	die();
			    }
		    }
		} else {
			echo 4;
		}
}
if ($pageID == 'send_verification') {
	if ($_POST['email'] == 'test@test.test') {
		resp(401, "Test user cannot send emails.");
	}
	if (!isset($_POST['email']) || !isset($_POST['extra'])) {
		resp(422, 'email address required');
	}
	$email = sanitize($_POST['email']);
	sendVerification($email);
}
if ($pageID == 'send_recovery') {
	if ($_POST['email'] == 'test@test.test') {
		resp(401, "Test user cannot send emails.");
	}
	require_once './../includes/mailconf.php';
	if (!isset($_POST['email']) || !isset($_POST['extra'])) {
		resp(422, 'email address required');
	}
	$email = sanitize($_POST['email']);

	$q = "SELECT email FROM users WHERE email='$email' LIMIT 1";
	if ($r = mysqli_query($db, $q)) {
		if (mysqli_num_rows($r) == 0) {
			resp(401, "No account was found with that email");
		} else {
			$bytes;
			if (function_exists('random_bytes'))
				$bytes = bin2hex(random_bytes(40));
			else 
				$bytes = bin2hex(openssl_random_pseudo_bytes(40));
			$_SESSION['foxfile_recovery_nonce'] = $bytes;

			$link = 'https://'.$_SERVER['HTTP_HOST']."/foxfile/passchange?key=".$bytes.'&from='.$email;
			$c = curl_init();
			curl_setopt($c, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
			curl_setopt($c, CURLOPT_USERPWD, 'api:'.$mailkey);
			curl_setopt($c, CURLOPT_RETURNTRANSFER, 1);

			curl_setopt($c, CURLOPT_CUSTOMREQUEST, 'POST');
			curl_setopt($c, CURLOPT_URL, $mailapi);
			curl_setopt($c, CURLOPT_POSTFIELDS, array(
				'from' => 'foxfile@'.$_SERVER['HTTP_HOST'],
			    'to' => $email,
			    'subject' => 'Foxfile password reset',
			    'html' => 'Click link to reset your password:<br><a href="'.$link.'">'.$link.'</a>',
			    'text' => 'Copy/paste link into the address bar to reset your password: '.$link
			    )
			);
			curl_exec($c);
			$info = curl_getinfo($c);

			if ($info['http_code'] != 200)
				resp(500, "Failed to send mail: curl gave ".curl_error($c));

			curl_close($c);
			resp(200, "Sent mail");
		}
	} else {
		resp(500, 'email query failed');
	}
}
if ($pageID == 'verify') {
	if (!isset($_GET['key']) || !isset($_GET['from'])) {
		resp(422, 'missing parameters');
	}
	$key = sanitize($_GET['key']);
	$email = sanitize($_GET['from']);

	$q = "SELECT account_status FROM users WHERE email='$email' LIMIT 1";
	if ($res = mysqli_query($db, $q)) {
		if (mysqli_num_rows($res) == 0) {
			resp(400, "Verification failed - invalid email");
		}
		if (mysqli_fetch_object($res)->account_status == $key) {
			$q = "UPDATE users SET account_status='verified' WHERE email='$email' LIMIT 1";
			if (mysqli_query($db, $q)) {
				if (isset($_SESSION['foxfile_uid'])) $loc = 'account';
				else $loc = 'login';

				header('Location: '.$loc);
			}
		} else {
			resp(400, "Verification failed - invalid key");
		}
	} else {
		resp(500, "Verification failed - database error");
	}
}
if ($pageID == 'recover') {
	if (!isset($_POST['key']) || !isset($_POST['from']) || !isset($_POST['pass']) || !isset($_POST['pass2'])) {
		resp(422, 'missing parameters');
	}
	$key = sanitize($_POST['key']);
	$email = sanitize($_POST['from']);

	if (!isset($_SESSION['foxfile_recovery_nonce']) || $key !== $_SESSION['foxfile_recovery_nonce']) resp(400, "Invalid key");
	unset($_SESSION['foxfile_recovery_nonce']);

	$pass = sanitize($_POST['pass']);
	$pass2 = sanitize($_POST['pass2']);
	if ($pass == '') resp(400, 'password cannot be blank');
	if ($pass !== $pass2) resp(400, "passwords do not match");

	$pass = password_hash($pass, PASSWORD_BCRYPT);

	$q = "UPDATE users SET password='$pass' WHERE email='$email' LIMIT 1";
	if (mysqli_query($db, $q)) {
		header("Location: ./../../logout");
	} else {
		resp(500, 'Failed to change password');
	}

}

mysqli_close($db);

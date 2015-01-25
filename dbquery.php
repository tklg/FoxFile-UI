<?php
session_start();
require('includes/user.php');
require('includes/config.php');
//connect to database  
$db = mysqli_connect($dbhost,$dbuname,$dbupass,$dbname);
$sessionMode = $_SESSION['mode'];
$sessionUser = $_SESSION['user'];
date_default_timezone_set('America/New_York');
error_reporting(0); //messing up my replies

function strip_tags_attributes( $str, 
		    $allowedTags = array('<a>','<b>','<blockquote>','<br>','<cite>','<code>','<del>','<div>','<em>','<ul>','<ol>','<li>','<dl>','<dt>','<dd>','<img>','<video>','<iframe>','<ins>','<u>','<q>','<h3>','<h4>','<h5>','<h6>','<samp>','<strong>','<sub>','<sup>','<p>','<table>','<tr>','<td>','<th>','<pre>','<span>'), 
		    $disabledEvents = array('onclick','ondblclick','onkeydown','onkeypress','onkeyup','onload','onmousedown','onmousemove','onmouseout','onmouseover','onmouseup','onunload') )
		{       
		    if( empty($disabledEvents) ) {
		        return strip_tags($str, implode('', $allowedTags));
		    }
		    return preg_replace('/<(.*?)>/ies', "'<' . preg_replace(array('/javascript:[^\"\']*/i', '/(" . implode('|', $disabledEvents) . ")=[\"\'][^\"\']*[\"\']/i', '/\s+/'), array('', '', ' '), stripslashes('\\1')) . '>'", strip_tags($str, implode('', $allowedTags)));
		}

if(isset($_POST['username'])) {

	$username = addslashes(strip_tags_attributes($_POST['username']));  
	 
	$result = mysqli_query($db, "SELECT NAME from USERS where NAME = '". $username . "'");  
	  
	//if number of rows fields is bigger them 0 that means it's NOT available '  
	if(mysqli_num_rows($result)>0){  
	    echo 0;  
	}else{  
	    echo 1;  
	}
}

if(isset($_POST['udname'])) {
	$udname = addslashes(strip_tags_attributes($_POST['udname']));
	$userToSet = addslashes(strip_tags_attributes($_POST['user']));
	$user = $sessionUser;
	if ($userToSet === $user || $sessionMode === 'admin') {
		if (mysqli_query($db, "UPDATE USERS SET disname='$udname' WHERE name='$userToSet'")) {
			echo 1;
		} else {
			echo 0;
		}
	}
}

if(isset($_POST['udbio'])) {
	$udbio = addslashes(strip_tags_attributes($_POST['udbio']));
	$userToSet = addslashes(strip_tags_attributes($_POST['user']));
	$user = $sessionUser;
	if ($userToSet === $user || $sessionMode === 'admin') {
		$sql = "UPDATE Users SET bio='$udbio' WHERE name='$userToSet'";

		if (mysqli_query($db, $sql)) {
			echo 1;
		} else {
			echo 0;
		}
	}
}

if(isset($_POST['deletepost'])) {
	if(isset($sessionMode)) {
		if($sessionMode === 'admin') {
			$pid = $_POST['postid'];
			$sql = "DELETE FROM Posts WHERE PID=$pid";
			mysqli_query($db, $sql);
			echo 'hello';
			header('Location: ' . dirname($_SERVER['REQUEST_URI']) . '/index.php');
		}
	}
}

if(isset($_POST['newpass'])) {
	$newpass = addslashes(strip_tags_attributes($_POST['newpass']));
	$newpassconf = addslashes(strip_tags_attributes($_POST['newpassconf']));
	$userToSet = addslashes(strip_tags_attributes($_POST['user']));
	$user = $sessionUser;
	if ($newpass === $newpassconf) {
		if ($userToSet === $user || $sessionMode === 'admin') {
			$options = [
		                'cost' => 11,
		            ];
			$passtoset = password_hash($newpass, PASSWORD_BCRYPT, $options);
			$sql = "UPDATE users SET pass='$passtoset' WHERE name='$userToSet'";
			if (mysqli_query($db, $sql)) {
				echo 1;
			} else {
				echo 0;
			}
		}
	} else {
		echo 0;
	}
}

if(isset($_POST['newemail'])) {
	$newemail = addslashes(strip_tags_attributes($_POST['newemail']));
	$userToSet = addslashes(strip_tags_attributes($_POST['user']));
	$user = $sessionUser;
	if ($userToSet === $user || $sessionMode === 'admin') {
		$sql = "UPDATE users SET email='$newemail' WHERE name='$userToSet'";
		if (mysqli_query($db, $sql)) {
			echo 1;
		} else {
			echo 0;
		}
	} else {
		echo 'user does not match userSet';
	}
}

if(isset($_POST['userlist'])) {
	if ($_POST['userlist'] == 'all') {
		if(isset($sessionMode)) {
			if($sessionMode === 'admin') {
				$sql="SELECT * FROM Users";
				$users = mysqli_query($db, $sql);
				//echo '<table class="table-userlist">';
				echo '<tr><td></td><td>Name</td><td>Email</td><td>Display name</td><td>Birthday</td><td>isAdmin</td><td>filterPref</td></tr>';
				while($row = mysqli_fetch_array($users)) {
					$email = $row['email'];
					$size = 50;
					if ($grav_default === 'custom') {
						$grav_default = $grav_custom;
					}
					$grav_url = "http://www.gravatar.com/avatar/" . md5( strtolower( trim( $email ) ) ) . "?d=" . $grav_default . "&s=" . $size . "r=" . $grav_rating;

					try {
						$date1 = new DateTime($row['age']); //compare age from database with current time
						$date2 = new DateTime();
						$interval = $date1->diff($date2);
						$age = $interval->y;
						//echo "difference " . $interval->y . " years, " . $interval->m." months, ".$interval->d." days ";
					} catch (Exception $e){
						//do nothing :D
					}

					echo '<tr>
					<td><a href="../user.php?u=' . $row["name"] . '"  target="_blank"><img src="' . $grav_url . '" /></a></td>
					<td>' . $row['name'] . '</td> 
					<td>' . $row['email'] . '</td> 
					<td>' . $row['disname'] . '</td>
					<td>' . $row['age'] . ' (' . $age . ' yrs)</td>
					<td>' . $row['isAdmin'] . '</td>
					<td>' . $row['filterPref'] . '</td>
					</tr>';
				}
				//echo '</table>';
			}
		}
	}
}

//echo $sessionMode;
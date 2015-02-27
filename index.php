<?php
session_start();
if(!isset($_SESSION['uid'])) {
	$_SESSION['uid'] = 0;
}
if(isset($_SESSION['uid'])) {
	header("Location: browse");
} else {
	header("Location: login");
}
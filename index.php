<?php
session_start();
if (isset($_GET['teapot'])) {
	header("HTTP/1.1 418 I'm a teapot");
	header("Location: error?418");
} else {
	if(isset($_SESSION['uid'])) {
		header("Location: browse");
	} else {
		header("Location: login");
	}
}
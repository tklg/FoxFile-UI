<div class="footer">
    <!-- <div class="copyright">&copy; 2014 Theodore Kluge</div> -->
    <span class="smalltext" id="loadtime"></span>
    <?php if($_SESSION['mode'] == 'guest') { ?><a href="login.php">Login</a>
	<?php } else { ?>
	<a href="uauth.php?logout">Logout</a>
	<p>Hello, <?php echo $_SESSION['username']; ?></p>
	<?php } ?>
</div>
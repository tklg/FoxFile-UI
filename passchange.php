<?php
session_start();
if (!isset($_GET['key']) || !isset($_GET['from'])) {
    $r = array('error'=>400,
        'message'=>'missing parameters');
    echo json_encode($r);
    die();
}
include 'includes/cfgvars.php';
?>
<!DOCTYPE html>
<html lang="en-US">
<!--
                                                              
   ad88                             ad88  88  88              
  d8"                              d8"    ""  88              
  88                               88         88              
MM88MMM  ,adPPYba,  8b,     ,d8  MM88MMM  88  88   ,adPPYba,  
  88    a8"     "8a  `Y8, ,8P'     88     88  88  a8P_____88  
  88    8b       d8    )888(       88     88  88  8PP"""""""  
  88    "8a,   ,a8"  ,d8" "8b,     88     88  88  "8b,   ,aa  
  88     `"YbbdP"'  8P'     `Y8    88     88  88   `"Ybbd8"'  
                                                              

    Foxfile : <?php echo basename(__FILE__); ?> 
    Version <?php echo $foxfile_version; ?> 
    Copyright (C) 2016 Theodore Kluge
    https://tkluge.net

-->
<head>
    <title>FoxFile - Recover password</title>
    <meta charset="utf-8" />
    <meta author="tkluge" />
    <link rel="stylesheet" href="css/login.css" />
    <link href="css/materialdesignicons.min.css" media="all" rel="stylesheet" type="text/css" />
    <link href='https://fonts.googleapis.com/css?family=Roboto:400,700' rel='stylesheet' type='text/css'>
    <link rel="icon" type="image/ico" href="img/favicon.png">
    <meta name="viewport" content="initial-scale=1, width=device-width, maximum-scale=1, minimum-scale=1, user-scalable=no">
</head>
<body>
<main class="recover float-2">
    <header class="header float" id="header-main">
        <img class="float" src="img/default_avatar.png" alt="profile picture" />
        <span>Reset password</span>
    </header>
	<section class="content">
        <form name="recover" action="./api/auth/recover" method="post" onsubmit="return changePass()">
            <p>
                <input type="hidden" name="key" value="<?php echo $_GET['key']; ?>">
                <input type="hidden" name="from" value="<?php echo $_GET['from']; ?>">
            </p>
            <div class="inputbar nosel">
    			<label class="userlabel">
    				<input name="pass" class="userinfo" id="pass" type="password" autofocus>
    				<span class="placeholder-userinfo nosel">Password</span>
    				<hr class="input-underline"></hr>
    				<div class="error" id="e1"><div class="error-message">Password cannot be blank</div></div>
    			</label>
    		</div>
            <div class="inputbar nosel">
                <label class="userlabel">
                    <input name="pass2" class="userinfo" id="pass2" type="password">
                    <span class="placeholder-userinfo nosel">And again</span>
                    <hr class="input-underline"></hr>
                    <div class="error" id="e2"><div class="error-message">Passwords do not match</div></div>
                </label>
            </div>
            <a href="./" class="new-account">Log in</a>
            <button class="btn btn-submit" type="submit"">Change<link class="rippleJS" /></button>
        </form>
	</section>
</main>
<?php include './includes/footer.html'; ?>
<script type="text/javascript" src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
<script type="text/javascript" src="js/ripple.js"></script>
    <script type="text/javascript">
    $('input.userinfo').change(function() {
        $(this).attr('empty', ($(this).val() != '') ? 'false' : 'true');
    });
    function changePass() {
        var pass = $('#pass').val();
        var pass2 = $('#pass2').val();
        if (pass == '') {
            $('#e1').addClass('active');
            return false;
        } else {
            $('#e1').removeClass('active');
        }
        if (pass != pass2) {
            $('#e2').addClass('active');
            return false;
        } else {
            $('#e2').removeClass('active');
        }
        //$('form')[0].submit();
        return true;
    }
    </script>
</body>
</html>
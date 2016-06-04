<?php
session_start();
?>
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
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta author="tkluge" />
    <link rel="stylesheet" href="css/login.css" />
    <link href='https://fonts.googleapis.com/css?family=Roboto:400,700' rel='stylesheet' type='text/css'>
    <link rel="icon" type="image/ico" href="img/favicon.png">
    <meta name="viewport" content="initial-scale=1, width=device-width, maximum-scale=1, minimum-scale=1, user-scalable=no">
    <title>FoxFile - Register</title>
</head>
<body>
<main class="float-2 register">
    <header class="header float" id="header-main">
        <span>Create a new account</span>
    </header>
	<section class="content">
        <form name="register" method="post" action="./api/auth/new" onsubmit="createNew(); return false;">
            <div class="inputbar noslider nosel">
                <label class="userlabel">
                    <input name="email" class="userinfo" id="email" type="text" autofocus required>
                    <span class="placeholder-userinfo nosel">Your email</span>
                    <hr class="input-underline" />
                    <div class="error error-email"><div class="error-message">Invalid Email Address</div></div>
                </label>
            </div>
            <div class="inputbar inputbar-half nosel">
                <label class="userlabel">
                    <input name="firstname" class="userinfo" id="firstname" type="text" required>
                    <span class="placeholder-userinfo nosel">First name</span>
                    <hr class="input-underline" />
                    <div class="error error-name"><div class="error-message">Username not Available</div></div>
                </label>
            </div>
            <div class="inputbar inputbar-half nosel">
                <label class="userlabel">
                    <input name="lastname" class="userinfo" id="lastname" type="text">
                    <span class="placeholder-userinfo nosel">Last name</span>
                    <hr class="input-underline" />
                    <div class="error error-name"><div class="error-message">Username not Available</div></div>
                </label>
            </div>
            <div class="inputbar nosel">
                <label class="userlabel">
                    <input name="password" class="userinfo" id="password" type="password" required>
                    <span class="placeholder-userinfo nosel">Password</span>
                    <hr class="input-underline" />
                    <div class="error error-pass"><div class="error-message">Passwords do not Match</div></div>
                </label>
            </div>
            <div class="inputbar nosel">
                <label class="userlabel">
                    <input name="password2" class="userinfo" id="password2" type="password" required>
                    <span class="placeholder-userinfo nosel">Repeat password</span>
                    <hr class="input-underline" />
                    <div class="error error-pass"><div class="error-message">Passwords do not Match</div></div>
                </label>
            </div>
            <div class="inputbar nosel">
                <label class="userlabel">
                    <input name="gpass" class="userinfo" id="gpass" type="password" required>
                    <span class="placeholder-userinfo nosel">Access code</span>
                    <hr class="input-underline" />
                    <div class="error error-gpass"><div class="error-message">Nope</div></div>
                </label>
            </div>
            <a href="./" class="new-account">Got an account?</a>
            <button class="btn btn-submit" type="submit">Create<link class="rippleJS" /></button>
        </form>
	</section>
</main>
<?php include './includes/footer.html'; ?>
<script type="text/javascript" src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
<script type="text/javascript" src="js/ripple.js"></script>
<script type="text/javascript" src="js/forge.min.js"></script>
<script type="text/javascript" src="js/crypto-js.min.js"></script>
    <script type="text/javascript">
    $(document).ready(function() {
        var user = $('#email').val();
        $('#email').attr('empty', (user != '') ? 'false' : 'true');
        jQuery().mousemove(function(e) {
            forge.random.collectInt(e.clientX, 16);
            forge.random.collectInt(e.clientY, 16);
        });
    });
    $('input.userinfo').change(function() {
        $(this).attr('empty', ($(this).val() != '') ? 'false' : 'true');
    });
    var passMatch = false;
    $('#password2, #password').change(function() {
        if ($('#password').val() == $('#password2').val()) {
            $('.error-pass').removeClass('active');
            passMatch = true;
        } else {
            if ($('#password2').val() != '') {
                $('.error-pass').addClass('active');
                passMatch = false;
            }
        }
    });
    function sha512(str) {
        var md = forge.md.sha512.create();
        md.update(str);
        return md.digest().toHex();
    }
    aesE = function(str, pass) {
        // would love to figure out how to use Forge for everything, but I cant figure out how or find any actual documentation
        // and cant figure out how to decrypt anything
        var enc = CryptoJS.AES.encrypt(str, pass);
        return enc.toString();
        return {
            encrypted: enc.toString(),
            enc: enc
        };
    }
    function createNew() {
        if (/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g.test($('#email').val())) {
            $('.error-email').removeClass('active');
            if (passMatch) {
                $('#header-main span').text('Genarating keys...');
                var pki = forge.pki;
                var rsa = forge.pki.rsa;
                var pair = rsa.generateKeyPair({bits: 2048, e: 0x10001});
                var privk = pki.encryptRsaPrivateKey(pair.privateKey, sha512(sha512($('#password').val())));
                //var privk = pki.privateKeyToPem(pair.privateKey);
                var pubk = pki.publicKeyToPem(pair.publicKey);
                $.post('./api/auth/new',
                    {
                        useremail: $('#email').val(),
                        userpass: sha512($('#password').val()),
                        userfirst: $('#firstname').val(),
                        userlast: $('#lastname').val(),
                        //privkey: aesE(privk, sha512($('#password').val())),
                        privkey: privk,
                        pubkey: pubk,
                        gpass: $('#gpass').val()
                    },
                    function(result) {
                        $('#header-main span').text('Create a new account');
                        console.log(result);
                        switch (result) {
                            case '0': //ok
                            case '{"status":500,"message":"Failed to send mail: curl gave SSL certificate problem: unable to get local issuer certificate"}': // because localhost
                                window.location.href = "./login";
                                break;
                            case '1': //invalid u/p
                                $('.error-email').addClass('active').text('Invalid email');
                                break;
                            case '2':
                                $('.error-email').addClass('active').text('Account with that email already exists');
                                break;
                            case '3':
                                $('.error-pass').addClass('active').text('Passwords do not match');
                                break;
                            case '4':
                                $('.error-gpass').addClass('active').text('Incorrect access key');
                                break;
                            case '5':
                                $('.error-email').addClass('active').text('Database error');
                                break;
                        }
                });
            }
    	} else {
    		if ($('#email').val() != '') {
                $('.error-email').addClass('active');
            }
    	}
    };
    </script>
</body>
</html>
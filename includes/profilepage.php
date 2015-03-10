<style type="text/css">
	.fade {
		-webkit-transition: all .2s ease-in-out;
            transition: all .2s ease-in-out;
	}
	input:active,
    input:focus,
    button:active,
    button:focus {
	    outline: 0 none;
	    background: rgba(255,255,255,.2) !important;
	}
	h3 {
		font-family: "quicksandlight", sans-serif;
	}
	.grid-box {
		padding: 20px 0;
		margin: 0;
		border-bottom: 1px solid #2c2c2c;
	}
	.grid-box:after {
		content: "";
	    display: table;
	    clear: both;
	}
	.col-content {
		padding: 10px 30px;
	}
	.col {
		position: relative;
		float: left;
	}
	.col-1 {
		width: 100%;
	}
	.col-2 {
		width: 50%;
	}
	.col-3 {
		width: 33%;
	}
	.col-3-2 {
		width: 67%;
	}
	input.user-setting {
		padding: 10px;
		background: rgba(255,255,255,.05);
		border: none;
		/*border: 1px solid rgb(250, 101, 0);*/
		color: #aaa;
		margin-top: 3px;
	}
	input.full {
		width: 85%;
	}
	input.less {
		width: 70%;
		margin-right: 5px;
	}
	label {
		text-transform: uppercase;
		font-size: 80%;
	}
	.btn-submit {
		padding: 10px 40px;
		background: rgba(248, 114, 23, .3);
		color: #aaa;
		border: none;
	}
	.btn:hover {
		background: rgb(248, 114, 23);
	}
	.uinfo {
		font-size: 90%;
	}
	.progressbar {
		position: absolute;
		height: 40px;
		padding: 0;
		margin: 0;
	}
	#usedstorage {
		background: rgba(248, 114, 23, .3);
		width: 0%;
	}
	#totalstorage {
		background: rgba(255,255,255,.05);
		width: 87%;
	}
</style>
<section class="grid-box">
	<div class="col col-3">
		<div class="col-content">
			<h3>General Info</h3>
			<p>Your name and email and stuff</p>
		</div>
	</div>
	<div class="col col-3-2">
		<p>
			<label>First and Last Name<br>
			<input type="text" class="user-setting less fade" value="{{user-name}}" id="uname" />
			</label>
			<button type="submit" class="btn btn-submit fade" onclick="update_user()">Save</button>
		</p>
		<p>
			<label>Email Address<br>
			<input type="text" class="user-setting less fade" value="{{user-email}}" id="uemail" />
			</label>
			<button type="submit" class="btn btn-submit fade" onclick="update_email()">Save</button>
		</p>
		<p>
			<span style="width:50%;"><label>FoxFile ID: </label><span class="uinfo">{{user-id}}</span></span>
			<span style="left:40%;width:50%;position:absolute"><label>User Since: </label><span class="uinfo">{{join-date}}</span></span>
			<!-- <br> -->
		</p>
	</div>
</section>
<section class="grid-box">
	<div class="col col-3">
		<div class="col-content">
			<h3>Profile Picture</h3>
			<p>Powered by <a href="https://en.gravatar.com/emails/" target="_blank" class="fade">Gravatar</a></p>
		</div>
	</div>
	<div class="col col-3-2">
		<p style="margin: 0">
			<a href="https://en.gravatar.com/emails/" target="_blank" class="fade"><img src="http://gravatar.com/avatar/{{gravatar-avatar-hash}}&s=110" alt="gravatar user image" /></a>
		</p>
	</div>
</section>
<section class="grid-box">
	<div class="col col-3">
		<div class="col-content">
			<h3>Profile Password</h3>
			<p>If you wanted to change your password or something</p>
		</div>
	</div>
	<div class="col col-3-2">
		<p>
			<label>Current Password<br>
			<input type="password" class="user-setting less fade" id="upasscur" />
			</label>
		</p>
		<p>
			<label>New Password<br>
			<input type="password" class="user-setting less fade" id="upassnew" />
			</label>
			<button type="submit" class="btn btn-submit fade" onclick="check_password()">Save</button>
		</p>
	</div>
</section>
<section class="grid-box">
	<div class="col col-3">
		<div class="col-content">
			<h3>File Quota</h3>
			<p>The amount of space you've managed to fill up</p>
		</div>
	</div>
	<div class="col col-3-2">
		<p>
			<label>Storage Used: <span id="used-storage-amount">{{used-storage-amount}}</span> / <span id="total-storage-amount">{{total-storage-amount}}</span> <span id="storage-unit">GB</span> (<span id="storage-percent">{{percent-storage-amount}}</span>%)<br>
			<div class="progressbar" id="totalstorage">
			<div class="progressbar fade" id="usedstorage" style="width: {{percent-storage-amount}}%;"></div>
			</div>
			</label>
		</p>
	</div>
</section>
<script type="text/javascript">
var user_current_name = $('#uname').val();
var user_current_email = $('#uemail').val();
function check_password() {
	var passC = $('#upasscur').val(),
		passN = $('#upassnew').val();
	if (passC.length == 0) {
		d.error("Please enter your current password.");
	} else {
		if (passN.length >= 6) {
			$.post('uauth.php',
			{
				checkpass: passC,
				newpass: passN
			},
			function(result) {
				d.info(result);
				$('#upasscur').val(""),
				$('#upassnew').val("");
		});
		} else {
			d.warning("Password must be at least 8 characters");
		}
	}
}
function update_user() {
	var uN = $('#uname').val();

	if (uN.length == 0) {
		d.warning("Name cannot be blank.");
	} else if (uN == user_current_name) {
		d.info("Name not changed.");
	} else {
		$.post('dbquery.php',
			{
				newname: uN
			},
			function(result) {
				d.info(result);
		});
	}
}
function update_email() {
	var uE = $('#uemail').val();

	if (uE.length == 0) {
		d.warning("Email cannot be blank.");
	} else if (uE == user_current_email) {
		d.info("Email not changed.");
	} else {
		$.post('dbquery.php',
			{
				newemail: uE
			},
			function(result) {
				d.info(result);
		});
	}
}
</script>
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
		-family: "quicksandlight", sans-serif;
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
	input[type="radio"].user-setting {
		display: none;
	}
	input[type='radio'].user-setting + label {
	    background: #000;
	    padding: 10px 0;
	    width: 20%;
	    text-align: center;
	    display: inline-block;
	    cursor: pointer;
	    -webkit-transition: all .2s ease;
	        transition: all .2s ease;
	    background: rgba(255,255,255,.05);
	    text-transform: none;
	}
	input[type='radio'].user-setting:checked + label {
	    background: rgba(248, 114, 23, .3);
	}
</style>
<section class="grid-box">
	<div class="col col-3">
		<div class="col-content">
			<h3>General Settings</h3>
			<p>Site title, name, etc.</p>
		</div>
	</div>
	<div class="col col-3-2">
		<p>
			<label>Site Title<br>
			<input type="text" class="user-setting less fade" value="{{site-title}}" />
			</label>
			<button type="submit" class="btn btn-submit fade">Save</button>
		</p>
		<p>
			<label>Site Name<br>
			<input type="text" class="user-setting less fade" value="{{site-name}}" />
			</label>
			<button type="submit" class="btn btn-submit fade">Save</button>
		</p>
		<p>
			<label>Site Version<br>
			<input type="text" class="user-setting less fade" value="{{site-version}}" />
			</label>
			<button type="submit" class="btn btn-submit fade">Save</button>
		</p>
		<p>
			<label>Allow sharing<br></label>
			<input name="allow-sharing" type="radio" class="user-setting fade" value="true" {{sharing-true}} id="allow-sharing" />
			<label for="allow-sharing"><i class="fa fa-check"></i></label>
			<input name="allow-sharing" type="radio" class="user-setting fade" value="false" {{sharing-false}} id="disallow-sharing" />
			<label for="disallow-sharing"><i class="fa fa-times"></i></label>
		</p>
		<p>
			<label>Display footer<br></label>
			<input name="display-footer" type="radio" class="user-setting fade" value="true" {{footer-true}} id="display-footer-true" />
			<label for="display-footer-true"><i class="fa fa-check"></i></label>
			<input name="display-footer" type="radio" class="user-setting fade" value="false" {{footer-false}} id="display-footer-false" />
			<label for="display-footer-false"><i class="fa fa-times"></i></label>
		</p>
		<p>
			<label>Display page load time<br></label>
			<input name="display-pageloadtime" type="radio" class="user-setting fade" value="true" {{pageloadtime-true}} id="display-pageloadtime-true" />
			<label for="display-pageloadtime-true"><i class="fa fa-check"></i></label>
			<input name="display-pageloadtime" type="radio" class="user-setting fade" value="false" {{pageloadtime-false}} id="display-pageloadtime-false" />
			<label for="display-pageloadtime-false"><i class="fa fa-times"></i></label>
		</p>
		<p>
			<label>Display debug<br></label>
			<input name="display-debug" type="radio" class="user-setting fade" value="true" {{debug-true}} id="display-debug-true" />
			<label for="display-debug-true"><i class="fa fa-check"></i></label>
			<input name="display-debug" type="radio" class="user-setting fade" value="false" {{debug-false}} id="display-debug-false" />
			<label for="display-debug-false"><i class="fa fa-times"></i></label>
		</p>
	</div>
</section>
<section class="grid-box">
	<div class="col col-3">
		<div class="col-content">
			<h3>Security Settings</h3>
			<p>Group password, etc.</p>
		</div>
	</div>
	<div class="col col-3-2">
		<p>
			<label>Group Password<br>
			<input type="password" class="user-setting less fade" value="{{group-password}}" placeholder="Leave blank for no password" />
			</label>
			<button type="submit" class="btn btn-submit fade">Save</button>
		</p>
	</div>
</section>
<section class="grid-box">
	<div class="col col-3">
		<div class="col-content">
			<h3>Server Settings</h3>
			<p>Fancy dangerous stuff like ini_set values.</p>
		</div>
	</div>
	<div class="col col-3-2">
		<p>
			<label>Max upload size (mb)<br>
			<input type="text" class="user-setting less fade" value="{{ini-max-upload}}" />
			</label>
			<button type="submit" class="btn btn-submit fade">Save</button>
		</p>
		<p>
			<label>Display PHP errors<br></label>
			<input name="display-errors" type="radio" class="user-setting fade" value="true" {{errors-true}} id="display-errors-true" />
			<label for="display-errors-true"><i class="fa fa-check"></i></label>
			<input name="display-errors" type="radio" class="user-setting fade" value="false" {{errors-false}} id="display-errors-false" />
			<label for="display-errors-false"><i class="fa fa-times"></i></label>
		</p>
	</div>
</section>
<section class="grid-box">
	<div class="col col-3">
		<div class="col-content">
			<h3>User Settings</h3>
			<p>User settings!</p>
		</div>
	</div>
	<div class="col col-3-2">
		<p>
			<label>Default Gravatar [404 | mm | identicon | monsterid | wavatar | retro | blank]<br>
			<input type="text" class="user-setting less fade" value="{{gravatar-default}}" />
			</label>
			<button type="submit" class="btn btn-submit fade">Save</button>
		</p>
		<p>
			<label>Gravatar Rating [g | pg | r | x]<br>
			<input type="text" class="user-setting less fade" value="{{gravatar-rating}}" />
			</label>
			<button type="submit" class="btn btn-submit fade">Save</button>
		</p>
	</div>
</section>
<script type="text/javascript">

</script>
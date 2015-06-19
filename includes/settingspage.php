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
			<input type="text" class="user-setting less fade"  id="title" value="{{site-title}}" />
			</label>
			<button type="submit" class="btn-settings btn btn-submit fade" id="title" >Save</button>
		</p>
		<p>
			<label>Site Name<br>
			<input type="text" class="user-setting less fade"  id="name" value="{{site-name}}" />
			</label>
			<button type="submit" class="btn-settings btn btn-submit fade" id="name" >Save</button>
		</p>
		<p>
			<label>Site Version<br>
			<input type="text" disabled class="user-setting less fade" value="{{site-version}}" />
			</label>
		</p>
		<p>
		<label>Promo Message (click to edit)<br>
			<textarea type="text" style="display:none" class="text-settings user-setting less fade" id="promo_message"></textarea>
			</label>
			<div style="display:block" class="promo promo_demo">{{promo-message}}</div>
		</p>
		<p>
			<label>Allow sharing<br></label>
			<input name="allowsharing" type="radio" class="radio-settings user-setting fade" value="true" {{sharing-true}} id="allow-sharing" />
			<label for="allow-sharing"><i class="fa fa-check"></i></label>
			<input name="allowsharing" type="radio" class="radio-settings user-setting fade" value="false" {{sharing-false}} id="disallow-sharing" />
			<label for="disallow-sharing"><i class="fa fa-times"></i></label>
		</p>
		<p>
			<label>Display footer<br></label>
			<input name="showfooter" type="radio" class="radio-settings user-setting fade" value="true" {{footer-true}} id="display-footer-true" />
			<label for="display-footer-true"><i class="fa fa-check"></i></label>
			<input name="showfooter" type="radio" class="radio-settings user-setting fade" value="false" {{footer-false}} id="display-footer-false" />
			<label for="display-footer-false"><i class="fa fa-times"></i></label>
		</p>
		<p>
			<label>Display page load time<br></label>
			<input name="showpageloadtime" type="radio" class="radio-settings user-setting fade" value="true" {{pageloadtime-true}} id="display-pageloadtime-true" />
			<label for="display-pageloadtime-true"><i class="fa fa-check"></i></label>
			<input name="showpageloadtime" type="radio" class="radio-settings user-setting fade" value="false" {{pageloadtime-false}} id="display-pageloadtime-false" />
			<label for="display-pageloadtime-false"><i class="fa fa-times"></i></label>
		</p>
		<p>
			<label>Display debug<br></label>
			<input name="show_debug" type="radio" class="radio-settings user-setting fade" value="true" {{debug-true}} id="display-debug-true" />
			<label for="display-debug-true"><i class="fa fa-check"></i></label>
			<input name="show_debug" type="radio" class="radio-settings user-setting fade" value="false" {{debug-false}} id="display-debug-false" />
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
			<input type="password" class="user-setting less fade"  id="group_password" value="{{group-password}}" placeholder="Leave blank for no password" />
			</label>
			<button type="submit" class="btn-settings btn btn-submit fade" id="group_password" >Save</button>
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
			<input type="text" class="user-setting less fade" id="ini_max_upload" value="{{ini-max-upload}}" />
			</label>
			<button type="submit" class="btn-settings btn btn-submit fade" id="ini_max_upload">Save</button>
		</p>
		<p>
			<label>Display PHP errors<br></label>
			<input name="show_errors" type="radio" class="radio-settings user-setting fade" value="true" {{errors-true}} id="display-errors-true" />
			<label for="display-errors-true"><i class="fa fa-check"></i></label>
			<input name="show_errors" type="radio" class="radio-settings user-setting fade" value="false" {{errors-false}} id="display-errors-false" />
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
			<input type="text" class="user-setting less fade" id="grav_default" value="{{gravatar-default}}" />
			</label>
			<button type="submit" class="btn-settings btn btn-submit fade" id="grav_default">Save</button>
		</p>
		<p>
			<label>Gravatar Rating [g | pg | r | x]<br>
			<input type="text" class="user-setting less fade" id="grav_rating" value="{{gravatar-rating}}" />
			</label>
			<button type="submit" class="btn-settings btn btn-submit fade" id="grav_rating">Save</button>
		</p>
	</div>
</section>
<script type="text/javascript">
if (!settingsOpen) {
	settingsOpen = true;
	function changeSetting(setting, val, type) {
		if (type == 'button') {
			$('button#' + setting).text('Saving...');
		} else {

		}
		val = val.replace(/(['"])/g, "\'");
		//d.info("changing " + setting + ' to ' + val);
		$.post('cfgedit.php',
			{
				edit_setting: setting,
				set_value: val
			},
			function(result) {
				if (result != '') d.info(result);
				//else d.success("Changed Setting");
				if (type == 'button') {
					$('button#' + setting).text('Saved!');
					setTimeout(function() {
						$('button#' + setting).text('Save');
					}, 1000);
				} else {
					
				}
		});
	}

	$(document).on('change', 'input.radio-settings[type="radio"]', function() {
		changeSetting($(this).attr('name'), $(this).val(), 'radio');
		//d.success("Saved settings");
	});
	$(document).on('click', 'button.button-settings[type="submit"]', function() {
		changeSetting($(this).attr('id'), $('#' + $(this).attr('id')).val(), 'button');
		//d.success("Saved settings");
	});
	$(document).on('blur', 'textarea.text-settings', function() {
		changeSetting($(this).attr('id'), $('#' + $(this).attr('id')).val(), 'textarea');
		$('.promo_demo').html($('#' + $(this).attr('id')).val()).css('display', 'block');
		$('textarea#promo_message').css('display', 'none');
		d.success("Saved promo");
	});
	$('.promo_demo').on('click', function() {
		$('textarea#promo_message').val($('.promo_demo').html()).css('display', 'inline').focus();
		$('.promo_demo').css('display', 'none');
	});
}
</script>
<style>
.promo {
	text-align: center;
	width: 70%;
	font-family: 'quicksandlight', sans-serif;
	background: rgba(255,255,255,.05);
	padding: 10px 0;
}
</style>
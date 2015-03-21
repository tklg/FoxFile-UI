<style type="text/css">
	/*.fade {
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
		padding: 10px;
		width: 140px;
		background: rgba(248, 114, 23, .3);
		color: #aaa;
		border: none;
	}
	.btn:hover {
		background: rgb(248, 114, 23);
	}
	.colorbox {
		border: 1px solid #2c2c2c;
		float: left;
		height: 33px;
		width: 50%;
		margin-right: 5px;
		cursor: pointer;
	}
	.colorbox-small {
		width: 33px;
		cursor: default;
	}*/
</style>
<link rel='stylesheet' href='css/spectrum.css' />
<script src='js/spectrum.js'></script>
<section class="grid-box">
	<div class="col col-3">
		<div class="col-content">
			<h3>Color Palette</h3>
			<p>Chose a group of colors to use as the color scheme</p>
		</div>
	</div>
	<div class="col col-3-2">
		<p>
			<div class="colorbox colorbox-small" style="background: {{color-1}}"></div>
			<div class="colorbox colorbox-small" style="background: {{color-2}}"></div>
			<div class="colorbox colorbox-small" style="background: {{color-3}}"></div>
			<div class="colorbox colorbox-small" style="background: {{color-7}}"></div>
			<div class="colorbox colorbox-small" style="background: {{color-4}}"></div>
			<div class="colorbox colorbox-small" style="background: {{color-5}}"></div>
			<div class="colorbox colorbox-small" style="background: {{color-6}}"></div>
			<button class="btn btn-submit" onclick="changeUsedColors('default')">Reset to Default</button>
		</p>
		<p>
			<div class="colorbox colorbox-small" id="PRIMARY" style="background: {{cust-color-1}}"></div>
			<div class="colorbox colorbox-small" id="SECONDARY" style="background: {{cust-color-2}}"></div>
			<div class="colorbox colorbox-small" id="TEXT" style="background: {{cust-color-3}}"></div>
			<div class="colorbox colorbox-small" id="TEXT_SECONDARY" style="background: {{cust-color-7}}"></div>
			<div class="colorbox colorbox-small" id="VERT_DIV" style="background: {{cust-color-4}}"></div>
			<div class="colorbox colorbox-small" id="HORIZ_DIV" style="background: {{cust-color-5}}"></div>
			<div class="colorbox colorbox-small" id="BACKGROUND" style="background: {{cust-color-6}}"></div>
			<button class="btn btn-submit" onclick="changeUsedColors('custom')">Set to Custom</button>
		</p>
	</div>
</section>
<section class="grid-box">
	<div class="col col-3">
		<div class="col-content">
			Primary Color
		</div>
	</div>
	<div class="col col-3-2">
		<input type="text" id="PRIMARY" class="colorbox" style="background: {{cust-color-1}}" value="{{cust-color-1}}"></input>
	</div>
</section>
<section class="grid-box">
	<div class="col col-3">
		<div class="col-content">
			Secondary Color
		</div>
	</div>
	<div class="col col-3-2">
		<input type="text" id="SECONDARY" class="colorbox" style="background: {{cust-color-2}}" value="{{cust-color-2}}"></input>
	</div>
</section>
<section class="grid-box">
	<div class="col col-3">
		<div class="col-content">
			Text Color
		</div>
	</div>
	<div class="col col-3-2">
		<input type="text" id="TEXT" class="colorbox" style="background: {{cust-color-3}}" value="{{cust-color-3}}"></input>
	</div>
</section>
<section class="grid-box">
	<div class="col col-3">
		<div class="col-content">
			Secondary Text Color
		</div>
	</div>
	<div class="col col-3-2">
		<input type="text" id="TEXT_SECONDARY" class="colorbox" style="background: {{cust-color-7}}" value="{{cust-color-7}}"></input>
	</div>
</section>
<section class="grid-box">
	<div class="col col-3">
		<div class="col-content">
			Vertical Divider Color
		</div>
	</div>
	<div class="col col-3-2">
		<input type="text" id="VERT_DIV" class="colorbox" style="background: {{cust-color-4}}" value="{{cust-color-4}}"></input>
	</div>
</section>
<section class="grid-box">
	<div class="col col-3">
		<div class="col-content">
			Horizontal Divider Color
		</div>
	</div>
	<div class="col col-3-2">
		<input type="text" id="HORIZ_DIV" class="colorbox" style="background: {{cust-color-5}}" value="{{cust-color-5}}"></input>
	</div>
</section>
<section class="grid-box">
	<div class="col col-3">
		<div class="col-content">
			Background Color
		</div>
	</div>
	<div class="col col-3-2">
		<input type="text" id="BACKGROUND" class="colorbox" style="background: {{cust-color-6}}" value="{{cust-color-6}}"></input>
	</div>
</section>
<script type="text/javascript">
function changeColor(use, color) {
	$.post('cfgedit.php',
		{
			edit_color: use,
			new_color: color
		},
		function(result) {
			if (result != '') d.info(result);
			//else d.success("Changed color");
	});
}
function changeUsedColors(use) {
	$.post('cfgedit.php',
		{
			use_color: use
		},
		function(result) {
			if (result != '') d.info(result);
			else {
				d.success("Changed color scheme");
				location.reload();
			}
	});
}
$("input.colorbox#PRIMARY").spectrum({
	showInput: true,
    showInitial: true,
    showButtons: false,
    preferredFormat: "hex",
    move: function(color) {
	    $('div.colorbox#PRIMARY').css('background', color.toHexString());
	    $('a, #redfox').css('color', color.toHexString());
	    $('.menubar').css('border-top-color', color.toHexString());
	}
});
$("input.colorbox#SECONDARY").spectrum({
	showInput: true,
    showInitial: true,
    showButtons: false,
    preferredFormat: "hex",
    move: function(color) {
	    $('div.colorbox#SECONDARY, .menubar-content-user, .menubar-content-active').css('background', color.toHexString());
	}
});
$("input.colorbox#TEXT").spectrum({
	showInput: true,
    showInitial: true,
    showButtons: false,
    preferredFormat: "hex",
    move: function(color) {
	    $('.col-content, li, .menubar-title-link, .title').css('color', color.toHexString());
	}
});
$("input.colorbox#TEXT_SECONDARY").spectrum({
	showInput: true,
    showInitial: true,
    showButtons: false,
    preferredFormat: "hex",
    move: function(color) {
	    //$('.col-content, li, .menubar-title-link, .title').css('color', color.toHexString());
	}
});
$("input.colorbox#VERT_DIV").spectrum({
	showInput: true,
    showInitial: true,
    showButtons: false,
    preferredFormat: "hex",
    move: function(color) {
	    $('.bar-vertical').css('border-left-color', color.toHexString());
	}
});
$("input.colorbox#HORIZ_DIV").spectrum({
	showInput: true,
    showInitial: true,
    showButtons: false,
    preferredFormat: "hex",
    move: function(color) {
	    $('.grid-box, .menubar-content').css('border-bottom-color', color.toHexString());
	}
});
$("input.colorbox#BACKGROUND").spectrum({
	showInput: true,
    showInitial: true,
    showButtons: false,
    preferredFormat: "hex",
    move: function(color) {
	    $('.bar, body, .menubar-title').css('background', color.toHexString());
	}
});
$(document).on('change', 'input.colorbox', function(e) {
    changeColor($(this).attr('id'), $(this).val());
});
</script>
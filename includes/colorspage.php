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
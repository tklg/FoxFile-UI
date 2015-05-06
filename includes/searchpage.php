<style>
.row {
	
}
.row-1 {
	width: 100%;
}
input.search {
	width: 100%;
	height: 40px;
	background: rgba(255,255,255,.05);
	color: #ccc;
	font-size: 15px;
	text-indent: 7px;
	border: none;
	font-family: sans-serif;
}
.search-box {
	border-bottom: 1px solid #2c2c2c;
}
</style>
<section class="row row-1">
	<div class="search-box row-content">
		<input class="search" type="search" id="search" placeholder="Type a filename:" />
	</div>
</section>
<section class="row row-1" id="search-target">

</section>

<script type="text/javascript">
var ser;
$('#search').on('keyup', function() {
	search.searchTerm = $('#search').val();
	clearTimeout(ser);
	ser = setTimeout(function() {
    	if (search.searchTerm != '') {
    		search.search(search.searchTerm);
    	} else {
    		$('#search-target').empty();
    	}
	}, 500);
});
$('#search').on('focus', function() {
	search.searchActive = true;
	//d.info("search active");
});
$('#search').on('blur', function() {
	search.searchActive = false;
	//if (search.searchTerm != '') search.search(search.searchTerm);
	//d.info("search inactive");
});
$('#bar-search').attr('id', 'bar-2');
bar.active = 2;
//on search, query and return the first list, then use the existing file stuff to handle the rest
</script>
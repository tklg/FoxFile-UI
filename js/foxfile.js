// http://code.tutsplus.com/tutorials/single-page-todo-application-with-backbonejs--cms-21417
/* 
                                                              
   ad88                             ad88  88  88              
  d8"                              d8"    ""  88              
  88                               88         88              
MM88MMM  ,adPPYba,  8b,     ,d8  MM88MMM  88  88   ,adPPYba,  
  88    a8"     "8a  `Y8, ,8P'     88     88  88  a8P_____88  
  88    8b       d8    )888(       88     88  88  8PP"""""""  
  88    "8a,   ,a8"  ,d8" "8b,     88     88  88  "8b,   ,aa  
  88     `"YbbdP"'  8P'     `Y8    88     88  88   `"Ybbd8"'  
                                                                  
    Foxfile : foxfile.js 
    Copyright (C) 2016 Theodore Kluge
    http://tkluge.net
*/
var app = (function() {
 
    var api = {
        views: {},
        models: {},
        collections: {},
        content: null,
        router: null,
        init: function() {
            this.content = $("#content");
        },
        changeContent: function(el) {
            this.content.empty().append(el);
            return this;
        },
        title: function(str) {
            $("h1").text(str);
            return this;
        }
    };
    var ViewsFactory = {};
    var Router = Backbone.Router.extend({});
    api.router = new Router();

    var rightnav = {
    	isOpen: false,
    	toggle: function() {
    		if (this.isOpen) this.close();
    		else this.open();
    	},
    	open: function() {
    		$('#nav-right').addClass('active');
    		this.isOpen = true;
    	},
    	close: function() {
    		$('#nav-right').removeClass('active');
    		this.isOpen = false;
    	}
    }

    $(document).on('click', '.btn-ctrlbar', function(e) {
    	//change href hash for backbone route
    	$(this).addClass('active').siblings().removeClass('active');
    	if (this.id == 'files') {
    		$('.pages').children().removeClass('active').css('z-index', 400);
    	} else {
    		var elem = this;
    		$('.pages #' + this.id).addClass('active').css('z-index', 401).siblings().css('z-index', 400);
    		setTimeout(function() {
    			$('.pages #' + elem.id).siblings().removeClass('active');
    		}, 500);
    	}
    	console.log("Switched to page " + this.id);
    });
    $(document).on('click', '.user-menu, .nav-right-active-cover, #nav-right .closeOnClick', function(e) {
    	console.log("Toggling right nav");
    	rightnav.toggle();
    });

    return api;
 
})();
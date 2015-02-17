var casper = require('casper').create({
	// pageSettings: {
 //        loadImages:  false,        // The WebPage instance used by Casper will
 //        loadPlugins: false         // use these settings
 //    },
 //    silentErrors: true
});
var config = require('./config');
var fs = require('fs'),
    system = require('system');
// Start navigation in casper
casper.start().then(function() {
    this.echo("Starting, accessing FB...");
});

// Open FB and login
casper.thenOpen('https://facebook.com', function() {
	if (this.exists('#login_form')) {
		this.echo('Accesed FB, now logging in...');
		this.fill('#login_form', {
			'email': config.FB.name,
			'pass' : config.FB.password
		},true);
	}
});

casper.then(function(){
	this.echo('Logged in...');
});
// Open FB and login
// casper.thenOpen('https://facebook.com', function() {
// 	if (this.exists('#login_form')) {
// 		this.echo('Accesed FB, now logging in...');
// 		this.click('input[name="persistent"]');
// 		this.fill('#login_form', {
// 			'email': config.FB.name,
// 			'pass' : config.FB.password
// 		},true);
// 	}
// });


casper.then(function(){

	casper.each(config.events, function(self, evturl) {
		    self.thenOpen(evturl, function() {
		    	try{
        			//fs.write("ol.html",this.getHTML('html'));
    				this.echo('injecting..');
	    			casper.page.injectJs('jquery.min.js');
					this.echo('..ok');

					this.echo('clickButton..');
					casper.thenEvaluate(function(term) {
						document.querySelectorAll('[ajaxify^="/ajax/browser/dialog/group_members"]')[0].id='seeallbtn';
					});

					


					casper.then(function(){
	    				this.click('#seeallbtn');
						this.echo('waitForSelector..');
						casper.waitForSelector('.fbProfileBrowserListItem', function() {
						    this.echo('.fbProfileBrowserListItem FOUND!');
						},function(){
							this.echo('waitForSelectorFAILED.. capturing');
							this.capture('foodeu.jpg', undefined, {
						        format: 'jpg',
						        quality: 75
						    });
						});
					});
					
					var checkForMore = function(){
						this.echo('checking if ShowMore is available..');
						// PAREI AQUI, tem q checar se tem o show more e ficar clicando ate nao ter mais ai sim fetch all uids
						casper.waitForSelector('.fbProfileBrowserListItem', function() {
						    this.echo('.fbProfileBrowserListItem FOUND!');
						},function(){
							this.echo('waitForSelectorFAILED.. capturing');
						});
					};
					checkForMore();


	    			casper.then(function(){
						this.echo('counting..');
						var that = this;
	    				var nowCount = casper.thenEvaluate(function(){
	    					//that.echo($(('.fbProfileBrowserListItem').find('a[href^="https://www.facebook.com/"][data-hovercard]').length));
    						return $('.fbProfileBrowserListItem').find('a[href^="https://www.facebook.com/"][data-hovercard]').length;
	    				});
	    				casper.then(function(){
	    					this.echo('COUNT:' + nowCount);
	    				})
	    			});

    				return;

			        var strRef = this.getHTML('noscript',true);
		        	var lol = strRef.split('URL=/')[1].split('?')[0];
		        	if(lol.indexOf('/')==-1 && isNaN(lol))
		        	{
		        		this.echo(lol + '@facebook.com');
		        	 	var contentTxt = '';
		        	 	try{contentTxt = fs.read('mails.txt');} catch(e2){}
	        			fs.write("mails.txt", contentTxt + lol + '@facebook.com,');
	        		}
	        	} catch(e) { 
	        		console.log(e);
	        	}
		    });
		});

	return;
	this.echo('Now opening UIDs txt...');
	var content = '',
	    f = null,
	    lines = null,
    	eol = system.os.name == 'windows' ? "\r\n" : "\n";

	try {
	    f = fs.open('uids.txt', "r");
	    content = f.read();
	} catch (e) {
	    console.log(e);
	}

	if (f) {
	    f.close();
	}

	if (content) {
	    lines = content.split(eol);
	    console.log(lines);
	    casper.each(lines, function(self, link) {
		    self.thenOpen('http://www.facebook.com/'+link, function() {
		    	try{
			        var strRef = this.getHTML('noscript',true);
		        	var lol = strRef.split('URL=/')[1].split('?')[0];
		        	if(lol.indexOf('/')==-1 && isNaN(lol))
		        	{
		        		this.echo(lol + '@facebook.com');
		        	 	var contentTxt = '';
		        	 	try{contentTxt = fs.read('mails.txt');} catch(e2){}
	        			fs.write("mails.txt", contentTxt + lol + '@facebook.com,');
	        		}
	        	} catch(e) { 
	        		console.log(e);
	        	}
		    });
		});
	}

});

casper.then(function(){
	casper.exit();
})

// casper.thenOpen('http://www.facebook.com/100007913407407', function(){


// 	this.echo('HERE IT GOES:' + this.getHTML('noscript',true));
// 	//var title = this.fetchText('.fbPhotoAlbumTitle');
// 	//this.echo('Opened album ' + title);
// 	// Opens the link in the first pic of the album to start fetching
// 	//this.open(this.getElementAttribute('.uiMediaThumb', 'href'));
//  });


casper.run();
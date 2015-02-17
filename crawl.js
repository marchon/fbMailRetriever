var casper = require('casper').create({
	pageSettings: {
        loadImages:  false,        // The WebPage instance used by Casper will
        loadPlugins: false         // use these settings
    },
    silentErrors: true
});
var config = require('./config');
var fs = require('fs'),
    system = require('system');
// Start navigation in casper
casper.start().then(function() {
    this.echo("Starting...");
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
	    console.log("total lines: " + lines.length);
	    var i = 0;
	    casper.each(lines, function(self, link) {
		    self.thenOpen('http://www.facebook.com/'+link, function() {
		    	try{
		    		i++;
			        var strRef = this.getHTML('noscript',true);
		        	var lol = strRef.split('URL=/')[1].split('?')[0];
		        	if(lol.indexOf('/')==-1 && isNaN(lol))
		        	{
		        		this.echo(lol + '@facebook.com' + '-> ' + i +  ' of ' + lines.length);
		        	 	var contentTxt = '';
		        	 	try{contentTxt = fs.read('mails.txt');} catch(e2){}
	        			fs.write("mails.txt", contentTxt + lol + '@facebook.com,');
	        		} else {
	        			this.echo(link + '@facebook.com' + '-> ' + i +  ' of ' + lines.length);
		        	 	var contentTxt = '';
		        	 	try{contentTxt = fs.read('mails.txt');} catch(e2){}
	        			fs.write("mails.txt", contentTxt + link + '@facebook.com,');
	        		}
	        	} catch(e) { 
	        		console.log(e);
	        	}
		    });
		});
	}

});

// casper.thenOpen('http://www.facebook.com/100007913407407', function(){
// 	this.echo('HERE IT GOES:' + this.getHTML('noscript',true));
// 	//var title = this.fetchText('.fbPhotoAlbumTitle');
// 	//this.echo('Opened album ' + title);
// 	// Opens the link in the first pic of the album to start fetching
// 	//this.open(this.getElementAttribute('.uiMediaThumb', 'href'));



// });

casper.run();
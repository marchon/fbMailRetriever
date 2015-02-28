var page = require('webpage').create();
var config = require('./config');
var fs = require('fs');
var system = require('system');

var login = function(){
	page.open('https://www.facebook.com/', function(status) {
		try {
		  	page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {
				console.log('Logging into FB...');
				var lol = page.evaluate(function(config) {
					$('input[name="persistent"]').trigger('click');
					$('#login_form [name=email]').val(config.FB.name);
					$('#login_form [name=pass]').val(config.FB.password);
					$('#login_form').submit();
				},config);
				// window.setTimeout(function(){
				// 	console.log('printing logged.png..');
				// 	page.render('logged.png');
				// },6000);
			});
		} catch (e){

		}
	});
};
login();

var content = '',
    f = null,
    lines = null,
	eol = system.os.name == 'windows' ? "\r\n" : "\n";

var init = function(){

	console.log('Now opening UIDs txt...');

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
		i = -1;
	    readNext();
	}
}

var iAlias = 0;
var iUids = 0;
var iFails = 0;

setTimeout(function(){
	init();
},8000);


function readNext(){
  	page = require('webpage').create();
  	page.settings.loadImages = false;
  	//page.settings.javascriptEnabled = false;
  	i++;
	if(i >= lines.length){
		console.log('----> done crawling!');
		printEnd();
		phantom.exit();
		return;
	}
	try {
		var link = lines[i];
		 page.onResourceReceived = function(resource) {
    		if (resource.redirectURL) {
    			//console.log('resource:' + resource.url);
    			console.log('redir:' + resource.redirectURL);
    		} else {
    			//console.log('resource:' + resource.url);
    		}
		};
		//link = '100000397494275';
		//console.log('fetching: ' + 'https://www.facebook.com/'+link);
		if(link==''||link==null||link==undefined) 
		{
			console.log('blank line found');
			readNext(); 
		}
		else 
		{
			page.open('https://www.facebook.com/'+link, function(status) {
				try {
					var lol = page.evaluate(function() {
						//return document.head.innerHTML;
						var strRef ='<script>window.location.replace("';
						if(document.head.innerHTML.indexOf(strRef) == -1)
							return -1;
						var aux1 = document.head.innerHTML.split(strRef)[1];
						var aux2 = aux1.split('"')[0];
						var aux3 = aux2.split('facebook.com\\/')[1];
						return aux3.replace('profile.php?id=','');
						//return strRef.split('URL=/')[1].split('?')[0];
					});
					//console.log(lol);
					//phantom.exit();
					if(lol == -1){
		    			console.log('NotFound! ' + link + '-> ' + (i+1) +  ' of ' + lines.length);
		    			iFails++;
		    			escreveFailed(link);
		    		}
		    		else if(lol.toString().indexOf('/')==-1 && isNaN(lol))
		        	{
		        		console.log(lol + '@facebook.com' + '-> ' + (i+1) +  ' of ' + lines.length);
		        	 	var contentTxt = '';
		        	 	iAlias++;
		        	 	//try{contentTxt = fs.read('mails.txt');} catch(e2){}
		    			escreveAe(lol + '@facebook.com,');
		    		} else {
		    			console.log(link + '@facebook.com' + '-> ' + (i+1) +  ' of ' + lines.length);
		        	 	iUids++;
		        	 	//try{contentTxt = fs.read('mails.txt');} catch(e2){}
		    			escreveAe(link + '@facebook.com,');
		    		}
		    		page.stop();
		    		page.close();
					readNext();
				} catch(e){
					console.log(e);
					printEnd();
					phantom.exit();
					return;
				}
			});
		}
	} catch(e){
		printEnd();
		phantom.exit();
		return;
	}
	return;
}

function printEnd(){
	console.log(lines.length + ' lines ===> '+(iAlias+iUids) + ' emails [' + iAlias + ' aliases + '+ iUids + ' uids] | ' + iFails + ' not found (fails.txt)');
}

// casper.thenOpen('http://www.facebook.com/100007913407407', function(){
// 	this.echo('HERE IT GOES:' + this.getHTML('noscript',true));
// 	//var title = this.fetchText('.fbPhotoAlbumTitle');
// 	//this.echo('Opened album ' + title);
// 	// Opens the link in the first pic of the album to start fetching
// 	//this.open(this.getElementAttribute('.uiMediaThumb', 'href'));



// });


var ctt = '';
function escreveAe(str){
	ctt += str;
	fs.write("mails.txt", ctt);
}
var ctt2='';
function escreveFailed(str){
	ctt2 += str;
	fs.write("fails.txt", ctt2);
}
var Nightcrawler = require('Nightcrawler');

var settings = {

    // Your Tor-Backed HTTP proxy URL
    proxy: 'http://localhost:8123',

    tor: {
        // Tor Control interface password
        password: '',

        // Not to be confused with Tor's SOCKS4a proxy port, which defaults to 9050
        controlPort: 8123
    },
};

var nightcrawler  =  new Nightcrawler(settings);

// Changes Tor's IP.
nightcrawler.changeIp().then( function(ip) {
    console.log(ip) // New external IP
});

// Get the current IP
nightcrawler.getIp().then( function(ip) {
    console.log('My current IP is: '+ip);
})

// My IP will now change every minute
nightcrawler.conceal(5);
setTimeout(function(){
	nightcrawler.changeIp().then( function(ip) {
	    console.log(ip) // New external IP
	});
	nightcrawler.getIp().then( function(ip) {
    console.log('My current IP is: '+ip);
})
},6000);

setTimeout(function(){
	nightcrawler.changeIp().then( function(ip) {
	    console.log(ip) // New external IP
	});
	nightcrawler.getIp().then( function(ip) {
    console.log('My current IP is: '+ip);
})
},11000);
// My IP will stop changing
nightcrawler.conceal(0);


nightcrawler.info().then( function(info) {

    console.log(info.usingTor); // True or False. Are you using Tor?
    console.log(info.ip);       // Your external IP

});
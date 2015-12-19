
var domReady = require('./ready');
var contactForm = require('./contactForm');
var scroll = require('./scroll');

domReady(function() {
	console.log('Palmetto Themes loaded');
	var pathname = window.location.pathname;
	if (pathname === '/') {
		scroll.init();
	} else if (pathname === '/contact/') {
		contactForm.init();
	} else {
	}
})

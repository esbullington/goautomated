
var domReady = require('./ready');
var contactForm = require('./contactForm');


domReady(function() {
	console.log('Palmetto Themes loaded');
	var pathname = window.location.pathname;
	if (pathname === '/contact/') {
		contactForm.init();
	}
})


var domReady		= require('./ready');
var contactForm = require('./contactForm');
var plugins			= require('./plugins');
var mc					= require('./mailchimp');

domReady(function() {
	console.log('Palmetto Themes loaded');
	var pathname = window.location.pathname;
	if (pathname === '/') {
		mc.init();
	} else if (pathname === '/contact/') {
		contactForm.init();
	} else {
	}
})

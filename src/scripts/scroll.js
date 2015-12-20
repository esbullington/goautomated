var smoothScroll = require('smooth-scroll');

exports.init = function() {
	var button = document.querySelector('.learn-more');
	var options = { speed: 1000, offset: 80, easing: 'easeOutCubic', updateURL: false };
	button.onclick = function() {
		smoothScroll.animateScroll( null, '#section-intro', options );
	}
};

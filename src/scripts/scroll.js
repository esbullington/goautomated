var smoothScroll = require('smooth-scroll');
smoothScroll.init();

exports.init = function() {
	var button = document.querySelector('.learn-more');
	var options = { speed: 1000, offset: 80, easing: 'easeOutCubic' };
	button.onclick = function() {
		smoothScroll.animateScroll( null, '#section-intro', options );
	}
};

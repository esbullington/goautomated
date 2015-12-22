var serialize = require('./formSerialize');

exports.init = function() {

	var contactForm = document.getElementById("contactForm");

	function sendAjax(msg) {
		var xhr = new XMLHttpRequest();
		var url = "https://goautomated.webscript.io/mail";
		xhr.open('POST', url, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhr.onreadystatechange = function() {
			var icon = document.querySelector('.contact-submit-button .icon');
			icon.className = "icon ion-load-a";
			var onsubmitMessage = document.getElementById("onsubmitMessage");
			if (xhr.readyState === 4 && xhr.status === 200) {
				var json = JSON.parse(xhr.response);
				var text = ('innerText' in onsubmitMessage)? 'innerText' : 'textContent';
				if (json.result === 'success') {
					onsubmitMessage[text] = "Thank you for your message.";
					contactForm.reset();
				} else {
					onsubmitMessage[text] = "There's been an error, please try to submit again.";
				}
			} else {
				onsubmitMessage[text] = "There's been an error, please try to submit again.";
			}
		};
		xhr.send(msg);
	}


	contactForm.onsubmit = function(evt) {
		evt.preventDefault();
		var icon = document.querySelector('.contact-submit-button .icon');
		icon.className = "icon ion-loading-a";
		var msg = serialize(contactForm);
		sendAjax(msg);
	};

};

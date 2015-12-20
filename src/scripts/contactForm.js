var serialize = require('./formSerialize');

exports.init = function() {

	var contactForm = document.getElementById("contactForm");

	function sendAjax(msg) {
		var xhr = new XMLHttpRequest();
		var url = "https://goautomated.webscript.io/mail";
		xhr.open('POST', url, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4 && xhr.status === 200) {
				var json = JSON.parse(xhr.response);
				var onsubmitMessage = document.getElementById("onsubmitMessage");
				var text = ('innerText' in onsubmitMessage)? 'innerText' : 'textContent';
				if (json.result === 'success') {
					onsubmitMessage[text] = "Thank you for your message.";
					contactForm.reset();
				} else {
					onsubmitMessage[text] = "There's been an error, please try to submit again.";
				}
			}
		};
		xhr.send(msg);
	}

	contactForm.onsubmit = function(evt) {
		evt.preventDefault();
		var msg = serialize(contactForm);
		console.log('msg', msg);
		sendAjax(msg);
	};

};

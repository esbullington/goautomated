
exports.init = function() {

	var contactForm = document.getElementById("contactForm");

	function sendAjax(msg) {
		var xhr = new XMLHttpRequest();
		var url = "https://zapier.com/hooks/catch/bn14gs/";
		xhr.open('POST', url, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4 && xhr.status === 200) {
				var onsubmitMessage = document.getElementById("onsubmitMessage");
				var text = ('innerText' in onsubmitMessage)? 'innerText' : 'textContent';
				onsubmitMessage[text] = "Thank you for your message";
				contactForm.reset();
			}
		};
		xhr.send(msg);
	}

	function fetchInput(evt) {
		var contactFormName = document.getElementById("contactFormName").value;
		var contactFormEmail = document.getElementById("contactFormEmail").value;
		var contactFormMessage = document.getElementById("contactFormMessage").value;
		var msg = {
			name: contactFormName,
			email: contactFormEmail,
			message: contactFormMessage
		};
		return JSON.stringify(msg);
	}

	contactForm.onsubmit = function(evt) {
		evt.preventDefault();
		var msg = fetchInput(evt);
		sendAjax(msg);
	};

};


module.exports = function domReady(fn, context) {
	function onReady(event) {
		document.removeEventListener("DOMContentLoaded", onReady);
		fn.call(context || exports, event);
	}
	function onReadyIE(event) {
		if (document.readyState === "complete") {
			document.detachEvent("onreadystatechange", onReadyIe);
			fn.call(context || exports, event);
		}
	}
	document.addEventListener && document.addEventListener("DOMContentLoaded", onReady) ||
	document.attachEvent      && document.attachEvent("onreadystatechange", onReadyIE);
};

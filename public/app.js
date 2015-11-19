$(document).on("click", '.mood', function(e) {
	var description = e.target.children[0].innerText;
	document.getElementById("description").innerHTML = "Entry: " + description;
});
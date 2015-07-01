var MAIN_URL = 'http://gsy.no-ip.org/RouletteWeb/';

$(function(){
	setSliders();
	// $("#creteGameForm").click(createGameClicked);
	
});

function setSliders(){
	$('#minBets').slider({
	formatter: function(value) {
		return 'Current value: ' + value;
	}});
	$('#maxBets').slider({
	formatter: function(value) {
		return 'Current value: ' + value;
	}});
	$('#humans').slider({
	formatter: function(value) {
		return 'Current value: ' + value;
	}});
	$('#computers').slider({
	formatter: function(value) {
		return 'Current value: ' + value;
	}});
	$('#initialAmount').slider({
	formatter: function(value) {
		return 'Current value: ' + value;
	}});
	$('#tableTypeIsFrench').bootstrapToggle({
      on: 'French',
      off: 'American'
	});
}

function gameStartClicked(){
    $.ajax({
        data: "",
        url: MAIN_URL+'CreateGame',
        timeout: 5000,
        error: function() {
            alert("Failed to get ajax response");
        },
        success: function(response) {
            alert("Got Ajax Response - " + response);
        }
    });
}
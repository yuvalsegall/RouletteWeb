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
	alert($.getJSON('MAIN_URL'+'CreateGame'));
	
}
var MAIN_URL = 'http://gsy.no-ip.org/RouletteWeb/';
var MAX_PLAYERS = 6;

$(function(){
	setForm();	
});

function setForm(){
	$('#minWages').slider({
	formatter: function(value) {
		return 'Current value: ' + value;
	}});
	$('#maxWages').slider({
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

function checkParams(){
	var playerSum = parseInt($('#humans').val()) + parseInt($('#computers').val());

	if($('#gameName').val() === "")
		showError('Game Name Cannot be Empty');
	else if(playerSum >= MAX_PLAYERS)
		showError('Max Players allowed = ' + MAX_PLAYERS);
	else
		createGame();
}

function showError(msg){
	$('#errorMessage').text(msg).show().fadeOut(2000);
}

function createGame(){
    $.ajax({
        data: {'gameName':$('#gameName').val(), 'computerPlayers':$('#computers').val(), 'humanPlayers':$('#humans').val(), 'minWages': $('#minWages').val(), 'maxWages': $('#maxWages').val(), 'rouletteType':$('#check_id').is(":checked")?'FRENCH':'AMERICAN', 'initalSumOfMoney': $('#initialAmount').val()},
        url: MAIN_URL+'CreateGame',
        timeout: 500000,
        error: function(response) {
        	showError(response.getResponseHeader('exception'));
        },
        success: function(response, xhr) {
            alert(response);
        }
    });
}
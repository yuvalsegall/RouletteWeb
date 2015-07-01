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
        data: {'numOfComputerPlayers':'1','numOfHumanPlayers':'1','initialSumOfMoney':'10', 'maxWages':'1', 'minWages':'0', 'gameName':'aaa', 'rouletteType':'AMERICAN'},
        url: MAIN_URL+'CreateGame',
        timeout: 500000,
        error: function(data, textStatus, request) {
        	alert(data.status);
        	alert(data.responseText);
        },
        success: function(response, xhr) {
            alert(xhr.status);
            alert(xhr.responseText);
        }
    });
}
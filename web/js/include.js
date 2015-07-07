var MAIN_URL = 'http://10.0.0.3/RouletteWeb/';
var MAX_PLAYERS = 6;
var hasServer = false;

$(function () {
    setForm();
});

function setForm() {
    $('#minWages').slider({
        formatter: function (value) {
            return 'Current value: ' + value;
        }});
    $('#maxWages').slider({
        formatter: function (value) {
            return 'Current value: ' + value;
        }});
    $('#humans').slider({
        formatter: function (value) {
            return 'Current value: ' + value;
        }});
    $('#computers').slider({
        formatter: function (value) {
            return 'Current value: ' + value;
        }});
    $('#initialAmount').slider({
        formatter: function (value) {
            return 'Current value: ' + value;
        }});
    $('#tableTypeIsFrench').bootstrapToggle({
        on: 'French',
        off: 'American'
    });
    checkServerStatus();
}

function checkServerStatus() {
    $.ajax({
        data: null,
        url: 'Configurations',
        timeout: 5000,
        error: function (response) {
            waitForLogin();
        },
        success: function (response, xhr) {
            hasServer = true;
            $('#loginDiv').hide();
        }
    });
}

function setServer(){
	$.ajax({
	  type: "POST",
	  url:  'Configurations',
	  data: {'ip': $('#serverAddress').val(), 'port': $('#serverPort').val()},
	  error: function(response){
	  	showError('Error Connectiong to server, try again');
	  },
	  success: function(response){
	  	hasServer = true;
	  	enableGame();
	  },
	  dataType: null
	});
}

function waitForLogin() {
    $("#startGameButton").prop('disabled', true);
}

function enableGame() {
    $("#startGameButton").prop('disabled', false);
}

function checkParams() {
    var playerSum = parseInt($('#humans').val()) + parseInt($('#computers').val());

    if ($('#gameName').val() === "")
        showError('Game Name Cannot be Empty');
    else if (playerSum >= MAX_PLAYERS)
        showError('Max Players allowed = ' + MAX_PLAYERS);
    else
        createGame();
}

function showError(msg) {
    $('#errorMessage').text(msg).show().fadeOut(2500);
}

function createGame() {
    $.ajax({
        data: {'gameName': $('#gameName').val(), 'computerPlayers': $('#computers').val(), 'humanPlayers': $('#humans').val(), 'minWages': $('#minWages').val(), 'maxWages': $('#maxWages').val(), 'rouletteType': $('#check_id').is(":checked") ? 'FRENCH' : 'AMERICAN', 'initalSumOfMoney': $('#initialAmount').val()},
        url: 'CreateGame',
        timeout: 5000,
        error: function (response) {
            showError(response.getResponseHeader('exception'));
        },
        success: function (response, xhr) {
            alert(response);
            replacePage('createGame', 'joinGame');
        }
    });
}

function getActiveGames(){
    //<li class="list-group-item"><a>item</a></li>
    var targetList = $('#gamesList');
    targetList.empty();
        $.ajax({
        data: null,
        url: 'GetWaitingGames',
        timeout: 5000,
        error: function (response) {
            waitForLogin();
        },
        success: function (response, xhr) {
            
        }
    });
}

$(document).on('change', '#XMLFileChooser', function(e){
  $('#fileNameField').val($('#XMLFileChooser').val());
  $("#uploadFile").prop('disabled', false);
});

function loadGameFromXML(){
}

function replacePage(source, target){
	$('#'+source).fadeOut();
	$('#'+target).fadeIn();
}
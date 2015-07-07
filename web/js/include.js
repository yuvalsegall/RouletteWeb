var MAIN_URL = 'http://10.0.0.3/RouletteWeb/';
var MAX_PLAYERS = 6;
var hasServer = false;
var playerID;
var playerName;

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
	  	showMessage('Error Connectiong to server, try again', true);
	  },
	  success: function(response){
        $('#loginDiv').hide();
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
        showMessage('Game Name Cannot be Empty', true);
    else if (playerSum > MAX_PLAYERS)
        showMessage('Max Players allowed = ' + MAX_PLAYERS, true);
    else
        createGame();
}

function showMessage(msg, isError) {
    $('#errorMessage').text(msg).show().fadeOut(2500);
}

function createGame() {
    $.ajax({
        data: {'gameName': $('#gameName').val(), 'computerPlayers': $('#computers').val(), 'humanPlayers': $('#humans').val(), 'minWages': $('#minWages').val(), 'maxWages': $('#maxWages').val(), 'rouletteType': $('#check_id').is(":checked") ? 'FRENCH' : 'AMERICAN', 'initalSumOfMoney': $('#initialAmount').val()},
        url: 'CreateGame',
        timeout: 5000,
        error: function (response) {
            showMessage(response.getResponseHeader('exception'), true);
        },
        success: function (response, xhr) {
            getWaitingGames();
            replacePage('createGame', 'joinGame');
        }
    });
}

function getWaitingGames(){
    var targetList = $('#gamesList');
    targetList.empty();
    $.ajax({
        data: null,
        dataType: 'json',
        url: 'GetWaitingGames',
        timeout: 5000,
        error: function (response) {
            showMessage(response.getResponseHeader('exception'), true);
        },
        success: function (response) {
            for(var i=0 ; i < response.length ; i++){
                var li = $('<li></li>');
                li.addClass("list-group-item");
                var a = $("<a onClick=joinGame('"+ response[i] +"')></a>");
                li.append(a);
                a.html(response[i]);
                targetList.append(li);
            };
        }
    });
}

function joinGame(gameName){
    if($('#userName').val() === ""){
        showMessage('Name cannot be empty', true);
        return;
    }
    $.ajax({
        data: {'gameName' : gameName, 'playerName' : $('#userName').val()},
        dataType: 'json',
        url: 'JoinGame',
        error: function (response) {
            showMessage(response.getResponseHeader('exception'), true);
        },
        success: function (response) {
            playerID = response;
            playerName = $('#userName').val();
            getGameDetails(gameName);
        }
    });    
}

function setBoard(tableType){
    var numOfOuterRows = 3;
    var numOfInnerRows = 12;
    var buttonId = 0;
    var boardDiv = $('#board');

    tableType ==='AMERICAN' ? boardDiv.toggleClass('american') : boardDiv.toggleClass('french');
    for(var i=0 ; i < numOfOuterRows ; i++){
        var outerRow = $('<div></div>').addClass('col-xs-4');
        boardDiv.append(outerRow);
        var innerRow = $('<div></div>').addClass('row');
        outerRow.append(innerRow);
        for(var j=0 ; j < numOfInnerRows ; j++){
            var col = $('<div></div>').addClass('col-xs-1');
            innerRow.append(col);
            var button = $('<button class="btn" value='+ buttonId +' onclick=buttonClicked("'+ buttonId +'")></button>');
            buttonId++;
            col.append(button);
        }
    }
}

function replacePage(source, target){
	$('#'+source).fadeOut();
	$('#'+target).fadeIn();
}
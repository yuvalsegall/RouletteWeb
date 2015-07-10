var MAIN_URL = 'http://10.0.0.3/RouletteWeb/';
var MAX_PLAYERS = 6;
var hasServer = false;
var playerID;
var playerName;
var gameName;

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

function setBoard(tableType){
    var numOfCols = 27;
    var numOfRows = 8;
    var buttonId = 0;
    $('#board').append('<div id=tableDiv></div>');
    var boardDiv = $('#tableDiv');
    var table = $('<table></table>').addClass('table');

    boardDiv.append(table);
    tableType ==='AMERICAN' ? boardDiv.toggleClass('american') : boardDiv.toggleClass('french');
    for(var k=0 ; k < numOfRows ; k++){
        var row = $('<tr></tr>').addClass('myRow');
        table.append(row);
        for(var i=0 ; i < numOfCols ; i++){
            if(i==0)
                var cell = $('<td></td>').addClass('firstTd');
            else
                var cell = $('<td></td>').addClass('midTd');
            row.append(cell);
            var button = $('<a class="tableButton blackButton" value='+ buttonId +' onclick=buttonClicked("'+ buttonId +'")></a>');
            buttonId++;
            cell.append(button);
        }
    }
}

// function setBoard(tableType){
//     var numOfOuterCols = 6;
//     var numOfInnerCols = 6;
//     var numOfRows = 8;
//     var buttonId = 0;
//     $('#board').append('<div id=tableDiv><div>');
//     var boardDiv = $('#tableDiv');

//     tableType ==='AMERICAN' ? boardDiv.toggleClass('american') : boardDiv.toggleClass('french');
//     for(var k=0 ; k < numOfRows ; k++){
//         var row = $('<div></div>').addClass('row');
//         boardDiv.append(row);
//         for(var i=0 ; i < numOfOuterCols ; i++){
//             var outerRow = $('<div></div>').addClass('col-xs-2');
//             row.append(outerRow);
//             var innerRow = $('<div></div>').addClass('row');
//             outerRow.append(innerRow);
//             for(var j=0 ; j < numOfInnerCols ; j++){
//                 var col = $('<div></div>').addClass('col-xs-2');
//                 innerRow.append(col);
//                 var button = $('<button class="btn tableButton blackButton" value='+ buttonId +' onclick=buttonClicked("'+ buttonId +'")></button>');
//                 buttonId++;
//                 col.append(button);
//             }
//         }
//     }
// }

function buttonClicked(buttonID){

}

function replacePage(source, target){
	$('#'+source).fadeOut();
	$('#'+target).fadeIn();
}
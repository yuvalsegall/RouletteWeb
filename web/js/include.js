var MAIN_URL = 'http://10.0.0.3/RouletteWeb/';
var MAX_PLAYERS = 6;
var hasServer = false;
var playerID;
var playerName;
var gameName;
var betNumbers;
var betType;

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

function setBoard(tableType){
    var numOfCols = 26;
    var numOfRows = 6;
    var numOfActionRows = 2;
    var numOfActionCols = 6;
    var buttonId = 0;
    $('#board').append('<div id=tableDiv></div>');
    var boardDiv = $('#tableDiv');
    var table = $('<table></table>').addClass('table');

    boardDiv.append(table);
    tableType ==='AMERICAN' ? boardDiv.toggleClass('american') : boardDiv.toggleClass('french');
    for(var k=0 ; k < numOfRows ; k++){
        var row = $('<tr></tr>');
        k === 0 ? row.addClass('firstRow') : row.addClass('allRows');
        table.append(row);
        for(var i=0 ; i < numOfCols ; i++){
            var cell = $('<td></td>');
            if(i === 0)
                cell.addClass('firstTd');
            else if(i === numOfCols-1)
                cell.addClass('lastTd');
            else
                cell.addClass('midTd'+i);
            row.append(cell);
            var button;
            if(k === 0){
                var firstNumber = 3;
                if(i > 0 && i % 2 === 0){
                    firstNumber = 3 * i / 2;
                    betNumbers = [firstNumber, firstNumber-1, firstNumber-2];
                    betType = 'STREET';
                    button = createTableButton();
                    cell.append(button);
                }
            }
            buttonId++;
        }
    }
    $('#board').append('<div id=secondTable></div>');
    table = $('<table></table>');
    boardDiv = $('#secondTable');
    boardDiv.append(table);
    for(var k=0 ; k < numOfActionRows ; k++){
        if(k === 1){
            $('#board').append('<div id=thirdTable></div>');
            table = $('<table></table>');
            boardDiv = $('#thirdTable');
            boardDiv.append(table);
        }
        var row = $('<tr></tr>').addClass('firstAction');
        table.append(row);
        for(var i=0 ; i < numOfActionCols ; i++){
            if(k === 0 && i % 2 === 1)
                continue;
            var cell = $('<td></td>');
            k === 0 ? cell.addClass('firstActionTD') : cell.addClass('secondActionTD');
            row.append(cell);
            var button = createTableButton();
            buttonId++;
            cell.append(button);
        }
    }
}

function createTableButton(type, numbers){
    return $('<button href="#" class="tableButton" onclick=makeBet()></button>');
}

function buttonClicked(buttonID){

}
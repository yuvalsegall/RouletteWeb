var MAIN_URL = 'http://10.0.0.3/RouletteWeb/';
var MAX_PLAYERS = 6;
var hasServer = false;
var playerID;
var playerName;
var gameName;
var betNumbers;
var betType;
var COLUMN_1 = [3,6,9,12,15,18,21,24,27,30,33,36];
var COLUMN_2 = [2,5,8,11,14,17,20,23,26,29,32,35];
var COLUMN_3 = [1,4,7,10,13,16,19,22,25,28,31,34];

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
    $('#errorMessage').text(msg).show().fadeOut(7000);
}

function setBoard(tableType){
    var numOfCols = 27;
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
            else
                cell.addClass('midTd');
            row.append(cell);
            var button;
            if(k === 0){
                var firstNumber = 3;
                if(i > 0 && i % 2 === 0 && i !== numOfCols-1){
                    firstNumber = 3 * i / 2;
                    numbers = [firstNumber, firstNumber-1, firstNumber-2];
                    button = createTableButton('STREET',numbers);
                    cell.append(button);
                }
            }
            if(k === 1){
                var firstNumber = 3;
                if(i === 0 && tableType === 'AMERICAN'){
                    numbers = [37];
                    button = createTableButton('STRAIGHT',numbers);
                    cell.append(button);
                }
                else if(i === 1 || i === 25)
                    continue;
                else if(i === 26){
                    numbers = COLUMN_1;
                    button = createTableButton('COLUMN_1',numbers);
                    cell.append(button);                    
                }
                else if(i % 2 === 0){
                    numbers = [firstNumber*(i/2)];
                    button = createTableButton('STRAIGHT',numbers);
                    cell.append(button);
                }
                else{
                    var first = firstNumber*(i/2);
                    numbers = [first, first+3];
                    button = createTableButton('SPLIT',numbers);
                    cell.append(button);
                }
            }
            if(k === 2){
                var firstNumber = 3;
                if(i === 0){
                    numbers = [37];
                    button = createTableButton('STRAIGHT',numbers);
                    cell.append(button);
                }
                else if(i === 2){
                    numbers = [2, 3, 37];
                    button = createTableButton('BASKET',numbers);
                    cell.append(button);
                }
                else if(i === 25 || i === 26)
                    continue;
                else if(i % 2 === 0){
                    var first = firstNumber * (i / 2);
                    numbers = [first, first - 1];
                    button = createTableButton('SPLIT',numbers);
                    cell.append(button);
                }
                else{
                    var first = firstNumber * (i / 2);
                    var second = firstNumber * (i / 2) + 3;
                    numbers = [first, first - 1, second, second - 1];
                    button = createTableButton('CORNER',numbers);
                    cell.append(button);
                }
            }
            if(k === 3){
                var firstNumber = 3;
                if(i === 0 || i === 25)
                    continue;
                else if(i === 1){
                    numbers = [0, 2, 37];
                    button = createTableButton('BASKET',numbers);
                    cell.append(button);
                }
                else if(i === 26){
                    numbers = COLUMN_2;
                    button = createTableButton('COLUMN_2',numbers);
                    cell.append(button);                    
                }
                else if(i % 2 === 0){
                    numbers = [firstNumber*(i/2)-1];
                    button = createTableButton('STRAIGHT',numbers);
                    cell.append(button);                }
                else{
                    var first = firstNumber*(i/2)-1;
                    numbers = [first, first + 3];
                    button = createTableButton('STRAIGHT',numbers);
                    cell.append(button);  
                }
            }
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

function buttonClicked(buttonID){

}
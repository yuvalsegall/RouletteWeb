var MAIN_URL = 'http://10.0.0.3/RouletteWeb/';
var MAX_PLAYERS = 6;
var hasServer = false;
var playerID;
var playerName;
var gameName;
var betNumbers;
var betType;
var COLUMN1 = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];
var COLUMN2 = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
var COLUMN3 = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];
var SNAKE = [1, 5, 9, 12, 14, 16, 19, 23, 27, 30, 32, 34];

$(function () {
    setForm();
    init();
    replacePage('createNewGame');
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
}

function checkServerStatus() {
    $.ajax({
        data: null,
        url: 'Configurations',
        error: function (response) {
            waitForLogin();
            $('#loginDiv').show();
            showMessage("Please connect to a server", true, true);
        },
        success: function (response, xhr) {
            hasServer = true;
            $('#loginDiv').hide();
            hideMessage();
        }
    });
}

function setServer() {
    $.ajax({
        type: "POST",
        url: 'Configurations',
        data: {'ip': $('#serverAddress').val(), 'port': $('#serverPort').val()},
        error: function (response) {
            showMessage('Error Connectiong to server, try again', true, true);
        },
        success: function (response) {
            $('#loginDiv').hide();
            hasServer = true;
            enableGame();
            hideMessage();
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
    var playerSum = parseInt($('#humansSlider').val()) + parseInt($('#computersSlider').val());

    if ($('#gameName').val() === "")
        showMessage('Game Name Cannot be Empty', true);
    else if (playerSum > MAX_PLAYERS)
        showMessage('Max Players allowed = ' + MAX_PLAYERS, true);
    else
        createGame();
}

function setBoard(tableType) {
    var numOfCols = 27;
    var numOfRows = 6;
    var numOfActionRows = 2;
    var numOfActionCols = 7;
    var buttonId = 9999;
    $('#board').empty();
    $('#board').append('<div id=tableDiv></div>');
    var boardDiv = $('#tableDiv');
    var table = $('<table></table>').addClass('table');

    boardDiv.append(table);
    tableType === 'AMERICAN' ? boardDiv.toggleClass('american') : boardDiv.toggleClass('french');
    for (var k = 0; k < numOfRows; k++) {
        var row = $('<tr></tr>');
        k === 0 ? row.addClass('firstRow') : row.addClass('allRows');
        table.append(row);
        for (var i = 0; i < numOfCols; i++) {
            buttonId++;
            var cell = $('<td></td>');
            if (i === 0)
                cell.addClass('firstTd');
            else
                cell.addClass('midTd');
            row.append(cell);
            var button = getButtonByRow(k, buttonId, i, tableType);
            if (button === null)
                continue;
            else
                cell.append(button);
        }
    }
    $('#board').append('<div id=secondTable></div>');
    table = $('<table></table>');
    boardDiv = $('#secondTable');
    boardDiv.append(table);
    for (var k = 0; k < numOfActionRows; k++) {
        if (k === 1) {
            $('#board').append('<div id=thirdTable></div>');
            table = $('<table></table>');
            boardDiv = $('#thirdTable');
            boardDiv.append(table);
        }
        var row = $('<tr></tr>').addClass('firstAction');
        table.append(row);
        for (var i = 0; i < numOfActionCols; i++) {
            buttonId++;
            if (k === 0 && i % 2 === 1 && i !== numOfActionCols - 1)
                continue;
            var cell = $('<td></td>');
            if (k === 0 && i === numOfActionCols - 1) {
                cell.attr('id', 'snakeTd');
                numbers = null;
                button = createTableButton(buttonId, 'SNAKE', numbers);
            } else if (k === 0) {
                cell.addClass('firstActionTD');
                if (i === 0) {
                    numbers = null;
                    button = createTableButton(buttonId, 'PREMIERE_DOUZAINE', numbers);
                } else if (i === 2) {
                    numbers = null;
                    button = createTableButton(buttonId, 'MOYENNE_DOUZAINE', numbers);
                } else {
                    numbers = null;
                    button = createTableButton(buttonId, 'DERNIERE_DOUZAINE', numbers);
                }
            } else {
                cell.addClass('secondActionTD');
                if (i === 0) {
                    numbers = null;
                    button = createTableButton(buttonId, 'MANQUE', numbers);
                } else if (i === 1) {
                    numbers = null;
                    button = createTableButton(buttonId, 'PAIR', numbers);
                } else if (i === 2) {
                    numbers = null;
                    button = createTableButton(buttonId, 'ROUGE', numbers);
                } else if (i === 3) {
                    numbers = null;
                    button = createTableButton(buttonId, 'NOIR', numbers);
                } else if (i === 4) {
                    numbers = null;
                    button = createTableButton(buttonId, 'IMPAIR', numbers);
                } else if (i === 5) {
                    numbers = null;
                    button = createTableButton(buttonId, 'PASSE', numbers);
                } else {
                    continue;
                }
            }
            row.append(cell);
            cell.append(button);
        }
    }
}

function getButtonByRow(k, buttonId, i, tableType) {
    if (k === 0)
        return getButtonforFirstNumbersRow(buttonId, i, tableType);
    if (k === 1)
        return getButtonforSecondNumbersRow(buttonId, i, tableType);
    if (k === 2)
        return getButtonforThirdNumbersRow(buttonId, i, tableType);
    if (k === 3)
        return getButtonforMiddleNumbersRow(buttonId, i, tableType);
    if (k === 4)
        return getButtonforFifthNumbersRow(buttonId, i, tableType);
    if (k === 5)
        return getButtonForSixthNumbersRow(buttonId, i, tableType);
}

function getButtonforFirstNumbersRow(buttonId, i, tableType) {
    if (i === 0 || i === 1 || i === 25 || i === 26)
        return null;
    else if (i % 2 === 0) {
        var first = 3 * parseInt(i / 2);
        numbers = [first, first - 1, first - 2];
        return createTableButton(buttonId, 'STREET', numbers);
    } else {
        var first = 3 * parseInt(i / 2);
        var second = first + 3;
        numbers = [first, first - 1, first - 2, second, second - 1, second - 2];
        return createTableButton(buttonId, 'SIX_LINE', numbers);
    }
}

function getButtonforSecondNumbersRow(buttonId, i, tableType) {
    var firstNumber = 3;

    if (i === 0 && tableType === 'AMERICAN') {
        numbers = [37];
        return createTableButton(buttonId, 'STRAIGHT', numbers);
    } else if (i === 1) {
        numbers = [0, 37, 1, 2, 3];
        return createTableButton(buttonId, 'TOP_LINE', numbers);
    } else if (i === 25)
        return null;
    else if (i === 26) {
        numbers = null;
        return createTableButton(buttonId, 'COLUMN1', numbers);
    } else if (i % 2 === 0) {
        numbers = [firstNumber * parseInt((i / 2))];
        return createTableButton(buttonId, 'STRAIGHT', numbers);
    } else {
        var first = firstNumber * parseInt((i / 2));
        numbers = [first, first + 3];
        return createTableButton(buttonId, 'SPLIT', numbers);
    }
}

function getButtonforThirdNumbersRow(buttonId, i, tableType) {
    var firstNumber = 3;

    if (i === 0) {
        tableType === 'AMERICAN' ? numbers = [37] : numbers = [0];
        return createTableButton(buttonId, 'STRAIGHT', numbers);
    } else if (i === 1) {
        if (tableType === 'AMERICAN') {
            numbers = [2, 3, 37];
            return createTableButton(buttonId, 'BASKET', numbers);
        } else {
            numbers = [2, 3, 0];
            return createTableButton(buttonId, 'TRIO', numbers);
        }
    } else if (i === 25 || i === 26)
        return null;
    else if (i % 2 === 0) {
        var first = firstNumber * (i / 2);
        numbers = [first, first - 1];
        return createTableButton(buttonId, 'SPLIT', numbers);
    } else {
        var first = firstNumber * parseInt((i / 2));
        var second = firstNumber * parseInt((i / 2)) + 3;
        numbers = [first, first - 1, second, second - 1];
        return createTableButton(buttonId, 'CORNER', numbers);
    }
}

function getButtonforFifthNumbersRow(buttonId, i, tableType) {
    var firstNumber = 3;

    if (i === 0) {
        tableType === 'AMERICAN' ? numbers = [37] : numbers = [0];
        return createTableButton(buttonId, 'STRAIGHT', numbers);
    } else if (i === 1) {
        numbers = [0, 1, 2];
        if (tableType === 'AMERICAN') {
            return createTableButton(buttonId, 'BASKET', numbers);
        } else {
            return createTableButton(buttonId, 'TRIO', numbers);
        }
    } else if (i === 25 || i === 26)
        return null;
    else if (i % 2 === 0) {
        var first = firstNumber * (i / 2) - 1;
        numbers = [first, first - 1];
        return createTableButton(buttonId, 'SPLIT', numbers);
    } else {
        var first = firstNumber * parseInt((i / 2)) - 1;
        var second = firstNumber * parseInt((i / 2)) + 2;
        numbers = [first, first - 1, second, second - 1];
        return createTableButton(buttonId, 'CORNER', numbers);
    }
}

function getButtonforMiddleNumbersRow(buttonId, i, tableType) {
    var firstNumber = 3;

    if (i === 0 && tableType === 'FRENCH') {
        numbers = [0];
        return createTableButton(buttonId, 'STRAIGHT', numbers);
    }
    else if (i === 0 || i === 25)
        return null;
    else if (i === 1) {
        numbers = [0, 2, 37];
        return createTableButton(buttonId, 'BASKET', numbers);
    }
    else if (i === 26) {
        numbers = null;
        return createTableButton(buttonId, 'COLUMN2', numbers);
    }
    else if (i % 2 === 0) {
        numbers = [firstNumber * parseInt((i / 2)) - 1];
        return createTableButton(buttonId, 'STRAIGHT', numbers);
    }
    else {
        var first = firstNumber * parseInt((i / 2)) - 1;
        numbers = [first, first + 3];
        return createTableButton(buttonId, 'SPLIT', numbers);
    }
}

function getButtonForSixthNumbersRow(buttonId, i, tableType) {
    var firstNumber = 3;

    if (i === 0 && tableType === 'AMERICAN') {
        numbers = [37];
        return createTableButton(buttonId, 'STRAIGHT', numbers);
    }
    else if (i === 1) {
        numbers = [0, 37, 1, 2, 3];
        return createTableButton(buttonId, 'TOP_LINE', numbers);
    }
    else if (i === 25)
        return null;
    else if (i === 26) {
        numbers = null;
        return createTableButton(buttonId, 'COLUMN3', numbers);
    }
    else if (i % 2 === 0) {
        numbers = [firstNumber * parseInt((i / 2)) - 2];
        return createTableButton(buttonId, 'STRAIGHT', numbers);
    }
    else {
        var first = firstNumber * parseInt((i / 2)) - 2;
        numbers = [first, first + 3];
        return createTableButton(buttonId, 'SPLIT', numbers);
    }
}
var SERVLETS_URL = 'http://localhost:80/RouletteWeb/';
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
var lastEventId;
var events;
var eventsInterval;
var playersDetails;
var playerDetails;
var currentPage;
var degrees;
var betAmount;
var mustBet;
var hadBet;
var isMessageShow = false;

$(function () {
    setForm();
    init();
    replacePage('createNewGame');
});

function init() {
    lastEventId = 0;
    events = [];
    clearInterval(eventsInterval);
    eventsInterval = null;
    playersDetails = null;
    playerDetails = null;
    degrees = 270;
    betAmount = 0;
    mustBet = null;
    hadBet = false;
    $("#XMLFileChooser").val("");
    $("#gameName").val("");
    $('#fileNameField').val(" ");
    $("#uploadFile").prop('disabled', true);
    $('#minWagesSlider').slider({min: 0, max: 1, step: 1, value: 0});
    $('#maxWagesSlider').slider({min: 1, max: 10, step: 1, value: 4});
    $('#initialAmountSlider').slider({min: 10, max: 100, step: 5, value: 30});
    $('#humansSlider').slider({min: 0, max: 6, step: 1, value: 1});
    $('#computersSlider').slider({min: 0, max: 6, step: 1, value: 4});
    $("#userName").val("");
    $("#gamesDiv").show();
    $("#userNameDiv").hide();
    $("#playersDiv").hide();
    $("#eventsList").empty();
    checkServerStatus();
}
$(document).on('change', '#XMLFileChooser',
        function (e) {
            $('#fileNameField').val($('#XMLFileChooser').get(0).files[0].name);
            $("#uploadFile").prop('disabled', false);
        }
);

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
        url: SERVLETS_URL + 'Configurations',
        error: function (response) {
            waitForLogin();
            if (response.status !== 503) {
                $('#servlets').show();
                $('#server').hide();
                showMessage("Please connect to the Servlets", true, true);
            }
            else {
                $('#server').show();
                showMessage("Please connect to the Server", true, true);
            }
        },
        success: function (response, xhr) {
            hasServer = true;
            $('#server').hide();
            $('#servlets').hide();
            hideMessage();
        }
    });
}

function setServlets() {
    hideMessage(false);
    setTimeout(function () {
        showMessage("Connecting...", false, true);
    }, 700);
    SERVLETS_URL = 'http://' + $('#servletsAddress').val() + ':' + $('#servletsPort').val() + '/RouletteWeb/';
    $.ajax({
        url: SERVLETS_URL + 'Login',
        error: function (response) {
            $('#servlets').show();
            hideMessage(false);
            setTimeout(function () {
                showMessage('Error Connectiong to servlets, try again', true, true);
            }, 700);
        },
        success: function (response) {
            $('#servlets').hide();
            $('#server').show();
            hideMessage();
            setTimeout(function () {
                showMessage("Connected to the Servlets", false, true);
                setTimeout(function () {
                }, 700);
                setTimeout(function () {
                    hideMessage();
                    setTimeout(function () {
                        showMessage("Please connect to the Server", true, true);
                    }, 700);
                }, 700);
            }, 700);
        },
        dataType: null
    });
}

function setServer() {
    hideMessage(false);
    setTimeout(function () {
        showMessage("Connecting...", false, true);
    }, 700);
    $.ajax({
        type: "POST",
        url: SERVLETS_URL + 'Configurations',
        data: {'ip': $('#serverAddress').val(), 'port': $('#serverPort').val()},
        error: function (response) {
            hideMessage(false);
            setTimeout(function () {
                showMessage('Error Connectiong to server, try again', true, true);
            }, 700);
        },
        success: function (response) {
            $('#server').hide();
            hasServer = true;
            enableGame();
            setTimeout(function () {
                hideMessage();
                setTimeout(function () {
                    showMessage("Connected to the Server", false, true);
                    setTimeout(function () {
                    }, 700);
                    hideMessage();
                }, 700);
            }, 700);
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

function loadGameFromXML() {
    var file = $('#XMLFileChooser').get(0).files[0];
    if (file) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $.ajax({
                data: {"xmlData": e.target.result},
                url: SERVLETS_URL + 'CreateGameFromXML', error: function (response) {
                    showMessage(response.getResponseHeader('exception'), true);
                },
                success: function (response, xhr) {
                    getJoinGames();
                }
            });
        };
        reader.readAsText(file);
    } else {
        showMessage("Failed to load file", true);
    }
}

function startGame() {
    $.ajax({
        data: {"gameName": gameName},
        url: SERVLETS_URL + 'GetGameDetails',
        error: function (response) {
            showMessage(response.getResponseHeader('exception'), true);
        },
        success: function (response, xhr) {
            setBoard(response.rouletteType);
            setWheel(response.rouletteType);
            mustBet = response.minWages === 1;
            getPlayersDetails("playersList", gameName);
            eventsInterval = setInterval(function () {
                getEvents();
            }, 2000);
            getPlayGame();
        }
    });
}

function getPlayersDetails(listId, game) {
    gameName = decodeURI(game);
    $.ajax({
        data: {"gameName": gameName},
        url: SERVLETS_URL + 'GetPlayersDetails',
        error: function (response) {
            showMessage(response.getResponseHeader('exception'), true);
        },
        success: function (response, xhr) {
            playersDetails = response;
            $("#" + listId).empty();
            if (listId === "playersList")
                playersDetails.forEach(function (player) {
                    $("#playersList").append($("<li></li>").addClass("list-group-item").attr("id", "player" + player.name));
                    $("#player" + player.name).append($("<span></span>").addClass("playerName").html(player.name));
                    $("#player" + player.name).append($("<span></span>").addClass("playerMoney").attr("id", "player" + player.name + "money").html(player.money));
                });
            else if (listId === "XMLplayersList")
                playersDetails.forEach(function (player) {
                    if (player.type === 'HUMAN')
                        $("#XMLplayersList").append($("<li></li>").addClass("list-group-item").append($('<a href="#" class="list-group-item" onClick=joinXMLGame("' + player.name + '")></a>').append($("<span></span>").addClass("playerName").html(player.name))));

                });
            $("#gamesDiv").fadeOut("fast");
            isXMLGame();
        }});
}

function getPlayerDetails() {
    $.ajax({
        data: {"playerID": playerID},
        url: SERVLETS_URL + 'GetPlayerDetails',
        error: function (response) {
            showMessage(response.getResponseHeader('exception'));
        },
        success: function (response, xhr) {
            playerDetails = response;
        }});
}

function getEvents() {
    lastEventId = events.length === 0 ? lastEventId : events[events.length - 1].id;
    $.ajax({
        data: {"playerID": playerID, "eventID": lastEventId},
        url: SERVLETS_URL + 'GetEvents',
        error: function (response) {
            showMessage(response.getResponseHeader('exception'), true);
        },
        success: function (response, xhr) {
            events = response;
            checkForServerEvents();
        }
    });
}
function checkForServerEvents() {
    events.forEach(function (event) {
        switch (event.type) {
            case "GAME_OVER":
                showMessage("The game has ended.", true);
                clearInterval(eventsInterval);
                getCreateNewGame();
                break;
            case "GAME_START":
                getPlayersDetails("playersList", gameName);
                hideMessage();
                addStringToFeed("The Game has Started");
                break;
            case "WINNING_NUMBER":
                $("#wheel").fadeIn();
                $("#ballPosition").html(event.winningNumber);
                spinRoulette();
                break;
            case "RESULTS_SCORES":
                setTimeout(function () {
                    setPlayerMoney(event.playerName, parseInt(getPlayerMoney(event.playerName)) + parseInt(event.amount));
                    addStringToFeed(event.playerName + " won " + event.amount + "$");
                }, 5000);
                break;
            case "PLAYER_RESIGNED":
                if (isMyEvent(event.playerName) && playerID !== null) {
                    showMessage("You timed out", true);
                } else {
                    setPlayerResigned(event.playerName);
                    addStringToFeed(event.playerName + " has resigned");
                }
                break;
            case "PLAYER_BET":
                if (!isMyEvent(event.playerName)) {
                    setPlayerMoney(event.playerName, parseInt(getPlayerMoney(event.playerName)) - parseInt(event.amount));
                    addStringToFeed(event.playerName + " bet " + event.amount + "$ on " + event.betType);
                }
                break;
            case "PLAYER_FINISHED_BETTING":
                if (!isMyEvent(event.playerName)) {
                    addStringToFeed(event.playerName + " has finished betting");
                }
                break;
            default:
                break;
        }
    });
}

function setPlayerMoney(name, money) {
    $("#player" + name + "money").html(money);
}

function getPlayerMoney(name) {
    return $("#player" + name + "money").html();
}

function isMyEvent(eventPlayerName) {
    return playerName === eventPlayerName;
}

function addStringToFeed(str) {
    $("#eventsList").prepend($("<li></li>").addClass("list-group-item").html(str));
}

function makeBet(id, type) {
    if (!isMessageShow) {
        var numbers = Array.prototype.slice.call(arguments, 2);
        numbers = JSON.stringify(numbers);
        if (betAmount <= 0)
            showMessage("Choose amount to bet on", true);
        else
            $.ajax({
                data: {"playerID": playerID, "type": type, "betMoney": betAmount, "numbers": numbers},
                url: SERVLETS_URL + 'MakeBet',
                error: function (response) {
                    showMessage(response.getResponseHeader('exception'), true);
                },
                success: function (response, xhr) {
                    hadBet = true;
                    setPlayerMoney(playerName, parseInt(getPlayerMoney(playerName)) - parseInt(betAmount));
                    $("#" + id).addClass("tableButtonWithChip");
                    $("#" + id).attr("value", betAmount);
                    betAmount = 0;
                    $("#betAmount").html(betAmount);
                }
            });
    }
}

function finishBetting() {
    if (!isMessageShow) {
        if (mustBet && !hadBet)
            showMessage("You must place at least one bet", true);
        else
            $.ajax({
                data: {"playerID": playerID},
                url: SERVLETS_URL + 'FinishBetting',
                error: function (response) {
                    showMessage(response.getResponseHeader('exception'), true);
                },
                success: function (response, xhr) {
                    hadBet = false;
                }
            });
    }
}

function resign() {
    $.ajax({
        data: {"playerID": playerID},
        url: SERVLETS_URL + 'Resign',
        error: function (response) {
            showMessage(response.getResponseHeader('exception'), true);
        },
        success: function (response, xhr) {
            clearInterval(eventsInterval);
            playerID = null;
            getCreateNewGame();
        }
    });
}

function setPlayerResigned(name) {
    $("#player" + name).addClass("playerResigned");
}

function spinRoulette() {
    document.getElementById("wheel").style.transform = "rotate(" + degrees + "deg)";
    degrees--;
    if (degrees > 0)
        setTimeout('spinRoulette()', 20);
    else {
        $("#wheel").fadeOut();
        degrees = 270;
        $(".tableButtonWithChip").removeClass("tableButtonWithChip");
        $(".tableButtonWithChip").attr("value", betAmount);
    }
}

function getWaitingGames() {
    var targetList = $('#gamesList');
    targetList.empty();
    $.ajax({
        data: null,
        dataType: 'json',
        url: SERVLETS_URL + 'GetWaitingGames',
        error: function (response) {
            showMessage(response.getResponseHeader('exception'), true);
        },
        success: function (response) {
            if (response.length === 0) {
                showMessage("No games to join", true);
                getCreateNewGame();
            }
            else {
                for (var i = 0; i < response.length; i++) {
                    var li = $('<li></li>');
                    li.addClass("list-group-item");
                    var a = $('<a href="#" class="list-group-item" onClick=getPlayersDetails("XMLplayersList","' + encodeURI(response[i]) + '")></a>');
                    li.append(a);
                    a.html(response[i]);
                    targetList.append(li);
                }
                replacePage('joinGame');
            }
        }
    });
}

function getCreateNewGame() {
    $(".menu").removeClass("active");
    $("#menuCreateNewGame").addClass("active");
    init();
    replacePage('createNewGame');
}

function getJoinGames() {
    $(".menu").removeClass("active");
    $("#menuJoinGame").addClass("active");
    init();
    getWaitingGames();
}

function getCreateXMLGame() {
    $(".menu").removeClass("active");
    $("#menuCreateXMLGame").addClass("active");
    init();
    replacePage('createXMLGame');
}

function getPlayGame() {
    $(".menu").removeClass("active");
    showMessage("Waiting for the other players...", false, true);
    replacePage('playGame');
}

function joinGame() {
    if ($('#userName').val() === "") {
        showMessage('Name cannot be empty', true);
        return;
    }
    playerName = $('#userName').val();
    joinPlayerToGame();
}

function joinXMLGame(playerNameToJoin) {
    playerName = playerNameToJoin;
    joinPlayerToGame();
}

function joinPlayerToGame() {
    $.ajax({
        data: {'gameName': gameName, 'playerName': playerName},
        dataType: 'json',
        url: SERVLETS_URL + 'JoinGame',
        error: function (response) {
            showMessage(response.getResponseHeader('exception'), true);
        },
        success: function (response) {
            playerID = response;
            startGame();
        }
    });
}

function isXMLGame() {
    $.ajax({
        data: {"gameName": gameName},
        url: SERVLETS_URL + 'GetGameDetails',
        error: function (response) {
        },
        success: function (response, xhr) {
            setTimeout(function () {
                $(response.loadedFromXML ? "#playersDiv" : "#userNameDiv").fadeIn();
            }, 300);
        }
    });
}

function replacePage(target) {
    $('#' + currentPage).fadeOut("fast");
    setTimeout(function () {
        $('#' + target).fadeIn("fast");
    }, 300);
    currentPage = target;
}

function createGame() {
    $.ajax({
        data: {'gameName': $('#gameName').val(), 'computerPlayers': $('#computersSlider').val(), 'humanPlayers': $('#humansSlider').val(), 'minWages': $('#minWagesSlider').val(), 'maxWages': $('#maxWagesSlider').val(), 'rouletteType': $('#tableTypeIsFrench').is(":checked") ? 'FRENCH' : 'AMERICAN', 'initalSumOfMoney': $('#initialAmountSlider').val()},
        url: SERVLETS_URL + 'CreateGame',
        error: function (response) {
            showMessage(response.getResponseHeader('exception'), true);
        },
        success: function (response, xhr) {
            getJoinGames();
        }
    });
}

function setWheel(tableType) {
    tableType === 'AMERICAN' ? $('#wheel').toggleClass('americanRoulette') : $('#wheel').toggleClass('frenchRoulette');
}

function addChipToAmount(amount) {
    if (betAmount + amount > getPlayerMoney(playerName))
        showMessage("You cant bet on money you don't have!", true);
    else {
        betAmount += amount;
        $("#betAmount").html(betAmount);
    }
}

function createTableButton(id, type, numbers) {
    return $('<button href="#" class="tableButton" id="' + id + '" onclick=makeBet("' + id + '","' + type + '",' + numbers + ')></button>');
}

function showMessage(msg, isError, toHide) {
    isMessageShow = true;
    $('#errorMessage').addClass(isError ? "alert-danger" : "alert-info");
    $('#errorMessage').text(msg).fadeIn();
    if (!toHide || toHide === undefined)
        hideMessage(true);
}

function hideMessage(toWait) {
    isMessageShow = false;
    setTimeout(function () {
        $('#errorMessage').fadeOut();
        setTimeout(function () {
            $('#errorMessage').removeClass("alert-danger");
            $('#errorMessage').removeClass("alert-info");
        }, 400);
    }, toWait ? 4000 : 0);
}
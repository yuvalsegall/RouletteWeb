var lastEventId = 0;
var events;
var eventsInterval;
var playersDetails;
var playerDetails;
var finishBettingB;

$(document).on('change', '#XMLFileChooser',
        function (e) {
            $('#fileNameField').val($('#XMLFileChooser').get(0).files[0].name);
            $("#uploadFile").prop('disabled', false);
        }
);

function loadGameFromXML() {
    var file = $('#XMLFileChooser').get(0).files[0];
    if (file) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $.ajax({
                data: {"xmlData": e.target.result},
                url: 'CreateGameFromXML',
                error: function (response) {
                    showMessage(response.getResponseHeader('exception'), true);
                },
                success: function (response, xhr) {
                    getWaitingGames();
                    replacePage('createGame', 'joinGame');
                }
            });
        };
        reader.readAsText(file);
    } else {
        showMessage("Failed to load file", true);
    }
}

function getGameDetails(gameName) {
    $.ajax({
        data: {"gameName": gameName},
        url: 'GetGameDetails',
        error: function (response) {
            showMessage(response.getResponseHeader('exception'), true);
        },
        success: function (response, xhr) {
            setBoard(response.rouletteType);
            getPlayersDetails();
            eventsInterval = setInterval(function () {
                getEvents();
            }, 1000);
            replacePage('joinGame', 'playGame');
        }
    });
}

function getPlayersDetails() {
    $.ajax({
        data: {"gameName": gameName},
        url: 'GetPlayersDetails',
        error: function (response) {
            showMessage(response.getResponseHeader('exception'), true);
        },
        success: function (response, xhr) {
            playersDetails = response;
            buildPlayersList();
        }
    });
}

function buildPlayersList() {
    playersDetails = playersDetails.filter(function (player) {
        return player.status === 'ACTIVE';
    });
    playersDetails.forEach(function (player) {
        $("#playersList").append($("<li></li>").addClass("list-group-item").attr("id", "player" + player.name));
        $("#player" + player.name).append($("<span></span>").addClass("playerName").html(player.name));
        $("#player" + player.name).append($("<span></span>").addClass("playerMoney").attr("id", "player" + player.name + "money").html(player.money));
    });
}

function getPlayerDetails() {
    $.ajax({
        data: {"playerID": playerID},
        url: 'GetPlayerDetails',
        error: function (response) {
            showMessage(response.getResponseHeader('exception'));
        },
        success: function (response, xhr) {
            playerDetails = response;
        }
    });
}

function getEvents() {
    lastEventId = typeof events === 'undefined' || events.length === 0 ? lastEventId : events[events.length - 1].id;
    $.ajax({
        data: {"playerID": playerID, "eventID": lastEventId},
        url: 'GetEvents',
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
                replacePage('playGame', 'createGame');
                break;
            case "GAME_START":
                addStringToFeed("The Game has Started");
                break;
            case "WINNING_NUMBER":
                spinRoulette(event.getWinningNumber());
                break;
            case "RESULTS_SCORES":
                setPlayerMoney(event.playerName, getPlayerMoney(event.playerName) + event.amount);
                addStringToFeed(event.playerName + " won " + event.amount + "$");
                break;
            case "PLAYER_RESIGNED":
                if (isMyEvent(event.playerName)) {
                    showMessage("You timed out", true);
                } else {
                    setPlayerResigned(event.playerName);
                    addStringToFeed(event.playerName + " has resigned");
                }
                break;
            case "PLAYER_BET":
                setPlayerMoney(event.playerName, getPlayerMoney(event.playerName) - event.amount);
                if (!isMyEvent(event.playerName)) {
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
    $("#player" + name + "money").html();
}

function isMyEvent(eventPlayerName) {
    return playerName === eventPlayerName;
}

function addStringToFeed(str) {
    $("#eventsList").append($("<li></li>").addClass("list-group-item").html(str));
//    $("#eventsList").scrollTo($("#eventslist").size() - 1);
}

var makeBetB;
function makeBet(playerID, type, betMoney, numbers) {
    $.ajax({
        data: {"playerID": playerID, "type": type, "betMoney": betMoney, "numbers": numbers},
        url: 'MakeBet',
        error: function (response) {
            showMessage(response.getResponseHeader('exception'), true);
        },
        success: function (response, xhr) {
            makeBetB = true;
        }
    });
}

function finishBetting(playerID) {
    $.ajax({
        data: {"playerID": playerID},
        url: 'FinishBetting',
        error: function (response) {
            showMessage(response.getResponseHeader('exception'), true);
        },
        success: function (response, xhr) {
            finishBettingB = true;
        }
    });
}

function resign() {
    $.ajax({
        data: {"playerID": playerID},
        url: 'Resign',
        error: function (response) {
            showMessage(response.getResponseHeader('exception'), true);
        },
        success: function (response, xhr) {
            clearInterval(eventsInterval);
        }
    });
}

function setPlayerResigned(name) {
    $("#player" + name).getName().getStyleClass().remove("themeLabel");
    $("#player" + name).getName().getStyleClass().remove("themeLabel");
}

function  spinRoulette(position) {
    addStringToFeed("Ball on: " + position);
}
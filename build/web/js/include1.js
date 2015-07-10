var lastEventId = 0;
var events;
var eventsInterval;
var playersDetails;
var playerDetails;
var finishBettingB;
var currentPage = "createGame";

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
                url: 'CreateGameFromXML', error: function (response) {
                    showMessage(response.getResponseHeader('exception'), true);
                },
                success: function (response, xhr) {
                    getWaitingGames();
                    replacePage('joinGame');
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
            replacePage('playGame');
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
        }});
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
                replacePage('createGame');
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
    $("#player" + name).addClass("playerResigned");
}

function  spinRoulette(position) {
    addStringToFeed("Ball on: " + position);
}

function Button(key, value) {
    this.key = key;
    this.value = value;
}

Button.prototype.getKey = function () {
    return this.key;
};

Button.prototype.getValue = function () {
    return this.value;
};

Button.prototype.setKey = function (key) {
    this.key = key;
};

Button.prototype.setValue = function (value) {
    this.value = value;
};

function getWaitingGames() {
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
            for (var i = 0; i < response.length; i++) {
                var li = $('<li></li>');
                li.addClass("list-group-item");
                var a = $('<a onClick=joinGame("' + encodeURI(response[i]) + '")></a>');
                li.append(a);
                a.html(response[i]);
                targetList.append(li);
            }
            ;
        }
    });
    $(".menu").removeClass("active");
    $("#menuJoinGame").addClass("active");
    replacePage('joinGame');
}

function getCreateGame() {
    $(".menu").removeClass("active");
    $("#menuCreateGame").addClass("active");
    replacePage('createGame');
}

function joinGame(gameToJoin) {
    gameToJoin = decodeURI(gameToJoin);
    if ($('#userName').val() === "") {
        showMessage('Name cannot be empty', true);
        return;
    }
    $.ajax({
        data: {'gameName': gameToJoin, 'playerName': $('#userName').val()},
        dataType: 'json',
        url: 'JoinGame',
        error: function (response) {
            showMessage(response.getResponseHeader('exception'), true);
        },
        success: function (response) {
            playerID = response;
            playerName = $('#userName').val();
            gameName = gameToJoin;
            getGameDetails(gameName);
        }
    });
}

function replacePage(target) {
    $('#' + currentPage).fadeOut();
    $('#' + target).fadeIn();
    target = currentPage;
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
var lastEventId = 0;
var events;
var eventsInterval;
var playersDetails;
var playerDetails;
var currentPage;
var degrees = 270;
var betAmount = 0;
var mustBet;
var hadBet = false;

$(document).on('change', '#XMLFileChooser',
        function (e) {
            $('#fileNameField').val($('#XMLFileChooser').get(0).files[0].name);
            $("#uploadFile").prop('disabled', false);
        }
);

function init() {
    replacePage('createNewGame');
}

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
                    gameName = response;
                    $('#fileNameField').val(" ");
                    $("#uploadFile").prop('disabled', true);
                    getPlayersDetails("XMLplayersList");
                }
            });
        };
        reader.readAsText(file);
    } else {
        showMessage("Failed to load file", true);
    }
}

function startGame(gameName) {
    $.ajax({
        data: {"gameName": gameName},
        url: 'GetGameDetails',
        error: function (response) {
            showMessage(response.getResponseHeader('exception'), true);
        },
        success: function (response, xhr) {
            setBoard(response.rouletteType);
            setWheel(response.rouletteType);
            mustBet = response.minWages === 1;
            getPlayersDetails("playersList");
            eventsInterval = setInterval(function () {
                getEvents();
            }, 1000);
            replacePage('playGame');
        }
    });
}

function getPlayersDetails(listId) {
    $.ajax({
        data: {"gameName": gameName},
        url: 'GetPlayersDetails',
        error: function (response) {
            showMessage(response.getResponseHeader('exception'), true);
        },
        success: function (response, xhr) {
            playersDetails = response;
            playersDetails = playersDetails.filter(function (player) {
                return player.id !== 0;
            });
            $("#" + listId).empty();
            playersDetails.forEach(function (player) {
                if (listId === "playersList") {
                    $("#" + listId).append($("<li></li>").addClass("list-group-item").attr("id", "player" + player.name));
                    $("#player" + player.name).append($("<span></span>").addClass("playerName").html(player.name));
                    $("#player" + player.name).append($("<span></span>").addClass("playerMoney").attr("id", "player" + player.name + "money").html(player.money));
                }
                else {
                    var targetList = $('#playersList');
                    targetList.empty();
                    for (var i = 0; i < response.length; i++) {
                        var li = $('<li></li>');
                        li.addClass("list-group-item");
                        var a = $('<a onClick=joinGame("' + encodeURI(response[i]) + '")></a>');
                        li.append(a);
                        a.html(response[i]);
                        targetList.append(li);
                    }
                }
                $("#" + listId).append($("<li></li>").addClass("list-group-item").attr("id", "player" + player.name));
                $("#player" + player.name).append($("<span></span>").addClass("playerName").html(player.name));
                $("#player" + player.name).append($("<span></span>").addClass("playerMoney").attr("id", "player" + player.name + "money").html(player.money));
            }
            });
        }
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
    return $("#player" + name + "money").html();
}

function isMyEvent(eventPlayerName) {
    return playerName === eventPlayerName;
}

function addStringToFeed(str) {
    $("#eventsList").append($("<li></li>").addClass("list-group-item").html(str));
//    $("#eventsList").scrollTo($("#eventslist").size() - 1);
}

function makeBet() {
    if (betAmount <= 0)
        showMessage("Choose amount to bet on", true);
    else
        $.ajax({
            data: {"playerID": playerID, "type": betType, "betMoney": betAmount, "numbers": betNumbers},
            url: 'MakeBet',
            error: function (response) {
                showMessage(response.getResponseHeader('exception'), true);
            },
            success: function (response, xhr) {
                betAmount = 0;
                hadBet = true;
            }
        });
}

function finishBetting() {
    if (mustBet && !hadBet)
        showMessage("You must place at least one bet", true);
    else
        $.ajax({
            data: {"playerID": playerID},
            url: 'FinishBetting',
            error: function (response) {
                showMessage(response.getResponseHeader('exception'), true);
            },
            success: function (response, xhr) {
                hadBet = false;
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

function spinRoulette(position) {
    addStringToFeed("Ball on: " + position);
    document.getElementById("wheel").style.transform = "rotate(" + degrees + "deg)";
    degrees--;
    if (degrees > 0)
        setTimeout('spinWheel()', 20);
    else
        degrees = 270;
}

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

function getCreateNewGame() {
    $(".menu").removeClass("active");
    $("#menuCreateNewGame").addClass("active");
    replacePage('createNewGame');
}

function getCreateXMLGame() {
    $(".menu").removeClass("active");
    $("#menuCreateXMLGame").addClass("active");
    replacePage('createXMLGame');
}

function joinGame(gameToJoin, ) {
    var playerName;
    //XML Game
    if (gameToJoin === '') {
        gameToJoin = gameName;
    }
    else {
        gameToJoin = decodeURI(gameToJoin);
        if ($('#userName').val() === "") {
            showMessage('Name cannot be empty', true);
            return;
        }
        playerName = $('#userName').val();
    }

    $.ajax({
        data: {'gameName': gameToJoin, 'playerName': playerName},
        dataType: 'json',
        url: 'JoinGame',
        error: function (response) {
            showMessage(response.getResponseHeader('exception'), true);
        },
        success: function (response) {
            playerID = response;
            playerName = $('#userName').val();
            gameName = gameToJoin;
            startGame(gameName);
        }
    });
}

function replacePage(target) {
    $('#' + currentPage).fadeOut();
    $('#' + target).fadeIn();
    currentPage = target;
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
        }
    });
}

function yuval() {
    $.ajax({
        data: {"gameName": "yuval"},
        url: 'GetGameDetails',
        error: function (response) {
            showMessage(response.getResponseHeader('exception'), true);
        },
        success: function (response, xhr) {
            setBoard(response.rouletteType);
            setWheel(response.rouletteType);
            replacePage('playGame');
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
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

$(document).on('change', '#XMLFileChooser',
        function (e) {
            $('#fileNameField').val($('#XMLFileChooser').get(0).files[0].name);
            $("#uploadFile").prop('disabled', false);
        }
);

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
    checkServerStatus();
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
        url: 'GetGameDetails',
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
        url: 'GetPlayersDetails',
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
            $("#gamesDiv").fadeOut();
            isXMLGame();
        }});
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
    lastEventId = events.length === 0 ? lastEventId : events[events.length - 1].id;
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
    var numbers = Array.prototype.slice.call(arguments, 2);
    numbers = JSON.stringify(numbers);
    if (betAmount <= 0)
        showMessage("Choose amount to bet on", true);
    else
        $.ajax({
            data: {"playerID": playerID, "type": type, "betMoney": betAmount, "numbers": numbers},
            url: 'MakeBet',
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
        url: 'GetWaitingGames',
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
        url: 'JoinGame',
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
        url: 'GetGameDetails',
        error: function (response) {
        },
        success: function (response, xhr) {
            setTimeout(function () {
                $(response.loadedFromXML ? "#playersDiv" : "#userNameDiv").fadeIn();
            }, 500);
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
        url: 'CreateGame',
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
    $('#errorMessage').addClass(isError ? "alert-danger" : "alert-info");
    $('#errorMessage').text(msg).fadeIn();
    if (!toHide)
        hideMessage(true);
}

function hideMessage(toWait) {
    setTimeout(function () {
        $('#errorMessage').fadeOut();
        setTimeout(function () {
            $('#errorMessage').removeClass("alert-danger");
            $('#errorMessage').removeClass("alert-info");
        }, 2000);
    }, toWait ? 3000 : 0);
}
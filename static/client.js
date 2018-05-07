$(function() {
    const DEBUGGING = true;

    let games = new Map();
    let streams = new Map();

    $('#search').click(() => {
        // alert($('#customGames').val().split(', '));
        // alert($('#gameList').val())

        updateGamesList( $('#customGames').val().split(', '), $('#gameList').val(), $('#englishOnly').prop('checked') ? 'en' : '');
        
    })
    

    function updateGamesList (nameArray, idArray, language) {
        $.get({
            url: './api/games/specific',
            data: { 
                name: nameArray,
                id: idArray
            },
            error: response => { console.log (`Error: ${response}`) },
            success: gameArray => {
                let queryString = '?';
                gameArray.forEach(game => {
                    queryString += `name=${game.name}&`;
                });
                queryString += language ? `language=${language}` : ''

                pushNewState(addQueryString (window.location, queryString));

                games = buildGamesList(gameArray);
            }
        })
    }

    function buildGamesList (gameArray) {
        let games = new Map();
        gameArray.forEach(game => {
            games.set(game.id, game);
        })

        logIfDebugging(games);
        return games;
    }

    function addQueryString (location, queryString) {
        return location.protocol + "//" + location.host + location.pathname + queryString;
    }

    //Attempts to update the URL without reload, if possible. But falls back to reloading if necessary
    function pushNewState (newUrl) {
        if (history.pushState)
            window.history.pushState({path: newUrl }, '', newUrl);
        else 
            window.location.href = newUrl;
    }

    function logIfDebugging (logStatement) {
        if (DEBUGGING)
            console.log(logStatement);
    }

})

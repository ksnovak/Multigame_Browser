$(function() {
    const DEBUGGING = true;

    let games = new Map();
    let streams = new Map();

    $('#search').click(() => {
        searchSelectedGames(getCustomGames(), getSelectedGames(), getLanguages(), getIncludeTop());
    })
    

    function getCustomGames() {
        return $('#customGames').val().split(', ');
    }
    function getSelectedGames() {
        return $('#gameList').val();
    }
    function getLanguages() {
        return $('#englishOnly').prop('checked') ? 'en' : '';
    }
    function getIncludeTop() {
        return $('#includeTop').prop('checked')
    }

    function searchSelectedGames (nameArray, idArray, languages, includeTop) {
        $.get({
            url: './api/games/specific',
            data: { 
                name: nameArray,
                id: idArray
            },
            error: response => { console.log (`Error: ${response}`) },
            success: gameArray => {
                let queryString = '?';

                if (includeTop)
                    queryString += `includeTop=${includeTop}&`;
                
                if (languages)
                    queryString += `language=en&`


                gameArray.forEach(game => {
                    queryString += `name=${game.name}&`;

                    game.selected = true;
                    games.set(game.id, game);
                });


                pushNewState(addQueryString (window.location, queryString));
            }
        })
    }

    function getTopGames (first) {
        $.get({
            url: './api/games/top',
            data: { 
                first: first
            },
            error: response => { console.log (`Error: ${response}`) },
            success: gameArray => { 
                gameArray.forEach(game => {
                    games.set(game.id, game);
                })
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

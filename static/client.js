$(function() {
    const DEBUGGING = true;

    let games = new Map();
    let streams = new Map();

    $('#search').click(() => {

        Promise.all([
            searchSelectedGames(getCustomGames(), getSelectedGames(), getLanguages(), getIncludeTop()),
            getTopGames(5)
        ])
        .then(results => {
            const selectedGames = results[0];
            const topGames = results[1];

            rebuildGameSelect();
        })
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

    async function searchSelectedGames (nameArray, idArray, languages, includeTop) {
        const result = await $.get({
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
        return result;
    }

    async function getTopGames (first) {
        const result = await $.get({
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

        return result
    }

    function rebuildGameSelect() {
        var $gameSelect = $('#gameList');

        var optionsMarkup = '';
        games.forEach(game => {
            optionsMarkup += `<option value="${game.id}" ${game.selected ? 'selected' : ''}>${game.name}</option>`
        })

        $gameSelect.html(optionsMarkup); 
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

$(function() {
    const DEBUGGING = true;

    let games = new Map();
    let streams = new Map();

    $('#search').click(() => {        
        let selectedGames =  $('#gameList').val();
        games.forEach(game => {
            game.selected = (selectedGames.includes(game.id.toString()));
            
            games.set(game.id, game);
        })

        Promise.all([
            searchSelectedGames({
                nameArray: getCustomGames(), 
                idArray: getSelectedGames(), 
                languages: getLanguages(), 
                includeTop: getIncludeTop(), 
                exclude: getExclusions()
            }),
            getTopGames(5)
        ])
        .then(results => {
            const selectedGames = results[0];
            const topGames = results[1];

            rebuildGameSelect();
        })
    })

    $('#myFaves').click(() => {
        searchSelectedGames({
            nameArray: ['Rimworld', 'Into the Breach', 'Terraria', 'Stardew Valley', 'Dungeon of the Endless', 'Guild Wars 2', 'Slay the Spire', 'Cities: Skylines'], 
            languages: 'en',
            includeTop: true
        })
    })
    

    function getCustomGames() {
        return $('#customGames').val().split(', ');
    }
    function getSelectedGames() {
        return $('#gameList').val();
    }

    //TODO: gotta change this to a language selection instead of just 'en'
    function getLanguages() {
        return $('#englishOnly').prop('checked') ? 'en' : '';
    }
    function getIncludeTop() {
        return $('#includeTop').prop('checked')
    }

    function getExclusions() {
        let excludeText = $('#excludeNames').val();

        if (excludeText.length > 0) 
            return excludeText.split(', ');
        else 
            return null
    }


    //This function just gets the games' names and sets querystring operators. It doesn't actually get any stream details.
    async function searchSelectedGames (searchOptions) {
        const result = await $.get({
            url: './api/games/specific',
            data: { 
                name: searchOptions.nameArray,
                id: searchOptions.idArray//,
                //exclude: searchOptions.exclude
            },
            error: response => { console.log (`Error: ${response}`) },
            success: gameArray => {
                let queryString = '?';

                if (searchOptions.includeTop)
                    queryString += `includeTop=${searchOptions.includeTop}&`;
                
                if (searchOptions.languages)
                    queryString += `language=${searchOptions.languages}&`

                if (searchOptions.exclude) {
                    searchOptions.exclude.forEach(exclude => {
                        queryString += `exclude=${exclude}&`
                    })
                }
                
                gameArray.forEach(game => {
                    queryString += `name=${game.name}&`;

                    game.selected = true;
                    games.set(game.id, game);
                });

                if (queryString[queryString.length-1] == "&") {
                    queryString = queryString.slice(0, queryString.length-1);
                }
                
                //This line is for refresh-less updating of the URL bar
                //pushNewState(addQueryString (window.location, queryString));

                //This line is for basic refresh with new querystring
                window.location.href = window.location.protocol + "//" + window.location.host + window.location.pathname + queryString;
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

    function testHandlebarFunction() {
        var source   = $("#stream-template").html();
        var template = Handlebars.compile(source);  
        var data = {}// {users: [  
        //     {username: "alan", firstName: "Alan", lastName: "Johnson", email: "alan@test.com" },  
        //     {username: "allison", firstName: "Allison", lastName: "House", email: "allison@test.com" },  
        //     {username: "ryan", firstName: "Ryan", lastName: "Carson", email: "ryan@test.com" }  
        //   ]};
  
        $("#content-placeholder").html(template(data));
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

    function alertIfDebugging(alertStatement) {
        if (DEBUGGING)
            alert(alertStatement);
    }

})

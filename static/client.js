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
                exclude: getExclusions(),
                include: getInclusions()
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
            includeTop: true,
            include: ['aphromoo', 'lethalfrag', 'scarra', 'meteos', 'day9tv', 'dismaid', 'scarizardplays', 'kitboga', 'captaincoach', 'albinoliger', 'cilantrogamer', 'insanefrenzy'],
            exclude: ['pokimane', 'tsm_theoddone']
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
        return textFieldToArray('#excludeNames');
    }

    function getInclusions() {
        return textFieldToArray('#includeNames')

    }

    function textFieldToArray(fieldName) {
        let text = $(fieldName).val().toLowerCase();

        // Turn the list of names into an array, and remove duplicates (using a Set)
        if (text.length) {
            return Array.from(new Set(text.split(/,\s*/)));
        }

        return null;
    }


    //This function just gets the games' names and sets querystring operators. It doesn't actually get any stream details.
    const searchSelectedGames = async function (searchOptions) {
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

                queryString += queryStringFromArray(searchOptions.exclude, 'exclude');

                queryString += queryStringFromArray(searchOptions.include, 'include');
                
                gameArray.forEach(game => {
                    queryString += `name=${game.name}&`;

                    game.selected = true;
                    games.set(game.id, game);
                });

                //Remove a trailing ampersand, for a bit of cleanliness
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

    function queryStringFromArray(arr, queryName) {
        let returnString = "";
        if (arr) {
            arr.forEach(elem => {
                returnString += `${queryName}=${elem}&`
            })
        }

        return returnString;
    }

    const getTopGames = async function (first) {
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

    // var StreamView = React.createClass({
    //     render: function() {
    //         return (
    //             <div>{this.props.message}</div>
    //         )
    //     }
    // })

    // ReactDOM.render(<StreamView message='yoyoyo!' />, document.getElementById('hi'))
})

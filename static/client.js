$(function() {

    $('#search').click(() => {
        // alert($('#customGames').val().split(', '));
        // alert($('#gameList').val())

        updateGamesList( $('#customGames').val().split(', '), $('#gameList').val(), $('#englishOnly').prop('checked') ? 'en' : '');
        
    })

    let updateGamesList = function(nameArray, idArray, language) {
        $.get({
            url: './api/games/specific',
            data: { 
                name: nameArray,
                id: idArray
            },
            error: response => { console.log (`Error: ${response}`) },
            success: response => {
                let querystring = '?';
                response.forEach(game => {
                    querystring += `name=${game.name}&`;
                });
                querystring += language ? `language=${language}` : ''
                window.location.href = window.location.protocol + "//" + window.location.host + window.location.pathname + querystring;
            }
        })
    }

    let setGame = function(game) {

    }
})

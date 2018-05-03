$(function() {

    $('#search').click(() => {
        // alert($('#customGames').val().split(', '));
        // alert($('#gameList').val())

        fetch('http://localhost:3000/api/games/top?first=5')
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
    })
})

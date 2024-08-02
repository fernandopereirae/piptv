document.addEventListener('DOMContentLoaded', function() {
    function getQueryParam(param) {
        var result = null;
        var regex = new RegExp("[?&]" + param + "=([^&#]*)");
        var query = window.location.search;
        var match = regex.exec(query);
        if (match != null) {
            result = decodeURIComponent(match[1]);
        }
        return result;
    }

    var streamURL = getQueryParam('streamURL');
    var currentPage = getQueryParam('page');
    var playerElement = document.getElementById('iptvPlayer');
    var errorMessage = document.getElementById('errorMessage');

    function handleError(error) {
        console.error('Erro ao reproduzir o vídeo:', error);
        errorMessage.textContent = 'Ocorreu um erro ao reproduzir o vídeo. Por favor, tente novamente mais tarde.';
        errorMessage.style.display = 'block';
    }

    if (streamURL) {
        playerElement.src = streamURL;
        playerElement.autoplay = true;

        playerElement.addEventListener('canplay', function() {
            playerElement.play().catch(handleError);
        });

        playerElement.addEventListener('error', handleError);
    } else {
        window.location.href = 'index.html' + (currentPage ? '?page=' + currentPage : '');
    }

    window.addEventListener('popstate', function(event) {
        window.location.href = 'index.html' + (currentPage ? '?page=' + currentPage : '');
    });
});
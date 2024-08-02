document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const streamURL = urlParams.get('streamURL');
    const currentPage = urlParams.get('page');
    const playerElement = document.getElementById('iptvPlayer');
    const errorMessage = document.getElementById('errorMessage');

    function handleError(error) {
        console.error('Erro ao reproduzir o vídeo:', error);
        errorMessage.textContent = 'Ocorreu um erro ao reproduzir o vídeo. Por favor, tente novamente mais tarde.';
        errorMessage.style.display = 'block';
    }

    if (streamURL) {
        playerElement.src = streamURL;
        playerElement.autoplay = true;

        playerElement.addEventListener('canplay', () => {
            playerElement.play().catch(handleError);
        });

        playerElement.addEventListener('error', handleError);
    } else {
        window.location.href = `index.html${currentPage ? '?page=' + currentPage : ''}`;
    }

    window.addEventListener('popstate', function(event) {
        window.location.href = `index.html${currentPage ? '?page=' + currentPage : ''}`;
    });
});
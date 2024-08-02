document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const streamURL = urlParams.get('streamURL');
    const currentPage = urlParams.get('page');
    const playerElement = document.getElementById('iptvPlayer');
    const errorMessage = document.getElementById('errorMessage');
    const player = videojs(playerElement);

    function handleError(error) {
        console.error('Erro ao reproduzir o vídeo:', error);
        errorMessage.textContent = 'Ocorreu um erro ao reproduzir o vídeo. Por favor, tente novamente mais tarde.';
        errorMessage.style.display = 'block';
    }

    if (streamURL) {
        player.src({ src: streamURL, type: 'application/x-mpegURL' });
        player.autoplay(true);

        player.on('canplay', () => {
            player.play().catch(handleError);
        });

        player.on('error', handleError);
    } else {
        window.location.href = `index.html${currentPage ? '?page=' + currentPage : ''}`;
    }

    window.addEventListener('popstate', function(event) {
        window.location.href = `index.html${currentPage ? '?page=' + currentPage : ''}`;
    });
});
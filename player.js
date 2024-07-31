document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const streamURL = urlParams.get('streamURL');
    const player = document.getElementById('iptvPlayer');
    const errorMessage = document.getElementById('errorMessage');

    function handleError(error) {
        console.error('Erro ao reproduzir o vídeo:', error);
        errorMessage.textContent = 'Ocorreu um erro ao reproduzir o vídeo. Por favor, tente novamente mais tarde.';
        errorMessage.style.display = 'block';
    }

    if (streamURL) {
        player.src = streamURL;
        player.autoplay = true;

        player.addEventListener('canplay', () => {
            try {
                if (player.requestFullscreen) {
                    player.requestFullscreen();
                } else if (player.mozRequestFullScreen) { // Firefox
                    player.mozRequestFullScreen();
                } else if (player.webkitRequestFullscreen) { // Chrome, Safari and Opera
                    player.webkitRequestFullscreen();
                } else if (player.msRequestFullscreen) { // IE/Edge
                    player.msRequestFullscreen();
                }
                player.play().catch(handleError);
            } catch (error) {
                handleError(error);
            }
        });

        player.addEventListener('error', handleError);
    } else {
        handleError('Stream URL não encontrada.');
    }
});
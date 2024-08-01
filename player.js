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
            player.play().catch(handleError);
        });

        player.addEventListener('error', handleError);
    } else {
        handleError('Stream URL não encontrada.');
    }
});
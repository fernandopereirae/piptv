document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const streamURL = urlParams.get('streamURL');
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
    }

    // Armazena o estado atual da página no histórico
    window.history.replaceState({ page: window.location.href }, '');

    window.addEventListener('popstate', function(event) {
        if (event.state && event.state.page) {
            window.location.href = event.state.page;
        }
    });
});
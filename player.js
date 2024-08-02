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

    if (playerElement) {
        if (streamURL) {
            // Verifique se o URL é válido
            try {
                const decodedStreamURL = decodeURIComponent(streamURL);
                playerElement.src = decodedStreamURL;

                // Defina autoplay e garanta que o vídeo seja reproduzido em resposta a uma interação do usuário
                playerElement.autoplay = true;
                playerElement.controls = true; // Adiciona controles para ajudar na depuração

                // Adiciona eventos para manejar reprodução e erros
                playerElement.addEventListener('canplay', () => {
                    playerElement.play().catch(handleError);
                });

                playerElement.addEventListener('error', handleError);

            } catch (e) {
                handleError(e);
            }
        } else {
            window.location.href = `index.html${currentPage ? '?page=' + currentPage : ''}`;
        }
    } else {
        console.error('Elemento de player não encontrado.');
    }

    // Gerencia o histórico do navegador
    window.addEventListener('popstate', function() {
        window.location.href = `index.html${currentPage ? '?page=' + currentPage : ''}`;
    });
});
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const streamURL = urlParams.get('streamURL');
    const currentPage = urlParams.get('page');
    const playerElement = document.getElementById('iptvPlayer');
    const errorMessage = document.getElementById('errorMessage');

    function handleError(error) {
        console.error('Erro ao reproduzir o vídeo:', error);
        if (errorMessage) {
            errorMessage.textContent = 'Ocorreu um erro ao reproduzir o vídeo. Por favor, tente novamente mais tarde.';
            errorMessage.style.display = 'block';
        }
    }

    if (playerElement) {
        if (streamURL) {
            // Verifique se o URL é válido
            try {
                const decodedStreamURL = decodeURIComponent(streamURL);
                
                // Configura o elemento de vídeo
                playerElement.src = decodedStreamURL;
                playerElement.autoplay = true;
                playerElement.controls = true; // Adiciona controles para facilitar a depuração

                // Adiciona eventos para manejar reprodução e erros
                playerElement.addEventListener('canplay', () => {
                    playerElement.play().catch(handleError);
                });

                playerElement.addEventListener('error', handleError);

            } catch (e) {
                handleError(e);
            }
        } else {
            // Garante que `currentPage` seja tratado corretamente
            const redirectUrl = `index.html${currentPage ? '?page=' + encodeURIComponent(currentPage) : ''}`;
            window.location.href = redirectUrl;
        }
    } else {
        console.error('Elemento de player não encontrado.');
        if (errorMessage) {
            errorMessage.textContent = 'O player de vídeo não foi encontrado.';
            errorMessage.style.display = 'block';
        }
    }

    // Gerencia o histórico do navegador
    window.addEventListener('popstate', function() {
        const redirectUrl = `index.html${currentPage ? '?page=' + encodeURIComponent(currentPage) : ''}`;
        window.location.href = redirectUrl;
    });
});
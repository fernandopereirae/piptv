document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const streamURL = urlParams.get('streamURL');
    const currentPage = urlParams.get('page');
    const playerElement = document.getElementById('iptvPlayer');
    const errorMessage = document.getElementById('errorMessage');

    function handleError(event) {
        let errorText = 'Ocorreu um erro ao reproduzir o vídeo. Por favor, tente novamente mais tarde.';
        if (event instanceof ErrorEvent) {
            // Erro detalhado
            errorText = `Erro ao reproduzir o vídeo: ${event.message}`;
        } else if (event instanceof Event) {
            // Tipo de evento
            errorText = `Erro ao reproduzir o vídeo: Tipo de evento ${event.type}`;
        }
        console.error(errorText, event);
        if (errorMessage) {
            errorMessage.textContent = errorText;
            errorMessage.style.display = 'block';
        }
    }

    if (playerElement) {
        if (streamURL) {
            try {
                const decodedStreamURL = decodeURIComponent(streamURL);

                // Verifica se a URL é um vídeo suportado
                const videoElement = document.createElement('video');
                videoElement.src = decodedStreamURL;

                // Espera o carregamento do vídeo para verificar se é um formato válido
                videoElement.addEventListener('error', () => {
                    handleError({ message: 'Formato de vídeo não suportado ou erro ao carregar o vídeo.' });
                });

                playerElement.src = decodedStreamURL;
                playerElement.autoplay = true;
                playerElement.controls = true;

                playerElement.addEventListener('canplay', () => {
                    playerElement.play().catch(handleError);
                });

                playerElement.addEventListener('error', handleError);
            } catch (e) {
                console.error('Erro ao configurar o player:', e);
                handleError(e);
            }
        } else {
            console.error('URL de transmissão não fornecida.');
            if (errorMessage) {
                errorMessage.textContent = 'URL de transmissão não fornecida.';
                errorMessage.style.display = 'block';
            }
        }
    } else {
        console.error('Elemento de player não encontrado.');
        if (errorMessage) {
            errorMessage.textContent = 'O player de vídeo não foi encontrado.';
            errorMessage.style.display = 'block';
        }
    }

    window.addEventListener('popstate', function() {
        const redirectUrl = `index.html${currentPage ? '?page=' + encodeURIComponent(currentPage) : ''}`;
        window.location.href = redirectUrl;
    });
});
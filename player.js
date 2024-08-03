document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const streamURL = urlParams.get('streamURL');
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
            try {
                const decodedStreamURL = decodeURIComponent(streamURL);
                const fileExtension = decodedStreamURL.split('.').pop().toLowerCase();

                if (fileExtension === 'mp4' || fileExtension === 'm3u8') {
                    playerElement.src = decodedStreamURL;
                    playerElement.autoplay = true;

                    playerElement.addEventListener('canplay', () => {
                        playerElement.play().catch(handleError);
                    });

                    playerElement.addEventListener('error', handleError);
                } else {
                    handleError('Formato de vídeo não suportado. Use apenas MP4 ou M3U8.');
                }
            } catch (e) {
                handleError(e);
            }
        } else {
            handleError('URL do stream não foi fornecida.');
        }
    } else {
        console.error('Elemento de player não encontrado.');
        if (errorMessage) {
            errorMessage.textContent = 'O player de vídeo não foi encontrado.';
            errorMessage.style.display = 'block';
        }
    }
});
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
            try {
                const decodedStreamURL = decodeURIComponent(streamURL);

                // Verificar se o URL é MP4 ou M3U8
                const fileExtension = decodedStreamURL.split('.').pop().toLowerCase();
                if (fileExtension === 'mp4') {
                    playerElement.src = decodedStreamURL;
                    playerElement.autoplay = true;

                    playerElement.addEventListener('canplay', () => {
                        playerElement.play().catch(handleError);
                    });

                    playerElement.addEventListener('error', handleError);
                } else if (fileExtension === 'm3u8') {
                    if (Hls.isSupported()) {
                        const hls = new Hls();
                        hls.loadSource(decodedStreamURL);
                        hls.attachMedia(playerElement);
                        hls.on(Hls.Events.MANIFEST_PARSED, () => {
                            playerElement.play().catch(handleError);
                        });
                        hls.on(Hls.Events.ERROR, (event, data) => {
                            handleError(`Erro HLS: ${data.type} - ${data.details}`);
                        });
                    } else if (playerElement.canPlayType('application/vnd.apple.mpegurl')) {
                        playerElement.src = decodedStreamURL;
                        playerElement.addEventListener('canplay', () => {
                            playerElement.play().catch(handleError);
                        });
                        playerElement.addEventListener('error', handleError);
                    } else {
                        handleError('O navegador não suporta a reprodução de HLS.');
                    }
                } else {
                    handleError('Formato de vídeo não suportado. Use apenas MP4 ou M3U8.');
                }
            } catch (e) {
                handleError(e);
            }
        } else {
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

    window.addEventListener('popstate', function() {
        const redirectUrl = `index.html${currentPage ? '?page=' + encodeURIComponent(currentPage) : ''}`;
        window.location.href = redirectUrl;
    });
});
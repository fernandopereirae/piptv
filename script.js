const baseURL = 'http://pfsv.io'; // Substitua 'YOUR_BASE_URL' pela URL desejada
const baseLogin = 'elianolista'; // Substitua 'YOUR_LOGIN' pelo login desejado
const basePassword = 'sualista'; // Substitua 'YOUR_PASSWORD' pela senha desejada
const BATCH_SIZE = 5; // Número de canais para carregar de cada vez

function fetchChannels() {
    fetch(`${baseURL}/player_api.php?username=${baseLogin}&password=${basePassword}&action=get_live_streams`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Dados recebidos da API:', data);
        const channelButtons = document.getElementById('channelButtons');
        const loadingMessage = document.getElementById('loadingMessage');
        channelButtons.innerHTML = ''; // Limpa os botões antes de adicionar novos

        if (Array.isArray(data)) {
            let startIndex = 0;

            function loadBatch() {
                const endIndex = Math.min(startIndex + BATCH_SIZE, data.length);
                for (let i = startIndex; i < endIndex; i++) {
                    const channel = data[i];
                    const button = document.createElement('button');
                    button.classList.add('channel-button');
                    button.textContent = channel.name;
                    button.dataset.streamId = channel.stream_id;
                    button.addEventListener('click', () => {
                        const streamURL = `${baseURL}/live/${baseLogin}/${basePassword}/${channel.stream_id}.m3u8`;
                        window.open(`player.html?streamURL=${encodeURIComponent(streamURL)}`, '_blank');
                    });
                    channelButtons.appendChild(button);
                }
                startIndex = endIndex;
                if (startIndex < data.length) {
                    setTimeout(loadBatch, 10); // Aguarde 50ms antes de carregar o próximo lote
                } else if (loadingMessage) {
                    loadingMessage.style.display = 'none';
                }
            }

            loadBatch();
        } else {
            throw new Error('Formato de dados inesperado.');
        }
    })
    .catch(error => {
        console.error('Erro ao buscar canais:', error);
        const channelButtons = document.getElementById('channelButtons');
        const loadingMessage = document.getElementById('loadingMessage');
        channelButtons.innerHTML = `<p>Erro ao carregar canais: ${error.message}. Por favor, tente novamente mais tarde.</p>`;
        if (loadingMessage) {
            loadingMessage.style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    fetchChannels(); // Chama a função ao carregar a página
});
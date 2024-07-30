const baseURL = 'http://pfsv.io'; // Substitua 'YOUR_BASE_URL' pela URL desejada
const baseLogin = 'elianolista'; // Substitua 'YOUR_LOGIN' pelo login desejado
const basePassword = 'sualista'; // Substitua 'YOUR_PASSWORD' pela senha desejada

function fetchChannels() {
    fetch(`${baseURL}/player_api.php?username=${baseLogin}&password=${basePassword}&action=get_live_streams`)
    .then(response => response.json())
    .then(data => {
        console.log('Dados recebidos da API:', data);
        const channelButtons = document.getElementById('channelButtons');
        channelButtons.innerHTML = ''; // Limpa os botões antes de adicionar novos

        if (data && Array.isArray(data)) {
            data.forEach(channel => {
                const button = document.createElement('button');
                button.classList.add('channel-button');
                button.textContent = channel.name;
                button.dataset.streamId = channel.stream_id;
                button.addEventListener('click', () => {
                    const streamURL = `${baseURL}/live/${baseLogin}/${basePassword}/${channel.stream_id}.m3u8`;
                    window.open(`player.html?streamURL=${encodeURIComponent(streamURL)}`, '_blank');
                });
                channelButtons.appendChild(button);
            });
        } else {
            console.error('Formato de dados inesperado:', data);
        }
    })
    .catch(error => {
        console.error('Erro ao buscar canais:', error);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    fetchChannels(); // Chama a função ao carregar a página
});
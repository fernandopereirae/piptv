const baseURL = 'http://pfsv.io'; // Substitua 'YOUR_BASE_URL' pela URL desejada
const baseLogin = 'elianolista'; // Substitua 'YOUR_LOGIN' pelo login desejado
const basePassword = 'sualista'; // Substitua 'YOUR_PASSWORD' pela senha desejada

function fetchChannels() {
    fetch(`${baseURL}/player_api.php?username=${baseLogin}&password=${basePassword}&action=get_live_streams`)
    .then(response => response.json())
    .then(data => {
        console.log('Dados recebidos da API:', data);
        const channelList = document.getElementById('channelList');
        channelList.innerHTML = ''; // Limpa a lista de canais antes de adicionar novos

        if (data && Array.isArray(data)) {
            data.forEach(channel => {
                const option = document.createElement('option');
                option.value = channel.stream_id;
                option.text = channel.name;
                channelList.appendChild(option);
            });

            // Exibe a lista de canais após preencher
            document.getElementById('channelList').style.display = 'block';
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

document.getElementById('channelList').addEventListener('change', function() {
    const selectedChannelId = this.value;
    const player = document.getElementById('iptvPlayer');

    if (selectedChannelId) {
        const streamURL = `${baseURL}/live/${baseLogin}/${basePassword}/${selectedChannelId}.m3u8`;
        player.src = streamURL;
    }
});
let baseURL, baseLogin, basePassword;

function fetchChannels(url, login, password) {
    baseURL = url;
    baseLogin = login;
    basePassword = password;

    fetch(`${url}/player_api.php?username=${login}&password=${password}&action=get_live_streams`)
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

function login() {
    const url = document.getElementById('urlInput').value;
    const login = document.getElementById('loginInput').value;
    const password = document.getElementById('passwordInput').value;

    fetchChannels(url, login, password);
}

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();    
    // Impede o envio do formulário
    login();
});

document.getElementById('channelList').addEventListener('change', function() {
    const selectedChannelId = this.value;
    const player = document.getElementById('iptvPlayer');

    if (selectedChannelId) {
        const streamURL = `${baseURL}/live/${baseLogin}/${basePassword}/${selectedChannelId}.m3u8`;
        player.src = streamURL;

        /
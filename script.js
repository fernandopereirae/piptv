let baseURL, baseLogin, basePassword;

function fetchChannels() {
    fetch(`${baseURL}/player_api.php?username=${baseLogin}&password=${basePassword}&action=get_live_streams`)
    .then(response => response.json())
    .then(data => {
        console.log('Dados recebidos da API:', data);
        const channelListContainer = document.getElementById('channelListContainer');
        channelListContainer.innerHTML = ''; // Limpa a lista de canais antes de adicionar novos

        if (data && Array.isArray(data)) {
            data.forEach(channel => {
                const channelDiv = document.createElement('div');
                channelDiv.classList.add('channel');
                channelDiv.dataset.streamId = channel.stream_id;

                const channelName = document.createElement('p');
                channelName.textContent = channel.name;
                channelDiv.appendChild(channelName);

                channelListContainer.appendChild(channelDiv);

                channelDiv.addEventListener('click', function() {
                    const selectedChannelId = this.dataset.streamId;
                    localStorage.setItem('selectedChannelId', selectedChannelId);
                    window.location.href = 'player.html';
                });
            });
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

    baseURL = url;
    baseLogin = login;
    basePassword = password;

    localStorage.setItem('iptvURL', baseURL);
    localStorage.setItem('iptvLogin', baseLogin);
    localStorage.setItem('iptvPassword', basePassword);

    window.location.href = 'channels.html';
}

document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    if (path.includes('login.html')) {
        document.getElementById('loginForm').addEventListener('submit', function(event) {
            event.preventDefault();
            login();
        });
    } else if (path.includes('channels.html')) {
        baseURL = localStorage.getItem('iptvURL');
        baseLogin = localStorage.getItem('iptvLogin');
        basePassword = localStorage.getItem('iptvPassword');

        if (!baseURL || !baseLogin || !basePassword) {
            window.location.href = 'login.html';
        } else {
            fetchChannels();
        }

        document.getElementById('logoutButton').addEventListener('click', function() {
            localStorage.removeItem('iptvURL');
            localStorage.removeItem('iptvLogin');
            localStorage.removeItem('iptvPassword');
            window.location.href = 'login.html';
        });
    } else if (path.includes('player.html')) {
        const selectedChannelId = localStorage.getItem('selectedChannelId');
        baseURL = localStorage.getItem('iptvURL');
        baseLogin = localStorage.getItem('iptvLogin');
        basePassword = localStorage.getItem('iptvPassword');

        if (!selectedChannelId || !baseURL || !baseLogin || !basePassword) {
            window.location.href = 'channels.html';
        } else {
            const player = document.getElementById('iptvPlayer');
            const streamURL = `${baseURL}/live/${baseLogin}/${basePassword}/${selectedChannelId}.m3u8`;
            player.src = streamURL;
        }

        document.getElementById('backToChannelsButton').addEventListener('click', function() {
            window.location.href = 'channels.html';
        });
    }
});
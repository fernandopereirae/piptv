let baseURL, baseLogin, basePassword;

function fetchChannels() {
    fetch(`${baseURL}/player_api.php?username=${baseLogin}&password=${basePassword}&action=get_live_streams`)
        .then(response => response.json())
        .then(data => {
            console.log('Dados recebidos da API:', data);
            const channelListContainer = document.getElementById('channelListContainer');
            channelListContainer.innerHTML = ''; // Limpa a lista de canais antes de adicionar novos

            if (Array.isArray(data)) {
                data.forEach(channel => {
                    const channelDiv = document.createElement('div');
                    channelDiv.classList.add('channel');
                    channelDiv.dataset.streamId = channel.stream_id;
                    channelDiv.textContent = channel.name;

                    channelDiv.addEventListener('click', () => {
                        localStorage.setItem('selectedChannelId', channel.stream_id);
                        window.location.href = 'player.html';
                    });

                    channelListContainer.appendChild(channelDiv);
                });
            } else {
                console.error('Formato de dados inesperado:', data);
            }
        })
        .catch(error => console.error('Erro ao buscar canais:', error));
}

function login(event) {
    event.preventDefault(); // Previne o comportamento padrão do formulário

    baseURL = document.getElementById('urlInput').value;
    baseLogin = document.getElementById('loginInput').value;
    basePassword = document.getElementById('passwordInput').value;

    localStorage.setItem('iptvURL', baseURL);
    localStorage.setItem('iptvLogin', baseLogin);
    localStorage.setItem('iptvPassword', basePassword);

    window.location.href = 'channels.html'; // Redireciona para a página de canais
}

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    
    if (path.includes('index.html')) {
        document.getElementById('loginForm').addEventListener('submit', login);
    } else if (path.includes('channels.html')) {
        baseURL = localStorage.getItem('iptvURL');
        baseLogin = localStorage.getItem('iptvLogin');
        basePassword = localStorage.getItem('iptvPassword');

        if (!baseURL || !baseLogin || !basePassword) {
            window.location.href = 'index.html';
        } else {
            fetchChannels();
        }

        document.getElementById('logoutButton').addEventListener('click', () => {
            localStorage.removeItem('iptvURL');
            localStorage.removeItem('iptvLogin');
            localStorage.removeItem('iptvPassword');
            window.location.href = 'index.html';
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
            player.src = `${baseURL}/live/${baseLogin}/${basePassword}/${selectedChannelId}.m3u8`;
        }

        document.getElementById('backToChannelsButton').addEventListener('click', () => {
            window.location.href = 'channels.html';
        });
    }
});
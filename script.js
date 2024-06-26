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

        // Adicionar eventos de carregamento e erros
        player.addEventListener('canplay', () => {
            console.log('O vídeo está pronto para ser reproduzido.');
            player.play();
            toggleFullscreen(player); // Chama a função para colocar o vídeo em tela cheia
        });

        player.addEventListener('error', (error) => {
            console.error('Erro ao reproduzir o vídeo:', error);
        });

        player.addEventListener('stalled', () => {
            console.warn('A transmissão do vídeo foi interrompida.');
        });

        player.addEventListener('waiting', () => {
            console.log('Esperando por mais dados...');
        });

        console.log('Reproduzindo canal:', streamURL);
    }
});

document.getElementById('toggleLoginForm').addEventListener('click', function() {
    const loginForm = document.getElementById('loginForm');
    const channelList = document.getElementById('channelList');

    if (loginForm.style.display === 'none' || loginForm.style.display === '') {
        loginForm.style.display = 'block';
        channelList.style.display = 'block';
    } else {
        loginForm.style.display = 'none';
    }
});

// Função para lidar com o botão de sair do login
function logout() {
    const channelList = document.getElementById('channelList');
    const urlInput = document.getElementById('urlInput');
    const loginInput = document.getElementById('loginInput');
    const passwordInput = document.getElementById('passwordInput');

    // Limpar os campos de login
    urlInput.value = '';
    loginInput.value = '';
    passwordInput.value = '';

    // Limpar a lista de canais
    channelList.innerHTML = '<option value="">Selecione um canal</option>';

    // Mostrar os elementos de login e esconder o botão de sair
    toggleLoginElements('block');
}

// Função para lidar com o envio do formulário de login
function handleLoginFormSubmit(event) {
    event.preventDefault();
    login();
}

// Adicionar ouvinte de eventos para o envio do formulário de login
document.getElementById('loginForm').addEventListener('submit', handleLoginFormSubmit);

// Adicionar ouvinte de eventos para o botão de sair
document.getElementById('logoutButton').addEventListener('click', logout);

// Função para colocar o vídeo em tela cheia
function toggleFullscreen(element) {
    if (!document.fullscreenElement) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) { /* Firefox */
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) { /* IE/Edge */
            element.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { /* Firefox */
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { /* Chrome, Safari & Opera */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE/Edge */
            document.msExitFullscreen();
        }
    }
}
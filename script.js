const baseURL = 'http://pfsv.io'; // Defina a URL aqui
const baseLogin = 'elianolista'; // Defina o login aqui
const basePassword = 'sualista'; // Defina a senha aqui
const channelsPerPage = 20; // Número de canais por página

let currentPage = 1; // Página atual

function fetchChannels(page = 1) {
    console.log(`Iniciando o carregamento dos canais - Página ${page}...`);

    fetch(`${baseURL}/player_api.php?username=${baseLogin}&password=${basePassword}&action=get_live_streams`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Dados recebidos da API:', data);
            const channelListContainer = document.getElementById('channelListContainer');
            if (channelListContainer) {
                channelListContainer.innerHTML = ''; // Limpa a lista de canais antes de adicionar novos

                if (Array.isArray(data)) {
                    // Calcula o índice inicial e final para a página atual
                    const start = (page - 1) * channelsPerPage;
                    const end = start + channelsPerPage;
                    const channelsToDisplay = data.slice(start, end);

                    channelsToDisplay.forEach(channel => {
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

                    console.log('Canais carregados com sucesso.');

                    // Atualiza a navegação
                    updatePagination(page, data.length);
                } else {
                    console.error('Formato de dados inesperado:', data);
                }
            } else {
                console.error('Elemento com ID "channelListContainer" não encontrado.');
            }
        })
        .catch(error => console.error('Erro ao buscar canais:', error));
}

function updatePagination(page, totalChannels) {
    const totalPages = Math.ceil(totalChannels / channelsPerPage);
    const paginationContainer = document.getElementById('paginationContainer');
    
    if (paginationContainer) {
        paginationContainer.innerHTML = '';

        if (page > 1) {
            const prevButton = document.createElement('button');
            prevButton.textContent = 'Anterior';
            prevButton.addEventListener('click', () => {
                currentPage -= 1;
                fetchChannels(currentPage);
            });
            paginationContainer.appendChild(prevButton);
        }

        if (page < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.textContent = 'Próximo';
            nextButton.addEventListener('click', () => {
                currentPage += 1;
                fetchChannels(currentPage);
            });
            paginationContainer.appendChild(nextButton);
        }
    } else {
        console.error('Elemento com ID "paginationContainer" não encontrado.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path.includes('index.html') || path === '/') {
        fetchChannels(currentPage);
    } else if (path.includes('player.html')) {
        const selectedChannelId = localStorage.getItem('selectedChannelId');
        if (!selectedChannelId) {
            console.error('Nenhum canal selecionado. Redirecionando para canais...');
            window.location.href = 'index.html';
        } else {
            const player = document.getElementById('iptvPlayer');
            if (player) {
                player.src = `${baseURL}/live/${baseLogin}/${basePassword}/${selectedChannelId}.m3u8`;
                console.log('Reproduzindo canal ID:', selectedChannelId);
            } else {
                console.error('Elemento com ID "iptvPlayer" não encontrado.');
            }
        }

        const backToChannelsButton = document.getElementById('backToChannelsButton');
        if (backToChannelsButton) {
            backToChannelsButton.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        } else {
            console.error('Elemento com ID "backToChannelsButton" não encontrado.');
        }
    }
});
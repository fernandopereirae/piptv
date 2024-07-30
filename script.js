const baseURL = 'http://pfsv.io';
const baseLogin = 'elianolista';
const basePassword = 'sualista';
const channelsPerPage = 20;

let currentPage = 1;

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
            const channelList = document.getElementById('channelList');
            if (channelList) {
                channelList.innerHTML = '';

                if (Array.isArray(data)) {
                    const start = (page - 1) * channelsPerPage;
                    const end = start + channelsPerPage;
                    const channelsToDisplay = data.slice(start, end);

                    channelsToDisplay.forEach(channel => {
                        const listItem = document.createElement('li');
                        listItem.textContent = channel.name;
                        listItem.dataset.streamId = channel.stream_id;
                        listItem.style.cursor = 'pointer';

                        listItem.addEventListener('click', () => {
                            localStorage.setItem('selectedChannelId', channel.stream_id);
                            window.location.href = 'player.html';
                        });

                        channelList.appendChild(listItem);
                    });

                    console.log('Canais carregados com sucesso.');

                    updatePagination(page, data.length);
                } else {
                    console.error('Formato de dados inesperado:', data);
                }
            } else {
                console.error('Elemento com ID "channelList" não encontrado.');
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
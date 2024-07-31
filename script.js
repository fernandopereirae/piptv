const baseURL = 'http://pfsv.io'; // Substitua 'YOUR_BASE_URL' pela URL desejada
const baseLogin = 'elianolista'; // Substitua 'YOUR_LOGIN' pelo login desejado
const basePassword = 'sualista'; // Substitua 'YOUR_PASSWORD' pela senha desejada

function fetchWithTimeout(resource, options = { timeout: 10000 }) {
    const { timeout } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    return fetch(resource, { ...options, signal: controller.signal })
        .then(response => {
            clearTimeout(id);
            if (!response.ok) throw new Error('Erro na requisição: ' + response.statusText);
            return response.json();
        });
}

function fetchChannels() {
    const loadingMessage = document.getElementById('loadingMessage');
    const categoryContainer = document.getElementById('category-container');

    if (!loadingMessage || !categoryContainer) {
        console.error('Elementos necessários não encontrados no DOM.');
        return;
    }

    loadingMessage.style.display = 'block'; // Exibe a mensagem de carregamento

    Promise.all([
        fetchWithTimeout(`${baseURL}/player_api.php?username=${baseLogin}&password=${basePassword}&action=get_live_streams`),
        fetchWithTimeout(`${baseURL}/player_api.php?username=${baseLogin}&password=${basePassword}&action=get_live_categories`)
    ])
    .then(([channelsData, categoriesData]) => {
        if (!Array.isArray(channelsData) || !Array.isArray(categoriesData)) {
            throw new Error('Formato de dados inesperado.');
        }

        // Associa canais a categorias
        categoriesData.forEach(category => {
            category.channels = channelsData.filter(channel => channel.category_id === category.category_id);
        });

        // Limpa e exibe categorias e canais
        categoryContainer.innerHTML = '';
        categoriesData.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category';

            categoryDiv.innerHTML = `<h2>${category.category_name}</h2>`;
            const channelList = document.createElement('div');
            channelList.className = 'channel-list';

            // Adiciona canais à categoria
            category.channels.forEach(channel => {
                const card = document.createElement('div');
                card.className = 'channel-item';
                card.dataset.streamId = channel.stream_id;

                card.innerHTML = `
                    <img src="${channel.stream_icon || ''}" alt="${channel.name}" class="channel-icon">
                    <p class="channel-name">${channel.name}</p>
                `;

                card.addEventListener('click', () => {
                    const streamURL = `${baseURL}/live/${baseLogin}/${basePassword}/${channel.stream_id}.m3u8`;
                    window.open(`player.html?streamURL=${encodeURIComponent(streamURL)}`, '_blank');
                });

                channelList.appendChild(card);
            });

            categoryDiv.appendChild(channelList);
            categoryContainer.appendChild(categoryDiv);
        });

        loadingMessage.style.display = 'none'; // Oculta a mensagem de carregamento
    })
    .catch(error => {
        console.error('Erro ao buscar dados:', error);
        categoryContainer.innerHTML = `<p>Erro ao carregar categorias e canais: ${error.message}. Por favor, tente novamente mais tarde.</p>`;
        loadingMessage.style.display = 'none'; // Oculta a mensagem de carregamento
    });
}

document.addEventListener('DOMContentLoaded', function() {
    fetchChannels(); // Chama a função ao carregar a página
});
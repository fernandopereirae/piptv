document.addEventListener("DOMContentLoaded", async function() {
    const url = sessionStorage.getItem('baseURL');
    const login = sessionStorage.getItem('baseLogin');
    const password = sessionStorage.getItem('basePassword');

    if (!url || !login || !password) {
        console.error('Credenciais não encontradas.');
        window.location.href = 'index.html'; // Redireciona para a página inicial se as credenciais não estiverem disponíveis
        return;
    }

    let categoriesData = [];
    let channelsData = [];

    const categoryContainer = document.getElementById('category-container');
    const loader = document.getElementById('loader');

    // Função para fazer requisições fetch com timeout
    async function fetchWithTimeout(resource, options = {}) {
        const { timeout = 10000 } = options;

        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);

        if (!response.ok) {
            throw new Error('Erro na requisição: ' + response.statusText);
        }
        return response.json();
    }

    // Função para carregar categorias
    async function loadCategories() {
        const cachedCategories = sessionStorage.getItem('categoriesData');
        if (cachedCategories) {
            categoriesData = JSON.parse(cachedCategories);
        } else {
            console.log('Buscando categorias...');
            const data = await fetchWithTimeout(`${url}/player_api.php?username=${login}&password=${password}&action=get_live_categories`);
            if (!data || !Array.isArray(data)) {
                throw new Error('Erro ao buscar categorias');
            }
            categoriesData = data;
            sessionStorage.setItem('categoriesData', JSON.stringify(categoriesData));
        }
    }

    // Função para carregar canais
    async function loadChannels() {
        const cachedChannels = sessionStorage.getItem('channelsData');
        if (cachedChannels) {
            channelsData = JSON.parse(cachedChannels);
        } else {
            console.log('Buscando canais...');
            const data = await fetchWithTimeout(`${url}/player_api.php?username=${login}&password=${password}&action=get_live_streams`);
            if (!data || !Array.isArray(data)) {
                throw new Error('Erro ao buscar canais');
            }
            channelsData = data;
            sessionStorage.setItem('channelsData', JSON.stringify(channelsData));
        }
    }

    // Inicialização da aplicação
    async function init() {
        try {
            await loadCategories();
            await loadChannels();

            categoriesData.forEach(category => {
                category.channels = channelsData.filter(channel => channel.category_id === category.category_id);
            });

            categoryContainer.innerHTML = '';

            categoriesData.forEach(category => {
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'category';

                const categoryTitle = document.createElement('h2');
                categoryTitle.textContent = category.category_name;
                categoryDiv.appendChild(categoryTitle);

                const channelList = document.createElement('div');
                channelList.className = 'channel-list';

                appendChannels(category.channels, channelList);

                categoryDiv.appendChild(channelList);
                categoryContainer.appendChild(categoryDiv);
            });

            loader.style.display = 'none';
            categoryContainer.style.display = 'block';
        } catch (error) {
            console.error('Erro ao carregar categorias e canais:', error);
            loader.textContent = 'Erro ao carregar categorias e canais. Tente novamente mais tarde.';
        }
    }

    // Função para adicionar canais ao DOM
    function appendChannels(channels, container) {
        channels.forEach(channel => {
            const card = document.createElement('div');
            card.className = 'channel-item';
            card.dataset.streamId = channel.stream_id;

            const channelIcon = document.createElement('img');
            channelIcon.src = channel.stream_icon || '';
            channelIcon.alt = channel.name;
            channelIcon.className = 'channel-icon';

            const channelName = document.createElement('p');
            channelName.className = 'channel-name';
            channelName.textContent = channel.name;

            card.appendChild(channelIcon);
            card.appendChild(channelName);
            container.appendChild(card);

            card.addEventListener('click', function() {
                playChannel(url, login, password, this.dataset.streamId);
            });
        });
    }

    // Função para iniciar a reprodução de um canal
    function playChannel(url, login, password, streamId) {
        const streamURL = `${url}/live/${login}/${password}/${streamId}.m3u8`;
        sessionStorage.setItem('lastPlayedStream', streamURL);
        window.location.href = `playerv.html?streamUrl=${encodeURIComponent(streamURL)}`;
    }

    // Iniciar a aplicação
    await init();
});
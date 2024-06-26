document.addEventListener("DOMContentLoaded", async function() {
    const url = sessionStorage.getItem('baseURL');
    const login = sessionStorage.getItem('baseLogin');
    const password = sessionStorage.getItem('basePassword');
    const loader = document.getElementById('loader');
    const categoryContainer = document.getElementById('category-container');

    if (!url || !login || !password) {
        window.location.href = 'index.html'; // Redireciona se as credenciais não forem encontradas
        return;
    }

    // Função para fazer requisições fetch com timeout
    function fetchWithTimeout(resource, options = {}) {
        const { timeout = 10000 } = options;

        return new Promise((resolve, reject) => {
            const controller = new AbortController();
            const id = setTimeout(() => {
                controller.abort();
                reject(new Error('Timeout da requisição.'));
            }, timeout);

            fetch(resource, {
                ...options,
                signal: controller.signal
            })
            .then(response => {
                clearTimeout(id);
                if (!response.ok) {
                    throw new Error('Erro na requisição: ' + response.statusText);
                }
                return response.text();
            })
            .then(resolve)
            .catch(error => {
                reject(error);
            });
        });
    }

    // Função para carregar categorias
    async function loadCategories() {
        const cachedCategories = sessionStorage.getItem('categoriesData');
        if (cachedCategories) {
            return JSON.parse(cachedCategories);
        } else {
            try {
                const response = await fetchWithTimeout(`${url}/player_api.php?username=${login}&password=${password}&action=get_live_categories`);
                const categoriesData = JSON.parse(response);
                sessionStorage.setItem('categoriesData', JSON.stringify(categoriesData));
                return categoriesData;
            } catch (error) {
                console.error('Erro ao buscar categorias:', error);
                throw error;
            }
        }
    }

    // Função para carregar canais de uma categoria específica
    async function loadChannels(categoryId) {
        const cachedChannels = sessionStorage.getItem(`channelsData_${categoryId}`);
        if (cachedChannels) {
            return JSON.parse(cachedChannels);
        } else {
            try {
                const response = await fetchWithTimeout(`${url}/player_api.php?username=${login}&password=${password}&action=get_live_streams&category_id=${categoryId}`);
                const channelsData = JSON.parse(response);
                sessionStorage.setItem(`channelsData_${categoryId}`, JSON.stringify(channelsData));
                return channelsData;
            } catch (error) {
                console.error('Erro ao buscar canais:', error);
                throw error;
            }
        }
    }

    // Função para adicionar categorias ao DOM
    function renderCategories(categories) {
        categoryContainer.innerHTML = '';

        categories.forEach(async category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category';

            const categoryTitle = document.createElement('h2');
            categoryTitle.textContent = category.category_name;
            categoryDiv.appendChild(categoryTitle);

            const channelList = document.createElement('div');
            channelList.className = 'channel-list';

            const channels = await loadChannels(category.category_id);
            appendChannels(channels, channelList);

            categoryDiv.appendChild(channelList);
            categoryContainer.appendChild(categoryDiv);
        });

        // Mostra container de categorias após o carregamento
        categoryContainer.style.display = 'block';
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
    async function init() {
        try {
            loader.style.display = 'block'; // Mostra o loader enquanto carrega

            const categories = await loadCategories();
            renderCategories(categories);

            // Esconder o loader após o carregamento
            loader.style.display = 'none';
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
            categoryContainer.innerHTML = 'Erro ao carregar categorias. Tente novamente mais tarde.';
        }
    }

    // Inicializar a aplicação
    init();
});
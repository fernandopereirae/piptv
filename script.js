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
    let channelsData = {};

    const categoryContainer = document.getElementById('category-container');
    const loader = document.getElementById('loader');

    // Função para fazer requisições XMLHttpRequest com timeout
    function fetchWithTimeout(url, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.timeout = timeout;
            xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        resolve(xhr.responseText);
                    } else {
                        reject(new Error('Erro na requisição: ' + xhr.statusText));
                    }
                }
            };
            xhr.ontimeout = function() {
                reject(new Error('Timeout de requisição'));
            };
            xhr.open('GET', url, true);
            xhr.send();
        });
    }

    // Função para carregar categorias
    async function loadCategories() {
        const cachedCategories = sessionStorage.getItem('categoriesData');
        if (cachedCategories) {
            categoriesData = JSON.parse(cachedCategories);
        } else {
            console.log('Buscando categorias...');
            const response = await fetchWithTimeout(`${url}/player_api.php?username=${login}&password=${password}&action=get_live_categories`);
            if (!response) {
                throw new Error('Erro ao buscar categorias');
            }
            categoriesData = JSON.parse(response);
            sessionStorage.setItem('categoriesData', JSON.stringify(categoriesData));
        }
    }

    // Função para carregar canais de uma categoria específica
    async function loadChannels(categoryId) {
        const cachedChannels = sessionStorage.getItem(`channelsData_${categoryId}`);
        if (cachedChannels) {
            channelsData[categoryId] = JSON.parse(cachedChannels);
        } else {
            console.log(`Buscando canais para a categoria ${categoryId}...`);
            const response = await fetchWithTimeout(`${url}/player_api.php?username=${login}&password=${password}&action=get_live_streams&category_id=${categoryId}`);
            if (!response) {
                throw new Error('Erro ao buscar canais');
            }
            channelsData[categoryId] = JSON.parse(response);
            sessionStorage.setItem(`channelsData_${categoryId}`, JSON.stringify(channelsData[categoryId]));
        }
    }

    // Inicialização da aplicação
    async function init() {
        try {
            await loadCategories();

            categoryContainer.innerHTML = '';

            for (const category of categoriesData) {
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'category';

                const categoryTitle = document.createElement('h2');
                categoryTitle.textContent = category.category_name;
                categoryDiv.appendChild(categoryTitle);

                const channelList = document.createElement('div');
                channelList.className = 'channel-list';

                await loadChannels(category.category_id);
                appendChannels(channelsData[category.category_id], channelList);

                categoryDiv.appendChild(channelList);
                categoryContainer.appendChild(categoryDiv);
            }

            loader.style.display = 'none';
            categoryContainer.style.display = 'block';
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
            loader.textContent = 'Erro ao carregar categorias. Tente novamente mais tarde.';
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

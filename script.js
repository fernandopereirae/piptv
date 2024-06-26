document.addEventListener("DOMContentLoaded", async function() {
    const loader = document.getElementById('loader');
    const categoryContainer = document.getElementById('category-container');
    const logTextarea = document.getElementById('log'); // Elemento para exibir log de mensagens

    let baseURL, baseLogin, basePassword;

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
    async function loadCategories(url, login, password) {
        try {
            const response = await fetchWithTimeout(`${url}/player_api.php?username=${login}&password=${password}&action=get_live_categories`);
            const categoriesData = JSON.parse(response);
            return categoriesData;
        } catch (error) {
            const errorMessage = 'Erro ao buscar categorias: ' + error.message;
            log(errorMessage);
            throw error;
        }
    }

    // Função para carregar canais de uma categoria específica
    async function loadChannels(url, login, password, categoryId) {
        try {
            const response = await fetchWithTimeout(`${url}/player_api.php?username=${login}&password=${password}&action=get_live_streams&category_id=${categoryId}`);
            const channelsData = JSON.parse(response);
            return channelsData;
        } catch (error) {
            const errorMessage = 'Erro ao buscar canais: ' + error.message;
            log(errorMessage);
            throw error;
        }
    }

    // Função para renderizar categorias e canais
    async function renderCategoriesAndChannels(url, login, password) {
        try {
            loader.style.display = 'block'; // Mostra o loader enquanto carrega

            const categories = await loadCategories(url, login, password);

            categoryContainer.innerHTML = ''; // Limpa o container de categorias antes de adicionar novas

            for (const category of categories) {
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'category';

                const categoryTitle = document.createElement('h2');
                categoryTitle.textContent = category.category_name;
                categoryDiv.appendChild(categoryTitle);

                const channelList = document.createElement('div');
                channelList.className = 'channel-list';

                const channels = await loadChannels(url, login, password, category.category_id);
                appendChannels(channels, channelList);

                categoryDiv.appendChild(channelList);
                categoryContainer.appendChild(categoryDiv);
            }

            // Mostra container de categorias após o carregamento
            categoryContainer.style.display = 'block';

            // Esconder o loader após o carregamento
            loader.style.display = 'none';
        } catch (error) {
            const errorMessage = 'Erro ao carregar categorias: ' + error.message;
            log(errorMessage);
            categoryContainer.innerHTML = 'Erro ao carregar categorias. Tente novamente mais tarde.';
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
                playChannel(baseURL, baseLogin, basePassword, this.dataset.streamId);
            });
        });
    }

    // Função para iniciar a reprodução de um canal
    function playChannel(url, login, password, streamId) {
        const streamURL = `${url}/live/${login}/${password}/${streamId}.m3u8`;
        sessionStorage.setItem('lastPlayedStream', streamURL);
        window.location.href = `playerv.html?streamUrl=${encodeURIComponent(streamURL)}`;
    }

    // Função para exibir mensagens de log
    function log(message) {
        const timestamp = new Date().toLocaleTimeString();
        logTextarea.textContent += `[${timestamp}] ${message}\n`;
        logTextarea.style.display = 'block'; // Garante que o log seja visível
        console.log(message); // Também exibe no console para fins de depuração
    }

    // Iniciar a aplicação ao carregar o DOM
    const storedURL = sessionStorage.getItem('baseURL');
    const storedLogin = sessionStorage.getItem('baseLogin');
    const storedPassword = sessionStorage.getItem('basePassword');

    if (storedURL && storedLogin && storedPassword) {
        baseURL = storedURL;
        baseLogin = storedLogin;
        basePassword = storedPassword;
        renderCategoriesAndChannels(baseURL, baseLogin, basePassword);
    } else {
        window.location.href = 'index.html'; // Redireciona se as credenciais não forem encontradas
    }
});
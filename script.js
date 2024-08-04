document.addEventListener("DOMContentLoaded", async function() {
    const url = sessionStorage.getItem('baseURL');
    const login = sessionStorage.getItem('baseLogin');
    const password = sessionStorage.getItem('basePassword');

    if (!url || !login || !password) {
        console.error('Credenciais não encontradas.');
        window.location.href = 'index.html';
        return;
    }

    const categoryContainer = document.getElementById('category-container');
    const loadingIndicator = document.getElementById('loading-indicator');

    async function fetchWithTimeout(resource, options = { timeout: 10000 }) {
        const { timeout } = options;
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        const response = await fetch(resource, { ...options, signal: controller.signal });
        clearTimeout(id);

        if (!response.ok) throw new Error('Erro na requisição: ' + response.statusText);
        return response.json();
    }

    function showLoading() {
        loadingIndicator.style.backgroundColor = 'green';
        loadingIndicator.style.display = 'block';
        console.log('Indicador de carregamento exibido.');
    }

    function hideLoading() {
        loadingIndicator.style.display = 'none';
        console.log('Indicador de carregamento ocultado.');
    }

    function showError() {
        loadingIndicator.style.backgroundColor = 'red';
        loadingIndicator.style.display = 'block';
        console.log('Erro ao carregar dados.');
    }

    function createChannelCard(channel) {
        const card = document.createElement('div');
        card.className = 'channel-item';
        card.dataset.streamId = channel.stream_id;

        card.innerHTML = `
            <img src="${channel.stream_icon || ''}" alt="${channel.name}" class="channel-icon">
            <p class="channel-name">${channel.name}</p>
        `;

        card.addEventListener('click', () => {
            const streamURL = `${url}/live/${login}/${password}/${channel.stream_id}.m3u8`;
            sessionStorage.setItem('lastPlayedStream', streamURL);
            window.location.href = `playerv.html?streamUrl=${encodeURIComponent(streamURL)}`;
        });

        return card;
    }

    async function init() {
        showLoading();
        console.log('Iniciando o carregamento dos dados...');

        try {
            const categoriesResponse = await fetchWithTimeout(`${url}/player_api.php?username=${login}&password=${password}&action=get_live_categories`);
            console.log('Categorias carregadas com sucesso.');
            const channelsResponse = await fetchWithTimeout(`${url}/player_api.php?username=${login}&password=${password}&action=get_live_streams`);
            console.log('Canais carregados com sucesso.');

            const categoriesData = await categoriesResponse;
            const channelsData = await channelsResponse;

            categoriesData.forEach(category => {
                category.channels = channelsData.filter(channel => channel.category_id === category.category_id);
            });

            categoryContainer.innerHTML = '';

            categoriesData.forEach(category => {
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'category';
                categoryDiv.innerHTML = `<h2>${category.category_name}</h2>`;

                const channelList = document.createElement('div');
                channelList.className = 'channel-list';

                category.channels.forEach(channel => {
                    channelList.appendChild(createChannelCard(channel));
                });

                categoryDiv.appendChild(channelList);
                categoryContainer.appendChild(categoryDiv);
            });

            categoryContainer.style.display = 'block';
            hideLoading();
            console.log('Categorias e canais exibidos com sucesso.');
        } catch (error) {
            showError();
            console.error('Erro ao carregar categorias e canais:', error);
        }
    }

    await init();
});
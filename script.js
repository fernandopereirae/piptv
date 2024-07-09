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
    const loader = document.getElementById('loader');

    async function fetchWithTimeout(resource, options = { timeout: 10000 }) {
        const { timeout } = options;
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        const response = await fetch(resource, { ...options, signal: controller.signal });
        clearTimeout(id);

        if (!response.ok) throw new Error('Erro na requisição: ' + response.statusText);
        return response.json();
    }

    async function loadData(type) {
        const cachedData = sessionStorage.getItem(`${type}Data`);
        if (cachedData) return JSON.parse(cachedData);

        console.log(`Buscando ${type}...`);
        const data = await fetchWithTimeout(`${url}/player_api.php?username=${login}&password=${password}&action=get_${type}`);
        if (!data || !Array.isArray(data)) throw new Error(`Erro ao buscar ${type}`);
        
        sessionStorage.setItem(`${type}Data`, JSON.stringify(data));
        return data;
    }

    function appendChannels(channels, container) {
        channels.forEach(channel => {
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

            container.appendChild(card);
        });
    }

    async function init() {
        try {
            const categoriesData = await loadData('live_categories');
            const channelsData = await loadData('live_streams');

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

    await init();
});
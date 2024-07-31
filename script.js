const baseURL = 'http://pfsv.io'; // Substitua 'YOUR_BASE_URL' pela URL desejada
const baseLogin = 'elianolista'; // Substitua 'YOUR_LOGIN' pelo login desejado
const basePassword = 'sualista'; // Substitua 'YOUR_PASSWORD' pela senha desejada

function fetchWithTimeout(url, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        let timer;

        xhr.open('GET', url, true);

        xhr.onload = () => {
            clearTimeout(timer);
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    resolve(JSON.parse(xhr.responseText));
                } catch (e) {
                    reject('Erro ao processar a resposta.');
                }
            } else {
                reject('Erro na requisição: ' + xhr.statusText);
            }
        };

        xhr.onerror = () => {
            clearTimeout(timer);
            reject('Erro na requisição.');
        };

        timer = setTimeout(() => {
            xhr.abort();
            reject('A requisição foi abortada por timeout.');
        }, timeout);

        xhr.send();
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
    .then(results => {
        const channelsData = results[0];
        const categoriesData = results[1];

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
const baseURL = 'http://pfsv.io'; // Substitua 'YOUR_BASE_URL' pela URL desejada
const baseLogin = 'elianolista'; // Substitua 'YOUR_LOGIN' pelo login desejado
const basePassword = 'sualista'; // Substitua 'YOUR_PASSWORD' pela senha desejada
const CATEGORIES_PER_PAGE = 1; // Número de categorias por página

let currentPage = 0;
let categoriesData = [];

function fetchWithTimeout(url, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        let timer;

        console.log(`Fetching data from ${url}`); // Log da URL sendo requisitada

        xhr.open('GET', url, true);

        xhr.onload = () => {
            clearTimeout(timer);
            console.log(`Response from ${url}:`, xhr.responseText); // Log da resposta

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

function displayBatch(startIndex, endIndex) {
    const categoryContainer = document.getElementById('category-container');

    if (!categoryContainer) {
        console.error('Elemento "category-container" não encontrado no DOM.');
        return;
    }

    console.log('Displaying batch from', startIndex, 'to', endIndex); // Log dos índices de exibição

    // Limpa o container antes de adicionar novas categorias
    categoryContainer.innerHTML = '';

    categoriesData.slice(startIndex, endIndex).forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category';
        categoryDiv.innerHTML = `<h2>${category.category_name}</h2>`;
        
        const channelList = document.createElement('div');
        channelList.className = 'channel-list';

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
                // Manter a página atual e passar a URL do stream
                window.location.href = `player.html?streamURL=${encodeURIComponent(streamURL)}&page=${currentPage}`;
            });

            channelList.appendChild(card);
        });

        categoryDiv.appendChild(channelList);
        categoryContainer.appendChild(categoryDiv);
    });

    updateNavigationButtons();
}

function updateNavigationButtons() {
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');

    console.log('Updating navigation buttons:', {
        prevButtonDisabled: currentPage === 0,
        nextButtonDisabled: (currentPage + 1) * CATEGORIES_PER_PAGE >= categoriesData.length
    }); // Log do estado dos botões

    if (prevButton) {
        prevButton.disabled = currentPage === 0;
    }
    if (nextButton) {
        nextButton.disabled = (currentPage + 1) * CATEGORIES_PER_PAGE >= categoriesData.length;
    }
}

function fetchChannels() {
    Promise.all([
        fetchWithTimeout(`${baseURL}/player_api.php?username=${baseLogin}&password=${basePassword}&action=get_live_streams`),
        fetchWithTimeout(`${baseURL}/player_api.php?username=${baseLogin}&password=${basePassword}&action=get_live_categories`)
    ])
    .then(results => {
        const channelsData = results[0];
        const categoriesDataFetched = results[1];

        console.log('Channels data:', channelsData); // Log dos dados de canais
        console.log('Categories data:', categoriesDataFetched); // Log dos dados de categorias

        if (!Array.isArray(channelsData) || !Array.isArray(categoriesDataFetched)) {
            throw new Error('Formato de dados inesperado.');
        }

        // Associa canais a categorias
        categoriesDataFetched.forEach(category => {
            category.channels = channelsData.filter(channel => channel.category_id === category.category_id);
        });

        categoriesData = categoriesDataFetched;

        // Exibe a primeira página
        displayBatch(0, CATEGORIES_PER_PAGE);
    })
    .catch(error => {
        console.error('Erro ao buscar dados:', error);
    });
}

document.getElementById('prev-button')?.addEventListener('click', () => {
    if (currentPage > 0) {
        currentPage--;
        displayBatch(currentPage * CATEGORIES_PER_PAGE, (currentPage + 1) * CATEGORIES_PER_PAGE);
    }
});

document.getElementById('next-button')?.addEventListener('click', () => {
    if ((currentPage + 1) * CATEGORIES_PER_PAGE < categoriesData.length) {
        currentPage++;
        displayBatch(currentPage * CATEGORIES_PER_PAGE, (currentPage + 1) * CATEGORIES_PER_PAGE);
    }
});

// Chama a função ao carregar a página ou em outro ponto adequado
document.addEventListener('DOMContentLoaded', fetchChannels);
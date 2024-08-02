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

function displayBatch(startIndex, endIndex) {
    const categoryContainer = document.getElementById('category-container');

    if (!categoryContainer) {
        console.error('Elemento "category-container" não encontrado no DOM.');
        return;
    }

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
                // Salva a página atual no localStorage antes de abrir o player
                localStorage.setItem('previousPage', window.location.href);
                window.open(`player.html?streamURL=${encodeURIComponent(streamURL)}`, '_blank');
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

    prevButton.disabled = currentPage === 0;
    nextButton.disabled = (currentPage + 1) * CATEGORIES_PER_PAGE >= categoriesData.length;
}

function fetchChannels() {
    Promise.all([
        fetchWithTimeout(`${baseURL}/player_api.php?username=${baseLogin}&password=${basePassword}&action=get_live_streams`),
        fetchWithTimeout(`${baseURL}/player_api.php?username=${baseLogin}&password=${basePassword}&action=get_live_categories`)
    ])
    .then(results => {
        const channelsData = results[0];
        const categoriesDataFetched = results[1];

        if (!Array.isArray(channelsData) || !Array.isArray(categoriesDataFetched)) {
            throw new Error('Formato de dados inesperado.');
        }

        // Associa canais a categorias
        categoriesDataFetched.forEach(category => {
            category.channels = channelsData.filter(channel => channel.category_id === category.category_id);
        });

        categoriesData = categoriesDataFetched;

        // Restaura a página salva no localStorage ou exibe a primeira página
        const previousPage = localStorage.getItem('previousPage');
        if (previousPage) {
            const url = new URL(previousPage);
            const page = url.searchParams.get('page');
            if (page) {
                currentPage = parseInt(page, 10);
            }
        }

        displayBatch(currentPage * CATEGORIES_PER_PAGE, (currentPage + 1) * CATEGORIES_PER_PAGE);
    })
    .catch(error => {
        console.error('Erro ao buscar dados:', error);
    });
}

document.getElementById('prev-button').addEventListener('click', () => {
    if (currentPage > 0) {
        currentPage--;
        displayBatch(currentPage * CATEGORIES_PER_PAGE, (currentPage + 1) * CATEGORIES_PER_PAGE);
        localStorage.setItem('previousPage', `${window.location.pathname}?page=${currentPage}`);
    }
});

document.getElementById('next-button').addEventListener('click', () => {
    if ((currentPage + 1) * CATEGORIES_PER_PAGE < categoriesData.length) {
        currentPage++;
        displayBatch(currentPage * CATEGORIES_PER_PAGE, (currentPage + 1) * CATEGORIES_PER_PAGE);
        localStorage.setItem('previousPage', `${window.location.pathname}?page=${currentPage}`);
    }
});

// Chama a função ao carregar a página ou em outro ponto adequado
document.addEventListener('DOMContentLoaded', fetchChannels);
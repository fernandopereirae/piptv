document.addEventListener("DOMContentLoaded", async function() {
    const url = sessionStorage.getItem('baseURL');
    const login = sessionStorage.getItem('baseLogin');
    const password = sessionStorage.getItem('basePassword');
    const logTextarea = document.getElementById('logTextarea');

    if (!url || !login || !password) {
        log('Credenciais não encontradas.');
        window.location.href = 'index.html'; // Redireciona para a página inicial se as credenciais não estiverem disponíveis
        return;
    }

    const loader = document.getElementById('loader');
    loader.style.display = 'none'; // Oculta o loader inicial

    // Função para fazer requisições fetch com timeout
    async function fetchWithTimeout(resource, options = {}) {
        const { timeout = 10000 } = options;

        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        try {
            const response = await fetch(resource, {
                ...options,
                signal: controller.signal
            });

            if (!response.ok) {
                throw new Error('Erro na requisição: ' + response.statusText);
            }
            
            return await response.text();
        } catch (error) {
            log(`Erro na requisição: ${error.message}`);
            throw error;
        } finally {
            clearTimeout(id);
        }
    }

    // Inicialização da aplicação
    async function init() {
        try {
            // Simula uma requisição inicial para verificar a conexão básica
            await fetchWithTimeout(`${url}/player_api.php?username=${login}&password=${password}&action=get_live_categories`);

            // Inicialização bem-sucedida
            log('Aplicação inicializada com sucesso.');

            // Exemplo: Carregamento de categorias (simulado)
            // const categories = await fetchWithTimeout(`${url}/player_api.php?username=${login}&password=${password}&action=get_live_categories`);
            // console.log('Categorias:', categories);
        } catch (error) {
            console.error('Erro ao inicializar a aplicação:', error);
            log('Erro ao inicializar a aplicação. Verifique a conexão e tente novamente.');
        } finally {
            loader.style.display = 'none';
        }
    }

    // Função para log de mensagens
    function log(message) {
        const timestamp = new Date().toLocaleTimeString();
        logTextarea.value += `[${timestamp}] ${message}\n`;
        logTextarea.scrollTop = logTextarea.scrollHeight; // Rolagem automática para o final
    }

    // Iniciar a aplicação
    await init();
});
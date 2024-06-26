document.addEventListener("DOMContentLoaded", function() {
    // Verifica se as credenciais já estão armazenadas no sessionStorage
    const storedURL = sessionStorage.getItem('baseURL');
    const storedLogin = sessionStorage.getItem('baseLogin');
    const storedPassword = sessionStorage.getItem('basePassword');

    if (storedURL && storedLogin && storedPassword) {
        // Redireciona diretamente para a página de canais se as credenciais estiverem presentes
        window.location.href = 'lcanais.html';
        return; // Encerra a execução da função para evitar a execução desnecessária do código abaixo
    }

    // Adiciona um listener para o formulário de login
    document.getElementById('loginForm').addEventListener('submit', function(event) {
        event.preventDefault();
        login();
    });

    function login() {
        const url = document.getElementById('urlInput').value;
        const login = document.getElementById('loginInput').value;
        const password = document.getElementById('passwordInput').value;

        // Verifica se algum campo está vazio antes de armazenar as credenciais
        if (!url || !login || !password) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        // Armazena as credenciais no sessionStorage
        sessionStorage.setItem('baseURL', url);
        sessionStorage.setItem('baseLogin', login);
        sessionStorage.setItem('basePassword', password);

        // Redireciona para outra página após o login
        window.location.href = 'lcanais.html';
    }
});
const baseURL = 'http://pfsv.io'; // Substitua pela URL da sua API
const baseLogin = 'elianolista'; // Substitua pelo seu nome de usuário
const basePassword = 'sualista'; // Substitua pela sua senha

function getChannelIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('channelId');
}

function loadVideo() {
    const channelId = getChannelIdFromURL();
    const player = document.getElementById('iptvPlayer');

    if (channelId) {
        const streamURL = `${baseURL}/live/${baseLogin}/${basePassword}/${channelId}.m3u8`;
        player.src = streamURL;
    } else {
        console.error('ID do canal não encontrado na URL.');
    }
}

function setupBackButton() {
    const backButton = document.getElementById('backButton');
    backButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadVideo();
    setupBackButton();
});
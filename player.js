document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const streamURL = urlParams.get('streamURL');

    if (streamURL) {
        const player = document.getElementById('iptvPlayer');
        player.src = streamURL;
    } else {
        console.error('Stream URL não encontrada.');
    }
});
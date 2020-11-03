document.addEventListener('DOMContentLoaded', () => {
    const video = document.querySelector('.video-container video');
    video.muted = true;
    video.play();

    document.querySelector('.icon1 input').focus();
});

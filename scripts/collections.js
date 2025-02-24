const photo_viewer = document.querySelector(".photo_viewer");
const photo_holder_collections = document.querySelector(".photo_holder_collections");


function openImage(img) {
    const imgSrc = img.src;
    photo_holder_collections.style.backgroundImage = `url(${imgSrc})`;
    photo_viewer.style.display = "block";
}

function close_screen() {
    photo_viewer.style.display = "none";
}

var backButton = document.getElementById('back_btn');
var forwardButton = document.getElementById('forward_btn');
var images = document.getElementsByClassName('collection_image');
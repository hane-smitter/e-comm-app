const productInfoBox = document.querySelectorAll('.product-shoe-info');
const productInfoBoxArray = Array.from(productInfoBox);

window.onload = () => {
    productInfoBoxArray.forEach((item) => {
        item.addEventListener('click', function(event) {
            const itemImg = this.querySelector('.product-shoe-info .men-thumb-item img');
            const itemImgSrc = itemImg.src;
            const itemImgId = itemImgSrc.split('/')[itemImgSrc.split('/').length - 1];
            if(event.target.classList.contains('cart-add-btn')) return;
            location.href = `/product/${itemImgId}`;
        });
    });
    classConditon();
}
window.onresize = () => {
    classConditon();
}

function classConditon() {
    if(window.innerWidth > 768){
        productInfoBoxArray.forEach((item) => {
            item.classList.add('hover');
        });

    } else {
        productInfoBoxArray.forEach((item) => {
            item.classList.remove('hover');
        });
    }
}
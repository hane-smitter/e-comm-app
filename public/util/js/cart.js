console.log('cartjs is running');
fetchCartItems();
//global vars
let cartNumberOfChildren;

countCartItems();
updateCartTotal();

//view items in the cart
cartIcon.addEventListener('click', function() {
    cartContainer.classList.toggle('hide');
});

//Add to cart buttons
for(let i = 0; i < addToCartBtns.length; i++) {
    
    const parent = addToCartBtns[i].parentElement;
    let itemName = parent.querySelector('.item-name'),
        itemImg = parent.parentElement.querySelector('.item-image'),
        itemPrice = parent.querySelector('.item-price');

  

    addToCartBtns[i].addEventListener('click', function(e) {
        let itemExists;
        [...(cartItemsContainer.getElementsByClassName('item'))].forEach((item) => {
            if(item.querySelector('.title').textContent.toLowerCase() == itemName.textContent.toLowerCase()) {
                return itemExists = true;
            }
        });

        if(itemExists) {
            alert('item already in cart');
            return;
        }

        let item = document.createElement('div');
        item.classList.add('item');
        let html = `<div class="item">
            <button class="btn btn-danger delete-btn" data-item-id="${e.currentTarget.dataset.identity}">
                <i class="fa fa-remove"></i>
            </button>

            <div class="image">
                <img src="${itemImg.src}" alt="">
            </div>
            <span class="title">${itemName.textContent}</span>

            <div class="quantity">
                <button class="btn btn-minus" data-item-id="${e.currentTarget.dataset.identity}">
                    <i class="fa fa-minus"></i>
                </button>
                <input type="text" value="1" readonly class="quantity-input">
                <button class="btn btn-plus" data-item-id="${e.currentTarget.dataset.identity}">
                    <i class="fa fa-plus"></i>
                </button>
                
            </div>

            <div class="item-price">${itemPrice.textContent}</div>
            </div>`;
        item.innerHTML = html;
        cartItemsContainer.insertAdjacentHTML('afterbegin', html);
        //push changes to server side
        const prod_id = e.currentTarget.dataset.identity;
        createCartItem(prod_id);
    });
}


/* function definitions */

//get number of items in cart
function countCartItems() {
    cartNumberOfChildren = cartItemsContainer.childElementCount;
    cartIcon.setAttribute('data-num', cartNumberOfChildren);

}
//wiring up cart total
function updateCartTotal() {
    let totalCartPrice = 0;
    if(cartProductItems.length < 1) {
        return cartTotalPrice.textContent = totalCartPrice;
    }
    for(let i = 0; i < cartProductItems.length; i++) {
        let txtPrice = cartProductItems[i].getElementsByClassName('item-price')[0].textContent;
        
        let priceArr = txtPrice.split('.');
        let price = parseFloat(priceArr[1] + '.' + priceArr[priceArr.length - 1]);

        let quantity = cartProductItems[i].querySelector('.quantity input').value;
        quantity = parseInt(quantity);

        price *= quantity;

        totalCartPrice += price;
        cartTotalPrice.textContent = totalCartPrice.toFixed(2);
    }
}

//wiring up the quantity cart functionality
for(i = 0; i < cartQuantityBtnPlus.length; i++) {
    cartQuantityBtnPlus[i].addEventListener('click', quantityPlus);
}
for(i = 0; i < cartQuantityBtnMinus.length; i++) {
    cartQuantityBtnMinus[i].addEventListener('click', quantityMinus);
}
//wiring up delete cart item button
for(let i = 0; i < removeCartItemBtns.length; i++) {
    removeCartItemBtns[i].addEventListener('click', removeCartItem);
}

//add quantity correctly
function  quantityPlus() {
    let cartQuantityInput = event.currentTarget.previousElementSibling;
    let productId = event.currentTarget.dataset.itemId;
    let current = parseInt(cartQuantityInput.value);
    cartQuantityInput.value = ++current;
    updateCartTotal();
    //server side
    updateCartItem(current, productId);
}
//reduce quantity correctly
function  quantityMinus() {
    cartQuantityInput = event.currentTarget.nextElementSibling;
    let productId = event.currentTarget.dataset.itemId;
    let current = parseInt(cartQuantityInput.value);
    current = --current;
    if(current < 1) {
        return cartQuantityInput.value = 1;
    }
    cartQuantityInput.value = current;
    updateCartTotal();
    //server side
    updateCartItem(current, productId);
}
//remove item from cart correctly
function removeCartItem() {
    let productId = event.currentTarget.dataset.itemId;
    event.currentTarget.parentElement.remove();
    unlinkCartItem(productId);
}
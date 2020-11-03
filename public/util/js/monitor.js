console.log('monitorjs is running!');
//vars being used here and cartjs
const cartIcon = document.getElementsByClassName('cart')[0];
const cartContainer = document.getElementsByClassName('cart-container')[0];//aside tag
const cartItemsContainer = cartContainer.getElementsByClassName('cart-items')[0];//div tag
const addToCartBtns = document.getElementsByClassName('cart-add-btn');
const cartProductItems = cartItemsContainer.getElementsByClassName('item');
const cartTotalPrice = cartContainer.getElementsByClassName('cart-total-price')[0];
const cartQuantityBtnPlus = cartItemsContainer.querySelectorAll('.quantity .btn-plus');
const cartQuantityBtnMinus = cartItemsContainer.querySelectorAll('.quantity .btn-minus');
const removeCartItemBtns = cartItemsContainer.querySelectorAll('.delete-btn');

//Mutation Observer to observe changes in cart and update corectly
let targetNode = cartItemsContainer;
let config = { childList: true };
const callback = (MutationsList) => {
    for(let i = 0; i < MutationsList.length; i++) {
        console.log(MutationsList[i].addedNodes);
        if(MutationsList[i].addedNodes.length > 0) {
            console.log('MutationsList[i].addedNodes.length');
            console.log(MutationsList[i].addedNodes);
            const addedEl = MutationsList[i].addedNodes;
            console.log(addedEl);

            for(let index = 0; index < addedEl.length; index++) {
                let newNodeEntry = MutationsList[i].addedNodes[index];
                console.log(newNodeEntry);
                if(!newNodeEntry) {
                    newNodeEntry = MutationsList[i].addedNodes[index];
                }
                newNodeEntry
                //add quantity btn
                .querySelector('.quantity .btn-plus')
                .addEventListener('click', quantityPlus);
                //reduce quantity btn
                newNodeEntry
                .querySelector('.quantity .btn-minus')
                .addEventListener('click', quantityMinus);
                newNodeEntry
                .querySelector('.cart-items .delete-btn')
                .addEventListener('click', removeCartItem);

            }
        }
    }
    countCartItems();
    updateCartTotal();
}
const Observer = new MutationObserver(callback);
Observer.observe(targetNode, config);

/* function definitions */
const fetchCartItems = () => {
    console.log('hey called in cartjs, running from monitorjs');
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        if(this.status >= 200 && this.status < 300) {
            console.log(this.response);
            //after getting data, display to page

            let cartProducts = this.response;

            cartProducts.forEach(cartProduct => {
                let item = document.createElement('div');
                item.classList.add('item');
                let html = `<button class="btn btn-danger delete-btn" data-item-id="${cartProduct._id}">
                        <i class="fa fa-remove"></i>
                    </button>
        
                    <div class="image">
                        <img src="/za/product/image/${cartProduct._id}" alt="">
                    </div>
                    <span class="title">${cartProduct.name}</span>
        
                    <div class="quantity">
                        <button class="btn btn-minus" data-item-id="${cartProduct._id}">
                            <i class="fa fa-minus"></i>
                        </button>
                        <input type="text" value="${cartProduct.quantity}" readonly class="quantity-input">
                        <button class="btn btn-plus " data-item-id="${cartProduct._id}">
                            <i class="fa fa-plus"></i>
                        </button>
                        
                    </div>
        
                    <div class="item-price">KES.${cartProduct.price}</div>`; 

                    item.innerHTML = html;
                    cartItemsContainer.insertAdjacentElement('beforeend', item);
            });
            countCartItems();
            updateCartTotal();
        }
    }
    xhr.responseType = 'json';
    xhr.open('GET','/products/cart');
    xhr.send();
}
const createCartItem = (productId, quantity = 1) => {
    var xhr = new XMLHttpRequest();
    var params = `productId=${productId}&quantity=${quantity}`;
    xhr.onload = function() {
        if(this.status >= 200 && this.status < 300) {
            console.log(this.response);
            console.log(this.status);
        }
    }
    xhr.open('POST', '/products/cart')
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(params);
}
const updateCartItem = (quantity, productId) => {
    var xhr = new XMLHttpRequest();
    var params = `_method=patch&quantity=${quantity}&productId=${productId}`;
    xhr.onload = function() {
        if(this.status >= 200 && this.status < 300) {
            console.log(this.response);
        }
    }
    xhr.open('POST', '/products/cart');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(params);
}
const unlinkCartItem = (productId) => {
    var xhr = new XMLHttpRequest();
    var params = `_method=delete&productId=${productId}`;
    xhr.onload = function() {
        if(this.status >= 200 && this.status < 300) {
            console.log(this.statusText);
        }
    }
    xhr.open('POST', '/products/cart');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(params);
}
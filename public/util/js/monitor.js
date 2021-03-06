//vars being used here and cartjs
const cartIcon = document.getElementsByClassName('cart')[0];
const cartContainerBox = document.getElementsByClassName('cart-box')[0];
const cartBoxCloseIcon = document.getElementsByClassName('cart-close')[0];
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
            const addedEl = MutationsList[i].addedNodes;

            for(let index = 0; index < addedEl.length; index++) {
                let newNodeEntry = MutationsList[i].addedNodes[index];
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
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        if(this.status >= 200 && this.status < 300) {
            //after getting data, display to page

            let cartProducts = this.response;

            cartProducts.forEach(cartProduct => {
                let item = document.createElement('div');
                item.classList.add('item');
                let html = ` <div class="image">
                        <img src="/util/product/image/${cartProduct._id}" alt="shoe" onclick="window.location.href = '/product/${cartProduct._id}'">
                    </div>

                    <div class="group">
                        <span class="title">${cartProduct.name}</span>

                        <div class="item-price">KES. ${parseFloat((cartProduct.price).toFixed(2)).toLocaleString('en-us')}</div>
                    </div>

        
                    <div class="quantity">
                        <button class="btn btn-minus" data-item-id="${cartProduct._id}">
                            <i class="fa fa-minus"></i>
                        </button>
                        <input type="text" value="${cartProduct.quantity}" readonly class="quantity-input">
                        <button class="btn btn-plus " data-item-id="${cartProduct._id}">
                            <i class="fa fa-plus"></i>
                        </button>
                        
                    </div>
        
                    <button class="btn btn-outline-danger delete-btn" data-item-id="${cartProduct._id}">
                        <i class="fa fa-remove"></i>
                        remove
                    </button> `; 

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
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        var params = `productId=${productId}&quantity=${quantity}`;
        xhr.onload = function() {
            if(this.status >= 200 && this.status < 300) {
                console.log(this.response);
                console.log(this.status);
                resolve ({done: true, msg: this.statusText});
            } else {
                reject({done: false, msg: this.statusText});
            }
        }
        xhr.onerror = () => {
            reject({done: false, msg: 'Network disconnected'});
        }
        xhr.open('POST', '/products/cart')
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(params);

    });
}
const updateCartItem = (quantity, productId) => {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        var params = `_method=patch&quantity=${quantity}&productId=${productId}`;
        xhr.onload = function() {
            if(this.status >= 200 && this.status < 300) {
                console.log(this.response);
                resolve({done: true, msg: this.statusText});
            }
            reject({done: false, msg: this.statusText});
        }
        xhr.onerror = function () {
            reject({done: false, msg: 'check your network connection!'});
        }
        xhr.open('POST', '/products/cart');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(params);
    });
}
const unlinkCartItem = (productId) => {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        var params = `_method=delete&productId=${productId}`;
        xhr.onload = function() {
            if(this.status >= 200 && this.status < 300) {
                resolve({done: true, msg: this.statusText});
            }
            reject({done: false, msg: this.statusText});
        }
        xhr.onerror = function() {
            reject({done: false, msg: 'check your network connection!'});
        }
        xhr.open('POST', '/products/cart');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(params);
    });
}
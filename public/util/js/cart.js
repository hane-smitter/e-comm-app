console.log('cartjs is running');
fetchCartItems();
//global vars
let cartNumberOfChildren;

countCartItems();
updateCartTotal();

//view items in the cart
cartIcon.addEventListener('click', function() {
    cartContainerBox.classList.toggle('hide');
});
//close opened cart
cartBoxCloseIcon.addEventListener('click', function() {
    cartContainerBox.classList.toggle('hide');
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
            alert('Item already in cart');
            return;
        }
        //create cart item on the server side
        const prod_id = e.currentTarget.dataset.identity;
        this.disabled = true;
        createCartItem(prod_id)
            .then(({done, msg} = data) => {
                console.log('from then');

                //create item on the client's browser
                let item = document.createElement('div');
                item.classList.add('item');
                let html = `<div class="item">
                    
                    <div class="image">
                        <img src="${itemImg.src}" alt="shoe" onclick="window.location.href = '/product/${this.dataset.identity}'">
                    </div>
                    
                    <div class="group">
                        <span class="title">${itemName.textContent}</span>

                        <div class="item-price">${itemPrice.textContent}</div>
                    </div>


                    <div class="quantity">
                        <button class="btn btn-minus" data-item-id="${this.dataset.identity}">
                            <i class="fa fa-minus"></i>
                        </button>
                        <input type="text" value="1" readonly class="quantity-input">
                        <button class="btn btn-plus" data-item-id="${this.dataset.identity}">
                            <i class="fa fa-plus"></i>
                        </button>
                        
                    </div>

                    <button class="btn btn-outline-danger delete-btn" data-item-id="${this.dataset.identity}">
                        <i class="fa fa-remove"></i>
                        remove
                    </button>
                </div>`;
                item.innerHTML = html;
                cartItemsContainer.insertAdjacentHTML('afterbegin', html); 

                //adding more information to msg
                msg += '! Added to cart.'
                cartActivityFeed(done, msg);
                this.disabled = false;
            }, ({done, msg} = err) => {
                cartActivityFeed(done, msg);
                this.disabled = false;
            });
    });
}


/* FUNCTION DEFINITIONS */
//cart activity feeds
function cartActivityFeed(done, msg) {
    if(document.body.contains(document.querySelector('.cart-action-feeds'))) {
        document.querySelector('.cart-action-feeds').remove();
        clearTimeout(window.timeOutId);
    }
    let paragraph = document.createElement('p');
    paragraph.textContent = msg;
    if(!done){
        paragraph.classList.add('cart-action-feeds', 'text-center', 'bg-warning');
    } else {
        paragraph.classList.add('cart-action-feeds', 'text-center', 'text-light', 'bg-success');
    }
    document.body.appendChild(paragraph);

    const timeOutId = setTimeout(() => {
        document.querySelector('.cart-action-feeds').remove();
    }, 3000);
    window.timeOutId = timeOutId;
}

//get number of items in cart
function countCartItems() {
    cartNumberOfChildren = cartItemsContainer.childElementCount;
    cartIcon.setAttribute('data-num', cartNumberOfChildren);
    if(cartNumberOfChildren < 1) {
        cartItemsContainer.classList.add('empty');
        document.querySelector('.purchase-btn').href = '#';
        document.querySelector('.purchase-btn').classList.add('disabled');
    } else {
        cartItemsContainer.classList.remove('empty');
        document.querySelector('.purchase-btn').href = '/checkout';
        document.querySelector('.purchase-btn').classList.remove('disabled');
    }
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
        let price = parseFloat((priceArr[1] + '.' + priceArr[priceArr.length - 1]).replace(/,/g, ''));

        let quantity = cartProductItems[i].querySelector('.quantity input').value;
        quantity = parseInt(quantity);

        price *= quantity;

        totalCartPrice += price;
        cartTotalPrice.textContent = parseFloat(totalCartPrice.toFixed(2)).toLocaleString('en-us');
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
function  quantityPlus(event) {
    this.disabled = true;
    let cartQuantityInput = event.currentTarget.previousElementSibling;
    let productId = event.currentTarget.dataset.itemId;
    let current = parseInt(cartQuantityInput.value);
    current = ++current;

    updateCartItem(current, productId)
        .then(() => {
            cartQuantityInput.value = current;
            updateCartTotal();
            this.disabled = false;
        }, ({done, msg} = err) => {
            cartActivityFeed(done, msg);
            this.disabled = false;
        }); 
}
//reduce quantity correctly
function  quantityMinus(event) {
    this.disabled = true;
    cartQuantityInput = event.currentTarget.nextElementSibling;
    let productId = event.currentTarget.dataset.itemId;
    let current = parseInt(cartQuantityInput.value);
    //decrement by 1
    current = --current;
    if(current < 1) {
        current = 1;
    }
    updateCartItem(current, productId)
        .then(() => {
            cartQuantityInput.value = current;
            updateCartTotal();
            this.disabled = false;
        })
        .catch(({done, msg} = err) => {
            cartActivityFeed(done, msg);
            this.disabled = false;
        });
}
//remove item from cart correctly
function removeCartItem() {
    let productId = this.dataset.itemId;
    unlinkCartItem(productId)
        .then(({done, msg} = data) => {
            this.parentElement.remove();
            msg += '! Item removed.';
            cartActivityFeed(done, msg);
        }, ({done, msg} = err) => {
            cartActivityFeed(done, msg);
        });
}

// Target div DOM products list container
let product_container = document.querySelector('#cart__items')

// Target Button 
let orderBtn = document.querySelector('#order')

// Target DOM total quantity and price div
let totalQuantity = document.querySelector('#totalQuantity')
let totalPrice = document.querySelector('#totalPrice')

// Calculator Variable
let calculator = 0
let totalQuantityCalculator = 0

// Each LocalStorage User Basket and display to DOM
JSON.parse(getBasket()).forEach(element => {
    fetch('http://127.0.0.1:3000/api/products/' + element.id)
    .then(function(res) {
    if (res.ok) {
      return res.json();
    }
  })
  .then(function(product) {
    addToCard(element, product)
  })
  .catch(function(err) {
    // API ERROR
  });
  
})

// Function for add product to DOM
function addToCard(data, product){
    let html = `
    <article class="cart__item" data-id="${data.id}" data-color="${data.color}">
        <div class="cart__item__img">
            <img src="${product.imageUrl}" alt="${product.altTxt}">
        </div>
        <div class="cart__item__content">
            <div class="cart__item__content__description">
                <h2>${product.name}</h2>
                <p>${data.color}</p>
                <p>${product.price}$</p>
            </div>
            <div class="cart__item__content__settings">
                <div class="cart__item__content__settings__quantity">
                    <p>Qté : </p>
                    <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${data.quantity}">
                </div>
                <div class="cart__item__content__settings__delete">
                    <p class="deleteItem">Supprimer</p>
                </div>
            </div>
        </div>
    </article>
    `
    product_container.insertAdjacentHTML('beforeend', html)

    // Start function for calcul new total price and quantity
    totalCalculator(data.id, data.quantity, null, 'add')
}


// Function for get and return LocalStorage User Basket
function getBasket(){
    let editable_basket = localStorage.getItem('basket')
    return editable_basket
}

// Function for calculate (add, remove, update) TotalPrice / TotalQuantity
function totalCalculator(id, quantity, color, option){

    // Get product data details
    fetch('http://127.0.0.1:3000/api/products/' + id)
    .then(function(res) {
        if(res.ok) {
            return res.json();
        }
    })
    .then(function(product) {
        
        // Define if, add/remove or update
        switch(option){

            // If Add Product
            case 'add': 
                calculator = calculator + product.price * quantity 
                totalPrice.textContent = calculator
                totalQuantityCalculator = parseInt(totalQuantityCalculator) + parseInt(quantity)
                totalQuantity.textContent = totalQuantityCalculator
                break;

            // If Remove Product
            case 'remove': 
                calculator = calculator - (product.price * quantity)
                totalPrice.textContent = calculator

                totalQuantityCalculator = totalQuantityCalculator - quantity

                totalQuantity.textContent = totalQuantityCalculator

                quantity_selector = document.getElementsByClassName("itemQuantity");
                break;

            // If Update Product Quantity
            case 'update': 
            
            // Get LocalStorage User Basket
            let editable_basket = JSON.parse(getBasket())

            // Found the basket product index
            let product_index = editable_basket.findIndex(data => data.id == id && data.color == color)

            // Get and save default product quantity
            let base_quantity = Number(editable_basket[product_index].quantity)
            
            // if new quantity > default quantity
            if(quantity > base_quantity){

                // Calcul the difference quantity and price
                let quantity_diff = Number(quantity - base_quantity)
                let price_diff = parseInt(product.price) * quantity_diff

                // Update the total quantity of user basket
                totalQuantityCalculator = parseInt(totalQuantityCalculator) + parseInt(quantity_diff)

                // Get and update the total price of user basket
                let old_total_price = totalPrice.innerText
                var new_total_price = parseInt(old_total_price) + parseInt(price_diff)

            // if new quantity < default quantity
            } else if(quantity < base_quantity){

                // Calcul the difference quantity and price
                let quantity_diff = Number(base_quantity - quantity)
                let price_diff = parseInt(product.price) * quantity_diff

                // Update the total quantity of user basket
                totalQuantityCalculator = parseInt(totalQuantityCalculator) - parseInt(quantity_diff)

                // Get and update the total price of user basket
                let old_total_price = totalPrice.innerText
                var new_total_price = parseInt(old_total_price) - parseInt(price_diff)
            }

            // Update product quantity and save into LocalStorage User
            editable_basket[product_index].quantity = Number(quantity)
            localStorage.setItem('basket', JSON.stringify(editable_basket))

            // Update DOM Total Price & Quantity
            totalQuantity.textContent = totalQuantityCalculator
            totalPrice.textContent = new_total_price
            break;
        }

    })
    .catch(function(err) {
        // API ERROR
    });
}



window.onload = function() { 

    // Listen if product is delete from basket
    let elements = document.getElementsByClassName("deleteItem");

    for(let i = 0; i < elements.length > 0; i++) {
        elements[i].onclick = function () {

            // Get Product Parent HTML
            let PRODUCT_DELETE = this.parentElement.parentElement.parentElement.parentElement

            // Remove from DOM
            PRODUCT_DELETE.remove()

            // Get localstorage to array
            let editable_basket = JSON.parse(getBasket())

            // Get index of product in basket
            let product_index = editable_basket.findIndex(data => data.id == PRODUCT_DELETE.getAttribute('data-id') && data.color == PRODUCT_DELETE.getAttribute('data-color'))

            // Get & save the old product quantity for calculate later
            const quantity = editable_basket[product_index].quantity

            // Remove from basket
            editable_basket.splice(product_index, 1)

            // Save into LocalStorage Basket
            localStorage.setItem('basket', JSON.stringify(editable_basket))

            // Calculate a new total price and quantity
            totalCalculator(PRODUCT_DELETE.getAttribute('data-id'), quantity, null, 'remove')
        }
    }


    // Listen if product quantity change (increase or decrease)
    let quantity_selector = document.getElementsByClassName("itemQuantity");
    for(let i = 0; i < quantity_selector.length; i++) {
        quantity_selector[i].addEventListener('change', function(){
            
            // Get the product id and color
            let id_update = this.parentElement.parentElement.parentElement.parentElement.getAttribute('data-id')
            let color_update = this.parentElement.parentElement.parentElement.parentElement.getAttribute('data-color')

            // Get the new quantity
            let new_quantity = this.value

            // Calculate the new total price and quantity
            totalCalculator(id_update, new_quantity, color_update, 'update')

    })}


    // Listen Click Button

    orderBtn.addEventListener('click', function(){

        // Initialize a custom validator
        let _validator = 0;

        // Target form div
        let firstName = document.querySelector('#firstName')
        let lastName = document.querySelector('#lastName')
        let address = document.querySelector('#address')
        let city = document.querySelector('#city')
        let email = document.querySelector('#email')

        // Regex for checking form
        let regexfirstName = /^[a-zA-ZéèîïÉÈÎÏ][a-zéèêàçîï]+([-'\s][a-zA-ZéèîïÉÈÎÏ][a-zéèêàçîï]+)?$/
        let regexlastName =  /^[a-zA-ZéèîïÉÈÎÏ][a-zéèêàçîï]+([-'\s][a-zA-ZéèîïÉÈÎÏ][a-zéèêàçîï]+)?$/
        let regexAddress = /[0-9,'a-zA-Zéèàêëï]/g
        let regexCity = /^[a-zA-ZéèîïÉÈÎÏ][a-zéèêàçîï]+([-'\s][a-zA-ZéèîïÉÈÎÏ][a-zéèêàçîï]+)?$/
        let regexEmail =  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

        // Prepare client variable for getting orderId later
        let client = {
            'contact': {

            },
            'products': []
        }

        // Verifiy firstName with regex
        if(firstName.value.match(regexfirstName)){
            let err = document.querySelector('#firstNameErrorMsg')
            err.textContent = ''
            client.contact.firstName = firstName.value
            _validator++
        } else {
            let err = document.querySelector('#firstNameErrorMsg')
            err.textContent = 'Veuillez inscrire un prénom valide'
        }

        // Verifiy lastName with regex
        if(lastName.value.match(regexlastName)){
            let err = document.querySelector('#lastNameErrorMsg')
            err.textContent = ''
            client.contact.lastName = lastName.value
            _validator++
        } else {
            let err = document.querySelector('#lastNameErrorMsg')
            err.textContent = 'Veuillez inscrire un nom valide'
        }

        // Verifiy address with regex
        if(address.value.match(regexAddress)){
            let err = document.querySelector('#addressErrorMsg')
            err.textContent = ''
            client.contact.address = address.value
            _validator++
        } else {
            let err = document.querySelector('#addressErrorMsg')
            err.textContent = 'Veuillez inscrire une adresse valide'
        }

        // Verifiy city with regex
        if(city.value.match(regexCity)){
            let err = document.querySelector('#cityErrorMsg')
            err.textContent = ''
            client.contact.city = city.value
            _validator++
        } else {
            let err = document.querySelector('#cityErrorMsg')
            err.textContent = 'Veuillez entrer une ville valide' 
        }

        // Verifiy email with regex
        if(email.value.match(regexEmail)){
            let err = document.querySelector('#emailErrorMsg')
            err.textContent = ''
            client.contact.email = email.value
            _validator++
        } else {
            let err = document.querySelector('#emailErrorMsg')
            err.textContent = 'Veuillez inscrire une adresse email valide'
        }

        // If Custom validator == 5 (all input form it's valid)
        if(_validator == 5){

            // Re-Get client basket from LocalStorage
            let array = JSON.parse(getBasket())
            for(item of array){
                // Push all ID into simple Array
                client.products.push(item.id)
            }

            // Post and get the orderId
            fetch('http://127.0.0.1:3000/api/products/order', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(client)
            })
            .then((res) => res.json()).then((data) => document.location.href = './confirmation.html?orderId='+ data.orderId)
        } else {
            // ERROR
        }
    })
};

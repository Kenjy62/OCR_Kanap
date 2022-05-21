// Prepare editable basket (array) for save product or initialize basket
let editable_basket = []

// Verifiy if user basket is already initialized in LocalStorage

if(localStorage.getItem('basket')){
  editable_basket = JSON.parse(localStorage.getItem('basket'))
} else {
  // Else initialize LocalStorage basket and editable basket
  localStorage.setItem('basket', JSON.stringify(editable_basket))
  editable_basket = JSON.parse(localStorage.getItem('basket'))
}


// Get Product ID from URL
let url = (new URL(document.location)).searchParams;
let product_id = url.get('id');

// Get Product Data by ID  and Update DOM
fetch('http://127.0.0.1:3000/api/products/' + product_id)
  .then(function(res) {
    if (res.ok) {
      return res.json();
    }
  })
  .then(function(product) {

    // Targets DOM objects to modify
    let product_image = document.querySelector('.item__img')
    let product_image_content = `<img src="${product.imageUrl}" alt="${product.altTxt}">`
    let product_name = document.querySelector('#title')
    let product_price = document.querySelector('#price')
    let product_description = document.querySelector('#description')
    let product_colors = document.querySelector('#colors')
    
    // Update DOM 
    product_image.insertAdjacentHTML("beforeend", product_image_content)
    product_name.insertAdjacentText("beforeend", product.name)
    product_price.insertAdjacentText("beforeend", product.price)
    product_description.insertAdjacentText("beforeend", product.description)

    // While for multiple product colors
    for(color of product.colors){
      let product_color = `<option value="${color}">${color}</option>`
      product_colors.insertAdjacentHTML("beforeend",product_color)
    }
  })
  .catch(function(err) {
    // API ERROR
  });


  // Adding product to user basket
  function addToBasket() {
    let product_quantity = document.querySelector('input[name="itemQuantity"]').value
    let product_color = document.querySelector('#colors').value
  
    if(product_quantity < 1){
      alert('Select a quantity please...')
    } else if(product_color == '') {
      alert('Select a color please...')
    } else {
      // Verify if product is already in user basket
      productVerify(product_id, product_color, product_quantity)
    }
  }

  // Verify -> Add or Increase Basket
  function productVerify(product_id, product_color, product_quantity){
    
    // Check if product is already in basket
    let checker = editable_basket.find(product => product.id == product_id && product.color == product_color)

    // If is already in basket with the same color, increase the quantity by new quantity selected (default : 5, new : 10 = 5 + 10)
    if(checker){
      let product_index = editable_basket.findIndex(product => product.id == product_id && product.color == product_color)
      let product_quantity_calculator = parseInt(product_quantity) + parseInt(editable_basket[product_index].quantity)
      editable_basket[product_index].quantity = product_quantity_calculator

      // Save into user LocalStorage
      localStorage.setItem('basket', JSON.stringify(editable_basket))
    } else {
    // Add the product to Array
      let product = {
        'id': product_id,
        'color': product_color,
        'quantity': parseInt(product_quantity)
      }
      editable_basket.push(product)

      // Save into user LocalStorage
      localStorage.setItem('basket', JSON.stringify(editable_basket))
    }
  }
  
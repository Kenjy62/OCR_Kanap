// Get Products List

fetch('http://127.0.0.1:3000/api/products')
  .then(function(res) {
    if (res.ok) {
      return res.json()
    }
  })
  .then(productList =>  {    
    // While the products list
    for(product of productList) {
      // For each product, add to DOM
      addProduct(product)
    }
  })
  .catch(function(err) {
  // API ERROR
  });



// Function for add product to DOM
function addProduct(product) {
    // Target the Parent Div
    let product_container = document.getElementById('items')
    
    // Prepare the HTML of product
    let product_structure = `
        <a href="./product.html?id=${product._id}">
            <article>
                <img src="${product.imageUrl}" alt="${product.altTxt}">
                <h3 class="productName">${product.name}</h3>
                <p class="productDescription">${product.description}</p>
            </article>
        </a>`

    // Add to DOM (parent -> product_container)
    product_container.insertAdjacentHTML("beforeend", product_structure)  
}
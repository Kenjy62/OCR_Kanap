// Get Product ID from URL
let url = (new URL(document.location)).searchParams;
let _orderId = url.get('orderId');

let orderId = document.querySelector('#orderId')

orderId.textContent = _orderId
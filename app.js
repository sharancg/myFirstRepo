const products = [
  {id:1,name:"Aero Running Shoes",category:"Footwear",price:119.99,img:"https://picsum.photos/seed/p1/600/400"},
  {id:2,name:"Nimbus Jacket",category:"Apparel",price:89.99,img:"https://picsum.photos/seed/p2/600/400"},
  {id:3,name:"Lumen Headphones",category:"Electronics",price:59.99,img:"https://picsum.photos/seed/p3/600/400"},
  {id:4,name:"Orbit Smartwatch",category:"Electronics",price:199.99,img:"https://picsum.photos/seed/p4/600/400"},
  {id:5,name:"Classic Leather Bag",category:"Accessories",price:129.99,img:"https://picsum.photos/seed/p5/600/400"},
  {id:6,name:"Studio Lamp",category:"Home",price:39.99,img:"https://picsum.photos/seed/p6/600/400"},
  {id:7,name:"Comfy Tee",category:"Apparel",price:19.99,img:"https://picsum.photos/seed/p7/600/400"},
  {id:8,name:"Trail Backpack",category:"Accessories",price:69.99,img:"https://picsum.photos/seed/p8/600/400"},
  {id:9,name:"Performance Socks",category:"Footwear",price:9.99,img:"https://picsum.photos/seed/p9/600/400"},
  {id:10,name:"Fitness Mat",category:"Home",price:29.99,img:"https://picsum.photos/seed/p10/600/400"},
  {id:11,name:"Wireless Charger",category:"Electronics",price:24.99,img:"https://picsum.photos/seed/p11/600/400"},
  {id:12,name:"Layered Scarf",category:"Accessories",price:34.99,img:"https://picsum.photos/seed/p12/600/400"}
];

// state
let state = {
  q:'', category:'all', maxPrice:500, sort:'featured', cart: JSON.parse(localStorage.getItem('cart')||'{}')
};

// elements
const productsEl = document.getElementById('products');
const productTpl = document.getElementById('product-template');
const cartToggle = document.getElementById('cart-toggle');
const cartEl = document.getElementById('cart');
const cartItemsEl = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const cartClose = document.getElementById('cart-close');
const checkoutBtn = document.getElementById('checkout');
const searchEl = document.getElementById('search');
const sortEl = document.getElementById('sort');
const filterCategory = document.getElementById('filter-category');
const priceRange = document.getElementById('price-range');
const priceValue = document.getElementById('price-value');
const clearFilters = document.getElementById('clear-filters');
const overlay = document.getElementById('overlay');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');

function init(){
  populateCategories();
  bindEvents();
  render();
  updateCartUI();
}

function populateCategories(){
  const cats = ['all', ...new Set(products.map(p=>p.category))];
  filterCategory.innerHTML = cats.map(c=>`<option value="${c}">${c}</option>`).join('');
}

function bindEvents(){
  searchEl.addEventListener('input', e=>{state.q=e.target.value; render();});
  sortEl.addEventListener('change', e=>{state.sort=e.target.value; render();});
  filterCategory.addEventListener('change', e=>{state.category=e.target.value; render();});
  priceRange.addEventListener('input', e=>{state.maxPrice=Number(e.target.value); priceValue.textContent=e.target.value; render();});
  clearFilters.addEventListener('click', ()=>{state={...state,q:'',category:'all',maxPrice:500,sort:'featured',cart:state.cart}; priceRange.value=500; priceValue.textContent=500; searchEl.value=''; filterCategory.value='all'; sortEl.value='featured'; render();});
  cartToggle.addEventListener('click', ()=>cartEl.classList.toggle('hidden'));
  cartClose.addEventListener('click', ()=>cartEl.classList.add('hidden'));
  checkoutBtn.addEventListener('click', checkout);
  overlay.addEventListener('click', closeModal);
  modalClose.addEventListener('click', closeModal);
}

function render(){
  const list = products
    .filter(p=>p.price<=state.maxPrice)
    .filter(p=>state.category==='all' || p.category===state.category)
    .filter(p=>p.name.toLowerCase().includes(state.q.toLowerCase()));

  if(state.sort==='price-asc') list.sort((a,b)=>a.price-b.price);
  if(state.sort==='price-desc') list.sort((a,b)=>b.price-a.price);

  productsEl.innerHTML='';
  list.forEach(p=>{
    const node = productTpl.content.cloneNode(true);
    node.querySelector('.card-img').src=p.img;
    node.querySelector('.card-title').textContent=p.name;
    node.querySelector('.card-price').textContent=`$${p.price.toFixed(2)}`;
    node.querySelector('.btn.add').addEventListener('click', ()=>addToCart(p.id));
    node.querySelector('.btn.view').addEventListener('click', ()=>openModal(p));
    productsEl.appendChild(node);
  });
}

function addToCart(id){
  const key = String(id);
  state.cart[key] = (state.cart[key] || 0) + 1;
  persistCart();
  updateCartUI();
}

function persistCart(){ localStorage.setItem('cart', JSON.stringify(state.cart)); }

function updateCartUI(){
  const entries = Object.entries(state.cart);
  cartItemsEl.innerHTML='';
  let total = 0, count = 0;
  for(const [id,qty] of entries){
    const prod = products.find(p=>p.id===Number(id));
    if(!prod) continue;
    const tpl = document.getElementById('cart-item-template').content.cloneNode(true);
    tpl.querySelector('.cart-item-img').src = prod.img;
    tpl.querySelector('.cart-item-title').textContent = prod.name;
    tpl.querySelector('.qty').textContent = qty;
    tpl.querySelector('.cart-item-price').textContent = `$${(prod.price*qty).toFixed(2)}`;
    tpl.querySelector('.qty-increase').addEventListener('click', ()=>{state.cart[id]++; persistCart(); updateCartUI();});
    tpl.querySelector('.qty-decrease').addEventListener('click', ()=>{ if(state.cart[id]>1){state.cart[id]--; } else { delete state.cart[id]; } persistCart(); updateCartUI();});
    tpl.querySelector('.cart-item-remove').addEventListener('click', ()=>{ delete state.cart[id]; persistCart(); updateCartUI();});
    cartItemsEl.appendChild(tpl);
    total += prod.price * qty; count += qty;
  }
  cartTotal.textContent = total.toFixed(2);
  cartCount.textContent = count;
  if(count===0){ cartItemsEl.innerHTML = '<div style="color:#6b7280">Cart is empty</div>'; }
}

function openModal(product){
  modalBody.innerHTML = `
    <div style="display:flex;gap:1rem;align-items:flex-start">
      <img src="${product.img}" style="width:220px;height:140px;object-fit:cover;border-radius:8px" />
      <div>
        <h2>${product.name}</h2>
        <p style="color:#6b7280">${product.category}</p>
        <p style="font-weight:700;color:var(--accent)">$${product.price.toFixed(2)}</p>
        <p style="margin-top:.5rem">This demo includes a product detail view and mock checkout. Add items to the cart and press Checkout.</p>
        <div style="margin-top:1rem"><button class="btn primary" id="modal-add">Add to cart</button></div>
      </div>
    </div>`;
  modal.classList.remove('hidden'); overlay.classList.remove('hidden');
  document.getElementById('modal-add').addEventListener('click', ()=>{ addToCart(product.id); closeModal(); });
}

function closeModal(){ modal.classList.add('hidden'); overlay.classList.add('hidden'); }

function checkout(){
  const items = Object.keys(state.cart).length;
  if(items===0){ alert('Cart is empty. Add some items first.'); return; }
  // mock checkout flow
  alert(`Checkout successful — ${Object.values(state.cart).reduce((a,b)=>a+b,0)} item(s). Thank you!`);
  state.cart = {};
  persistCart();
  updateCartUI();
}

window.addEventListener('load', init);

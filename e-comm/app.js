//contentful data saving
const client = contentful.createClient({
  space: "r35uvpbciqyu",
  accessToken: "P2iuC1QUAmYf3lFV6qfwlF21JG-FREj4GBbsGOXU3FI",
});
//side navbar opening functionality
function openNav() {
  document.getElementById("sideNav").style.width = "350px";
}
//side navbar opening functionality
function closeNav() {
  document.getElementById("sideNav").style.width = "0";
}
//variable
let cartBtn = document.querySelector(".cart-btn");
let closecartBtn = document.querySelector(".close-cart");
let clearcartBtn = document.querySelector(".clear-cart");
let cartDom = document.querySelector(".cart");
let cartOverlay = document.querySelector(".cart-overlay");
let cartItems = document.querySelector(".cart-items");
let cartTotal = document.querySelector(".cart-total");
let cartContent = document.querySelector(".cart-content");
let productDom = document.querySelector(".products-center");

let cart = [];
//buttons
let buttonsDOM = [];

//getting products
class Products {
  async getProducts() {
    try {
      //contentfulc cdn data collecting
      let contentful=await client.getEntries({
        content_type:"inkvibeThreads"
      });

      console.log(contentful)
      //local data reference
      // let result = await fetch("products.json");
      // let data = await result.json();
      let products = contentful.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const img = item.fields.image.fields.file.url;
        return { title, price, id, img };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

//displaying
class UI {
  displaying(products) {
    var result = "";
    products.forEach((product) => {
      result += `
      <article class="product">
      <div class="img-container">
      <img src=${product.img} alt="Product " class="product-img">
      <button class="bag-btn" data-id=${product.id}>
          <i class="fas fa-shopping-cart">add to cart</i>
      </button>
     </div>
      <h3>${product.title}</h3>
      <h4>${product.price}</h4>
    </article> `;
    });
    productDom.innerHTML = result;
  }
  getBagButtons() {
    const bagbtn = [...document.querySelectorAll(".bag-btn")]; //Spread will convert to array
    buttonsDOM = bagbtn;
    bagbtn.forEach((button) => {
      const id = button.dataset.id;
      let incart = cart.find((item) => item.id === id);
      if (incart) {
        cart.innerText = "In Cart";
        button.disabled = true;
      }
      button.addEventListener("click", (event) => {
        event.target.innerText = "In Cart";
        event.target.disabled = true;
        //getting product from products
        let cartItem = { ...Storage.getProducts(id), amount: 1 };

        cart.push(cartItem);
        console.log(cart);
        //local storage
        Storage.localCartStore(cart);
        //set cart item
        this.setCartValue(cart);

        //displaying cart item in cart
        this.addtoCart(cartItem);

        //showing cartt from side
        this.showCart();
      });
    });
  }

  setCartValue(cart) {
    let temptotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      temptotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.textContent = parseFloat(temptotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }
  addtoCart(item) {
    let div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = ` 
          <img src="${item.img}" alt="">
          <div>
            <h4>${item.title}</h4>
            <h5>${item.price}</h5>
            <div class="remove-item" data-id=${item.id}>remove</div>
          </div>
          <div>
              <i class="fas fa-chevron-up" data-id=${item.id}></i>
              <p class="item-amount">${item.amount}</p>
              <i class="fas fa-chevron-down" data-id=${item.id}></i>
          </div>`;
    cartContent.appendChild(div);
    console.log(cartContent);
  }
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDom.classList.add("showCart");
  }
  setUp() {
    cart = Storage.getCart();
    this.setCartValue(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closecartBtn.addEventListener("click", this.hideCart);
    this.hideCart();
  }
  populateCart(cart) {
    cart.forEach((item) => this.addtoCart(item));
  }
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDom.classList.remove("showCart");
  }
  cartLogic() {
    clearcartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    //cart functionality
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
        Storage.clearLocalCart(cart);
        // cartContent.removeChild(removeItem);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItm = cart.find((item) => item.id === id);
        tempItm.amount = tempItm.amount + 1;
        Storage.localCartStore(cart);
        this.setCartValue(cart);
        addAmount.nextElementSibling.innerText = tempItm.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItm = cart.find((item) => item.id === id);
        tempItm.amount = tempItm.amount - 1;
        Storage.localCartStore(cart);
        this.setCartValue(cart);
        if (tempItm.amount > 0) {
          Storage.localCartStore(cart);
          this.setCartValue(cart);
          lowerAmount.previousElementSibling.innerText = tempItm.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
          Storage.clearLocalCart(); // Clear entire cart from local storage
        }
      }
    });
  }
  clearCart() {
    let cartItem = cart.map((item) => item.id);
    cartItem.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
    Storage.localCartStore([]); // Clear cart in local storage
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValue(cart);
    Storage.localCartStore(cart);
    let button = this.getSingleBtn(id);
    button.disabled = true;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>Add To Cart`;
  }
  getSingleBtn(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}

//local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  //this will give id of product whose add to cart is clicked
  static getProducts(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    if (products && products.length > 0) {
      return products.find((product) => product.id === id);
    } else {
      console.log("No products found in local storage or invalid format");
      return null;
    }
  }
  static localCartStore(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
  static clearLocalCart() {
    localStorage.removeItem("cart");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  //set up app
  ui.setUp();
  products
    .getProducts()
    .then((products) => {
      ui.displaying(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons(); //After product is loded then we can access bag-btn
      ui.cartLogic();
    });
});

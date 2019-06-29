/** SELECT ALL ELEMENTS  */

 const cartBtn = document.querySelector('.cart-btn'),
 closeCartBtn = document.querySelector('.close-cart'),
 clearCartBtn = document.querySelector('.clear-cart'),
 cartContainer = document.querySelector('.cart-container'),
 cartOverlay = document.querySelector('.cart-overlay'),
 cartItems  = document.querySelector('.cart-items-selected'),
 cartTotal= document.querySelector('.cart-total'),
 cartContent= document.querySelector('.cart-content'),
 productsContainer = document.querySelector('.products-container');

// cart state
let cart = [];
let buttonsDOM =[]; 

// CLASS
 /* ---- MODEL ---- */
class Products{
    async getProducts(){
        try{
        // 1) fetch data & await for result
         let result = await fetch("../data/products.json");
         // 2) await for res & get json format
         let data= await result.json();

        //  destructure logic
        // 1) products hold array
        let products= data.items;
        //2)map& grab fields and sys object from each item in the product array
            products= products.map( ({fields, sys}) =>{

            const {title, price}=fields;
            const {id}= sys;
            const {url}= fields.image.fields.file;
        // 3) return the property I need
        return  { title, price, id, url};  
    })
    // 4) return cleaner data structure for products
            return products;
        }catch(error){console.log(error)}   
    }
}

 /* ---- VIEW ---- */
class UI{
 /* ---- DISPLAY PRODUCT ---- */
    displayProduct(products){
      
        let result ='';
        products.forEach((product)=>{
            // 1) get property and place it into HTML
            result +=`
            <article class="product">
            <div class="img-container">
                <img src=${product.url} 
                alt=${product.title}
                class="product-img">
                <button class="bag-btn" data-id=${product.id}>
                <i class="fas fa-shopping-cart"></i>
                add to bag
            </button>
            </div>
            <div class="product-details">
            <h3>${product.title}</h3>   <span>£${product.price}</span></div>
            
        </article>
            `;
        });
    // 2) insert result into productsContainer 
    productsContainer.innerHTML = result;
    }

    /* ---- BAGS BUTTON ---- */
    getBagButtons(){
        // from Nodelist turned into array in order to use find()
        const buttons =[...document.querySelectorAll('.bag-btn')];
        // find particular button in the buttonsDOM array
        buttonsDOM= buttons;

        buttons.forEach((button)=>{
            // for each  btn items in the array get id 
            let id = button.dataset.id;
            // check if item is in the cart
            let inCart = cart.find((item)=>item.id ===id);
            if(inCart){
             /* 1) product already in cart :
                        - change text
                        -  product btn disabled
            */
                button.innerText= "In Cart";
                button.disabled= true;
            } 
            /* 2) product  is not in cart : 
                -  disable button */
                button.addEventListener('click', (event)=>{
                event.target.innerText='In Cart';
                event.target.disabled= true;

                 // get item from ls
                //  get all properties & val from object retured
                // amount property = num of items selected in cart
                let cartItem = {...Storage.getProduct(id), amount: 1};
              
                /*  add item to cart array
                -  ... get all item I have in the cart 
                currently & add cart item created
                */
               cart= [...cart, cartItem];
                // save cart in  LS
                Storage.saveCart(cart);

                // set value --  display update
                this.setCartValues(cart);
                // display cart item to 
                this.addCartItem(cartItem)
                // show cart 
                this.showCart();            
        });
     
        });
         // end foreach()   
    }

      /* ---- SET CART VALUE ---- */
      setCartValues(cart){
        // total in cart to pay
        let tempTotal= 0;
        //  total of items in the cart
        let itemsTotal= 0;

        cart.map( item =>{
            // price and amount
            // cart total
            tempTotal += item.price * item.amount;
         
            // specific value in amount
            itemsTotal += item.amount;
        });
    // access 2 corresponding dom elements and update value
        cartTotal.innerText =parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }

      /* ---- ADD CART ITEM ---- */
      addCartItem(item){ 
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML= `
        <!-- start cart-item -->
        <img src=${item.url} alt=${item.title}>

        <div>
           <h4>${item.title}</h4> 
           <h5>£${item.price}</h5>
           <button 
           type="button"
           class="remove-item" data-id=${item.id}>remove</button>
        </div>

        <div>
          <button 
              type="button" >
              <i class="fas fa-plus" data-id=${item.id}></i>
          </button>
          
          <p class="item-amount">${item.amount}</p>
          <button 
              type="button">
              <i class="fas fa-minus" data-id=${item.id}></i>
          </button>
           
        </div>
        `;
        cartContent.appendChild(div);
    }
        /** SHOW CART */
    showCart(){
    cartOverlay.classList.add('overlayActive');
    cartContainer.classList.add('showCart');
    }

    setApp(){
//  when app load - check cart value
// either val from LS or []
      cart = Storage.getCart();
    // set value in the DOM
    this.setCartValues(cart);
    this.populate(cart);

    cartBtn.addEventListener('click', this.showCart);
    closeCartBtn.addEventListener('click', this.hideCart)
    }

    populate(cart){
        cart.forEach(item =>{
            this.addCartItem(item);
        })
    }

  /** HIDE CART*/
    hideCart(){
        cartOverlay.classList.remove('overlayActive');
        cartContainer.classList.remove('showCart');
    }

  
    /** SHOPPING CART LOGIC */
    /**add & remove item quantity - use event bubbling */
    shoppingCartLogic(){
        // 1) access clearbtn
        clearCartBtn.addEventListener('click',()=> 
        // to be able o access method from UI class 
        this.clearCart());

        // cart add - remove functionality
        cartContent.addEventListener('click', event =>{
            if(event.target.classList.contains("remove-item")){
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                // removed from cart arr
                this.removeItem(id);
                // remove from DOM
        // console.log(removeItem.parentElement.parentElement)
        cartContent.removeChild(    removeItem.parentElement.parentElement);   
            }
            else if(event.target.classList.contains("fa-plus")){
                let addItem = event.target;
                let id = addItem.dataset.id;
                
                let tempItem = cart.find(item => item.id ===id);
                tempItem.amount  +=1;
                
               // 1)update LS
                    Storage.saveCart(cart);
               // 2)calculate new total
               this.setCartValues(cart);
            //to update num in DOM
                //1- go up to the parent btn
               let parentBtnPlus =addItem.parentElement;
                //2- access sibling 
               parentBtnPlus.nextElementSibling.innerHTML= tempItem.amount;   
            }
            else if(event.target.classList.contains("fa-minus")){
                let minusItem = event.target;
                let id = minusItem.dataset.id;                
                let tempItem = cart.find(item => item.id ===id);

                tempItem.amount  -=1;
                if( tempItem.amount > 0){
              // 1)update LS
             Storage.saveCart(cart);
            // 2)calculate new total
            this.setCartValues(cart);
            //to update num in DOM
            //1- go up to the parent btn
            let parentBtnPlus =minusItem.parentElement;
            //2- access prev sibling 
            parentBtnPlus.previousElementSibling.innerHTML= tempItem.amount;
                }else{
               cartContent.removeChild(minusItem.parentElement.parentElement.parentElement);
                // remove from arr
                this.removeItem(id);
                }
            }
        })
    }


/** CLEAR ALL ITEMS FROM CART */
    clearCart(){
    //get all the id of the items have in the cart 
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id =>{ this.removeItem(id)});
    // remove from DOM
   while(cartContent.children.length > 0 ){
    //    console.log(cartContent.children[0])
        cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart(); 
    }


/** REMOVE ITEM FROM CART */
    removeItem(id){
        // 1) filter out the item 
        cart= cart.filter(item => item.id !=id);
        // 2) update the value after filter
        this.setCartValues(cart);
        // *) save to LS
        Storage.saveCart(cart);
        // select specific 
        let button =this.getSingleCartButton(id);
        button.innerHTML= 
        `<i class="fas fa-shopping-cart"></i>
        add to bag`;
        button.disabled= false;
    }

    /**GET SPECIFIC  ADD BUTTON FROM ITEMS */
    getSingleCartButton(id){
        return buttonsDOM.find(btn=> btn.dataset.id === id);
    }


}

/** --- LOCAL STORAGE --- */  
class Storage{
    //static method can be used without instanciated the class
    // & can access particular class without instanciated

    static saveProduct(products){
        localStorage.setItem("products", JSON.stringify(products));
    }
    
    static getProduct(id){
        let products = JSON.parse(localStorage.getItem("products"));
        return products.find((item)=>item.id === id)
    };
    static saveCart(cart){
        localStorage.setItem("cart", JSON.stringify(cart));
     };

    static getCart(){
      return localStorage.getItem('cart') 
      ? JSON.parse(localStorage.getItem('cart')):
      [] ;
    }
}

// event listener
document.addEventListener("DOMContentLoaded", (e)=>{
/** CREATE INSTANCES */  
    // ui intances
    const ui = new UI();

    // product intances
    const products = new Products();
    // 
    ui.setApp()
    // 1) get all products
    products.getProducts()
    .then(data => {
        // 2) put it into the ui
        ui.displayProduct(data);
        // 3) save into storage
        Storage.saveProduct(data);
     }).then(()=>{
        //to get btn after loading the project
         ui.getBagButtons();
         ui.shoppingCartLogic();

     });
 
})
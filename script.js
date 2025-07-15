// --- SPA Navigation & Section Switching ---
function showSection(sectionId) {
  document.querySelectorAll(".spa-section").forEach((sec) => {
    sec.style.display = sec.id === sectionId ? "" : "none";
  });
  // Render cart/orders/admin if needed
  if (sectionId === "cart-section") renderCart();
  if (sectionId === "orders-section") renderOrders();
  if (sectionId === "admin-section") renderAdminProductList();
}

function updateNavBar() {
  const user = getCurrentUser();
  const adminLink = document.getElementById("admin-link");
  const userInfo = document.getElementById("user-info");
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const cartBtn = document.querySelector('button[data-section="cart-section"]');
  if (user) {
    userInfo.textContent = `Logged in as: ${user.username} (${user.role})`;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "";
    if (user.role === "admin") {
      adminLink.style.display = "";
      cartBtn.style.display = "none";
    } else {
      adminLink.style.display = "none";
      cartBtn.style.display = "";
    }
  } else {
    userInfo.textContent = "";
    loginBtn.style.display = "";
    logoutBtn.style.display = "none";
    adminLink.style.display = "none";
    cartBtn.style.display = "";
  }
}

// --- Authentication & User Management ---
function showAuthModal() {
  document.getElementById("auth-modal").style.display = "flex";
  showLoginTab();
}
function hideAuthModal() {
  document.getElementById("auth-modal").style.display = "none";
}
function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "[]");
}
function setUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}
function loginUser(username, password, role) {
  const users = getUsers();
  const user = users.find(
    (u) => u.username === username && u.password === password && u.role === role
  );
  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    updateNavBar();
    hideAuthModal();
    showSection("products-section");
    renderProductList();
    updateCartBadge();
  } else {
    showLoginError("Invalid username, password, or role.");
  }
}
function registerUser(username, password, role) {
  let users = getUsers();
  if (users.some((u) => u.username === username)) {
    showRegisterError("Username already exists.");
    return;
  }
  const newUser = { username, password, role };
  users.push(newUser);
  setUsers(users);
  localStorage.setItem("currentUser", JSON.stringify(newUser));
  updateNavBar();
  hideAuthModal();
  showSection("products-section");
  renderProductList();
  updateCartBadge();
}
function logoutUser() {
  localStorage.removeItem("currentUser");
  updateNavBar();
  showSection("products-section");
  renderProductList();
  updateCartBadge();
}
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}
function showLoginTab() {
  document.getElementById("login-form-section").style.display = "";
  document.getElementById("register-form-section").style.display = "none";
  document.getElementById("show-login-tab").classList.add("active");
  document.getElementById("show-register-tab").classList.remove("active");
  document.getElementById("login-error").textContent = "";
  document.getElementById("register-error").textContent = "";
}
function showRegisterTab() {
  document.getElementById("login-form-section").style.display = "none";
  document.getElementById("register-form-section").style.display = "";
  document.getElementById("show-login-tab").classList.remove("active");
  document.getElementById("show-register-tab").classList.add("active");
  document.getElementById("login-error").textContent = "";
  document.getElementById("register-error").textContent = "";
}
function showLoginError(message) {
  document.getElementById("login-error").textContent = message;
}
function showRegisterError(message) {
  document.getElementById("register-error").textContent = message;
}

// --- Product Management ---
const PRODUCTS_PER_PAGE = 6;
let currentProductPage = 1;
let currentSearchQuery = "";

function getProducts() {
  let products = JSON.parse(localStorage.getItem("products"));
  if (!products) {
    // Initialize with 15 sample products using image paths relative to frontend/index.html
    products = [
      {
        id: 1,
        name: "Stylish Bag",
        category: "Accessories",
        price: 999,
        stock: 12,
        image: "images/bag.jpg",
        description: "Trendy and spacious bag for everyday use.",
      },
      {
        id: 2,
        name: "Water Bottle",
        category: "Fitness",
        price: 199,
        stock: 50,
        image: "images/bottle.jpg",
        description: "Stainless steel, 1L capacity.",
      },
      {
        id: 3,
        name: "Dumbbell",
        category: "Fitness",
        price: 499,
        stock: 20,
        image: "images/dumbbell.jpg",
        description: "Durable dumbbell for strength training.",
      },
      {
        id: 4,
        name: "Ceiling Fan",
        category: "Home",
        price: 1499,
        stock: 15,
        image: "images/fan.jpg",
        description: "High-speed ceiling fan for cool comfort.",
      },
      {
        id: 5,
        name: "Sunglasses",
        category: "Accessories",
        price: 899,
        stock: 35,
        image: "images/glasses.jpg",
        description: "UV-protected, stylish sunglasses.",
      },
      {
        id: 6,
        name: "Headphones",
        category: "Electronics",
        price: 1299,
        stock: 15,
        image: "images/headphones.jpg",
        description: "Noise-cancelling over-ear headphones.",
      },
      {
        id: 7,
        name: "Keyboard",
        category: "Electronics",
        price: 799,
        stock: 18,
        image: "images/keyboard.jpg",
        description: "Mechanical keyboard with backlight.",
      },
      {
        id: 8,
        name: "Desk Lamp",
        category: "Home",
        price: 499,
        stock: 18,
        image: "images/lamp.jpg",
        description: "Adjustable LED desk lamp.",
      },
      {
        id: 9,
        name: "Wireless Mouse",
        category: "Electronics",
        price: 399,
        stock: 25,
        image: "images/mouse.jpg",
        description: "Smooth and responsive wireless mouse.",
      },
      {
        id: 10,
        name: "Coffee Mug",
        category: "Home",
        price: 149,
        stock: 40,
        image: "images/mug.jpg",
        description: "Ceramic mug, 350ml.",
      },
      {
        id: 11,
        name: "Notebook",
        category: "Stationery",
        price: 99,
        stock: 100,
        image: "images/note.jpg",
        description: "A5, 200 pages notebook.",
      },
      {
        id: 12,
        name: "Pillow",
        category: "Home",
        price: 299,
        stock: 30,
        image: "images/pillow.jpg",
        description: "Soft and comfortable pillow.",
      },
      {
        id: 13,
        name: "Running Shoes",
        category: "Footwear",
        price: 1799,
        stock: 18,
        image: "images/shoe.jpg",
        description: "Comfortable running shoes for daily workouts.",
      },
      {
        id: 14,
        name: "Classic Watch",
        category: "Accessories",
        price: 2499,
        stock: 10,
        image: "images/watch.jpg",
        description: "Elegant analog watch with leather strap.",
      },
      {
        id: 15,
        name: "Yoga Mat",
        category: "Fitness",
        price: 399,
        stock: 30,
        image: "images/yoga.jpg",
        description: "Non-slip, eco-friendly yoga mat.",
      },
    ];
    localStorage.setItem("products", JSON.stringify(products));
  }
  return products;
}
function setProducts(products) {
  localStorage.setItem("products", JSON.stringify(products));
}
function renderProductList() {
  const products = getProducts();
  let filtered = products;
  if (currentSearchQuery) {
    const q = currentSearchQuery.toLowerCase();
    filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }
  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE) || 1;
  if (currentProductPage > totalPages) currentProductPage = totalPages;
  const start = (currentProductPage - 1) * PRODUCTS_PER_PAGE;
  const end = start + PRODUCTS_PER_PAGE;
  const pageProducts = filtered.slice(start, end);
  const list = document.getElementById("product-list");
  list.innerHTML = "";
  const user = getCurrentUser();
  const placeholder = "https://via.placeholder.com/400x300?text=No+Image";
  if (pageProducts.length === 0) {
    list.innerHTML = "<p>No products found.</p>";
  } else {
    pageProducts.forEach((product) => {
      const card = document.createElement("div");
      card.className = "product-card";
      // Blurry background + sharp image
      card.innerHTML = `
                <div class="product-image-container" style="background-image:url('${
                  product.image || placeholder
                }');">
                    <img class="product-image" src="${
                      product.image || placeholder
                    }" alt="${product.name}">
                </div>
                <span class="category-badge">${product.category}</span>
                <h3>${product.name}</h3>
                <p>${product.description || ""}</p>
                <p style="font-weight:600; font-size:1.1rem; margin:0.5rem 0;">Price: ₹${
                  product.price
                }</p>
                <p style="margin-bottom:0.7rem;">Stock: ${product.stock}</p>
                <button class="add-to-cart-btn" data-product-id="${
                  product.id
                }">Add to Cart</button>
            `;
      // Set the blurred background using ::before
      card
        .querySelector(".product-image-container")
        .style.setProperty(
          "--product-bg",
          `url('${product.image || placeholder}')`
        );
      list.appendChild(card);
    });
    // Add event listeners for all Add to Cart buttons
    list.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const productId = parseInt(this.getAttribute("data-product-id"));
        const user = getCurrentUser();
        if (user && user.role === "customer") {
          addToCart(productId);
        } else {
          showAuthModal();
        }
      });
    });
  }
  renderProductPagination(totalPages);
}
function renderProductPagination(totalPages) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentProductPage) btn.disabled = true;
    btn.addEventListener("click", () => {
      currentProductPage = i;
      renderProductList();
    });
    pagination.appendChild(btn);
  }
}
function searchProducts(query) {
  currentSearchQuery = query;
  currentProductPage = 1;
  renderProductList();
}
function paginateProducts(page) {
  currentProductPage = page;
  renderProductList();
}

// --- Cart Management ---
function updateCartBadge() {
  const user = getCurrentUser();
  const badge = document.getElementById("cart-badge");
  if (!user || user.role !== "customer") {
    badge.style.display = "none";
    badge.textContent = "0";
    return;
  }
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (count > 0) {
    badge.style.display = "";
    badge.textContent = count;
  } else {
    badge.style.display = "none";
    badge.textContent = "0";
  }
}
function showNotification(message) {
  const popup = document.getElementById("notification-popup");
  popup.textContent = message;
  popup.classList.add("show");
  popup.style.display = "";
  setTimeout(() => {
    popup.classList.remove("show");
    setTimeout(() => {
      popup.style.display = "none";
    }, 400);
  }, 1800);
}
function getCart() {
  const user = getCurrentUser();
  if (!user || user.role !== "customer") return [];
  return JSON.parse(localStorage.getItem("cart_" + user.username) || "[]");
}
function setCart(cart) {
  const user = getCurrentUser();
  if (!user || user.role !== "customer") return;
  localStorage.setItem("cart_" + user.username, JSON.stringify(cart));
}
function addToCart(productId) {
  const user = getCurrentUser();
  if (!user || user.role !== "customer") return;
  let cart = getCart();
  const products = getProducts();
  const product = products.find((p) => p.id === productId);
  if (!product || product.stock < 1) return;
  const cartItem = cart.find((item) => item.productId === productId);
  if (cartItem) {
    if (cartItem.quantity < product.stock) {
      cartItem.quantity += 1;
    }
  } else {
    cart.push({ productId, quantity: 1 });
  }
  setCart(cart);
  renderCart();
  updateCartBadge();
  showNotification("Added to cart");
}
function renderCart() {
  const user = getCurrentUser();
  const cartSection = document.getElementById("cart-items");
  const cartTotalDiv = document.getElementById("cart-total");
  if (!user || user.role !== "customer") {
    cartSection.innerHTML = "<p>Cart is only available for customers.</p>";
    cartTotalDiv.innerHTML = "";
    return;
  }
  let cart = getCart();
  const products = getProducts();
  cartSection.innerHTML = "";
  let total = 0;
  if (cart.length === 0) {
    cartSection.innerHTML = "<p>Your cart is empty.</p>";
  } else {
    cart.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return;
      total += product.price * item.quantity;
      const div = document.createElement("div");
      div.className = "cart-item";
      div.innerHTML = `
                <h3>${product.name}</h3>
                <p>Price: ₹${product.price}</p>
                <p>Stock: ${product.stock}</p>
                <label>Quantity: <input type="number" min="1" max="${product.stock}" value="${item.quantity}" data-product-id="${product.id}" class="cart-qty-input"></label>
                <button class="remove-cart-item" data-product-id="${product.id}">Remove</button>
            `;
      cartSection.appendChild(div);
    });
  }
  cartTotalDiv.innerHTML = `<h3>Total: ₹${total}</h3>`;
  // Quantity change listeners
  cartSection.querySelectorAll(".cart-qty-input").forEach((input) => {
    input.addEventListener("change", function () {
      const pid = parseInt(this.getAttribute("data-product-id"));
      let qty = parseInt(this.value);
      if (isNaN(qty) || qty < 1) qty = 1;
      const product = products.find((p) => p.id === pid);
      if (qty > product.stock) qty = product.stock;
      updateCartItem(pid, qty);
      renderCart();
    });
  });
  // Remove item listeners
  cartSection.querySelectorAll(".remove-cart-item").forEach((btn) => {
    btn.addEventListener("click", function () {
      const pid = parseInt(this.getAttribute("data-product-id"));
      removeFromCart(pid);
      renderCart();
    });
  });
  updateCartBadge();
}
function updateCartItem(productId, quantity) {
  let cart = getCart();
  const item = cart.find((i) => i.productId === productId);
  if (item) {
    item.quantity = quantity;
    if (item.quantity < 1) item.quantity = 1;
  }
  setCart(cart);
  updateCartBadge();
}
function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter((i) => i.productId !== productId);
  setCart(cart);
  updateCartBadge();
}

// --- Order Management ---
let pendingOrderDetails = null;
function showOrderDetailsModal() {
  document.getElementById("order-details-modal").style.display = "flex";
  document.getElementById("order-details-form").reset();
  document.getElementById("order-details-error").textContent = "";
}
function hideOrderDetailsModal() {
  document.getElementById("order-details-modal").style.display = "none";
}
function placeOrderWithDetails(details) {
  const user = getCurrentUser();
  if (!user || user.role !== "customer") return;
  const cart = getCart();
  if (!cart.length) return;
  const products = getProducts();
  let total = 0;
  const orderItems = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;
      total += product.price * item.quantity;
      return {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      };
    })
    .filter(Boolean);
  const order = {
    id: Date.now(),
    date: new Date().toISOString(), // Store as ISO string
    items: orderItems,
    total,
    ...details,
  };
  // Save order
  const orders = getOrders();
  orders.unshift(order);
  setOrders(orders);
  // Clear cart
  setCart([]);
  renderCart();
  updateCartBadge();
  showNotification("Order placed successfully!");
  hideOrderDetailsModal();
  renderOrders();
}
function getOrders() {
  const user = getCurrentUser();
  if (!user || user.role !== "customer") return [];
  return JSON.parse(localStorage.getItem("orders_" + user.username) || "[]");
}
function setOrders(orders) {
  const user = getCurrentUser();
  if (!user || user.role !== "customer") return;
  localStorage.setItem("orders_" + user.username, JSON.stringify(orders));
}
function placeOrder() {
  const user = getCurrentUser();
  if (!user || user.role !== "customer") return;
  const cart = getCart();
  if (!cart.length) return;
  const products = getProducts();
  let total = 0;
  const orderItems = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;
      total += product.price * item.quantity;
      return {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      };
    })
    .filter(Boolean);
  const order = {
    id: Date.now(),
    date: new Date().toLocaleString(),
    items: orderItems,
    total,
  };
  // Save order
  const orders = getOrders();
  orders.unshift(order);
  setOrders(orders);
  // Clear cart
  setCart([]);
  renderCart();
  alert("Order placed successfully!");
}
function renderOrders() {
  const user = getCurrentUser();
  const ordersSection = document.getElementById("orders-list");
  if (!user || user.role !== "customer") {
    ordersSection.innerHTML = "<p>Orders are only available for customers.</p>";
    return;
  }
  const orders = getOrders();
  if (!orders.length) {
    ordersSection.innerHTML = "<p>No orders found.</p>";
    return;
  }
  ordersSection.innerHTML = "";
  orders.forEach((order) => {
    // Calculate estimated delivery date
    let deliveryDays = 5;
    if (order.location && order.location.trim().toLowerCase() === "bangalore")
      deliveryDays = 3;
    const orderDate = new Date(order.date);
    let deliveryStr = "Unknown";
    if (!isNaN(orderDate)) {
      const deliveryDate = new Date(
        orderDate.getTime() + deliveryDays * 24 * 60 * 60 * 1000
      );
      deliveryStr = deliveryDate.toLocaleDateString();
    }
    const div = document.createElement("div");
    div.className = "order-card";
    div.innerHTML = `
            <h3>Order #${order.id}</h3>
            <p>Date: ${orderDate.toLocaleString()}</p>
            <ul>
                ${order.items
                  .map(
                    (item) =>
                      `<li>${item.name} (x${item.quantity}) - ₹${
                        item.price * item.quantity
                      }</li>`
                  )
                  .join("")}
            </ul>
            <strong>Total: ₹${order.total}</strong><br>
            <span style="display:inline-block;margin-top:0.5rem;padding:0.3rem 0.8rem;background:#e0e7ff;color:#388e3c;border-radius:6px;font-weight:600;">Will be delivered on: ${deliveryStr}</span>
        `;
    ordersSection.appendChild(div);
  });
}

// --- Admin Product Management ---
function renderAdminProductList() {
  const user = getCurrentUser();
  const adminList = document.getElementById("admin-product-list");
  if (!user || user.role !== "admin") {
    adminList.innerHTML = "<p>Admin access only.</p>";
    document.getElementById("add-product-section").style.display = "none";
    return;
  }
  document.getElementById("add-product-section").style.display = "";
  const products = getProducts();
  adminList.innerHTML = "";
  if (!products.length) {
    adminList.innerHTML = "<p>No products found.</p>";
    return;
  }
  products.forEach((product) => {
    const div = document.createElement("div");
    div.className = "product-card";
    div.innerHTML = `
            <h3>${product.name}</h3>
            <p>Category: ${product.category}</p>
            <p>Price: ₹${product.price}</p>
            <p>Stock: ${product.stock}</p>
            <button class="edit-product-btn" data-id="${product.id}">Edit</button>
            <button class="delete-product-btn" data-id="${product.id}">Delete</button>
        `;
    adminList.appendChild(div);
  });
  // Edit buttons
  adminList.querySelectorAll(".edit-product-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const id = parseInt(this.getAttribute("data-id"));
      showProductModal(id);
    });
  });
  // Delete buttons
  adminList.querySelectorAll(".delete-product-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const id = parseInt(this.getAttribute("data-id"));
      deleteProduct(id);
    });
  });
}
function addProduct(product) {
  const products = getProducts();
  product.id = products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1;
  // Ensure image and description fields
  if (!product.image) product.image = "";
  if (!product.description) product.description = "";
  products.push(product);
  setProducts(products);
  renderAdminProductList();
  renderProductList();
}
function updateProduct(productId, updatedProduct) {
  const products = getProducts();
  const idx = products.findIndex((p) => p.id === productId);
  if (idx !== -1) {
    products[idx] = { ...products[idx], ...updatedProduct, id: productId };
    setProducts(products);
    renderAdminProductList();
    renderProductList();
  }
}
function deleteProduct(productId) {
  let products = getProducts();
  products = products.filter((p) => p.id !== productId);
  setProducts(products);
  renderAdminProductList();
  renderProductList();
}
// --- Product Modal Logic ---
function showProductModal(productId) {
  const modal = document.getElementById("product-modal");
  const title = document.getElementById("product-modal-title");
  const form = document.getElementById("product-modal-form");
  const errorDiv = document.getElementById("product-modal-error");
  errorDiv.textContent = "";
  form.reset();
  if (productId) {
    // Edit
    title.textContent = "Edit Product";
    const products = getProducts();
    const product = products.find((p) => p.id === productId);
    if (product) {
      form.setAttribute("data-edit-id", productId);
      document.getElementById("modal-product-name").value = product.name;
      document.getElementById("modal-product-category").value =
        product.category;
      document.getElementById("modal-product-price").value = product.price;
      document.getElementById("modal-product-stock").value = product.stock;
      document.getElementById("modal-product-image").value =
        product.image || "";
      document.getElementById("modal-product-description").value =
        product.description || "";
    }
  } else {
    // Add
    title.textContent = "Add Product";
    form.removeAttribute("data-edit-id");
  }
  modal.style.display = "flex";
}
function hideProductModal() {
  document.getElementById("product-modal").style.display = "none";
}

// --- UI Helpers ---
function showError(message) {
  document.getElementById("auth-error").textContent = message;
}

// --- Event Listeners ---
document.addEventListener("DOMContentLoaded", function () {
  // Navigation buttons
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      showSection(btn.getAttribute("data-section"));
      if (btn.getAttribute("data-section") === "products-section") {
        renderProductList();
      }
    });
  });
  // Login/Register
  document.getElementById("login-btn").addEventListener("click", showAuthModal);
  document
    .getElementById("close-auth")
    .addEventListener("click", hideAuthModal);
  document.getElementById("logout-btn").addEventListener("click", logoutUser);
  // Auth modal tab switching
  document
    .getElementById("show-login-tab")
    .addEventListener("click", function (e) {
      e.preventDefault();
      showLoginTab();
    });
  document
    .getElementById("show-register-tab")
    .addEventListener("click", function (e) {
      e.preventDefault();
      showRegisterTab();
    });
  // Login form logic
  document
    .getElementById("login-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const username = document.getElementById("login-username").value.trim();
      const password = document.getElementById("login-password").value;
      const role = document.getElementById("login-role").value;
      loginUser(username, password, role);
    });
  // Register form logic
  document
    .getElementById("register-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const username = document
        .getElementById("register-username")
        .value.trim();
      const password = document.getElementById("register-password").value;
      const role = document.getElementById("register-role").value;
      registerUser(username, password, role);
    });
  // Search
  document.getElementById("search-btn").addEventListener("click", function () {
    const query = document.getElementById("search-input").value.trim();
    searchProducts(query);
  });
  document
    .getElementById("search-input")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        searchProducts(e.target.value.trim());
      }
    });
  // Default section
  showSection("products-section");
  updateNavBar();
  renderProductList();
  // Place Order button
  document
    .getElementById("place-order-btn")
    .addEventListener("click", function () {
      showOrderDetailsModal();
    });
  // Admin add product form
  const addProductForm = document.getElementById("add-product-form");
  if (addProductForm) {
    addProductForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = document.getElementById("product-name").value.trim();
      const category = document.getElementById("product-category").value.trim();
      const price = parseFloat(document.getElementById("product-price").value);
      const stock = parseInt(document.getElementById("product-stock").value);
      const image = document.getElementById("product-image").value.trim();
      const description = "";
      if (
        !name ||
        !category ||
        isNaN(price) ||
        isNaN(stock) ||
        price < 0 ||
        stock < 0
      )
        return;
      addProduct({ name, category, price, stock, image, description });
      addProductForm.reset();
    });
  }
  // Product modal logic
  document
    .getElementById("close-product-modal")
    .addEventListener("click", hideProductModal);
  document
    .getElementById("product-modal-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const name = document.getElementById("modal-product-name").value.trim();
      const category = document
        .getElementById("modal-product-category")
        .value.trim();
      const price = parseFloat(
        document.getElementById("modal-product-price").value
      );
      const stock = parseInt(
        document.getElementById("modal-product-stock").value
      );
      const image = document.getElementById("modal-product-image").value.trim();
      const description = "";
      const errorDiv = document.getElementById("product-modal-error");
      if (
        !name ||
        !category ||
        isNaN(price) ||
        isNaN(stock) ||
        price < 0 ||
        stock < 0
      ) {
        errorDiv.textContent = "Please enter valid product details.";
        return;
      }
      const editId = this.getAttribute("data-edit-id");
      if (editId) {
        updateProduct(parseInt(editId), {
          name,
          category,
          price,
          stock,
          image,
          description,
        });
      } else {
        addProduct({ name, category, price, stock, image, description });
      }
      hideProductModal();
    });
  // Order details modal logic
  document
    .getElementById("close-order-modal")
    .addEventListener("click", hideOrderDetailsModal);
  document
    .getElementById("order-details-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const name = document.getElementById("order-name").value.trim();
      const address = document.getElementById("order-address").value.trim();
      const location = document.getElementById("order-location").value.trim();
      const phone = document.getElementById("order-phone").value.trim();
      const payment = document.getElementById("order-payment").value;
      const errorDiv = document.getElementById("order-details-error");
      if (!name || !address || !location || !phone || !payment) {
        errorDiv.textContent = "Please fill in all fields.";
        return;
      }
      if (!/^\d{10}$/.test(phone)) {
        errorDiv.textContent = "Please enter a valid 10-digit phone number.";
        return;
      }
      placeOrderWithDetails({ name, address, location, phone, payment });
    });
});

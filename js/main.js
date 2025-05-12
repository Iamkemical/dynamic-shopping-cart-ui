document.addEventListener("DOMContentLoaded", async () => {
  const productListContainer = document.getElementById("product-list");

  try {
    const res = await fetch("data.json");
    if (!res.ok) {
      alert("Network response was not ok");
      throw new Error("Network response was not ok");
    }

    const products = await res.json();
    console.log(products);
    if (products) {
      products.forEach((product) => {
        const productListItem = document.createElement("div");
        productListItem.innerHTML = `
            <div class="product-card">
                <div>
                  <img
                    src="${product.image.desktop}"
                    alt="${product.name}"
                  />
                  <button class="cart-added" data-name="${
                    product.name
                  }" data-price="${product.price.toFixed(2)}">
                    <i class="fa-solid fa-cart-shopping"></i><span>Add to Cart</span>
                  </button>
                </div>
              </div>
              <h6>${product.category}</h6>
              <h5>${product.name}</h5>
              <span>$${product.price.toFixed(2)}</span>
            `;

        productListContainer.prepend(productListItem);
      });

      let count = 0;
      let quantity = 1;
      document.body.addEventListener("click", (event) => {
        const cartBtn = event.target.closest(".cart-added");
        console.log(cartBtn);
        if (cartBtn) {
          const name = cartBtn.dataset.name;
          const price = parseFloat(cartBtn.dataset.price);
          const cartItemsCount = document.querySelector(".cart-item-count");
          count += 1;
          cartItemsCount.textContent = `Your Cart (${count})`;

          const cartCard = document.getElementById("cart-card");
          const cartContent = document.querySelector(".cart-content");
          if (cartContent) {
            cartCard.removeChild(cartContent);
          }
          let itemExists = false;

          const existingCartItems =
            document.querySelectorAll(".product-cart-item");

          existingCartItems.forEach((cartItem) => {
            const h5 = cartItem.querySelector("h5:nth-of-type(1)");
            if (h5 && h5.textContent.trim() === name) {
              itemExists = true;
              const h5Elements = cartItem.querySelectorAll("h5");
              if (h5Elements.length >= 2) {
                const quantitySpan = h5Elements[1].querySelector("span");

                if (quantitySpan) {
                  const match = quantitySpan.textContent
                    .trim()
                    .match(/^(\d+)x$/);
                  if (match) {
                    quantity = parseInt(match[1], 10) + 1; // Increment quantity
                  }
                }

                const totalPrice = price * quantity;

                h5Elements[1].innerHTML = `<h5><span>${quantity}x</span> @ <span>$${price.toFixed(
                  2
                )}</span> <span>$${totalPrice.toFixed(2)}</span></h5>`;
              }
            }
          });

          // Only add a new item if it doesn't exist
          if (!itemExists) {
            const productCartItem = document.createElement("div");
            productCartItem.className = "product-cart-item";
            productCartItem.innerHTML = `
            <div>
                <h5>${name}</h5>
                <h5><span>1x</span> @ <span>$${price.toFixed(
                  2
                )}</span> <span>$${price.toFixed(2)}</span></h5>
            </div>
            <div>
                <img src="/assets/images/icon-remove-item.svg" class="remove-product" alt="" />
            </div>
          `;
            cartCard.prepend(productCartItem);

            const cartLine = document.createElement("div");
            cartLine.className = "cart-line";
            // Insert before summary section if it exists
            const summaryBlock =
              document.querySelector(".cart-order-total") ||
              document.querySelector(".carbon-neutral") ||
              document.querySelector(".order-btn");

            if (summaryBlock) {
              cartCard.insertBefore(productCartItem, summaryBlock);
              cartCard.insertBefore(cartLine, summaryBlock);
            } else {
              cartCard.append(cartLine);
              cartCard.append(productCartItem);
            }
          }

          // Update or create Order Total
          let cartOrderTotal = document.querySelector(".cart-order-total");
          const totalAmount = calculateCartTotal(); // Implement this to sum current cart items

          if (!cartOrderTotal) {
            cartOrderTotal = document.createElement("div");
            cartOrderTotal.className = "cart-order-total";
            cartCard.append(cartOrderTotal);
            const cartLine = document.createElement("div");
            cartLine.className = "cart-line";
            cartCard.insertBefore(cartLine, cartOrderTotal);
          }

          cartOrderTotal.innerHTML = `
                <h4>Order Total</h4>
                <h2>$${totalAmount.toFixed(2)}</h2>
            `;

          // Add carbon-neutral only once
          if (!document.querySelector(".carbon-neutral")) {
            const carbonNeutral = document.createElement("div");
            carbonNeutral.className = "carbon-neutral";
            carbonNeutral.innerHTML = `
    <img src="/assets/images/icon-carbon-neutral.svg" alt="" />
    <h5>This is a <span>carbon-neutral</span> delivery</h5>
  `;
            cartCard.append(carbonNeutral);
          }

          // Add confirm order button only once
          if (!document.querySelector(".order-btn")) {
            const orderBtn = document.createElement("div");
            orderBtn.className = "order-btn";
            orderBtn.innerHTML = `<button>Confirm Order</button>`;
            cartCard.append(orderBtn);
          }
        }
      });

      document.body.addEventListener("click", (event) => {
        const removeProductItem = event.target.closest(".remove-product");
        if (removeProductItem) {
          const productItem = removeProductItem.closest(".product-cart-item");
          const h5Elements = productItem.querySelectorAll("h5");
          let quantity = 0;
          if (h5Elements.length >= 2) {
            const quantitySpan = h5Elements[1].querySelector("span");

            if (quantitySpan) {
              const match = quantitySpan.textContent.trim().match(/^(\d+)x$/);
              if (match) {
                quantity = parseInt(match[1], 10); // Increment quantity
              }
            }
          }

          if (productItem) {
            const line = productItem.previousElementSibling; // assumes .cart-line is before the item
            if (line && line.classList.contains("cart-line")) {
              line.remove(); // remove the dividing line
            }
            productItem.remove(); // remove the product item
          }

          // Optionally update cart count and total
          count = Math.max(0, count - quantity);
          const cartItemsCount = document.querySelector(".cart-item-count");
          cartItemsCount.textContent = `Your Cart (${count})`;

          // Update the order total
          const totalAmount = calculateCartTotal();
          const cartOrderTotal = document.querySelector(".cart-order-total");
          if (cartOrderTotal) {
            cartOrderTotal.querySelector(
              "h2"
            ).textContent = `$${totalAmount.toFixed(2)}`;
          }

          // If no more items, remove summary blocks
          const remainingItems =
            document.querySelectorAll(".product-cart-item");
          if (remainingItems.length === 0) {
            document.querySelector(".cart-order-total")?.remove();
            document.querySelector(".carbon-neutral")?.remove();
            document.querySelector(".order-btn")?.remove();
            document.querySelector(".cart-line")?.remove();

            const cartCard = document.getElementById("cart-card");
            const cartContent = document.createElement("div");
            cartContent.className = "cart-content";
            cartContent.innerHTML = `
            <img src="/assets/images/illustration-empty-cart.svg" alt="" />
              <h5>Your added items will appear here</h5>
            `;
            cartCard.append(cartContent);
          }
        }
      });

      document.body.addEventListener("click", (event) => {
        if (event.target.closest(".order-btn")) {
          const existingCartItems =
            document.querySelectorAll(".product-cart-item");

          // Create overlay and modal container
          const modalOverlay = document.createElement("div");
          modalOverlay.className = "order-modal-overlay";

          const orderModal = document.createElement("div");
          orderModal.className = "order-modal";

          // Start modal content with header
          let modalContent = `
      <img src="/assets/images/icon-order-confirmed.svg" alt="" />
      <h3>Order Confirmed</h3>
      <h6>We hope you enjoy your food</h6>
      <div class="product-modal-card">
    `;

          let totalAmount = 0;

          existingCartItems.forEach((cartItem, index) => {
            const productName = cartItem
              .querySelector("h5:nth-of-type(1)")
              ?.textContent.trim();
            const priceInfo = cartItem.querySelector("h5:nth-of-type(2)");

            if (productName && priceInfo) {
              const spans = priceInfo.querySelectorAll("span");
              const quantityText = spans[0]?.textContent
                .replace("x", "")
                .trim();
              const unitPrice = parseFloat(
                spans[1]?.textContent.replace("$", "")
              );
              const totalPrice = parseFloat(
                spans[2]?.textContent.replace("$", "")
              );

              totalAmount += totalPrice;
              const product = products.find(
                (product) => product.name === productName
              );
              modalContent += `
          <div class="product-item">
            <div>
              <img src="${product.image.thumbnail}" alt="" />
              <div>
                <h5>${productName}</h5>
                <h5><span>${quantityText}x</span> @ $${unitPrice.toFixed(
                2
              )}</h5>
              </div>
            </div>
            <h5>$${totalPrice.toFixed(2)}</h5>
          </div>
        `;

              if (index !== existingCartItems.length - 1) {
                modalContent += `<div class="cart-line"></div>`;
              }
            }
          });

          // Add total and close modal button
          modalContent += `
      <div class="cart-line"></div>
      <div class="order-total-modal">
        <h5>Order Total</h5>
        <h3>$${totalAmount.toFixed(2)}</h3>
      </div>
      </div>
      <div>
        <button id="start-new-order">Start New Order</button>
      </div>
    `;

          orderModal.innerHTML = modalContent;
          modalOverlay.appendChild(orderModal);
          document.body.appendChild(modalOverlay);

          // Close modal on background click
          modalOverlay.addEventListener("click", (e) => {
            if (e.target === modalOverlay) {
              modalOverlay.remove();
            }
          });

          // Optional: reset cart on "Start New Order"
          orderModal
            .querySelector("#start-new-order")
            .addEventListener("click", () => {
              modalOverlay.remove();
              document
                .querySelectorAll(".product-cart-item")
                .forEach((item) => item.remove());
              document
                .querySelectorAll(".cart-line")
                .forEach((line) => line.remove());
              document.querySelector(".cart-order-total")?.remove();
              document.querySelector(".carbon-neutral")?.remove();
              document.querySelector(".order-btn")?.remove();

              const cartCard = document.getElementById("cart-card");
              const cartContent = document.createElement("div");
              cartContent.className = "cart-content";
              cartContent.innerHTML = `
        <img src="/assets/images/illustration-empty-cart.svg" alt="" />
        <h5>Your added items will appear here</h5>
      `;
              cartCard.append(cartContent);

              document.querySelector(
                ".cart-item-count"
              ).textContent = `Your Cart (0)`;
            });
        }
      });
    } else {
      alert("Failed to load products.");
    }
  } catch (error) {
    console.error(error);
    alert("Unable to load products");
  }
});

function calculateCartTotal() {
  const items = document.querySelectorAll(".product-cart-item");
  let total = 0;
  items.forEach((item) => {
    const h5s = item.querySelectorAll("h5");
    if (h5s.length >= 2) {
      const totalSpan = h5s[1].querySelectorAll("span")[2];
      if (totalSpan) {
        const value = parseFloat(totalSpan.textContent.replace("$", ""));
        total += isNaN(value) ? 0 : value;
      }
    }
  });
  return total;
}

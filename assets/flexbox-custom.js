    document.addEventListener("DOMContentLoaded", () => {

  let size = 6;
  let items = [];

  const slots = document.querySelector(".slots");
  const count = document.querySelector(".count");
  const totalEl = document.querySelector(".total");
  const cartBtn = document.querySelector(".cart-btn");

  const bundleBox = document.querySelector(".bundle-box");
  const toggleBtn = document.querySelector(".bundle-toggle");
  const isMobile = window.matchMedia("(max-width: 768px)");

  function setBundleBoxSpace() {
    if (!bundleBox) return;
    // If expanded with scrolling, offsetHeight still gives visible height, which is what we want.
    const h = bundleBox.offsetHeight;
    document.documentElement.style.setProperty("--bundle-box-h", h + "px");
  }
// for mobile view only
 function collapseBox() {
  if (!bundleBox) return;
  bundleBox.classList.add("collapsed");
  if (toggleBtn) {
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.setAttribute("aria-label", "Expand bundle box");
    toggleBtn.innerText = "▲";
  }
  setBundleBoxSpace();
}

function expandBox() {
  if (!bundleBox) return;
  bundleBox.classList.remove("collapsed");
  if (toggleBtn) {
    toggleBtn.setAttribute("aria-expanded", "true");
    toggleBtn.setAttribute("aria-label", "Collapse bundle box");
    toggleBtn.innerText = "▼";
  }
  setBundleBoxSpace();
}


  function toggleBox() {
    if (!bundleBox) return;
    if (bundleBox.classList.contains("collapsed")) expandBox();
    else collapseBox();
  }

  function renderSlots() {
    if (!slots) return;

    slots.innerHTML = "";

    for (let i = 0; i < size; i++) {
      const slot = document.createElement("div");
      console.log("slot", slot);
      console.log("i", i);
      slot.className = "slot";

      if (items[i]) {
        slot.classList.add("filled");
        slot.innerHTML = `
          <button class="remove" type="button" data-index="${i}">×</button>
          <img src="${items[i].image}" alt="">
        `;
      } else {
        slot.innerHTML = `<span class="plus">+</span>`;
      }

      slots.appendChild(slot);
    }

    if (count) count.innerText = `${items.length} item(s)`;

    const total = items.reduce((s, i) => s + i.price, 0);
    if (totalEl) totalEl.innerText = "₹" + (total / 100).toFixed(2);

    if (cartBtn) {
      if (items.length === size) {
        cartBtn.disabled = false;
        cartBtn.classList.remove("disabled");
        cartBtn.innerText = "Add to cart";
      } else {
        cartBtn.disabled = true;
        cartBtn.classList.add("disabled");
        cartBtn.innerText = `Add ${size - items.length} more`;
      }
    }

    // Height changes based on content; keep spacing accurate on mobile.
    setBundleBoxSpace();
  }

  // Size switching
  document.querySelectorAll(".size").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".size").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      size = parseInt(btn.dataset.size, 10);
      items = [];
      renderSlots();
console.log("size", size);
      // Keep collapsed on mobile when switching sizes (cleaner)
      if (isMobile.matches) collapseBox();
    });
  });

  // Add buttons
  document.querySelectorAll(".add-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (items.length >= size) return;

      // Auto-expand on mobile when user starts building
      if (isMobile.matches && bundleBox && bundleBox.classList.contains("collapsed")) {
        expandBox();
      }

      const card = btn.closest(".cookie-card");
      if (!card) return;

      const imgEl = card.querySelector("img");
      items.push({
        id: card.dataset.id,
        price: parseInt(card.dataset.price, 10),
        image: imgEl ? imgEl.src : ""
      });

      renderSlots();
    });
  });

  // Remove item (event delegation)
  document.addEventListener("click", e => {
    const t = e.target;
    if (t && t.classList && t.classList.contains("remove")) {
      const idx = parseInt(t.dataset.index, 10);
      if (!Number.isNaN(idx)) {
        items.splice(idx, 1);
        renderSlots();
      }
    }
  });

  // Clear
  const clearBtn = document.querySelector(".clear");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      items = [];
      renderSlots();
      if (isMobile.matches) collapseBox();
    });
  }

  // Toggle
  if (toggleBtn) toggleBtn.addEventListener("click", toggleBox);

  // Default state based on breakpoint
  function applyBreakpointState() {
    if (isMobile.matches) collapseBox();
    else expandBox();
  }

  // Initial
  renderSlots();
  applyBreakpointState();
  setBundleBoxSpace();

  // Keep spacing correct on resize
  window.addEventListener("resize", () => {
    // Don’t force collapse/expand on every resize, only recalc space
    setBundleBoxSpace();
  });

  // Breakpoint changes
  if (isMobile.addEventListener) {
    isMobile.addEventListener("change", applyBreakpointState);
  }

  // Add to cart
  if (cartBtn) {
    cartBtn.addEventListener("click", async () => {
      if (items.length !== size) return;

      cartBtn.innerText = "Adding...";
      cartBtn.disabled = true;

      await fetch('/cart/add.js', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          items: items.map(i => ({
            id:i.id,
            quantity:1,
            properties:{ Flexbox:'Make Your Own Flex Box' }
          }))
        })
      });

      window.location.href = "/cart";
    });
  }

});
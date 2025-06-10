let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

actualizarContadorCarrito();
mostrarProductosEnCarrito();
actualizarTotal();

function agregarAlCarrito(productoNuevo) {
    // Buscamos un producto igual (mismo id y talle)
    const productoExistente = carrito.find(p => p.id === productoNuevo.id);

    if (productoExistente) {
        // Si existe, aumentamos la cantidad
        productoExistente.cantidad = (productoExistente.cantidad || 1) + (productoNuevo.cantidad || 1);
    } else {
        // Si no existe, agregamos producto con cantidad por defecto 1 si no tiene
        productoNuevo.cantidad = productoNuevo.cantidad || 1;
        carrito.push(productoNuevo);
    }

    guardarYActualizar();
}

function actualizarContadorCarrito() {
    const contador = document.querySelector(".cart-count");
    if (contador) {
        contador.textContent = carrito.length;
    }
}

function mostrarProductosEnCarrito() {
    const listaCarrito = document.querySelector('.cart-items');
    if (!listaCarrito) return;
    listaCarrito.innerHTML = ''; 

    carrito.forEach(producto => {
        const li = document.createElement('li');
        li.classList.add('cart-item');

        li.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" class="cart-img">
            <div class="cart-item-info">
                <span>${producto.nombre} - ${producto.talle || ''}</span>
                <span>$${producto.precio.toLocaleString()}</span>
                <div class="cart-controls">
                    <button class="cart-btn btn-restar">➖</button>
                    <span class="cart-qty">${producto.cantidad || 1}</span>
                    <button class="cart-btn btn-sumar">➕</button>
                    <button class="delete-btn">❌</button>
                </div>
            </div>
        `;

        listaCarrito.appendChild(li);

        // Botones controlar cantidad y eliminar
        const btnSumar = li.querySelector('.btn-sumar');
        const btnRestar = li.querySelector('.btn-restar');
        const btnEliminar = li.querySelector('.delete-btn');

        btnSumar.addEventListener('click', () => {
            producto.cantidad = (producto.cantidad || 1) + 1;
            guardarYActualizar();
        });

        btnRestar.addEventListener('click', () => {
            if ((producto.cantidad || 1) > 1) {
                producto.cantidad--;
                guardarYActualizar();
            }
        });

        btnEliminar.addEventListener('click', () => {
            eliminarDelCarrito(producto.id);
        });
    });
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(producto => producto.id !== id);
    guardarYActualizar();
}

function vaciarCarrito() {
    carrito = [];
    guardarYActualizar();
}

function actualizarTotal() {
    const totalElem = document.getElementById('cart-total');
    if (!totalElem) return;
    let total = 0;
    carrito.forEach(producto => {
        const cantidad = producto.cantidad || 1;
        total += producto.precio * cantidad;
    });
    totalElem.textContent = total.toLocaleString();
}

function guardarYActualizar() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContadorCarrito();
    mostrarProductosEnCarrito();
    actualizarTotal();
}

// Enlazar botón vaciar carrito
const emptyCartBtn = document.querySelector('#emptyCart');
if (emptyCartBtn) {
    emptyCartBtn.addEventListener('click', e => {
        e.preventDefault();
        vaciarCarrito();
    });
}

function finalizarCompra() {
    if (carrito.length === 0) {
        alert("El carrito está vacío. Agregá al menos un producto antes de finalizar la compra.");
        return;
    }
    window.location.href = '../ticket/tickets.html';
}

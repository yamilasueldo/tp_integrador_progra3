class CarritoModelo {
    carrito;

    constructor() {
        const carritoStr = localStorage.getItem("carrito");
        try {
            this.carrito = carritoStr ? JSON.parse(carritoStr) : [];
            if (!Array.isArray(this.carrito)) {
                // Si el parseo no resulta en un array válido, inicializar vacío
                this.carrito = [];
            }
        } catch (e) {
        // Si da error en el parseo, asignar array vacío
        this.carrito = [];
        }
    }
}

class CarritoVista {
    constructor() {
        this.btnEmptyCart = this.$("emptyCart");
        this.btnFinalizarCompra = this.$("btnFinalizarCompra");
    }

    $(id){
        return document.getElementById(id);
    }

    createHtmlElement(carrito) {
        const listaCarrito = document.getElementById('cart-items');
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
                        <button class="cart-btn btnRestar" data-id="${producto.id}">➖</button>
                        <span class="cart-qty">${producto.cantidad || 1}</span>
                        <button class="cart-btn btnSumar" data-id="${producto.id}">➕</button>
                        <button class="btnDelete" data-id="${producto.id}">❌</button>
                    </div>
                </div>
            `;
            
            listaCarrito.appendChild(li);
        });
    }
}

class CarritoControl {
    Vista;
    Modelo;

    constructor(p_vista, p_modelo) {
        this.Modelo = p_modelo;
        this.Vista = p_vista;

        this.guardarYActualizar();
        
        if(this.Vista.btnEmptyCart)
        this.Vista.btnEmptyCart.addEventListener('click', () => {
            this.vaciarCarrito();
        });

        if(this.Vista.btnFinalizarCompra)
        this.Vista.btnFinalizarCompra.addEventListener('click', () => {
            this.finalizarCompra();
        });

        const listaCarrito = document.getElementById('cart-items');
        if (listaCarrito) {
            listaCarrito.addEventListener('click', (e) => {
                const target = e.target;
                const id = parseInt(target.dataset.id);
                if (isNaN(id)) return;

                const producto = this.Modelo.carrito.find(p => p.id === id);
                if (!producto) return;

                if (target.classList.contains('btnSumar')) {
                    producto.cantidad = (producto.cantidad || 1) + 1;
                    this.guardarYActualizar();
                }

                if (target.classList.contains('btnRestar')) {
                    if ((producto.cantidad || 1) > 1) {
                        producto.cantidad--;
                        this.guardarYActualizar();
                    }
                }

                if (target.classList.contains('btnDelete')) {
                    this.eliminarDelCarrito(id);
                }
            });
        }
    }

    agregarAlCarrito(productoNuevo) {
        const productoExistente = this.Modelo.carrito.find(p => p.id === productoNuevo.id);

        if (productoExistente) {
            productoExistente.cantidad = (productoExistente.cantidad || 1) + (productoNuevo.cantidad || 1);
        } else {
            productoNuevo.cantidad = productoNuevo.cantidad || 1;
            this.Modelo.carrito.push(productoNuevo);
        }

        this.guardarYActualizar();
    }

    guardarYActualizar() {
        localStorage.setItem("carrito", JSON.stringify(this.Modelo.carrito));

        this.actualizarContadorCarrito();
        this.Vista.createHtmlElement(this.Modelo.carrito);
        this.actualizarTotal();
    }

    actualizarContadorCarrito() {
        const contador = document.querySelector(".cart-count");
        if (contador) {
            const totalItems = this.Modelo.carrito.reduce((acc, prod) => acc + (prod.cantidad || 1), 0);
            contador.textContent = totalItems;
        }
    }

    eliminarDelCarrito(id) {
        this.Modelo.carrito = this.Modelo.carrito.filter(producto => producto.id !== id);
        this.guardarYActualizar();
    }
    
    vaciarCarrito() {
        this.Modelo.carrito = [];
        this.guardarYActualizar();
    }

    actualizarTotal() {
        const totalElem = document.getElementById('cart-total');
        if (!totalElem) return;
        let total = 0;
        this.Modelo.carrito.forEach(producto => {
            const cantidad = producto.cantidad || 1;
            total += producto.precio * cantidad;
        });
        totalElem.textContent = total.toLocaleString();
    }

    async finalizarCompra() {
        if (this.Modelo.carrito.length === 0) {
            alert("El carrito está vacío. Agregá al menos un producto antes de finalizar la compra.");
            return;
        }

        const confirmacion = confirm("¿Querés confirmar la compra?");

        if (!confirmacion) {
            return;
        }

        try {
            await this.guardarVenta();
            window.location.href = '../ticket/tickets.html';
        } catch (error) {
            console.error("Error al guardar la venta:", error);
            return;
        }
    }

    async guardarVenta() {
        const nombreUsuario = localStorage.getItem("nombreUsuario") || "Invitado";
        const productos = this.Modelo.carrito;
        const total = productos.reduce((sum, prod) => sum + (prod.precio * (prod.cantidad || 1)), 0);
        const fecha = new Date().toISOString();

        const venta = {
            usuario: nombreUsuario,
            productos,
            total,
            fecha
        };

        const ventas = JSON.parse(localStorage.getItem("ventas")) || [];
        ventas.push(venta);
        localStorage.setItem("ventas", JSON.stringify(ventas));

        // const respuesta = await fetch("/api/ventas", {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json"
        //     },
        //     body: JSON.stringify(venta)
        // });

        // if (!respuesta.ok) {
        //     throw new Error("Error al guardar la venta.");
        // }
    }
}

var modelo = new CarritoModelo();
var vista = new CarritoVista();
var control = new CarritoControl(vista, modelo);

export { control as carritoControl };
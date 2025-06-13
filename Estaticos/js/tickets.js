// document.addEventListener("DOMContentLoaded", () => {
//     const nombreUsuario = localStorage.getItem("nombreUsuario") || "Invitado";
//     const saludo = document.querySelector(".ticket-container h2");
//     if (saludo) {
//         saludo.textContent = `Hola, ${nombreUsuario}`;
//     }

//     const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
//     const tbody = document.querySelector(".ticket-table tbody");
//     const totalElem = document.querySelector(".ticket-price h3");

//     tbody.innerHTML = ""; // limpiar contenido actual

//     let total = 0;

//     carrito.forEach(producto => {
//         const cantidad = producto.cantidad || 1;
//         const subtotal = producto.precio * cantidad;
//         total += subtotal;

//         const fila = document.createElement("tr");
//         fila.innerHTML = `
//             <td>${producto.nombre}</td>
//             <td>$${producto.precio.toLocaleString()}</td>
//             <td>${cantidad}</td>
//             <td>$${subtotal.toLocaleString()}</td>
//         `;
//         tbody.appendChild(fila);
//     });

//     totalElem.textContent = `Total de la compra: $${total.toLocaleString()}`;

//     // Si querés, también podés limpiar el carrito después de mostrarlo
//     localStorage.removeItem("carrito");
// });

class ModeloTickets {
    nombreUsuario;
    carrito;

    constructor() {
        this.nombreUsuario = localStorage.getItem("nombreUsuario") || "Invitado";
        this.carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    }
}

class VistaTickets {
    constructor() {
        this.textSaludo = document.querySelector(".ticket-container h2");
        this.tbody = document.querySelector(".ticket-table tbody");
        this.totalElem = document.querySelector(".ticket-price h3");
    }

    createSaludo(nombreUsuario) {
        if (this.textSaludo) {
            this.textSaludo.textContent = `Hola, ${nombreUsuario}`;
        }
    }

    createProductos(carrito) {
        if (!this.tbody) return;

        this.tbody.innerHTML = "";
        carrito.forEach(producto => {
            const cantidad = producto.cantidad || 1;
            const subtotal = producto.precio * cantidad;

            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${producto.nombre}</td>
                <td>$${producto.precio.toLocaleString()}</td>
                <td>${cantidad}</td>
                <td>$${subtotal.toLocaleString()}</td>
            `;
            this.tbody.appendChild(fila);
        });
    }

    createTotal(total) {
        if (this.totalElem) {
            this.totalElem.textContent = `Total de la compra: $${total.toLocaleString()}`;
        }
    }

    createFechaActual() {
        const fechaElem = document.querySelector(".ticket-date");

        if (fechaElem) {
            const fechaActual = new Date().toLocaleDateString();
            fechaElem.textContent = `Fecha de compra: ${fechaActual}`;
        }
    }
}

class ControlTickets {
    constructor(modelo, vista) {
        this.modelo = modelo;
        this.vista = vista;
    }

    calcularTotal() {
        return this.modelo.carrito.reduce((total, producto) => {
            const cantidad = producto.cantidad || 1;
            return total + producto.precio * cantidad;
        }, 0);
    }

    limpiarCarrito() {
        localStorage.removeItem("carrito");
    }

    iniciar() {
        this.vista.createSaludo(this.modelo.nombreUsuario);
        this.vista.createFechaActual();
        this.vista.createProductos(this.modelo.carrito);

        const total = this.calcularTotal();
        this.vista.createTotal(total);

        this.limpiarCarrito();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const modelo = new ModeloTickets();
    const vista = new VistaTickets();
    const control = new ControlTickets(modelo, vista);

    control.iniciar();
});
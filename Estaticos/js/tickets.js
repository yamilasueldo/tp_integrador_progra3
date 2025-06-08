document.addEventListener("DOMContentLoaded", () => {
    const nombreUsuario = localStorage.getItem("nombreUsuario") || "Invitado";
    const saludo = document.querySelector(".ticket-container h2");
    if (saludo) {
        saludo.textContent = `Hola, ${nombreUsuario}`;
    }

    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const tbody = document.querySelector(".ticket-table tbody");
    const totalElem = document.querySelector(".ticket-price h3");

    tbody.innerHTML = ""; // limpiar contenido actual

    let total = 0;

    carrito.forEach(producto => {
        const cantidad = producto.cantidad || 1;
        const subtotal = producto.precio * cantidad;
        total += subtotal;

        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${producto.nombre}</td>
            <td>$${producto.precio.toLocaleString()}</td>
            <td>${cantidad}</td>
            <td>$${subtotal.toLocaleString()}</td>
        `;
        tbody.appendChild(fila);
    });

    totalElem.textContent = `Total de la compra: $${total.toLocaleString()}`;

    // Si querés, también podés limpiar el carrito después de mostrarlo
    localStorage.removeItem("carrito");
});
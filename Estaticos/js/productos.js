fetch("../../Estaticos/js/productos.json")
    .then(res => res.json())
    .then(productos => {
        mostrarProductos(productos);
        window.productos = productos;
    });

function mostrarProductos(lista) {
    const contenedor = document.querySelector(".section.grid-auto-fill");
    contenedor.innerHTML = "";

    lista.forEach(producto => {
        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
            <div class="card-image">
                <img src="${producto.imagen}" alt="">
            </div>
            <div class="card-info flow">
                <h3 class="card-title">${producto.nombre}</h3>
                <ul class="tag-list" role="list">
                    <li>${producto.categoria}</li>
                </ul>
            </div>
            <div class="button-container">
                <p class="card-price">$${producto.precio}</p>
                <button id="btnAgregar" class="button">Agregar</button>
            </div>
        `;

        contenedor.appendChild(card);

        const botonAgregar = card.querySelector("#btnAgregar");
        botonAgregar.addEventListener("click", () => {
            agregarAlCarrito(producto);
        });
    });
}

function filterProducts(categoria) {
    const filtrados = categoria === "all"
        ? window.productos
        : window.productos.filter(p => p.categoria === categoria);
    mostrarProductos(filtrados);
}
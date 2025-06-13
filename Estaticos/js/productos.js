import { Producto } from './producto.js'

class Modelo {
    Productos;

    constructor() {}
}

class Vista {
    ProductosContainer;

    constructor() {
        this.SeccionPrincipal = {
            divProductos: this.$("productos-container"),
            btnAnterior: this.$("anterior"),
            btnSiguiente: this.$("siguiente") 
        }
    }

    $(id){
        return document.getElementById(id);
    }
}

class Control {
    Vista;
    Modelo;

    constructor(p_vista, p_modelo) {
        this.Modelo = p_modelo;
        this.Vista = p_vista;
        this.filtroActual = "all"; 

        this.cargaInicial();

        document.getElementById("filtro-todos").addEventListener("click", () => {
            this.filterProducts("all");
        });

        document.getElementById("filtro-ropa").addEventListener("click", () => {
            this.filterProducts("ropa");
        });

        document.getElementById("filtro-accesorios").addEventListener("click", () => {
            this.filterProducts("accesorios");
        });
    }

    cargaInicial() {
        this.Vista.SeccionPrincipal.divProductos.innerHTML = "";

        fetch("../../../Estaticos/js/productos.json")
        .then(res => res.json())
        .then(data => {
            let productos = data
            .filter(productoData => productoData.estado === true)
            .map(productoData => {
                return new Producto(
                    productoData.id,
                    productoData.nombre,
                    productoData.categoria,
                    productoData.precio,
                    productoData.imagen,
                    productoData.cantidad,
                    productoData.estado
                );
            })
            this.Modelo.Productos = productos;
            this.actualizarVistaProductos(productos);
        })
        .catch(error => {
            console.error("Error al cargar los productos:", error);
        })
        .finally(() => {
            console.log("Promesa finalizada");
        });
    }

    actualizarVistaProductos(lista) {
        this.Vista.SeccionPrincipal.divProductos.innerHTML = "";

        lista.forEach(producto => {
            const htmlElement = producto.createHtmlElement(this);
            this.Vista.SeccionPrincipal.divProductos.appendChild(htmlElement);
        });
    }

    filterProducts(categoria) {
        this.filtroActual = categoria;
        let productos = this.Modelo.Productos;

        const filtrados = categoria === "all"
            ? productos.filter(p => p.estado === true)
            : productos.filter(p => p.categoria === categoria);

        this.actualizarVistaProductos(filtrados);
    }

    refrescarProductos() {
        this.filterProducts(this.filtroActual);
    }
}

var modelo = new Modelo();
var vista = new Vista();
var control = new Control(vista, modelo);
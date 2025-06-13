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
        this.paginaActual = 1;
        this.productosPorPagina = 4;

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

        this.Vista.SeccionPrincipal.btnAnterior.addEventListener("click", () => {
            if (this.paginaActual > 1) {
                this.paginaActual--;
                const filtrados = this.obtenerProductosFiltrados();
                this.actualizarVistaProductos(filtrados);
            }
        });
        
        this.Vista.SeccionPrincipal.btnSiguiente.addEventListener("click", () => {
            const filtrados = this.obtenerProductosFiltrados();
            const maxPaginas = Math.ceil(filtrados.length / this.productosPorPagina);
            if (this.paginaActual < maxPaginas) {
                this.paginaActual++;
                this.actualizarVistaProductos(filtrados);
            }
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

        const inicio = (this.paginaActual - 1) * this.productosPorPagina;
        const fin = inicio + this.productosPorPagina;
        const productosPagina = lista.slice(inicio, fin);

        productosPagina.forEach(producto => {
            const htmlElement = producto.createHtmlElement(this);
            this.Vista.SeccionPrincipal.divProductos.appendChild(htmlElement);
        });

        this.Vista.SeccionPrincipal.btnAnterior.style.display = this.paginaActual === 1 ? 'none' : 'inline-block';
        this.Vista.SeccionPrincipal.btnSiguiente.style.display = fin >= lista.length ? 'none' : 'inline-block';
    }

    obtenerProductosFiltrados() {
        let productos = this.Modelo.Productos;
        return this.filtroActual === "all"
            ? productos.filter(p => p.estado === true)
            : productos.filter(p => p.categoria === this.filtroActual);
    }

    filterProducts(categoria) {
        this.filtroActual = categoria;
        this.paginaActual = 1;
        const filtrados = this.obtenerProductosFiltrados();
        this.actualizarVistaProductos(filtrados);
    }

    refrescarProductos() {
        const filtrados = this.obtenerProductosFiltrados();
        this.actualizarVistaProductos(filtrados);
    }
}

var modelo = new Modelo();
var vista = new Vista();
var control = new Control(vista, modelo);
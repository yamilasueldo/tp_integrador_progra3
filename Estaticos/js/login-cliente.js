class Modelo {
    Nombre;

    constructor() {}
}

class Vista {
    FormCliente;

    constructor() {
        this.FormCliente = {
            txtNombre: this.$("txtNombre"),
            btnIngresar: this.$("btnIngresar"), 
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

        this.Vista.FormCliente.btnIngresar.addEventListener("click", () => {
            this.procesarLogin();
        });

        this.Vista.FormCliente.txtNombre.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                this.procesarLogin();
            }
        });
    }

    procesarLogin = () => {
        const nombre = this.Vista.FormCliente.txtNombre.value.trim();

        if (nombre === "") {
            alert("Por favor, ingresá tu nombre.");
        } else {
            localStorage.setItem("nombreUsuario", nombre);
            window.location.href = "../home/index.html";
        }
    }
}

var modelo = new Modelo();
var vista = new Vista();
var control = new Control(vista, modelo);
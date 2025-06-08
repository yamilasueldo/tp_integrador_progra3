document.addEventListener("DOMContentLoaded", () => {
    const boton = document.getElementById("btnContinuar");
    const input = document.getElementById("username");

    boton.addEventListener("click", () => {
        const nombre = input.value.trim();

        if (nombre === "") {
            alert("Por favor, ingresá tu nombre.");
        } else {
            // Guardar si querés reutilizar el nombre
            localStorage.setItem("nombreUsuario", nombre);
            // Redirigir a la siguiente página
            window.location.href = "home_cliente.html";
        }

        localStorage.setItem("nombreUsuario", nombre);
    });
});
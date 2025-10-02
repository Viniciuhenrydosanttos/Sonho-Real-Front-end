document.addEventListener("DOMContentLoaded", function () {
    const inputCidade = document.getElementById("filtroCidade");
    const btnBuscar = document.getElementById("btnBuscar");

    btnBuscar.addEventListener("click", function () {
        let cidade = inputCidade.value.trim().toLowerCase();

        if (!cidade) {
            alert("Digite uma cidade para buscar.");
            return;
        }

        // Normaliza acentos e espaços para a URL
        cidade = cidade.normalize("NFD")
                       .replace(/[\u0300-\u036f]/g, "")
                       .replace(/\s+/g, "-");

        // Redireciona para imoveis.html com a cidade na URL
        window.location.href = `imoveis.html?cidade=${cidade}`;
    });
});

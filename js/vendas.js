document.addEventListener("DOMContentLoaded", () => {
  // ===== Elementos principais =====
  const uploadInput = document.getElementById("fileInput"); // id correto
  const preview = document.getElementById("preview");
  const placeholderText = document.getElementById("placeholderText");
  const btnPublicar = document.querySelector(".btn-publicar");

  let base64String = "";
  const TAMANHO_MAXIMO_MB = 2;
  const TAMANHO_MAXIMO_BYTES = TAMANHO_MAXIMO_MB * 1024 * 1024;

  // ===== 1️⃣ Preview da imagem e conversão para Base64 =====
  if (uploadInput) {
    uploadInput.addEventListener("change", function (event) {
      const file = event.target.files[0];
      if (!file) return;

      if (file.size > TAMANHO_MAXIMO_BYTES) {
        alert(`A imagem é muito grande! Limite: ${TAMANHO_MAXIMO_MB}MB.`);
        preview.src = "";
        uploadInput.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = function () {
        base64String = reader.result;
        preview.src = base64String;
        preview.style.display = "block";
        if (placeholderText) placeholderText.style.display = "none";
      };
      reader.readAsDataURL(file);
    });
  }

  // ===== 2️⃣ Função publicar =====
  window.publicar = async function() {
    if (!base64String) {
      alert("Escolha uma imagem primeiro!");
      return;
    }

    try {
      const nome_casa = document.querySelector(".editavel")?.innerText.trim() || "";
      const preco = parseFloat(document.getElementById("preco")?.value || "0") || 0;
      const rua = document.getElementById("rua")?.value || "";
      const bairro = document.getElementById("bairro")?.value || "";
      const numero = document.getElementById("numero")?.value || "";
      const cidade = document.getElementById("cidade")?.value || "";
      const estado = document.getElementById("estado")?.value || "";
      const area_total = parseInt(document.getElementById("areaAte")?.value || "0", 10);
      const quartos = document.querySelectorAll(".quantity-btns button.ativo")?.length || 0;
      const banheiros = parseInt(document.getElementById("banheiros")?.value || "0", 10);
      const vagas_garagem = parseInt(document.getElementById("vagas")?.value || "0", 10);
      const disponibilidade = document.getElementById("disponibilidade")?.value || "Disponível";

      const imovel = {
        nome_casa,
        tipo_moradia: "Apartamento",
        finalidade: "Venda",
        preco,
        rua,
        bairro,
        numero,
        cidade,
        estado,
        area_total,
        quartos,
        banheiros,
        vagas_garagem,
        disponibilidade,
        foto: base64String
      };

      const response = await fetch("http://192.168.1.4:3000/imovel/cadastrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(imovel)
      });

      if (!response.ok) throw new Error("Erro ao cadastrar imóvel");
      const data = await response.json();

      alert("✅ Imóvel cadastrado com sucesso!");
      console.log("Resposta:", data);

      // Limpa formulário
      base64String = "";
      preview.src = "";
      uploadInput.value = "";
      if (placeholderText) placeholderText.style.display = "block";

    } catch (err) {
      console.error(err);
      alert("❌ Erro ao cadastrar imóvel. Veja o console.");
    }
  };

  window.toggleAtivo = function(btn) { btn.classList.toggle("ativo"); }

  window.toggleSection = function(header) {
    const section = header.parentElement;
    const tags = section.querySelector(".tags");
    const toggleIcon = header.querySelector(".toggle");
    if (tags.style.display === "none" || tags.style.display === "") {
      tags.style.display = "flex";
      toggleIcon.textContent = "▼";
    } else {
      tags.style.display = "none";
      toggleIcon.textContent = "▲";
    }
  };
});

  document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://192.168.1.44:3000"; // <— seu backend

    const uploadInput = document.getElementById("fileInput");
    const preview = document.getElementById("preview");
    const placeholderText = document.getElementById("placeholderText");
    const modalEditar = document.getElementById("modalEditar");
    const formEditar = document.getElementById("formEditar");

    const TAMANHO_MAXIMO_MB = 20; 
const TAMANHO_MAXIMO_BYTES = TAMANHO_MAXIMO_MB * 2080 * 2080;


    const filtroCidade = document.getElementById("filtroCidade");
    const filtroTipo = document.getElementById("filtroTipo");
    const filtroFinalidade = document.getElementById("filtroFinalidade");
    const filtroPrecoMin = document.getElementById("filtroPrecoMin");
    const filtroPrecoMax = document.getElementById("filtroPrecoMax");
    const btnFiltrar = document.getElementById("btnFiltrar");

    let arquivoSelecionado = null;
    let base64String = ""; // ✅ variável global para Base64

    // =============================
    // 1️⃣ Upload e Preview
    // =============================
    if (uploadInput) {
      uploadInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > TAMANHO_MAXIMO_BYTES) {
          alert(`A imagem é muito grande! Limite: ${TAMANHO_MAXIMO_MB}MB.`);
          preview.style.display = "none";
          uploadInput.value = "";
          arquivoSelecionado = null;
          base64String = "";
          return;
        }

        arquivoSelecionado = file;

        const reader = new FileReader();
        reader.onload = () => {
          preview.src = reader.result;
          preview.style.display = "block";
          if (placeholderText) placeholderText.style.display = "none";
          base64String = reader.result.split(",")[1]; // só a parte Base64
        };
        reader.readAsDataURL(file);
      });
    }

    // =============================
    // 2️⃣ Publicar Imóvel
    // =============================
    window.publicar = async function () {
      if (!base64String) {
        alert("Escolha uma imagem primeiro!");
        return;
      }

      const foto = {
        nome: uploadInput.files[0].name,
        mimetype: uploadInput.files[0].type,
        data: base64String,
      };

      // 🔹 Primeiro envia a foto
      try {
        const response = await fetch(`${"http://192.168.1.44:3000"}/fotos_casa`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(foto),
        });

        if (!response.ok) throw new Error("Erro ao enviar foto");

        console.log("📸 Foto enviada com sucesso");
      } catch (error) {
        console.error("❌ Erro no envio da foto:", error.message);
        alert("Falha ao enviar foto. Tente novamente.");
        return;
      }

      // 🔹 Depois envia o imóvel
      const nome_casa = document.querySelector(".titulo")?.innerText.trim() || "";
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

      const tipo_moradia = document.getElementById("tipo_moradia")?.value || "Apartamento";
      const finalidade = document.getElementById("finalidade")?.value || "Venda";
      const disponibilidade = document.getElementById("disponibilidade")?.value || "Disponível";

      if (!nome_casa || !rua || !preco || !cidade || !estado) {
        alert("Preencha todos os campos obrigatórios!");
        return;
      }

      const camposCheckbox = [
        "brinquedoteca","churrasqueira","espaco_gourmet","piscina","playground","salao_festas","salao_jogos",
        "ar_condicionado","armarios_planejados","elevador","hidromassagem","jardim","lareira","mobilidade",
        "quintal","sauna","varanda"
      ];

      const imovelCheckbox = {};
      camposCheckbox.forEach(name => {
        const el = document.querySelector(`[name="${name}"]`);
        imovelCheckbox[name] = el?.checked ? "Sim" : "Não";
      });

      const imovel = {
        nome_casa,
        tipo_moradia,
        finalidade,
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
        foto: base64String,
        ...imovelCheckbox
      };

      try {
        const response = await fetch(`${API_URL}/imovel/cadastrar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(imovel),
        });

        if (!response.ok) throw new Error("Erro ao cadastrar imóvel");

        alert("✅ Imóvel cadastrado com sucesso!");

        // Resetar formulário
        base64String = "";
        preview.style.display = "none";
        uploadInput.value = "";
        if (placeholderText) placeholderText.style.display = "block";
        document.querySelectorAll("input, select").forEach(el => (el.value = ""));
      } catch (err) {
        console.error(err);
        alert("❌ Erro ao cadastrar imóvel. Veja o console.");
      }
    };

    // =============================
    // 3️⃣ Carregar Imóveis
    // =============================
    async function carregarImoveis(filtros = {}) {
      try {
        const query = new URLSearchParams(filtros).toString();
        const response = await fetch(`${API_URL}/imoveis?${query}`);
        if (!response.ok) throw new Error("Erro ao buscar imóveis");
        const imoveis = await response.json();

        const container = document.getElementById("cardContainer");
        container.innerHTML = "";

        for (const imovel of imoveis) {
          let imgUrl = "https://via.placeholder.com/600x400?text=Sem+Imagem";
          try {
            const resImg = await fetch(`${API_URL}/fotos_casa?id_imovel=${imovel.id_imovel}`);
            if (resImg.ok) {
              const fotos = await resImg.json();
              if (fotos.length > 0) imgUrl = `data:${fotos[0].mimetype};base64,${fotos[0].data}`;
            }
          } catch (erro) {
            console.error("Erro ao carregar imagem:", erro);
          }

          const card = document.createElement("div");
          card.classList.add("card-imovel");
          card.innerHTML = `
            <img src="${imgUrl}" alt="Imagem do imóvel" class="foto-imovel" style="width:100%; height:auto; object-fit:cover;" />
            <div class="card-content">
              <h3>${imovel.nome_casa}</h3>
              <p><strong>${imovel.tipo_moradia}</strong> - ${imovel.finalidade}</p>
              <p>${imovel.cidade} - ${imovel.estado}</p>
              <p><strong>R$ ${parseFloat(imovel.preco || 0).toLocaleString("pt-BR")}</strong></p>
              <p>${imovel.area_total || 0} m² • ${imovel.quartos || 0}Q • ${imovel.banheiros || 0}B • ${imovel.vagas_garagem || 0}V</p>
            </div>
            <div class="card-actions">
              <button class="btn-editar" onclick="abrirModalEditar(${imovel.id_imovel})">✏️ Editar</button>
              <button class="btn-excluir" onclick="excluirImovel(${imovel.id_imovel})">🗑️ Excluir</button>
            </div>
          `;
          container.appendChild(card);
        }
      } catch (error) {
        console.error("Erro ao carregar imóveis:", error);
      }
    }
    carregarImoveis();

    // =============================
    // 4️⃣ Filtro
    // =============================
    if (btnFiltrar) {
      btnFiltrar.addEventListener("click", () => {
        const filtros = {
          cidade: filtroCidade.value || undefined,
          tipo_moradia: filtroTipo.value || undefined,
          finalidade: filtroFinalidade.value || undefined,
          preco_minimo: filtroPrecoMin.value || undefined,
          preco_maximo: filtroPrecoMax.value || undefined,
        };
        carregarImoveis(filtros);
      });
    }

    // =============================
    // 5️⃣ CRUD Restante
    // =============================
    window.excluirImovel = async (id) => {
      if (!confirm("Deseja realmente excluir este imóvel?")) return;
      try {
        const res = await fetch(`${API_URL}/imovel/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Erro ao excluir imóvel");
        alert("🗑️ Imóvel excluído com sucesso!");
        carregarImoveis();
      } catch (err) {
        console.error(err);
        alert("❌ Falha ao excluir imóvel.");
      }
    };

    window.abrirModalEditar = async (id) => {
      try {
        const res = await fetch(`${API_URL}/imovel/${id}`);
        if (!res.ok) throw new Error("Erro ao buscar imóvel");
        const imovel = await res.json();
        Object.keys(imovel).forEach((key) => {
          const input = formEditar.querySelector(`[name="${key}"]`);
          if (input) input.value = imovel[key] ?? "";
        });
        formEditar.dataset.id = id;
        modalEditar.showModal();
      } catch (err) {
        console.error(err);
        alert("❌ Falha ao abrir modal de edição.");
      }
    };

    formEditar.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = formEditar.dataset.id;
      const formData = Object.fromEntries(new FormData(formEditar));
      const dados = {
        nome_casa: formData.nome_casa || "",
        tipo_moradia: formData.tipo_moradia || "Apartamento",
        finalidade: formData.finalidade || "Venda",
        preco: parseFloat(formData.preco) || 0,
        rua: formData.rua || "",
        bairro: formData.bairro || "",
        numero: formData.numero || "",
        cidade: formData.cidade || "",
        estado: formData.estado || "",
        descricao: formData.descricao || "",
        area_total: parseInt(formData.area_total) || 0,
        quartos: parseInt(formData.quartos) || 0,
        banheiros: parseInt(formData.banheiros) || 0,
        vagas_garagem: parseInt(formData.vagas_garagem) || 0,
        disponibilidade: formData.disponibilidade || "Disponível"
      };
      try {
        const response = await fetch(`${API_URL}/imovel/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dados),
        });
        if (!response.ok) throw new Error("Erro ao atualizar imóvel");
        alert("✅ Imóvel atualizado com sucesso!");
        modalEditar.close();
        carregarImoveis();
      } catch (err) {
        console.error(err);
        alert("❌ Falha ao atualizar imóvel.");
      }
    });
  });
// =============================
// 6️⃣ Funções de UI (abrir/fechar seções e ativar botões)
// =============================
window.toggleSection = function (header) {
  const section = header.closest(".filter-section");
  const tags = section.querySelector(".tags");
  const toggle = header.querySelector(".toggle");

  // Alterna a visibilidade das tags
  tags.classList.toggle("aberto");

  // Alterna o ícone de seta
  if (tags.classList.contains("aberto")) {
    toggle.textContent = "▲";
  } else {
    toggle.textContent = "▼";
  }
};

// Alternar botão ativo
window.toggleAtivo = function (button) {
  button.classList.toggle("ativo");
};

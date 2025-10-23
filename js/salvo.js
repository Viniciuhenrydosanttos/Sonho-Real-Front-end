function toggleSection(el) {
  const parent = el.parentElement;
  parent.classList.toggle("expanded");
}

function abrirModalTipo() {
  document.getElementById("modalTipo").classList.remove("hidden");
}

function fecharModalTipo() {
  document.getElementById("modalTipo").classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", () => {

  const estadoSelect = document.getElementById("estado");
  const cidadeSelect = document.getElementById("cidade");
  const localizacaoInput = document.querySelector('[placeholder="Digite bairro, rua ou cidade"]');
  const tipoBotoes = document.querySelectorAll(".types button, .tipo-card");
  const precoMin = document.querySelector('[placeholder="Mínimo"]');
  const precoMax = document.querySelector('[placeholder="Máximo"]');
  const quartosBotoes = document.querySelectorAll(".quantity-btns button");
  const cardsContainer = document.querySelector(".results");
  const resultCount = document.querySelector(".result-count");
  const btnFiltrar = document.querySelector(".btn-filtrar");

  let filtros = {
    estado: "",
    cidade: "",
    rua: "",
    bairro: "",
    numero: "",
    tipo_moradia: "",
    preco_minimo: "",
    preco_maximo: "",
    quartos: "",
    area_total: "",
    banheiros: "",
    vagas_garagem: "",
    disponibilidade: ""
  };

  // ---------------------------
  estadoSelect.addEventListener("change", () => {
    filtros.estado = estadoSelect.value;
    filtros.cidade = "";
    cidadeSelect.innerHTML = '<option value="">Selecione uma cidade</option>';
    cidadeSelect.disabled = !filtros.estado;
  });

  cidadeSelect.addEventListener("change", () => {
    filtros.cidade = cidadeSelect.value;
  });

  localizacaoInput.addEventListener("input", () => {
    filtros.localizacao = localizacaoInput.value;
  });

  tipoBotoes.forEach(btn => {
    btn.addEventListener("click", () => {
      btn.parentElement.querySelectorAll("button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      filtros.tipo_moradia = btn.textContent;
    });
  });

  precoMin.addEventListener("input", () => {
    filtros.preco_minimo = precoMin.value;
  });

  precoMax.addEventListener("input", () => {
    filtros.preco_maximo = precoMax.value;
  });

  quartosBotoes.forEach(btn => {
    btn.addEventListener("click", () => {
      btn.parentElement.querySelectorAll("button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      filtros.quartos = btn.textContent.replace("+", "");
    });
  });

  async function fetchImoveis() {
    try {
      const params = new URLSearchParams();

      for (const key in filtros) {
        if (filtros[key]) params.append(key, filtros[key]);
      }

      // Busca os imóveis
      const res = await fetch(`http://192.168.1.14:3000/imoveis?${params.toString()}`);
      if (!res.ok) throw new Error("Falha ao conectar ao servidor");

      const imoveis = await res.json();

      // Para cada imóvel, busca suas fotos (em Base64)
      const imoveisComFotos = await Promise.all(imoveis.map(async (imovel) => {
        try {
          const resImg = await fetch(`http://192.168.1.14:3000/fotos_casa?id_imovel=${imovel.id_imovel}`);
          const fotos = resImg.ok ? await resImg.json() : [];
          const imgUrl = fotos.length > 0 
            ? `data:${fotos[0].mimetype};base64,${fotos[0].data}` 
            : 'https://via.placeholder.com/300x200';
          return { ...imovel, imagem: imgUrl, fotos };
        } catch {
          return { ...imovel, imagem: 'https://via.placeholder.com/300x200', fotos: [] };
        }
      }));

      renderCards(imoveisComFotos);

    } catch (err) {
      console.error("Erro ao buscar imóveis:", err);
      cardsContainer.innerHTML = "<p>Erro ao carregar imóveis</p>";
      resultCount.textContent = "0 imóveis encontrados";
    }
  }

  
  function renderCards(imoveis) {
    if (!imoveis.length) {
      cardsContainer.innerHTML = "<p>Nenhum imóvel encontrado</p>";
      resultCount.textContent = "0 imóveis encontrados";
      return;
    }

    const html = imoveis.map(imovel => `
      <div class="card">
        <img src="${imovel.imagem}" alt="Imagem do imóvel" />
        <div class="info">
          <h3>${imovel.nome_casa || "Imóvel"} - ${imovel.rua || ""}, ${imovel.bairro || ""}</h3>
          <p>${imovel.tipo_moradia || ""} · ${imovel.area_total || 0}m² · ${imovel.quartos || 0} quartos · ${imovel.banheiros || 0} banheiros · ${imovel.vagas_garagem || 0} vagas</p>
          <p>Finalidade: ${imovel.finalidade || "Não informado"}</p>
          <strong>R$ ${Number(imovel.preco || 0).toLocaleString('pt-BR')}</strong>
          <p>Disponível: ${imovel.disponibilidade ? 'Sim' : 'Não'}</p>
          <button>Contatar</button>
        </div>
      </div>
    `).join("");

    cardsContainer.innerHTML = html;
    resultCount.textContent = `${imoveis.length} imóveis encontrados`;
  }

  // ============================================================
  // 🔹 Filtrar ao clicar
  btnFiltrar.addEventListener("click", fetchImoveis);

  // 🔹 Carregar cidades do IBGE
  const cidades = document.querySelector('#cidade');
  cidades.addEventListener('click', async () => {
    const estado = document.querySelector('#estado').value;
    if (!estado) {
      alert("Selecione um estado primeiro!");
      return;
    }

    try {
      const resposta = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios`
      );

      if (!resposta.ok) throw new Error("Erro ao buscar cidades");

      const dados = await resposta.json();
      cidades.innerHTML = '<option value="">Selecione uma cidade</option>';
      dados.forEach(cidade => {
        cidades.innerHTML += `<option value="${cidade.nome}">${cidade.nome}</option>`;
      });

    } catch (erro) {
      console.error("Erro ao carregar cidades:", erro);
      cidades.innerHTML = '<option value="">Erro ao carregar cidades</option>';
    }
  });

  // 🔹 Chama o GET automaticamente ao carregar
  fetchImoveis();
});

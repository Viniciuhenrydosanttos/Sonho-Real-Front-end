// Funções de modal e seções expansíveis
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
    // Limpa cidade ao trocar estado
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

      const res = await fetch(`/imoveis?${params.toString()}`);
      const data = await res.json();

      renderCards(data);
    } catch (err) {
      console.error("Erro ao buscar imóveis:", error);
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
        <img src="${imovel.imagem || 'https://via.placeholder.com/300x200'}" alt="Imagem do imóvel" />
        <div class="info">
          <h3>${imovel.nome_casa} - ${imovel.rua}, ${imovel.bairro}</h3>
          <p>${imovel.tipo_moradia} · ${imovel.area_total}m² · ${imovel.quartos} quartos · ${imovel.banheiros} banheiros · ${imovel.vagas_garagem} vagas</p>
          <p>Finalidade: ${imovel.finalidade}</p>
          <strong>R$ ${Number(imovel.preco).toLocaleString('pt-BR')}</strong>
          <p>Disponível: ${imovel.disponibilidade ? 'Sim' : 'Não'}</p>
          <button>Contatar</button>
        </div>
      </div>
    `).join("");

    cardsContainer.innerHTML = html;
    resultCount.textContent = `${imoveis.length} imóveis encontrados`;
  }

  
  btnFiltrar.addEventListener("click", fetchImoveis);

  
  fetchImoveis();
});
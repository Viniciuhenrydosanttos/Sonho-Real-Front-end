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
document.addEventListener('DOMContentLoaded', () => {
  const estadoSelect = document.getElementById('estado');
  const cidadeSelect = document.getElementById('cidade');

  estadoSelect.addEventListener('change', async () => {
    const uf = estadoSelect.value;
    cidadeSelect.innerHTML = '<option>Carregando...</option>';
    cidadeSelect.disabled = true;

    if (!uf) {
      cidadeSelect.innerHTML = '<option>Selecione um estado primeiro</option>';
      return;
    }

    try {
      const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
      const cidades = await res.json();

      cidadeSelect.innerHTML = cidades
        .map(c => `<option value="${c.id}">${c.nome}</option>`)
        .join('');
      cidadeSelect.disabled = false;
    } catch (err) {
      cidadeSelect.innerHTML = '<option>Erro ao carregar cidades</option>';
      console.error(err);
    }
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const estadoSelect = document.getElementById("estado");
  const cidadeSelect = document.getElementById("cidade");
  const localizacaoInput = document.querySelector('[placeholder="Digite bairro, rua ou cidade"]');
  const tipoBotoes = document.querySelectorAll(".types button, .tipo-card");
  const precoMin = document.querySelector('[placeholder="Mínimo"]');
  const precoMax = document.querySelector('[placeholder="Máximo"]');
  const quartosBotoes = document.querySelectorAll(".quantity-btns button");
  const cards = document.querySelectorAll(".card");
  const resultCount = document.querySelector(".result-count");

  let filtros = {
    estado: "",
    cidade: "",
    localizacao: "",
    tipo: "",
    precoMin: "",
    precoMax: "",
    quartos: ""
  };

  // Estado → Cidade (exemplo simples)
  estadoSelect.addEventListener("change", () => {
    filtros.estado = estadoSelect.value;
    // Aqui você carregaria as cidades reais via API ou objeto local
    cidadeSelect.disabled = !filtros.estado;
    cidadeSelect.innerHTML = filtros.estado
      ? `<option value="">Selecione a cidade</option>
         <option value="Fortaleza">Fortaleza</option>
         <option value="Curitiba">Curitiba</option>`
      : `<option value="">Selecione um estado primeiro</option>`;
    filtrar();
  });

  cidadeSelect.addEventListener("change", () => {
    filtros.cidade = cidadeSelect.value;
    filtrar();
  });

  localizacaoInput.addEventListener("input", () => {
    filtros.localizacao = localizacaoInput.value.toLowerCase();
    filtrar();
  });

  tipoBotoes.forEach(btn => {
    btn.addEventListener("click", () => {
      filtros.tipo = btn.textContent.toLowerCase();
      filtrar();
    });
  });

  precoMin.addEventListener("input", () => {
    filtros.precoMin = parseFloat(precoMin.value) || "";
    filtrar();
  });

  precoMax.addEventListener("input", () => {
    filtros.precoMax = parseFloat(precoMax.value) || "";
    filtrar();
  });

  quartosBotoes.forEach(btn => {
    btn.addEventListener("click", () => {
      filtros.quartos = parseInt(btn.textContent.replace("+", "")) || "";
      filtrar();
    });
  });

  function filtrar() {
    let total = 0;

    cards.forEach(card => {
      const titulo = card.querySelector("h3").textContent.toLowerCase();
      const descricao = card.querySelector("p").textContent.toLowerCase();
      const preco = parseFloat(card.querySelector("strong").textContent.replace(/[^\d]/g, ""));
      
      let mostrar = true;

      if (filtros.estado && !titulo.includes(`/${filtros.estado.toLowerCase()}`)) mostrar = false;
      if (filtros.cidade && !titulo.includes(filtros.cidade.toLowerCase())) mostrar = false;
      if (filtros.localizacao && !titulo.includes(filtros.localizacao) && !descricao.includes(filtros.localizacao)) mostrar = false;
      if (filtros.tipo && !descricao.includes(filtros.tipo) && !titulo.includes(filtros.tipo)) mostrar = false;
      if (filtros.precoMin && preco < filtros.precoMin) mostrar = false;
      if (filtros.precoMax && preco > filtros.precoMax) mostrar = false;
      if (filtros.quartos && !descricao.includes(`${filtros.quartos} quarto`)) mostrar = false;

      card.style.display = mostrar ? "flex" : "none";
      if (mostrar) total++;
    });

    resultCount.textContent = `${total} imóveis encontrados`;
  }

  filtrar();
});

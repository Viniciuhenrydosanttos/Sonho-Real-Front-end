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
  // Estado e cidades
  estadoSelect.addEventListener("change", async () => {
    filtros.estado = estadoSelect.value;
    filtros.cidade = "";
    cidadeSelect.innerHTML = '<option value="">Selecione uma cidade</option>';
    cidadeSelect.disabled = !filtros.estado;

    if (!filtros.estado) return;

    try {
      const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${filtros.estado}/municipios`);
      const dados = await res.json();
      cidadeSelect.innerHTML = '<option value="">Selecione uma cidade</option>';
      dados.forEach(c => {
        cidadeSelect.innerHTML += `<option value="${c.nome}">${c.nome}</option>`;
      });
    } catch (err) {
      console.error("Erro ao carregar cidades:", err);
      cidadeSelect.innerHTML = '<option value="">Erro ao carregar cidades</option>';
    }
  });

  cidadeSelect.addEventListener("change", () => {
    filtros.cidade = cidadeSelect.value;
  });

  // Localização (bairro/rua)
  localizacaoInput.addEventListener("input", () => {
    filtros.bairro = localizacaoInput.value; // enviar para o campo correto do banco
  });

  // Tipo de moradia
  tipoBotoes.forEach(btn => {
    btn.addEventListener("click", () => {
      btn.parentElement.querySelectorAll("button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      filtros.tipo_moradia = btn.textContent.trim();
    });
  });

  // Preço
  precoMin.addEventListener("input", () => {
    filtros.preco_minimo = precoMin.value ? Number(precoMin.value) : "";
  });
  precoMax.addEventListener("input", () => {
    filtros.preco_maximo = precoMax.value ? Number(precoMax.value) : "";
  });

  // Quartos
  quartosBotoes.forEach(btn => {
    btn.addEventListener("click", () => {
      btn.parentElement.querySelectorAll("button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      filtros.quartos = btn.textContent.replace("+","").trim();
    });
  });

  // ---------------------------
  async function fetchImoveis() {
    try {
      const params = new URLSearchParams();
      for (const key in filtros) {
        if (filtros[key] != null && filtros[key] !== "") {
          params.append(key, filtros[key]);
        }
      }

      console.log("Filtros enviados:", filtros); // debug

      const res = await fetch(`http://192.168.1.14:3000/imoveis?${params.toString()}`);
      if (!res.ok) throw new Error("Falha ao conectar ao servidor");

      const imoveis = await res.json();

      const imoveisComFotos = await Promise.all(imoveis.map(async imovel => {
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
          <h3>${imovel.nome_casa || "Imóvel"} - ${imovel.rua || ""}, ${imovel.numero || ""} - ${imovel.bairro || ""} - ${imovel.cidade || ""}/${imovel.estado || ""}</h3>
          <p>
            Tipo: ${imovel.tipo_moradia || "Não informado"}<br>
            Finalidade: ${imovel.finalidade || "Não informado"}<br>
            Preço: R$ ${Number(imovel.preco || 0).toLocaleString('pt-BR')}<br>
            Área: ${imovel.area_total || 0} m²<br>
            Quartos: ${imovel.quartos || 0}<br>
            Banheiros: ${imovel.banheiros || 0}<br>
            Vagas: ${imovel.vagas_garagem || 0}<br>
            Disponível: ${imovel.disponibilidade ? 'Sim' : 'Não'}
          </p>
          <button>Contatar</button>
        </div>
      </div>
    `).join("");

    cardsContainer.innerHTML = html;
    resultCount.textContent = `${imoveis.length} imóveis encontrados`;
  }

  // ---------------------------
  btnFiltrar.addEventListener("click", fetchImoveis);

  // 🔹 Chama o GET automaticamente ao carregar
  fetchImoveis();
});

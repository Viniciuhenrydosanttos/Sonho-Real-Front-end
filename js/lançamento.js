document.addEventListener("DOMContentLoaded", () => {
  const imoveis = [
    {
      titulo: "Casa Compacta",
      local: "Zona Leste - SP",
      preco: "R$ 220.000",
      descricao: "Casa ideal para família pequena, bem localizada.",
      imagens: [
        "https://picsum.photos/600/400?1",
        "https://picsum.photos/600/400?11",
        "https://picsum.photos/600/400?12"
      ]
    },
    {
      titulo: "Sobrado Aconchegante",
      local: "Belo Horizonte - MG",
      preco: "R$ 310.000",
      descricao: "Sobrado espaçoso, próximo ao centro.",
      imagens: [
        "https://picsum.photos/600/400?2",
        "https://picsum.photos/600/400?21",
        "https://picsum.photos/600/400?22"
      ]
    },
    {
      titulo: "Apartamento Central",
      local: "Curitiba - PR",
      preco: "R$ 180.000",
      descricao: "Apartamento prático no coração da cidade.",
      imagens: [
        "https://picsum.photos/600/400?3",
        "https://picsum.photos/600/400?31",
        "https://picsum.photos/600/400?32"
      ]
    },
    {
      titulo: "Casa Moderna",
      local: "Salvador - BA",
      preco: "R$ 250.000",
      descricao: "Casa moderna com design sofisticado.",
      imagens: [
        "https://picsum.photos/600/400?4",
        "https://picsum.photos/600/400?41",
        "https://picsum.photos/600/400?42"
      ]
    }
  ];

  const container = document.getElementById("imoveis-descobrir");

  imoveis.forEach((imovel, index) => {
    const card = document.createElement("div");
    card.classList.add("card-imovel");
    card.innerHTML = `
      <img src="${imovel.imagens[0]}" alt="${imovel.titulo}">
      <div class="card-body">
        <h3>${imovel.titulo}</h3>
        <p>${imovel.local}</p>
        <div class="preco">${imovel.preco}</div>
        <a href="#" class="btn-ver" data-index="${index}">Ver Imóvel</a>
      </div>
    `;
    container.appendChild(card);
  });

  // Modal
  const modal = document.getElementById("modal-imovel");
  const modalImg = document.getElementById("modal-img");
  const modalTitulo = document.getElementById("modal-titulo");
  const modalLocal = document.getElementById("modal-local");
  const modalPreco = document.getElementById("modal-preco");
  const modalDesc = document.getElementById("modal-desc");
  const closeBtn = document.querySelector(".modal .close");

  let currentIndex = 0;
  let currentImovel = null;

  document.querySelectorAll(".btn-ver").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const index = btn.getAttribute("data-index");
      currentImovel = imoveis[index];
      currentIndex = 0;
      atualizarModal();
      modal.classList.add("show");
    });
  });

  function atualizarModal() {
    modalImg.src = currentImovel.imagens[currentIndex];
    modalTitulo.textContent = currentImovel.titulo;
    modalLocal.textContent = currentImovel.local;
    modalPreco.textContent = currentImovel.preco;
    modalDesc.textContent = currentImovel.descricao;
  }

  // Navegação carrossel
  document.querySelector(".carousel .prev").addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + currentImovel.imagens.length) % currentImovel.imagens.length;
    atualizarModal();
  });

  document.querySelector(".carousel .next").addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % currentImovel.imagens.length;
    atualizarModal();
  });

  closeBtn.addEventListener("click", () => modal.classList.remove("show"));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("show");
  });
});

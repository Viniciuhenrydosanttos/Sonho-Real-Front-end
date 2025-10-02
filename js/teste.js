document.addEventListener("DOMContentLoaded", () => {
  const loginModal = document.getElementById("loginModal");
  const btnLogin = document.getElementById("btn-login");
  const btnClose = document.createElement("button");

  btnClose.textContent = "✕";
  btnClose.style.position = "absolute";
  btnClose.style.top = "10px";
  btnClose.style.right = "10px";
  btnClose.style.background = "transparent";
  btnClose.style.border = "none";
  btnClose.style.fontSize = "18px";
  btnClose.style.cursor = "pointer";

  // adiciona botão de fechar dentro do modal
  loginModal.querySelector(".login-container").appendChild(btnClose);

  btnLogin.addEventListener("click", () => {
    loginModal.showModal();
  });

  btnClose.addEventListener("click", () => {
    loginModal.close();
  });
});
const btnSignup = document.getElementById("btn-signup");
const signupModal = document.getElementById("signupModal");

// abrir modal
btnSignup.addEventListener("click", () => {
  signupModal.showModal();
});

// fechar clicando fora
signupModal.addEventListener("click", (e) => {
  const rect = signupModal.getBoundingClientRect();
  if (
    e.clientX < rect.left ||
    e.clientX > rect.right ||
    e.clientY < rect.top ||
    e.clientY > rect.bottom
  ) {
    signupModal.close();
  }
});
const toggleBtn = document.getElementById("toggleBtn");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const welcomeTitle = document.getElementById("welcomeTitle");
const welcomeText = document.getElementById("welcomeText");

let isRegister = false;

toggleBtn.addEventListener("click", () => {
  isRegister = !isRegister;

  if (isRegister) {
    loginForm.classList.remove("active");
    registerForm.classList.add("active");
    welcomeTitle.textContent = "Hello, Friend!";
    welcomeText.textContent = "Enter your personal details and start your journey with us";
    toggleBtn.textContent = "LOGIN";
  } else {
    registerForm.classList.remove("active");
    loginForm.classList.add("active");
    welcomeTitle.textContent = "Welcome";
    welcomeText.textContent = "Join Our Unique Platform, Explore a New Experience";
    toggleBtn.textContent = "REGISTER";
  }
});
const searchInput = document.querySelector('.search input[type="search"]');
const typeSelect = document.querySelector('.search select');
const searchButton = document.querySelector('.search .go');
const gridList = document.querySelector('.grid-list');

// Função para buscar imóveis do backend
async function fetchImoveis() {
  try {
    const res = await fetch('http://192.168.1.46:3000/imoveis'); // ajuste a URL do seu backend
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Erro ao buscar imóveis:', err);
    return [];
  }
}

// Função para renderizar imóveis na grid
function renderImoveis(imoveis) {
  gridList.innerHTML = ''; // limpa a grid

  if (imoveis.length === 0) {
    gridList.innerHTML = '<p style="color:var(--muted)">Nenhum imóvel encontrado.</p>';
    return;
  }

  imoveis.forEach(imovel => {
    const article = document.createElement('article');
    article.className = 'listing';
    article.setAttribute('role', 'listitem');

    article.innerHTML = `
      <img src="${imovel.img}" alt="${imovel.titulo}">
      <div class="info">
        <div>
          <div style="font-weight:700">${imovel.titulo}</div>
          <div class="meta">${imovel.quartos} • ${imovel.area || ''}</div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
          <div class="price">${imovel.preco}</div>
          <button 
            class="btn btn-primary open-hotel" 
            style="padding:8px 12px;border-radius:10px"
            data-title="${imovel.titulo}"
            data-price="${imovel.preco}"
            data-location="${imovel.local}"
            data-rooms="${imovel.quartos} • ${imovel.area || ''}"
            data-desc="${imovel.descricao}"
            data-img="${imovel.img}"
          >Ver</button>
        </div>
      </div>
    `;

    gridList.appendChild(article);
  });
}

// Função de filtro
async function filterImoveis() {
  const query = searchInput.value.toLowerCase();
  const type = typeSelect.value.toLowerCase();
  const imoveis = await fetchImoveis();

  const filtered = imoveis.filter(imovel => {
    const matchesType = type === 'todos os tipos' || imovel.tipo.toLowerCase() === type;
    const matchesQuery = !query || imovel.titulo.toLowerCase().includes(query) || imovel.local.toLowerCase().includes(query);
    return matchesType && matchesQuery;
  });

  renderImoveis(filtered);
}

// Eventos
searchButton.addEventListener('click', filterImoveis);
searchInput.addEventListener('keyup', e => {
  if (e.key === 'Enter') filterImoveis();
});

// Carregar todos os imóveis ao iniciar
filterImoveis();
    
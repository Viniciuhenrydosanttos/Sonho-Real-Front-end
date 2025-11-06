document.addEventListener("DOMContentLoaded", async () => {
  const perfilContainer = document.getElementById("perfilContainer");

  // Verifica se o usuário está logado
  const userData = JSON.parse(localStorage.getItem("userData"));
  if (!userData) {
    perfilContainer.innerHTML = `<p style="text-align:center;">Você precisa estar logado para acessar o perfil.</p>`;
    return;
  }

  // Busca dados do usuário no backend
  try {
    const res = await fetch(`http://192.168.1.44:3000/people/${userData.id}`);
    if (!res.ok) throw new Error("Erro ao buscar perfil");
    const usuario = await res.json();

    // Busca imóveis do usuário (se tiver)
    const resImoveis = await fetch(`http://192.168.1.44:3000/imoveis?dono=${usuario.id}`);
    const meusImoveis = resImoveis.ok ? await resImoveis.json() : [];

    perfilContainer.innerHTML = `
      <div class="perfil-wrapper">
        <div class="perfil-header">
          <img src="https://i.pravatar.cc/150?u=${usuario.email}" alt="Foto do usuário">
          <div>
            <h2>${usuario.email.split("@")[0]}</h2>
            <div class="perfil-info">
              <p><strong>Email:</strong> ${usuario.email}</p>
              <p><strong>Função:</strong> ${usuario.funcao}</p>
            </div>
            <div class="btns-perfil">
              <button class="btn editar">Editar Perfil</button>
              <button class="btn sair">Sair</button>
            </div>
          </div>
        </div>

        <section class="meus-imoveis">
          <h3>Meus Imóveis</h3>
          <div class="grid-imoveis">
            ${
              meusImoveis.length
                ? meusImoveis.map(imovel => `
                  <div class="card-imovel">
                    <img src="img/padrao.jpg" alt="${imovel.nome_casa}">
                    <div class="card-content">
                      <h4>${imovel.nome_casa}</h4>
                      <p>${imovel.cidade}</p>
                      <p><strong>R$ ${Number(imovel.preco).toLocaleString("pt-BR")}</strong></p>
                    </div>
                  </div>`).join("")
                : "<p style='grid-column:1/-1;color:#777;'>Nenhum imóvel cadastrado.</p>"
            }
          </div>
        </section>
      </div>
    `;

    document.querySelector(".btn.sair").addEventListener("click", () => {
      localStorage.removeItem("userData");
      window.location.href = "index.html";
    });
  } catch (err) {
    console.error(err);
    perfilContainer.innerHTML = `<p>Erro ao carregar perfil.</p>`;
  }
});

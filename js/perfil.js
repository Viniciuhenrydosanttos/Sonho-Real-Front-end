document.addEventListener("DOMContentLoaded", async () => {
  const userId = localStorage.getItem("userId");

  // if (!userId) {
  //   alert("Usuário não logado!");
  //   window.location.href = "homepage.html";
  //   return;
  // }

  try {
    // Pega dados do usuário
    const resUser = await fetch(`https://backrender-o56j.onrender.com/user/${userId}`);
    const user = await resUser.json();

    document.getElementById("nome").value = user.nome || "";
    document.getElementById("email").value = user.email || "";

    // Pega favoritos
    const resFav = await fetch(`https://backrender-o56j.onrender.com/favorites/${userId}`);
    const favoritos = await resFav.json();

    const lista = document.querySelector(".lista-favoritos");
    lista.innerHTML = "";

    if (favoritos.length === 0) {
      lista.innerHTML = "<p>Você ainda não favoritou nenhum imóvel.</p>";
    } else {
      favoritos.forEach((imovel) => {
        const div = document.createElement("div");
        div.classList.add("imovel");
        div.innerHTML = `
          <img src="${imovel.imagem}" alt="${imovel.titulo}">
          <div class="imovel-info">
            <h3>${imovel.titulo}</h3>
            <p>R$ ${imovel.preco.toLocaleString("pt-BR")}</p>
          </div>
        `;
        lista.appendChild(div);
      });
    }
  } catch (error) {
    console.error("Erro ao carregar perfil:", error);
  }
});

// Atualizar nome/senha
document.getElementById("formPerfil").addEventListener("submit", async (e) => {
  e.preventDefault();

  const userId = localStorage.getItem("userId");
  const nome = document.getElementById("nome").value;
  const senha = document.getElementById("senha").value;

  try {
    const res = await fetch(`https://backrender-o56j.onrender.com/user/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, senha }),
    });

    const msg = await res.text();
    alert(msg);
    if (res.ok) location.reload();
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
  }
});

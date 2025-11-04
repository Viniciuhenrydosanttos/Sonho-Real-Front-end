// adim.js
document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("fileInput");
  const preview = document.getElementById("preview");
  const placeholderText = document.getElementById("placeholderText");
  const thumbnails = document.getElementById("thumbnails");

  // 👉 Upload e pré-visualização
  fileInput.addEventListener("change", (e) => {
    thumbnails.innerHTML = "";
    const files = Array.from(e.target.files);

    if (files.length > 0) {
      placeholderText.style.display = "none";
      preview.style.display = "block";
      const reader = new FileReader();
      reader.onload = (ev) => (preview.src = ev.target.result);
      reader.readAsDataURL(files[0]);
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = document.createElement("img");
        img.src = ev.target.result;
        img.classList.add("thumb");
        thumbnails.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  });

  // 👉 Alternar seções de filtros
  window.toggleSection = (header) => {
    const section = header.parentElement;
    section.classList.toggle("open");
  };

  // 👉 Ativar/Desativar botões de filtros
  window.toggleAtivo = (btn) => {
    btn.classList.toggle("ativo");
  };

  // 👉 Publicar anúncio
  window.publicar = async () => {
    const titulo = document.querySelector(".titulo").innerText.trim();
    const rua = document.getElementById("rua").value;
    const bairro = document.getElementById("bairro").value;
    const numero = document.getElementById("numero").value;
    const cidade = document.getElementById("cidade").value;
    const estado = document.getElementById("estado").value;
    const descricao = document.getElementById("descricao").value;
    const tipo_moradia = document.getElementById("tipo_moradia").value;
    const finalidade = document.getElementById("finalidade").value;
    const area = document.getElementById("area").value;
    const quartos = document.getElementById("quartos").value;
    const banheiros = document.getElementById("banheiros").value;
    const vagas = document.getElementById("vagas").value;
    const preco = document.getElementById("preco").value;

    if (!titulo || !preco || !cidade) {
      alert("Preencha pelo menos o título, preço e cidade!");
      return;
    }

    const imagens = Array.from(fileInput.files);
    const imagensBase64 = await Promise.all(
      imagens.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });
      })
    );

    const data = {
      titulo,
      rua,
      bairro,
      numero,
      cidade,
      estado,
      descricao,
      tipo_moradia,
      finalidade,
      area,
      quartos,
      banheiros,
      vagas,
      preco,
      imagens: imagensBase64
    };

    try {
      const res = await fetch("http://localhost:3000/imovel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        alert("✅ Anúncio publicado com sucesso!");
        listarAnuncios();
      } else {
        alert("❌ Erro ao publicar anúncio.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro na conexão com o servidor.");
    }
  };

   async function fetchImoveis() {
    try {
      const res = await fetch("http://192.168.1.44:3000/imoveis");
      if (!res.ok) throw new Error("Falha ao conectar ao servidor");
      const imoveis = await res.json();


  // 👉 Renderizar cards dos anúncios cadastrados
  function renderAnuncios(anuncios) {
    let lista = document.getElementById("listaAnuncios");
    if (!lista) {
      lista = document.createElement("section");
      lista.id = "listaAnuncios";
      lista.style.marginTop = "40px";
      document.querySelector("main").appendChild(lista);
    }
    lista.innerHTML = "";

    anuncios.forEach((a) => {
      const card = document.createElement("div");
      card.className = "anuncio-item";
      card.innerHTML = `
        <img src="${a.imagens?.[0] || ''}" alt="Imagem do imóvel">
        <div class="info">
          <h3>${a.titulo}</h3>
          <p>${a.cidade} - ${a.estado}</p>
          <p><strong>R$ ${a.preco}</strong></p>
          <button onclick="editarAnuncio(${a.id})">✏️ Editar</button>
          <button onclick="deletarAnuncio(${a.id})" class="del">🗑️ Excluir</button>
        </div>
      `;
      lista.appendChild(card);
    });
  }

  // 👉 Excluir anúncio
  window.deletarAnuncio = async (id) => {
    if (!confirm("Deseja realmente excluir este anúncio?")) return;
    try {
      const res = await fetch(`http://localhost:3000/imovel/${id}`, { method: "DELETE" });
      if (res.ok) listarAnuncios();
    } catch (err) {
      console.error(err);
    }
  };

  // 👉 Editar anúncio (básico)
  window.editarAnuncio = async (id) => {
    alert("Função de edição ainda em desenvolvimento 🔧");
  };

  listarAnuncios();
});

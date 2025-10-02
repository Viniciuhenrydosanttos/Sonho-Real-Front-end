async function publicar() {
  // Verifica se a imagem foi adicionada
  if (!preview.src || preview.src.trim() === "") {
    alert("⚠️ Adicione uma imagem do imóvel antes de publicar.");
    return;
  }

  // Captura dos dados principais
  const nome_casa = document.querySelector(".editavel").innerText.trim();
  const preco = document.querySelector(".preco").innerText.trim();
  const descricao = document.querySelector(".descricao").innerText.trim();

  // Campos adicionais (precisam existir no HTML como <input> ou <select>)
  const tipo_moradia = document.getElementById("tipoMoradia")?.value || "Apartamento";
  const finalidade = document.getElementById("finalidade")?.value || "Venda";

  const rua = document.getElementById("rua")?.value || "";
  const bairro = document.getElementById("bairro")?.value || "";
  const numero = document.getElementById("numero")?.value || "";
  const cidade = document.getElementById("cidade")?.value || "";
  const estado = document.getElementById("estado")?.value || "";

  const area_total = document.querySelector(".area-inputs input[placeholder='Até']").value || "0";

  const quartos = document.querySelectorAll(".quantity-btns button.ativo").length || 0;
  const banheiros = document.getElementById("banheiros")?.value || "0";
  const vagas_garagem = document.getElementById("vagas")?.value || "0";
  const disponibilidade = document.getElementById("disponibilidade")?.value || "Disponível";

  // Características extras
  const caracteristicas = Array.from(
    document.querySelectorAll(".tags button.ativo")
  ).map(btn => btn.innerText);

  // Monta objeto do imóvel
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
    caracteristicas,
    descricao,
    imagem: preview.src // 🔥 Agora é obrigatório, nunca null
  };

  console.log("📢 Enviando imóvel para API:", imovel);

  try {
    const response = await fetch("http://192.168.1.14:3000/api/imoveis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(imovel)
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    alert("✅ Imóvel cadastrado com sucesso!");
    console.log("📦 Resposta da API:", data);

  } catch (error) {
    console.error("❌ Erro ao cadastrar imóvel:", error);
    alert("Erro ao cadastrar imóvel. Verifique o console.");
  }
}

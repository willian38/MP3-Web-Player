// Seleção dos elementos do HTML
const btnBuscar = document.getElementById("btn-buscar");
const inputBusca = document.getElementById("input-busca");
const listaApi = document.getElementById("lista-api");

// Função principal de busca com tratamento de erros
async function procurarMusica() {
    const termo = inputBusca.value.trim();

    // Validação simples de campo vazio
    if (termo === "") {
        listaApi.innerHTML = "<p style='color: orange;'>⚠️ Por favor, digite o nome de uma música ou artista.</p>";
        return;
    }

    listaApi.innerHTML = "<p>🔍 Buscando no banco de dados musical...</p>";

    try {
        // Usamos um proxy (cors-anywhere) para evitar o erro de CORS comum em APIs públicas
        // Se o proxy estiver fora do ar, você pode tentar a URL direta: https://api.deezer.com/search?q=
        const proxy = "https://api.allorigins.win/get?url=";
        const urlDeezer = `https://api.deezer.com/search?q=${encodeURIComponent(termo)}`;

        const response = await fetch(`${proxy}${encodeURIComponent(urlDeezer)}`);

        if (!response.ok) throw new Error("Erro ao conectar com o servidor.");

        const result = await response.json();
        // A API AllOrigins retorna os dados dentro de uma string 'contents' que precisamos transformar em JSON
        const data = JSON.parse(result.contents);

        // Limpa a lista para exibir os resultados
        listaApi.innerHTML = "";

        if (!data.data || data.data.length === 0) {
            listaApi.innerHTML = "<p>❌ Nenhuma música encontrada. Tente outros termos.</p>";
            return;
        }

        // Mostra os 10 primeiros resultados
        data.data.slice(0, 10).forEach(track => {
            const trackDiv = document.createElement("div");
            trackDiv.classList.add("track");

            // Estilização rápida via JS para os novos itens
            trackDiv.style.marginBottom = "15px";
            trackDiv.style.padding = "10px";
            trackDiv.style.borderBottom = "1px solid #eee";

            // Verifica se existe o áudio de prévia
            const previewAudio = track.preview
                ? `<audio controls src="${track.preview}" style="width: 100%; height: 30px; margin-top: 5px;"></audio>`
                : `<p style="font-size: 12px; color: gray;">(Prévia indisponível para esta faixa)</p>`;

            trackDiv.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${track.album.cover_small}" alt="Capa" style="border-radius: 4px;">
                    <div>
                        <strong>${track.title}</strong><br>
                        <span style="color: #666; font-size: 14px;">${track.artist.name}</span>
                    </div>
                </div>
                ${previewAudio}
            `;

            listaApi.appendChild(trackDiv);
        });

    } catch (error) {
        console.error("Erro detalhado:", error);

        // Exibe uma mensagem amigável de erro na tela
        listaApi.innerHTML = `
            <div style="background: #fff0f0; border: 1px solid #ffcccc; padding: 15px; border-radius: 5px; color: #d93025;">
                <strong>Erro ao buscar músicas:</strong><br>
                ${error.message === "Failed to fetch" ? "Erro de conexão ou bloqueio de segurança (CORS)." : error.message}
                <br><br>
                <button onclick="procurarMusica()" style="background: #d93025; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px;">
                    Tentar novamente
                </button>
            </div>
        `;
    }
}

// Eventos
btnBuscar.addEventListener("click", procurarMusica);

inputBusca.addEventListener("keypress", (e) => {
    if (e.key === "Enter") procurarMusica();
});

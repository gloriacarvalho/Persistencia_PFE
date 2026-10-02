/* =========================================
   ELEMENTOS DA PÁGINA
========================================= */

const latitudeElemento = document.getElementById("latitude");
const longitudeElemento = document.getElementById("longitude");

const statusElemento = document.getElementById("status");

const btnLocalizacao = document.getElementById("btnLocalizacao");
const btnTeste = document.getElementById("btnTeste");

const areaTeste = document.getElementById("areaTeste");

const ultimaLocalizacaoElemento =
    document.getElementById("ultimaLocalizacao");

const mapa = document.getElementById("mapa");

const papel = document.getElementById("papel");
const lixeira = document.getElementById("lixeira");

const mensagem = document.getElementById("mensagem");


/* =========================================
   CHAVE DO LOCALSTORAGE
========================================= */

const CHAVE_LOCALIZACAO = "ultimaLocalizacao";


/* =========================================
   INICIALIZAÇÃO
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    carregarUltimaLocalizacao();

});


/* =========================================
   BOTÃO DE LOCALIZAÇÃO
========================================= */

btnLocalizacao.addEventListener("click", function () {

    iniciarLocalizacao();

});


/* =========================================
   VERIFICAR GEOLOCALIZAÇÃO
========================================= */

function iniciarLocalizacao() {

    areaTeste.classList.remove("visivel");

    statusElemento.textContent = "Localizando...";
    statusElemento.className = "status";

    btnLocalizacao.disabled = true;

    btnLocalizacao.innerHTML =
        "<span>⌖</span> Localizando sua posição...";


    /*
        Verifica se o navegador possui
        suporte à Geolocation API.
    */

    if (!navigator.geolocation) {

        mostrarErro(
            "Seu navegador não suporta geolocalização."
        );

        return;

    }


    /*
        A localização funciona melhor quando
        o projeto é executado pelo Live Server.
    */

    console.log(
        "Geolocalização disponível:",
        !!navigator.geolocation
    );

    console.log(
        "Contexto seguro:",
        window.isSecureContext
    );


    /*
        Solicita a localização real.
    */

    navigator.geolocation.getCurrentPosition(

        localizacaoEncontrada,

        erroLocalizacao,

        {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 0
        }

    );

}


/* =========================================
   LOCALIZAÇÃO ENCONTRADA
========================================= */

function localizacaoEncontrada(posicao) {

    const latitude =
        posicao.coords.latitude;

    const longitude =
        posicao.coords.longitude;

    const precisao =
        posicao.coords.accuracy;


    console.log("Latitude:", latitude);

    console.log("Longitude:", longitude);

    console.log(
        "Precisão aproximada:",
        precisao,
        "metros"
    );


    /*
        Mostra as coordenadas na tela.
    */

    latitudeElemento.textContent =
        latitude.toFixed(6);

    longitudeElemento.textContent =
        longitude.toFixed(6);


    /*
        Atualiza o status.
    */

    statusElemento.textContent =
        "Localização encontrada";

    statusElemento.className =
        "status sucesso";


    /*
        Salva a localização.
    */

    salvarLocalizacao(
        latitude,
        longitude,
        "real"
    );


    /*
        Cria o mapa real.
    */

    mostrarMapaReal(
        latitude,
        longitude
    );


    /*
        Tenta descobrir o endereço.
    */

    buscarEndereco(
        latitude,
        longitude
    );


    /*
        Restaura o botão.
    */

    btnLocalizacao.disabled = false;

    btnLocalizacao.innerHTML =
        "<span>⌖</span> Atualizar minha localização";


    areaTeste.classList.remove("visivel");


    mostrarNotificacao(
        "Sua localização foi encontrada e salva."
    );

}


/* =========================================
   ERRO DE GEOLOCALIZAÇÃO
========================================= */

function erroLocalizacao(erro) {

    console.error(
        "Erro de geolocalização:",
        erro
    );


    btnLocalizacao.disabled = false;

    btnLocalizacao.innerHTML =
        "<span>⌖</span> Tentar novamente";


    statusElemento.textContent =
        "Não foi possível localizar";

    statusElemento.className =
        "status erro";


    areaTeste.classList.add("visivel");


    if (erro.code === 1) {

        mostrarNotificacao(
            "Permissão de localização negada. Verifique a permissão do navegador."
        );

    }

    else if (erro.code === 2) {

        mostrarNotificacao(
            "A posição não pôde ser determinada."
        );

    }

    else if (erro.code === 3) {

        mostrarNotificacao(
            "A localização demorou muito para responder."
        );

    }

    else {

        mostrarNotificacao(
            "Não foi possível obter sua localização."
        );

    }

}


/* =========================================
   ERRO GERAL
========================================= */

function mostrarErro(texto) {

    statusElemento.textContent =
        "Erro";

    statusElemento.className =
        "status erro";

    btnLocalizacao.disabled = false;

    btnLocalizacao.innerHTML =
        "<span>⌖</span> Tentar novamente";

    areaTeste.classList.add("visivel");

    mostrarNotificacao(texto);

}


/* =========================================
   SALVAR NO LOCALSTORAGE
========================================= */

function salvarLocalizacao(
    latitude,
    longitude,
    tipo
) {

    const dados = {

        latitude: latitude,

        longitude: longitude,

        tipo: tipo,

        data: new Date().toLocaleString(
            "pt-BR"
        )

    };


    localStorage.setItem(
        CHAVE_LOCALIZACAO,
        JSON.stringify(dados)
    );


    atualizarUltimaLocalizacao(
        dados
    );

}


/* =========================================
   CARREGAR ÚLTIMA LOCALIZAÇÃO
========================================= */

function carregarUltimaLocalizacao() {

    const dadosSalvos =
        localStorage.getItem(
            CHAVE_LOCALIZACAO
        );


    if (!dadosSalvos) {

        return;

    }


    try {

        const dados =
            JSON.parse(dadosSalvos);


        latitudeElemento.textContent =
            Number(dados.latitude).toFixed(6);

        longitudeElemento.textContent =
            Number(dados.longitude).toFixed(6);


        atualizarUltimaLocalizacao(
            dados
        );


        /*
            Ao atualizar a página,
            o mapa continua mostrando
            a última localização salva.
        */

        mostrarMapaReal(
            dados.latitude,
            dados.longitude
        );


        statusElemento.textContent =
            "Localização salva";

        statusElemento.className =
            "status sucesso";


    }

    catch (erro) {

        console.error(
            "Erro ao carregar localização:",
            erro
        );

    }

}


/* =========================================
   ATUALIZAR TEXTO DA ÚLTIMA LOCALIZAÇÃO
========================================= */

function atualizarUltimaLocalizacao(
    dados
) {

    const tipo =
        dados.tipo === "real"
            ? "Localização real"
            : "Localização de demonstração";


    ultimaLocalizacaoElemento.innerHTML =

        `${tipo}: 
        ${Number(dados.latitude).toFixed(6)},
        ${Number(dados.longitude).toFixed(6)}
        <br>
        <small>${dados.data}</small>`;

}


/* =========================================
   CRIAR MAPA REAL
========================================= */

function mostrarMapaReal(
    latitude,
    longitude
) {

    const lat =
        Number(latitude);

    const lon =
        Number(longitude);


    /*
        Cria uma pequena área ao redor
        da localização.

        O resultado é uma visualização
        semelhante a um mapa de navegação.
    */

    const margem = 0.015;


    const left =
        lon - margem;

    const right =
        lon + margem;

    const bottom =
        lat - margem;

    const top =
        lat + margem;


    /*
        URL do mapa do OpenStreetMap.

        O marcador aparece exatamente
        nas coordenadas recebidas.
    */

    const url =
        `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lon}`;


    /*
        Cria o iframe.
    */

    const iframe =
        document.createElement("iframe");


    iframe.src = url;

    iframe.title =
        "Mapa da localização atual";

    iframe.loading =
        "lazy";


    /*
        Substitui o mapa inicial
        pelo mapa real.
    */

    mapa.innerHTML = "";

    mapa.appendChild(iframe);

}


/* =========================================
   BUSCAR ENDEREÇO COM NOMINATIM
========================================= */

async function buscarEndereco(
    latitude,
    longitude
) {

    try {

        const url =
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=pt-BR`;


        const resposta =
            await fetch(url);


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível consultar o endereço."
            );

        }


        const dados =
            await resposta.json();


        console.log(
            "Endereço encontrado:",
            dados.display_name
        );


        /*
            O endereço fica disponível
            no console para demonstração
            da utilização da API.
        */

        if (dados.display_name) {

            mostrarNotificacao(
                "Localização encontrada com sucesso."
            );

        }

    }

    catch (erro) {

        console.warn(
            "Não foi possível obter o endereço:",
            erro
        );

    }

}


/* =========================================
   LOCALIZAÇÃO DE DEMONSTRAÇÃO
========================================= */

btnTeste.addEventListener(
    "click",
    function () {

        /*
            Coordenadas de São Paulo.
        */

        const latitude =
            -23.550520;

        const longitude =
            -46.633308;


        latitudeElemento.textContent =
            latitude.toFixed(6);

        longitudeElemento.textContent =
            longitude.toFixed(6);


        statusElemento.textContent =
            "Demonstração";

        statusElemento.className =
            "status";


        salvarLocalizacao(
            latitude,
            longitude,
            "demo"
        );


        mostrarMapaReal(
            latitude,
            longitude
        );


        btnLocalizacao.disabled = false;

        btnLocalizacao.innerHTML =
            "<span>⌖</span> Encontrar minha localização";


        areaTeste.classList.remove(
            "visivel"
        );


        mostrarNotificacao(
            "Localização de demonstração carregada."
        );

    }
);


/* =========================================
   DRAG AND DROP
========================================= */


/*
    Quando começa a arrastar
    o papel.
*/

papel.addEventListener(
    "dragstart",
    function (evento) {

        evento.dataTransfer.setData(
            "text/plain",
            "papel"
        );

    }
);


/*
    Permite que o papel seja
    solto na lixeira.
*/

lixeira.addEventListener(
    "dragover",
    function (evento) {

        evento.preventDefault();

        lixeira.classList.add(
            "destacada"
        );

    }
);


/*
    Remove destaque.
*/

lixeira.addEventListener(
    "dragleave",
    function () {

        lixeira.classList.remove(
            "destacada"
        );

    }
);


/*
    Ao soltar o papel.
*/

lixeira.addEventListener(
    "drop",
    function (evento) {

        evento.preventDefault();

        lixeira.classList.remove(
            "destacada"
        );


        const dados =
            evento.dataTransfer.getData(
                "text/plain"
            );


        if (dados === "papel") {

            limparLocalizacao();

        }

    }
);


/* =========================================
   LIMPAR LOCALIZAÇÃO
========================================= */

function limparLocalizacao() {

    /*
        Remove a localização
        do LocalStorage.
    */

    localStorage.removeItem(
        CHAVE_LOCALIZACAO
    );


    /*
        Limpa as coordenadas.
    */

    latitudeElemento.textContent =
        "--";

    longitudeElemento.textContent =
        "--";


    /*
        Atualiza status.
    */

    statusElemento.textContent =
        "Aguardando";

    statusElemento.className =
        "status";


    /*
        Atualiza última localização.
    */

    ultimaLocalizacaoElemento.textContent =
        "Nenhuma localização salva ainda.";


    /*
        Volta o mapa para o estado inicial.
    */

    mapa.innerHTML = `

        <div class="mapa-inicial">

            <div class="mapa-inicial-icone">
                ⌖
            </div>

            <strong>
                Aguardando localização
            </strong>

            <span>
                Clique em "Encontrar minha localização"
            </span>

        </div>

    `;


    /*
        Mostra mensagem.
    */

    mostrarNotificacao(
        "Localização apagada com sucesso."
    );

}


/* =========================================
   NOTIFICAÇÕES
========================================= */

function mostrarNotificacao(
    texto
) {

    mensagem.textContent =
        texto;

    mensagem.classList.add(
        "visivel"
    );


    setTimeout(
        function () {

            mensagem.classList.remove(
                "visivel"
            );

        },
        3500
    );

}
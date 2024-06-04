// Inicializa os arrays com os dados do localStorage, se existirem
let library = JSON.parse(localStorage.getItem('library')) || [];
let wish = JSON.parse(localStorage.getItem('wish')) || [];

// Função para salvar arrays no localStorage
const saveToLocalStorage = () => {
    localStorage.setItem('library', JSON.stringify(library));
    localStorage.setItem('wish', JSON.stringify(wish));
}

const removeDuplicates = (array) => {
    return [...new Set(array)];
}

// Função para buscar jogo
const searchGame = async (event) => {
    event.preventDefault();

    const search = document.getElementById('nome').value;
    console.log('Nome do jogo:', search);

    document.getElementById('busca_text').innerText = `Resultado da busca para: ${search}`;

    try {
        const response = await fetch(`https://cors-anywhere.herokuapp.com/https://steamcommunity.com/actions/SearchApps/${search}`);
        
        if (!response.ok) {
            throw new Error('Erro ao consultar ação!');
        }

        const result = await response.json();

        console.log(result);

        let searchGame = "";

        result.forEach(element => {
            searchGame += `
            <div class="game">
                <a hidden>${element.appid}</a>
                <img src=${element.logo} alt="logo">
                <a>${element.name}</a>
                <div class="gametype">
                    <button onclick="libraryAppid(${element.appid})">Library</button>
                    <button onclick="wishAppid(${element.appid})">Wish List</button>
                </div>
            </div>`;
        });

        document.getElementById('resultado').innerHTML = searchGame;

    } catch (error) {
        alert('Erro ao consultar ação: ' + error.message);
        console.error('ERROR', error);
    }
}

// Função para adicionar jogo na biblioteca
function libraryAppid(appid) {
    library.push(appid);
    library = removeDuplicates(library)
    console.log(library);
    saveToLocalStorage(); // Salva o array atualizado no localStorage
}

// Função para adicionar jogo na lista de desejos
function wishAppid(appid) {
    wish.push(appid);
    wish = removeDuplicates(wish)
    console.log(wish);
    saveToLocalStorage(); // Salva o array atualizado no localStorage
}

// Função para carregar cartões da biblioteca
const libraryCards = async (event) => {
    event.preventDefault();

    console.log(library);

    for (const appid of library) {
        const game = await loadCards(appid);
        if (game && game[appid] && game[appid].success) {
            const gameData = game[appid].data;
            console.log(gameData);
            document.getElementById('mainlibrary').innerHTML += `
            <div class="game">
                <a hidden>${appid}</a>
                <img src="${gameData.header_image}" alt="logo">
                <a>${gameData.name}</a>
            </div>`;
        }
    }
}

// Função para carregar cartões da lista de desejos
const wishCards = async (event) => {
    event.preventDefault();

    console.log(wish);

    for (const appid of wish) {
        const game = await loadCards(appid);
        if (game && game[appid] && game[appid].success) {
            const gameData = game[appid].data;
            console.log(gameData);
            document.getElementById('mainwish').innerHTML += `
            <div class="game">
                <a hidden>${appid}</a>
                <img src="${gameData.header_image}" alt="logo">
                <a>${gameData.name}</a>
            </div>`;
        }
    }
}

// Função para carregar dados dos jogos
async function loadCards(appid) {
    try {
        const response = await fetch(`https://cors-anywhere.herokuapp.com/https://store.steampowered.com/api/appdetails?appids=${appid}`);
        
        if (!response.ok) {
            throw new Error('Erro ao consultar ação!');
        }

        const result = await response.json();

        console.log(result);

        return result;
    } catch (error) {
        alert('Erro ao consultar ação: ' + error.message);
        console.error('ERROR', error);
    }
}
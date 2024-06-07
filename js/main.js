// Inicializa os arrays com os dados do localStorage, se existirem
let library = JSON.parse(localStorage.getItem('library')) || [];
let wish = JSON.parse(localStorage.getItem('wish')) || [];

// Função para salvar arrays no localStorage
const saveToLocalStorage = () => {
    localStorage.setItem('library', JSON.stringify(library));
    localStorage.setItem('wish', JSON.stringify(wish));
}

// Função para remover duplicatas baseado no appid
function removeDuplicates(array) {
    const unique = {};
    array.forEach(item => {
        unique[item.appid] = item;
    });
    return Object.values(unique);
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
    const novoItem = { appid: appid, comentario: "" };

    library.push(novoItem);
    library = removeDuplicates(library)
    console.log(library);
    saveToLocalStorage(); // Salva o array atualizado no localStorage
}

// Função para adicionar jogo na lista de desejos
function wishAppid(appid) {
    const novoItem = { appid: appid, comentario: "" };

    wish.push(novoItem);
    wish = removeDuplicates(wish)
    console.log(wish);
    saveToLocalStorage(); // Salva o array atualizado no localStorage
}

// Função para carregar cartões da biblioteca
const libraryCards = async (event) => {
    event.preventDefault();

    console.log(library);

    for (const appid of library) {
        const game = await loadCards(appid.appid);
        if (game && game[appid.appid] && game[appid.appid].success) {
            const gameData = game[appid.appid].data; 
            document.getElementById('mainlibrary').innerHTML += `
            <div class="game">
                <a hidden class="appid">${appid.appid}</a>
                <img src="${gameData.header_image}" alt="logo">
                <a>${gameData.name}</a>
                <div class="gametype">
                    <button onclick="detailsModal(event)">Ver detalhes</button>
                </div>
            </div>`;
        }
    }
}

// Função para carregar cartões da lista de desejos
const wishCards = async (event) => {
    event.preventDefault();

    console.log(wish);

    for (const appid of wish) {
        const game = await loadCards(appid.appid);
        if (game && game[appid.appid] && game[appid.appid].success) {
            const gameData = game[appid.appid].data;
            console.log(gameData + "oi");
            document.getElementById('mainwish').innerHTML += `
            <div class="game">
                <a hidden class="appid">${appid.appid}</a>
                <img src="${gameData.header_image}" alt="logo">
                <a>${gameData.name}</a>
                <div class="gametype">
                    <button onclick="detailsModal(event)">Ver detalhes</button>
                </div>
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

const detailsModal = async (event) => {
    try {
        const appid = event.target.closest('.game').querySelector('.appid').textContent
        console.log(appid + "bunda")
        modal = event.target.closest('.main').querySelector('.modal')
        
        const response = await fetch(`https://cors-anywhere.herokuapp.com/https://store.steampowered.com/api/appdetails?appids=${appid}`);
        
        if (!response.ok) {
            throw new Error('Erro ao consultar ação!');
        }

        const result = await response.json();

        console.log(result);
        

        document.querySelector('.modal-content').innerHTML = `
            <span class="close" onclick="closeModal()">&times;</span>
            <h2>${result[appid].data.name}</h2>
            <img src="${result[appid].data.header_image}" alt="logo">
            <div class="description">${result[appid].data.short_description}</div>
            <div class="requirements">${result[appid].data.pc_requirements.minimum}</div>
            <div class="price">
                <a><strong>Preço: </strong>${result[appid].data.price_overview.final_formatted}</a>
            </div>
        `

        if (event.target.closest('.main').id === "mainlibrary") {
            console.log(event.target.closest('.main').id)
            document.querySelector('.modal-content').innerHTML += `
                <div class="comment">
                    <textarea></textarea>
                </div>
            `
        } else {
            console.log(event.target.closest('.main').id)
        }

        modal.style.display = 'block'
    } catch (error) {
        alert('Erro ao consultar ação: ' + error.message);
        console.error('ERROR', error);
    }
}

function closeModal() {
    document.querySelector('.modal').style.display = "none";
  }
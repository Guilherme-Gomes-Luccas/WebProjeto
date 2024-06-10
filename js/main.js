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
    //console.log('Nome do jogo:', search);

    document.getElementById('busca_text').innerText = `Resultado da busca para: ${search}`;

    try {
        const response = await fetch(`https://cors-anywhere.herokuapp.com/https://steamcommunity.com/actions/SearchApps/${search}`);
        
        if (!response.ok) {
            throw new Error('Erro ao consultar ação!');
        }

        const result = await response.json();

        //console.log(result);

        let searchGame = "";

        result.forEach(element => {
            searchGame += `
            <div class="game">
                <a hidden>${element.appid}</a>
                <img src=${element.logo} alt="logo">
                <a>${element.name}</a>
                <div class="gametype">
                    <button onclick="libraryAppid(${element.appid})" class="gameTypeButton">Library</button>
                    <button onclick="wishAppid(${element.appid})" class="gameTypeButton">Wish List</button>
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
    library = removeDuplicates(library);
    //console.log(library);
    saveToLocalStorage(); // Salva o array atualizado no localStorage
}

// Função para adicionar jogo na lista de desejos
function wishAppid(appid) {
    const novoItem = { appid: appid, comentario: "" };

    wish.push(novoItem);
    wish = removeDuplicates(wish);
    //console.log(wish);
    saveToLocalStorage(); // Salva o array atualizado no localStorage
}

// Função para carregar cartões da biblioteca
const libraryCards = async (event) => {
    if (event) event.preventDefault();

    //console.log(library);

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
                    <button onclick="detailsModal(event, 'library')" class="gameTypeButton">Ver detalhes</button>
                </div>
            </div>`;
        }
    }
}

// Função para carregar cartões da lista de desejos
const wishCards = async (event) => {
    if (event) event.preventDefault();

    //console.log(wish);

    for (const appid of wish) {
        const game = await loadCards(appid.appid);
        if (game && game[appid.appid] && game[appid.appid].success) {
            const gameData = game[appid.appid].data;
            //console.log(gameData + "oi");
            document.getElementById('mainwish').innerHTML += `
            <div class="game">
                <a hidden class="appid">${appid.appid}</a>
                <img src="${gameData.header_image}" alt="logo">
                <a>${gameData.name}</a>
                <div class="gametype">
                    <button onclick="detailsModal(event, 'wish')" class="gameTypeButton">Ver detalhes</button>
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

        //console.log(result);

        return result;
    } catch (error) {
        alert('Erro ao consultar ação: ' + error.message);
        console.error('ERROR', error);
    }
}

const detailsModal = async (event, pageType) => {
    try {
        const appid = event.target.closest('.game').querySelector('.appid').textContent;
        const modal = event.target.closest('.main').querySelector('.modal');

        if (!modal) {
            console.error("Modal element not found.");
            return;
        }

        const response = await fetch(`https://cors-anywhere.herokuapp.com/https://store.steampowered.com/api/appdetails?cc=BR&appids=${appid}`);
        if (!response.ok) {
            throw new Error('Erro ao consultar ação!');
        }

        const result = await response.json();
        const gameData = result[appid].data;

        console.log(result)

        if (!gameData) {
            console.error("Game data not found.");
            return;
        }

        const modalContent = document.querySelector('.modal-content');
        if (!modalContent) {
            console.error("Modal content element not found.");
            return;
        }

        const gameComment = (pageType === "library") ? library.find(item => item.appid == appid).comentario : wish.find(item => item.appid == appid).comentario;

        modalContent.innerHTML = `
            <span class="close" onclick="closeModal()">&times;</span>
            <div class="title">
                <h2>${gameData.name}</h2>
                <img src="${gameData.header_image}" alt="logo">
            </div>
            <br>
            <div class="description">${gameData.short_description}</div>
            <div class="requirements">${gameData.pc_requirements.minimum}</div>
            <div class="price">
                <a><strong>Preço: </strong>${gameData.price_overview.final_formatted ? gameData.price_overview.final_formatted : "N/A"}</a>
            </div>
            <br>
            <div class="comment">
                <textarea class="textarea" placeholder="Digite seu comentário caso tenha o jogo ou digite sua expectativa para esse jogo">${gameComment}</textarea>
            </div>
            <div class="buttons">
                <div class="gametype">
                    <button onclick="addComment(${appid}, '${pageType}')" class="buttonGame">Adicionar comentario</button>
                </div>
                <div class="gametype">
                    <button onclick="deleteGame(${appid}, '${pageType}')" class="buttonGame">Remover jogo</button>
                </div>
            </div>
        `;

        modal.style.display = 'block';
    } catch (error) {
        alert('Erro ao consultar ação: ' + error.message);
        console.error('ERROR', error);
    }
}


function addComment(appid, pageType){
    const comentario = document.querySelector('.modal-content .textarea').value;
    if (pageType === "library") {
        const game = library.find(item => item.appid == appid);
        if (game) {
            game.comentario = comentario;
            //console.log(game)
        }
    } else if(pageType === "wish"){
        const game = wish.find(item => item.appid == appid);
        if (game) {
            game.comentario = comentario;
            //console.log(game)
        }
    }
    saveToLocalStorage();
    closeModal();
}

function deleteGame(appid, pageType) {
    if (pageType === "library") {
        library = library.filter(item => item.appid != appid);
    } else if (pageType === "wish") {
        wish = wish.filter(item => item.appid != appid);
    }

    saveToLocalStorage();
    closeModal();
    // Recarrega a página
    window.location.reload();
}

function closeModal() {
    document.querySelector('.modal').style.display = "none";
}

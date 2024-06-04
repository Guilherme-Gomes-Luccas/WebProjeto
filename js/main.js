const library = []
const cart = []

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

        console.log(result)

        let searchGame = ""

        result.forEach(element => {
            searchGame += `
            <div class="game">
                <a hidden>${element.appid}</a>
                <img src=${element.logo} alt="logo">
                <a>${element.name}</a>
                <div class="gametype">
                    <button onclick=libraryAppid(${element.appid})>Biblioteca</button>
                    <button onclick=cartAppid(${element.appid})>Carrinho</button>
                </div>
            </div>`
        });

        document.getElementById('resultado').innerHTML = searchGame

    } catch (error) {
        alert('Erro ao consultar ação: ' + error.message);
        console.error('ERROR', error);
    }
}

function libraryAppid(appid) {
    library.push(appid)
    console.log(library)
}

function cartAppid(appid) {
    cart.push(appid)
    console.log(cart)
}
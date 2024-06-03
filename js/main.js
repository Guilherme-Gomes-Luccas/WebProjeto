const search = []

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


        result.forEach(element => {
            search = element.appid
        });

        console.log(search)
        
        search.forEach(element => {
            searchCard(element)
        })

    } catch (error) {
        alert('Erro ao consultar ação: ' + error.message);
        console.error('ERROR', error);
    }
}

async function searchCard(searchGame){
    try {
        const response = await fetch(`https://cors-anywhere.herokuapp.com/https://steamcommunity.com/actions/SearchApps/${searchGame}`);
        
        if (!response.ok) {
            throw new Error('Erro ao consultar ação!');
        }

        const result = await response.json();

        document.getElementById('resultado').innerHTML += `
        <div>
            <a hidden>${result.appid}</a>
            <img src=${result.header_image} alt="logo">
            <a>${result.name}</a>
        </div>
    `
    } catch (error) {
        alert('Erro ao consultar ação: ' + error.message);
        console.error('ERROR', error);
    }
}
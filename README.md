![Github API](https://hackernoon.com/images/gp4s32pk.jpg)

# Consulta à API do GitHub através do AJAX

Repositório voltado para a compreensão do uso do **AJAX** para consumo de dados através de **API externas**. No caso faremos 3 consultas à API do GitHub. E, ao longo da aula, aprenderemos a utilizar o **[Postman][Postman]**, uma das ferramenta para criação e consulta à APIs mais utilizadas (existem outras como o **[Insomnia][Insomnia]** também).

Acesse [https://marcelo-diament.github.io/Github-API-with-AJAX/](https://marcelo-diament.github.io/Github-API-with-AJAX/) para visualizar o projeto no Github Pages.

___

## Introdução

O Github nos fornece uma API que permite uma série de consultas (algumas exigem autenticação outras não). Vamos usar os endpoints que não demandam autenticação. No caso iremos listar:

* Emojis disponíveis no Github
* Detalhes de um usuário a partir de seu _username_
* Lista de repositórios de um usuário (com _queries_ que nos permitem filtrar, ordenar, definir quantos resultados serão trazidos e quantos serão exibidos por página).

A **documentação da API** está [nesse link](https://docs.github.com/en/rest/reference/). E os endpoints são:

* **Emojis**: _https://api.github.com/emojis_
* **User**: _https://api.github.com/users/**:username**_
* **Repos**: _https://api.github.com/users/**:username**/repos_

> Repare que o endpoint de emojis não requer **parâmetro** algum, enquanto para os outros dois endpoints precisamos passar o nome do usuário. Para esse parâmetro, criamos uma variável no [Postman][Postman] (no caso, defini o username como Marcelo-Diament, mas podem alterar para seus usuários). Já no nosso código, a variável será inserida pelo próprio visitante.

Antes de pormos a mão na massa, vale revisarmos alguns dos principais conceitos e passos para realizarmos nossa consulta à API.

___

## Teoria

A seguir, uma breve explicação sobre os principais conceitos do AJAX.

### AJAX | Asynchronous Javascript and XML

**AJAX** é um acrônimo para _Asynchronous Javascript and XML_. Nada mais é que uma maneira de realizarmos uma requisição assíncrona através requisições XHTTP (_XML HTTP Requests, ou simplesmente **`xhr`**_). Mas... o que são **requisições XML Http**?

### XMLHttpRequest

O primeiro passo é criarmos a **request**. Ou seja, vamos instanciar uma request a partir da classe **XMLHttpRequest**. Porém, há alguns navegadores que não entendem tal classe. Por isso, precisaremos criar algumas condições:

``` js
// Se window possui XMLHttpRequest...
if (window.XMLHttpRequest) { // Mozilla, Safari, ...
    // Instanciamos uma request a partir dele
    request = new XMLHttpRequest()
    // ...senão, verificamos se possui ActiveXObject (Internet Explorer)
} else if (window.ActiveXObject) { // IE
    // Realizamos uma tentativa, se tivermos sucesso (response)...
    try {
        // Instanciamos uma request a partir dele
        request = new ActiveXObject('Msxml2.XMLHTTP')
        // ...senão (reject/catch)...
    } catch (e) {
        // ...tentamos passar outro parâmetro
        try {
            // o parâmetro 'Microsoft.XMLHTTP'
            request = new ActiveXObject('Microsoft.XMLHTTP')
            // E se realmente não conseguirmos instanciar a request
        } catch (e) {
            // Imprimimos o erro no console
            console.error(e);
        }
    }
}
```

E como faremos mais de uma requisição `XHttpRequest` (faremos uma requisição para cada busca a ser realizada), podemos inclui-la dentro de uma função, de modo a não precisarmos repetir o mesmo código inúmeras vezes (**DRY** - _Don't Repeat Yourself_). Então ficará assim:

**makeRequest()**

``` js
const makeRequest = () => {
    if (window.XMLHttpRequest) {
        request = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        try {
            request = new ActiveXObject('Msxml2.XMLHTTP');
        } catch (e) {
            try {
                request = new ActiveXObject('Microsoft.XMLHTTP');
            } catch (e) {
                console.error(e);
                return;
            }
        }
    }
    return request;
}
```

Dessa forma, a cada requisição nova que precisarmos fazer, podemos simplesmente executar **`let xhr = makeRequest();`**.

### Propriedades XMLHttpRequest

Vamos ver o que é, afinal, essa request! Se inspecionarmos no console, veremos que temos as seguintes principais propriedades:

| prop | descrição |
| - | - |
| <td colspan=2>**Eventos** |
| onabort | disparado quando a requisição é abortada |
| **onerror** | disparado quando ocorre erro na requisição |
| onload | disparado quando a requisição é carregada |
| onloadend | disparado quando a requisição termina de carregar |
| onloadstart | disparado quando a requisição começa a carregar |
| onprogress | disparado sempre que a requisição recebe dados |
| **onreadystatechange** | disparado quando a requisição está pronta |
| <td colspan=2>**Estado** |
| **readyState** | representa os cabeçalhos (_Headers_) da requisição |
| **status** | representa o status da requisição ('200', por exemplo) |
| **statusText** | representa o status da requisição em texto ('200 OK', por exemplo) |
| timeout | representa o tempo da requisição antes de ser finalizada (ms) |
| <td colspan=2>**Retorno** |
| **response** | retorno em si |
| **responseText** | retorno em texto |
| **responseType** | tipo de retorno, pode ser definido como _json_ por exemplo |
| responseURL | retorno |
| responseXML | retorno como objeto XML ou HTML |

Acesse a [documentação do MDN](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#Properties) para ver todas as propriedades do `xhr` .

#### Mais alguns detalhes sobre a XMLHttpRequest

**Possíveis estados ( `readyState` )**

| valor | estado | descrição |
| - | - | - |
| 0 | UNSENT | `open()` ainda não foi chamado |
| 1 | OPENED | `send()` ainda não foi chamado |
| 2 | HEADERS_RECEIVED | `send()` foi chamado e cabeçalho e status estão disponíveis |
| 3 | LOADING | `responseText` contém dados parciais (recebendo) |
| 4 | DONE | Requisição concluída |

**Possíveis status ( `status` )**

Podemos dividí-los por centena, de forma mais genérica:

| Centena | Tipo |
| - | - |
| 1xx | Informativo |
| 2xx | Sucesso |
| 3xx | Redirecionamento |
| 4xx | Erro no cliente |
| 5xx | Erro no servidor |

E os principais valores são:

| status | statusText | valor |
| - | - | - |
| 200 | OK | Requisição concluída com sucesso |
| 204 | No Content | Requisição concluída com sucesso mas sem conteúdo retornado |
| 400 | Bad Request | Houve algum erro (sintaxe) na requisição |
| 403 | Forbidden | Não temos acesso ao conteúdo |
| 404 | Not Found | Página não encontrada |
| 500 | Internal Server Error | Erro interno no servidor |
| 503 | Service UNavailable | Servidor indisponível |
| 505 | HTTP Version Not Supported | Versão HTTP não suportada (por isso temos os `try/catch` na função `makeRequest()` ) |

Acesse [esse link](https://www.w3schools.com/tags/ref_httpmessages.asp) para ver todos os status e mensagens.

### Métodos (e mais props) XMLHttpRequest

Agora que já sabemos como criar uma requisição (até mesmo através de uma função), precisamos entender quais os métodos disponíveis para podermos definir o conteúdo da requisição e, posteriormente, recebermos nosso retorno.

**onreadystatechange**

A partir do momento que a requisição foi 'montada' (e antes de 'dispararmos' ela), devemos definir como ela deverá se comportar após receber o retorno. Para isso acessaremos a propriedade `onreadystatechange` .

Ainda, dentro dessa declaração, já faremos algumas verificações (se o `readyState` da requisição é **4** - DONE - e se o `status` é **200** - OK). Caso as condições sejam verdadeiras, iremos capturar o conteúdo através do `responseText` , '_parseá-lo_' (com `JSON.parse()` ) - pois sabemos que receberemos um JSON como retorno -, e executarmos o que quisermos (nesse exemplo, um `console.log()` ). Mão à obra!

``` js
/**
 *  Verificando o readyState e status através do onreadystatechange
 * Vale reforçar que, como usaremos o 'this', não podemos usar uma arrow function
 */
xhr.onreadystatechange = function() {
    // Se tivermos sucesso...
    if (this.readyState == 4 && this.status == 200) {
        // ...parseamos o responseText
        let resultado = JSON.parse(this.responseText);
        // E aí podemos manipulá-lo aqui dentro ou apenas retorná-lo e manipulá-lo em outro escopo
        console.log(resultado);
        makeSomething(resultado);
    }
}
```

**open()**

Bom, já criamos o modelo de requisição e já definimos o que deverá acontecer com nosso retorno. Agora precisamos 'abrir' essa requisição e passar pelo menos os parâmetros **método**, **URL** e se será **assíncrona** (booleano). Poderíamos ainda passar o usuário e a senha (argumentos opcionais).

A seguir, um exemplo utilizando o método `GET` (para ler informações sem alterá-las), a `URL` da API do Github (endpoint dos emojis no caso) e definiremos como assíncrona (passando o argumento `true` ).

``` js
// xhr.open(MÉTODO, URL, ASSÍNCRONO)
xhr.open('GET', `https://api.github.com/emojis` , true);
```

**send()**

O método `send()` finalmente enviar nossa requisição (já com os parâmetros necessários definidos e até mesmo o que deverá ocorrer quando a resposta for retornada). No nosso caso, onde estamos apenas consultando ( `GET` ) a API, esse método não receberá nenhum parâmetro. Será simplesmente assim:

``` js
xhr.send();
```

**Solução completa**

A seguir, como ficou nosso código (considerando a função `makeRequest()` , definida anteriormente):

``` js
// Criando a request
xhr = makeRequest();
/**
 *  Verificando o readyState e status através do onreadystatechange
 * Vale reforçar que, como usaremos o 'this', não podemos usar uma arrow function
 */
xhr.onreadystatechange = function() {
    // Se tivermos sucesso...
    if (this.readyState == 4 && this.status == 200) {
        // ...parseamos o responseText
        let resultado = JSON.parse(this.responseText);
        // E aí podemos manipulá-lo aqui dentro ou apenas retorná-lo e manipulá-lo em outro escopo
        console.log(resultado);
        makeSomething(resultado);
    }
}
// Abrindo a requisição e definindo os 3 parâmetros obrigatórios
xhr.open('GET', `https://api.github.com/emojis` , true);
// Enviando a requisição (considerando o método GET, ou seja, não haverá escrita, apenas leitura)
xhr.send();
```

E agora, sem os comentários, para termos uma visualização mais limpa:

``` js
xhr = makeRequest();
xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        let resultado = JSON.parse(this.responseText);
        console.log(resultado);
        makeSomething(resultado);
    }
}
xhr.open('GET', `https://api.github.com/emojis` , true);
xhr.send();
```

Bem tranquilo né! Poderíamos resumir ainda mais (considerando que iremos usar o método fictício `makeSomething()` e usando a sintaxe do `if short-circuit` ):

``` js
xhr = makeRequest();
xhr.onreadystatechange = function() {
    this.readyState == 4 && this.status == 200 && makeSomething(JSON.parse(this.responseText))
}
xhr.open('GET', `https://api.github.com/emojis` , true)
xhr.send()
```

Por fim, poderíamos ainda tratar caso o status não seja "200 - OK":

``` js
xhr = makeRequest();
xhr.onreadystatechange = function() {
    this.readyState == 4 &&
        this.status == 200 ?
        makeSomething(JSON.parse(this.responseText)) :
        console.log(this.statusText)
}
xhr.open('GET', `https://api.github.com/emojis` , true)
xhr.send()
```

## Prática

Agora sim temos condições de criarmos nosso projeto. =)

### Passo 1 - HTML

Vamos começar criando um HTML bem simples para nossa aplicação. Aproveitaremos o Bootstrap para podermos focar no que interessa.

Deixaremos 3 botões (com as funções de requisições que criaremos atribuidas a eventos de clique via atributo `onclick` ). Também já deixaremos alguns IDs que nos ajudarão a selecionar os elementos via script JS. E, por fim, considerando que nosso script se chamará **main.js** e estará na raiz do projeto, já linkaremos o script ao documento HTML.

Para visualizar o HTML, basta acessar o arquivo **index.html** na raiz do repositório.

_Observação: o menu terá alguns links que não direcionarão para lugar algum, posteriormente linkarei para os demais repositórios (Fetch e Axios), além de criar uma Homepage para exibir as 3 opções._

### Passo 2 - JS > Helper Functions

Vamos criar duas funções auxiliares para nos ajudar com nosso código, são:

**$** - simplificará a seleção de elementos (funcionará igual ao seletor da biblioteca JS **jQuery**):

``` js
/**
 * @function $
 * Retorna o resultado da seleção desejada através do argumento enviado
 * @param {String} selection - Representa o seletor desejado (igual do CSS)
 * @returns - Retorna o(s) elemento(s) selecionado(s)
 * @example $('body') - retorna a tag <body></body>, equivale a document.querySelector('body')
 * @example $('#meuId') - retorna a tag de id 'meuId', equivale a document.querySelector('#meuId')
 */
const $ = (selection) => {
    return document.querySelectorAll(selection).length === 1 ?
        document.querySelector(selection) :
        document.querySelectorAll(selection)
}
```

De forma geral, a função verifica se deve usar o `querySelector()` ou o `querySelectorAll()` (e caso só haja um elemento, já nos retorna o primeiro e único índice usando o `querySelector()` , nos poupando algumas linhas de código).

**addContentAsHTML** - facilitará a inserção de HTML na nossa página

``` js
/**
 * @function addContentASHTML
 * - Adiciona HTML ao final do elemento selecionado (dentro dele, como último elemento interno)
 * @param {String} selector - referência (seletor como string) ao elemento HTML no qual será inserido o 'content'
 * @param {String} content - HTML a ser inserido
 * @returns - Insere o HTML ('content') dentro do elemento HTML selecionado ('selector')
 * @example - addContentAsHTML($('body'),'<h1>Meu Título</h1>')
 */
const addContentAsHTML = (selector, content) => $(selector).innerHTML += content;
```

Perceba que a função apenas acrescenta HTML ao elemento selecionado, ela não substitui nem deleta o conteúdo já existente. Poderíamos elaborá-la um pouco mais, por exemplo, definindo um terceiro argumento que defina se utilizaremos `+=` ou `=` (ou seja, se substituiremos ou acrescentaremos o HTML, mas - a princípio - para essa prática não será o caso).

**clearAllDinamicContent** - apaga o conteúdo HTML dos 3 'inner-containers' que criamos

``` js
/**
 * @function clearAllDinamicContent
 * - Apaga o conteúdo HTML interno dos 3 'inner-containers' (githubEmojisContent, userContent e reposContent)
 * @returns - Define o HTML ('content') dentro de cada 'inner-container' como uma string vazia
 * @example - clearAllDinamicContent()
 */
const clearAllDinamicContent = () => {
    let dinamicContents = [githubEmojisContent, userContent, reposContent];
    for (item of dinamicContents) {
        $(item).innerHTML = '';
    }
}
```

_Repare que poderíamos ter uma linha a menos se declarásscemos o `innerHTML = ''` diretamente, ao invés de usarmos o `array` . Mas... pensando que podemos vir a ter mais elementos dinâmicos, ao usar o `array` , tornamos a manutenção do código mais simples._

### Passo 3 - JS > Presets

Podemos deixar algumas `const` e `let` já definidas, para facilitar nossa vida - claro, com a ajuda das fuções auxiliares. Além disso, iremos incluir no nosso HTML **containers vazios para serem populados posteriormente**.

``` js
// Criando o container e o 'inner-container' dos emojis e atribuindo o ID do 'inner-content' a uma let
let githubEmojisContainer = '<section id="githubEmojisContainer" class="my-3"><div id="githubEmojisContent"></div></section>'
addContentAsHTML('main', githubEmojisContainer)
let githubEmojisContent = '#githubEmojisContent';

// Criando o container e o 'inner-container' das informações do usuário e atribuindo o ID do 'inner-content' a uma let
let userContainer = '<section id="userContainer" class="my-3"><div id="userContent" class="d-flex flex-row flex-nowrap justify-content-between align-items-start"></div></section>'
addContentAsHTML('main', userContainer)
let userContent = '#userContent';

// Criando o container e o 'inner-container' da listagem de repositórios do usuário e atribuindo o ID do 'inner-content' a uma let
let reposContainer = '<section id="reposContainer" class="my-3"><div id="reposContent"></div></section>'
addContentAsHTML('main', reposContainer)
let reposContent = '#reposContent';
```

### Passo 4 - JS > xhr const

Apesar de se tratar de uma função auxiliar, ela foi isolada por conta de sua importância frente ao tema tratado. Como sabemos, nem todos navegadores interpretam o XMLHttpRequest, por isso usaremos aqueles `if/elseif` e `try/catch` .

``` js
/**
 * @function makeRequest
 * Cria uma nova requisição XMLHttpRequest
 * @returns - Retorna a nova requisição
 */
const makeRequest = () => {
    if (window.XMLHttpRequest) { // Mozilla, Safari, ...
        request = new XMLHttpRequest()
    } else if (window.ActiveXObject) { // IE
        try {
            request = new ActiveXObject('Msxml2.XMLHTTP')
        } catch (e) {
            try {
                request = new ActiveXObject('Microsoft.XMLHTTP')
            } catch (e) {
                console.error(e);
                alert('Por favor, acesse esse site de um navegador mais recente');
                return;
            }
        }
    }
    return request
}
```

### Passo 5 - JS > getEmojis

Agora sim chegou a hora de realizarmos nossa primeira requisição à API do Github! =)

Basicamente vamos:

1. Criar uma nova requisição a partir da função auxiliar que já criamos - `makeRequest()` ; 

2. Definir o que deve ocorrer quando recebermos uma resposta. Podemos dividir essa etapa em sub-etapas:

    2.1. Limpar o conteúdo de todos os containers dinâmicos com nossa função `clearAllDinamicContent()` ;

    2.2. Capturar o retorno da consulta ( `this.responseText` ) e aplicar o `JSON.parse()` para transformar o JSON em objeto;

    2.3. Definir o content inicial (ou seja, tags que envolvam e antecedam os emojis);

    2.4. Criar um loop para inserir cada um dos emojis;

    2.5. Fechar as tags com função de container abertas antes de inserir os emojis;

    2.6. Adicionar todo esse content dentro do respectivo container com a função `addContentAsHTML()` ;

3. Abrir a requisição passando os parâmetros mínimos (método, URL e se é ou não assíncrona);

4. Enviar a requisição;

_Esse passo a passo servirá para as demais requisições, por isso não será repetido nesse documento._

Mas, antes de manipularmos nosso retorno, precisamos saber como será esse retorno. Para isso vamos [acessar o endpoint diretamente no browser](https://api.github.com/emojis) (ou poderíamos acessar a [documentação](https://docs.github.com/en/rest/reference/emojis) também).

Feito isso, descobrimos que os emojis são retornados como objetos que contém apenas a chave (com o nome do emoji) e, como valor, o link da imagem do emoji - dessa forma:

``` json
{
  "100": "https://github.githubassets.com/images/icons/emoji/unicode/1f4af.png?v8",
  "1234": "https://github.githubassets.com/images/icons/emoji/unicode/1f522.png?v8",
  "+1": "https://github.githubassets.com/images/icons/emoji/unicode/1f44d.png?v8"
}
```

Essa informação já nos faz compreender que precisaremos executar um loop onde usaremos a `propriedade` para acessar o nome e a sintaxe `retorno[propriedade]` . Então nossa função ficará assim:

``` js
/**
 * @function getEmojis
 * Retorna todos os emojis do Github e os imprime no front do nosso site
 */
getEmojis = () => {
    xhr = makeRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            clearAllDinamicContent();
            emojis = JSON.parse(this.responseText);
            let content = `
          <style>
            .emoji-title {
              text-overflow: ellipsis;
              -webkit-line-clamp: 1;
              overflow: hidden;
              max-width: 100%;
            }
          </style>
          <article class="emojis">
            <h2>emojis</h2>
            <ul type="none" class="row col-12 px-0 py-3 mx-0">
        `;
            for (prop in emojis) {
                content += `
            <li id="${prop}" class="col-6 col-sm-4 col-md-3 col-lg-2 my-3">
              <div class="d-flex flex-column flex-nowrap justify-content-center align-items-center p-3 bg-light border rounded-lg">
                <img src="${emojis[prop]}" width="50" height="50"/>
                <small class="text-center mt-3 text-black-50 font-weight-bold emoji-title">${prop}</small>
              </div>
            </li>
          `;
            }
            content += '</ul></article>';
            addContentAsHTML(githubEmojisContent, content);
        }
    };
    xhr.open('GET', `https://api.github.com/emojis` , true);
    xhr.send();
}
```

Talvez você tenha reparado que não utilizamos nenhuma _keyword_ para definirmos o tipo de variável ( `let` , `const` ou `var` ). Quando não declaramos o tipo de variável, ela fica acessível em qualquer escopo - inclusive no console do devtools. Como a ideia é testarmos e nos familiarizarmos com essas requisições AJAX, nesse caso faz sentido deixarmos elas sem escopo definido. Mas se fosse um projeto real seria indicado usarmos a _keyword_ `const` .

> **Importante:** poderíamos ainda isolar o request dos emojis, a função que cria o HTML e a função que os insere no HTML, deixando cada função com sua responsabilidade única. Mas... não vamos seguir dessa maneira para que o 'todo' fique mais visível.

Prontinho! Como já temos a chamada para a função no atributo `onclick` do respectivo botão, já podemos testar nossa requisição!

**DICA!** É recomendável - durante a fase de desenvolvimento - incluir alguns `console.log()` para visualizarmos as etapas e os dados recebidos e enviados. Por exemplo, logo após limparmos os HTMLs dinâmicos, poderíamos incluir `console.log(JSON.parse(this.responseText));` para vermos os objetos recebidos.

### Passo 6 - JS > getUserInfos

Vamos para a próxima requisição. Ela será bem semelhante à anterior, no entanto, dessa vez precisamos enviar um parâmetro, que é o nome do usuário (_username_).

E temos um bônus nessa requisição - já criaremos um botão que faça a requisição de listagem de repositórios desse mesmo usuário.

Antes de mais nada, vamos conferir como será nosso retorno. Novamente podemos consultar a [documentação específica para esse endpoint](https://docs.github.com/en/rest/reference/users) ou acessarmos o [próprio endpoint](https://api.github.com/users/Marcelo-Diament) diretamente. Para facilitar, segue o formato de retorno:

``` json
{
  "login": "Marcelo-Diament",
  "id": 39604367,
  "node_id": "MDQ6VXNlcjM5NjA0MzY3",
  "avatar_url": "https://avatars0.githubusercontent.com/u/39604367?v=4",
  "gravatar_id": "",
  "url": "https://api.github.com/users/Marcelo-Diament",
  "html_url": "https://github.com/Marcelo-Diament",
  "followers_url": "https://api.github.com/users/Marcelo-Diament/followers",
  "following_url": "https://api.github.com/users/Marcelo-Diament/following{/other_user}",
  "gists_url": "https://api.github.com/users/Marcelo-Diament/gists{/gist_id}",
  "starred_url": "https://api.github.com/users/Marcelo-Diament/starred{/owner}{/repo}",
  "subscriptions_url": "https://api.github.com/users/Marcelo-Diament/subscriptions",
  "organizations_url": "https://api.github.com/users/Marcelo-Diament/orgs",
  "repos_url": "https://api.github.com/users/Marcelo-Diament/repos",
  "events_url": "https://api.github.com/users/Marcelo-Diament/events{/privacy}",
  "received_events_url": "https://api.github.com/users/Marcelo-Diament/received_events",
  "type": "User",
  "site_admin": false,
  "name": "Marcelo Diament",
  "company": "Djament",
  "blog": "https://djament.com.br",
  "location": "São Paulo, Brasil",
  "email": null,
  "hireable": true,
  "bio": "Dev Front End PL/Instrutor | HTML5, CSS3, PHP, JS, MySQL, VTEX, Laravel, WP, Bootstrap, SCSS, MD. Foco atual: Reactjs, Nodejs, TypeScriprt, GraphQL",
  "twitter_username": null,
  "public_repos": 63,
  "public_gists": 0,
  "followers": 152,
  "following": 174,
  "created_at": "2018-05-24T22:04:02Z",
  "updated_at": "2020-09-10T00:39:40Z"
}
```

Sabemos desde já que não utilizaremos todas essas propriedades. Teoricamente, poderíamos usar o segundo parâmetro do `JSON.parse()` - chamado `reviver` - para filtrarmos esse retorno. Um ponto muito bacana desse método é que ele analisa todas as propriedades, independentemente do nível de profundidade.

Esse método funciona da seguinte maneira: ele analisa cada par de chave e valor ( `k` , `v` ) e nos permite transformá-los. Caso o `value` seja `undefined` (por algum erro ou propositadamente), ele exclui a propriedade do retorno. Ou seja, para removermos uma propriedade, basta declararmos sua chave e atribuirmos um valor `undefined` , assim:

``` js
JSON.parse(meuJson, (k, v) => {
    if (k === 'x') {
        return undefined;
    }
    return v;
})
```

Quando retornamos `undefined` , removemos a propriedade do retorno. E quando retornamos `v` (o _value_), mantemos o par de chave/valor no retorno.

Mas... como vimos, precisaríamos declarar cada uma das propriedades que não serão utilizadas... por isso, vamos seguir com todas elas. huahuahua

``` js
/**
 * @function getUserInfos
 * Retorna as informações do usuário Github
 * @param {String} username - Nome de usuário no Github (exatamente como foi cadastrado)
 * @returns - Retorna as informações do usuário (inclusive mais links que permitem novas requisições)
 * @example - getUserInfos('Marcelo-Diament')
 */
getUserInfos = username => {
    xhr = makeRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            clearAllDinamicContent();
            infos = JSON.parse(this.responseText);
            let createdAt = new Date(infos.created_at).toLocaleDateString(),
                updatedAt = new Date(infos.updated_at).toLocaleDateString(),
                nome = infos.login.replace(/-/g, ' '),
                bio = infos.bio,
                avatar = infos.avatar_url;
            let content = `
          <img src="${avatar}" alt="Imagem de perfil do usuário ${nome}" height="120" width="120" class="rounded-circle mx-auto ml-md-0 mr-md-2 border-primary">
          <div class="col-12 col-md-10 mt-5 mt-md-3 ml-md-2 ml-md-auto px-0">
            <h2>${nome}</h2>
            <small>desde: ${createdAt} | última atualização: ${updatedAt}</small>
          </div>
          <div class="col-12 my-3 px-0 d-flex flex-column">
        `;
            if (bio !== null) {
                content += `
            <p class="col-12 px-0 my-2 order-0 order-md-2">${bio}</p>
          `;
            }
            content += `
            <button id="btnUserRepos" class="btn btn-primary my-2 order-2 order-md-0 col-auto col-md-3"
              onclick="getUserRepos(\'${nome.replace(' ', '-')}\');">Repositórios User GitHub</button>
          </div>
        `;
            addContentAsHTML(userContent, content);
        } else if (this.readyState == 4 && this.status != 200) {
            clearAllDinamicContent();
            let content = `
          <article class="repos">
            <h2>O usuário ${username.replace('-', ' ')} não existe</h2>
          </article>
        `;
            addContentAsHTML(userContent, content);
        }
    };
    xhr.open('GET', `https://api.github.com/users/${username}` , true);
    xhr.send();
}
```

_Observação 1: estamos usando **Regexp** para removermos possíveis hífens que hajam no nome de usuário. Para passarmos o argumento username no botão para listar seus repositórios, precisamos 'devolver' esses possíveis hífens._

_Observação 2: repare como formatamos a data através do Date Constructor ( `new Date()` ) e do método `toLocaleDateString()` ._

### Passo 7 - JS > getUserRepos

Enfim a última etapa desse nosso projetinho! Vamos criar a função que captura a lista de repositórios do usuário. Essa função poderá ser chamada a partir do botão 'inicial' da tela ou através dos detalhes (informações) de um usuário (função anterior).

Bora ver como será esse nosso retorno (acesse a [documentação](https://docs.github.com/en/rest/reference/repos) ou o [endpoint](https://api.github.com/users/Marcelo-Diament/repos)). Como o retorno é gigantesco, dessa vez não será impresso no documento README.md.

Verá que temos um array de objetos, sendo que cada objeto representa um repositório. Então precisaremos, mais uma vez, utilizar um loop - mas dessa vez será distinto do que usamos na função `getEmojis()` .

> **Dica:** se o repositório estiver hospedado no Github Pages, há uma propriedade chamada `homepage` que é o link direto para o projeto hospedado. Isso nos dá tanto a possibilidade de direcionar o usuário para ver o projeto fucionando quanto para trazermos o projeto dentro do nosso site (como `<iframe>` ou usando comandos como `window.open()` ). Fica de sugestão para melhorar esse nosso projeto.

Outro ponto diferente entre esse endpoint e os anteriores, é que nesse podemos usar `query parameters` para manipularmos o retorno já na requisição. Temos as seguintes opções:

| Parâmetro | Valores | Descrição |
| ----- | ----- | ----- |
| **type** | **all**, public, private, forks, sources, member, internal | Filtra pelo tipo de repo |
| **sort** | **full_name**, created, updated, pushed | Define como ordenar os repos |
| **direction** | **asc**, desc | Odernação (ascendente ou descendente) |
| **per_page** | _Number_ (max.: 100) | Quantidade de repos por página |
| **page** | _Number_ | Número de páginas a serem recebidas |

Podemos passar tais parâmetros de _query_ na própria URL, sendo que cada parâmetros de _query_ consiste em um par de chave e valor ( `chave=valor` ), O primeiro parâmetro é antecedido por uma interrogação, e os demais, são concatenados com um `&` . Fica assim: `https:meuendpoint.com` **`?param1=x&param2=y&param3=z`**.

No caso, deixaremos como parâmetros opcionais, ou seja, deixaremos valores pré-definidos, caso os mesmos não sejam passados (e, no nosso caso, não serão). Bora codar?

``` js
/**
 * @function getUserRepos
 * Retorna lista de repositórios do usuário de acordo com queryParams passados
 * @param {String} username - Usuário proprietário dos repos a serem listados
 * @param {String='all','public','private','forks','sources','member','internal'} [type='public'] - Tipo de repositórios a serem listados
 * @param {String='full_name','created','updated','pushed'} [sort='updated'] - Parâmetro para ordenação
 * @param {String='asc','desc'} [direction='desc'] - Ordenação ascendente ou descentende
 * @param {Number} [per_page=10] - Número de repositórios por página
 * @param {Number} [page=1] - Número de páginas
 */
getUserRepos = (username, type = 'public', sort = 'updated', direction = 'desc', per_page = 10, page = 1) => {
    xhr = makeRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            if (page === 1) {
                clearAllDinamicContent();
            }
            repos = JSON.parse(this.responseText);
            let content = '';
            if (page === 1 && document.querySelector('#toastStyle') === null) {
                let toastStyle = `<style id="toastStyle">.toast {transition: opacity 0.4s ease-in-out;}</style>` ;
                addContentAsHTML('head', toastStyle);
            }
            if (page === 1) {
                content += `
            <article class="repos">
              <h2>Repositórios de ${username.replace('-', ' ')}</h2>
              <ul class="col-12 px-0 py-3 mx-0 my-3" type="none" id="reposList">`;
            };
            for (repo of repos) {
                let createdAt = new Date(repo.created_at).toLocaleDateString();
                let updatedAt = new Date(repo.updated_at).toLocaleDateString();
                let name = repo.name.replace(/-/g, ' ');
                content += `
            <li id="${repo.id}" class="mt-3 mb-5">
              <div class="repo-item">
                <h2>${name}</h2>
          `;
                if (repo.language !== null) {
                    content += `
                <span class="badge badge-pill badge-dark mt-0 mb-2 mr-2 py-1 px-2">${repo.language}</span>
                <br/>
            `;
                }
                content += `
                <span class="badge badge-pill badge-light my-2 mr-2 py-1 px-2">Criado em ${createdAt}</span>
                <span class="badge badge-pill badge-light my-2 mr-2 py-1 px-2">Atualizado em ${updatedAt}</span>
          `;
                if (repo.description !== null) {
                    content += `
                <p>${repo.description}</p>
            `;
                }
                content += `
              </div>
              <a id="btnRepo${repo.id}" class="btn btn-primary my-2 order-2 order-md-0 col-auto col-md-3" href="${repo.html_url}" target="_blank" rel="noopener noreferrer" title="Acessar o repositório ${name}">Ver Repositório</a>
          `;
                if (repo.clone_url !== null) {
                    let toast = `
              <div class="toast" role="alert" aria-live="assertive" aria-atomic="true" id="toast_${repo.id}" style="display:none;opacity:0;">
                <div class="toast-header">
                  <strong class="mr-auto">git clone</strong>
                  <small>Use o comando para clonar o repo</small>
                  <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close" onclick="document.querySelector(\'#toast_${repo.id}\').style = \'display:none;opacity:0;\';">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="toast-body bg-light">
                  <code>git clone ${repo.clone_url}</code>
                </div>
              </div>
            `;
                    addContentAsHTML('#toastsContainer', toast);
                    content += `
              <a id="btnRepoClone${repo.id}" href="#toast_${repo.id}" class="btn btn-primary my-2 order-2 order-md-0 col-auto col-md-3" onclick="document.querySelector(\'#toast_${repo.id}\').style = \'display:block;opacity:1;\';" title="Clonar o repositório ${name}">Clonar Repo</a>
            `;
                }
                if (repo.homepage !== null) {
                    content += `
              <a id="btnRepoHome${repo.id}" class="btn btn-primary my-2 order-2 order-md-0 col-auto col-md-3" href="${repo.homepage}" target="_blank" rel="noopener noreferrer" title="Acessar o projeto ${name} online">Ver Projeto Online</a>
            `;
                }
                content += `
            </li>
          `;
            }
            if (page === 1) {
                content += `
          </ul>
          `;
            }
            if (page === 1) {
                content += `
            <a id="goToTop" class="btn btn-primary" href="#top" title="Subir para o topo">Topo</a>
            <button id="nextRepos" onclick="getUserRepos('${username.replace(' ', '-')}', '${type}', '${sort}', '${direction}', ${per_page}, ${page + 1});" class="btn btn-primary">Próximos Repos</button>
          </article>
          `;
            } else if (repos.length < 10) {
                $('#nextRepos').removeAttribute('onclick');
                $('#nextRepos').classList.add('disabled');
            } else {
                $('#nextRepos').setAttribute('onclick', onclick = `getUserRepos('${username.replace(' ', '-')}', '${type}', '${sort}', '${direction}', ${per_page}, ${page + 1});` );
            }
            if (page === 1) {
                addContentAsHTML(reposContent, content);
            } else {
                addContentAsHTML('#reposList', content);
            }
        }
    }
    xhr.open('GET', `https://api.github.com/users/${username}/repos?type=${type}&sort=${sort}&direction=${direction}&per_page=${per_page}&page=${page}` , true)
    xhr.send()
}
```

___

### 

![cheers](https://github.githubassets.com/images/icons/emoji/unicode/1f942.png?v8)

 _And that's all folks!_

Se você leu esse documento até o final, está de parabéns! Programação é isso mesmo, muito estudo, prática, pesquisa, documentação... Mas vale todo o esforço!

Ficou com alguma dúvida? Não hestite em entrar em contato - estarei à disposição para te ajudar!

### Obrigado!

___

**Vamos nos conectar?**
Se quiser trocar idéias, experiências e figurinhas, entre em contato comigo!

**Marcelo Diament** | Desenvolvedor Front End Pleno e Instrutor

[Github][Github] | [LinkedIn][LinkedIn]

[//]: # 

[Github]: <https://github.com/Marcelo-Diament>
[LinkedIn]: <https://linkedin.com/in/marcelodiament>
[Insomnia]: <https://insomnia.rest/download/#windows>
[Postman]: <https://www.postman.com/>

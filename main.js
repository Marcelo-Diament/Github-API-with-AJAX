window.onload = () => {

  /**
   * @function $
   * Retorna o resultado da seleção desejada através do argumento enviado
   * @param {String} selection - Representa o seletor desejado (igual do CSS)
   * @returns - Retorna o(s) elemento(s) selecionado(s)
   * @example $('body') - retorna a tag <body></body>, equivale a document.querySelector('body')
   * @example $('#meuId') - retorna a tag de id 'meuId', equivale a document.querySelector('#meuId')
   */
  const $ = (selection) => {
    return document.querySelectorAll(selection).length === 1
      ? document.querySelector(selection)
      : document.querySelectorAll(selection)
  }

  /**
   * @function addContentASHTML
   * - Adiciona HTML ao final do elemento selecionado (dentro dele, como último elemento interno)
   * @param {String} selector - referência (seletor como string) ao elemento HTML no qual será inserido o 'content'
   * @param {String} content - HTML a ser inserido
   * @returns - Insere o HTML ('content') dentro do elemento HTML selecionado ('selector')
   * @example - addContentAsHTML($('body'),'<h1>Meu Título</h1>')
   */
  const addContentAsHTML = (selector, content) => $(selector).innerHTML += content;

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

  let githubEmojisContainer = '<section id="githubEmojisContainer" class="my-3"><div id="githubEmojisContent"></div></section>'
  addContentAsHTML('main', githubEmojisContainer)
  let githubEmojisContent = '#githubEmojisContent';

  let userContainer = '<section id="userContainer" class="my-3"><div id="userContent" class="d-flex flex-row flex-nowrap justify-content-between align-items-start"></div></section>'
  addContentAsHTML('main', userContainer)
  let userContent = '#userContent';

  let reposContainer = '<section id="reposContainer" class="my-3"><div id="reposContent"></div></section>'
  addContentAsHTML('main', reposContainer)
  let reposContent = '#reposContent';

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

  /**
   * @function getEmojis
   * Retorna todos os emojis do Github e os imprime no front do nosso site
   */
  getEmojis = () => {
    xhr = makeRequest();
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        clearAllDinamicContent();
        emojis = JSON.parse(this.responseText);
        let content = `<article class="emojis"><h2>emojis</h2><ul type="none" class="row">`;
        for (prop in emojis) {
          content += `
            <li id="${prop}" class="col-6 col-sm-4 col-md-3 col-lg-2 my-3">
              <div class="d-flex flex-column flex-nowrap justify-content-center align-items-center p-3 bg-light border rounded-lg">
                <img src="${emojis[prop]}" width="50" height="50"/>
                <small class="text-center mt-3 text-black-50 font-weight-bold">${prop}</small>
              </div>
            </li>
          `;
        }
        content += '</ul></article>';
        addContentAsHTML(githubEmojisContent, content);
      }
    };
    xhr.open('GET', `https://api.github.com/emojis`, true);
    xhr.send();
  }

  /**
   * @function getUserInfos
   * Retorna as informações do usuário Github
   * @param {String} username - Nome de usuário no Github (exatamente como foi cadastrado)
   * @returns - Retorna as informações do usuário (inclusive mais links que permitem novas requisições)
   * @example - getUserInfos('Marcelo-Diament')
   */
  getUserInfos = username => {
    xhr = makeRequest();
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        clearAllDinamicContent();
        infos = JSON.parse(this.responseText);
        let createdAt = new Date(infos.created_at).toLocaleDateString(),
          updatedAt = new Date(infos.updated_at).toLocaleDateString(),
          nome = infos.login.replace(/-/g, ' '),
          bio = infos.bio,
          avatar = infos.avatar_url;
        let content = `
          <img src="${avatar}" alt="Imagem de perfil do usuário ${nome}"
          height="120" width="120" class="mr-2">
          <div>
            <h2>${nome}</h2>
            <small>desde: ${createdAt} | última atualização: ${updatedAt}</small>
          </div>
          <div>
            <p>${bio}</p>
            <button id="btnUserRepos" class="btn btn-primary my-2"
              onclick="getUserRepos(\'${nome.replace(' ', '-')}\');">Repositórios User GitHub</button>
          </div>
        `;
        addContentAsHTML(userContent, content);
      }
    };
    xhr.open('GET', `https://api.github.com/users/${username}`, true);
    xhr.send();
  }

}
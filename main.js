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

}
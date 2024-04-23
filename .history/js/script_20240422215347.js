document.addEventListener("DOMContentLoaded", function () {
  carregarDados();

  document
    .getElementById("data-vencimento")
    .addEventListener("input", formatarData);

  document.getElementById("ean").addEventListener("input", function () {
    var eanSelecionado = document.getElementById("ean").value;
    preencherDescricaoPorEAN(eanSelecionado);
  });
});

function formatarData() {
  let inputData = document.getElementById("data-vencimento").value;

  let dataFormatada = inputData.replace(/^(\d{2})(\d{2})(\d{2})$/, "$1/$2/$3");

  document.getElementById("data-vencimento").value = dataFormatada;
}

function preencherDescricaoPorEAN(ean) {
  fetch("../json/cadastro.json")
    .then((response) => response.json())
    .then((data) => {
      const mercados = data.mercados;

      for (let mercado of mercados) {
        const produto = mercado.produtos.find(
          (produto) => produto.codigoEAN === ean
        );
        if (produto) {
          document.getElementById("descricao-produto").value =
            produto.descricao;
          return; // Encerra o loop assim que encontrar o produto correspondente
        }
      }

      // Se não encontrou nenhum produto com o código EAN correspondente
      document.getElementById("descricao-produto").value =
        "Produto não encontrado";
    })
    .catch((error) => {
      console.error("Erro ao carregar os dados do arquivo JSON:", error);
    });
}

function carregarDados() {
  fetch("../js")
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Erro ao carregar os dados");
      }
    })
    .then((data) => {
      if (data && data.mercados) {
        const mercados = data.mercados.map((mercado) => mercado.nome);
        const codigosEAN = data.mercados.map((mercado) => mercado.codigoEAN);
        const enderecos = data.mercados.map((mercado) => mercado.endereco);

        autocomplete(document.getElementById("nome-cliente"), mercados, data);
        autocomplete(document.getElementById("ean"), codigosEAN);
        autocomplete(
          document.getElementById("endereco-cliente"),
          enderecos,
          data
        );
      } else {
        console.error("Formato de dados inválido");
      }
    })
    .catch((error) => {
      console.error("Erro ao carregar os dados do arquivo JSON:", error);
    });
}
function autocomplete(inp, arr, data) {
  var currentFocus;

  inp.addEventListener("input", function (e) {
    var a,
      b,
      i,
      val = this.value;
    closeAllLists();
    if (!val) {
      return false;
    }
    currentFocus = -1;
    a = document.createElement("DIV");
    a.setAttribute("id", "autocomplete-list-id");
    a.setAttribute("class", "autocomplete-items");
    this.parentNode.appendChild(a);
    for (i = 0; i < arr.length; i++) {
      if (
        arr[i] &&
        arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()
      ) {
        b = document.createElement("DIV");
        b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
        b.innerHTML += arr[i].substr(val.length);
        b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
        b.addEventListener("click", function (e) {
          inp.value = this.getElementsByTagName("input")[0].value;
          closeAllLists();
          // Preencher o campo de Endereço do mercado ao selecionar o nome do mercado
          var selectedMarket = this.getElementsByTagName("input")[0].value;
          var mercadoSelecionado = data.mercados.find(
            (mercado) => mercado.nome === selectedMarket
          );
          if (mercadoSelecionado) {
            var enderecoCompleto =
              mercadoSelecionado.endereco.rua +
              ", " +
              mercadoSelecionado.endereco.bairro +
              ", " +
              mercadoSelecionado.endereco.cidade +
              ", " +
              mercadoSelecionado.endereco.estado;
            document.getElementById("endereco-cliente").value =
              enderecoCompleto;
          }
        });
        a.appendChild(b);
      }
    }
  });

  function closeAllLists(elmnt) {
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }

  document.addEventListener("click", function (e) {
    closeAllLists(e.target);
  });
}

const menuIcon = document.getElementById("menu-icon");
const menuOptions = document.getElementById("menu-options");

menuIcon.addEventListener("click", function () {
  if (menuOptions.style.display === "none") {
    menuOptions.style.display = "block";
  } else {
    menuOptions.style.display = "none";
  }
});

document.getElementById("btn-salvar").addEventListener("click", function () {
  const nomePromotor = document.getElementById("nome-promotor").value;
  const nomeCliente = document.getElementById("nome-cliente").value;
  const enderecoCliente = document.getElementById("endereco-cliente").value;
  const ean = document.getElementById("ean").value;
  const descricaoProduto = document.getElementById("descricao-produto").value;
  const dataVencimento = document.getElementById("data-vencimento").value;
  const quantidadeProdutos = document.getElementById(
    "quantidade-produtos"
  ).value;

  fetch("https://v1controledatas.pythonanywhere.com/salvar-dados", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nomePromotor: nomePromotor,
      nomeCliente: nomeCliente,
      enderecoCliente: enderecoCliente,
      ean: ean,
      descricaoProduto: descricaoProduto,
      dataVencimento: dataVencimento,
      quantidadeProdutos: quantidadeProdutos,
    }),
  })
    .then((response) => {
      if (response.ok) {
        alert("Dados salvos com sucesso!");
      } else {
        throw new Error("Erro ao salvar os dados");
      }
    })
    .catch((error) => {
      console.error("Erro ao salvar os dados:", error);
    });
});


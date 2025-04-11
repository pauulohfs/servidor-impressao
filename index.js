const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const escpos = require("escpos");
escpos.USB = require("escpos-usb");

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

app.post("/imprimir", async (req, res) => {
  try {
    const { cliente, comanda, produtos } = req.body;

    const device = new escpos.USB(); // Detecta a primeira impressora disponível
    const printer = new escpos.Printer(device, {
      encoding: 'CP860' 
    });

    device.open((error) => {
      if (error) {
        console.error("Erro ao abrir a conexão com a impressora:", error);
        return res.status(500).send("Erro ao conectar à impressora");
      }

      // Cabeçalho
      printer
      .align("ct")
      .style("normal")
      .text("╔════════════════════════╗")
      .text("     Comanda TechMeal     ")
      .text("╚════════════════════════╝")
      .text("")
      .align("lt");

      // Dados do cliente e comanda
      printer
        .text(`Cliente: ${cliente.nomeCliente}`)
        .text(`ID Comanda: ${comanda.idCompraComanda}`)
        .text(`Entrada: ${comanda.horaEntradaComanda}`)
        .text(`Saída: ${comanda.horaSaidaComanda}`)
        .text("--------------------------------");

      // Valores financeiros
      printer
        .text("Valores:")
        .text(`Saldo antes:  R$ ${comanda.saldoAntigo.toFixed(2)}`)
        .text(`Limite antes: R$ ${comanda.limiteAntigo.toFixed(2)}`)
        .text(`Saldo atual:  R$ ${cliente.saldoCliente.toFixed(2)}`)
        .text(`Limite atual: R$ ${cliente.faturaCliente.toFixed(2)}`)
        .text("--------------------------------");

      // Produtos
      printer.text("Produtos:");
      produtos.forEach(p => {
        printer.text(`- ${p.nomeProduto} (x${p.quantidade}) - R$ ${p.precoProduto.toFixed(2)}`);
      });

      // Total com elegância
      printer
        .text("--------------------------------")
        .align("ct")
        .style("b")
        .text(`TOTAL : R$ ${comanda.valorTotalComanda.toFixed(2)}`)
        .style("normal")
        .text("")
        .text("Obrigado pela preferência!")
        .text("")
        .cut()
        .close(() => {
          console.log("🖨️ Impressão enviada com sucesso!");
          res.send("🖨️ Impressão enviada com sucesso!");
        });
    });

  } catch (error) {
    console.error("Erro ao imprimir:", error);
    res.status(500).send("Erro na impressão");
  }
});

app.listen(port, () => {
  console.log(` Servidor de impressão rodando em http://localhost:${port}`);
});

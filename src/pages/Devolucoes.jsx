import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function Devolucoes({ estoque, registrarDevolucao }) {
  const [carrinho, setCarrinho] = useState([]);
  const [codigoBarras, setCodigoBarras] = useState('');
  
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [qtdManual, setQtdManual] = useState(1);

  const [nomeCliente, setNomeCliente] = useState('');
  const [motivo, setMotivo] = useState('Desistência / Arrependimento');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (codigoBarras.trim() !== '') {
        adicionarItem(codigoBarras.trim(), 1, true);
      }
    }
  };

  const adicionarItemManual = () => {
    if (!produtoSelecionado) return toast.warn("Selecione um produto.");
    adicionarItem(produtoSelecionado, qtdManual, false);
  };

  const adicionarItem = (identificador, qtdAdicionar, isSku) => {
    const idLimpo = String(identificador).trim().toUpperCase();

    const produto = isSku 
      ? estoque.find(i => String(i.sku).trim().toUpperCase() === idLimpo) 
      : estoque.find(i => i.id === identificador);

    if (!produto) {
      toast.error(`Item não localizado no banco de dados! (Buscado: ${idLimpo})`);
      setCodigoBarras('');
      return;
    }

    const qtd = Number(qtdAdicionar);
    const itemExistente = carrinho.find(item => item.id === produto.id);

    if (itemExistente) {
      setCarrinho(carrinho.map(item => 
        item.id === produto.id 
          ? { ...item, quantidade: item.quantidade + qtd, subtotal: (item.quantidade + qtd) * item.valor_venda } 
          : item
      ));
    } else {
      setCarrinho([...carrinho, {
        id: produto.id,
        sku: produto.sku,
        nome: produto.nome,
        valor_venda: produto.valor_venda || 0,
        quantidade: qtd,
        subtotal: qtd * (produto.valor_venda || 0)
      }]);
    }

    setCodigoBarras('');
    setQtdManual(1);
    setProdutoSelecionado('');
  };

  const removerItem = (id) => { setCarrinho(carrinho.filter(item => item.id !== id)); };

  const finalizarOperacao = () => {
    if (carrinho.length === 0) return toast.warn("Nenhum item na lista de devolução.");
    
    registrarDevolucao(carrinho, nomeCliente || 'Não Informado', motivo);
    
    setCarrinho([]);
    setNomeCliente('');
    setMotivo('Desistência / Arrependimento');
  };

  const totalEstornado = carrinho.reduce((acc, item) => acc + item.subtotal, 0);

  return (
    <div className="atlas-container">
      <header className="atlas-header">
        <div>
          <h1>Logística Reversa (Devoluções)</h1>
          <p>Receba múltiplos itens e estorne o valor para o cliente</p>
        </div>
      </header>

      <div className="atlas-grid grid-start">
        <div className="coluna-flex">
          
          <div className="atlas-card border-top-laranja">
            <div className="card-titulo"> Scanner de Produto Retornado</div>
            <div className="atlas-linha">
              <div className="atlas-campo w-100">
                <input 
                  type="text" 
                  value={codigoBarras} 
                  onChange={(e) => setCodigoBarras(e.target.value)} 
                  onKeyDown={handleKeyDown} 
                  placeholder="Bipe o item devolvido ou digite o SKU..." 
                  className="input-destaque-centro input-amarelo"
                />
              </div>
            </div>
            
            <hr className="separador-tracejado" />
            
            <div className="card-titulo">🛒 Inserção Manual</div>
            <div className="atlas-linha">
              <div className="atlas-campo flex-2">
                <label>Localizar Mercadoria</label>
                <select value={produtoSelecionado} onChange={(e) => setProdutoSelecionado(e.target.value)}>
                  <option value="">Selecione...</option>
                  {estoque.map(i => (<option key={i.id} value={i.id}>{i.nome}</option>))}
                </select>
              </div>
              <div className="atlas-campo">
                <label>Qtd</label><input type="number" min="1" value={qtdManual} onChange={(e) => setQtdManual(e.target.value)} />
              </div>
            </div>
            <button className="botao-secundario w-100 mt-15" onClick={adicionarItemManual}> Adicionar à Lista de Estorno</button>
          </div>

          <div className="atlas-card">
            <div className="card-titulo"> Dados do Estorno</div>
            <div className="atlas-linha">
              <div className="atlas-campo"><label>Cliente</label><input type="text" value={nomeCliente} onChange={e => setNomeCliente(e.target.value)} /></div>
              <div className="atlas-campo"><label>Motivo da Devolução</label><input type="text" value={motivo} onChange={e => setMotivo(e.target.value)} /></div>
            </div>
          </div>
        </div>

        <div className="atlas-card card-borda-vermelha">
          <div className="card-titulo"> Itens a Retornar para o Estoque</div>
          
          <div className="container-tabela-carrinho">
            <table className="atlas-tabela">
              <thead><tr><th>Item</th><th>Qtd</th><th>Estorno R$</th><th></th></tr></thead>
              <tbody>
                {carrinho.map(item => (
                  <tr key={item.id}>
                    <td><strong>{item.nome}</strong></td>
                    <td className="texto-centro">{item.quantidade}</td>
                    <td className="texto-vermelho-bold">{item.subtotal.toFixed(2)}</td>
                    <td><button onClick={() => removerItem(item.id)} className="botao-link texto-vermelho-bold">X</button></td>
                  </tr>
                ))}
                {carrinho.length === 0 && (
                  <tr><td colSpan="4" className="texto-centro-vazio">Nenhum item adicionado.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="totalizador-estorno">
            <span className="totalizador-estorno-label">TOTAL A ESTORNAR:</span>
            <div className="totalizador-estorno-valor">R$ {totalEstornado.toFixed(2)}</div>
          </div>
          
          <button className="botao-primario botao-saida w-100 mt-20 btn-gigante" onClick={finalizarOperacao}>
            Processar Devolução e Estorno
          </button>
        </div>

      </div>
    </div>
  );
}
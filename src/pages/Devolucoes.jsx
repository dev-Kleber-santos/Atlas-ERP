import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function Devolucoes({ estoque, registrarDevolucao, gerarReciboDevolucaoPDF, maskCNPJ, maskCPF, maskTelefone }) {
  const [carrinho, setCarrinho] = useState([]);
  
  const [codigoBarras, setCodigoBarras] = useState('');
  const [skuBusca, setSkuBusca] = useState('');
  const [qtdManual, setQtdManual] = useState(1);

  // Campos específicos da Devolução
  const [numeroVendaRef, setNumeroVendaRef] = useState('');
  const [dataVendaRef, setDataVendaRef] = useState('');
  const [motivo, setMotivo] = useState('');

  const [nomeCliente, setNomeCliente] = useState('');
  const [docCliente, setDocCliente] = useState('');
  const [foneCliente, setFoneCliente] = useState('');

  const handleKeyDownBarra = (e) => {
    if (e.key === 'Enter' && codigoBarras.trim() !== '') {
      e.preventDefault();
      adicionarItem(codigoBarras.trim(), qtdManual, 'barra');
    }
  };

  const handleKeyDownSku = (e) => {
    if (e.key === 'Enter' && skuBusca.trim() !== '') {
      e.preventDefault();
      adicionarItem(skuBusca.trim(), qtdManual, 'sku');
    }
  };

  const acaoBotaoAdicionar = () => {
    if (codigoBarras.trim() !== '') {
      adicionarItem(codigoBarras.trim(), qtdManual, 'barra');
    } else if (skuBusca.trim() !== '') {
      adicionarItem(skuBusca.trim(), qtdManual, 'sku');
    } else {
      toast.warn("Selecione um produto pelo Codigo de Barras ou SKU primeiro.");
    }
  };

  const adicionarItem = (identificador, qtdAdicionar, tipoBusca) => {
    const idLimpo = String(identificador).trim().toUpperCase();
    let produto;

    if (tipoBusca === 'barra') {
      produto = estoque.find(i => String(i.codigo_barra || '').trim() === idLimpo);
    } else {
      produto = estoque.find(i => String(i.sku).trim().toUpperCase() === idLimpo);
    }

    if (!produto) {
      toast.error(`Item nao localizado no estoque! Verifique o codigo.`);
      setCodigoBarras('');
      setSkuBusca('');
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
    setSkuBusca('');
    setQtdManual(1);
  };

  const removerItem = (id) => {
    setCarrinho(carrinho.filter(item => item.id !== id));
  };

  const finalizarOperacao = (imprimir) => {
    if (carrinho.length === 0) return toast.warn("A lista de devolução esta vazia.");
    if (!numeroVendaRef) return toast.warn("Informe o número do Cupom/Venda original.");
    if (!dataVendaRef) return toast.warn("Informe a data da venda original.");
    if (!motivo) return toast.warn("Informe o motivo da devolucao.");

    const clienteCompleto = `${nomeCliente || 'Cliente Nao Informado'} | Doc: ${docCliente || 'Sem Doc'} | Tel: ${foneCliente || 'Sem Tel'}`;
    const total = carrinho.reduce((acc, item) => acc + item.subtotal, 0);
    
    // Chama a função do App.jsx enviando os novos dados
    registrarDevolucao(carrinho, clienteCompleto, motivo, numeroVendaRef, dataVendaRef);
    
    if (imprimir) {
      gerarReciboDevolucaoPDF(carrinho, clienteCompleto, motivo, numeroVendaRef, dataVendaRef, total);
    }

    setCarrinho([]);
    setNomeCliente('');
    setDocCliente('');
    setFoneCliente('');
    setNumeroVendaRef('');
    setDataVendaRef('');
    setMotivo('');
  };

  const totalDevolucao = carrinho.reduce((acc, item) => acc + item.subtotal, 0);

  return (
    <div className="atlas-container">
      <header className="atlas-header">
        <div>
          <h1>Logística Reversa (Devoluções)</h1>
          <p>Retorno de mercadoria e estorno de valores</p>
        </div>
      </header>

      <div className="atlas-grid grid-start">
        <div className="coluna-flex">
          
          <div className="atlas-card">
            <div className="card-titulo">Dados da Venda Original</div>
            <div className="atlas-linha">
              <div className="atlas-campo flex-2">
                <label>Número da Venda (Ex: 12)</label>
                <input type="number" min="1" value={numeroVendaRef} onChange={e => setNumeroVendaRef(e.target.value)} placeholder="0000" />
              </div>
              <div className="atlas-campo flex-2">
                <label>Data da Compra</label>
                <input type="date" value={dataVendaRef} onChange={e => setDataVendaRef(e.target.value)} />
              </div>
            </div>
            <div className="atlas-linha mt-15">
              <div className="atlas-campo w-100">
                <label>Motivo da Devolução *</label>
                <select value={motivo} onChange={e => setMotivo(e.target.value)}>
                  <option value="">Selecione...</option>
                  <option value="Defeito de Fabrica">Defeito de Fábrica</option>
                  <option value="Arrependimento (Prazo 7 dias)">Arrependimento (Prazo 7 dias)</option>
                  <option value="Produto Enviado Errado">Produto Enviado Errado</option>
                  <option value="Avaria no Transporte">Avaria no Transporte</option>
                </select>
              </div>
            </div>
          </div>

          <div className="atlas-card">
            <div className="card-titulo">Bipar Itens Devolvidos</div>
            <div className="atlas-linha">
              <div className="atlas-campo w-100">
                <label>Leitor de Código de Barras (EAN)</label>
                <input type="text" list="lista-barras-dev" value={codigoBarras} onChange={(e) => { setCodigoBarras(e.target.value); setSkuBusca(''); }} onKeyDown={handleKeyDownBarra} placeholder="Bipe ou selecione..." className="input-destaque-centro" />
                <datalist id="lista-barras-dev">{estoque.filter(i => i.codigo_barra).map(i => (<option key={`bar-${i.id}`} value={i.codigo_barra}>{i.nome}</option>))}</datalist>
              </div>
            </div>
            <div className="atlas-linha mt-15">
              <div className="atlas-campo flex-2">
                <label>Pesquisa por SKU</label>
                <input type="text" list="lista-skus-dev" value={skuBusca} onChange={(e) => { setSkuBusca(e.target.value); setCodigoBarras(''); }} onKeyDown={handleKeyDownSku} placeholder="Digite o SKU ou selecione..." className="input-destaque-centro" />
                <datalist id="lista-skus-dev">{estoque.map(i => (<option key={`sku-${i.id}`} value={i.sku}>{i.nome}</option>))}</datalist>
              </div>
              <div className="atlas-campo">
                <label>Qtd</label>
                <input type="number" min="1" value={qtdManual} onChange={(e) => setQtdManual(e.target.value)} className="input-destaque-centro" />
              </div>
            </div>
            <button className="botao-secundario w-100 mt-15" onClick={acaoBotaoAdicionar}>Inserir Item na Devolução</button>
          </div>

          <div className="atlas-card">
            <div className="card-titulo">Dados do Comprador</div>
            <div className="atlas-linha"><div className="atlas-campo w-100"><label>Nome / Razao Social</label><input type="text" value={nomeCliente} onChange={e => setNomeCliente(e.target.value)} /></div></div>
            <div className="atlas-linha mt-15">
              <div className="atlas-campo"><label>CPF / CNPJ</label><input type="text" value={docCliente} onChange={(e) => setDocCliente(e.target.value.length > 14 ? maskCNPJ(e.target.value) : maskCPF(e.target.value))} /></div>
              <div className="atlas-campo"><label>Telefone</label><input type="text" value={foneCliente} onChange={(e) => setFoneCliente(maskTelefone(e.target.value))} /></div>
            </div>
          </div>
        </div>

        <div className="atlas-card">
          <div className="card-titulo">Resumo do Estorno</div>
          
          <div className="container-tabela-carrinho">
            <table className="atlas-tabela">
              <thead><tr><th>Item</th><th>Qtd</th><th>Unit R$</th><th>Subtotal</th><th></th></tr></thead>
              <tbody>
                {carrinho.map(item => (
                  <tr key={item.id}>
                    <td><strong>{item.nome}</strong><br/><span className="font-11 texto-cinza">SKU: {item.sku}</span></td>
                    <td className="texto-centro">{item.quantidade}</td>
                    <td>{item.valor_venda.toFixed(2)}</td>
                    <td style={{ fontWeight: 'bold', color: '#e11d48' }}>- {item.subtotal.toFixed(2)}</td>
                    <td><button onClick={() => removerItem(item.id)} className="botao-link">X</button></td>
                  </tr>
                ))}
                {carrinho.length === 0 && (
                  <tr><td colSpan="5" className="texto-centro-vazio">Nenhum item adicionado para devolução.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="totalizador-venda" style={{ background: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3' }}>
            <span className="totalizador-venda-label">VALOR A ESTORNAR:</span>
            <div className="totalizador-venda-valor">R$ {totalDevolucao.toFixed(2)}</div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button className="botao-secundario w-100 btn-gigante" onClick={() => finalizarOperacao(false)}>
              Registrar Retorno
            </button>
            <button className="botao-primario btn-bg-black w-100 btn-gigante" onClick={() => finalizarOperacao(true)}>
              Registrar e Imprimir PDF
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
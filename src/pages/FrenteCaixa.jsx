import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function FrenteCaixa({ estoque, registrarVenda, maskCNPJ, maskCPF, maskTelefone, caixaAtivo }) {
  const [carrinho, setCarrinho] = useState([]);
  
  const [codigoBarras, setCodigoBarras] = useState('');
  const [skuBusca, setSkuBusca] = useState('');
  const [qtdManual, setQtdManual] = useState(1);

  const [nomeCliente, setNomeCliente] = useState('');
  const [docCliente, setDocCliente] = useState('');
  const [foneCliente, setFoneCliente] = useState('');

  if (!caixaAtivo) {
    return (
      <div className="atlas-container">
        <div className="tela-bloqueada" style={{ marginTop: '50px' }}>
          <h2 className="titulo-escuro">🚫 CAIXA FECHADO</h2>
          <p className="texto-cinza">Voce nao pode realizar vendas no momento.</p>
          <p className="texto-cinza font-12 mt-10">Va no menu "Vendas & PDV" &gt; "Controle de Caixa" e abra um novo turno com o troco inicial.</p>
        </div>
      </div>
    );
  }

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
    let produto = tipoBusca === 'barra' 
      ? estoque.find(i => String(i.codigo_barra || '').trim() === idLimpo)
      : estoque.find(i => String(i.sku).trim().toUpperCase() === idLimpo);

    if (!produto) {
      toast.error(`Item nao localizado no estoque! Verifique o codigo.`);
      setCodigoBarras(''); setSkuBusca(''); return;
    }

    const qtd = Number(qtdAdicionar);
    const itemExistente = carrinho.find(item => item.id === produto.id);
    const qtdJaNoCarrinho = itemExistente ? itemExistente.quantidade : 0;

    if (produto.quantidade < (qtdJaNoCarrinho + qtd)) {
      toast.error(`Estoque insuficiente! Saldo fisico: ${produto.quantidade} un.`);
      return;
    }

    if (itemExistente) {
      setCarrinho(carrinho.map(item => item.id === produto.id ? { ...item, quantidade: item.quantidade + qtd, subtotal: (item.quantidade + qtd) * item.valor_venda } : item));
    } else {
      // AQUI ESTAVA O SEGREDO: Agora estamos salvando a url_imagem no carrinho também
      setCarrinho([...carrinho, { 
        id: produto.id, 
        sku: produto.sku, 
        nome: produto.nome, 
        valor_venda: produto.valor_venda || 0, 
        quantidade: qtd, 
        subtotal: qtd * (produto.valor_venda || 0),
        url_imagem: produto.url_imagem 
      }]);
    }

    setCodigoBarras(''); setSkuBusca(''); setQtdManual(1);
  };

  const removerItem = (id) => setCarrinho(carrinho.filter(item => item.id !== id));

  const finalizarOperacao = (imprimir) => {
    if (carrinho.length === 0) return toast.warn("O carrinho esta vazio.");
    const clienteCompleto = `${nomeCliente || 'Consumidor Final'} | Doc: ${docCliente || 'Sem Doc'} | Tel: ${foneCliente || 'Sem Tel'}`;
    registrarVenda(carrinho, clienteCompleto, imprimir);
    setCarrinho([]); setNomeCliente(''); setDocCliente(''); setFoneCliente('');
  };

  const totalVenda = carrinho.reduce((acc, item) => acc + item.subtotal, 0);

  return (
    <div className="atlas-container">
      <header className="atlas-header">
        <div>
          <h1>Frente de Caixa (PDV)</h1>
          <p>Leitor de codigo de barras, SKU e faturamento</p>
        </div>
      </header>

      <div className="atlas-grid grid-start">
        <div className="coluna-flex">
          <div className="atlas-card">
            <div className="card-titulo">Localizar Produto</div>
            <div className="atlas-linha">
              <div className="atlas-campo w-100">
                <label>Leitor de Código de Barras (EAN)</label>
                <input type="text" list="lista-barras" value={codigoBarras} onChange={(e) => { setCodigoBarras(e.target.value); setSkuBusca(''); }} onKeyDown={handleKeyDownBarra} placeholder="Bipe ou selecione..." className="input-destaque-centro" autoFocus />
                <datalist id="lista-barras">{estoque.filter(i => i.codigo_barra).map(i => (<option key={`bar-${i.id}`} value={i.codigo_barra}>{i.nome}</option>))}</datalist>
              </div>
            </div>
            <hr className="separador-tracejado" />
            <div className="atlas-linha">
              <div className="atlas-campo flex-2">
                <label>Pesquisa por SKU / Código Interno</label>
                <input type="text" list="lista-skus" value={skuBusca} onChange={(e) => { setSkuBusca(e.target.value); setCodigoBarras(''); }} onKeyDown={handleKeyDownSku} placeholder="Digite o SKU ou selecione..." className="input-destaque-centro" />
                <datalist id="lista-skus">{estoque.map(i => (<option key={`sku-${i.id}`} value={i.sku}>{i.nome} (Estoque: {i.quantidade})</option>))}</datalist>
              </div>
              <div className="atlas-campo">
                <label>Qtd</label>
                <input type="number" min="1" value={qtdManual} onChange={(e) => setQtdManual(e.target.value)} className="input-destaque-centro" />
              </div>
            </div>
            <button className="botao-secundario w-100 mt-15" onClick={acaoBotaoAdicionar}>Adicionar à Lista</button>
          </div>
          <div className="atlas-card">
            <div className="card-titulo">Dados do Comprador</div>
            <div className="atlas-linha"><div className="atlas-campo w-100"><label>Nome / Razao Social</label><input type="text" value={nomeCliente} onChange={e => setNomeCliente(e.target.value)} /></div></div>
            <div className="atlas-linha mt-15"><div className="atlas-campo"><label>CPF / CNPJ</label><input type="text" value={docCliente} onChange={(e) => setDocCliente(e.target.value.length > 14 ? maskCNPJ(e.target.value) : maskCPF(e.target.value))} /></div><div className="atlas-campo"><label>Telefone</label><input type="text" value={foneCliente} onChange={(e) => setFoneCliente(maskTelefone(e.target.value))} /></div></div>
          </div>
        </div>

        <div className="atlas-card">
          <div className="card-titulo">Resumo do Cupom</div>
          <div className="container-tabela-carrinho">
            <table className="atlas-tabela">
              <thead><tr><th>Item</th><th>Qtd</th><th>Unit R$</th><th>Subtotal</th><th></th></tr></thead>
              <tbody>
                {carrinho.map(item => (
                  <tr key={item.id}>
                    <td>
                      {/* Flexbox para alinhar a foto e o texto lado a lado sem quebrar a tabela */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {item.url_imagem ? (
                          <img src={item.url_imagem} alt={item.nome} style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: '38px', height: '38px', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: '#94a3b8', flexShrink: 0 }}>Sem foto</div>
                        )}
                        <div>
                          <strong>{item.nome}</strong><br/>
                          <span className="font-11 texto-cinza">SKU: {item.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="texto-centro">{item.quantidade}</td>
                    <td>{item.valor_venda.toFixed(2)}</td>
                    <td style={{ fontWeight: 'bold' }}>{item.subtotal.toFixed(2)}</td>
                    <td><button onClick={() => removerItem(item.id)} className="botao-link">X</button></td>
                  </tr>
                ))}
                {carrinho.length === 0 && ( <tr><td colSpan="5" className="texto-centro-vazio">O carrinho esta vazio. Insira um produto.</td></tr> )}
              </tbody>
            </table>
          </div>
          <div className="totalizador-venda">
            <span className="totalizador-venda-label">TOTAL A PAGAR:</span>
            <div className="totalizador-venda-valor">R$ {totalVenda.toFixed(2)}</div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button className="botao-secundario w-100 btn-gigante" onClick={() => finalizarOperacao(false)}>Apenas Finalizar</button>
            <button className="botao-primario btn-bg-black w-100 btn-gigante" onClick={() => finalizarOperacao(true)}>Finalizar e Imprimir NF</button>
          </div>
        </div>
      </div>
    </div>
  );
}
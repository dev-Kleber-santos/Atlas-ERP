import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function FrenteCaixa({ estoque, registrarVenda, maskCNPJ, maskCPF, maskTelefone }) {
  const [carrinho, setCarrinho] = useState([]);
  const [codigoBarras, setCodigoBarras] = useState('');
  
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [qtdManual, setQtdManual] = useState(1);

  const [nomeCliente, setNomeCliente] = useState('');
  const [docCliente, setDocCliente] = useState('');
  const [foneCliente, setFoneCliente] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (codigoBarras.trim() !== '') {
        adicionarItem(codigoBarras.trim(), 1, true);
      }
    }
  };

  const adicionarItemManual = () => {
    if (!produtoSelecionado) return toast.warn("Selecione um produto da lista.");
    adicionarItem(produtoSelecionado, qtdManual, false);
  };

  const adicionarItem = (identificador, qtdAdicionar, isSku) => {
    const idLimpo = String(identificador).trim().toUpperCase();

    const produto = isSku 
      ? estoque.find(i => String(i.sku).trim().toUpperCase() === idLimpo) 
      : estoque.find(i => i.id === identificador);

    if (!produto) {
      toast.error(`Item nao localizado no estoque!`);
      setCodigoBarras('');
      return;
    }

    const qtd = Number(qtdAdicionar);
    const itemExistente = carrinho.find(item => item.id === produto.id);
    const qtdJáNoCarrinho = itemExistente ? itemExistente.quantidade : 0;

    if (produto.quantidade < (qtdJáNoCarrinho + qtd)) {
      toast.error(`Estoque insuficiente! Saldo fisico: ${produto.quantidade} un.`);
      setCodigoBarras('');
      return;
    }

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

  const removerItem = (id) => {
    setCarrinho(carrinho.filter(item => item.id !== id));
  };

  const finalizarOperacao = () => {
    if (carrinho.length === 0) return toast.warn("O carrinho esta vazio.");
    const clienteCompleto = `${nomeCliente || 'Consumidor Final'} | Doc: ${docCliente || 'Sem Doc'} | Tel: ${foneCliente || 'Sem Tel'}`;
    
    registrarVenda(carrinho, clienteCompleto);
    
    setCarrinho([]);
    setNomeCliente('');
    setDocCliente('');
    setFoneCliente('');
  };

  const totalVenda = carrinho.reduce((acc, item) => acc + item.subtotal, 0);

  return (
    <div className="atlas-container">
      <header className="atlas-header">
        <div>
          <h1>Frente de Caixa (PDV)</h1>
          <p>Leitor de codigo de barras e registro de itens</p>
        </div>
      </header>

      <div className="atlas-grid grid-start">
        <div className="coluna-flex">
          
          <div className="atlas-card">
            <div className="card-titulo">Scanner de Produto</div>
            <div className="atlas-linha">
              <div className="atlas-campo w-100">
                <label>Codigo de Barras (SKU)</label>
                <input 
                  type="text" 
                  value={codigoBarras} 
                  onChange={(e) => setCodigoBarras(e.target.value)} 
                  onKeyDown={handleKeyDown} 
                  placeholder="Aguardando leitura do codigo..." 
                  className="input-destaque-centro"
                  autoFocus
                />
              </div>
            </div>
            
            <hr className="separador-tracejado" />
            
            <div className="card-titulo">Insercao Manual</div>
            <div className="atlas-linha">
              <div className="atlas-campo flex-2">
                <label>Localizar Mercadoria</label>
                <select value={produtoSelecionado} onChange={(e) => setProdutoSelecionado(e.target.value)}>
                  <option value="">Selecione...</option>
                  {estoque.filter(i => i.quantidade > 0).map(i => (
                    <option key={i.id} value={i.id}>{i.nome} (Estoque: {i.quantidade} | R$ {Number(i.valor_venda || 0).toFixed(2)})</option>
                  ))}
                </select>
              </div>
              <div className="atlas-campo">
                <label>Qtd</label>
                <input type="number" min="1" value={qtdManual} onChange={(e) => setQtdManual(e.target.value)} />
              </div>
            </div>
            <button className="botao-secundario w-100 mt-15" onClick={adicionarItemManual}>Adicionar a Lista</button>
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
          <div className="card-titulo">Resumo do Cupom</div>
          
          <div className="container-tabela-carrinho">
            <table className="atlas-tabela">
              <thead><tr><th>Item</th><th>Qtd</th><th>Unit R$</th><th>Subtotal</th><th></th></tr></thead>
              <tbody>
                {carrinho.map(item => (
                  <tr key={item.id}>
                    <td><strong>{item.nome}</strong><br/><span className="font-11 texto-cinza">SKU: {item.sku}</span></td>
                    <td className="texto-centro">{item.quantidade}</td>
                    <td>{item.valor_venda.toFixed(2)}</td>
                    <td style={{ fontWeight: 'bold' }}>{item.subtotal.toFixed(2)}</td>
                    <td><button onClick={() => removerItem(item.id)} className="botao-link">X</button></td>
                  </tr>
                ))}
                {carrinho.length === 0 && (
                  <tr><td colSpan="5" className="texto-centro-vazio">O carrinho esta vazio. Bipe um produto.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'right' }}>
            <span style={{ fontSize: '14px', color: '#475569', fontWeight: 'bold' }}>TOTAL A PAGAR:</span>
            <div style={{ fontSize: '36px', color: '#0f172a', fontWeight: '900' }}>R$ {totalVenda.toFixed(2)}</div>
          </div>
          
          <button className="botao-primario btn-bg-black w-100 mt-20 btn-gigante" onClick={finalizarOperacao}>
            Fechar Conta e Faturar
          </button>
        </div>

      </div>
    </div>
  );
}
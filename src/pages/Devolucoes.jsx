import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function Devolucoes({ 
  estoque, registrarDevolucao, gerarReciboDevolucaoPDF, maskCNPJ, maskCPF, maskTelefone, 
  historicoVendas = [], 
  listaDevolucoes = [] // Trava anti-duplicidade
}) {
  const [carrinho, setCarrinho] = useState([]);
  
  const [numeroVendaRef, setNumeroVendaRef] = useState('');
  const [dataVendaRef, setDataVendaRef] = useState('');
  const [motivo, setMotivo] = useState('');
  const [descartarAvaria, setDescartarAvaria] = useState(false); 

  const [nomeCliente, setNomeCliente] = useState('');
  const [docCliente, setDocCliente] = useState('');
  const [foneCliente, setFoneCliente] = useState('');

  const buscarCupom = () => {
    if (!numeroVendaRef) return toast.warn("Digite o número do Cupom.");
    
    // 1. Pega tudo o que foi VENDIDO naquele cupom
    const itensDoCupom = historicoVendas.filter(v => String(v.numero_venda) === String(numeroVendaRef));

    if (itensDoCupom.length === 0) {
      return toast.error("Cupom não encontrado no histórico. Verifique o número.");
    }

    // EXTRAÇÃO INTELIGENTE DOS DADOS DO CLIENTE
    const stringCliente = itensDoCupom[0].cliente || '';
    const dadosCli = stringCliente.split('|');
    const nomeExtraido = dadosCli[0] ? dadosCli[0].trim() : '';
    const docExtraido = dadosCli[1] ? dadosCli[1].replace(/Doc:|CPF\/CNPJ:|CPF:|CNPJ:/gi, '').trim() : '';
    const telExtraido = dadosCli[2] ? dadosCli[2].replace(/Tel:|Telefone:/gi, '').trim() : '';

    setNomeCliente(!nomeExtraido.toLowerCase().includes('consumidor') ? nomeExtraido : '');
    setDocCliente(docExtraido !== 'Sem Doc' && docExtraido !== 'Nao informado' ? docExtraido : '');
    setFoneCliente(telExtraido !== 'Sem Tel' && telExtraido !== 'Nao informado' ? telExtraido : '');
    
    setDataVendaRef(new Date(itensDoCupom[0].created_at).toISOString().split('T')[0]);

    // =======================================================
    // 2. TRAVA DE DUPLICIDADE: Verifica o que já foi DEVOLVIDO
    // =======================================================
    const devolucoesDesteCupom = listaDevolucoes.filter(d => String(d.numero_venda_ref) === String(numeroVendaRef));
    const itensParaDevolver = [];
    let itensJaDevolvidosTotalmente = 0;

    itensDoCupom.forEach(venda => {
      // Conta quantos itens DESSE produto específico já foram estornados neste cupom
      const qtdJaDevolvida = devolucoesDesteCupom
        .filter(d => d.produto_id === venda.produto_id)
        .reduce((acc, d) => acc + Number(d.quantidade), 0);

      // A quantidade que vem para a tela é só a diferença (O que comprou - O que já devolveu)
      const qtdRestante = Number(venda.quantidade) - qtdJaDevolvida;

      if (qtdRestante > 0) {
        itensParaDevolver.push({
          id: venda.produto_id,
          nome: venda.produto_nome,
          sku: estoque.find(e => e.id === venda.produto_id)?.sku || 'N/A',
          valor_venda: Number(venda.valor_unitario),
          quantidade: qtdRestante, // Só traz o que sobrou
          subtotal: qtdRestante * Number(venda.valor_unitario)
        });
      } else {
        // Se a quantidade restante for zero, marca que ele já foi 100% devolvido
        itensJaDevolvidosTotalmente++;
      }
    });

    // 3. RESULTADO DA BUSCA
    if (itensParaDevolver.length === 0) {
      setCarrinho([]);
      setNomeCliente(''); setDocCliente(''); setFoneCliente('');
      return toast.error("BLOQUEADO: Todos os itens deste cupom já foram estornados anteriormente!");
    }

    setCarrinho(itensParaDevolver);
    
    if (itensJaDevolvidosTotalmente > 0) {
      toast.info(`Atenção: Alguns itens já haviam sido devolvidos e foram ocultados da lista atual.`);
    } else {
      toast.success("Cupom localizado! Confira os itens e o cliente.");
    }
  };

  const removerItem = (id) => {
    setCarrinho(carrinho.filter(item => item.id !== id));
  };

  const finalizarOperacao = (imprimir) => {
    if (carrinho.length === 0) return toast.warn("A lista de devolução está vazia.");
    if (!numeroVendaRef) return toast.warn("Informe o número do Cupom/Venda original.");
    if (!motivo) return toast.warn("Informe o motivo da devolução.");

    const clienteCompleto = `${nomeCliente || 'Cliente Nao Informado'} | Doc: ${docCliente || 'Sem Doc'} | Tel: ${foneCliente || 'Sem Tel'}`;
    const total = carrinho.reduce((acc, item) => acc + item.subtotal, 0);
    
    // Se a trava de avaria estiver marcada, o motivo recebe uma tag para o sistema saber
    const motivoFinal = descartarAvaria ? `[AVARIA] ${motivo}` : motivo;

    registrarDevolucao(carrinho, clienteCompleto, motivoFinal, numeroVendaRef, dataVendaRef || new Date().toISOString().split('T')[0]);
    
    if (imprimir) {
      gerarReciboDevolucaoPDF(carrinho, clienteCompleto, motivoFinal, numeroVendaRef, dataVendaRef, total);
    }

    setCarrinho([]);
    setNomeCliente(''); setDocCliente(''); setFoneCliente('');
    setNumeroVendaRef(''); setDataVendaRef(''); setMotivo(''); setDescartarAvaria(false);
  };

  const totalDevolucao = carrinho.reduce((acc, item) => acc + item.subtotal, 0);

  return (
    <div className="atlas-container">
      <header className="atlas-header">
        <div>
          <h1>Logística Reversa (Devoluções)</h1>
          <p>Retorno de mercadoria, estorno de valores e controle de avarias</p>
        </div>
      </header>

      <div className="atlas-grid grid-start">
        <div className="coluna-flex">
          
          <div className="atlas-card">
            <div className="card-titulo">Localização Automática de Cupom</div>
            <p className="font-12 texto-cinza mb-15">Digite o número da venda para carregar os itens e o cliente automaticamente.</p>
            
            <div className="atlas-linha">
              <div className="atlas-campo flex-2" style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="number" 
                  min="1" 
                  value={numeroVendaRef} 
                  onChange={e => setNumeroVendaRef(e.target.value)} 
                  placeholder="Número (Ex: 12)" 
                  className="input-destaque-centro"
                />
                <button className="botao-primario" onClick={buscarCupom} style={{ padding: '0 20px' }}>
                  🔍 Buscar Cupom
                </button>
              </div>
            </div>
            
            <div className="atlas-linha mt-15">
              <div className="atlas-campo w-100">
                <label>Motivo da Devolução *</label>
                <select value={motivo} onChange={e => setMotivo(e.target.value)}>
                  <option value="">Selecione...</option>
                  <option value="Defeito de Fábrica">Defeito de Fábrica</option>
                  <option value="Arrependimento (Prazo 7 dias)">Arrependimento (Prazo 7 dias)</option>
                  <option value="Produto Enviado Errado">Produto Enviado Errado</option>
                  <option value="Avaria no Transporte">Avaria no Transporte</option>
                </select>
              </div>
            </div>

            {/* TRAVA DE AVARIA */}
            <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff1f2', border: '1px dashed #fda4af', borderRadius: '6px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#be123c', fontWeight: 'bold' }}>
                <input 
                  type="checkbox" 
                  checked={descartarAvaria} 
                  onChange={e => setDescartarAvaria(e.target.checked)} 
                  style={{ width: '18px', height: '18px' }}
                />
                PRODUTO DANIFICADO (Avaria) - Não retornar ao saldo disponível de estoque.
              </label>
            </div>

          </div>

          <div className="atlas-card">
            <div className="card-titulo" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Dados do Comprador</span>
              <span className="font-11 texto-cinza" style={{ fontWeight: 'normal' }}>Preenchido automaticamente</span>
            </div>
            <div className="atlas-linha"><div className="atlas-campo w-100"><label>Nome / Razão Social</label><input type="text" value={nomeCliente} onChange={e => setNomeCliente(e.target.value)} /></div></div>
            <div className="atlas-linha mt-15">
              <div className="atlas-campo"><label>CPF / CNPJ</label><input type="text" value={docCliente} onChange={(e) => setDocCliente(e.target.value.length > 14 ? maskCNPJ(e.target.value) : maskCPF(e.target.value))} /></div>
              <div className="atlas-campo"><label>Telefone</label><input type="text" value={foneCliente} onChange={(e) => setFoneCliente(maskTelefone(e.target.value))} /></div>
            </div>
          </div>
        </div>

        <div className="atlas-card">
          <div className="card-titulo">Resumo do Estorno</div>
          
          <div className="container-tabela-carrinho" style={{ minHeight: '300px' }}>
            <table className="atlas-tabela">
              <thead><tr><th>Item Devolvido</th><th>Qtd</th><th>Unit R$</th><th>Subtotal</th><th></th></tr></thead>
              <tbody>
                {carrinho.map(item => (
                  <tr key={item.id}>
                    <td><strong>{item.nome}</strong><br/><span className="font-11 texto-cinza">SKU: {item.sku}</span></td>
                    <td className="texto-centro">{item.quantidade}</td>
                    <td>{item.valor_venda.toFixed(2)}</td>
                    <td style={{ fontWeight: 'bold', color: '#e11d48' }}>- {item.subtotal.toFixed(2)}</td>
                    <td><button onClick={() => removerItem(item.id)} className="botao-link" title="Manter a venda deste item">X</button></td>
                  </tr>
                ))}
                {carrinho.length === 0 && (
                  <tr><td colSpan="5" className="texto-centro-vazio">Digite o cupom e clique em buscar.</td></tr>
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
              Registrar Devolução
            </button>
            <button className="botao-primario btn-bg-black w-100 btn-gigante" onClick={() => finalizarOperacao(true)}>
              Gerar PDF de Estorno
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
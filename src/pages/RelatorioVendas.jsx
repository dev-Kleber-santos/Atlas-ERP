import React, { useState } from 'react';

// =========================================================================
// ESTRUTURA BLINDADA DO BANCO DE DADOS ATLAS ERP:
// Entrada: ID, Produto, Quantidade, Valor Unitário, Valor Total, Data, Fornecedor, Lote, Validade
// Saída: ID, Produto, Quantidade, Valor Unitário, Valor Total, Data, Cliente, Vendedor
// Fornecedores: ID, Nome, CNPJ, Telefone, Email, Endereço
// Cotações: ID, Produto, Fornecedor, Valor Cotado, Data, Status
// =========================================================================

export default function RelatorioVendas({ historicoVendas, vendaExpandidaId, setVendaExpandidaId }) {
  const [termoBuscaVenda, setTermoBuscaVenda] = useState('');

  const montanteVendido = (historicoVendas || []).reduce((acc, v) => acc + Number(v.valor_total || 0), 0);

  // Filtro Inteligente: Busca por Número (VD), Nome do Cliente, CPF ou PRODUTO
  const vendasFiltradas = (historicoVendas || []).filter(v => {
    if (!termoBuscaVenda) return true;
    const termo = String(termoBuscaVenda || '').toLowerCase();
    const numeroStr = String(v.numero_venda || '').toLowerCase();
    const clienteStr = String(v.cliente || '').toLowerCase();
    const produtoStr = String(v.produto_nome || '').toLowerCase(); // Agora ele enxerga o produto!
    
    return numeroStr.includes(termo) || clienteStr.includes(termo) || produtoStr.includes(termo);
  });

  return (
    <div className="atlas-container">
      <header className="atlas-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Relatório Gerencial de Vendas</h1>
          <p>Consulte cupons emitidos e dados de clientes</p>
        </div>
        
        <div style={{ position: 'relative', width: '350px' }}>
          <input 
            type="text" 
            className="input-tabela" 
            placeholder="Buscar por Nº do Cupom, Item ou CPF..." 
            value={termoBuscaVenda}
            onChange={(e) => setTermoBuscaVenda(e.target.value)}
            style={{ paddingLeft: '35px', borderRadius: '20px', border: '2px solid #cbd5e1' }}
          />
          <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }}>🔍</span>
        </div>
      </header>

      <div className="atlas-grid metricas-grid">
        <div className="atlas-card metrica-card-azul">
          <h3 className="metrica-titulo-azul">Faturamento Total</h3>
          <h2 className="metrica-valor-azul">R$ {montanteVendido.toFixed(2)}</h2>
        </div>
        <div className="atlas-card metrica-card-cinza">
          <h3 className="metrica-titulo-cinza">Operações (Cupons)</h3>
          <h2 className="metrica-valor-cinza">{(historicoVendas || []).length}</h2>
        </div>
      </div>

      <div className="atlas-card full">
        <table className="atlas-tabela">
          <thead>
            <tr>
              <th>Cupom</th>
              <th>Data e Hora</th>
              <th>Produto Vendido</th>
              <th>Valor Total</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {vendasFiltradas.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Nenhuma venda encontrada para esta busca.</td></tr>
            ) : (
              vendasFiltradas.map(v => (
                <tr key={v.id}>
                  <td style={{ fontWeight: 'bold', color: '#475569', fontSize: '15px' }}>
                    VD-{String(v.numero_venda || 0).padStart(4, '0')}
                  </td>
                  <td className="font-13">{new Date(v.created_at).toLocaleString('pt-BR')}</td>
                  <td><strong>{v.produto_nome}</strong> ({v.quantidade} un)</td>
                  <td className="bold-verde">R$ {Number(v.valor_total).toFixed(2)}</td>
                  <td>
                    <button className="botao-secundario font-12" onClick={() => setVendaExpandidaId(vendaExpandidaId === v.id ? null : v.id)}>
                      {vendaExpandidaId === v.id ? 'Ocultar Detalhes' : 'Ver Cliente'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {vendaExpandidaId && (
          <div className="detalhes-cliente-box mt-15">
            {(() => {
              const vendaAtual = historicoVendas.find(v => v.id === vendaExpandidaId);
              if(!vendaAtual) return null;
              const dadosCli = vendaAtual.cliente ? vendaAtual.cliente.split('|') : [];
              return (
                <div style={{ display: 'flex', gap: '40px' }}>
                  <div>
                    <h4 className="detalhes-cliente-titulo">Dados do Comprador:</h4>
                    <ul className="detalhes-cliente-lista">
                      <li><strong>Nome:</strong> {dadosCli[0] || 'Consumidor Final'}</li>
                      <li><strong>Documento:</strong> {dadosCli[1] ? dadosCli[1].replace('Doc:', '').replace('CPF/CNPJ:', '').trim() : 'Não informado'}</li>
                      <li><strong>Contato:</strong> {dadosCli[2] ? dadosCli[2].replace('Tel:', '').trim() : 'Não informado'}</li>
                    </ul>
                  </div>
                  <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '40px' }}>
                    <h4 className="detalhes-cliente-titulo">Dados Fiscais:</h4>
                    <ul className="detalhes-cliente-lista">
                      <li><strong>Cupom Ref:</strong> VD-{String(vendaAtual.numero_venda || 0).padStart(4, '0')}</li>
                      <li><strong>Valor Unitário:</strong> R$ {Number(vendaAtual.valor_unitario).toFixed(2)}</li>
                      <li><strong>Total Pago:</strong> R$ {Number(vendaAtual.valor_total).toFixed(2)}</li>
                    </ul>
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
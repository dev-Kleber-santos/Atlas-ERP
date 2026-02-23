// src/pages/Inventario.jsx
import React from 'react';

export default function Inventario({ 
  termoBusca, 
  setTermoBusca, 
  estoque, 
  gerarSolicitacaoCompra 
}) {
  return (
    <div className="atlas-container">
      <header className="atlas-header">
        <h1>Inventário</h1>
        <p>Controle de itens homologados e solicitações de compra</p>
      </header>
      <div className="atlas-card full">
        <div className="atlas-linha" style={{ marginBottom: '20px' }}>
          <div className="atlas-campo">
            <label>🔍 Buscar no Banco</label>
            <input 
              type="text" 
              placeholder="Pesquisar por Nome ou SKU..." 
              value={termoBusca} 
              onChange={(e) => setTermoBusca(e.target.value)} 
            />
          </div>
        </div>
        <table className="atlas-tabela">
          <thead>
            <tr><th>SKU</th><th>Nome</th><th>Estoque</th><th>Categoria</th><th>Ação do Sistema</th></tr>
          </thead>
          <tbody>
            {estoque.length > 0 ? estoque
              .filter(item => item.status === 'ativo' && (item.nome.toLowerCase().includes(termoBusca.toLowerCase()) || item.sku.toLowerCase().includes(termoBusca.toLowerCase())))
              .map(item => (
              <tr key={item.id}>
                <td><strong>{item.sku}</strong></td>
                <td>{item.nome}</td>
                <td className="valor-destaque">
                  <span style={{ color: item.quantidade <= 5 ? '#e53e3e' : 'inherit' }}>{item.quantidade} un</span>
                  {item.quantidade <= 5 && <span style={{ marginLeft: '8px', fontSize: '10px', background: '#fed7d7', color: '#c53030', padding: '3px 6px', borderRadius: '4px', fontWeight: 'bold' }}>⚠️ Repor</span>}
                </td>
                <td>{item.categoria}</td>
                <td>
                  <button className="botao-primario" style={{fontSize: '11px', padding: '6px 12px'}} onClick={() => gerarSolicitacaoCompra(item)}>
                    🛒 Solicitar Compra
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Sem dados no banco.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
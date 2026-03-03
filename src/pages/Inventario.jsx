import React from 'react';

export default function Inventario({ termoBusca, setTermoBusca, estoque, gerarSolicitacaoCompra }) {
  
  const itensFiltrados = estoque.filter(item =>
    item.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
    item.sku.toLowerCase().includes(termoBusca.toLowerCase()) ||
    (item.codigo_barra && item.codigo_barra.includes(termoBusca))
  );

  return (
    <div className="atlas-container">
      <header className="atlas-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Consulta de Estoque</h1>
          <p>Busque itens por nome, SKU ou Codigo de Barras</p>
        </div>
        <div style={{ width: '350px' }}>
          <input 
            type="text" 
            className="input-tabela" 
            placeholder="Pesquisar produto..." 
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
          />
        </div>
      </header>

      <div className="atlas-card full">
        <table className="atlas-tabela">
          <thead>
            <tr>
              <th style={{ width: '60px', textAlign: 'center' }}>Foto</th>
              <th>SKU</th>
              <th>Produto</th>
              <th>Categoria</th>
              <th>Saldo Físico</th>
              <th>Preço (R$)</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {itensFiltrados.map(item => (
              <tr key={item.id}>
                <td style={{ textAlign: 'center' }}>
                  {item.url_imagem ? (
                    <img 
                      src={item.url_imagem} 
                      alt={item.nome} 
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }} 
                    />
                  ) : (
                    <div style={{ width: '40px', height: '40px', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#94a3b8', margin: '0 auto' }}>
                      Sem foto
                    </div>
                  )}
                </td>
                <td>{item.sku}</td>
                <td style={{ fontWeight: 'bold', color: '#0f172a' }}>{item.nome}</td>
                <td>{item.categoria || '-'}</td>
                <td>
                  <span className={`status-badge ${item.quantidade <= (item.estoque_minimo || 5) ? 'status-alerta' : 'status-verde'}`}>
                    {item.quantidade} un
                  </span>
                </td>
                <td style={{ fontWeight: 'bold', color: '#16a34a' }}>{Number(item.valor_venda || 0).toFixed(2)}</td>
                <td>
                  <button className="botao-secundario font-12" onClick={() => gerarSolicitacaoCompra(item)}>
                    Solicitar
                  </button>
                </td>
              </tr>
            ))}
            {itensFiltrados.length === 0 && (
              <tr>
                <td colSpan="7" className="texto-cinza-vazio" style={{ textAlign: 'center', padding: '30px' }}>
                  Nenhum produto encontrado na busca.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
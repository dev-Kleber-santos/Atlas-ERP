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
        <div className="atlas-linha margin-bottom-20">
          <div className="atlas-campo">
            <label>Buscar no Banco</label>
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
            <tr>
              <th>SKU</th>
              <th>Nome</th>
              <th>Estoque</th>
              <th>Categoria</th>
              <th>Ação do Sistema</th>
            </tr>
          </thead>
          <tbody>
            {estoque.length > 0 ? estoque
              .filter(item => item.status === 'ativo' && (item.nome.toLowerCase().includes(termoBusca.toLowerCase()) || item.sku.toLowerCase().includes(termoBusca.toLowerCase())))
              .map(item => (
              <tr key={item.id}>
                <td><strong>{item.sku}</strong></td>
                <td>{item.nome}</td>
                <td className="valor-destaque">
                  <span className={item.quantidade <= 5 ? 'texto-vermelho-estoque' : ''}>
                    {item.quantidade} un
                  </span>
                  {item.quantidade <= 5 && <span className="badge-repor"> Repor</span>}
                </td>
                <td>{item.categoria}</td>
                <td>
                  <button className="botao-primario btn-pequeno-solicitar" onClick={() => gerarSolicitacaoCompra(item)}>
                    🛒 Solicitar Compra
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="texto-centro-vazio">Sem dados no banco.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
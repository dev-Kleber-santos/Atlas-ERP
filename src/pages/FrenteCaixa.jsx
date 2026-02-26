import React from 'react';
// Se essa tela tiver um CSS MUITO específico só dela, você importaria aqui:
// import './FrenteCaixa.css'; 

export default function FrenteCaixa({ 
  estoque, 
  registrarVenda, 
  maskCNPJ, 
  maskCPF, 
  maskTelefone 
}) {
  return (
    <div className="atlas-container">
      <header className="atlas-header">
        <div><h1>Frente de Caixa (PDV)</h1></div>
      </header>
      <div className="atlas-grid">
        <div className="atlas-card">
          <div className="card-titulo">Dados do Comprador</div>
          <div className="atlas-linha">
            <div className="atlas-campo w-100">
              <label>Nome / Razão Social</label>
              <input type="text" id="venda-nome" />
            </div>
          </div>
          <div className="atlas-linha mt-15">
            <div className="atlas-campo">
              <label>CPF / CNPJ</label>
              <input type="text" id="venda-doc" onChange={(e) => { e.target.value = e.target.value.length > 14 ? maskCNPJ(e.target.value) : maskCPF(e.target.value) }} />
            </div>
            <div className="atlas-campo">
              <label>Telefone</label>
              <input type="text" id="venda-fone" onChange={(e) => e.target.value = maskTelefone(e.target.value)} />
            </div>
          </div>
        </div>
        
        <div className="atlas-card" style={{ borderTop: '4px solid #10b981' }}>
          <div className="card-titulo">Carrinho de Produtos</div>
          <div className="atlas-linha">
            <div className="atlas-campo w-100">
              <label>Localizar Mercadoria</label>
              <select id="venda-produto" className="input-sucesso">
                <option value="">Selecione...</option>
                {estoque.filter(i => i.quantidade > 0).map(i => (
                  <option key={i.id} value={i.id}>{i.nome} (Estoque: {i.quantidade} | R$ {Number(i.valor_venda || 0).toFixed(2)})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="atlas-linha mt-15">
            <div className="atlas-campo">
              <label>Quantidade</label>
              <input type="number" id="venda-qtd" min="1" defaultValue="1" style={{ fontSize: '20px', fontWeight: 'bold', textAlign: 'center' }} />
            </div>
          </div>
          <button className="botao-primario botao-sucesso w-100 mt-30" style={{ padding: '15px' }} onClick={registrarVenda}>💰 Confirmar Faturamento</button>
        </div>
      </div>
    </div>
  );
}
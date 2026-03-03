import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function CadastroItem({ 
  estoque, 
  salvarCadastroItem, 
  itensPendentes = [], // Recebe a lista de pendentes do App.jsx
  carregarItemPendente, // Função que preenche o formulário ao clicar
  excluirItemPendente // Função para deletar um pendente
}) {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');

  const categoriasUnicas = [...new Set(estoque.map(i => i.categoria))].filter(Boolean);

  const gerarInteligente = (e) => {
    e.preventDefault();
    const nome = document.getElementById('nome-item').value;
    
    const categoria = categoriaSelecionada === 'NOVA_CATEGORIA' 
      ? document.getElementById('categoria-item')?.value 
      : categoriaSelecionada;
    
    if (!nome) {
      toast.warn("Por favor, preencha o Nome do Produto antes de usar o Gerar Inteligente.");
      return;
    }

    const prefixoCat = categoria ? categoria.substring(0, 3).toUpperCase() : 'GER';
    const prefixoNome = nome.replace(/\s+/g, '').substring(0, 3).toUpperCase();
    const numAleatorio = Math.floor(100 + Math.random() * 900);
    document.getElementById('sku-item').value = `${prefixoCat}-${prefixoNome}-${numAleatorio}`;

    const eanSufix = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    document.getElementById('codigo-barra-item').value = `789${eanSufix}`;
  };

  return (
    <div className="atlas-container">
      <header className="atlas-header">
        <div>
          <h1>Cadastro de Produto</h1>
          <p>Inclusao de novos SKUs no estoque</p>
        </div>
      </header>

      <div className="atlas-grid grid-start">
        
        {/* LADO ESQUERDO: FORMULÁRIO DE CADASTRO */}
        <div className="coluna-flex" style={{ flex: 2 }}>
          <div className="atlas-card">
            
            <div className="card-titulo">Dados Basicos e Identificacao</div>

            <div className="atlas-linha">
              <div className="atlas-campo flex-2">
                <label>Nome do Produto</label>
                <input type="text" id="nome-item" placeholder="Ex: Teclado Mecanico" />
              </div>
              <div className="atlas-campo">
                <label>SKU (Cod. Interno)</label>
                <input type="text" id="sku-item" placeholder="Ex: TEC-001" />
              </div>
            </div>
            
            <div className="atlas-linha mt-15" style={{ alignItems: 'flex-start' }}>
              
              <div className="atlas-campo flex-2">
                <label>Categoria</label>
                <select 
                  id={categoriaSelecionada === 'NOVA_CATEGORIA' ? '' : 'categoria-item'} 
                  className="input-tabela"
                  value={categoriaSelecionada}
                  onChange={(e) => setCategoriaSelecionada(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {categoriasUnicas.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                  <option value="NOVA_CATEGORIA" style={{ fontWeight: 'bold', color: '#2563eb' }}>+ Criar Nova Categoria</option>
                </select>

                {categoriaSelecionada === 'NOVA_CATEGORIA' && (
                  <input 
                    type="text" 
                    id="categoria-item" 
                    className="input-tabela" 
                    placeholder="Digite o nome da nova categoria..." 
                    style={{ marginTop: '10px', borderLeft: '3px solid #2563eb' }}
                    autoFocus
                  />
                )}
              </div>
              
              <div className="atlas-campo" style={{ display: 'flex', flexDirection: 'column' }}>
                <label>Codigo de Barras (EAN)</label>
                <input type="text" id="codigo-barra-item" className="input-tabela" />
                
                <button 
                  className="input-tabela w-100" 
                  onClick={gerarInteligente} 
                  style={{ 
                    marginTop: '10px', 
                    cursor: 'pointer', 
                    textAlign: 'center', 
                    fontWeight: 'bold', 
                    color: '#475569',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#ffffff'}
                >
                  Gerar (SKU e EAN)
                </button>
              </div>

            </div>

            <div className="atlas-linha mt-15" style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
              <div className="atlas-campo w-100">
                <label style={{ color: '#0f172a', fontWeight: 'bold' }}>Foto do Produto (Opcional)</label>
                <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>Selecione uma imagem (.jpg, .png) para aparecer no PDV e no Estoque.</p>
                <input type="file" id="imagem-produto-upload" accept="image/*" className="input-tabela" style={{ padding: '8px', backgroundColor: '#fff' }} />
              </div>
            </div>

            <div className="card-titulo mt-30">Informacoes Fiscais</div>
            <div className="atlas-linha">
              <div className="atlas-campo"><label>NCM</label><input type="text" id="ncm-item" placeholder="0000.00.00" /></div>
              <div className="atlas-campo"><label>CEST</label><input type="text" id="cest-item" placeholder="00.000.00" /></div>
              <div className="atlas-campo">
                <label>Origem</label>
                <select id="origem-item" className="input-tabela">
                  <option value="0">0 - Nacional</option>
                  <option value="1">1 - Estrangeira (Importacao direta)</option>
                  <option value="2">2 - Estrangeira (Mercado interno)</option>
                </select>
              </div>
              <div className="atlas-campo"><label>IPI (%)</label><input type="number" id="ipi-item" defaultValue="0" /></div>
            </div>

            <div className="card-titulo mt-30">Estoque e Financeiro</div>
            <div className="atlas-linha">
              <div className="atlas-campo"><label>Qtd Inicial</label><input type="number" id="qtd-item" defaultValue="0" /></div>
              <div className="atlas-campo"><label>Estoque Minimo</label><input type="number" id="minimo-item" defaultValue="5" /></div>
              <div className="atlas-campo flex-2"><label>Fornecedor Padrao</label><input type="text" id="fornecedor-item" /></div>
            </div>

            <div className="atlas-linha mt-15">
              <div className="atlas-campo"><label>Custo Base (R$)</label><input type="number" id="custo-item" step="0.01" /></div>
              <div className="atlas-campo"><label>Preco de Venda (R$)</label><input type="number" id="venda-item" step="0.01" /></div>
            </div>

            <button className="botao-primario w-100 mt-30 btn-gigante" onClick={salvarCadastroItem}>
              Salvar Cadastro de Produto
            </button>
          </div>
        </div>

        {/* LADO DIREITO: FILA DE PENDENTES */}
        <div className="coluna-flex" style={{ flex: 1 }}>
          <div className="atlas-card" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', minHeight: '400px' }}>
            <div className="card-titulo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Fila de Pendentes</span>
              <span style={{ backgroundColor: '#e2e8f0', color: '#475569', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>
                {itensPendentes.length} itens
              </span>
            </div>
            
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '15px' }}>
              Produtos recebidos na Entrada aguardando SKU e EAN para liberar o saldo.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {itensPendentes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8', fontSize: '13px' }}>
                  A fila esta vazia. Nenhuma entrada pendente de cadastro.
                </div>
              ) : (
                itensPendentes.map(item => (
                  <div key={item.id} style={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <strong style={{ color: '#0f172a', fontSize: '14px', lineHeight: '1.2' }}>{item.nome}</strong>
                      <button 
                        onClick={() => excluirItemPendente(item.id)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                        title="Descartar Item"
                      >
                        X
                      </button>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                      <span>Qtd: <strong>{item.quantidade}</strong></span>
                      <span>Custo: <strong>R$ {Number(item.custo_unitario).toFixed(2)}</strong></span>
                    </div>

                    <button 
                      className="botao-secundario" 
                      onClick={() => carregarItemPendente(item)}
                      style={{ fontSize: '12px', padding: '6px', marginTop: '5px' }}
                    >
                      Preencher Formulário
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
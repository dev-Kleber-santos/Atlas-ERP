import React from 'react';

export default function Entradas({ 
  setTelaAtiva, 
  confirmarEntradaComPendencia, 
  maskCNPJ, 
  maskTelefone, // Adicionado aqui
  manipularUpload, 
  imagemAnexada, 
  setImagemAnexada, 
  linhasItens, 
  atualizarValorLinha, 
  removerLinha, 
  adicionarLinha,
  listaFornecedores = []
}) {

  // Auto-preencher todos os dados do fornecedor
  const handleFornecedorChange = (e) => {
    const nomeDigitado = e.target.value;
    const fornEncontrado = listaFornecedores.find(f => f.razao.toUpperCase() === nomeDigitado.toUpperCase());
    
    if (fornEncontrado) {
      if (document.getElementById('cnpj-entrada')) document.getElementById('cnpj-entrada').value = fornEncontrado.cnpj || '';
      if (document.getElementById('email-entrada')) document.getElementById('email-entrada').value = fornEncontrado.email || '';
      if (document.getElementById('tel-entrada')) document.getElementById('tel-entrada').value = fornEncontrado.telefone || '';
    }
  };

  const calcularSubtotal = (qtd, valor) => {
    return (Number(qtd || 0) * Number(valor || 0)).toFixed(2);
  };

  const totalNota = linhasItens.reduce((acc, item) => acc + (Number(item.qtd || 0) * Number(item.valor || 0)), 0);

  return (
    <div className="atlas-container">
      <header className="atlas-header">
        <div>
          <h1>Recebimento de Mercadorias</h1>
          <p>Registre as Notas Fiscais para enviar os itens para conferência e cadastro</p>
        </div>
      </header>

      {/* DADOS DA NOTA */}
      <div className="atlas-card">
        <div className="card-titulo">Dados da Emissão</div>
        
        <div className="atlas-linha">
          <div className="atlas-campo flex-2">
            <label>Fornecedor</label>
            <input 
              type="text" 
              id="forn-entrada" 
              list="lista-forn" 
              className="input-tabela" 
              placeholder="Selecione ou digite..." 
              onChange={handleFornecedorChange} 
            />
            <datalist id="lista-forn">
              {listaFornecedores.map(f => (
                <option key={f.id} value={f.razao} />
              ))}
            </datalist>
          </div>
          <div className="atlas-campo">
            <label>CNPJ do Fornecedor</label>
            <input type="text" id="cnpj-entrada" className="input-tabela" placeholder="00.000.000/0001-00" onChange={(e) => e.target.value = maskCNPJ(e.target.value)} />
          </div>
          <div className="atlas-campo">
            <label>Data de Emissão</label>
            <input type="date" id="data-entrada" className="input-tabela" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
        </div>

        {/* CAMPOS NOVOS DE CONTATO */}
        <div className="atlas-linha mt-15">
          <div className="atlas-campo flex-2">
            <label>E-mail do Fornecedor (Opcional)</label>
            <input type="email" id="email-entrada" className="input-tabela" placeholder="contato@empresa.com.br" />
          </div>
          <div className="atlas-campo">
            <label>Telefone (Opcional)</label>
            <input type="text" id="tel-entrada" className="input-tabela" placeholder="(00) 00000-0000" onChange={(e) => e.target.value = maskTelefone(e.target.value)} />
          </div>
        </div>

        <div className="atlas-linha mt-15">
          <div className="atlas-campo w-100">
            <label>Anexar DANFE / XML (Opcional)</label>
            <input type="file" onChange={manipularUpload} className="input-tabela" />
            {imagemAnexada && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#16a34a', fontWeight: 'bold' }}>
                ✓ Documento anexado com sucesso
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ITENS DA NOTA */}
      <div className="atlas-card mt-20">
        <div className="card-titulo">Itens da Nota Fiscal</div>
        
        <div style={{ overflowX: 'auto' }}>
          <table className="atlas-tabela" style={{ minWidth: '800px' }}>
            <thead>
              <tr>
                <th>Descrição do Produto</th>
                <th style={{ width: '100px' }}>Qtd</th>
                <th style={{ width: '150px' }}>Custo Unitário (R$)</th>
                <th style={{ width: '150px' }}>Subtotal (R$)</th>
                <th style={{ textAlign: 'center', width: '80px' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {linhasItens.map((linha) => (
                <tr key={linha.id}>
                  <td>
                    <input type="text" className="input-tabela" placeholder="Nome exato do item..." value={linha.nome_temp || ''} onChange={(e) => atualizarValorLinha(linha.id, 'nome_temp', e.target.value)} />
                  </td>
                  <td>
                    <input type="number" className="input-tabela" min="1" value={linha.qtd || ''} onChange={(e) => atualizarValorLinha(linha.id, 'qtd', e.target.value)} />
                  </td>
                  <td>
                    <input type="number" className="input-tabela" step="0.01" value={linha.valor || ''} onChange={(e) => atualizarValorLinha(linha.id, 'valor', e.target.value)} />
                  </td>
                  <td style={{ fontWeight: 'bold', color: '#0f172a' }}>
                    {calcularSubtotal(linha.qtd, linha.valor)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="botao-link" onClick={() => removerLinha(linha.id)} style={{ color: '#e11d48', fontWeight: 'bold', fontSize: '14px' }} title="Remover linha">X</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <button className="botao-secundario mt-15" onClick={adicionarLinha}>
          + Adicionar Nova Linha
        </button>
      </div>

      {/* TOTAL E BOTÃO */}
      <div className="atlas-card mt-20" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <div>
          <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 'bold' }}>VALOR TOTAL DA NOTA:</span>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>
            R$ {totalNota.toFixed(2)}
          </div>
        </div>
        
        <button className="botao-primario btn-gigante" onClick={confirmarEntradaComPendencia} style={{ width: '350px' }}>
          Enviar para Fila de Conferência
        </button>
      </div>

    </div>
  );
}
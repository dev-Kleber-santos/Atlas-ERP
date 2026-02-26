import React from 'react';

export default function Entradas({
  setTelaAtiva,
  confirmarEntradaComPendencia,
  maskCNPJ,
  manipularUpload,
  imagemAnexada,
  setImagemAnexada,
  linhasItens,
  atualizarValorLinha,
  removerLinha,
  adicionarLinha
}) {

  // Calcula o valor total da Nota em tempo real
  const subtotalNota = linhasItens.reduce((acc, item) => acc + ((Number(item.qtd) || 0) * (Number(item.valor) || 0)), 0);

  return (
    <div className="atlas-container">
      <header className="atlas-header">
        <div>
          <h1>Recebimento de Mercadorias</h1>
          <p>Registre a entrada de NFs e encaminhe os itens para a doca de homologação</p>
        </div>
      </header>

      <div className="atlas-grid" style={{ alignItems: 'start' }}>
        
        {/* LADO ESQUERDO: DADOS DO DOCUMENTO */}
        <div className="atlas-card">
          <div className="card-titulo">
            <span style={{ background: '#3182ce', color: 'white', padding: '4px 10px', borderRadius: '50%', marginRight: '8px' }}>1</span> 
            Dados do Documento Fiscal
          </div>
          
          <div className="atlas-linha">
            <div className="atlas-campo flex-2">
              <label>Fornecedor / Emitente</label>
              <input type="text" id="forn-entrada" placeholder="Razão Social" />
            </div>
          </div>
          
          <div className="atlas-linha mt-15">
            <div className="atlas-campo">
              <label>CNPJ do Emitente</label>
              <input type="text" id="cnpj-entrada" placeholder="00.000.000/0000-00" onChange={(e) => e.target.value = maskCNPJ(e.target.value)} />
            </div>
            <div className="atlas-campo">
              <label>Data de Emissão</label>
              <input type="date" id="data-entrada" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
          </div>

          <div className="atlas-linha mt-20">
            <div className="atlas-campo w-100">
              <label>Anexar XML ou PDF (Opcional)</label>
              <label className="area-upload">
                <input type="file" style={{ display: 'none' }} accept="application/pdf,image/*,.xml" onChange={manipularUpload} />
                {imagemAnexada ? (
                  <div style={{ color: '#10b981', fontWeight: 'bold' }}>✅ Documento anexado com sucesso. Clique para trocar.</div>
                ) : (
                  <div style={{ color: '#718096' }}>📁 Clique aqui para selecionar o arquivo da Nota Fiscal no seu computador.</div>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* LADO DIREITO: ITENS DA NOTA E CONFIRMAÇÃO */}
        <div className="atlas-card">
          <div className="card-titulo">
            <span style={{ background: '#3182ce', color: 'white', padding: '4px 10px', borderRadius: '50%', marginRight: '8px' }}>2</span> 
            Composição do Lote (Produtos)
          </div>

          <table className="atlas-tabela">
            <thead>
              <tr>
                <th>Descrição do Produto</th>
                <th>Volume (Qtd)</th>
                <th>Custo Unit. (R$)</th>
                <th>Subtotal (R$)</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {linhasItens.map(linha => (
                <tr key={linha.id}>
                  <td>
                    <input type="text" className="input-tabela" placeholder="Nome do item..." onChange={(e) => atualizarValorLinha(linha.id, 'nome_temp', e.target.value)} />
                  </td>
                  <td>
                    <input type="number" className="input-tabela" min="1" placeholder="0" onChange={(e) => atualizarValorLinha(linha.id, 'qtd', e.target.value)} />
                  </td>
                  <td>
                    <input type="number" className="input-tabela" min="0" placeholder="0.00" onChange={(e) => atualizarValorLinha(linha.id, 'valor', e.target.value)} />
                  </td>
                  <td className="texto-verde-bold">
                    {((Number(linha.qtd) || 0) * (Number(linha.valor) || 0)).toFixed(2)}
                  </td>
                  <td>
                    <button onClick={() => removerLinha(linha.id)} className="botao-link texto-vermelho">Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="botao-adicionar" onClick={adicionarLinha}>+ Alocar Novo Produto da Nota</button>

          {/* ÁREA DE RESUMO E FECHAMENTO */}
          <div style={{ marginTop: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 'bold' }}>VALOR TOTAL DA NOTA:</span>
              <span style={{ fontSize: '24px', color: '#0f172a', fontWeight: '900' }}>R$ {subtotalNota.toFixed(2)}</span>
            </div>
            
            <button className="botao-primario botao-sucesso w-100" onClick={confirmarEntradaComPendencia} style={{ padding: '15px', fontSize: '16px' }}>
              📥 Processar Recebimento e Gerar Despesa
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
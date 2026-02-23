// src/pages/Entradas.jsx
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
  return (
    <div className="atlas-container">
      <header className="atlas-header">
        <div><h1>Nova Entrada</h1><p>Recebimento de materiais e insumos</p></div>
        <div className="atlas-acoes">
          <button className="botao-secundario" onClick={() => setTelaAtiva('inicio')}>Cancelar</button>
          <button className="botao-primario" onClick={confirmarEntradaComPendencia}>Confirmar Entrada</button>
        </div>
      </header>
      
      <div className="atlas-grid">
        <div className="atlas-card">
          <div className="card-titulo">Informações da Carga</div>
          <div className="atlas-linha">
            <div className="atlas-campo" style={{ flex: 2 }}>
              <label>Fornecedor</label>
              <input type="text" id="forn-entrada" placeholder="Razão Social" />
            </div>
          </div>
          <div className="atlas-linha" style={{ marginTop: '15px' }}>
            <div className="atlas-campo">
              <label>CNPJ</label>
              <input type="text" id="cnpj-entrada" placeholder="00.000.000/0000-00" onChange={(e) => e.target.value = maskCNPJ(e.target.value)} />
            </div>
            <div className="atlas-campo">
              <label>Data</label>
              <input type="date" id="data-entrada" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
          </div>
        </div>
        
        <div className="atlas-card">
          <div className="card-titulo">Nota Fiscal (PDF/Imagem)</div>
          <div className="area-upload" onClick={() => !imagemAnexada && document.getElementById('upload-input').click()}>
            <input type="file" id="upload-input" style={{ display: 'none' }} accept="image/*,application/pdf" onChange={manipularUpload} />
            {imagemAnexada ? (
              <div className="preview-documento-pdf">
                <iframe src={imagemAnexada} title="Anexo" width="100%" height="100%" style={{border: 'none'}}></iframe>
                <button className="botao-remover" onClick={(e) => { e.stopPropagation(); setImagemAnexada(null); }}>Trocar</button>
              </div>
            ) : (<><div className="icone-upload">🖨️</div><p>Anexar PDF</p></>)}
          </div>
        </div>
        
        <div className="atlas-card full">
          <div className="card-titulo">Itens</div>
          <table className="atlas-tabela">
            <thead>
              <tr><th>Produto</th><th>Qtd</th><th>Lote</th><th>Marca</th><th>NCM</th><th>Unidades</th><th>Custo Unit.</th><th>Subtotal</th><th>Ação</th></tr>
            </thead>
            <tbody>
              {linhasItens.map(linha => (
                <tr key={linha.id}>
                  <td><input type="text" className="input-tabela" placeholder="Nome do item" onChange={(e) => atualizarValorLinha(linha.id, 'nome_temp', e.target.value)} /></td>
                  <td><input type="number" className="input-tabela" onChange={(e) => atualizarValorLinha(linha.id, 'qtd', e.target.value)} /></td>
                  <td><input type="text" className="input-tabela" onChange={(e) => atualizarValorLinha(linha.id, 'lote_temp', e.target.value)} /></td>
                  <td><input type="text" className="input-tabela" onChange={(e) => atualizarValorLinha(linha.id, 'marca_temp', e.target.value)} /></td>
                  <td><input type="text" className="input-tabela" placeholder="000/XXX" onChange={(e) => atualizarValorLinha(linha.id, 'ncm_temp', e.target.value)} /></td>
                  <td><input type="text" className="input-tabela" placeholder="Ex: 1" style={{width: '60px'}} onChange={(e) => atualizarValorLinha(linha.id, 'unid_temp', e.target.value)} /></td>
                  <td><input type="number" className="input-tabela" placeholder="0.00" onChange={(e) => atualizarValorLinha(linha.id, 'valor', e.target.value)} /></td>
                  <td className="valor-destaque">R$ {(linha.qtd * linha.valor).toFixed(2)}</td>
                  <td><button onClick={() => removerLinha(linha.id)} className="botao-link" style={{color: 'red'}}>✖</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="botao-adicionar" onClick={adicionarLinha}>+ Adicionar Item</button>
        </div>
      </div>
    </div>
  );
}
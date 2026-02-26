import React from 'react';
import './style.css'; 

export default function EmissaoRecibo({ historicoVendas, emitirNfeSaida }) {
  return (
    <div className="atlas-container">
      <header className="atlas-header">
        <div>
          <h1>Emissão de Recibo Comercial</h1>
          <p>Gere o comprovante de compra oficial para entregar ao seu cliente</p>
        </div>
      </header>
      <div className="atlas-card centralizado-800">
        <div className="atlas-linha">
          <div className="atlas-campo w-100">
            <label>Selecione a Operação no Histórico de Vendas</label>
            <select id="nf-venda-ref" className="input-sucesso">
              <option value="">Clique para selecionar a venda...</option>
              {historicoVendas.map(v => (
                <option key={v.id} value={v.id}>
                  {new Date(v.created_at).toLocaleDateString()} | {v.produto_nome} ({v.quantidade} un) | Faturado: R$ {v.valor_total}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button className="botao-primario botao-sucesso w-100 mt-30 btn-gigante" onClick={emitirNfeSaida}>
          Gerar e Baixar Recibo de Compra (PDF)
        </button>
      </div>
    </div>
  );
}
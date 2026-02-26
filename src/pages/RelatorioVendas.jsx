import React from 'react';
import './style.css'; 

export default function RelatorioVendas({ historicoVendas, vendaExpandidaId, setVendaExpandidaId }) {
  const montanteVendido = historicoVendas.reduce((acc, v) => acc + Number(v.valor_total), 0);

  return (
    <div className="atlas-container">
      <header className="atlas-header"><div><h1>Relatório Gerencial de Vendas</h1></div></header>

      <div className="atlas-grid metricas-grid">
        <div className="atlas-card metrica-card-azul">
          <h3 className="metrica-titulo-azul">Faturamento</h3>
          <h2 className="metrica-valor-azul">R$ {montanteVendido.toFixed(2)}</h2>
        </div>
        <div className="atlas-card metrica-card-cinza">
          <h3 className="metrica-titulo-cinza">Operações</h3>
          <h2 className="metrica-valor-cinza">{historicoVendas.length}</h2>
        </div>
      </div>

      <div className="atlas-card full">
        <table className="atlas-tabela">
          <thead><tr><th>Data</th><th>Produto</th><th>Valor Total</th><th>Ação</th></tr></thead>
          <tbody>
            {historicoVendas.map(v => (
              <tr key={v.id}>
                <td className="font-13">{new Date(v.created_at).toLocaleString('pt-BR')}</td>
                <td><strong>{v.produto_nome}</strong> ({v.quantidade} un)</td>
                <td className="bold-verde">R$ {Number(v.valor_total).toFixed(2)}</td>
                <td>
                  <button className="botao-secundario font-12" onClick={() => setVendaExpandidaId(vendaExpandidaId === v.id ? null : v.id)}>
                    {vendaExpandidaId === v.id ? 'Ocultar Detalhes' : 'Ver Cliente'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {vendaExpandidaId && (
          <div className="detalhes-cliente-box">
            {(() => {
              const vendaAtual = historicoVendas.find(v => v.id === vendaExpandidaId);
              const dadosCli = vendaAtual.cliente.split('|');
              return (
                <div>
                  <h4 className="detalhes-cliente-titulo">Dados Cadastrais do Faturamento:</h4>
                  <ul className="detalhes-cliente-lista">
                    <li><strong>Comprador:</strong> {dadosCli[0] || 'Não Informado'}</li>
                    <li><strong>Documento:</strong> {dadosCli[1] ? dadosCli[1].replace('Doc:', '').replace('CPF/CNPJ:', '') : 'N/A'}</li>
                    <li><strong>Contato:</strong> {dadosCli[2] ? dadosCli[2].replace('Tel:', '') : 'N/A'}</li>
                    <li className="margin-top-10"><strong>Protocolo (ID):</strong> {vendaAtual.id}</li>
                  </ul>
                </div>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
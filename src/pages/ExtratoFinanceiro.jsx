import React from 'react';
import './style.css'; 

export default function ExtratoFinanceiro({ historicoVendas, historicoDespesas }) {
  const totalRec = historicoVendas.reduce((acc, v) => acc + Number(v.valor_total), 0);
  const totalDesp = historicoDespesas.reduce((acc, d) => acc + Number(d.valor_total), 0);
  const saldoFinal = totalRec - totalDesp;
  
  const extratoUnificado = [
    ...historicoVendas.map(v => ({ id: `v_${v.id}`, data: v.created_at, desc: `Venda: ${v.produto_nome}`, doc: v.cliente, valor: Number(v.valor_total), tipo: 'RECEITA' })), 
    ...historicoDespesas.map(d => ({ id: `d_${d.id}`, data: d.created_at, desc: d.descricao, doc: d.fornecedor || 'N/A', valor: Number(d.valor_total), tipo: 'DESPESA' }))
  ].sort((a, b) => new Date(b.data) - new Date(a.data));

  return (
    <div className="atlas-container">
      <header className="atlas-header"><div><h1>Fluxo de Caixa Livre</h1></div></header>
      <div className="dashboard-corp-grid metricas-grid">
        <div className="card-corp card-borda-verde">
          <div className="card-corp-header"><span className="card-corp-title">Receitas (+)</span></div>
          <div className="card-corp-value text-green">R$ {totalRec.toFixed(2)}</div>
        </div>
        <div className="card-corp card-borda-vermelha">
          <div className="card-corp-header"><span className="card-corp-title">Despesas (-)</span></div>
          <div className="card-corp-value text-red">R$ {totalDesp.toFixed(2)}</div>
        </div>
        <div className={`card-corp ${saldoFinal >= 0 ? 'card-borda-azul' : 'card-borda-vermelha'}`}>
          <div className="card-corp-header"><span className="card-corp-title">Saldo Líquido</span></div>
          <div className="card-corp-value" style={{ color: saldoFinal >= 0 ? '#3b82f6' : '#ef4444' }}>
            R$ {saldoFinal.toFixed(2)}
          </div>
        </div>
      </div>
      <div className="atlas-card full">
        <table className="atlas-tabela">
          <thead><tr><th>Data</th><th>Operação</th><th>Origem / Destino</th><th>Valor R$</th></tr></thead>
          <tbody>
            {extratoUnificado.map(item => (
              <tr key={item.id} className={item.tipo === 'RECEITA' ? 'linha-receita' : 'linha-despesa'}>
                <td className="font-12">{new Date(item.data).toLocaleString('pt-BR')}</td>
                <td><strong>{item.desc}</strong></td>
                <td className="font-11">{item.doc.split('|')[0]}</td>
                <td className={item.tipo === 'RECEITA' ? 'texto-receita' : 'texto-despesa'}>
                  {item.tipo === 'RECEITA' ? '+ ' : '- '}R$ {item.valor.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
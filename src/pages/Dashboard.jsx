// src/pages/Dashboard.jsx
import React from 'react';
import CardAnimado from '../components/CardAnimado.jsx'; // <-- O SEGREDO ESTÁ AQUI: adicionei o .jsx

export default function Dashboard({ 
  listaOS, 
  valorTotalAgendado, 
  valorTotalEntradas, 
  lucroLiquido, 
  exportarPDFEstoque, 
  exportarPDFFinanceiro 
}) {
  return (
    <div className="atlas-container">
      <header className="atlas-header">
        <div>
          <h1>Dashboard Operacional</h1>
          <p>Visão geral em tempo real com auditoria</p>
        </div>
        <div className="atlas-acoes">
          <button className="botao-secundario" onClick={exportarPDFEstoque}>🖨️ Exportar Estoque</button>
          <button className="botao-secundario" onClick={exportarPDFFinanceiro}>🖨️ Exportar Financeiro</button>
        </div>
      </header>
      <div className="atlas-grid-dashboard">
        <CardAnimado 
          corBorda="#3182ce" 
          label="O.S. EM ABERTO" 
          valor={listaOS.filter(o => o.status === 'Aberta').length} 
          classeProgresso="barra-azul" 
        />
        <CardAnimado 
          corBorda="#38a169" 
          label="VALOR AGENDADO (RECEITAS)" 
          valor={`R$ ${valorTotalAgendado.toFixed(2)}`} 
          corValor="#38a169" 
          classeProgresso="barra-verde" 
        />
        <CardAnimado 
          corBorda="#e53e3e" 
          label="TOTAL ENTRADAS (DESPESAS)" 
          valor={`R$ ${valorTotalEntradas.toFixed(2)}`} 
          corValor="#e53e3e" 
          classeProgresso="barra-vermelha" 
        />
        <CardAnimado 
          corBorda="#ecc94b" 
          label="LUCRO ESTIMADO" 
          valor={`R$ ${lucroLiquido.toFixed(2)}`} 
          classeProgresso="barra-amarela" 
        />
      </div>
      <div className="atlas-card full" style={{ marginTop: '25px', minHeight: '200px' }}>
        <div className="card-titulo">📊 Fluxo de Movimentação</div>
        <p style={{ textAlign: 'center', color: '#a0aec0', marginTop: '50px' }}>
          Gráficos serão habilitados após conexão com o banco de dados.
        </p>
      </div>
    </div>
  );
}
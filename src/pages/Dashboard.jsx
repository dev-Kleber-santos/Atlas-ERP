import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard({ estoque }) {
  const [receitas, setReceitas] = useState(0);
  const [despesas, setDespesas] = useState(0);

  useEffect(() => {
    const carregarFinanceiro = async () => {
      const { data: vendas } = await supabase.from('vendas').select('valor_total');
      const totalVendas = vendas?.reduce((acc, v) => acc + Number(v.valor_total), 0) || 0;
      setReceitas(totalVendas);

      const { data: desp } = await supabase.from('despesas').select('valor_total');
      const totalDesp = desp?.reduce((acc, d) => acc + Number(d.valor_total), 0) || 0;
      setDespesas(totalDesp);
    };
    carregarFinanceiro();
  }, []);

  const saldo = receitas - despesas;
  const capitalParado = estoque.reduce((acc, item) => acc + ((item.custo_base || 0) * (item.quantidade || 0)), 0);
  const itensEmAlerta = estoque.filter(i => i.quantidade <= (i.estoque_minimo || 5));
  const totalItens = estoque.reduce((acc, item) => acc + item.quantidade, 0);

  const dadosCategoria = estoque.reduce((acc, item) => {
    const cat = item.categoria || 'Sem Categoria';
    const existente = acc.find(x => x.name === cat);
    if (existente) { existente.value += item.quantidade; } 
    else { acc.push({ name: cat, value: item.quantidade }); }
    return acc;
  }, []);

  const CORES = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316'];

  const dadosTopValor = [...estoque]
    .map(item => ({
      nome: item.nome.length > 15 ? item.nome.substring(0, 15) + '...' : item.nome,
      Capital: (item.custo_base || 0) * (item.quantidade || 0)
    }))
    .sort((a, b) => b.Capital - a.Capital)
    .slice(0, 5);

  return (
    <div className="atlas-container">
      <header className="atlas-header">
        <div>
          <h1>Painel de Controle Estratégico</h1>
          <p>Visão geral executiva do seu negócio e status operacional</p>
        </div>
      </header>

      <div className="dashboard-corp-grid margin-bottom-30">
        <div className="card-corp border-left-verde">
          <div className="card-corp-header"><span className="card-corp-title">Faturamento Realizado</span></div>
          <div className="card-corp-value text-green">R$ {receitas.toFixed(2)}</div>
          <div className="card-corp-sub">Vendas consolidadas no banco</div>
        </div>

        <div className="card-corp border-left-vermelho">
          <div className="card-corp-header"><span className="card-corp-title">Despesas Acumuladas</span></div>
          <div className="card-corp-value text-red">R$ {despesas.toFixed(2)}</div>
          <div className="card-corp-sub">Compras, contas e estornos</div>
        </div>

        <div className={`card-corp ${saldo >= 0 ? 'border-left-azul' : 'border-left-vermelho'}`}>
          <div className="card-corp-header"><span className="card-corp-title">Caixa Operacional</span></div>
          <div className={`card-corp-value ${saldo >= 0 ? 'texto-azul' : 'texto-vermelho'}`}>R$ {saldo.toFixed(2)}</div>
          <div className="card-corp-sub">Lucro / Prejuízo Líquido</div>
        </div>

        <div className="card-corp border-left-roxo">
          <div className="card-corp-header"><span className="card-corp-title">Capital em Estoque</span></div>
          <div className="card-corp-value texto-roxo">R$ {capitalParado.toFixed(2)}</div>
          <div className="card-corp-sub">Custo base da mercadoria física</div>
        </div>
      </div>

      <div className="atlas-grid margin-bottom-30 grid-stretch">
        <div className="atlas-card grafico-card">
          <div className="card-titulo">Distribuição de Inventário por Categoria</div>
          <div className="grafico-wrapper">
            {dadosCategoria.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dadosCategoria} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                    {dadosCategoria.map((entry, index) => (<Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} unidades`, 'Quantidade']} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="texto-centro-vazio margin-top-50">Sem dados de categorias para exibir.</div>
            )}
          </div>
        </div>

        <div className="atlas-card grafico-card">
          <div className="card-titulo">Top 5 Produtos: Capital Imobilizado (R$)</div>
          <div className="grafico-wrapper-mt">
            {dadosTopValor.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosTopValor} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="nome" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(val) => `R$ ${val}`} />
                  <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Capital']} cursor={{fill: '#f1f5f9'}} />
                  <Bar dataKey="Capital" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="texto-centro-vazio margin-top-50">Sem dados de valores para exibir.</div>
            )}
          </div>
        </div>
      </div>

      <div className="atlas-grid grid-start">
        <div className="atlas-card border-top-laranja">
          <div className="card-titulo">⚠️ Alertas Críticos de Ruptura</div>
          {itensEmAlerta.length > 0 ? (
            <ul className="lista-limpa">
              {itensEmAlerta.slice(0, 5).map(item => (
                <li key={item.id} className="item-alerta-linha">
                  <span className="texto-produto-alerta">{item.nome}</span>
                  <span className="badge-alerta-critico">{item.quantidade} un (Mín: {item.estoque_minimo || 5})</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="alerta-sucesso-container">Excelente! Todos os itens estão operando em níveis saudáveis de estoque.</div>
          )}
        </div>

        <div className="atlas-card">
          <div className="card-titulo">Panorama Físico de Inventário</div>
          <ul className="lista-limpa">
            <li className="item-panorama-linha">
              <span className="texto-panorama-label">Variedade de Produtos Registrados:</span>
              <span className="texto-panorama-valor">{estoque.length} SKUs</span>
            </li>
            <li className="item-panorama-linha">
              <span className="texto-panorama-label">Volume Físico Total Acondicionado:</span>
              <span className="texto-panorama-valor">{totalItens} Unidades</span>
            </li>
            <li className="item-panorama-linha-final">
              <span className="texto-panorama-label">Itens em Estado de Atenção:</span>
              <span className={`texto-panorama-valor ${itensEmAlerta.length > 0 ? 'texto-vermelho' : 'texto-verde'}`}>
                {itensEmAlerta.length} Alertas
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
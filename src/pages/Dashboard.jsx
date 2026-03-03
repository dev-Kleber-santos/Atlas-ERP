import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

export default function Dashboard({ estoque = [], historicoVendas = [], historicoDespesas = [] }) {

  // --- MATEMÁTICA FINANCEIRA REAL ---
  const faturamentoBruto = historicoVendas.reduce((acc, v) => acc + Number(v.valor_total), 0);

  const totalCMV = historicoVendas.reduce((acc, v) => {
    const prod = estoque.find(p => p.id === v.produto_id);
    const custoUnitario = prod ? Number(prod.custo_base || 0) : 0;
    return acc + (custoUnitario * Number(v.quantidade));
  }, 0);

  const totalDespesas = historicoDespesas.reduce((acc, d) => acc + Number(d.valor_total || 0), 0);

  const lucroReal = faturamentoBruto - totalCMV - totalDespesas;
  const margemLucro = faturamentoBruto > 0 ? (lucroReal / faturamentoBruto) * 100 : 0;

  // --- MÉTRICAS DE ESTOQUE ---
  const capitalEstoque = estoque.reduce((acc, item) => acc + (Number(item.quantidade) * Number(item.custo_base || 0)), 0);
  const itensAlerta = estoque.filter(i => i.quantidade <= (i.estoque_minimo || 5)).length;

  // --- GRÁFICO DE EVOLUÇÃO (7 DIAS) ---
  const ultimos7Dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }).reverse();

  const dadosFaturamentoDia = ultimos7Dias.map(dia => {
    return historicoVendas
      .filter(v => new Date(v.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) === dia)
      .reduce((acc, v) => acc + Number(v.valor_total), 0);
  });

  const dadosLucroDia = ultimos7Dias.map(dia => {
    const vendasDia = historicoVendas.filter(v => new Date(v.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) === dia);
    const faturamento = vendasDia.reduce((acc, v) => acc + Number(v.valor_total), 0);
    const custo = vendasDia.reduce((acc, v) => {
      const p = estoque.find(prod => prod.id === v.produto_id);
      return acc + (Number(p?.custo_base || 0) * Number(v.quantidade));
    }, 0);
    return faturamento - custo;
  });

  const dataLinha = {
    labels: ultimos7Dias,
    datasets: [
      {
        label: 'Vendas (R$)',
        data: dadosFaturamentoDia,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Lucro Bruto (R$)',
        data: dadosLucroDia,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  // --- TOP PRODUTOS E CATEGORIAS ---
  const mapVendas = {};
  historicoVendas.forEach(v => { mapVendas[v.produto_id] = (mapVendas[v.produto_id] || 0) + Number(v.quantidade); });

  // Os 5 mais vendidos
  const topProdutos = estoque
    .filter(i => mapVendas[i.id] > 0)
    .map(i => ({ nome: i.nome, qtd: mapVendas[i.id] }))
    .sort((a, b) => b.qtd - a.qtd)
    .slice(0, 5);

  // Os 5 menos vendidos (mas que têm saldo no estoque)
  const pioresProdutos = estoque
    .filter(i => i.quantidade > 0) // Só avalia o que está ocupando espaço na loja
    .map(i => ({ nome: i.nome, qtd: mapVendas[i.id] || 0 })) // Se não vendeu nada, é 0
    .sort((a, b) => a.qtd - b.qtd)
    .slice(0, 5);

  const vendasPorCategoria = {};
  historicoVendas.forEach(v => {
    const cat = estoque.find(p => p.id === v.produto_id)?.categoria || 'Geral';
    vendasPorCategoria[cat] = (vendasPorCategoria[cat] || 0) + Number(v.valor_total);
  });

  // Cores extras para aguentar muitas categorias novas
  const coresCategorias = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b', '#ec4899', '#14b8a6', '#f97316', '#06b6d4'];

  const dataRosca = {
    labels: Object.keys(vendasPorCategoria),
    datasets: [{
      data: Object.values(vendasPorCategoria),
      backgroundColor: coresCategorias,
      borderWidth: 0
    }]
  };

  return (
    <div className="atlas-container">
      <header className="atlas-header">
        <div>
          <h1>Dashboard Atlas ERP</h1>
          <p>Sua empresa em números reais, descontando perdas e custos.</p>
        </div>
      </header>

      {/* CARDS FINANCEIROS */}
      <div className="atlas-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '20px' }}>
        <div className="atlas-card card-centro" style={{ borderTop: '4px solid #3b82f6' }}>
          <h3 className="texto-cinza font-12">Faturamento Bruto</h3>
          <div className="font-22 bold">R$ {faturamentoBruto.toFixed(2)}</div>
          <span className="font-11 texto-verde">Dinheiro em caixa</span>
        </div>

        <div className="atlas-card card-centro" style={{ borderTop: '4px solid #10b981', background: '#f0fdf4' }}>
          <h3 className="texto-cinza font-12" style={{ color: '#15803d' }}>Lucro Líquido Real</h3>
          <div className="font-22 bold" style={{ color: '#15803d' }}>R$ {lucroReal.toFixed(2)}</div>
          <span className="font-11 bold" style={{ color: '#16a34a' }}>{margemLucro.toFixed(1)}% de margem</span>
        </div>

        <div className="atlas-card card-centro" style={{ borderTop: '4px solid #ef4444', background: '#fef2f2' }}>
          <h3 className="texto-cinza font-12" style={{ color: '#b91c1c' }}>Despesas e Perdas</h3>
          <div className="font-22 bold" style={{ color: '#b91c1c' }}>R$ {totalDespesas.toFixed(2)}</div>
          <span className="font-11 texto-cinza">Avarias, Estornos e Fixos</span>
        </div>

        <div className="atlas-card card-centro" style={{ borderTop: '4px solid #f59e0b' }}>
          <h3 className="texto-cinza font-12">Capital em Estoque</h3>
          <div className="font-22 bold">R$ {capitalEstoque.toFixed(2)}</div>
          <span className="font-11" style={{ color: '#d97706' }}>{itensAlerta} itens p/ repor</span>
        </div>
      </div>

      <div className="atlas-grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* GRÁFICO DE LINHA */}
        <div className="atlas-card">
          <div className="card-titulo">Desempenho da Semana (Venda vs Lucro)</div>
          <div style={{ height: '300px' }}>
            <Line
              data={dataLinha}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } }
              }}
            />
          </div>
        </div>

        {/* RECEITA POR CATEGORIA */}
        <div className="atlas-card">
          <div className="card-titulo">Vendas por Categoria</div>
          <div style={{ height: '300px', display: 'flex', alignItems: 'center' }}>
            {Object.keys(vendasPorCategoria).length > 0 ? (
              <Doughnut data={dataRosca} options={{ responsive: true, maintainAspectRatio: false }} />
            ) : (
              <p className="texto-cinza-vazio">Sem vendas registradas.</p>
            )}
          </div>
        </div>
      </div>

      <div className="atlas-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {/* RANKING MAIS VENDIDOS */}
        <div className="atlas-card">
          <div className="card-titulo" style={{ color: '#16a34a' }}>Top 5 Mais Vendidos</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
            {topProdutos.map((p, idx) => (
              <div key={`top-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                <span className="bold font-14">#{idx + 1} {p.nome.length > 18 ? p.nome.substring(0, 18) + '...' : p.nome}</span>
                <span className="badge-azul" style={{ background: '#16a34a', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{p.qtd} saídas</span>
              </div>
            ))}
            {topProdutos.length === 0 && <p className="texto-cinza-vazio">Nenhum dado disponível.</p>}
          </div>
        </div>

        {/* RANKING MENOS VENDIDOS */}
        <div className="atlas-card">
          <div className="card-titulo" style={{ color: '#e11d48' }}>Alerta: Baixo Giro (Inativos)</div>
          <p className="font-11 texto-cinza mb-10">Itens com saldo em prateleira, mas com zero ou poucas saídas.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pioresProdutos.map((p, idx) => (
              <div key={`worst-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#fff1f2', borderRadius: '8px', border: '1px solid #fecdd3' }}>
                <span className="bold font-14" style={{ color: '#9f1239' }}>#{idx + 1} {p.nome.length > 18 ? p.nome.substring(0, 18) + '...' : p.nome}</span>
                <span style={{ background: '#e11d48', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>{p.qtd} saídas</span>
              </div>
            ))}
            {pioresProdutos.length === 0 && <p className="texto-cinza-vazio">Estoque girando 100%!</p>}
          </div>
        </div>

        {/* ALERTAS CRÍTICOS */}
        <div className="atlas-card">
          <div className="card-titulo" style={{ color: '#d97706' }}>Alertas e Insights</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            {itensAlerta > 0 && (
              <div style={{ padding: '10px', background: '#fffbeb', borderLeft: '4px solid #f59e0b', borderRadius: '4px', fontSize: '13px' }}>
                <strong style={{ color: '#b45309' }}>🚨 Reposição:</strong> Você tem {itensAlerta} produtos precisando de compra urgente.
              </div>
            )}
            {totalDespesas > (faturamentoBruto * 0.2) && (
              <div style={{ padding: '10px', background: '#fef2f2', borderLeft: '4px solid #ef4444', borderRadius: '4px', fontSize: '13px' }}>
                <strong style={{ color: '#b91c1c' }}>⚠️ Custos Altos:</strong> Suas despesas ultrapassaram 20% do faturamento. Revise as avarias.
              </div>
            )}
            <div style={{ padding: '10px', background: '#f0f9ff', borderLeft: '4px solid #0ea5e9', borderRadius: '4px', fontSize: '13px' }}>
              <strong style={{ color: '#0369a1' }}>💡 Dica de Venda:</strong> Tente criar um "Combo" juntando o seu mais vendido ({topProdutos[0]?.nome || 'Item Top'}) com o encalhado nº 1 ({pioresProdutos[0]?.nome || 'Item Parado'}).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
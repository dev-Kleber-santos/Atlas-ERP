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
  Legend
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard({ estoque = [], historicoVendas = [] }) {
  
  const totalItens = estoque.length;
  const capitalEstoque = estoque.reduce((acc, item) => acc + (Number(item.quantidade) * Number(item.custo_base || 0)), 0);
  const itensFiltroAlerta = estoque.filter(i => i.quantidade <= (i.estoque_minimo || 5));
  const itensAlerta = itensFiltroAlerta.length;
  const faturamentoTotal = historicoVendas.reduce((acc, v) => acc + Number(v.valor_total), 0);

  const ultimos7Dias = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'});
  }).reverse();

  const faturamentoPorDia = ultimos7Dias.map(dia => {
    return historicoVendas
      .filter(v => new Date(v.created_at).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'}) === dia)
      .reduce((acc, v) => acc + Number(v.valor_total), 0);
  });

  const dataLinha = {
    labels: ultimos7Dias,
    datasets: [{
      label: 'Faturamento (R$)',
      data: faturamentoPorDia,
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#1e40af',
      pointRadius: 4
    }]
  };

  const mapVendas = {};
  historicoVendas.forEach(v => {
    mapVendas[v.produto_id] = (mapVendas[v.produto_id] || 0) + Number(v.quantidade);
  });

  const desempenhoEstoque = estoque.filter(i => i.quantidade > 0).map(item => ({
    nome: item.nome,
    qtdVendida: mapVendas[item.id] || 0
  }));

  const topProdutos = [...desempenhoEstoque]
    .filter(i => i.qtdVendida > 0)
    .sort((a, b) => b.qtdVendida - a.qtdVendida)
    .slice(0, 5);

  const pioresProdutos = [...desempenhoEstoque]
    .sort((a, b) => a.qtdVendida - b.qtdVendida)
    .slice(0, 5);

  const dataBarraMelhores = {
    labels: topProdutos.map(p => p.nome.length > 12 ? p.nome.substring(0, 12) + '...' : p.nome),
    datasets: [{
      label: 'Unidades Vendidas',
      data: topProdutos.map(p => p.qtdVendida),
      backgroundColor: ['#16a34a', '#2563eb', '#f59e0b', '#d97706', '#8b5cf6'],
      borderRadius: 4
    }]
  };

  const dataBarraPiores = {
    labels: pioresProdutos.map(p => p.nome.length > 12 ? p.nome.substring(0, 12) + '...' : p.nome),
    datasets: [{
      label: 'Unidades Vendidas',
      data: pioresProdutos.map(p => p.qtdVendida),
      backgroundColor: ['#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2'],
      borderRadius: 4
    }]
  };

  const vendasPorCategoria = {};
  const ultimaVendaMap = {};

  historicoVendas.forEach(v => {
    const produto = estoque.find(p => p.id === v.produto_id);
    const categoria = produto?.categoria || 'Sem Categoria';
    if (vendasPorCategoria[categoria]) {
      vendasPorCategoria[categoria] += Number(v.valor_total);
    } else {
      vendasPorCategoria[categoria] = Number(v.valor_total);
    }

    const dataVenda = new Date(v.created_at).getTime();
    if (!ultimaVendaMap[v.produto_id] || dataVenda > ultimaVendaMap[v.produto_id]) {
      ultimaVendaMap[v.produto_id] = dataVenda;
    }
  });

  const dataRosca = {
    labels: Object.keys(vendasPorCategoria),
    datasets: [{
      data: Object.values(vendasPorCategoria),
      backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  // Removi o limite de 5 itens. Agora mostra todos os produtos parados.
  const produtosParados = estoque
    .filter(i => i.quantidade > 0)
    .map(item => {
      const ultima = ultimaVendaMap[item.id];
      let diasParado = Infinity; 
      let textoUltima = "Nunca vendido";

      if (ultima) {
        const diffTempo = new Date().getTime() - ultima;
        diasParado = Math.floor(diffTempo / (1000 * 3600 * 24));
        textoUltima = diasParado === 0 ? "Vendido hoje" : `Ha ${diasParado} dias`;
      }

      return { ...item, diasParado, textoUltima };
    })
    .sort((a, b) => b.diasParado - a.diasParado); 

  return (
    <div className="atlas-container">
      <header className="atlas-header">
        <div>
          <h1>Painel Gerencial</h1>
          <p>Visao 360 de performance, vendas e oportunidades</p>
        </div>
      </header>

      <div className="atlas-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '20px' }}>
        <div className="atlas-card card-centro" style={{ borderLeft: '4px solid #3b82f6' }}>
          <h3 style={{ color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>Total de Produtos</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>{totalItens} skus</div>
        </div>
        <div className="atlas-card card-centro" style={{ borderLeft: '4px solid #10b981' }}>
          <h3 style={{ color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>Capital Imobilizado</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>R$ {capitalEstoque.toFixed(2)}</div>
        </div>
        <div className="atlas-card card-centro" style={{ borderLeft: '4px solid #f59e0b' }}>
          <h3 style={{ color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>Itens em Alerta (Baixo)</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#b45309' }}>{itensAlerta} itens</div>
        </div>
        <div className="atlas-card card-centro" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <h3 style={{ color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>Faturamento Global</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>R$ {faturamentoTotal.toFixed(2)}</div>
        </div>
      </div>

      <div className="atlas-linha" style={{ marginBottom: '20px', gap: '20px', alignItems: 'stretch' }}>
        <div className="atlas-card" style={{ flex: 2 }}>
          <div className="card-titulo">Evolucao do Faturamento (7 Dias)</div>
          <div style={{ height: '250px', display: 'flex', justifyContent: 'center' }}>
            <Line options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} data={dataLinha} />
          </div>
        </div>

        <div className="atlas-card" style={{ flex: 1 }}>
          <div className="card-titulo">Receita por Categoria</div>
          <div style={{ height: '250px', display: 'flex', justifyContent: 'center' }}>
            {Object.keys(vendasPorCategoria).length > 0 ? (
              <Doughnut options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } } }} data={dataRosca} />
            ) : (
              <p className="texto-cinza-vazio">Sem dados de vendas.</p>
            )}
          </div>
        </div>
      </div>

      <div className="atlas-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: '20px' }}>
        <div className="atlas-card">
          <div className="card-titulo" style={{ color: '#16a34a' }}>Top 5 Mais Vendidos (Sucesso)</div>
          <div style={{ height: '220px', display: 'flex', justifyContent: 'center' }}>
            {topProdutos.length > 0 ? (
              <Bar options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} data={dataBarraMelhores} />
            ) : (
              <p className="texto-cinza-vazio">Sem dados suficientes.</p>
            )}
          </div>
        </div>

        <div className="atlas-card">
          <div className="card-titulo" style={{ color: '#e11d48' }}>Top 5 Menos Vendidos (Abaixo da Media)</div>
          <div style={{ height: '220px', display: 'flex', justifyContent: 'center' }}>
            {pioresProdutos.length > 0 ? (
              <Bar options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} data={dataBarraPiores} />
            ) : (
              <p className="texto-cinza-vazio">Sem dados suficientes.</p>
            )}
          </div>
        </div>
      </div>

      <div className="atlas-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        
        <div className="atlas-card">
          <div className="card-titulo">Todas as Vendas Realizadas</div>
          <div style={{ overflowY: 'auto', maxHeight: '300px', paddingRight: '5px' }}>
            {/* Removi o limitador, mostra todo o histórico rolável */}
            {historicoVendas.map(venda => (
              <div key={venda.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#0f172a' }}>{venda.produto_nome.length > 20 ? venda.produto_nome.substring(0, 20) + '...' : venda.produto_nome}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>VD-{String(venda.numero_venda).padStart(4, '0')} | {new Date(venda.created_at).toLocaleTimeString('pt-BR')}</div>
                </div>
                <div style={{ fontWeight: 'bold', color: '#16a34a', fontSize: '13px' }}>
                  R$ {Number(venda.valor_total).toFixed(2)}
                </div>
              </div>
            ))}
            {historicoVendas.length === 0 && <p className="texto-cinza-vazio" style={{marginTop:'30px'}}>Nenhuma venda registrada.</p>}
          </div>
        </div>

        <div className="atlas-card">
          <div className="card-titulo" style={{ color: '#ea580c' }}>Atenção: Estoque Baixo</div>
          <div style={{ overflowY: 'auto', maxHeight: '300px', paddingRight: '5px' }}>
            {/* Lista completa de itens em alerta */}
            {itensFiltroAlerta.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#fffbeb', borderRadius: '6px', marginBottom: '8px', border: '1px solid #fde68a' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#b45309' }}>{item.nome}</div>
                  <div style={{ fontSize: '11px', color: '#d97706' }}>SKU: {item.sku}</div>
                </div>
                <div style={{ fontWeight: 'bold', color: '#d97706', fontSize: '14px' }}>
                  {item.quantidade} un
                </div>
              </div>
            ))}
            {itensFiltroAlerta.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', background: '#f0fdf4', borderRadius: '6px', color: '#15803d', border: '1px solid #bbf7d0', marginTop: '20px' }}>
                <strong>Estoque Saudavel!</strong>
              </div>
            )}
          </div>
        </div>

        <div className="atlas-card">
          <div className="card-titulo" style={{ color: '#e11d48' }}>Radar de Encalhe Geral</div>
          <div style={{ overflowY: 'auto', maxHeight: '300px', paddingRight: '5px' }}>
            {/* Lista completa de encalhados */}
            {produtosParados.map(item => (
              <div key={`enc-${item.id}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#fff1f2', borderRadius: '6px', marginBottom: '8px', border: '1px solid #fecdd3' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#be123c' }}>{item.nome.length > 20 ? item.nome.substring(0,20)+'...' : item.nome}</div>
                  <div style={{ fontSize: '11px', color: '#9f1239' }}>Estoque: {item.quantidade} un</div>
                </div>
                <div style={{ fontWeight: 'bold', color: '#e11d48', fontSize: '12px', textAlign: 'right' }}>
                  Ultima saida:<br/>{item.textoUltima}
                </div>
              </div>
            ))}
            {produtosParados.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', background: '#f0fdf4', borderRadius: '6px', color: '#15803d', border: '1px solid #bbf7d0', marginTop: '20px' }}>
                <strong>Giro Perfeito!</strong><br/>Tudo foi vendido recentemente.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
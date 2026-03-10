import React, { useState } from 'react';
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  ShoppingCart,
  DollarSign
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// =========================================================================
// ESTRUTURA BLINDADA DO BANCO DE DADOS ATLAS ERP
// =========================================================================

export default function Dashboard({ estoque = [], historicoVendas = [] }) {
  
  const dataAtual = new Date();
  const mesAtual = `${dataAtual.getFullYear()}-${String(dataAtual.getMonth() + 1).padStart(2, '0')}`;
  const [mesSelecionado, setMesSelecionado] = useState(mesAtual);

  const vendasDoMes = historicoVendas.filter(v => {
    if (!v.created_at) return false;
    return v.created_at.startsWith(mesSelecionado);
  });

  const faturamentoTotal = vendasDoMes.reduce((acc, v) => acc + Number(v.valor_total || 0), 0);
  const totalItens = vendasDoMes.reduce((acc, v) => acc + Number(v.quantidade || 0), 0);
  const ticketMedio = vendasDoMes.length > 0 ? (faturamentoTotal / vendasDoMes.length) : 0;

  const estoqueBaixo = estoque.filter(p => p.quantidade > 0 && p.quantidade <= (p.estoque_minimo || 5));

  const mapaVendas = {};
  vendasDoMes.forEach(v => {
    if (!mapaVendas[v.produto_id]) {
      mapaVendas[v.produto_id] = { nome: v.produto_nome, totalVendido: 0, ultimaVenda: v.created_at };
    }
    mapaVendas[v.produto_id].totalVendido += Number(v.quantidade);
  });

  const topVendidos = Object.values(mapaVendas)
    .sort((a, b) => b.totalVendido - a.totalVendido)
    .slice(0, 3);

  const mapaVendasGlobal = {};
  historicoVendas.forEach(v => {
    if (!mapaVendasGlobal[v.produto_id]) {
      mapaVendasGlobal[v.produto_id] = { ultimaVenda: v.created_at };
    }
    if (new Date(v.created_at) > new Date(mapaVendasGlobal[v.produto_id].ultimaVenda)) {
      mapaVendasGlobal[v.produto_id].ultimaVenda = v.created_at;
    }
  });

  const estoqueSemGiro = estoque
    .filter(p => p.quantidade > 0 && !mapaVendasGlobal[p.id])
    .map(p => ({ nome: p.nome, qtd: p.quantidade, ultimaVenda: null }));

  const mapaCategorias = {};
  estoque.forEach(p => {
    const cat = p.categoria || 'Sem Categoria';
    if (!mapaCategorias[cat]) mapaCategorias[cat] = 0;
    mapaCategorias[cat] += Number(p.quantidade);
  });
  const dadosPizza = Object.keys(mapaCategorias).map(cat => ({ name: cat, value: mapaCategorias[cat] }));
  const coresPizza = ['#0f172a', '#3b82f6', '#f97316', '#10b981', '#8b5cf6', '#ec4899'];

  const [anoStr, mesStr] = mesSelecionado.split('-');
  const diasNoMes = new Date(anoStr, Number(mesStr), 0).getDate();

  const dadosGraficoMes = Array.from({ length: diasNoMes }, (_, i) => ({
    dia: String(i + 1).padStart(2, '0'),
    vendas: 0
  }));

  vendasDoMes.forEach(v => {
    const dataVenda = new Date(v.created_at);
    dataVenda.setMinutes(dataVenda.getMinutes() + dataVenda.getTimezoneOffset());
    const diaVenda = dataVenda.getDate();
    const index = diaVenda - 1;
    if (dadosGraficoMes[index]) {
      dadosGraficoMes[index].vendas += Number(v.valor_total || 0);
    }
  });

  const formatarData = (dataIso) => {
    if (!dataIso) return "Nunca vendido";
    return new Date(dataIso).toLocaleDateString('pt-BR');
  };

  return (
    // Removido o marginLeft: 250px que quebrava tudo, agora o sistema gerencia sozinho!
    <div className="dashboard-container" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      
      {/* LINHA 1: Cards Principais (Com Flex Wrap para Responsividade) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        <div className="atlas-card" style={{ flex: '1 1 200px', borderLeft: '4px solid #0f172a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '10px' }}>
            <span style={{ fontWeight: '600', fontSize: '14px' }}>Faturamento (Mês)</span>
            <DollarSign size={20} color="#0f172a" />
          </div>
          <p style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>R$ {faturamentoTotal.toFixed(2)}</p>
        </div>

        <div className="atlas-card" style={{ flex: '1 1 200px', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '10px' }}>
            <span style={{ fontWeight: '600', fontSize: '14px' }}>Itens Vendidos</span>
            <ShoppingCart size={20} color="#3b82f6" />
          </div>
          <p style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{totalItens}</p>
        </div>

        <div className="atlas-card" style={{ flex: '1 1 200px', borderLeft: '4px solid #f97316' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '10px' }}>
            <span style={{ fontWeight: '600', fontSize: '14px' }}>Ticket Médio</span>
            <TrendingUp size={20} color="#f97316" />
          </div>
          <p style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>R$ {ticketMedio.toFixed(2)}</p>
        </div>

        <div className="atlas-card" style={{ flex: '1 1 200px', borderLeft: '4px solid #dc2626' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '10px' }}>
            <span style={{ fontWeight: '600', fontSize: '14px' }}>Estoque Crítico</span>
            <AlertTriangle size={20} color="#dc2626" />
          </div>
          <p style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{estoqueBaixo.length} Produtos</p>
        </div>
      </div>

      {/* LINHA 2: Gráficos (Ajustáveis) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        
        <div className="atlas-card" style={{ flex: '1 1 500px', height: '350px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ fontSize: '16px', color: '#0f172a', margin: 0 }}>Faturamento Diário</h3>
            <input 
              type="month" 
              value={mesSelecionado}
              onChange={(e) => setMesSelecionado(e.target.value)}
              className="input-tabela"
              style={{ width: '150px' }}
            />
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dadosGraficoMes} margin={{ top: 5, right: 10, left: 15, bottom: 0 }}>
              <XAxis dataKey="dia" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis width={75} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$ ${value}`} />
              <Tooltip 
                cursor={{ fill: '#f1f5f9' }} 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Vendas']}
                labelFormatter={(label) => `Dia ${label}`}
              />
              <Bar dataKey="vendas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="atlas-card" style={{ flex: '1 1 300px', height: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ fontSize: '16px', color: '#0f172a', marginBottom: '10px', alignSelf: 'flex-start' }}>Estoque por Categoria</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={dadosPizza} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {dadosPizza.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={coresPizza[index % coresPizza.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LINHA 3: Tabelas de Ação (Agora se adaptam à tela) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        
        <div className="atlas-card" style={{ flex: '1 1 300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
            <TrendingUp size={18} color="#10b981" />
            <h3 style={{ fontSize: '15px', color: '#0f172a', margin: 0 }}>Top 3 Mais Vendidos (Mês)</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topVendidos.length === 0 ? <p style={{ fontSize: '13px', color: '#94a3b8' }}>Nenhuma venda registrada no período.</p> : topVendidos.map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ color: '#334155', fontSize: '14px' }}>{item.nome}</span>
                <span style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '14px' }}>{item.totalVendido} un</span>
              </div>
            ))}
          </div>
        </div>

        <div className="atlas-card" style={{ flex: '1 1 300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
            <AlertTriangle size={18} color="#f97316" />
            <h3 style={{ fontSize: '15px', color: '#0f172a', margin: 0 }}>Reposição Urgente</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {estoqueBaixo.length === 0 ? <p style={{ fontSize: '13px', color: '#94a3b8' }}>Estoque sob controle.</p> : estoqueBaixo.map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ color: '#334155', fontSize: '14px' }}>{item.nome}</span>
                <span style={{ fontWeight: 'bold', color: '#f97316', fontSize: '14px' }}>{item.quantidade} un</span>
              </div>
            ))}
          </div>
        </div>

        <div className="atlas-card" style={{ flex: '1 1 300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
            <Package size={18} color="#64748b" />
            <h3 style={{ fontSize: '15px', color: '#0f172a', margin: 0 }}>Estoque Sem Giro Geral</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '150px', overflowY: 'auto' }}>
            {estoqueSemGiro.length === 0 ? <p style={{ fontSize: '13px', color: '#94a3b8' }}>Todos os produtos têm giro.</p> : estoqueSemGiro.map((item, index) => (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#0f172a', fontWeight: '600', fontSize: '14px' }}>{item.nome}</span>
                  <span style={{ fontWeight: 'bold', color: '#64748b', fontSize: '14px' }}>{item.qtd} un</span>
                </div>
                <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', fontWeight: '500' }}>
                  Última venda: {formatarData(item.ultimaVenda)}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
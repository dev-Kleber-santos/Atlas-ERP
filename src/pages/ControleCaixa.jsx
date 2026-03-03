import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function ControleCaixa({ caixaAtivo, abrirCaixa, fecharCaixa, historicoVendas, usuarioAtual }) {
  const [valorInicial, setValorInicial] = useState('');
  const [valorFisico, setValorFisico] = useState('');

  // Lógica para calcular o total vendido apenas HOJE neste caixa específico
  const vendasDoCaixa = caixaAtivo 
    ? historicoVendas.filter(v => new Date(v.created_at) >= new Date(caixaAtivo.data_abertura))
    : [];
  
  const totalVendido = vendasDoCaixa.reduce((acc, v) => acc + Number(v.valor_total), 0);
  const valorEsperado = caixaAtivo ? Number(caixaAtivo.valor_inicial) + totalVendido : 0;

  const handleAbrir = () => {
    if (valorInicial === '') return toast.warn("Informe o valor de troco inicial na gaveta.");
    abrirCaixa(valorInicial);
    setValorInicial('');
  };

  const handleFechar = () => {
    if (valorFisico === '') return toast.warn("Informe o valor total em dinheiro contado na gaveta.");
    if (window.confirm("Atenção: Tem certeza que deseja encerrar o turno do caixa agora?")) {
      fecharCaixa(valorFisico, valorEsperado, totalVendido);
      setValorFisico('');
    }
  };

  return (
    <div className="atlas-container">
      <header className="atlas-header">
        <div>
          <h1>Controle de Caixa</h1>
          <p>Abertura, conferência e fechamento de turno</p>
        </div>
      </header>

      <div className="atlas-grid grid-start">
        {!caixaAtivo ? (
          // TELA DE ABERTURA
          <div className="atlas-card centralizado-800">
            <div className="card-titulo">Abrir Novo Turno</div>
            <div className="atlas-linha">
              <div className="atlas-campo w-100">
                <label>Operador Responsável</label>
                <input type="text" value={usuarioAtual} disabled className="input-tabela" style={{ background: '#f1f5f9' }} />
              </div>
            </div>
            <div className="atlas-linha mt-15">
              <div className="atlas-campo w-100">
                <label>Fundo de Caixa / Troco Inicial (R$)</label>
                <input 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  placeholder="Ex: 150.00" 
                  value={valorInicial} 
                  onChange={e => setValorInicial(e.target.value)} 
                  className="input-destaque-centro" 
                />
              </div>
            </div>
            <button className="botao-primario btn-bg-black w-100 mt-20 btn-gigante" onClick={handleAbrir}>
              🔓 Iniciar Operações de Venda
            </button>
          </div>
        ) : (
          // TELA DE FECHAMENTO
          <div className="atlas-card centralizado-800">
            <div className="card-titulo">Resumo do Turno Aberto</div>
            
            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
              <p><strong>Aberto por:</strong> {caixaAtivo.usuario_abertura}</p>
              <p><strong>Início:</strong> {new Date(caixaAtivo.data_abertura).toLocaleString('pt-BR')}</p>
              <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px dashed #cbd5e1' }}/>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', marginTop: '10px' }}>
                <span>Fundo de Troco:</span>
                <strong>R$ {Number(caixaAtivo.valor_inicial).toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', marginTop: '5px' }}>
                <span>(+) Vendas Registradas:</span>
                <strong style={{ color: '#16a34a' }}>R$ {totalVendido.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', marginTop: '15px', padding: '10px', background: '#e2e8f0', borderRadius: '5px' }}>
                <span>SALDO ESPERADO NO CAIXA:</span>
                <strong>R$ {valorEsperado.toFixed(2)}</strong>
              </div>
            </div>

            <div className="atlas-linha">
              <div className="atlas-campo w-100">
                <label>Contagem Cega (Quanto há na gaveta fisicamente?)</label>
                <input 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  placeholder="0.00" 
                  value={valorFisico} 
                  onChange={e => setValorFisico(e.target.value)} 
                  className="input-destaque-centro" 
                />
              </div>
            </div>
            <button className="botao-secundario w-100 mt-20 btn-gigante" style={{ borderColor: '#e11d48', color: '#e11d48' }} onClick={handleFechar}>
              🔒 Encerrar Expediente e Fechar Caixa
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
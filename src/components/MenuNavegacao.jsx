import React from 'react';
import './MenuNavegacao.css';

// =========================================================================
// ESTRUTURA BLINDADA DO BANCO DE DADOS ATLAS ERP
// =========================================================================

export default function MenuNavegacao({ itensMenu, setTelaAtiva, usuarioAtual, realizarLogoff, temaEscuro, setTemaEscuro }) {
  
  return (
    <nav 
      className="mega-menu-topo" 
      style={{ 
        backgroundColor: temaEscuro ? '#0a0a0a' : '#ffffff', 
        borderBottom: temaEscuro ? '1px solid #222222' : '1px solid #e2e8f0',
        transition: 'all 0.3s ease'
      }}
    >
      
      <div 
        className="menu-logo" 
        onClick={() => setTelaAtiva('inicio')} 
        style={{ cursor: 'pointer', color: temaEscuro ? '#ffffff' : '#000000' }}
      >
        <span className="menu-logo-destaque" style={{ color: temaEscuro ? '#ffffff' : '#000000' }}>ATLAS</span> ERP
      </div>
      
      <ul className="menu-lista">
        {itensMenu.map((menu, indexMenu) => (
          <li key={`menu-${indexMenu}`} className="menu-item-dropdown">
            
            <span className="menu-titulo" style={{ display: 'flex', alignItems: 'center', color: temaEscuro ? '#ffffff' : '#000000' }}>
              {menu.nome} ▾
            </span>
            
            <ul 
              className="dropdown-conteudo" 
              style={{ 
                backgroundColor: temaEscuro ? '#121212' : '#ffffff', 
                border: temaEscuro ? '1px solid #222222' : '1px solid #e2e8f0',
                boxShadow: temaEscuro ? '0 10px 25px rgba(0,0,0,0.8)' : '0 10px 25px rgba(0,0,0,0.1)'
              }}
            >
              {menu.filhos.map((filho, indexFilho) => {
                const slugFilho = filho
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .toLowerCase()
                  .replace(/ /g, '-')
                  .replace(/[^\w-]+/g, '');
                  
                return (
                  <li 
                    key={`filho-${indexMenu}-${indexFilho}`} 
                    onClick={() => setTelaAtiva(slugFilho)}
                    style={{ 
                      color: temaEscuro ? '#a3a3a3' : '#334155',
                      padding: '10px 15px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { 
                      e.target.style.backgroundColor = temaEscuro ? '#222222' : '#f1f5f9'; 
                      e.target.style.color = temaEscuro ? '#ffffff' : '#000000'; 
                    }}
                    onMouseOut={(e) => { 
                      e.target.style.backgroundColor = 'transparent'; 
                      e.target.style.color = temaEscuro ? '#a3a3a3' : '#334155'; 
                    }}
                  >
                    {filho}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>

      <div className="menu-usuario" style={{ display: 'flex', alignItems: 'center', gap: '15px', color: temaEscuro ? '#ffffff' : '#000000' }}>
         
         <button 
           onClick={() => setTemaEscuro(!temaEscuro)} 
           style={{ 
             background: temaEscuro ? '#222222' : 'transparent', 
             color: temaEscuro ? '#ffffff' : '#000000',
             border: temaEscuro ? '1px solid #333333' : '1px solid #cbd5e1', 
             padding: '6px 12px', 
             borderRadius: '6px', 
             cursor: 'pointer', 
             fontSize: '12px', 
             fontWeight: 'bold',
             transition: 'all 0.3s'
           }}
         >
           {temaEscuro ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
         </button>

         <span style={{ fontWeight: 'bold' }}>{usuarioAtual || 'Operador'}</span> 
         
         <button 
           className="botao-sair" 
           onClick={realizarLogoff}
           style={{
             backgroundColor: temaEscuro ? '#ffffff' : '#000000',
             color: temaEscuro ? '#000000' : '#ffffff',
             border: 'none',
             padding: '6px 14px',
             borderRadius: '6px',
             cursor: 'pointer',
             fontWeight: 'bold'
           }}
         >
           Sair
         </button>
      </div>
    </nav>
  );
}
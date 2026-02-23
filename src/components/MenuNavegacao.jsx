// src/components/MenuNavegacao.jsx
import React, { useState } from 'react';
import logoMenu from '../assets/logo.png';

export default function MenuNavegacao({ 
    itensMenu, 
    setTelaAtiva, 
    setTermoBusca, 
    setLinhasItens, 
    usuarioAtual, 
    realizarLogoff 
}) {
  const [menuAtivo, setMenuAtivo] = useState(null);

  const resetarEstadoAoNavegar = (filho) => {
    setTelaAtiva(filho.toLowerCase().replace(/\s/g, '-'));
    setMenuAtivo(null);
    setTermoBusca('');
    setLinhasItens([{ id: Date.now(), qtd: 0, valor: 0, vlrA: 0, vlrB: 0, vlrC: 0 }]);
  };

  return (
    <nav className="barra-navegacao">
      <img src={logoMenu} alt="Logo ERP" className="imagem-logo-nav" onClick={() => setTelaAtiva('inicio')} style={{ cursor: 'pointer' }} />
      <div className="logo-area"><h2 className="texto-logo" onClick={() => setTelaAtiva('inicio')} style={{ cursor: 'pointer' }}>ATLAS<span>ERP</span></h2></div>
      
      <ul className="lista-links">
        {itensMenu.map((item) => (
          <li key={item.slug} className="item-menu" onMouseEnter={() => setMenuAtivo(item.slug)} onMouseLeave={() => setMenuAtivo(null)}>
            <button className="botao-link">{item.nome}</button>
            {item.filhos.length > 0 && menuAtivo === item.slug && (
              <ul className="menu-suspenso">
                {item.filhos.map((filho, index) => (
                  <li key={index} className="sub-item">
                    <button className="botao-sub-item" onClick={() => resetarEstadoAoNavegar(filho)}>{filho}</button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#2d3748' }}>👤 Olá, {usuarioAtual}</div>
        <button style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }} onClick={realizarLogoff}>Sair</button>
      </div>
    </nav>
  );
}
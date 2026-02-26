import React from 'react';
import './MenuNavegacao.css';

export default function MenuNavegacao({ itensMenu, setTelaAtiva, usuarioAtual, realizarLogoff }) {
  return (
    <nav className="mega-menu-topo">
      
      {/* AQUI ESTÁ O CLIQUE: Agora a logo funciona como um botão para a Home */}
      <div className="menu-logo" onClick={() => setTelaAtiva('inicio')}>
        <span className="menu-logo-destaque">ATLAS</span> ERP
      </div>
      
      <ul className="menu-lista">
        {itensMenu.map(menu => (
          <li key={menu.slug} className="menu-item-dropdown">
            <span className="menu-titulo">{menu.nome} ▾</span>
            
            <ul className="dropdown-conteudo">
              {menu.filhos.map(filho => {
                const slugFilho = filho
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .toLowerCase()
                  .replace(/ /g, '-')
                  .replace(/[^\w-]+/g, '');
                  
                return (
                  <li key={slugFilho} onClick={() => setTelaAtiva(slugFilho)}>
                    {filho}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>

      <div className="menu-usuario">
         {usuarioAtual || 'Operador'} <button className="botao-sair" onClick={realizarLogoff}>Sair</button>
      </div>
    </nav>
  );
}
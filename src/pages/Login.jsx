import React from 'react';
import logoMenu from '../assets/logo.png';

export default function Login({ realizarLogin, inputUser, setInputUser, inputPass, setInputPass }) {
  return (
    <div className="container-principal tela-login-container">
      <div className="marca-dagua-fundo"></div>
      <div className="atlas-card card-login">
        <div className="login-header">
          <img src={logoMenu} alt="Logo ERP" className="login-logo-img" />
          <h2 className="texto-logo">ATLAS<span>ERP</span></h2>
          <p className="login-subtitulo">Acesso Restrito</p>
        </div>
        <form onSubmit={realizarLogin}>
          <div className="atlas-campo margin-bottom-20">
            <label>Nome de Usuário</label>
            <input 
              type="text" 
              value={inputUser} 
              onChange={(e) => setInputUser(e.target.value)} 
              placeholder="Ex: Kleber" 
              autoFocus 
            />
          </div>
          <div className="atlas-campo margin-bottom-30">
            <label>Senha</label>
            <input 
              type="password" 
              value={inputPass} 
              onChange={(e) => setInputPass(e.target.value)} 
              placeholder="••••••••" 
            />
          </div>
          <button type="submit" className="botao-primario btn-login">
            Entrar no Sistema
          </button>
        </form>
      </div>
    </div>
  );
}
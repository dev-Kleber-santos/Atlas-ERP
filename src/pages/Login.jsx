// src/pages/Login.jsx
import React from 'react';
import logoMenu from '../assets/logo.png';

export default function Login({ realizarLogin, inputUser, setInputUser, inputPass, setInputPass }) {
  return (
    <div className="container-principal" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="marca-dagua-fundo"></div>
      <div className="atlas-card" style={{ width: '100%', maxWidth: '400px', zIndex: 10, padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img src={logoMenu} alt="Logo ERP" style={{ height: '60px', marginBottom: '10px' }} />
          <h2 className="texto-logo">ATLAS<span>ERP</span></h2>
          <p style={{ color: '#718096', fontSize: '14px', marginTop: '5px' }}>Acesso Restrito</p>
        </div>
        <form onSubmit={realizarLogin}>
          <div className="atlas-campo" style={{ marginBottom: '20px' }}>
            <label>Nome de Usuário</label>
            <input type="text" value={inputUser} onChange={(e) => setInputUser(e.target.value)} placeholder="Ex: Kleber" autoFocus />
          </div>
          <div className="atlas-campo" style={{ marginBottom: '30px' }}>
            <label>Senha</label>
            <input type="password" value={inputPass} onChange={(e) => setInputPass(e.target.value)} placeholder="••••••••" />
          </div>
          <button type="submit" className="botao-primario" style={{ width: '100%', padding: '15px', fontSize: '16px' }}>Entrar no Sistema</button>
        </form>
      </div>
    </div>
  );
}
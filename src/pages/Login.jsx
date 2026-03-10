import React from 'react';
import Lottie from 'lottie-react';
import animacaoCarrinho from '../assets/empilhadeira.json'; 

// =========================================================================
// ESTRUTURA BLINDADA DO BANCO DE DADOS ATLAS ERP
// =========================================================================

export default function Login({ realizarLogin, inputUser, setInputUser, inputPass, setInputPass }) {
  // Paleta All-Black Premium
  const corDeFundo = '#050505'; // Preto profundo (Lado da logo)
  const corPainelLogin = '#121212'; // Levemente mais claro para o formulário
  const corTextoAtlas = '#ffffff'; 
  const corTextoErp = '#64748b'; // Cinza chumbo
  const corFundoInput = '#1a1a1a'; // Fundo do input
  const corBordaInput = '#333333';
  const corTextoInput = '#ffffff'; 

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: corDeFundo, color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      
      {/* LADO ESQUERDO: Formulário Escuro e Minimalista */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 8%', backgroundColor: corPainelLogin, zIndex: 2, borderRight: '1px solid #222' }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          
          <h1 style={{ fontSize: '34px', color: '#ffffff', marginBottom: '8px', fontWeight: '800', letterSpacing: '-0.5px' }}>Acesso Restrito</h1>
          <p style={{ color: '#94a3b8', marginBottom: '40px', fontSize: '15px' }}>Insira suas credenciais para autenticar.</p>

          <form onSubmit={realizarLogin} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '600', color: '#cbd5e1', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Usuário de Acesso</label>
              <input 
                type="text" 
                value={inputUser} 
                onChange={(e) => setInputUser(e.target.value)} 
                required 
                placeholder="Digite seu login"
                style={{ padding: '16px', borderRadius: '8px', border: `1px solid ${corBordaInput}`, backgroundColor: corFundoInput, color: corTextoInput, fontSize: '15px', outline: 'none', transition: 'all 0.3s' }} 
                onFocus={(e) => { e.target.style.borderColor = '#64748b'; e.target.style.boxShadow = '0 0 0 3px rgba(100,116,139,0.1)' }}
                onBlur={(e) => { e.target.style.borderColor = corBordaInput; e.target.style.boxShadow = 'none' }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '600', color: '#cbd5e1', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Senha Confidencial</label>
              <input 
                type="password" 
                value={inputPass} 
                onChange={(e) => setInputPass(e.target.value)} 
                required 
                placeholder="••••••••"
                style={{ padding: '16px', borderRadius: '8px', border: `1px solid ${corBordaInput}`, backgroundColor: corFundoInput, color: corTextoInput, fontSize: '15px', outline: 'none', letterSpacing: '3px', transition: 'all 0.3s' }} 
                onFocus={(e) => { e.target.style.borderColor = '#64748b'; e.target.style.boxShadow = '0 0 0 3px rgba(100,116,139,0.1)' }}
                onBlur={(e) => { e.target.style.borderColor = corBordaInput; e.target.style.boxShadow = 'none' }}
              />
            </div>

            {/* Botão de Contraste Branco */}
            <button type="submit" style={{ padding: '16px', borderRadius: '8px', border: 'none', backgroundColor: '#ffffff', color: '#000000', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(255,255,255,0.15)' }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#e2e8f0'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#ffffff'}
              onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
            >
              Autenticar e Entrar
            </button>
          </form>

        </div>
      </div>

      {/* LADO DIREITO: Fundo Preto Profundo com Logo Branca/Cinza e Lottie */}
      <div style={{ flex: '1.2', backgroundColor: corDeFundo, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        
        {/* Brilho radial bem suave no centro */}
        <div style={{ position: 'absolute', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0) 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}></div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', width: '100%', gap: '20px', zIndex: 1 }}>
          <div style={{ fontSize: '70px', fontWeight: '900', letterSpacing: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: corTextoAtlas }}>ATLAS</span>
            <span style={{ color: corTextoErp, fontWeight: '300' }}>ERP</span>
          </div>
          
          <div style={{ width: '150px' }}>
            <Lottie animationData={animacaoCarrinho} loop={true} autoplay={true} />
          </div>
        </div>

        <div style={{ marginTop: '40px', color: '#334155', fontSize: '14px', zIndex: 1, letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 'bold' }}>
          Alta Performance em Gestão
        </div>
      </div>

    </div>
  );
}
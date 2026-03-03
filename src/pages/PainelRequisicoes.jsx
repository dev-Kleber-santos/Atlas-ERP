import React from 'react';

export default function PainelRequisicoes({ listaRequisicoes, usuarioRole, atualizarStatusRequisicao, visualizarPDFRequisicao }) {
  return (
    <div className="atlas-container">
      <header className="atlas-header">
        <div>
          <h1>Aprovações e Requisições</h1>
          <p>Gerenciamento de chamados internos e compras de insumos</p>
        </div>
      </header>
      <div className="atlas-card full">
        <table className="atlas-tabela">
          <thead>
            <tr>
              <th>Protocolo</th>
              <th>Solicitante</th>
              <th>Natureza</th>
              <th>Justificativa</th>
              <th>Documento</th>
              <th>Status</th>
              {usuarioRole === 'gerente' && <th>Ação</th>}
            </tr>
          </thead>
          <tbody>
            {listaRequisicoes.map(req => (
              <tr key={req.id}>
                <td>
                  <strong>{req.protocolo}</strong><br/>
                  <span className="font-11 texto-cinza">{new Date(req.created_at).toLocaleDateString()}</span>
                </td>
                <td>{req.requisitante}</td>
                <td>{req.tipo}</td>
                <td style={{ maxWidth: '200px' }}>{req.justificativa}</td>
                
                {/* BOTÃO QUE GERA O PDF NA HORA */}
                <td>
                  <button 
                    className="botao-secundario font-12" 
                    onClick={() => visualizarPDFRequisicao(req)}
                    style={{ borderColor: '#2563eb', color: '#2563eb' }}
                  >
                    Abrir Documento
                  </button>
                </td>

                <td>
                  <span className={`status-badge ${req.status === 'Aprovado' ? 'status-verde' : req.status === 'Recusado' ? 'status-vermelho' : 'status-alerta'}`}>
                    {req.status}
                  </span>
                </td>
                
                {usuarioRole === 'gerente' && (
                  <td>
                    {req.status === 'Pendente' && (
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button className="botao-primario font-12" onClick={() => atualizarStatusRequisicao(req.id, 'Aprovado')}>Aprovar</button>
                        <button className="botao-secundario font-12" onClick={() => atualizarStatusRequisicao(req.id, 'Recusado')}>Negar</button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {listaRequisicoes.length === 0 && (
              <tr>
                <td colSpan={usuarioRole === 'gerente' ? 7 : 6} className="texto-centro-vazio">
                  Nenhuma requisição encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
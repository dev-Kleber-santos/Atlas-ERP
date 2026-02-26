import React from 'react';
import './style.css'; 

export default function PainelRequisicoes({ listaRequisicoes, usuarioRole, atualizarStatusRequisicao }) {
  return (
    <div className="atlas-container">
      <header className="atlas-header"><h1>Painel de Chamados Internos</h1></header>
      <div className="atlas-card full">
        <table className="atlas-tabela">
          <thead><tr><th>Data</th><th>Protocolo</th><th>Requisitante</th><th>Categoria</th><th>Situação</th><th>Ações (Gerência)</th></tr></thead>
          <tbody>
            {listaRequisicoes.map(req => {
              // Definindo classe de cor via CSS
              let classeStatus = 'status-pendente';
              if (req.status === 'Concluída') classeStatus = 'status-concluida';
              if (req.status === 'Negada') classeStatus = 'status-negada';

              return (
                <tr key={req.id}>
                  <td className="font-12">{new Date(req.created_at).toLocaleDateString()}</td>
                  <td><strong>{req.protocolo}</strong></td>
                  <td>{req.requisitante}</td>
                  <td>{req.tipo}</td>
                  <td><span className={classeStatus}>{req.status}</span></td>
                  <td>
                    {usuarioRole === 'gerente' ? (
                      req.status === 'Pendente' ? (
                        <div className="botoes-acao-linha">
                          <button className="btn-pequeno-verde-outline" onClick={() => atualizarStatusRequisicao(req.id, 'Aprovada')}>Aprovar</button>
                          <button className="btn-pequeno-vermelho-outline" onClick={() => atualizarStatusRequisicao(req.id, 'Negada')}>Negar</button>
                        </div>
                      ) : req.status === 'Aprovada' ? (
                        <button className="btn-pequeno-verde-fill" onClick={() => atualizarStatusRequisicao(req.id, 'Concluída')}>Finalizar Pedido</button>
                      ) : (
                        <span className="status-restrito">Encerrado</span>
                      )
                    ) : (
                      <span className="status-restrito">Restrito</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
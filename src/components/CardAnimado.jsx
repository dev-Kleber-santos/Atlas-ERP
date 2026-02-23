// src/components/CardAnimado.jsx
import React from 'react';

export default function CardAnimado({ corBorda, label, valor, corValor, classeProgresso }) {
  return (
    <div className="card-animado" style={{ borderLeft: `5px solid ${corBorda}` }}>
      <span className="card-label">{label}</span>
      <div className="card-valor" style={{ color: corValor || '#2d3748' }}>
        {valor}
      </div>
      {classeProgresso && (
        <div className="card-progresso">
          <div className={classeProgresso}></div>
        </div>
      )}
    </div>
  );
}
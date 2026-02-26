
export default function CadastroItem({ 
  estoque, 
  salvarCadastroItem, 
  itensPendentesEntrada, 
  prepararAceite, 
  cancelarPendencia 
}) {
  // Puxa as categorias que já existem no banco
  const categoriasExistentes = [...new Set(estoque.map(i => i.categoria))].filter(Boolean).sort();

  return (
    <div className="atlas-container">
      <header className="atlas-header">
        <div>
          <h1>Homologação de Produto</h1>
          <p>Inclusão de novos itens e conferência de mercadorias na doca</p>
        </div>
      </header>
      <div className="atlas-grid">
        
        {/* LADO ESQUERDO: FORMULÁRIO DE CADASTRO */}
        <div className="atlas-card">
          <datalist id="lista-categorias">
            {categoriasExistentes.map((cat, index) => (<option key={index} value={cat} />))}
          </datalist>
          
          <div className="atlas-linha">
            <div className="atlas-campo"><label>SKU</label><input type="text" id="sku-item" /></div>
            <div className="atlas-campo"><label>Descrição</label><input type="text" id="nome-item" /></div>
            <div className="atlas-campo"><label>Categoria</label><input type="text" id="categoria-item" list="lista-categorias" /></div>
          </div>
          <div className="atlas-linha mt-15">
            <div className="atlas-campo"><label>Volume de Entrada</label><input type="number" id="qtd-item" /></div>
            <div className="atlas-campo"><label>Margem de Segurança</label><input type="number" id="minimo-item" defaultValue="5" /></div>
          </div>
          <div className="atlas-linha linha-financeira mt-15">
            <div className="atlas-campo"><label>Forn. Padrao</label><input type="text" id="fornecedor-item" placeholder="Opcional" /></div>
            <div className="atlas-campo"><label>Custo Unitário (R$)</label><input type="number" id="custo-item" placeholder="0.00" /></div>
            <div className="atlas-campo"><label>Valor de Venda (R$)</label><input type="number" id="venda-item" className="input-sucesso" placeholder="0.00" /></div>
          </div>
          <button className="botao-primario w-100 mt-30" onClick={salvarCadastroItem}>Finalizar Homologação</button>
        </div>

        {/* LADO DIREITO: DOCA DE PENDÊNCIAS RESTAURADA */}
        <div className="atlas-card card-alerta">
          <div className="card-titulo">Doca: Pendências de Recebimento</div>
          <div className="lista-rolavel">
            {itensPendentesEntrada && itensPendentesEntrada.length > 0 ? itensPendentesEntrada.map(p => (
              <div key={p.id} className="item-pendente">
                <div className="item-pendente-titulo">{p.nome || "Não Identificado"}</div>
                <div className="item-pendente-sub">
                  Volume: {p.quantidade} | Custo Unit.: R$ {p.custo_unitario} <br /> 
                  Emitente: {p.fornecedor || "Não Informado"}
                </div>
                <div className="botoes-acao">
                  <button className="botao-secundario botao-aceitar" onClick={() => prepararAceite(p)}>Aceitar e Cadastrar</button>
                  <button className="botao-secundario botao-cancelar" onClick={() => cancelarPendencia(p.id)}>Recusar/Descartar</button>
                </div>
              </div>
            )) : (
              <p className="font-12" style={{ color: '#718096' }}>Nenhuma mercadoria aguardando conferência na doca.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
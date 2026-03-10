import React from 'react';
import { jsPDF } from "jspdf";
import { toast } from 'react-toastify';

// =========================================================================
// ESTRUTURA BLINDADA DO BANCO DE DADOS ATLAS ERP
// =========================================================================

export default function Inventario({ termoBusca, setTermoBusca, estoque, gerarSolicitacaoCompra }) {
  
  // BLINDAGEM: Converte para string e garante que não vai quebrar se a coluna for nula
  const itensFiltrados = (estoque || []).filter(item => {
    const nome = String(item.nome || '').toLowerCase();
    const sku = String(item.sku || '').toLowerCase();
    const barra = String(item.codigo_barra || '').toLowerCase();
    const termo = String(termoBusca || '').toLowerCase();

    return nome.includes(termo) || sku.includes(termo) || barra.includes(termo);
  });

  // ==========================================
  // MOTOR GERADOR DE ETIQUETAS (PDF TÉRMICO)
  // ==========================================
  const gerarEtiquetaPDF = (item) => {
    try {
      // Cria um documento pequeno focado em impressoras de etiquetas (Tamanho 50x30mm)
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [50, 30]
      });

      // Borda da etiqueta (ajuda a alinhar o corte na impressora)
      doc.setDrawColor(200, 200, 200);
      doc.rect(1, 1, 48, 28);

      // Nome do Produto (Corta se for muito grande para não desalinhar)
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      const nomeCurto = item.nome.length > 25 ? item.nome.substring(0, 25) + "..." : item.nome;
      doc.text(nomeCurto, 25, 6, { align: "center" });

      // Preço em Grande Destaque
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(`R$ ${Number(item.valor_venda || 0).toFixed(2)}`, 25, 16, { align: "center" });

      // Código SKU ou EAN do produto
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      const identificador = item.codigo_barra ? `EAN: ${item.codigo_barra}` : `SKU: ${item.sku}`;
      doc.text(identificador, 25, 24, { align: "center" });

      // Rodapé da loja (branding)
      doc.setFontSize(5);
      doc.setTextColor(150, 150, 150);
      doc.text("Atlas ERP", 25, 28, { align: "center" });

      doc.save(`Etiqueta_${item.sku}.pdf`);
      toast.success(`Etiqueta do item ${item.sku} gerada com sucesso!`);
    } catch (error) {
      toast.error("Erro ao gerar a etiqueta PDF.");
    }
  };

  return (
    <div className="atlas-container">
      <header className="atlas-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Consulta de Estoque</h1>
          <p>Busque itens por nome, SKU ou Codigo de Barras e gere etiquetas</p>
        </div>
        <div style={{ width: '350px' }}>
          <input 
            type="text" 
            className="input-tabela" 
            placeholder="Pesquisar produto..." 
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
          />
        </div>
      </header>

      <div className="atlas-card full">
        <table className="atlas-tabela">
          <thead>
            <tr>
              <th style={{ width: '60px', textAlign: 'center' }}>Foto</th>
              <th>SKU</th>
              <th>Produto</th>
              <th>Categoria</th>
              <th>Saldo Físico</th>
              <th>Preço (R$)</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {itensFiltrados.map(item => (
              <tr key={item.id}>
                <td style={{ textAlign: 'center' }}>
                  {item.url_imagem ? (
                    <img 
                      src={item.url_imagem} 
                      alt={item.nome} 
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }} 
                    />
                  ) : (
                    <div style={{ width: '40px', height: '40px', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#94a3b8', margin: '0 auto' }}>
                      Sem foto
                    </div>
                  )}
                </td>
                <td>{item.sku}</td>
                <td style={{ fontWeight: 'bold' }}>{item.nome}</td>
                <td>{item.categoria || '-'}</td>
                <td>
                  <span className={`status-badge ${item.quantidade <= (item.estoque_minimo || 5) ? 'status-alerta' : 'status-verde'}`}>
                    {item.quantidade} un
                  </span>
                </td>
                <td style={{ fontWeight: 'bold', color: '#16a34a' }}>{Number(item.valor_venda || 0).toFixed(2)}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="botao-secundario font-12" 
                      onClick={() => gerarSolicitacaoCompra(item)}
                      title="Solicitar reposição de stock"
                    >
                      🛒 Comprar
                    </button>
                    <button 
                      className="botao-primario font-12" 
                      onClick={() => gerarEtiquetaPDF(item)}
                      title="Gerar PDF de Etiqueta Térmica"
                      style={{ backgroundColor: '#0f172a', borderColor: '#0f172a' }}
                    >
                      🖨️ Etiqueta
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {itensFiltrados.length === 0 && (
              <tr>
                <td colSpan="7" className="texto-cinza-vazio" style={{ textAlign: 'center', padding: '30px' }}>
                  Nenhum produto encontrado na busca.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
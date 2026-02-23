import { useState } from 'react'
import './index.css'
import logoMenu from './assets/logo.png'

// IMPORTANDO SEUS NOVOS COMPONENTES LIMPOS (COM .jsx)
import Login from './pages/Login.jsx'
import MenuNavegacao from './components/MenuNavegacao.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Entradas from './pages/Entradas.jsx'
import Inventario from './pages/Inventario.jsx'

// BIBLIOTECAS DE NOTIFICAÇÃO E PDF
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

// ... resto do seu código

function App() {
  // --- ESTADOS DE LOGIN ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usuarioAtual, setUsuarioAtual] = useState('');
  const [inputUser, setInputUser] = useState('');
  const [inputPass, setInputPass] = useState('');

  const [telaAtiva, setTelaAtiva] = useState('inicio')
  const [imagemAnexada, setImagemAnexada] = useState(null);

  // --- ESTADOS GLOBAIS DE ESTOQUE E AUDITORIA ---
  const [estoque, setEstoque] = useState([]);
  const [itensPendentesEntrada, setItensPendentesEntrada] = useState([]);
  const [itemEmEdicao, setItemEmEdicao] = useState(null);
  const [valorTotalEntradas, setValorTotalEntradas] = useState(0);
  const [notasFiscais, setNotasFiscais] = useState([]);

  // --- ESTADOS DE O.S E COMPRAS ---
  const [listaOS, setListaOS] = useState([]);
  const [dadosNovaOS, setDadosNovaOS] = useState({ cliente: '', status: 'Aberta', previsao: '', descricao: '' });
  const [listaFornecedores, setListaFornecedores] = useState([]);
  const [solicitacoesCotacao, setSolicitacoesCotacao] = useState([]);
  const [pedidosOficiais, setPedidosOficiais] = useState([]);

  // --- ESTADOS DE FORMULÁRIO DINÂMICO ---
  const [linhasItens, setLinhasItens] = useState([{ id: Date.now(), qtd: 0, valor: 0, vlrA: 0, vlrB: 0, vlrC: 0 }]);
  const [termoBusca, setTermoBusca] = useState('');

  const itensMenu = [
    { nome: 'Estoque', slug: 'estoque', filhos: ['Entradas', 'Saídas', 'Cadastro de Item'] },
    { nome: 'Inventário', slug: 'inventario', filhos: ['Consultar Itens', 'Categorias', 'Ajustes'] },
    { nome: 'Compras', slug: 'compras', filhos: ['Pedidos', 'Fornecedores', 'Cotações'] },
    { nome: 'Gestão', slug: 'gestao', filhos: ['Dashboard', 'Relatório de NF'] },
    { nome: 'Serviços', slug: 'servicos', filhos: ['Ordens de Serviço', 'Agendamentos'] },
  ]

  // --- FUNÇÕES DE LOGIN ---
  const realizarLogin = (e) => {
    e.preventDefault();
    if (!inputUser || !inputPass) return toast.error("Preencha seu usuário e senha!");
    setUsuarioAtual(inputUser);
    setIsLoggedIn(true);
    toast.success(`Bem-vindo(a), ${inputUser}!`);
  };

  const realizarLogoff = () => {
    setIsLoggedIn(false); setInputUser(''); setInputPass(''); setTelaAtiva('inicio');
  };

  // --- MÁSCARAS DE INPUT E MANIPULADORES DE ARQUIVO ---
  const maskCNPJ = (value) => value.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2').slice(0, 18);
  const maskTelefone = (value) => value.replace(/\D/g, '').replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d)(\d{4})$/, '$1-$2').slice(0, 15);
  const manipularUpload = (e) => { if (e.target.files[0]) setImagemAnexada(URL.createObjectURL(e.target.files[0])); };

  // --- MANIPULAÇÃO DE LINHAS ---
  const adicionarLinha = () => setLinhasItens([...linhasItens, { id: Date.now(), qtd: 0, valor: 0, vlrA: 0, vlrB: 0, vlrC: 0 }]);
  const removerLinha = (id) => { if (linhasItens.length > 1 && window.confirm("Remover este item?")) setLinhasItens(linhasItens.filter(l => l.id !== id)); };
  const atualizarValorLinha = (id, campo, valor) => setLinhasItens(linhasItens.map(linha => linha.id === id ? { ...linha, [campo]: (campo === 'qtd' || campo === 'valor' || campo === 'vlrA' || campo === 'vlrB' || campo === 'vlrC') ? Number(valor) : valor } : linha));

  // --- LÓGICA DE NEGÓCIO: ESTOQUE E COMPRAS ---
  const confirmarEntradaComPendencia = () => {
    const subtotal = linhasItens.reduce((acc, item) => acc + (Number(item.qtd || 0) * Number(item.valor || 0)), 0);
    const fornNF = document.getElementById('forn-entrada')?.value || '';
    const cnpjNF = document.getElementById('cnpj-entrada')?.value || '';
    const dataNF = document.getElementById('data-entrada')?.value || new Date().toISOString().split('T')[0];

    const itensDaNota = linhasItens.map(l => ({ nome: l.nome_temp || 'Sem nome', qtd: Number(l.qtd || 0), valor: Number(l.valor || 0) }));
    if (fornNF || cnpjNF || imagemAnexada || itensDaNota.length > 0) {
      setNotasFiscais([...notasFiscais, { id: Date.now(), fornecedor: fornNF || 'Não informado', cnpj: cnpjNF, data: dataNF, pdf: imagemAnexada, itens: itensDaNota }]);
    }

    const novosPendentes = linhasItens.map(l => ({ id: Date.now() + Math.random(), nome: l.nome_temp || '', qtd: Number(l.qtd || 0), valor: Number(l.valor || 0), marca: l.marca_temp || '', lote: l.lote_temp || '', ncm: l.ncm_temp || '', unid: l.unid_temp || '', fornecedor_padrao: fornNF }));
    
    setItensPendentesEntrada([...itensPendentesEntrada, ...novosPendentes]);
    setValorTotalEntradas(prev => prev + subtotal); 
    toast.success("Entrada salva! NF e Itens registrados.");
    
    setLinhasItens([{ id: Date.now(), qtd: 0, valor: 0, vlrA: 0, vlrB: 0, vlrC: 0 }]); setImagemAnexada(null);
    if(document.getElementById('forn-entrada')) document.getElementById('forn-entrada').value = '';
    if(document.getElementById('cnpj-entrada')) document.getElementById('cnpj-entrada').value = '';
  };

  const prepararAceite = (item) => {
    document.getElementById('nome-item').value = item.nome; document.getElementById('qtd-item').value = item.qtd; document.getElementById('categoria-item').value = ''; document.getElementById('sku-item').value = '';
    if (document.getElementById('fornecedor-item')) document.getElementById('fornecedor-item').value = item.fornecedor_padrao || '';
    if (document.getElementById('custo-item')) document.getElementById('custo-item').value = item.valor || 0;
    setItemEmEdicao(item); toast.info(`Preencha o SKU e Categoria.`);
  };

  const cancelarPendencia = (id) => {
    if (window.confirm("Cancelar este item da fila?")) {
      setItensPendentesEntrada(itensPendentesEntrada.filter(item => item.id !== id));
      if (itemEmEdicao && itemEmEdicao.id === id) { setItemEmEdicao(null); }
      toast.info("Removido.");
    }
  };

  const salvarCadastroItem = () => {
    const nome = document.getElementById('nome-item').value; const categoria = document.getElementById('categoria-item').value; const qtd = Number(document.getElementById('qtd-item').value); const sku = document.getElementById('sku-item').value;
    const fornecedorPadrao = document.getElementById('fornecedor-item')?.value || ''; const custoPadrao = Number(document.getElementById('custo-item')?.value || 0);
    if (!nome || !sku || !categoria) return toast.error("Preencha Nome, Categoria e SKU!");

    setEstoque([...estoque, { id: itemEmEdicao ? itemEmEdicao.id : Date.now(), sku, nome, categoria, quantidade: qtd, marca: itemEmEdicao ? itemEmEdicao.marca : '', fornecedor: fornecedorPadrao, custo: custoPadrao, status: 'ativo' }]);
    if (itemEmEdicao) { setItensPendentesEntrada(itensPendentesEntrada.filter(i => i.id !== itemEmEdicao.id)); setItemEmEdicao(null); }
    toast.success("Item adicionado ao Inventário!");
  };

  const realizarAjusteEstoque = () => {
    const idItem = Number(document.getElementById('sel-ajuste').value); const tipo = document.getElementById('tipo-ajuste').value; const qtdAjuste = Number(document.getElementById('qtd-ajuste').value);
    if (!idItem || !qtdAjuste) return toast.error("Selecione item e quantidade!");
    setEstoque(estoque.map(i => i.id === idItem ? { ...i, quantidade: tipo === 'entrada' ? i.quantidade + qtdAjuste : i.quantidade - qtdAjuste } : i));
    toast.success("Estoque ajustado!");
  };

  const finalizarEAgendarOS = () => {
    if (!dadosNovaOS.cliente || !dadosNovaOS.previsao) return toast.error("Preencha cliente e data!");
    const protocolo = `OS-${Math.floor(1000 + Math.random() * 9000)}`;
    const total = linhasItens.reduce((acc, item) => acc + (item.qtd * item.valor), 0);
    setListaOS([...listaOS, { ...dadosNovaOS, id: Date.now(), protocolo, total, itens: [...linhasItens] }]);
    toast.success(`Protocolo ${protocolo} agendado!`);
    setDadosNovaOS({ cliente: '', status: 'Aberta', previsao: '', descricao: '' }); setLinhasItens([{ id: Date.now(), qtd: 0, valor: 0, vlrA: 0, vlrB: 0, vlrC: 0 }]); setTelaAtiva('agendamentos');
  };

  const salvarFornecedor = () => {
    const razao = document.getElementById('razao-forn').value; const cnpj = document.getElementById('cnpj-forn').value; const email = document.getElementById('email-forn').value;
    if(!razao) return toast.error("Razão Social é obrigatória.");
    setListaFornecedores([...listaFornecedores, { id: Date.now(), razao, cnpj, email }]); toast.success("Fornecedor cadastrado!"); setTelaAtiva('fornecedores');
  };

  const gerarSolicitacaoCompra = (item) => {
    const qtdSolicitada = prompt(`Quantidade necessária de ${item.nome}?`, "1");
    if (qtdSolicitada && !isNaN(qtdSolicitada)) {
      setSolicitacoesCotacao([...solicitacoesCotacao, { id: Date.now(), produto: item.nome, qtd: Number(qtdSolicitada), vlrA: item.custo || 0, fornBase: item.fornecedor || '', vlrB: 0, vlrC: 0 }]);
      toast.info(`Solicitação enviada para Cotações!`);
    }
  };

  const atualizarCotacao = (id, campo, valor) => setSolicitacoesCotacao(solicitacoesCotacao.map(cot => cot.id === id ? { ...cot, [campo]: Number(valor) } : cot));

  const converterCotacaoEmPedido = (cotacao) => {
    const valores = [{ forn: cotacao.fornBase || 'Fornecedor A', vlr: cotacao.vlrA }, { forn: 'Fornecedor B', vlr: cotacao.vlrB }, { forn: 'Fornecedor C', vlr: cotacao.vlrC }].filter(v => v.vlr > 0);
    if (valores.length === 0) return toast.error("Insira um valor para converter.");
    const vencedor = valores.reduce((prev, curr) => (curr.vlr < prev.vlr ? curr : prev));
    setPedidosOficiais([...pedidosOficiais, { id: Date.now(), protocolo: `PED-${Math.floor(1000 + Math.random() * 9000)}`, fornecedor: vencedor.forn, produto: cotacao.produto, qtd: cotacao.qtd, unitario: vencedor.vlr, subtotal: cotacao.qtd * vencedor.vlr, data: new Date().toISOString().split('T')[0] }]);
    setSolicitacoesCotacao(solicitacoesCotacao.filter(c => c.id !== cotacao.id)); toast.success(`Pedido gerado!`); setTelaAtiva('pedidos');
  };

  // --- EXPORTAÇÃO DE PDF ---
  const exportarPDFEstoque = () => {
    const doc = new jsPDF(); doc.text(`ATLAS ERP - ESTOQUE`, 14, 15);
    autoTable(doc, { startY: 25, head: [['SKU', 'Produto', 'Categoria', 'Quantidade']], body: estoque.length > 0 ? estoque.map(i => [i.sku, i.nome, i.categoria, `${i.quantidade} un`]) : [['-', 'Vazio', '-', '-']], theme: 'grid' });
    doc.save(`estoque-${new Date().toISOString().split('T')[0]}.pdf`); toast.success(`PDF gerado!`);
  };

  const exportarPDFFinanceiro = () => {
    const doc = new jsPDF(); const valorTotalAgendado = listaOS.reduce((acc, curr) => acc + curr.total, 0); doc.text(`ATLAS ERP - FINANCEIRO`, 14, 15);
    autoTable(doc, { startY: 25, head: [['Descrição', 'Valor (R$)']], body: [['Entradas (Despesas)', `R$ ${valorTotalEntradas.toFixed(2)}`], ['O.S. (Receitas)', `R$ ${valorTotalAgendado.toFixed(2)}`], ['Saldo Estimado', `R$ ${(valorTotalAgendado - valorTotalEntradas).toFixed(2)}`]], theme: 'grid' });
    doc.save(`financeiro-${new Date().toISOString().split('T')[0]}.pdf`); toast.success(`PDF gerado!`);
  };

  const exportarPDFGenerico = (titulo) => { const doc = new jsPDF(); doc.text(`ATLAS ERP - ${titulo.toUpperCase()}`, 14, 15); doc.save(`${titulo.toLowerCase()}.pdf`); toast.success("PDF gerado!"); };

  // --- RENDERIZAÇÃO DAS TELAS ---
  const renderizarConteudo = () => {
    const valorTotalAgendado = listaOS.reduce((acc, curr) => acc + curr.total, 0);
    const lucroLiquido = valorTotalAgendado - valorTotalEntradas;

    switch (telaAtiva) {
      
      // SUBSTITUÍMOS AS 3 TELAS PELOS SEUS COMPONENTES LIMPOS:
      case 'entradas':
        return <Entradas setTelaAtiva={setTelaAtiva} confirmarEntradaComPendencia={confirmarEntradaComPendencia} maskCNPJ={maskCNPJ} manipularUpload={manipularUpload} imagemAnexada={imagemAnexada} setImagemAnexada={setImagemAnexada} linhasItens={linhasItens} atualizarValorLinha={atualizarValorLinha} removerLinha={removerLinha} adicionarLinha={adicionarLinha} />

      case 'consultar-itens':
        return <Inventario termoBusca={termoBusca} setTermoBusca={setTermoBusca} estoque={estoque} gerarSolicitacaoCompra={gerarSolicitacaoCompra} />

      case 'dashboard':
        return <Dashboard listaOS={listaOS} valorTotalAgendado={valorTotalAgendado} valorTotalEntradas={valorTotalEntradas} lucroLiquido={lucroLiquido} exportarPDFEstoque={exportarPDFEstoque} exportarPDFFinanceiro={exportarPDFFinanceiro} />

      // AS OUTRAS CONTINUAM AQUI ATÉ VOCÊ QUERER SEPARÁ-LAS TAMBÉM:
      case 'saídas':
        return (
          <div className="atlas-container">
            <header className="atlas-header"><h1>Expedição</h1><p>Saída de materiais do estoque</p></header>
            <div className="atlas-card full">
              <div className="atlas-linha" style={{marginBottom: '20px'}}>
                <div className="atlas-campo"><label>Destino</label><input type="text" placeholder="Setor ou Cliente" /></div>
                <div className="atlas-campo"><label>Data</label><input type="date" /></div>
                <div className="atlas-campo"><label>Prioridade</label><select><option>Uso Interno</option><option>Cliente</option></select></div>
              </div>
              <table className="atlas-tabela">
                <thead><tr><th>Produto</th><th>Quantidade</th><th>Motivo</th><th>Ação</th></tr></thead>
                <tbody>
                  {linhasItens.map(linha => (
                    <tr key={linha.id}>
                      <td><input type="text" className="input-tabela" placeholder="Buscar..." /></td>
                      <td><input type="number" className="input-tabela" /></td>
                      <td><input type="text" className="input-tabela" /></td>
                      <td><button onClick={() => removerLinha(linha.id)} className="botao-link" style={{color: 'red'}}>✖</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="botao-adicionar" onClick={adicionarLinha}>+ Adicionar Item</button>
              <button className="botao-primario botao-saida" style={{marginTop: '20px', width: '100%'}} onClick={() => toast.error("Saída realizada!")}>Finalizar Saída</button>
            </div>
          </div>
        );

      case 'cadastro-de-item':
        return (
          <div className="atlas-container">
            <header className="atlas-header"><div><h1>Cadastro de Item</h1><p>Homologue itens pendentes ou crie novos</p></div></header>
            <div className="atlas-grid">
              <div className="atlas-card">
                <div className="card-titulo">Dados do Item</div>
                <div className="atlas-linha"><div className="atlas-campo"><label>Nome</label><input type="text" id="nome-item" /></div><div className="atlas-campo"><label>Categoria</label><input type="text" id="categoria-item" /></div></div>
                <div className="atlas-linha" style={{marginTop: '15px'}}><div className="atlas-campo"><label>Qtd Inicial</label><input type="number" id="qtd-item" /></div><div className="atlas-campo"><label>SKU</label><input type="text" id="sku-item" /></div></div>
                <div className="atlas-linha" style={{marginTop: '15px', padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e0'}}><div className="atlas-campo"><label>Fornecedor Padrão</label><input type="text" id="fornecedor-item" placeholder="Ex: Dell" /></div><div className="atlas-campo"><label>Custo Base (R$)</label><input type="number" id="custo-item" placeholder="Preço Correto" /></div></div>
                <button className="botao-primario" style={{marginTop: '30px', width: '100%'}} onClick={salvarCadastroItem}>Confirmar e Enviar para Estoque</button>
              </div>
              <div className="atlas-card" style={{ borderLeft: '4px solid #ecc94b', background: '#fffaf0' }}>
                <div className="card-titulo">⚠️ Cadastro Pendente</div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {itensPendentesEntrada.length > 0 ? itensPendentesEntrada.map(p => (
                    <div key={p.id} style={{ padding: '15px', borderBottom: '1px solid #fbd38d', background: 'white', borderRadius: '8px', marginBottom: '10px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#2d3748' }}>{p.nome || "Produto sem nome"}</div>
                      <div style={{ fontSize: '12px', color: '#718096', marginBottom: '10px' }}>Qtd: {p.qtd} | Custo NF: R$ {p.valor} <br/> Fornecedor NF: {p.fornecedor_padrao || "Sem Forn."}</div>
                      <div style={{ display: 'flex', gap: '8px' }}><button className="botao-secundario" style={{ flex: 1, fontSize: '12px', padding: '8px', borderColor: '#3182ce', color: '#3182ce' }} onClick={() => prepararAceite(p)}>✅ Aceitar</button><button className="botao-secundario" style={{ flex: 1, fontSize: '12px', padding: '8px', borderColor: '#e53e3e', color: '#e53e3e' }} onClick={() => cancelarPendencia(p.id)}>❌ Cancelar</button></div>
                    </div>
                  )) : <p style={{color: '#718096', fontSize: '14px'}}>Nenhum item aguardando aceite da entrada.</p>}
                </div>
              </div>
            </div>
          </div>
        );

      case 'categorias':
        return (
          <div className="atlas-container">
            <header className="atlas-header"><h1>Categorias</h1></header>
            <div className="atlas-card full">
              <table className="atlas-tabela">
                <thead><tr><th>Nome da Categoria</th><th>Qtd Itens Vinculados</th><th>Ações</th></tr></thead>
                <tbody>
                  {[...new Set(estoque.map(i => i.categoria))].filter(Boolean).map((cat, idx) => (
                    <tr key={idx}><td><strong>{cat}</strong></td><td>{estoque.filter(i => i.categoria === cat).length} itens</td><td><button className="botao-link">Ver itens</button></td></tr>
                  ))}
                  {[...new Set(estoque.map(i => i.categoria))].filter(Boolean).length === 0 && <tr><td colSpan="3" style={{ textAlign: 'center', padding: '40px' }}>Nenhuma categoria.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'ajustes':
        return (
          <div className="atlas-container">
            <header className="atlas-header"><h1>Ajustes de Estoque</h1></header>
            <div className="atlas-card">
              <div className="card-titulo">Lançar Ajuste Manual</div>
              <div className="atlas-linha">
                <div className="atlas-campo" style={{flex: 2}}><label>Item do Inventário</label><select id="sel-ajuste"><option value="">Selecione um item...</option>{estoque.map(i => <option key={i.id} value={i.id}>{i.nome} ({i.sku}) - Qtd Atual: {i.quantidade}</option>)}</select></div>
                <div className="atlas-campo"><label>Tipo</label><select id="tipo-ajuste"><option value="entrada">Entrada (+)</option><option value="saida">Saída (-)</option></select></div>
                <div className="atlas-campo"><label>Quantidade</label><input type="number" id="qtd-ajuste" /></div>
              </div>
              <button className="botao-primario" style={{marginTop: '20px', width: '100%'}} onClick={realizarAjusteEstoque}>Confirmar Ajuste na Hora</button>
            </div>
          </div>
        );

      case 'fornecedores':
        return (
          <div className="atlas-container">
            <header className="atlas-header"><h1>Fornecedores Homologados</h1><div className="atlas-acoes"><button className="botao-primario" onClick={() => setTelaAtiva('cadastro-de-fornecedor')}>+ Novo Fornecedor</button></div></header>
            <div className="atlas-card full">
              <table className="atlas-tabela">
                <thead><tr><th>Razão Social</th><th>CNPJ</th><th>Contato</th><th>Status</th></tr></thead>
                <tbody>{listaFornecedores.length > 0 ? listaFornecedores.map(f => (<tr key={f.id}><td><strong>{f.razao}</strong></td><td>{f.cnpj}</td><td>{f.email}</td><td><span style={{color: 'green', fontWeight: 'bold'}}>Ativo</span></td></tr>)) : <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>Nenhum fornecedor na base.</td></tr>}</tbody>
              </table>
            </div>
          </div>
        );

      case 'cadastro-de-fornecedor':
        return (
          <div className="atlas-container">
            <header className="atlas-header"><h1>Novo Fornecedor</h1></header>
            <div className="atlas-card full">
              <div className="atlas-linha"><div className="atlas-campo" style={{flex: 2}}><label>Razão Social</label><input type="text" id="razao-forn" /></div><div className="atlas-campo"><label>CNPJ</label><input type="text" id="cnpj-forn" onChange={(e) => e.target.value = maskCNPJ(e.target.value)} /></div></div>
              <div className="atlas-linha" style={{marginTop: '15px'}}><div className="atlas-campo"><label>E-mail (Portal)</label><input type="email" id="email-forn" /></div><div className="atlas-campo"><label>Telefone</label><input type="text" onChange={(e) => e.target.value = maskTelefone(e.target.value)} /></div></div>
              <button className="botao-primario" style={{marginTop: '20px'}} onClick={salvarFornecedor}>Salvar Fornecedor</button>
            </div>
          </div>
        );

      case 'cotações':
        return (
          <div className="atlas-container">
            <header className="atlas-header"><div><h1>Central de Cotações</h1><p>Comparação automática baseada no Estoque</p></div></header>
            <div className="atlas-card full">
              <datalist id="estoque-disponivel">{estoque.map(i => <option key={i.id} value={i.nome} />)}</datalist>
              <table className="atlas-tabela">
                <thead><tr><th>Produto Solicitado</th><th>Qtd</th><th>Fornecedor / Preço Base</th><th>Forn. B (R$)</th><th>Forn. C (R$)</th><th>Decisão do Sistema</th></tr></thead>
                <tbody>
                  {[...solicitacoesCotacao, ...linhasItens.map(l => ({ ...l, isManual: true }))].map(cot => {
                    const valores = [cot.vlrA, cot.vlrB, cot.vlrC].filter(v => v > 0); const menorValor = valores.length > 0 ? Math.min(...valores) : null;
                    return (
                      <tr key={cot.id}>
                        <td>{cot.isManual ? (<input type="text" list="estoque-disponivel" className="input-tabela" placeholder="Digite o produto..." onChange={(e) => { atualizarValorLinha(cot.id, 'nome_temp', e.target.value); const achou = estoque.find(i => i.nome === e.target.value); if(achou) { atualizarValorLinha(cot.id, 'fornBase', achou.fornecedor); atualizarValorLinha(cot.id, 'vlrA', achou.custo); } }} />) : (<strong>{cot.produto}</strong>)}</td>
                        <td>{cot.isManual ? <input type="number" className="input-tabela" onChange={(e) => atualizarValorLinha(cot.id, 'qtd', e.target.value)}/> : cot.qtd}</td>
                        <td><div style={{display: 'flex', gap: '5px'}}><input type="text" className="input-tabela" placeholder="Forn. Base" value={cot.fornBase || ''} onChange={(e) => cot.isManual ? atualizarValorLinha(cot.id, 'fornBase', e.target.value) : atualizarCotacao(cot.id, 'fornBase', e.target.value)} /><input type="number" className="input-tabela" style={cot.vlrA === menorValor ? {border: '2px solid green', width: '80px'} : {background: '#ebf8ff', width: '80px'}} value={cot.vlrA || ''} onChange={(e) => cot.isManual ? atualizarValorLinha(cot.id, 'vlrA', e.target.value) : atualizarCotacao(cot.id, 'vlrA', e.target.value)} /></div></td>
                        <td><input type="number" className="input-tabela" style={cot.vlrB === menorValor ? {border: '2px solid green'} : {}} onChange={(e) => cot.isManual ? atualizarValorLinha(cot.id, 'vlrB', e.target.value) : atualizarCotacao(cot.id, 'vlrB', e.target.value)} /></td>
                        <td><input type="number" className="input-tabela" style={cot.vlrC === menorValor ? {border: '2px solid green'} : {}} onChange={(e) => cot.isManual ? atualizarValorLinha(cot.id, 'vlrC', e.target.value) : atualizarCotacao(cot.id, 'vlrC', e.target.value)} /></td>
                        <td>{cot.isManual ? (<button onClick={() => removerLinha(cot.id)} className="botao-link" style={{color: 'red'}}>✖ Remover</button>) : (<button className="botao-primario" style={{fontSize: '11px', padding: '8px'}} onClick={() => converterCotacaoEmPedido(cot)}>Gerar Pedido</button>)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <button className="botao-adicionar" onClick={adicionarLinha}>+ Adicionar Linha Manual</button>
            </div>
          </div>
        );

      case 'pedidos':
        return (
          <div className="atlas-container">
            <header className="atlas-header"><h1>Pedidos de Compra Emitidos</h1></header>
            <div className="atlas-card full">
              <table className="atlas-tabela">
                <thead><tr><th>Protocolo</th><th>Data</th><th>Fornecedor Vencedor</th><th>Produto</th><th>Qtd</th><th>Total do Pedido</th></tr></thead>
                <tbody>{pedidosOficiais.length > 0 ? pedidosOficiais.map(ped => (<tr key={ped.id}><td><strong>{ped.protocolo}</strong></td><td>{ped.data}</td><td><span style={{color: '#3182ce', fontWeight: 'bold'}}>{ped.fornecedor}</span></td><td>{ped.produto}</td><td>{ped.qtd}</td><td className="valor-destaque">R$ {ped.subtotal.toFixed(2)}</td></tr>)) : <tr><td colSpan="6" style={{textAlign: 'center', padding: '30px'}}>Nenhum pedido gerado.</td></tr>}</tbody>
              </table>
            </div>
          </div>
        );

      case 'ordens-de-serviço':
        return (
          <div className="atlas-container">
            <header className="atlas-header"><div><h1>Nova O.S.</h1></div></header>
            <div className="atlas-card full">
              <div className="atlas-linha"><div className="atlas-campo" style={{flex: 2}}><label>Cliente</label><input type="text" value={dadosNovaOS.cliente} onChange={(e) => setDadosNovaOS({...dadosNovaOS, cliente: e.target.value})} /></div><div className="atlas-campo"><label>Previsão</label><input type="date" value={dadosNovaOS.previsao} onChange={(e) => setDadosNovaOS({...dadosNovaOS, previsao: e.target.value})} /></div></div>
              <textarea className="input-tabela" style={{ width: '100%', height: '80px', borderRadius: '8px', padding: '10px', marginBottom: '20px' }} value={dadosNovaOS.descricao} onChange={(e) => setDadosNovaOS({...dadosNovaOS, descricao: e.target.value})}></textarea>
              <table className="atlas-tabela">
                <thead><tr><th>Peça/Item</th><th>Quantidade</th><th>Custo Unit.</th><th>Subtotal</th><th>Ação</th></tr></thead>
                <tbody>
                  {linhasItens.map(linha => (
                    <tr key={linha.id}><td><input type="text" className="input-tabela" /></td><td><input type="number" className="input-tabela" onChange={(e) => atualizarValorLinha(linha.id, 'qtd', e.target.value)} /></td><td><input type="number" className="input-tabela" onChange={(e) => atualizarValorLinha(linha.id, 'valor', e.target.value)} /></td><td className="valor-destaque">R$ {(linha.qtd * linha.valor).toFixed(2)}</td><td><button onClick={() => removerLinha(linha.id)} className="botao-link" style={{color: 'red'}}>✖</button></td></tr>
                  ))}
                </tbody>
              </table>
              <button className="botao-adicionar" onClick={adicionarLinha}>+ Adicionar Peça</button>
              <button className="botao-primario" style={{marginTop: '20px', width: '100%'}} onClick={finalizarEAgendarOS}>Finalizar e Agendar</button>
            </div>
          </div>
        );

      case 'agendamentos':
        return (
          <div className="atlas-container">
            <header className="atlas-header"><h1>Agendamentos (O.S. Criadas)</h1></header>
            <div className="atlas-card full">
              <table className="atlas-tabela">
                <thead><tr><th>Protocolo</th><th>Data</th><th>Cliente</th><th>Total</th><th>Status</th><th>Ações</th></tr></thead>
                <tbody>{listaOS.length > 0 ? listaOS.map(os => (<tr key={os.id}><td><strong>{os.protocolo}</strong></td><td>{os.previsao}</td><td>{os.cliente}</td><td className="valor-destaque">R$ {os.total.toFixed(2)}</td><td><select value={os.status} onChange={(e) => setListaOS(listaOS.map(x => x.id === os.id ? {...x, status: e.target.value} : x))} style={{padding: '5px', borderRadius: '5px'}}><option>Aberta</option><option>Concluída</option><option>Cancelada</option></select></td><td><button className="botao-link" onClick={() => exportarPDFGenerico(os.protocolo)}>PDF</button></td></tr>)) : <tr><td colSpan="6" style={{textAlign: 'center', padding: '40px'}}>Nenhuma O.S. agendada ainda.</td></tr>}</tbody>
              </table>
            </div>
          </div>
        );

      case 'relatório-de-nf':
        return (
          <div className="atlas-container">
            <header className="atlas-header"><div><h1>Relatório de Notas Fiscais</h1></div></header>
            <div className="atlas-card full">
              <table className="atlas-tabela">
                <thead><tr><th>Data</th><th>Fornecedor</th><th>CNPJ</th><th>Itens Registrados</th><th>Documento</th></tr></thead>
                <tbody>{notasFiscais.length > 0 ? notasFiscais.map(nf => (<tr key={nf.id}><td>{nf.data}</td><td>{nf.fornecedor}</td><td>{nf.cnpj}</td><td>{nf.itens && nf.itens.map((it, idx) => (<div key={idx} style={{fontSize: '12px'}}>{it.qtd}x {it.nome}</div>))}</td><td>{nf.pdf ? (<button className="botao-primario" onClick={() => window.open(nf.pdf, '_blank')} style={{padding: '8px 16px', fontSize: '12px'}}>Ver Arquivo</button>) : ('Sem arquivo')}</td></tr>)) : <tr><td colSpan="5" style={{textAlign: 'center', padding: '40px'}}>Nenhuma NF.</td></tr>}</tbody>
              </table>
            </div>
          </div>
        );

      case 'inicio': return <div className="boas-vindas"><h1>Bem-vindo ao ATLAS ERP</h1><p>Selecione uma opção no menu.</p></div>
      default: return <section><h2>Área em construção</h2></section>
    }
  }

  // --- RENDERIZAÇÃO PRINCIPAL DO APP ---
  if (!isLoggedIn) return <Login realizarLogin={realizarLogin} inputUser={inputUser} setInputUser={setInputUser} inputPass={inputPass} setInputPass={setInputPass} />

  return (
    <div className="container-principal">
      <ToastContainer position="top-right" autoClose={2000} theme="colored" />
      <div className="marca-dagua-fundo"></div>
      
      {/* SEU MENU LIMPÍSSIMO */}
      <MenuNavegacao 
        itensMenu={itensMenu} 
        setTelaAtiva={setTelaAtiva} 
        setTermoBusca={setTermoBusca} 
        setLinhasItens={setLinhasItens} 
        usuarioAtual={usuarioAtual} 
        realizarLogoff={realizarLogoff} 
      />

      <main className="conteudo-pagina">{renderizarConteudo()}</main>
    </div>
  )
}

export default App
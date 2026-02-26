import { useState, useEffect } from 'react';
import './index.css';

import { supabase } from './supabaseClient';
import Login from './pages/Login.jsx';
import MenuNavegacao from './components/MenuNavegacao.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Entradas from './pages/Entradas.jsx';
import Inventario from './pages/Inventario.jsx';

// COMPONENTES ISOLADOS:
import FrenteCaixa from './pages/FrenteCaixa.jsx';
import CadastroItem from './pages/CadastroItem.jsx';
import RelatorioVendas from './pages/RelatorioVendas.jsx';
import ExtratoFinanceiro from './pages/ExtratoFinanceiro.jsx';
import PainelRequisicoes from './pages/PainelRequisicoes.jsx';
import EmissaoRecibo from './pages/EmissaoRecibo.jsx';

import logoAtlas from './assets/logopages.png';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usuarioAtual, setUsuarioAtual] = useState('');
  const [usuarioRole, setUsuarioRole] = useState('');
  const [inputUser, setInputUser] = useState('');
  const [inputPass, setInputPass] = useState('');

  const [telaAtiva, setTelaAtiva] = useState('inicio');
  const [imagemAnexada, setImagemAnexada] = useState(null);

  const [vendaExpandidaId, setVendaExpandidaId] = useState(null);

  const [estoque, setEstoque] = useState([]);
  const [logEstoque, setLogEstoque] = useState([]);
  const [historicoVendas, setHistoricoVendas] = useState([]);
  const [historicoDespesas, setHistoricoDespesas] = useState([]);

  const [itensPendentesEntrada, setItensPendentesEntrada] = useState([]);
  const [itemEmEdicao, setItemEmEdicao] = useState(null);
  const [valorTotalEntradas, setValorTotalEntradas] = useState(0);
  const [notasFiscais, setNotasFiscais] = useState([]);

  const [listaRequisicoes, setListaRequisicoes] = useState([]);
  const [listaFornecedores, setListaFornecedores] = useState([]);
  const [solicitacoesCotacao, setSolicitacoesCotacao] = useState([]);
  const [pedidosOficiais, setPedidosOficiais] = useState([]);
  const [listaDevolucoes, setListaDevolucoes] = useState([]);

  const [linhasItens, setLinhasItens] = useState([{ id: Date.now(), qtd: 0, valor: 0, vlrA: 0, vlrB: 0, vlrC: 0 }]);
  const [termoBusca, setTermoBusca] = useState('');

  const itensMenu = [
    { nome: 'Início', slug: 'inicio', filhos: ['Dashboard'] },
    { nome: 'Produtos', slug: 'produtos', filhos: ['Consultar Itens', 'Cadastro de Item', 'Categorias'] },
    { nome: 'Estoque & Logística', slug: 'estoque', filhos: ['Entradas', 'Saídas', 'Ajustes', 'Log de Estoque'] },
    { nome: 'Gestão de Compras', slug: 'compras', filhos: ['Sugestoes de Compras', 'Cotacoes', 'Pedidos', 'Fornecedores'] },
    { nome: 'Vendas & PDV', slug: 'vendas', filhos: ['Vendas', 'Devoluções'] },
    { nome: 'Notas Fiscais', slug: 'nfe', filhos: ['Emissao de NF'] },
    { nome: 'Relatórios', slug: 'relatorios', filhos: ['Receitas e Despesas', 'Detalhes de Vendas', 'Exportar PDFs'] },
    { nome: 'Requisições', slug: 'requisicoes', filhos: ['Nova Requisicao', 'Painel de Requisicoes'] }
  ];

  useEffect(() => {
    if (isLoggedIn) {
      buscarEstoqueReal(); buscarLogReal(); buscarVendasReal(); buscarDespesasReal();
      buscarFornecedoresReal(); buscarPendenciasReal(); buscarNotasReal();
      buscarCotacoesReal(); buscarPedidosReal(); buscarDevolucoesReal(); buscarRequisicoesReal();
    }
  }, [isLoggedIn]);

  const buscarEstoqueReal = async () => { const { data } = await supabase.from('estoque').select('*'); if (data) setEstoque(data); };
  const buscarLogReal = async () => { const { data } = await supabase.from('log_movimentacao').select('*').order('created_at', { ascending: false }); if (data) setLogEstoque(data); };
  const buscarVendasReal = async () => { const { data } = await supabase.from('vendas').select('*').order('created_at', { ascending: false }); if (data) setHistoricoVendas(data); };
  const buscarDespesasReal = async () => { const { data } = await supabase.from('despesas').select('*').order('created_at', { ascending: false }); if (data) setHistoricoDespesas(data); };
  const buscarFornecedoresReal = async () => { const { data } = await supabase.from('fornecedores').select('*').order('razao', { ascending: true }); if (data) setListaFornecedores(data); };
  const buscarPendenciasReal = async () => { const { data } = await supabase.from('itens_pendentes').select('*').order('created_at', { ascending: false }); if (data) setItensPendentesEntrada(data); };
  const buscarNotasReal = async () => { const { data } = await supabase.from('notas_fiscais').select('*').order('created_at', { ascending: false }); if (data) setNotasFiscais(data); };
  const buscarCotacoesReal = async () => { const { data } = await supabase.from('cotacoes').select('*').order('created_at', { ascending: false }); if (data) setSolicitacoesCotacao(data); };
  const buscarPedidosReal = async () => { const { data } = await supabase.from('pedidos_compra').select('*').order('created_at', { ascending: false }); if (data) setPedidosOficiais(data); };
  const buscarDevolucoesReal = async () => { const { data } = await supabase.from('devolucoes').select('*').order('created_at', { ascending: false }); if (data) setListaDevolucoes(data); };
  const buscarRequisicoesReal = async () => { const { data } = await supabase.from('requisicoes_internas').select('*').order('created_at', { ascending: false }); if (data) setListaRequisicoes(data); };

  const realizarLogin = (e) => {
    e.preventDefault();
    if (inputUser.toLowerCase() === 'gerente' && inputPass === 'admin') {
      setUsuarioRole('gerente'); setUsuarioAtual('Gerente Geral'); setIsLoggedIn(true);
      toast.success("Acesso liberado: Gerência.");
    } else if (inputUser.toLowerCase() === 'caixa' && inputPass === '123') {
      setUsuarioRole('caixa'); setUsuarioAtual('Operador de Caixa'); setIsLoggedIn(true);
      toast.success("Acesso liberado: Caixa.");
    } else {
      toast.error("Credenciais inválidas. Tente novamente.");
    }
  };

  const realizarLogoff = () => { setIsLoggedIn(false); setInputUser(''); setInputPass(''); setTelaAtiva('inicio'); setUsuarioRole(''); };

  const TelaBloqueada = () => (
    <div className="tela-bloqueada">
      <h1 className="icone-gigante">🔒</h1>
      <h2 className="titulo-escuro">Acesso Restrito</h2>
      <p className="texto-cinza">O seu nível de usuário ({usuarioRole}) não tem permissão para visualizar esta tela.</p>
    </div>
  );

  const maskCNPJ = (value) => value.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2').slice(0, 18);
  const maskCPF = (value) => value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2').slice(0, 14);
  const maskTelefone = (value) => value.replace(/\D/g, '').replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d)(\d{4})$/, '$1-$2').slice(0, 15);
  const manipularUpload = (e) => { if (e.target.files[0]) setImagemAnexada(URL.createObjectURL(e.target.files[0])); };

  const adicionarLinha = () => setLinhasItens([...linhasItens, { id: Date.now(), qtd: 0, valor: 0, vlrA: 0, vlrB: 0, vlrC: 0 }]);
  const removerLinha = (id) => { if (linhasItens.length > 1 && window.confirm("Confirmar remoção do item?")) setLinhasItens(linhasItens.filter(l => l.id !== id)); };
  const atualizarValorLinha = (id, campo, valor) => setLinhasItens(linhasItens.map(linha => linha.id === id ? { ...linha, [campo]: (campo === 'qtd' || campo === 'valor' || campo === 'vlrA' || campo === 'vlrB' || campo === 'vlrC') ? Number(valor) : valor } : linha));

  const confirmarEntradaComPendencia = async () => {
    const subtotal = linhasItens.reduce((acc, item) => acc + (Number(item.qtd || 0) * Number(item.valor || 0)), 0);
    const fornNF = document.getElementById('forn-entrada')?.value || 'Não informado';
    const cnpjNF = document.getElementById('cnpj-entrada')?.value || '';
    const dataNF = document.getElementById('data-entrada')?.value || new Date().toISOString().split('T')[0];

    if (subtotal > 0) { await supabase.from('despesas').insert([{ descricao: `Entrada Mercadoria - NF: ${cnpjNF || 'S/N'}`, fornecedor: fornNF, valor_total: subtotal, tipo: 'COMPRA_ESTOQUE' }]); buscarDespesasReal(); }
    if (fornNF !== 'Não informado' || cnpjNF || subtotal > 0) { await supabase.from('notas_fiscais').insert([{ fornecedor: fornNF, cnpj: cnpjNF, data_emissao: dataNF, valor_total: subtotal }]); buscarNotasReal(); }
    if (linhasItens.length > 0 && linhasItens[0].nome_temp) {
      const novosPendentes = linhasItens.map(l => ({ nome: l.nome_temp || 'Sem nome', quantidade: Number(l.qtd || 0), custo_unitario: Number(l.valor || 0), fornecedor: fornNF }));
      await supabase.from('itens_pendentes').insert(novosPendentes); buscarPendenciasReal();
    }
    setValorTotalEntradas(prev => prev + subtotal); toast.success("Entrada registrada com sucesso!"); setLinhasItens([{ id: Date.now(), qtd: 0, valor: 0, vlrA: 0, vlrB: 0, vlrC: 0 }]); setImagemAnexada(null);
  };

  const registrarSaidasAvulsas = async () => {
    const itensValidos = linhasItens.filter(l => l.nome_temp && l.qtd > 0);
    if (itensValidos.length === 0) return toast.error("Selecione um produto e a quantidade.");
    let processados = 0;
    for (const item of itensValidos) {
      const produtoDb = estoque.find(i => i.id === item.nome_temp);
      if (!produtoDb || produtoDb.quantidade < item.qtd) { toast.error(`Estoque insuficiente: ${produtoDb?.nome || 'Item'}`); continue; }
      const novaQtd = produtoDb.quantidade - item.qtd; const motivoBaixa = item.vlrA || 'Motivo Não Especificado';
      await supabase.from('estoque').update({ quantidade: novaQtd }).eq('id', produtoDb.id);
      await supabase.from('saidas').insert([{ produto_id: produtoDb.id, produto_nome: produtoDb.nome, quantidade: item.qtd, motivo: motivoBaixa }]);
      await supabase.from('log_movimentacao').insert([{ produto_id: produtoDb.id, produto_nome: produtoDb.nome, tipo_movimentacao: 'SAIDA_AVULSA', quantidade_alterada: -item.qtd, usuario: usuarioAtual, observacao: `Motivo: ${motivoBaixa}` }]);
      processados++;
    }
    if (processados > 0) { toast.success(`${processados} lote(s) baixado(s).`); buscarEstoqueReal(); buscarLogReal(); setLinhasItens([{ id: Date.now(), qtd: 0, valor: 0, vlrA: 0, vlrB: 0, vlrC: 0 }]); }
  };

  const prepararAceite = (item) => {
    document.getElementById('nome-item').value = item.nome; document.getElementById('qtd-item').value = item.quantidade; document.getElementById('sku-item').value = ''; setItemEmEdicao(item); toast.info("Preencha o SKU e Categoria.");
  };

  const cancelarPendencia = async (id) => {
    if (window.confirm("Confirmar exclusão?")) { await supabase.from('itens_pendentes').delete().eq('id', id); buscarPendenciasReal(); if (itemEmEdicao?.id === id) setItemEmEdicao(null); toast.info("Item descartado."); }
  };

  const salvarCadastroItem = async () => {
    const nome = document.getElementById('nome-item').value; const categoria = document.getElementById('categoria-item').value; const qtd = Number(document.getElementById('qtd-item').value); const sku = document.getElementById('sku-item').value;
    if (!nome || !sku || !categoria) return toast.error("Nome, Categoria e SKU obrigatórios.");
    const novoItemBD = { sku, nome, categoria, quantidade: qtd, estoque_minimo: Number(document.getElementById('minimo-item').value), fornecedor_padrao: document.getElementById('fornecedor-item')?.value || '', custo_base: Number(document.getElementById('custo-item')?.value || 0), valor_venda: Number(document.getElementById('venda-item')?.value || 0), status: 'ativo' };
    const { data, error } = await supabase.from('estoque').insert([novoItemBD]).select();
    if (error) return toast.error("Erro: " + error.message);
    await supabase.from('log_movimentacao').insert([{ produto_id: data[0].id, produto_nome: nome, tipo_movimentacao: 'CADASTRO_INICIAL', quantidade_alterada: qtd, usuario: usuarioAtual }]);
    buscarLogReal(); if (itemEmEdicao) { await supabase.from('itens_pendentes').delete().eq('id', itemEmEdicao.id); buscarPendenciasReal(); setItemEmEdicao(null); }
    setEstoque([...estoque, data[0]]); toast.success("Item salvo com sucesso.");
    document.getElementById('nome-item').value = ''; document.getElementById('categoria-item').value = ''; document.getElementById('qtd-item').value = ''; document.getElementById('sku-item').value = ''; document.getElementById('fornecedor-item').value = ''; document.getElementById('custo-item').value = ''; document.getElementById('venda-item').value = '';
  };

  const realizarAjusteEstoque = async () => {
    const idItem = document.getElementById('sel-ajuste').value; const qtdAjuste = Number(document.getElementById('qtd-ajuste').value);
    if (!idItem || !qtdAjuste) return toast.error("Preencha os campos.");
    const itemAtual = estoque.find(i => i.id === idItem); const novaQuantidade = document.getElementById('tipo-ajuste').value === 'entrada' ? itemAtual.quantidade + qtdAjuste : itemAtual.quantidade - qtdAjuste;
    await supabase.from('estoque').update({ quantidade: novaQuantidade }).eq('id', idItem);
    await supabase.from('log_movimentacao').insert([{ produto_id: idItem, produto_nome: itemAtual.nome, tipo_movimentacao: 'AJUSTE', quantidade_alterada: document.getElementById('tipo-ajuste').value === 'entrada' ? qtdAjuste : -qtdAjuste, usuario: usuarioAtual, observacao: 'Ajuste manual' }]);
    buscarLogReal(); setEstoque(estoque.map(i => i.id === idItem ? { ...i, quantidade: novaQuantidade } : i)); toast.success("Ajuste realizado."); document.getElementById('qtd-ajuste').value = '';
  };

  const registrarVenda = async (e) => {
    e.preventDefault();
    const idItem = document.getElementById('venda-produto').value; const qtdVenda = Number(document.getElementById('venda-qtd').value);
    const nomeCliente = document.getElementById('venda-nome').value || 'Consumidor Final'; const docCliente = document.getElementById('venda-doc').value || 'Sem Doc'; const foneCliente = document.getElementById('venda-fone').value || 'Sem Tel';
    const clienteCompleto = `${nomeCliente} | Doc: ${docCliente} | Tel: ${foneCliente}`;

    if (!idItem || !qtdVenda) return toast.error("Preencha item e quantidade.");
    const produto = estoque.find(i => i.id === idItem);
    if (produto.quantidade < qtdVenda) return toast.error("Saldo insuficiente no estoque.");

    const valorTotal = (produto.valor_venda || 0) * qtdVenda;
    await supabase.from('vendas').insert([{ produto_id: produto.id, produto_nome: produto.nome, quantidade: qtdVenda, valor_unitario: produto.valor_venda || 0, valor_total: valorTotal, cliente: clienteCompleto }]);
    await supabase.from('estoque').update({ quantidade: produto.quantidade - qtdVenda }).eq('id', produto.id);
    await supabase.from('log_movimentacao').insert([{ produto_id: produto.id, produto_nome: produto.nome, tipo_movimentacao: 'VENDA', quantidade_alterada: -qtdVenda, usuario: usuarioAtual, observacao: `Venda para: ${nomeCliente}` }]);

    buscarLogReal(); buscarVendasReal(); setEstoque(estoque.map(i => i.id === produto.id ? { ...i, quantidade: produto.quantidade - qtdVenda } : i));
    toast.success(`Faturamento de R$ ${valorTotal.toFixed(2)} processado!`);

    document.getElementById('venda-qtd').value = '1'; document.getElementById('venda-nome').value = ''; document.getElementById('venda-doc').value = ''; document.getElementById('venda-fone').value = '';
  };

  const registrarDevolucao = async (e) => {
    e.preventDefault();
    const idItem = document.getElementById('dev-produto').value; const qtdDev = Number(document.getElementById('dev-qtd').value);
    const cliente = document.getElementById('dev-cliente').value || 'Não Informado'; const motivo = document.getElementById('dev-motivo').value || 'Desistência';
    if (!idItem || !qtdDev) return toast.error("Selecione produto e quantidade.");

    const produto = estoque.find(i => i.id === idItem); const valorEstornado = (produto.valor_venda || 0) * qtdDev;
    await supabase.from('devolucoes').insert([{ produto_id: produto.id, produto_nome: produto.nome, quantidade: qtdDev, valor_estornado: valorEstornado, cliente: cliente, motivo: motivo }]);
    await supabase.from('estoque').update({ quantidade: produto.quantidade + qtdDev }).eq('id', produto.id);
    await supabase.from('despesas').insert([{ descricao: `Estorno de Venda`, fornecedor: 'Interno', valor_total: valorEstornado, tipo: 'ESTORNO_VENDA' }]);
    await supabase.from('log_movimentacao').insert([{ produto_id: produto.id, produto_nome: produto.nome, tipo_movimentacao: 'DEVOLUCAO', quantidade_alterada: qtdDev, usuario: usuarioAtual, observacao: `Motivo: ${motivo}` }]);

    buscarEstoqueReal(); buscarLogReal(); buscarDespesasReal(); buscarDevolucoesReal(); toast.success(`Devolução concluída.`); document.getElementById('dev-qtd').value = '';
  };

  const registrarRequisicaoInterna = async (e) => {
    e.preventDefault();
    const tipo = document.getElementById('req-tipo').value; const justificativa = document.getElementById('req-justificativa').value;
    if (!tipo || !justificativa) return toast.error("Tipo e Justificativa são obrigatórios.");
    const protocolo = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    await supabase.from('requisicoes_internas').insert([{ protocolo, requisitante: usuarioAtual, tipo, justificativa, status: 'Pendente' }]);
    toast.success(`Requisição ${protocolo} enviada.`); buscarRequisicoesReal(); document.getElementById('req-justificativa').value = ''; setTelaAtiva('painel-de-requisicoes');
  };

  const atualizarStatusRequisicao = async (id, novoStatus) => {
    await supabase.from('requisicoes_internas').update({ status: novoStatus }).eq('id', id); buscarRequisicoesReal(); toast.success(`Status da Requisição: ${novoStatus}`);
  };

  const salvarFornecedor = async () => {
    const razao = document.getElementById('razao-forn').value; const cnpj = document.getElementById('cnpj-forn').value;
    if (!razao || !cnpj) return toast.error("Razão Social e CNPJ obrigatórios.");
    const { data } = await supabase.from('fornecedores').insert([{ razao, cnpj, email: document.getElementById('email-forn').value, telefone: document.getElementById('telefone-forn')?.value || '', status: 'Ativo' }]).select();
    setListaFornecedores([...listaFornecedores, data[0]]); toast.success("Fornecedor cadastrado."); setTelaAtiva('fornecedores');
  };

  const gerarSolicitacaoCompra = async (item) => {
    const qtdSolicitada = prompt(`Informe a quantidade para cotação: ${item.nome}`, "1");
    if (qtdSolicitada && !isNaN(qtdSolicitada)) { await supabase.from('cotacoes').insert([{ produto: item.nome, qtd: Number(qtdSolicitada), fornBase: item.fornecedor_padrao || '', vlrA: item.custo_base || 0, vlrB: 0, vlrC: 0 }]); buscarCotacoesReal(); toast.info(`Enviado para Painel de Cotações.`); }
  };

  const atualizarCotacaoState = (id, campo, valor) => { setSolicitacoesCotacao(solicitacoesCotacao.map(cot => cot.id === id ? { ...cot, [campo]: campo === 'fornBase' ? valor : Number(valor) } : cot)); };
  const salvarCotacaoBD = async (cotacao) => { await supabase.from('cotacoes').update({ fornBase: cotacao.fornBase, vlrA: cotacao.vlrA, vlrB: cotacao.vlrB, vlrC: cotacao.vlrC }).eq('id', cotacao.id); };

  const converterCotacaoEmPedido = async (cotacao) => {
    const valores = [{ forn: cotacao.fornBase || 'Base', vlr: cotacao.vlrA }, { forn: 'Opção B', vlr: cotacao.vlrB }, { forn: 'Opção C', vlr: cotacao.vlrC }].filter(v => v.vlr > 0);
    if (valores.length === 0) return toast.error("Registre um valor financeiro.");
    const vencedor = valores.reduce((prev, curr) => (curr.vlr < prev.vlr ? curr : prev));
    await supabase.from('pedidos_compra').insert([{ protocolo: `PED-${Math.floor(1000 + Math.random() * 9000)}`, fornecedor: vencedor.forn, produto: cotacao.produto || cotacao.nome_temp, qtd: cotacao.qtd, unitario: vencedor.vlr, subtotal: cotacao.qtd * vencedor.vlr, data: new Date().toISOString().split('T')[0] }]);
    if (!cotacao.isManual) { await supabase.from('cotacoes').delete().eq('id', cotacao.id); buscarCotacoesReal(); } buscarPedidosReal(); toast.success(`Pedido de compra aprovado.`); setTelaAtiva('pedidos');
  };

  const emitirNfeSaida = (e) => {
    e.preventDefault();
    const vendaId = document.getElementById('nf-venda-ref').value;
    if (!vendaId) return toast.error("Selecione uma venda na lista para gerar o recibo.");

    const vendaRef = historicoVendas.find(v => v.id === vendaId);

    try {
      const img = new Image();
      img.src = logoAtlas;
      img.onload = () => {
        const doc = new jsPDF();

        doc.setFontSize(22); doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0); doc.text("ATLAS", 14, 20);
        const espacoAtlas = doc.getTextWidth("ATLAS ");
        doc.setTextColor(156, 163, 175); doc.text("ERP", 14 + espacoAtlas, 20);

        doc.setFontSize(9); doc.setTextColor(100, 116, 139); doc.setFont("helvetica", "normal");
        doc.text(`CNPJ: 00.000.000/0001-00 | Inscrição Estadual: 123.456.789.000`, 14, 26);
        doc.text(`Endereço: Avenida da Inovação, 1000 - São Paulo, SP - CEP: 01000-000`, 14, 31);
        doc.text(`Contato: (11) 4000-0000 | atendimento@atlas-erp.com.br`, 14, 36);

        doc.setDrawColor(226, 232, 240); doc.line(14, 42, 196, 42);

        doc.setFontSize(14); doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "bold");
        doc.text(`RECIBO DE COMPRA - COMPROVANTE DE PAGAMENTO`, 14, 52);

        doc.setFontSize(10); doc.setTextColor(71, 85, 105); doc.setFont("helvetica", "normal");
        doc.text(`Protocolo da Operação: ${vendaRef.id.toUpperCase()}`, 14, 58);
        doc.text(`Data de Emissão: ${new Date(vendaRef.created_at).toLocaleString('pt-BR')}`, 14, 63);

        doc.setFillColor(248, 250, 252); doc.rect(14, 68, 182, 25, 'F');
        doc.setFontSize(11); doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "bold");
        doc.text(`DADOS DO COMPRADOR`, 18, 75);

        const dadosCliente = vendaRef.cliente.split('|');
        doc.setFontSize(10); doc.setTextColor(71, 85, 105); doc.setFont("helvetica", "normal");
        doc.text(`Nome/Razão Social: ${dadosCliente[0]?.trim() || 'Consumidor Final'}`, 18, 81);
        doc.text(`Doc: ${dadosCliente[1]?.replace('Doc:', '').trim() || 'Não informado'}`, 18, 87);
        doc.text(`Telefone: ${dadosCliente[2]?.replace('Tel:', '').trim() || 'Não informado'}`, 110, 87);

        autoTable(doc, {
          startY: 100, head: [['Descrição do Item', 'Quantidade', 'Valor Unitário', 'Subtotal']],
          body: [[vendaRef.produto_nome, `${vendaRef.quantidade} un`, `R$ ${Number(vendaRef.valor_unitario).toFixed(2)}`, `R$ ${Number(vendaRef.valor_total).toFixed(2)}`]],
          theme: 'grid', headStyles: { fillColor: [0, 0, 0], fontSize: 10 }, bodyStyles: { fontSize: 11, fontStyle: 'bold' },
          didDrawPage: function (data) { doc.setGState(new doc.GState({ opacity: 0.05 })); doc.addImage(img, 'PNG', 35, 110, 140, 120); doc.setGState(new doc.GState({ opacity: 1 })); }
        });

        const finalY = doc.lastAutoTable.finalY;
        doc.setFontSize(16); doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "bold");
        doc.text(`TOTAL PAGO: R$ ${Number(vendaRef.valor_total).toFixed(2)}`, 14, finalY + 15);

        doc.setFontSize(9); doc.setTextColor(148, 163, 184); doc.setFont("helvetica", "normal");
        doc.text(`* Este documento tem caráter de recibo e controle interno, não possuindo valor fiscal.`, 14, finalY + 25);
        doc.text(`* Trocas ou devoluções serão aceitas em até 7 dias, mediante a apresentação deste recibo.`, 14, finalY + 30);

        const alturaPagina = doc.internal.pageSize.getHeight();
        doc.setFontSize(11); doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "italic");
        doc.text(`A equipe do Atlas ERP agradece a sua preferência. Volte sempre!`, doc.internal.pageSize.getWidth() / 2, alturaPagina - 15, { align: "center" });

        doc.save(`Recibo_${vendaRef.produto_nome.substring(0, 6)}_${Date.now()}.pdf`);
        toast.success("Recibo gerado com sucesso!");
      };
    } catch (err) { toast.error("Erro ao montar o Recibo."); }
  };

  const gerarRelatorioPDF = (titulo, colunas, linhas) => {
    const img = new Image(); img.src = logoAtlas;
    img.onload = () => {
      const doc = new jsPDF();
      doc.setFontSize(22); doc.setTextColor(16, 185, 129); doc.text(`ATLAS ERP`, 14, 20);
      doc.setFontSize(12); doc.setTextColor(51, 65, 85); doc.text(`Relatório Oficial: ${titulo.replace(/_/g, ' ')}`, 14, 28);
      autoTable(doc, {
        startY: 45, head: [colunas], body: linhas, theme: 'grid', headStyles: { fillColor: [15, 23, 42] },
        didDrawPage: function (data) { doc.setGState(new doc.GState({ opacity: 0.08 })); doc.addImage(img, 'PNG', 35, 90, 140, 120); doc.setGState(new doc.GState({ opacity: 1 })); }
      });
      doc.save(`ATLAS_${titulo}_${Date.now()}.pdf`); toast.success(`Relatório baixado!`);
    };
  };

  const acionarRelatorioEstoque = () => { gerarRelatorioPDF('Posicao_de_Estoque', ['SKU', 'Produto', 'Cat', 'Qtd', 'Custo R$', 'Venda R$'], estoque.map(i => [i.sku, i.nome, i.categoria || '-', `${i.quantidade}`, Number(i.custo_base).toFixed(2), Number(i.valor_venda).toFixed(2)])); };
  const acionarRelatorioVendas = () => { gerarRelatorioPDF('Historico_de_Vendas', ['Data', 'Cliente', 'Produto', 'Qtd', 'Faturamento'], historicoVendas.map(v => [new Date(v.created_at).toLocaleDateString(), v.cliente.split('|')[0], v.produto_nome, v.quantidade, `R$ ${Number(v.valor_total).toFixed(2)}`])); };
  const acionarRelatorioEntradas = () => { gerarRelatorioPDF('Notas_de_Entrada', ['Data', 'Fornecedor', 'CNPJ', 'Valor'], notasFiscais.map(n => [new Date(n.created_at).toLocaleDateString(), n.fornecedor, n.cnpj || '-', `R$ ${Number(n.valor_total).toFixed(2)}`])); };

  // ==========================================
  // RENDERIZAÇÃO DE ROTEAMENTO
  // ==========================================
  const renderizarConteudo = () => {
    switch (telaAtiva) {

      case 'inicio':
        return (
          <div className="tela-centralizada">
            <img src={logoAtlas} alt="Atlas ERP" className="logo-inicio" />
            <div className="texto-sessao">Sessão Ativa: {usuarioAtual} ({usuarioRole})</div>
          </div>
        );

      case 'dashboard': return usuarioRole === 'gerente' ? <Dashboard estoque={estoque} /> : <TelaBloqueada />;
      case 'receitas-e-despesas': return usuarioRole === 'gerente' ? <ExtratoFinanceiro historicoVendas={historicoVendas} historicoDespesas={historicoDespesas} />

        : <TelaBloqueada />;

      case 'detalhes-de-vendas': return usuarioRole === 'gerente' ? <RelatorioVendas historicoVendas={historicoVendas} vendaExpandidaId={vendaExpandidaId} setVendaExpandidaId={setVendaExpandidaId} /> :

        <TelaBloqueada />;

      case 'painel-de-requisicoes': return <PainelRequisicoes listaRequisicoes={listaRequisicoes} usuarioRole={usuarioRole} atualizarStatusRequisicao={atualizarStatusRequisicao} />;

      case 'emissao-de-nf': return <EmissaoRecibo historicoVendas={historicoVendas} emitirNfeSaida={emitirNfeSaida} />;

      case 'cadastro-de-item': return <CadastroItem estoque={estoque} salvarCadastroItem={salvarCadastroItem} />;

      case 'vendas': return <FrenteCaixa estoque={estoque} registrarVenda={registrarVenda} maskCNPJ={maskCNPJ} maskCPF={maskCPF} maskTelefone={maskTelefone} />;


      // ==========================================
      // TELAS EMBUTIDAS (NÃO MODULARIZADAS AINDA)
      // ==========================================
      case 'ajustes':
        if (usuarioRole !== 'gerente') return <TelaBloqueada />;
        return (
          <div className="atlas-container">
            <header className="atlas-header"><h1>Manutenção de Saldos</h1></header>
            <div className="atlas-card">
              <div className="atlas-linha">
                <div className="atlas-campo flex-2">
                  <select id="sel-ajuste"><option value="">Selecione...</option>{estoque.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}</select>
                </div>
                <div className="atlas-campo">
                  <select id="tipo-ajuste"><option value="entrada">Crédito (+)</option><option value="saida">Débito (-)</option></select>
                </div>
                <div className="atlas-campo">
                  <input type="number" id="qtd-ajuste" placeholder="Qtd" />
                </div>
              </div>
              <button className="botao-primario w-100 mt-20" onClick={realizarAjusteEstoque}>Ajustar</button>
            </div>
          </div>
        );

      case 'nova-requisicao':
        return (
          <div className="atlas-container">
            <header className="atlas-header"><div><h1>Solicitar Requisição Interna</h1></div></header>
            <div className="atlas-card centralizado-800">
              <div className="atlas-linha">
                <div className="atlas-campo flex-2">
                  <label>Natureza do Chamado</label>
                  <select id="req-tipo">
                    <option value="Compra Insumos (Loja)">Compra de Insumos</option>
                    <option value="Manutenção de Equipamento">Manutenção</option>
                    <option value="Ajuste de Sistema">Ajuste de Sistema</option>
                  </select>
                </div>
              </div>
              <div className="atlas-linha mt-15">
                <div className="atlas-campo w-100">
                  <label>Justificativa / Detalhes</label>
                  <textarea id="req-justificativa" className="input-tabela input-textarea" placeholder="Descreva sua solicitação..."></textarea>
                </div>
              </div>
              <button className="botao-primario w-100 mt-20" onClick={registrarRequisicaoInterna}>Enviar Pedido para Gerência</button>
            </div>
          </div>
        );

      case 'log-de-estoque':
        if (usuarioRole !== 'gerente') return <TelaBloqueada />;
        return (
          <div className="atlas-container">
            <header className="atlas-header"><div><h1>Auditoria de Estoque</h1></div></header>
            <div className="atlas-card full">
              <table className="atlas-tabela">
                <thead><tr><th>Data</th><th>Produto</th><th>Natureza</th><th>Movimentação</th></tr></thead>
                <tbody>
                  {logEstoque.map(log => (
                    <tr key={log.id}>
                      <td>{new Date(log.created_at).toLocaleString('pt-BR')}</td>
                      <td>{log.produto_nome}</td>
                      <td>{log.tipo_movimentacao}</td>
                      <td className={log.quantidade_alterada > 0 ? 'texto-verde-bold' : 'texto-vermelho-bold'}>{log.quantidade_alterada}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'exportar-pdfs':
        if (usuarioRole !== 'gerente') return <TelaBloqueada />;
        return (
          <div className="atlas-container">
            <header className="atlas-header"><div><h1>Central de Relatórios PDF</h1><p>Emita documentos com a marca d'água corporativa ATLAS</p></div></header>
            <div className="atlas-grid">
              <div className="atlas-card card-centro card-borda-roxa">
                <h2 className="icone-gigante"></h2><h3>Estoque</h3>
                <button className="botao-primario btn-bg-roxo w-100 mt-20" onClick={acionarRelatorioEstoque}>Baixar PDF</button>
              </div>
              <div className="atlas-card card-centro card-borda-verde">
                <h2 className="icone-gigante"></h2><h3>Vendas</h3>
                <button className="botao-primario btn-bg-verde w-100 mt-20" onClick={acionarRelatorioVendas}>Baixar PDF</button>
              </div>
              <div className="atlas-card card-centro card-borda-azul">
                <h2 className="icone-gigante"></h2><h3>Entradas</h3>
                <button className="botao-primario btn-bg-azul w-100 mt-20" onClick={acionarRelatorioEntradas}>Baixar PDF</button>
              </div>
            </div>
          </div>
        );

      case 'devolucoes':  
        return (
          <div className="atlas-container">
            <header className="atlas-header"><div><h1>Logística Reversa</h1></div></header>
            <div className="atlas-card card-borda-amarela centralizado-800 mb-20">
              <div className="atlas-linha">
                <div className="atlas-campo flex-2">
                  <label>Item Retornado</label>
                  <select id="dev-produto" className="input-amarelo"><option value="">Localize...</option>{estoque.map(i => (<option key={i.id} value={i.id}>{i.nome}</option>))}</select>
                </div>
                <div className="atlas-campo"><label>Qtd</label><input type="number" id="dev-qtd" min="1" /></div>
              </div>
              <div className="atlas-linha mt-15">
                <div className="atlas-campo flex-2"><label>Cliente</label><input type="text" id="dev-cliente" /></div>
                <div className="atlas-campo flex-2"><label>Motivo</label><input type="text" id="dev-motivo" /></div>
              </div>
              <button className="botao-primario btn-bg-amarelo w-100 mt-30" onClick={registrarDevolucao}>Processar Devolução</button>
            </div>
          </div>
        );
        

      case 'entradas': return <Entradas setTelaAtiva={setTelaAtiva} confirmarEntradaComPendencia={confirmarEntradaComPendencia} maskCNPJ={maskCNPJ} manipularUpload={manipularUpload} imagemAnexada={imagemAnexada} setImagemAnexada={setImagemAnexada} linhasItens={linhasItens} atualizarValorLinha={atualizarValorLinha} removerLinha={removerLinha} adicionarLinha={adicionarLinha} />;

      case 'saidas':
        return (
          <div className="atlas-container">
            <header className="atlas-header"><div><h1>Expedição Avulsa</h1></div></header>
            <div className="atlas-card full">
              <table className="atlas-tabela">
                <thead><tr><th>Produto Registrado</th><th>Quantidade</th><th>Motivo</th><th>Ação</th></tr></thead>
                <tbody>
                  {linhasItens.map(linha => (
                    <tr key={linha.id}>
                      <td><select className="input-tabela" onChange={(e) => atualizarValorLinha(linha.id, 'nome_temp', e.target.value)}><option value="">Selecione...</option>{estoque.filter(i => i.quantidade > 0).map(i => (<option key={i.id} value={i.id}>{i.nome}</option>))}</select></td>
                      <td><input type="number" className="input-tabela" min="1" onChange={(e) => atualizarValorLinha(linha.id, 'qtd', e.target.value)} /></td>
                      <td><input type="text" className="input-tabela" onChange={(e) => atualizarValorLinha(linha.id, 'vlrA', e.target.value)} /></td>
                      <td><button onClick={() => removerLinha(linha.id)} className="botao-link texto-vermelho-bold">Excluir</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="botao-adicionar" onClick={adicionarLinha}>Nova Linha</button>
              <button className="botao-primario botao-saida w-100 mt-20" onClick={registrarSaidasAvulsas}>Registrar Baixa</button>
            </div>
          </div>
        );

      case 'sugestoes-de-compras':
        const itensEmAlerta = estoque.filter(i => i.quantidade <= (i.estoque_minimo || 5));
        return (
          <div className="atlas-container">
            <header className="atlas-header"><div><h1>Sugestões de Reposição</h1></div></header>
            <div className="atlas-card full card-borda-vermelha">
              <table className="atlas-tabela">
                <thead><tr><th>Produto</th><th>Saldo Atual</th><th>Ação</th></tr></thead>
                <tbody>
                  {itensEmAlerta.map(item => (
                    <tr key={item.id}>
                      <td>{item.nome}</td>
                      <td className="texto-vermelho-bold">{item.quantidade} un</td>
                      <td><button className="botao-secundario" onClick={() => gerarSolicitacaoCompra(item)}>Iniciar Cotação</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'consultar-itens': return <Inventario termoBusca={termoBusca} setTermoBusca={setTermoBusca} estoque={estoque} gerarSolicitacaoCompra={gerarSolicitacaoCompra} />;

      case 'categorias':
        return (
          <div className="atlas-container">
            <header className="atlas-header"><h1>Grupos e Categorias</h1></header>
            <div className="atlas-card full">
              <table className="atlas-tabela">
                <thead><tr><th>Classificação</th><th>Volume de Itens</th></tr></thead>
                <tbody>{[...new Set(estoque.map(i => i.categoria))].filter(Boolean).map((cat, idx) => (<tr key={idx}><td><strong>{cat}</strong></td><td>{estoque.filter(i => i.categoria === cat).length} itens</td></tr>))}</tbody>
              </table>
            </div>
          </div>
        );

      case 'fornecedores':
        return (
          <div className="atlas-container">
            <header className="atlas-header"><h1>Fornecedores</h1><button className="botao-primario" onClick={() => setTelaAtiva('cadastro-de-fornecedor')}>Homologar</button></header>
            <div className="atlas-card full">
              <table className="atlas-tabela">
                <thead><tr><th>Razão Social</th><th>CNPJ</th></tr></thead>
                <tbody>{listaFornecedores.map(f => (<tr key={f.id}><td>{f.razao}</td><td>{f.cnpj}</td></tr>))}</tbody>
              </table>
            </div>
          </div>
        );

      case 'cadastro-de-fornecedor':
        return (
          <div className="atlas-container">
            <header className="atlas-header"><h1>Inclusão de Fornecedor</h1></header>
            <div className="atlas-card full">
              <div className="atlas-linha"><div className="atlas-campo flex-2"><input type="text" id="razao-forn" placeholder="Razão" /></div><div className="atlas-campo"><input type="text" id="cnpj-forn" placeholder="CNPJ" onChange={(e) => e.target.value = maskCNPJ(e.target.value)} /></div></div>
              <button className="botao-primario mt-20" onClick={salvarFornecedor}>Confirmar</button>
            </div>
          </div>
        );

      case 'cotacoes':
        return (
          <div className="atlas-container">
            <header className="atlas-header"><div><h1>Cotações</h1></div></header>
            <div className="atlas-card full">
              <table className="atlas-tabela">
                <thead><tr><th>Produto</th><th>Qtd</th><th>Fornecedor Base</th><th>Opção B</th><th>Opção C</th><th>Ação</th></tr></thead>
                <tbody>
                  {[...solicitacoesCotacao, ...linhasItens.map(l => ({ ...l, isManual: true }))].map(cot => (
                    <tr key={cot.id}>
                      <td>{cot.isManual ? <input type="text" className="input-tabela" onChange={(e) => atualizarValorLinha(cot.id, 'nome_temp', e.target.value)} /> : <strong>{cot.produto}</strong>}</td>
                      <td>{cot.isManual ? <input type="number" className="input-tabela" onChange={(e) => atualizarValorLinha(cot.id, 'qtd', e.target.value)} /> : cot.qtd}</td>
                      <td><input type="number" className="input-tabela" value={cot.vlrA || ''} onChange={(e) => cot.isManual ? atualizarValorLinha(cot.id, 'vlrA', e.target.value) : atualizarCotacaoState(cot.id, 'vlrA', e.target.value)} onBlur={() => !cot.isManual && salvarCotacaoBD(cot)} /></td>
                      <td><input type="number" className="input-tabela" value={cot.vlrB || ''} onChange={(e) => cot.isManual ? atualizarValorLinha(cot.id, 'vlrB', e.target.value) : atualizarCotacaoState(cot.id, 'vlrB', e.target.value)} onBlur={() => !cot.isManual && salvarCotacaoBD(cot)} /></td>
                      <td><input type="number" className="input-tabela" value={cot.vlrC || ''} onChange={(e) => cot.isManual ? atualizarValorLinha(cot.id, 'vlrC', e.target.value) : atualizarCotacaoState(cot.id, 'vlrC', e.target.value)} onBlur={() => !cot.isManual && salvarCotacaoBD(cot)} /></td>
                      <td>{cot.isManual ? <button onClick={() => removerLinha(cot.id)} className="botao-link texto-vermelho-bold">Excluir</button> : <button className="botao-primario font-12" onClick={() => converterCotacaoEmPedido(cot)}>Aprovar</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'pedidos':
        return (
          <div className="atlas-container">
            <header className="atlas-header"><h1>Aquisições</h1></header>
            <div className="atlas-card full">
              <table className="atlas-tabela">
                <thead><tr><th>Doc</th><th>Fornecedor</th><th>Produto</th><th>Total</th></tr></thead>
                <tbody>{pedidosOficiais.map(ped => (<tr key={ped.id}><td>{ped.protocolo}</td><td>{ped.fornecedor}</td><td>{ped.produto}</td><td>R$ {ped.subtotal.toFixed(2)}</td></tr>))}</tbody>
              </table>
            </div>
          </div>
        );

      default:
        return <section><h2>Aguardando seleção...</h2></section>;
    }
  };

  if (!isLoggedIn) {
    return <Login realizarLogin={realizarLogin} inputUser={inputUser} setInputUser={setInputUser} inputPass={inputPass} setInputPass={setInputPass} />;
  }

  return (
    <div className="container-principal">
      <ToastContainer position="top-right" autoClose={2000} theme="colored" />
      <MenuNavegacao itensMenu={itensMenu} setTelaAtiva={setTelaAtiva} usuarioAtual={usuarioAtual} realizarLogoff={realizarLogoff} />
      <main className="conteudo-pagina">
        {renderizarConteudo()}
      </main>
    </div>
  );
}

export default App;
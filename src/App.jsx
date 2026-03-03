import { useState, useEffect } from 'react';
import './index.css';

import { supabase } from './supabaseClient';
import Login from './pages/Login.jsx';
import MenuNavegacao from './components/MenuNavegacao.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Entradas from './pages/Entradas.jsx';
import Inventario from './pages/Inventario.jsx';

import FrenteCaixa from './pages/FrenteCaixa.jsx';
import Devolucoes from './pages/Devolucoes.jsx';
import CadastroItem from './pages/CadastroItem.jsx';
import RelatorioVendas from './pages/RelatorioVendas.jsx';
import ExtratoFinanceiro from './pages/ExtratoFinanceiro.jsx';
import PainelRequisicoes from './pages/PainelRequisicoes.jsx';
import EmissaoRecibo from './pages/EmissaoRecibo.jsx';
import ControleCaixa from './pages/ControleCaixa.jsx';

import logoAtlas from './assets/logopages.png';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usuarioAtual, setUsuarioAtual] = useState('');
  const [usuarioRole, setUsuarioRole] = useState('');
  const [inputUser, setInputUser] = useState('');
  const [inputPass, setInputPass] = useState('');

  const [telaAtiva, setTelaAtiva] = useState('inicio');
  const [imagemAnexada, setImagemAnexada] = useState(null);
  const [vendaExpandidaId, setVendaExpandidaId] = useState(null);

  const [caixaAtivo, setCaixaAtivo] = useState(null);
  const [historicoCaixa, setHistoricoCaixa] = useState([]);

  const [favoritos, setFavoritos] = useState(['vendas', 'cadastro-de-item', 'nova-requisicao']);

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
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [linhasItens, setLinhasItens] = useState([{ id: Date.now(), qtd: 0, valor: 0, vlrA: 0, vlrB: 0, vlrC: 0 }]);
  const [termoBusca, setTermoBusca] = useState('');

  const [dataInicioEncalhado, setDataInicioEncalhado] = useState('');
  const [dataFimEncalhado, setDataFimEncalhado] = useState('');

  const menuBase = [
    { nome: 'Inicio', filhos: ['Dashboard'] },
    { nome: 'Produtos', filhos: ['Consultar Itens', 'Cadastro de Item', 'Categorias', 'Promocoes'] },
    { nome: 'Estoque & Logistica', filhos: ['Entradas', 'Saidas', 'Ajustes', 'Log de Estoque'] },
    { nome: 'Gestao de Compras', filhos: ['Sugestoes de Compras', 'Cotacoes', 'Pedidos', 'Fornecedores'] },
    { nome: 'Vendas & PDV', filhos: ['Vendas', 'Devolucoes', 'Controle de Caixa'] },
    { nome: 'Notas Fiscais', filhos: ['Emissao de NF'] },
    { nome: 'Relatorios', filhos: ['Receitas e Despesas', 'Detalhes de Vendas', 'Exportacoes e BI', 'Posicao de Estoque', 'Historico de Vendas', 'Notas de Entrada', 'Historico de Devolucoes', 'Historico de Caixa'] },
    { nome: 'Requisicoes', filhos: ['Nova Requisicao', 'Painel de Requisicoes'] },
    { nome: 'Configuracoes', filhos: ['Gerenciar Usuarios'] }
  ];

  const itensMenu = menuBase.filter(categoria => {
    if (usuarioRole === 'admin') return true;
    if (usuarioRole === 'gerente') {
      const categoriasGerente = ['Inicio', 'Produtos', 'Estoque & Logistica', 'Gestao de Compras', 'Vendas & PDV', 'Notas Fiscais', 'Relatorios', 'Requisicoes'];
      return categoriasGerente.includes(categoria.nome);
    }
    if (usuarioRole === 'caixa') {
      const categoriasCaixa = ['Inicio', 'Vendas & PDV', 'Produtos', 'Requisicoes'];
      return categoriasCaixa.includes(categoria.nome);
    }
    return false;
  }).map(categoria => {
    if (usuarioRole === 'caixa' && categoria.nome === 'Vendas & PDV') return { ...categoria, filhos: ['Vendas', 'Controle de Caixa'] };
    if (usuarioRole === 'caixa' && categoria.nome === 'Produtos') return { ...categoria, filhos: ['Consultar Itens'] };
    if (usuarioRole === 'caixa' && categoria.nome === 'Requisicoes') return { ...categoria, filhos: ['Nova Requisicao'] };
    return categoria;
  });

  const nomesDasTelas = {
    'dashboard': 'Painel', 'vendas': 'PDV', 'devolucoes': 'Devolucao',
    'cadastro-de-item': 'Novo Item', 'consultar-itens': 'Estoque',
    'entradas': 'Entrada', 'saidas': 'Saida', 'nova-requisicao': 'Pedido',
    'painel-de-requisicoes': 'Aprovacao', 'exportacoes-e-bi': 'Exportar'
  };

  const gerarSlug = (texto) => texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

  const categoriaAtual = itensMenu.find(cat => cat.filhos.some(f => gerarSlug(f) === telaAtiva));
  const mostrarMenuEsquerdo = categoriaAtual && categoriaAtual.filhos.length > 1 && telaAtiva !== 'inicio' && telaAtiva !== 'dashboard';
  const mostrarSidebar = telaAtiva !== 'inicio';

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
  const buscarUsuariosReal = async () => { const { data } = await supabase.from('usuarios').select('*'); if (data) setListaUsuarios(data); };
  const buscarHistoricoCaixa = async () => { const { data } = await supabase.from('fluxos_caixa').select('*').order('data_abertura', { ascending: false }); if (data) setHistoricoCaixa(data); };

  const verificarCaixaAberto = async () => {
    const { data } = await supabase.from('fluxos_caixa').select('*').eq('status', 'aberto').order('data_abertura', { ascending: false }).limit(1).single();
    if (data) setCaixaAtivo(data);
  };

  useEffect(() => {
    if (isLoggedIn) {
      buscarEstoqueReal(); buscarLogReal(); buscarVendasReal(); buscarDespesasReal();
      buscarFornecedoresReal(); buscarPendenciasReal(); buscarNotasReal();
      buscarCotacoesReal(); buscarPedidosReal(); buscarDevolucoesReal(); buscarRequisicoesReal();
      buscarUsuariosReal();
      verificarCaixaAberto();
      buscarHistoricoCaixa();
    }
  }, [isLoggedIn]);

  const gerenciarFavoritos = () => {
    if (favoritos.includes(telaAtiva)) {
      setFavoritos(favoritos.filter(f => f !== telaAtiva));
    } else {
      setFavoritos([...favoritos, telaAtiva]);
    }
  };

  const abrirCaixa = async (valorInicial) => {
    const { data, error } = await supabase.from('fluxos_caixa').insert([{ usuario_abertura: usuarioAtual, valor_inicial: Number(valorInicial), status: 'aberto' }]).select().single();
    if (data) { setCaixaAtivo(data); toast.success("Caixa aberto com sucesso! PDV liberado."); buscarHistoricoCaixa(); }
    else { toast.error("Erro ao abrir o caixa no sistema."); }
  };

  const fecharCaixa = async (valorFisico, valorEsperado, totalVendido) => {
    const diferenca = Number(valorFisico) - Number(valorEsperado);
    const { error } = await supabase.from('fluxos_caixa').update({ status: 'fechado', usuario_fechamento: usuarioAtual, data_fechamento: new Date().toISOString(), valor_final_sistema: Number(valorEsperado), valor_final_fisico: Number(valorFisico), observacoes: `Total Vendido: R$ ${totalVendido.toFixed(2)} | Diferenca: R$ ${diferenca.toFixed(2)}` }).eq('id', caixaAtivo.id);
    if (!error) {
      setCaixaAtivo(null);
      if (diferenca === 0) toast.success(`Caixa fechado perfeitamente. Saldo exato!`);
      else if (diferenca > 0) toast.info(`Caixa fechado. Houve sobra de R$ ${diferenca.toFixed(2)}.`);
      else toast.error(`Caixa fechado com QUEBRA (falta) de R$ ${Math.abs(diferenca).toFixed(2)}.`);
      buscarHistoricoCaixa();
    }
  };

  const realizarLogin = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('usuarios').select('*').eq('login', inputUser).eq('senha', inputPass).single();
    if (data) { setUsuarioRole(data.role); setUsuarioAtual(data.nome); setIsLoggedIn(true); toast.success(`Bem-vindo(a), ${data.nome}!`); } else { toast.error("Credenciais invalidas."); }
  };

  const realizarLogoff = () => { setIsLoggedIn(false); setInputUser(''); setInputPass(''); setTelaAtiva('inicio'); setUsuarioRole(''); setCaixaAtivo(null); };

  const TelaBloqueada = () => (<div className="tela-bloqueada"><h2 className="titulo-escuro">Acesso Restrito</h2><p className="texto-cinza">O seu nível de usuário ({usuarioRole}) não tem permissão para visualizar esta tela.</p></div>);
  const maskCNPJ = (value) => value.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2').slice(0, 18);
  const maskCPF = (value) => value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2').slice(0, 14);
  const maskTelefone = (value) => value.replace(/\D/g, '').replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d)(\d{4})$/, '$1-$2').slice(0, 15);
  const manipularUpload = (e) => { if (e.target.files[0]) setImagemAnexada(URL.createObjectURL(e.target.files[0])); };
  const adicionarLinha = () => setLinhasItens([...linhasItens, { id: Date.now(), qtd: 0, valor: 0, vlrA: '', vlrB: 0, vlrC: 0 }]);
  const removerLinha = (id) => {
    if (linhasItens.length > 1) {
      setLinhasItens(linhasItens.filter(l => l.id !== id));
      toast.info("Linha removida.");
    } else {
      toast.warn("A nota precisa ter pelo menos um item.");
    }
  };
  const atualizarValorLinha = (id, campo, valor) => setLinhasItens(linhasItens.map(linha => linha.id === id ? { ...linha, [campo]: (campo === 'qtd' || campo === 'valor' || campo === 'vlrB' || campo === 'vlrC') ? Number(valor) : valor } : linha));

  const confirmarEntradaComPendencia = async () => {
    const subtotal = linhasItens.reduce((acc, item) => acc + (Number(item.qtd || 0) * Number(item.valor || 0)), 0);
    const fornNF = document.getElementById('forn-entrada')?.value?.trim() || 'Nao informado';
    const cnpjNF = document.getElementById('cnpj-entrada')?.value?.trim() || '';
    const emailNF = document.getElementById('email-entrada')?.value?.trim() || '';
    const telNF = document.getElementById('tel-entrada')?.value?.trim() || '';
    const dataNF = document.getElementById('data-entrada')?.value || new Date().toISOString().split('T')[0];

    if (fornNF !== 'Nao informado' && cnpjNF) {
      const fornecedorExiste = listaFornecedores.find(f =>
        f.cnpj === cnpjNF || f.razao.toUpperCase() === fornNF.toUpperCase()
      );

      if (!fornecedorExiste) {
        const { error } = await supabase.from('fornecedores').insert([{
          razao: fornNF,
          cnpj: cnpjNF,
          email: emailNF,
          telefone: telNF,
          status: 'Ativo'
        }]);

        if (!error) {
          buscarFornecedoresReal();
          toast.success(`Novo fornecedor "${fornNF}" salvo na sua base de dados!`);
        }
      }
    }

    if (subtotal > 0) { await supabase.from('despesas').insert([{ descricao: `Entrada Mercadoria - NF: ${cnpjNF || 'S/N'}`, fornecedor: fornNF, valor_total: subtotal, tipo: 'COMPRA_ESTOQUE' }]); buscarDespesasReal(); }
    if (fornNF !== 'Nao informado' || cnpjNF || subtotal > 0) { await supabase.from('notas_fiscais').insert([{ fornecedor: fornNF, cnpj: cnpjNF, data_emissao: dataNF, valor_total: subtotal }]); buscarNotasReal(); }
    if (linhasItens.length > 0 && linhasItens[0].nome_temp) { const novosPendentes = linhasItens.map(l => ({ nome: l.nome_temp || 'Sem nome', quantidade: Number(l.qtd || 0), custo_unitario: Number(l.valor || 0), fornecedor: fornNF })); await supabase.from('itens_pendentes').insert(novosPendentes); buscarPendenciasReal(); }

    setValorTotalEntradas(prev => prev + subtotal); toast.success("Entrada registrada com sucesso!");
    setLinhasItens([{ id: Date.now(), qtd: 0, valor: 0, vlrA: '', vlrB: 0, vlrC: 0 }]);
    setImagemAnexada(null);

    if (document.getElementById('forn-entrada')) document.getElementById('forn-entrada').value = '';
    if (document.getElementById('cnpj-entrada')) document.getElementById('cnpj-entrada').value = '';
    if (document.getElementById('email-entrada')) document.getElementById('email-entrada').value = '';
    if (document.getElementById('tel-entrada')) document.getElementById('tel-entrada').value = '';
  };

  const registrarSaidasAvulsas = async () => {
    const itensValidos = linhasItens.filter(l => l.nome_temp && l.qtd > 0);
    if (itensValidos.length === 0) return toast.error("Selecione um produto e a quantidade.");

    let processados = 0;
    let valorPerdaTotal = 0;

    for (const item of itensValidos) {
      const produtoDb = estoque.find(i => i.id === item.nome_temp);
      if (!produtoDb || produtoDb.quantidade < item.qtd) {
        toast.error(`Estoque insuficiente: ${produtoDb?.nome || 'Item'}`);
        continue;
      }

      const novaQtd = Number(produtoDb.quantidade) - Number(item.qtd);
      const motivoBaixa = item.vlrA || 'Outros';

      const custoPerda = (Number(produtoDb.custo_base || 0) * Number(item.qtd));

      await supabase.from('estoque').update({ quantidade: novaQtd }).eq('id', produtoDb.id);
      await supabase.from('saidas').insert([{ produto_id: produtoDb.id, produto_nome: produtoDb.nome, quantidade: item.qtd, motivo: motivoBaixa }]);
      await supabase.from('log_movimentacao').insert([{ produto_id: produtoDb.id, produto_nome: produtoDb.nome, tipo_movimentacao: 'SAIDA_AVULSA', quantidade_alterada: -item.qtd, usuario: usuarioAtual, observacao: `Motivo: ${motivoBaixa}` }]);

      if (['Avaria / Quebra', 'Vencimento / Validade', 'Perda / Furto', 'Uso Interno'].includes(motivoBaixa)) {
        valorPerdaTotal += custoPerda;
      }
      processados++;
    }

    if (valorPerdaTotal > 0) {
      await supabase.from('despesas').insert([{
        descricao: `Baixa de Estoque (Perdas/Avarias/Consumo)`,
        fornecedor: 'Estoque Interno',
        valor_total: valorPerdaTotal,
        tipo: 'PERDA_ESTOQUE'
      }]);
      buscarDespesasReal();
    }

    if (processados > 0) {
      toast.success(`Baixa registrada com sucesso.`);
      buscarEstoqueReal();
      buscarLogReal();
      setLinhasItens([{ id: Date.now(), qtd: 0, valor: 0, vlrA: '', vlrB: 0, vlrC: 0 }]);
    }
  };

  const realizarAjusteEstoque = async () => {
    const idItem = document.getElementById('sel-ajuste').value;
    const qtdAjuste = Number(document.getElementById('qtd-ajuste').value);
    if (!idItem || !qtdAjuste) return toast.error("Preencha todos os campos antes de ajustar.");
    const itemAtual = estoque.find(i => i.id === idItem);
    if (!itemAtual) return toast.error("Produto não encontrado no estoque.");

    const novaQuantidade = document.getElementById('tipo-ajuste').value === 'entrada'
      ? Number(itemAtual.quantidade) + qtdAjuste
      : Number(itemAtual.quantidade) - qtdAjuste;

    await supabase.from('estoque').update({ quantidade: novaQuantidade }).eq('id', idItem);
    await supabase.from('log_movimentacao').insert([{ produto_id: idItem, produto_nome: itemAtual.nome, tipo_movimentacao: 'AJUSTE', quantidade_alterada: document.getElementById('tipo-ajuste').value === 'entrada' ? qtdAjuste : -qtdAjuste, usuario: usuarioAtual, observacao: 'Ajuste manual' }]);

    buscarLogReal();
    setEstoque(estoque.map(i => i.id === idItem ? { ...i, quantidade: novaQuantidade } : i));
    toast.success("Ajuste realizado com sucesso.");

    document.getElementById('qtd-ajuste').value = '';
    document.getElementById('sel-ajuste').value = '';
  };

  const prepararAceite = (item) => {
    document.getElementById('nome-item').value = item.nome;
    document.getElementById('qtd-item').value = item.quantidade;
    document.getElementById('custo-item').value = item.custo_unitario || '';
    document.getElementById('fornecedor-item').value = item.fornecedor || '';

    const itemExistente = estoque.find(i => i.nome.trim().toUpperCase() === item.nome.trim().toUpperCase());

    if (itemExistente) {
      document.getElementById('sku-item').value = itemExistente.sku;
      document.getElementById('codigo-barra-item').value = itemExistente.codigo_barra || '';
      document.getElementById('categoria-item').value = itemExistente.categoria || '';
      document.getElementById('ncm-item').value = itemExistente.ncm || '';
      document.getElementById('cest-item').value = itemExistente.cest || '';
      document.getElementById('venda-item').value = itemExistente.valor_venda || '';

      const custoAntigo = Number(itemExistente.custo_base || 0);
      const custoNovo = Number(item.custo_unitario || 0);

      if (custoNovo > custoAntigo && custoAntigo > 0) {
        toast.warn(`⚠️ ALERTA: O custo subiu de R$ ${custoAntigo.toFixed(2)} para R$ ${custoNovo.toFixed(2)}! Reajuste seu Preço de Venda antes de salvar.`, { autoClose: 7000 });
      } else if (custoNovo < custoAntigo && custoNovo > 0) {
        toast.info(`Ótimo! O custo caiu de R$ ${custoAntigo.toFixed(2)} para R$ ${custoNovo.toFixed(2)}. A margem de lucro aumentou.`);
      } else {
        toast.info("Produto reconhecido! Ficha técnica carregada.");
      }
    } else {
      document.getElementById('sku-item').value = '';
      document.getElementById('codigo-barra-item').value = '';
      document.getElementById('categoria-item').value = '';
      document.getElementById('venda-item').value = '';
      toast.info("Produto novo! Gere o SKU e defina a Categoria.");
    }

    setItemEmEdicao(item);
  };

  const cancelarPendencia = async (id) => {
    await supabase.from('itens_pendentes').delete().eq('id', id);
    buscarPendenciasReal();
    if (itemEmEdicao?.id === id) setItemEmEdicao(null);
    toast.info("Item descartado da fila de pendentes.");
  };

  const salvarCadastroItem = async () => {
    const nome = document.getElementById('nome-item').value.trim();
    const categoria = document.getElementById('categoria-item').value;
    const qtd = Number(document.getElementById('qtd-item').value);
    const sku = document.getElementById('sku-item').value.trim();
    const codigo_barra = document.getElementById('codigo-barra-item')?.value.trim() || '';
    const ncm = document.getElementById('ncm-item')?.value || '';
    const cest = document.getElementById('cest-item')?.value || '';
    const origem = document.getElementById('origem-item')?.value || '0';
    const ipi = Number(document.getElementById('ipi-item')?.value || 0);
    const custo_base = Number(document.getElementById('custo-item')?.value || 0);
    const valor_venda = Number(document.getElementById('venda-item')?.value || 0);
    const estoque_minimo = Number(document.getElementById('minimo-item').value);
    const fornecedor_padrao = document.getElementById('fornecedor-item')?.value || '';

    const inputArquivo = document.getElementById('imagem-produto-upload');
    const arquivoImagem = inputArquivo ? inputArquivo.files[0] : null;

    if (!nome || !sku || !categoria) return toast.error("Nome, Categoria e SKU obrigatórios.");

    const formSku = sku.toUpperCase();
    const formNome = nome.toUpperCase();
    const formBarra = codigo_barra;

    const itemMesmoProduto = estoque.find(i => {
      const dbNome = String(i.nome || '').trim().toUpperCase();
      const dbBarra = String(i.codigo_barra || '').trim();
      return (dbNome === formNome && formNome !== '') || (dbBarra === formBarra && formBarra !== '');
    });

    let url_imagem = itemMesmoProduto ? itemMesmoProduto.url_imagem : null;

    if (arquivoImagem) {
      toast.info("Imagem detectada! Iniciando upload...");
      const fileExt = arquivoImagem.name.split('.').pop();
      const fileName = `prod_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('produtos').upload(fileName, arquivoImagem);

      if (uploadError) return toast.error("Erro no Storage: " + uploadError.message);

      const { data: publicUrlData } = supabase.storage.from('produtos').getPublicUrl(fileName);
      url_imagem = publicUrlData.publicUrl;
    }

    if (itemMesmoProduto) {
      const novaQtd = Number(itemMesmoProduto.quantidade) + qtd;

      const { error } = await supabase.from('estoque').update({
        quantidade: novaQtd,
        custo_base: custo_base > 0 ? custo_base : itemMesmoProduto.custo_base,
        valor_venda: valor_venda > 0 ? valor_venda : itemMesmoProduto.valor_venda,
        url_imagem: url_imagem
      }).eq('id', itemMesmoProduto.id);

      if (error) return toast.error("Erro ao unificar o estoque: " + error.message);

      await supabase.from('log_movimentacao').insert([{
        produto_id: itemMesmoProduto.id,
        produto_nome: itemMesmoProduto.nome,
        tipo_movimentacao: 'REPOSICAO_COMPRA',
        quantidade_alterada: qtd,
        usuario: usuarioAtual,
        observacao: 'Item unificado via Cadastro/Pendência'
      }]);
      buscarLogReal();

      if (itemEmEdicao) {
        await supabase.from('itens_pendentes').delete().eq('id', itemEmEdicao.id);
        buscarPendenciasReal(); setItemEmEdicao(null);
      }

      setEstoque(estoque.map(i => i.id === itemMesmoProduto.id ? {
        ...i, quantidade: novaQtd, custo_base: custo_base > 0 ? custo_base : i.custo_base, valor_venda: valor_venda > 0 ? valor_venda : i.valor_venda, url_imagem
      } : i));

      toast.success(`Produto já existia! Estoque unificado. Novo saldo: ${novaQtd} un.`);

    } else {
      const skuEmUso = estoque.find(i => String(i.sku || '').trim().toUpperCase() === formSku);

      if (skuEmUso) {
        return toast.error(`⚠️ ALERTA: O SKU "${sku}" já pertence ao produto "${skuEmUso.nome}". Por favor, gere um SKU diferente.`);
      }

      const novoItemBD = {
        sku, nome, categoria, quantidade: qtd, estoque_minimo, fornecedor_padrao,
        custo_base, valor_venda, status: 'ativo', codigo_barra, ncm, cest, origem, ipi, url_imagem
      };

      const { data, error } = await supabase.from('estoque').insert([novoItemBD]).select();

      if (error) return toast.error("Erro ao salvar no banco: " + error.message);

      await supabase.from('log_movimentacao').insert([{ produto_id: data[0].id, produto_nome: nome, tipo_movimentacao: 'CADASTRO_INICIAL', quantidade_alterada: qtd, usuario: usuarioAtual }]);
      buscarLogReal();

      if (itemEmEdicao) {
        await supabase.from('itens_pendentes').delete().eq('id', itemEmEdicao.id);
        buscarPendenciasReal(); setItemEmEdicao(null);
      }

      setEstoque([...estoque, data[0]]);
      toast.success("Novo item cadastrado com sucesso!");
    }

    document.getElementById('nome-item').value = ''; document.getElementById('sku-item').value = ''; document.getElementById('categoria-item').value = ''; document.getElementById('codigo-barra-item').value = ''; document.getElementById('ncm-item').value = ''; document.getElementById('cest-item').value = ''; document.getElementById('origem-item').value = '0'; document.getElementById('ipi-item').value = '0'; document.getElementById('qtd-item').value = '0'; document.getElementById('minimo-item').value = '5'; document.getElementById('fornecedor-item').value = ''; document.getElementById('custo-item').value = ''; document.getElementById('venda-item').value = '';
    if (inputArquivo) inputArquivo.value = '';
  };

  const gerarReciboVendaDiretaPDF = (carrinho, cliente, numeroVenda, total) => {
    const img = new Image(); img.src = logoAtlas;
    img.onload = () => {
      const doc = new jsPDF();
      doc.setFontSize(22); doc.setFont("helvetica", "bold"); doc.setTextColor(0, 0, 0); doc.text("ATLAS", 14, 20);
      const espacoAtlas = doc.getTextWidth("ATLAS "); doc.setTextColor(156, 163, 175); doc.text("ERP", 14 + espacoAtlas, 20);
      doc.setFontSize(9); doc.setTextColor(100, 116, 139); doc.setFont("helvetica", "normal");
      doc.text(`CNPJ: 00.000.000/0001-00 | Inscricao Estadual: 123.456.789.000`, 14, 26);
      doc.text(`Endereco: Avenida da Inovacao, 1000 - Sao Paulo, SP`, 14, 31);
      doc.text(`Contato: (11) 4000-0000 | atendimento@atlas-erp.com.br`, 14, 36);
      doc.setDrawColor(226, 232, 240); doc.line(14, 42, 196, 42);
      doc.setFontSize(14); doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "bold");
      doc.text(`RECIBO DE VENDA - DOCUMENTO AUXILIAR`, 14, 52);
      doc.setFontSize(10); doc.setTextColor(71, 85, 105); doc.setFont("helvetica", "normal");
      doc.text(`Numero da Venda: VD-${String(numeroVenda).padStart(4, '0')}`, 14, 58);
      doc.text(`Data de Emissao: ${new Date().toLocaleString('pt-BR')}`, 14, 63);
      doc.setFillColor(248, 250, 252); doc.rect(14, 68, 182, 15, 'F');
      doc.setFontSize(11); doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "bold");
      doc.text(`DADOS DO COMPRADOR`, 18, 75);
      doc.setFontSize(10); doc.setTextColor(71, 85, 105); doc.setFont("helvetica", "normal");
      doc.text(`Cliente: ${cliente}`, 18, 80);
      const linhas = carrinho.map(item => [item.nome, `${item.quantidade} un`, `R$ ${item.valor_venda.toFixed(2)}`, `R$ ${item.subtotal.toFixed(2)}`]);
      autoTable(doc, { startY: 90, head: [['Descricao do Item', 'Qtd', 'Valor Unitario', 'Subtotal']], body: linhas, theme: 'grid', headStyles: { fillColor: [0, 0, 0], fontSize: 10 }, bodyStyles: { fontSize: 11, fontStyle: 'bold' }, didDrawPage: function (data) { doc.setGState(new doc.GState({ opacity: 0.05 })); doc.addImage(img, 'PNG', 35, 110, 140, 120); doc.setGState(new doc.GState({ opacity: 1 })); } });
      const finalY = doc.lastAutoTable.finalY; doc.setFontSize(16); doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "bold"); doc.text(`TOTAL PAGO: R$ ${total.toFixed(2)}`, 14, finalY + 15);
      doc.setFontSize(9); doc.setTextColor(148, 163, 184); doc.setFont("helvetica", "normal"); doc.text(`* Trocas ou devolucoes serao aceitas mediante apresentacao deste recibo e do numero da venda.`, 14, finalY + 25);
      doc.save(`Recibo_Venda_VD${String(numeroVenda).padStart(4, '0')}.pdf`);
    };
  };

  const registrarVenda = async (carrinho, clienteCompleto, imprimirRecibo = false) => {
    let valorTotalVenda = 0; let clienteNome = clienteCompleto.split(' | ')[0]; let novoEstoque = [...estoque];
    const ultimoNumero = historicoVendas.length > 0 ? Math.max(...historicoVendas.map(v => v.numero_venda || 0)) : 0;
    const numeroDestaVenda = ultimoNumero + 1;
    for (const item of carrinho) {
      valorTotalVenda += item.subtotal;
      await supabase.from('vendas').insert([{ numero_venda: numeroDestaVenda, produto_id: item.id, produto_nome: item.nome, quantidade: item.quantidade, valor_unitario: item.valor_venda, valor_total: item.subtotal, cliente: clienteCompleto }]);
      const produtoIndex = novoEstoque.findIndex(i => i.id === item.id);
      if (produtoIndex !== -1) { const novaQtd = Number(novoEstoque[produtoIndex].quantidade) - Number(item.quantidade); novoEstoque[produtoIndex] = { ...novoEstoque[produtoIndex], quantidade: novaQtd }; await supabase.from('estoque').update({ quantidade: novaQtd }).eq('id', item.id); }
      await supabase.from('log_movimentacao').insert([{ produto_id: item.id, produto_nome: item.nome, tipo_movimentacao: 'VENDA', quantidade_alterada: -item.quantidade, usuario: usuarioAtual, observacao: `Venda #${numeroDestaVenda} para: ${clienteNome}` }]);
    }
    setEstoque(novoEstoque); buscarLogReal(); buscarVendasReal(); toast.success(`Cupom #${numeroDestaVenda} finalizado! Total: R$ ${valorTotalVenda.toFixed(2)}`);
    if (imprimirRecibo) { gerarReciboVendaDiretaPDF(carrinho, clienteCompleto, numeroDestaVenda, valorTotalVenda); }
  };

  const registrarDevolucao = async (carrinho, cliente, motivo, numeroVendaRef, dataVendaRef) => {
    let valorTotalEstornado = 0;
    let novoEstoque = [...estoque];

    const isAvaria = motivo.includes('[AVARIA]');

    for (const item of carrinho) {
      valorTotalEstornado += item.subtotal;
      await supabase.from('devolucoes').insert([{ produto_id: item.id, produto_nome: item.nome, quantidade: item.quantidade, valor_estornado: item.subtotal, cliente: cliente, motivo: motivo, numero_venda_ref: Number(numeroVendaRef), data_venda: dataVendaRef }]);

      if (!isAvaria) {
        const produtoIndex = novoEstoque.findIndex(i => i.id === item.id);
        if (produtoIndex !== -1) {
          const novaQtd = Number(novoEstoque[produtoIndex].quantidade) + Number(item.quantidade);
          novoEstoque[produtoIndex] = { ...novoEstoque[produtoIndex], quantidade: novaQtd };
          await supabase.from('estoque').update({ quantidade: novaQtd }).eq('id', item.id);
        }
        await supabase.from('log_movimentacao').insert([{ produto_id: item.id, produto_nome: item.nome, tipo_movimentacao: 'DEVOLUCAO', quantidade_alterada: item.quantidade, usuario: usuarioAtual, observacao: `Retorno ao estoque. Motivo: ${motivo} (Ref: VD-${numeroVendaRef})` }]);
      } else {
        await supabase.from('log_movimentacao').insert([{ produto_id: item.id, produto_nome: item.nome, tipo_movimentacao: 'DEVOLUCAO_AVARIA', quantidade_alterada: 0, usuario: usuarioAtual, observacao: `Devolvido com Avaria (Lixo/Descarte). Não retornou ao saldo. (Ref: VD-${numeroVendaRef})` }]);
      }
    }

    if (valorTotalEstornado > 0) {
      await supabase.from('despesas').insert([{ descricao: `Estorno - Venda VD-${numeroVendaRef}`, fornecedor: 'Interno', valor_total: valorTotalEstornado, tipo: 'ESTORNO_VENDA' }]);
    }

    setEstoque(novoEstoque); buscarLogReal(); buscarDespesasReal(); buscarDevolucoesReal();

    if (isAvaria) {
      toast.error(`Dinheiro estornado. Atenção: Os itens NÃO voltaram ao estoque (Avaria).`);
    } else {
      toast.success(`Estorno processado e itens voltaram à prateleira com sucesso!`);
    }
  };

  const gerarReciboDevolucaoPDF = (carrinho, cliente, motivo, numeroVendaRef, dataVendaRef, total) => {
    const img = new Image(); img.src = logoAtlas;
    img.onload = () => {
      const doc = new jsPDF();
      doc.setFontSize(22); doc.setFont("helvetica", "bold"); doc.setTextColor(0, 0, 0); doc.text("ATLAS", 14, 20);
      const espacoAtlas = doc.getTextWidth("ATLAS "); doc.setTextColor(156, 163, 175); doc.text("ERP", 14 + espacoAtlas, 20);
      doc.setFontSize(9); doc.setTextColor(100, 116, 139); doc.setFont("helvetica", "normal");
      doc.text(`CNPJ: 00.000.000/0001-00 | Inscricao Estadual: 123.456.789.000`, 14, 26);
      doc.text(`Endereco: Avenida da Inovacao, 1000 - Sao Paulo, SP`, 14, 31);
      doc.text(`Contato: (11) 4000-0000 | atendimento@atlas-erp.com.br`, 14, 36);
      doc.setDrawColor(226, 232, 240); doc.line(14, 42, 196, 42);
      doc.setFontSize(14); doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "bold");
      doc.text(`COMPROVANTE DE DEVOLUCAO E ESTORNO`, 14, 52);
      doc.setFontSize(10); doc.setTextColor(71, 85, 105); doc.setFont("helvetica", "normal");
      doc.text(`Data do Retorno: ${new Date().toLocaleString('pt-BR')}`, 14, 58);
      doc.text(`Ref. Venda Original: VD-${String(numeroVendaRef).padStart(4, '0')} (Em: ${dataVendaRef})`, 14, 63);
      doc.text(`Motivo Registrado: ${motivo}`, 14, 68);
      doc.setFillColor(248, 250, 252); doc.rect(14, 73, 182, 15, 'F');
      doc.setFontSize(11); doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "bold");
      doc.text(`DADOS DO CLIENTE`, 18, 80);
      doc.setFontSize(10); doc.setTextColor(71, 85, 105); doc.setFont("helvetica", "normal");
      doc.text(`Nome/Razao Social: ${cliente}`, 18, 85);
      const linhas = carrinho.map(item => [item.nome, `${item.quantidade} un`, `R$ ${item.valor_venda.toFixed(2)}`, `R$ ${item.subtotal.toFixed(2)}`]);
      autoTable(doc, { startY: 95, head: [['Item Retornado', 'Qtd', 'Valor Unitario', 'Total Estornado']], body: linhas, theme: 'grid', headStyles: { fillColor: [0, 0, 0], fontSize: 10 }, bodyStyles: { fontSize: 11, fontStyle: 'bold' }, didDrawPage: function (data) { doc.setGState(new doc.GState({ opacity: 0.05 })); doc.addImage(img, 'PNG', 35, 110, 140, 120); doc.setGState(new doc.GState({ opacity: 1 })); } });
      const finalY = doc.lastAutoTable.finalY; doc.setFontSize(16); doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "bold"); doc.text(`TOTAL ESTORNADO: R$ ${total.toFixed(2)}`, 14, finalY + 15);
      doc.save(`Devolucao_VD${numeroVendaRef}_${Date.now()}.pdf`);
    };
  };

  const emitirNfeSaida = (e) => {
    e.preventDefault(); const vendaId = document.getElementById('nf-venda-ref').value; if (!vendaId) return toast.error("Selecione uma venda na lista para gerar o recibo."); const vendaRef = historicoVendas.find(v => v.id === vendaId);
    if (!vendaRef) return toast.error("Venda nao encontrada no historico.");
    try {
      const img = new Image(); img.src = logoAtlas; img.onload = () => {
        const doc = new jsPDF(); doc.setFontSize(22); doc.setFont("helvetica", "bold"); doc.setTextColor(0, 0, 0); doc.text("ATLAS", 14, 20); const espacoAtlas = doc.getTextWidth("ATLAS "); doc.setTextColor(156, 163, 175); doc.text("ERP", 14 + espacoAtlas, 20); doc.setFontSize(9); doc.setTextColor(100, 116, 139); doc.setFont("helvetica", "normal"); doc.text(`CNPJ: 00.000.000/0001-00 | Inscricao Estadual: 123.456.789.000`, 14, 26); doc.text(`Endereco: Avenida da Inovacao, 1000 - Sao Paulo, SP`, 14, 31); doc.text(`Contato: (11) 4000-0000 | atendimento@atlas-erp.com.br`, 14, 36); doc.setDrawColor(226, 232, 240); doc.line(14, 42, 196, 42); doc.setFontSize(14); doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "bold"); doc.text(`RECIBO DE VENDA - DOCUMENTO AUXILIAR`, 14, 52); doc.setFontSize(10); doc.setTextColor(71, 85, 105); doc.setFont("helvetica", "normal"); doc.text(`Numero da Venda: VD-${String(vendaRef.numero_venda || 0).padStart(4, '0')}`, 14, 58); doc.text(`Data de Emissao: ${new Date(vendaRef.created_at).toLocaleString('pt-BR')}`, 14, 63); doc.setFillColor(248, 250, 252); doc.rect(14, 68, 182, 25, 'F'); doc.setFontSize(11); doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "bold"); doc.text(`DADOS DO COMPRADOR`, 18, 75);
        const dadosCliente = vendaRef.cliente.split('|'); doc.setFontSize(10); doc.setTextColor(71, 85, 105); doc.setFont("helvetica", "normal"); doc.text(`Nome/Razao Social: ${dadosCliente[0]?.trim() || 'Consumidor Final'}`, 18, 81); doc.text(`Doc: ${dadosCliente[1]?.replace('Doc:', '').trim() || 'Nao informado'}`, 18, 87); doc.text(`Telefone: ${dadosCliente[2]?.replace('Tel:', '').trim() || 'Nao informado'}`, 110, 87);
        autoTable(doc, { startY: 100, head: [['Descricao do Item', 'Quantidade', 'Valor Unitario', 'Subtotal']], body: [[vendaRef.produto_nome, `${vendaRef.quantidade} un`, `R$ ${Number(vendaRef.valor_unitario).toFixed(2)}`, `R$ ${Number(vendaRef.valor_total).toFixed(2)}`]], theme: 'grid', headStyles: { fillColor: [0, 0, 0], fontSize: 10 }, bodyStyles: { fontSize: 11, fontStyle: 'bold' } });
        const finalY = doc.lastAutoTable.finalY; doc.setFontSize(16); doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "bold"); doc.text(`TOTAL PAGO: R$ ${Number(vendaRef.valor_total).toFixed(2)}`, 14, finalY + 15); doc.save(`Recibo_VD${String(vendaRef.numero_venda || 0).padStart(4, '0')}.pdf`); toast.success("Recibo gerado com sucesso!");
      };
    } catch (err) { toast.error("Erro ao montar o Recibo."); }
  };

  const registrarRequisicaoInterna = async (e) => { e.preventDefault(); const tipo = document.getElementById('req-tipo').value; const justificativa = document.getElementById('req-justificativa').value; if (!tipo || !justificativa) return toast.error("Tipo e Justificativa sao obrigatorios."); const protocolo = `REQ-${Math.floor(1000 + Math.random() * 9000)}`; await supabase.from('requisicoes_internas').insert([{ protocolo, requisitante: usuarioAtual, tipo, justificativa, status: 'Pendente' }]); toast.success(`Requisicao ${protocolo} enviada.`); buscarRequisicoesReal(); document.getElementById('req-justificativa').value = ''; setTelaAtiva('painel-de-requisicoes'); };
  const visualizarPDFRequisicao = (req) => { const img = new Image(); img.src = logoAtlas; img.onload = () => { const doc = new jsPDF(); doc.setFontSize(22); doc.setFont("helvetica", "bold"); doc.setTextColor(0, 0, 0); doc.text("ATLAS", 14, 20); const espacoAtlas = doc.getTextWidth("ATLAS "); doc.setTextColor(156, 163, 175); doc.text("ERP", 14 + espacoAtlas, 20); doc.setFontSize(16); doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "bold"); doc.text(`DOCUMENTO DE REQUISICAO INTERNA`, 14, 40); doc.setFontSize(11); doc.setTextColor(71, 85, 105); doc.setFont("helvetica", "normal"); doc.text(`Protocolo: ${req.protocolo}`, 14, 50); doc.text(`Data da Solicitacao: ${new Date(req.created_at).toLocaleString('pt-BR')}`, 14, 57); doc.text(`Funcionario Solicitante: ${req.requisitante}`, 14, 64); doc.text(`Status Atual: ${req.status}`, 14, 71); doc.setFillColor(248, 250, 252); doc.rect(14, 78, 182, 10, 'F'); doc.setFontSize(12); doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "bold"); doc.text(`DETALHES DA SOLICITACAO`, 18, 85); doc.setFontSize(11); doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "bold"); doc.text(`Natureza / Tipo:`, 14, 100); doc.setFont("helvetica", "normal"); doc.text(req.tipo, 14, 107); doc.setFont("helvetica", "bold"); doc.text(`Justificativa / Descricao do Pedido:`, 14, 120); doc.setFont("helvetica", "normal"); const linhasJustificativa = doc.splitTextToSize(req.justificativa, 180); doc.text(linhasJustificativa, 14, 127); doc.setGState(new doc.GState({ opacity: 0.05 })); doc.addImage(img, 'PNG', 35, 100, 140, 120); doc.setGState(new doc.GState({ opacity: 1 })); doc.save(`Requisicao_${req.protocolo}.pdf`); toast.info("Documento PDF baixado."); }; };
  const atualizarStatusRequisicao = async (id, novoStatus) => { await supabase.from('requisicoes_internas').update({ status: novoStatus }).eq('id', id); buscarRequisicoesReal(); toast.success(`Status da Requisicao: ${novoStatus}`); };
  const salvarFornecedor = async () => { const razao = document.getElementById('razao-forn').value; const cnpj = document.getElementById('cnpj-forn').value; if (!razao || !cnpj) return toast.error("Razao Social e CNPJ obrigatorios."); const { data } = await supabase.from('fornecedores').insert([{ razao, cnpj, email: document.getElementById('email-forn').value, telefone: document.getElementById('telefone-forn')?.value || '', status: 'Ativo' }]).select(); setListaFornecedores([...listaFornecedores, data[0]]); toast.success("Fornecedor cadastrado."); setTelaAtiva('fornecedores'); };
  const gerarSolicitacaoCompra = async (item) => { const qtdSolicitada = prompt(`Informe a quantidade para cotacao: ${item.nome}`, "1"); if (qtdSolicitada && !isNaN(qtdSolicitada)) { await supabase.from('cotacoes').insert([{ produto: item.nome, qtd: Number(qtdSolicitada), fornBase: item.fornecedor_padrao || '', vlrA: item.custo_base || 0, vlrB: 0, vlrC: 0 }]); buscarCotacoesReal(); toast.info(`Enviado para Painel de Cotacoes.`); } };
  const atualizarCotacaoState = (id, campo, valor) => { setSolicitacoesCotacao(solicitacoesCotacao.map(cot => cot.id === id ? { ...cot, [campo]: campo === 'fornBase' ? valor : Number(valor) } : cot)); };
  const salvarCotacaoBD = async (cotacao) => { await supabase.from('cotacoes').update({ fornBase: cotacao.fornBase, vlrA: cotacao.vlrA, vlrB: cotacao.vlrB, vlrC: cotacao.vlrC }).eq('id', cotacao.id); };
  const converterCotacaoEmPedido = async (cotacao) => { const valores = [{ forn: cotacao.fornBase || 'Base', vlr: cotacao.vlrA }, { forn: 'Opcao B', vlr: cotacao.vlrB }, { forn: 'Opcao C', vlr: cotacao.vlrC }].filter(v => v.vlr > 0); if (valores.length === 0) return toast.error("Registre um valor financeiro."); const vencedor = valores.reduce((prev, curr) => (curr.vlr < prev.vlr ? curr : prev)); await supabase.from('pedidos_compra').insert([{ protocolo: `PED-${Math.floor(1000 + Math.random() * 9000)}`, fornecedor: vencedor.forn, produto: cotacao.produto || cotacao.nome_temp, qtd: cotacao.qtd, unitario: vencedor.vlr, subtotal: cotacao.qtd * vencedor.vlr, data: new Date().toISOString().split('T')[0] }]); if (!cotacao.isManual) { await supabase.from('cotacoes').delete().eq('id', cotacao.id); buscarCotacoesReal(); } buscarPedidosReal(); toast.success(`Pedido de compra aprovado.`); setTelaAtiva('pedidos'); };

  const criarEBaixarExcelEstilizado = async (dados, colunasDef, nomeArquivo, nomePlanilha = "Relatorio") => { try { const workbook = new ExcelJS.Workbook(); const worksheet = workbook.addWorksheet(nomePlanilha); worksheet.columns = colunasDef; dados.forEach(d => worksheet.addRow(d)); worksheet.getRow(1).eachCell((cell) => { cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } }; cell.alignment = { vertical: 'middle', horizontal: 'center' }; }); const buffer = await workbook.xlsx.writeBuffer(); saveAs(new Blob([buffer]), `${nomeArquivo}_${Date.now()}.xlsx`); toast.success(`Planilha Excel baixada!`); } catch (e) { toast.error("Erro ao gerar o Excel."); } };
  
  const exportarExcelEstoqueCompleto = () => { const colunas = [{ header: 'Codigo SKU', key: 'sku', width: 15 }, { header: 'Produto (Descricao)', key: 'nome', width: 40 }, { header: 'Categoria', key: 'cat', width: 20 }, { header: 'NCM Fisco', key: 'ncm', width: 15 }, { header: 'Cod. Barras (EAN)', key: 'ean', width: 20 }, { header: 'Saldo Fisico', key: 'qtd', width: 15 }, { header: 'Preco Custo (R$)', key: 'custo', width: 18 }, { header: 'Preco Venda (R$)', key: 'venda', width: 18 }]; const dados = estoque.map(i => ({ sku: i.sku, nome: i.nome, cat: i.categoria || '-', ncm: i.ncm || '-', ean: i.codigo_barra || '-', qtd: i.quantidade, custo: Number(i.custo_base || 0).toFixed(2), venda: Number(i.valor_venda || 0).toFixed(2) })); criarEBaixarExcelEstilizado(dados, colunas, "Atlas_Estoque_Geral", "Produtos"); };
  const exportarExcelMargemLucro = () => { const colunas = [{ header: 'SKU', key: 'sku', width: 15 }, { header: 'Produto', key: 'nome', width: 40 }, { header: 'Custo Base (R$)', key: 'custo', width: 18 }, { header: 'Venda Final (R$)', key: 'venda', width: 18 }, { header: 'ICMS SP (18%)', key: 'icms', width: 18 }, { header: 'IPI Recolhido', key: 'ipi', width: 18 }, { header: 'Lucro Liquido (R$)', key: 'lucro', width: 20 }, { header: 'Margem (%)', key: 'margem', width: 15 }]; const dados = estoque.filter(i => i.quantidade > 0).map(i => { const venda = Number(i.valor_venda || 0); const custo = Number(i.custo_base || 0); const ipi = Number(i.ipi || 0); const icms = venda * 0.18; const valorIpi = venda * (ipi / 100); const lucroLiquido = venda - custo - icms - valorIpi; const margemPercentual = venda > 0 ? (lucroLiquido / venda) * 100 : 0; return { sku: i.sku, nome: i.nome, custo: custo.toFixed(2), venda: venda.toFixed(2), icms: icms.toFixed(2), ipi: valorIpi.toFixed(2), lucro: lucroLiquido.toFixed(2), margem: margemPercentual.toFixed(2) + '%' }; }); criarEBaixarExcelEstilizado(dados, colunas, "Atlas_Analise_Margem", "Margens Fiscais"); };
  
  const exportarExcelSemGiro = () => {
    if (!dataInicioEncalhado || !dataFimEncalhado) return toast.warn("Selecione a Data Inicial e Final primeiro.");
    const start = new Date(dataInicioEncalhado).getTime();
    const end = new Date(dataFimEncalhado).getTime() + 86400000;

    const vendasPeriodo = historicoVendas.filter(v => {
      const tempoVenda = new Date(v.created_at).getTime();
      return tempoVenda >= start && tempoVenda <= end;
    });

    const idsVendidos = vendasPeriodo.map(v => v.produto_id);
    const semGiro = estoque.filter(i => !idsVendidos.includes(i.id) && i.quantidade > 0);

    if (semGiro.length === 0) return toast.info("Ótimo! Nenhum produto sem giro neste período.");

    const colunas = [
      { header: 'SKU', key: 'sku', width: 15 },
      { header: 'Produto', key: 'nome', width: 40 },
      { header: 'Saldo Parado', key: 'qtd', width: 18 },
      { header: 'Capital Imobilizado (R$)', key: 'capital', width: 25 }
    ];

    const dados = semGiro.map(i => ({
      sku: i.sku, nome: i.nome, qtd: i.quantidade, capital: (i.quantidade * Number(i.custo_base || 0)).toFixed(2)
    }));

    criarEBaixarExcelEstilizado(dados, colunas, "Atlas_Estoque_Sem_Giro", "Produtos Inativos");
  };

  const gerarRelatorioPDF = (titulo, colunas, linhas) => { const img = new Image(); img.src = logoAtlas; img.onload = () => { const doc = new jsPDF(); doc.setFontSize(22); doc.setFont("helvetica", "bold"); doc.setTextColor(0, 0, 0); doc.text("ATLAS", 14, 20); const espacoAtlas = doc.getTextWidth("ATLAS "); doc.setTextColor(156, 163, 175); doc.text("ERP", 14 + espacoAtlas, 20); doc.setFontSize(9); doc.setTextColor(100, 116, 139); doc.setFont("helvetica", "normal"); doc.text(`CNPJ: 00.000.000/0001-00 | Inscricao Estadual: 123.456.789.000`, 14, 26); doc.text(`Endereco: Avenida da Inovacao, 1000 - Sao Paulo, SP`, 14, 31); doc.text(`Contato: (11) 4000-0000 | atendimento@atlas-erp.com.br`, 14, 36); doc.setDrawColor(226, 232, 240); doc.line(14, 42, 196, 42); doc.setFontSize(14); doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "bold"); doc.text(`RELATORIO GERENCIAL: ${titulo.replace(/_/g, ' ').toUpperCase()}`, 14, 52); doc.setFontSize(10); doc.setTextColor(71, 85, 105); doc.setFont("helvetica", "normal"); doc.text(`Data de Emissao: ${new Date().toLocaleString('pt-BR')}`, 14, 58); doc.text(`Emitido por: ${usuarioAtual || 'Sistema'}`, 14, 63); autoTable(doc, { startY: 70, head: [colunas], body: linhas, theme: 'grid', headStyles: { fillColor: [0, 0, 0] }, didDrawPage: function (data) { doc.setGState(new doc.GState({ opacity: 0.08 })); doc.addImage(img, 'PNG', 35, 90, 140, 120); doc.setGState(new doc.GState({ opacity: 1 })); } }); const alturaPagina = doc.internal.pageSize.getHeight(); doc.setFontSize(11); doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "italic"); doc.text(`Documento gerado automaticamente pelo Atlas ERP.`, doc.internal.pageSize.getWidth() / 2, alturaPagina - 15, { align: "center" }); doc.save(`ATLAS_${titulo}_${Date.now()}.pdf`); toast.success(`Relatorio baixado!`); }; };
  const acionarRelatorioEstoque = () => { gerarRelatorioPDF('Posicao_de_Estoque', ['SKU', 'Produto', 'Cat', 'Qtd', 'Custo R$', 'Venda R$'], estoque.map(i => [i.sku, i.nome, i.categoria || '-', `${i.quantidade}`, Number(i.custo_base).toFixed(2), Number(i.valor_venda).toFixed(2)])); };
  const acionarRelatorioVendas = () => { gerarRelatorioPDF('Historico_de_Vendas', ['Data', 'Cliente', 'Produto', 'Qtd', 'Faturamento'], historicoVendas.map(v => [new Date(v.created_at).toLocaleDateString(), v.cliente.split('|')[0], v.produto_nome, v.quantidade, `R$ ${Number(v.valor_total).toFixed(2)}`])); };
  const acionarRelatorioEntradas = () => { gerarRelatorioPDF('Notas_de_Entrada', ['Data', 'Fornecedor', 'CNPJ', 'Valor'], notasFiscais.map(n => [new Date(n.created_at).toLocaleDateString(), n.fornecedor, n.cnpj || '-', `R$ ${Number(n.valor_total).toFixed(2)}`])); };
  const acionarRelatorioDevolucoes = () => { gerarRelatorioPDF('Historico_de_Devolucoes', ['Data', 'Cliente', 'Produto', 'Qtd', 'Estornado'], listaDevolucoes.map(d => [new Date(d.created_at).toLocaleDateString(), d.cliente, d.produto_nome, d.quantidade, `R$ ${Number(d.valor_estornado).toFixed(2)}`])); };

  // ==========================================
  // GESTÃO DE PROMOÇÕES
  // ==========================================
  const ativarPromocao = async () => {
    const idItem = document.getElementById('sel-promo-item').value;
    const valorPromo = Number(document.getElementById('valor-promo').value);

    if (!idItem || valorPromo <= 0) return toast.warn("Selecione um item e digite um valor válido.");
    
    const item = estoque.find(i => i.id === idItem);
    if (valorPromo >= item.valor_venda) return toast.error("O valor promocional deve ser MENOR que o valor de venda atual!");

    const { error } = await supabase.from('estoque').update({ valor_promocional: valorPromo }).eq('id', idItem);
    
    if (!error) {
      toast.success(`Promoção ativada para: ${item.nome}`);
      buscarEstoqueReal();
      document.getElementById('valor-promo').value = '';
      document.getElementById('sel-promo-item').value = '';
    } else {
      toast.error("Erro ao salvar promoção.");
    }
  };

  const encerrarPromocao = async (idItem) => {
    const { error } = await supabase.from('estoque').update({ valor_promocional: 0 }).eq('id', idItem);
    if (!error) {
      toast.info("Promoção encerrada. O produto voltou ao preço normal.");
      buscarEstoqueReal();
    }
  };

  const cadastrarNovoUsuario = async (e) => {
    e.preventDefault();
    const nome = document.getElementById('cad-user-nome').value;
    const login = document.getElementById('cad-user-login').value;
    const senha = document.getElementById('cad-user-senha').value;
    const role = document.getElementById('cad-user-role').value;
    if (!nome || !login || !senha) return toast.error("Preencha todos os campos.");
    const { error } = await supabase.from('usuarios').insert([{ nome, login, senha, role }]);
    if (error) { toast.error("Erro ao criar usuario."); } else {
      toast.success("Usuario criado com sucesso!");
      document.getElementById('cad-user-nome').value = ''; document.getElementById('cad-user-login').value = ''; document.getElementById('cad-user-senha').value = '';
      buscarUsuariosReal();
    }
  };

  const renderizarConteudo = () => {
    switch (telaAtiva) {
      case 'inicio':
        return (<div className="tela-centralizada"><img src={logoAtlas} alt="Atlas ERP" className="logo-inicio" /><div className="texto-sessao">Sessao Ativa: {usuarioAtual} ({usuarioRole})</div></div>);
      case 'dashboard':
        return (usuarioRole === 'gerente' || usuarioRole === 'admin') ? <Dashboard estoque={estoque} historicoVendas={historicoVendas} historicoDespesas={historicoDespesas} /> : <TelaBloqueada />;
      case 'receitas-e-despesas':
        return (usuarioRole === 'gerente' || usuarioRole === 'admin') ? <ExtratoFinanceiro historicoVendas={historicoVendas} historicoDespesas={historicoDespesas} /> : <TelaBloqueada />;
      case 'detalhes-de-vendas':
        return (usuarioRole === 'gerente' || usuarioRole === 'admin') ? <RelatorioVendas historicoVendas={historicoVendas} vendaExpandidaId={vendaExpandidaId} setVendaExpandidaId={setVendaExpandidaId} /> : <TelaBloqueada />;
      case 'painel-de-requisicoes':
        return <PainelRequisicoes listaRequisicoes={listaRequisicoes} usuarioRole={usuarioRole} atualizarStatusRequisicao={atualizarStatusRequisicao} visualizarPDFRequisicao={visualizarPDFRequisicao} />;
      case 'emissao-de-nf':
        return <EmissaoRecibo historicoVendas={historicoVendas} emitirNfeSaida={emitirNfeSaida} />;
      case 'cadastro-de-item':
        return <CadastroItem
          estoque={estoque}
          salvarCadastroItem={salvarCadastroItem}
          itensPendentes={itensPendentesEntrada}
          carregarItemPendente={prepararAceite}
          excluirItemPendente={cancelarPendencia}
        />;

      case 'promocoes':
        if (usuarioRole === 'caixa') return <TelaBloqueada />;
        const itensEmPromocao = estoque.filter(i => i.valor_promocional > 0);
        return (
          <div className="atlas-container">
            <header className="atlas-header">
              <div>
                <h1>Gestão de Promoções</h1>
                <p>Crie ofertas temporárias para acelerar o giro do estoque</p>
              </div>
            </header>

            <div className="atlas-grid grid-start">
              {/* CARD DE NOVA PROMOÇÃO */}
              <div className="atlas-card">
                <div className="card-titulo">Ativar Nova Oferta</div>
                <div className="coluna-flex">
                  <div className="atlas-campo">
                    <label>Selecione o Produto (Digite para buscar)</label>
                    <input type="text" id="sel-promo-item" list="lista-estoque-promo" className="input-tabela" placeholder="SKU ou Nome..." />
                    <datalist id="lista-estoque-promo">
                      {estoque.filter(i => i.quantidade > 0 && (!i.valor_promocional || i.valor_promocional === 0)).map(i => (
                        <option key={i.id} value={i.id}>{i.sku} - {i.nome} (R$ {Number(i.valor_venda).toFixed(2)})</option>
                      ))}
                    </datalist>
                  </div>
                  <div className="atlas-campo mt-10">
                    <label>Novo Preço Promocional (R$)</label>
                    <input type="number" id="valor-promo" className="input-tabela input-destaque-centro" placeholder="0.00" step="0.01" />
                  </div>
                  <button className="botao-primario w-100 mt-20 btn-gigante" onClick={ativarPromocao} style={{ backgroundColor: '#e11d48' }}>
                    🔥 Disparar Promoção
                  </button>
                </div>
              </div>

              {/* TABELA DE OFERTAS ATIVAS */}
              <div className="atlas-card">
                <div className="card-titulo" style={{ color: '#e11d48' }}>Promoções Rodando Agora</div>
                <table className="atlas-tabela">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>De (Original)</th>
                      <th>Por (Promoção)</th>
                      <th>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itensEmPromocao.map(item => (
                      <tr key={item.id}>
                        <td><strong>{item.nome}</strong></td>
                        <td style={{ textDecoration: 'line-through', color: '#94a3b8' }}>R$ {Number(item.valor_venda).toFixed(2)}</td>
                        <td style={{ fontWeight: 'bold', color: '#e11d48', fontSize: '15px' }}>R$ {Number(item.valor_promocional).toFixed(2)}</td>
                        <td>
                          <button className="botao-secundario font-12" onClick={() => encerrarPromocao(item.id)}>
                            Encerrar
                          </button>
                        </td>
                      </tr>
                    ))}
                    {itensEmPromocao.length === 0 && (
                      <tr><td colSpan="4" className="texto-cinza-vazio">Nenhuma promoção ativa no momento.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'vendas':
        return <FrenteCaixa estoque={estoque} registrarVenda={registrarVenda} maskCNPJ={maskCNPJ} maskCPF={maskCPF} maskTelefone={maskTelefone} caixaAtivo={caixaAtivo} />;
      case 'devolucoes':
        return (usuarioRole === 'gerente' || usuarioRole === 'admin') ? <Devolucoes estoque={estoque} registrarDevolucao={registrarDevolucao} gerarReciboDevolucaoPDF={gerarReciboDevolucaoPDF} maskCNPJ={maskCNPJ} maskCPF={maskCPF} maskTelefone={maskTelefone} historicoVendas={historicoVendas} listaDevolucoes={listaDevolucoes} /> : <TelaBloqueada />;
      case 'controle-de-caixa':
        return <ControleCaixa caixaAtivo={caixaAtivo} abrirCaixa={abrirCaixa} fecharCaixa={fecharCaixa} historicoVendas={historicoVendas} usuarioAtual={usuarioAtual} />;
      case 'historico-de-caixa':
        if (usuarioRole === 'caixa') return <TelaBloqueada />;
        return (
          <div className="atlas-container">
            <header className="atlas-header">
              <div><h1>Auditoria de Caixa</h1><p>Acompanhamento de aberturas, fechamentos e quebras</p></div>
            </header>
            <div className="atlas-card full">
              <table className="atlas-tabela">
                <thead>
                  <tr>
                    <th>Abertura</th>
                    <th>Operador</th>
                    <th>Fundo Inicial</th>
                    <th>Venda Sist.</th>
                    <th>Contagem Fisica</th>
                    <th>Diferenca</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {historicoCaixa.map(c => {
                    const diff = (c.valor_final_fisico || 0) - (c.valor_final_sistema || 0);
                    return (
                      <tr key={c.id}>
                        <td>{new Date(c.data_abertura).toLocaleString('pt-BR')}</td>
                        <td>{c.usuario_abertura}</td>
                        <td>R$ {Number(c.valor_inicial).toFixed(2)}</td>
                        <td>{c.status === 'fechado' ? `R$ ${Number(c.valor_final_sistema).toFixed(2)}` : '-'}</td>
                        <td>{c.status === 'fechado' ? `R$ ${Number(c.valor_final_fisico).toFixed(2)}` : '-'}</td>
                        <td style={{ color: c.status === 'fechado' ? (diff < 0 ? '#e11d48' : diff > 0 ? '#16a34a' : '#475569') : 'inherit', fontWeight: 'bold' }}>
                          {c.status === 'fechado' ? `R$ ${diff.toFixed(2)}` : '-'}
                        </td>
                        <td>
                          <span className={`status-badge ${c.status === 'aberto' ? 'status-verde' : 'status-alerta'}`}>
                            {c.status ? c.status.toUpperCase() : 'DESCONHECIDO'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'posicao-de-estoque':
        if (usuarioRole === 'caixa') return <TelaBloqueada />;
        return (
          <div className="atlas-container">
            <header className="atlas-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><h1>Posicao de Estoque</h1><p>Visualizacao do saldo atual de mercadorias</p></div>
              <button className="botao-primario btn-bg-black" onClick={acionarRelatorioEstoque}>Exportar PDF</button>
            </header>
            <div className="atlas-card full">
              <table className="atlas-tabela">
                <thead><tr><th>SKU</th><th>Produto</th><th>Categoria</th><th>Qtd</th><th>Custo R$</th><th>Venda R$</th></tr></thead>
                <tbody>
                  {estoque.map(i => (
                    <tr key={i.id}><td>{i.sku}</td><td>{i.nome}</td><td>{i.categoria || '-'}</td><td style={{ fontWeight: 'bold' }}>{i.quantidade}</td><td>{Number(i.custo_base).toFixed(2)}</td><td>{Number(i.valor_venda).toFixed(2)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'historico-de-vendas':
        if (usuarioRole === 'caixa') return <TelaBloqueada />;
        return (
          <div className="atlas-container">
            <header className="atlas-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><h1>Historico de Vendas</h1><p>Todas as saidas faturadas no sistema</p></div>
              <button className="botao-primario btn-bg-black" onClick={acionarRelatorioVendas}>Exportar PDF</button>
            </header>
            <div className="atlas-card full">
              <table className="atlas-tabela">
                <thead><tr><th>Data</th><th>Cliente</th><th>Produto</th><th>Qtd</th><th>Total R$</th></tr></thead>
                <tbody>
                  {historicoVendas.map(v => (
                    <tr key={v.id}><td>{new Date(v.created_at).toLocaleDateString()}</td><td>{v.cliente.split('|')[0]}</td><td>{v.produto_nome}</td><td>{v.quantidade}</td><td style={{ fontWeight: 'bold', color: '#16a34a' }}>{Number(v.valor_total).toFixed(2)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'notas-de-entrada':
        if (usuarioRole === 'caixa') return <TelaBloqueada />;
        return (
          <div className="atlas-container">
            <header className="atlas-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><h1>Notas de Entrada</h1><p>Registro de notas de compras e reposicoes</p></div>
              <button className="botao-primario btn-bg-black" onClick={acionarRelatorioEntradas}>Exportar PDF</button>
            </header>
            <div className="atlas-card full">
              <table className="atlas-tabela">
                <thead><tr><th>Data</th><th>Fornecedor</th><th>CNPJ</th><th>Valor R$</th></tr></thead>
                <tbody>
                  {notasFiscais.map(n => (
                    <tr key={n.id}><td>{new Date(n.created_at).toLocaleDateString()}</td><td>{n.fornecedor}</td><td>{n.cnpj || '-'}</td><td style={{ fontWeight: 'bold' }}>{Number(n.valor_total).toFixed(2)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'historico-de-devolucoes':
        if (usuarioRole === 'caixa') return <TelaBloqueada />;
        return (
          <div className="atlas-container">
            <header className="atlas-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><h1>Historico de Devolucoes</h1><p>Registro de estornos e retornos de mercadorias</p></div>
              <button className="botao-primario btn-bg-black" onClick={acionarRelatorioDevolucoes}>Exportar PDF</button>
            </header>
            <div className="atlas-card full">
              <table className="atlas-tabela">
                <thead><tr><th>Data</th><th>Cliente</th><th>Produto</th><th>Motivo</th><th>Qtd</th><th>Estornado R$</th></tr></thead>
                <tbody>
                  {listaDevolucoes.map(d => (
                    <tr key={d.id}><td>{new Date(d.created_at).toLocaleDateString()}</td><td>{d.cliente.split('|')[0]}</td><td>{d.produto_nome}</td><td>{d.motivo}</td><td>{d.quantidade}</td><td style={{ fontWeight: 'bold', color: '#e11d48' }}>{Number(d.valor_estornado).toFixed(2)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'exportacoes-e-bi':
        if (usuarioRole === 'caixa') return <TelaBloqueada />;
        return (
          <div className="atlas-container">
            <header className="atlas-header">
              <div><h1>Central de Inteligencia e BI</h1><p>Exportacao de planilhas customizadas de alta performance</p></div>
            </header>
            <div className="atlas-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className="atlas-card card-centro">
                <h3>Todos os Produtos</h3><p className="texto-cinza font-12 mt-10">Lista completa com EAN, NCM, Saldo fisico e valores Base.</p>
                <button className="botao-secundario w-100 mt-20" onClick={exportarExcelEstoqueCompleto}>Baixar Excel</button>
              </div>
              <div className="atlas-card card-centro">
                <h3>Margem de Lucro (Base SP)</h3><p className="texto-cinza font-12 mt-10">Calculo de Lucro Liquido abatendo ICMS padrao (18%) e IPI.</p>
                <button className="botao-secundario w-100 mt-20" onClick={exportarExcelMargemLucro}>Baixar Excel</button>
              </div>
              <div className="atlas-card card-centro">
                <h3>Estoque Sem Giro</h3>
                <p className="texto-cinza font-12 mt-10">Descubra o capital imobilizado que não teve vendas no período.</p>
                <div style={{ display: 'flex', gap: '5px', marginTop: '15px' }}>
                  <input type="date" className="input-tabela" value={dataInicioEncalhado || ''} onChange={e => setDataInicioEncalhado(e.target.value)} title="Data Inicial" />
                  <input type="date" className="input-tabela" value={dataFimEncalhado || ''} onChange={e => setDataFimEncalhado(e.target.value)} title="Data Final" />
                </div>
                <button className="botao-secundario w-100 mt-10" onClick={exportarExcelSemGiro}>Baixar Excel</button>
              </div>
            </div>
          </div>
        );

      case 'gerenciar-usuarios':
        if (usuarioRole !== 'admin') return <TelaBloqueada />;
        return (
          <div className="atlas-container">
            <header className="atlas-header"><div><h1>Gestao de Usuarios</h1></div></header>
            <div className="atlas-grid grid-start">
              <div className="atlas-card">
                <div className="card-titulo">Novo Usuario</div>
                <div className="coluna-flex">
                  <div className="atlas-campo"><label>Nome Completo</label><input type="text" id="cad-user-nome" /></div>
                  <div className="atlas-campo"><label>Login de Acesso</label><input type="text" id="cad-user-login" /></div>
                  <div className="atlas-campo"><label>Senha Provisoria</label><input type="password" id="cad-user-senha" placeholder="Defina uma senha" /></div>
                  <div className="atlas-campo">
                    <label>Nivel de Acesso</label>
                    <select id="cad-user-role">
                      <option value="caixa">Operador de Caixa (Limitado)</option>
                      <option value="gerente">Gerente de Loja (Operacional)</option>
                      <option value="admin">Administrador (Acesso Total)</option>
                    </select>
                  </div>
                  <button className="botao-primario w-100 mt-15" onClick={cadastrarNovoUsuario}>Criar Credencial</button>
                </div>
              </div>
              <div className="atlas-card">
                <div className="card-titulo">Equipe Cadastrada</div>
                <table className="atlas-tabela">
                  <thead><tr><th>Nome</th><th>Login</th><th>Acesso</th></tr></thead>
                  <tbody>{listaUsuarios.map(u => (<tr key={u.id}><td><strong>{u.nome}</strong></td><td>{u.login}</td><td style={{ textTransform: 'capitalize' }}>{u.role}</td></tr>))}</tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'nova-requisicao':
        return (
          <div className="atlas-container">
            <header className="atlas-header"><div><h1>Solicitar Requisicao Interna</h1></div></header>
            <div className="atlas-card centralizado-800">
              <div className="atlas-linha">
                <div className="atlas-campo flex-2"><label>Natureza do Chamado</label><select id="req-tipo"><option value="Compra Insumos (Loja)">Compra de Insumos</option><option value="Manutencao de Equipamento">Manutencao</option><option value="Ajuste de Sistema">Ajuste de Sistema</option></select></div>
              </div>
              <div className="atlas-linha mt-15"><div className="atlas-campo w-100"><label>Justificativa / Detalhes</label><textarea id="req-justificativa" className="input-tabela input-textarea" placeholder="Descreva o que voce precisa ou o que quebrou..."></textarea></div></div>
              <button className="botao-primario w-100 mt-20" onClick={registrarRequisicaoInterna}>Enviar Pedido para Gerencia</button>
            </div>
          </div>
        );

      case 'log-de-estoque':
        if (usuarioRole === 'caixa') return <TelaBloqueada />;
        return (
          <div className="atlas-container">
            <header className="atlas-header"><div><h1>Auditoria de Estoque</h1></div></header>
            <div className="atlas-card full">
              <table className="atlas-tabela">
                <thead><tr><th>Data</th><th>Produto</th><th>Natureza</th><th>Movimentacao</th></tr></thead>
                <tbody>{logEstoque.map(log => (<tr key={log.id}><td>{new Date(log.created_at).toLocaleString('pt-BR')}</td><td>{log.produto_nome}</td><td>{log.tipo_movimentacao}</td><td className={log.quantidade_alterada > 0 ? 'texto-verde-bold' : 'texto-vermelho-bold'}>{log.quantidade_alterada}</td></tr>))}</tbody>
              </table>
            </div>
          </div>
        );

      case 'entradas':
        return <Entradas setTelaAtiva={setTelaAtiva} confirmarEntradaComPendencia={confirmarEntradaComPendencia} maskCNPJ={maskCNPJ} maskTelefone={maskTelefone} manipularUpload={manipularUpload} imagemAnexada={imagemAnexada} setImagemAnexada={setImagemAnexada} linhasItens={linhasItens} atualizarValorLinha={atualizarValorLinha} removerLinha={removerLinha} adicionarLinha={adicionarLinha} listaFornecedores={listaFornecedores} />;

      case 'saidas':
        if (usuarioRole === 'caixa') return <TelaBloqueada />;
        return (
          <div className="atlas-container">
            <header className="atlas-header">
              <div>
                <h1>Saídas e Baixas Manuais</h1>
                <p>Registre retiradas de mercadoria que não passaram pelo PDV (Avarias, Consumo, etc.)</p>
              </div>
            </header>

            <div className="atlas-card full">
              <div className="card-titulo">Itens para Baixa</div>
              <table className="atlas-tabela">
                <thead>
                  <tr>
                    <th>Produto no Estoque</th>
                    <th style={{ width: '120px' }}>Qtd Baixa</th>
                    <th style={{ width: '250px' }}>Motivo Oficial da Saída</th>
                    <th style={{ textAlign: 'center', width: '80px' }}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {linhasItens.map(linha => (
                    <tr key={linha.id}>
                      <td>
                        <select className="input-tabela" value={linha.nome_temp || ''} onChange={(e) => atualizarValorLinha(linha.id, 'nome_temp', e.target.value)}>
                          <option value="">Selecione o produto...</option>
                          {estoque.filter(i => i.quantidade > 0).map(i => (
                            <option key={i.id} value={i.id}>{i.nome} (Saldo: {i.quantidade})</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input type="number" className="input-tabela" min="1" value={linha.qtd || ''} onChange={(e) => atualizarValorLinha(linha.id, 'qtd', e.target.value)} placeholder="0" />
                      </td>
                      <td>
                        <select className="input-tabela" value={linha.vlrA || ''} onChange={(e) => atualizarValorLinha(linha.id, 'vlrA', e.target.value)}>
                          <option value="">Selecione um motivo...</option>
                          <option value="Uso Interno">Uso Interno (Consumo da Loja)</option>
                          <option value="Avaria / Quebra">Avaria / Quebra</option>
                          <option value="Vencimento / Validade">Vencimento / Validade</option>
                          <option value="Perda / Furto">Perda / Furto</option>
                          <option value="Doação / Brinde">Doação / Brinde</option>
                          <option value="Ajuste de Contagem">Ajuste de Contagem (Balanço)</option>
                        </select>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button onClick={() => removerLinha(linha.id)} className="botao-link" style={{ color: '#e11d48', fontWeight: 'bold' }}>X</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                <button className="botao-secundario" onClick={adicionarLinha}>+ Adicionar Nova Linha</button>
                <button className="botao-primario btn-gigante" onClick={registrarSaidasAvulsas} style={{ width: '300px' }}>
                  Registrar Baixa Oficial
                </button>
              </div>
            </div>
          </div>
        );

      case 'sugestoes-de-compras':
        const itensEmAlerta = estoque.filter(i => i.quantidade <= (i.estoque_minimo || 5));
        return (
          <div className="atlas-container">
            <header className="atlas-header"><div><h1>Sugestoes de Reposicao</h1></div></header>
            <div className="atlas-card full">
              <table className="atlas-tabela">
                <thead><tr><th>Produto</th><th>Saldo Atual</th><th>Acao</th></tr></thead>
                <tbody>{itensEmAlerta.map(item => (<tr key={item.id}><td>{item.nome}</td><td style={{ fontWeight: 'bold' }}>{item.quantidade} un</td><td><button className="botao-secundario" onClick={() => gerarSolicitacaoCompra(item)}>Iniciar Cotacao</button></td></tr>))}</tbody>
              </table>
            </div>
          </div>
        );

      case 'consultar-itens':
        return <Inventario termoBusca={termoBusca} setTermoBusca={setTermoBusca} estoque={estoque} gerarSolicitacaoCompra={gerarSolicitacaoCompra} />;

      case 'categorias':
        return (
          <div className="atlas-container">
            <header className="atlas-header"><h1>Grupos e Categorias</h1></header>
            <div className="atlas-card full">
              <table className="atlas-tabela">
                <thead><tr><th>Classificacao</th><th>Volume de Itens</th></tr></thead>
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
                <thead>
                  <tr>
                    <th>Razao Social</th>
                    <th>CNPJ</th>
                    <th>E-mail</th>
                    <th>Telefone</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {listaFornecedores.map(f => (
                    <tr key={f.id}>
                      <td>{f.razao}</td>
                      <td>{f.cnpj}</td>
                      <td>{f.email || '-'}</td>
                      <td>{f.telefone || '-'}</td>
                      <td>{f.status || 'Ativo'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'cadastro-de-fornecedor':
        return (
          <div className="atlas-container">
            <header className="atlas-header"><h1>Inclusao de Fornecedor</h1></header>
            <div className="atlas-card full">
              <div className="atlas-linha"><div className="atlas-campo flex-2"><input type="text" id="razao-forn" placeholder="Razao" /></div><div className="atlas-campo"><input type="text" id="cnpj-forn" placeholder="CNPJ" onChange={(e) => e.target.value = maskCNPJ(e.target.value)} /></div></div>
              <button className="botao-primario mt-20" onClick={salvarFornecedor}>Confirmar</button>
            </div>
          </div>
        );

      case 'cotacoes':
        return (
          <div className="atlas-container">
            <header className="atlas-header"><div><h1>Cotacoes</h1></div></header>
            <div className="atlas-card full">
              <table className="atlas-tabela">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Qtd</th>
                    <th>Fornecedor Base</th>
                    <th>Opcao B</th>
                    <th>Opcao C</th>
                    <th>Acao</th>
                  </tr>
                </thead>
                <tbody>
                  {[...solicitacoesCotacao, ...linhasItens.map(l => ({ ...l, isManual: true }))].map(cot => (
                    <tr key={cot.id}>
                      <td>{cot.isManual ? <input type="text" className="input-tabela" onChange={(e) => atualizarValorLinha(cot.id, 'nome_temp', e.target.value)} /> : <strong>{cot.produto}</strong>}</td>
                      <td>{cot.isManual ? <input type="number" className="input-tabela" onChange={(e) => atualizarValorLinha(cot.id, 'qtd', e.target.value)} /> : cot.qtd}</td>
                      <td><input type="number" className="input-tabela" value={cot.vlrA || ''} onChange={(e) => cot.isManual ? atualizarValorLinha(cot.id, 'vlrA', e.target.value) : atualizarCotacaoState(cot.id, 'vlrA', e.target.value)} onBlur={() => !cot.isManual && salvarCotacaoBD(cot)} /></td>
                      <td><input type="number" className="input-tabela" value={cot.vlrB || ''} onChange={(e) => cot.isManual ? atualizarValorLinha(cot.id, 'vlrB', e.target.value) : atualizarCotacaoState(cot.id, 'vlrB', e.target.value)} onBlur={() => !cot.isManual && salvarCotacaoBD(cot)} /></td>
                      <td><input type="number" className="input-tabela" value={cot.vlrC || ''} onChange={(e) => cot.isManual ? atualizarValorLinha(cot.id, 'vlrC', e.target.value) : atualizarCotacaoState(cot.id, 'vlrC', e.target.value)} onBlur={() => !cot.isManual && salvarCotacaoBD(cot)} /></td>
                      <td>{cot.isManual ? <button onClick={() => removerLinha(cot.id)} className="botao-link">Excluir</button> : <button className="botao-primario font-12" onClick={() => converterCotacaoEmPedido(cot)}>Aprovar</button>}</td>
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
            <header className="atlas-header"><h1>Aquisicoes</h1></header>
            <div className="atlas-card full">
              <table className="atlas-tabela">
                <thead><tr><th>Doc</th><th>Fornecedor</th><th>Produto</th><th>Total</th></tr></thead>
                <tbody>{pedidosOficiais.map(ped => (<tr key={ped.id}><td>{ped.protocolo}</td><td>{ped.fornecedor}</td><td>{ped.produto}</td><td>R$ {ped.subtotal.toFixed(2)}</td></tr>))}</tbody>
              </table>
            </div>
          </div>
        );

      case 'ajustes':
        if (usuarioRole === 'caixa') return <TelaBloqueada />;
        return (
          <div className="atlas-container">
            <header className="atlas-header">
              <div>
                <h1>Ajuste Rápido de Saldo</h1>
                <p>Corrija furos de estoque localizando o produto rapidamente pelo SKU ou Nome</p>
              </div>
            </header>

            <div className="atlas-card centralizado-800">
              <div className="card-titulo">Manutenção de Inventário</div>

              <div className="atlas-linha">
                <div className="atlas-campo flex-2">
                  <label>Localizar Produto (Nome ou SKU)</label>
                  <input
                    type="text"
                    id="sel-ajuste"
                    list="lista-produtos-ajuste"
                    className="input-tabela input-destaque-centro"
                    placeholder="Digite para buscar..."
                  />
                  <datalist id="lista-produtos-ajuste">
                    {estoque.map(i => <option key={i.id} value={i.id}>{i.sku} - {i.nome} (Saldo: {i.quantidade})</option>)}
                  </datalist>
                  <span className="font-11 texto-cinza mt-5">Selecione o produto na lista usando a seta ou digitando.</span>
                </div>
              </div>

              <div className="atlas-linha mt-15">
                <div className="atlas-campo">
                  <label>Tipo de Movimento</label>
                  <select id="tipo-ajuste" className="input-tabela">
                    <option value="entrada">Crédito (+) Adicionar ao saldo</option>
                    <option value="saida">Débito (-) Remover do saldo</option>
                  </select>
                </div>
                <div className="atlas-campo">
                  <label>Quantidade do Ajuste</label>
                  <input type="number" id="qtd-ajuste" className="input-tabela input-destaque-centro" placeholder="0" min="1" />
                </div>
              </div>

              <button className="botao-primario w-100 mt-30 btn-gigante" onClick={realizarAjusteEstoque}>
                Confirmar Ajuste
              </button>
            </div>
          </div>
        );

      default:
        return <section><h2>Aguardando selecao...</h2></section>;
    }
  };

  if (!isLoggedIn) {
    return <Login realizarLogin={realizarLogin} inputUser={inputUser} setInputUser={setInputUser} inputPass={inputPass} setInputPass={setInputPass} />;
  }

  return (
    <div className="container-principal">
      <ToastContainer position="top-right" autoClose={2000} theme="colored" />
      <MenuNavegacao itensMenu={itensMenu} setTelaAtiva={setTelaAtiva} usuarioAtual={usuarioAtual} realizarLogoff={realizarLogoff} />

      {mostrarSidebar && (
        <div className="menu-lateral-esquerdo">
          {mostrarMenuEsquerdo && (
            <>
              <div className="titulo-menu-lateral">
                {categoriaAtual.nome}
              </div>
              {categoriaAtual.filhos.map(filho => {
                const slug = gerarSlug(filho);
                const isAtivo = telaAtiva === slug;
                return (
                  <button
                    key={slug}
                    onClick={() => setTelaAtiva(slug)}
                    className={`btn-menu-lateral ${isAtivo ? 'ativo' : ''}`}
                  >
                    {filho}
                  </button>
                );
              })}
              <div className="divisor-lateral"></div>
            </>
          )}

          <div className="titulo-menu-lateral">Meus Atalhos</div>
          {favoritos.map(fav => (
            <button
              key={fav}
              onClick={() => setTelaAtiva(fav)}
              className={`btn-menu-lateral ${telaAtiva === fav ? 'ativo' : ''}`}
              title={`Ir para ${nomesDasTelas[fav] || fav}`}
            >
              {nomesDasTelas[fav] || fav}
            </button>
          ))}

          <button
            onClick={gerenciarFavoritos}
            className={`btn-atalho-acao ${favoritos.includes(telaAtiva) ? 'remover' : ''}`}
            title={favoritos.includes(telaAtiva) ? "Remover tela atual dos atalhos" : "Fixar tela atual nos atalhos"}
          >
            {favoritos.includes(telaAtiva) ? 'Remover Favorito' : 'Salvar Favorito'}
          </button>
        </div>
      )}

      <main className={`conteudo-pagina ${mostrarSidebar ? 'com-sidebar' : 'sem-sidebar'}`}>
        {renderizarConteudo()}
      </main>
    </div>
  );
}
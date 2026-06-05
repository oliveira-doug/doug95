-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 2.5 — Cobrança via link (Mercado Pago)                                    ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
-- Mantemos os pagamentos manuais (pix/cartao/dinheiro recebidos na hora) E
-- adicionamos a cobrança remota por link. Um pagamento por link nasce como
-- 'link' + status 'pendente'; o webhook do MP confirma e ajusta o método real
-- (pix/cartao) quando o cliente paga.

-- Novo método: 'link' (cobrança online via gateway, método final definido no pago)
alter type pagamento_metodo add value if not exists 'link';

-- URL do checkout (init_point) para reenviar ao cliente quando preciso.
alter table pagamentos add column if not exists link_url text;

-- ref_gateway (já existente) guarda o id do pagamento no Mercado Pago após o pago.
comment on column pagamentos.link_url is 'init_point do Checkout Pro (link enviado ao cliente).';
comment on column pagamentos.ref_gateway is 'Id da cobrança/pagamento no gateway (Mercado Pago).';

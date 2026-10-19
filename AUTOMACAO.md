# Automação e proteção — versão 43

Abra **07 · Automação / IEDs** e habilite a disciplina no projeto. O módulo usa os circuitos instalados, inclusive reservas operacionais N+1/2N, entradas, acoplamentos e transformadores da cadeia elétrica. O escopo permanece desabilitado em arquivos antigos até a seleção do usuário. As configurações são salvas no perfil do projeto, no armazenamento já existente.

## Critério de seleção

1. Determinar a aplicação e as funções propostas por circuito.
2. Exigir canais físicos de corrente/tensão separadamente de DI/DO e de pontos lógicos MMS/GOOSE.
3. Acrescentar a reserva de I/O e enumerar as combinações de cartões cadastradas.
4. Rejeitar alternativas sem canais, I/O, edição IEC 61850 ou PRP requerido.
5. Priorizar a menor classe de complexidade compatível. Isso não representa pesquisa de preço ou código comercial validado.

O SEL-849 é candidato BT compacto quando Ed.1 é aceita e seu envelope atende corrente, tensão e I/O. O SEL-710 é alternativa para motor sem requisito PRP cadastrado; o SEL-710-5 atende a opção PRP/diferencial. Alimentadores usam a família 751; transformadores, variantes 787 compatíveis com enrolamentos/canais; geradores, 700G. Barramento 487B recebe pendência de configuração de zonas e I/O. Quadros simples podem permanecer com proteção integrada ao disjuntor/equipamento e supervisão pelo SEL-2440, que não substitui um relé de proteção.

Funções condicionais não são declaradas como executadas por uma configuração básica. O limiar de potência para sugerir 87M é uma premissa editável. Os requisitos DI/DO/TC/TP podem ser corrigidos por circuito. Forçar um modelo incompatível resulta em seleção pendente. Exclusão de circuito é explícita, reversível e registrada no projeto. Circuitos especiais podem ser acrescentados sem alterar a lista de cargas.

As combinações de cartões são uma base conservadora para pré-seleção; o código de encomenda, a ocupação efetiva de slots, as tensões de contato, a capacidade das saídas e as opções simultaneamente disponíveis ainda devem ser validados com a SEL.

## Rede e materiais

- Radial: cascata de switches; estrela: árvore hierárquica; dupla: árvores LAN A/B independentes com PRP nos terminais; anel: ciclo de switches RSTP. O anel não é HSR.
- Switch SEL-2731: mapa explícito das 16 portas 100 Mb/s e 8 portas 100/1000 Mb/s. Backbone usa portas rápidas. A reserva altera a capacidade adotada de acesso. A porta frontal de gerenciamento não é somada às 24 de tráfego.
- A distribuição pode ficar centralizada ou por painel. As fontes de tempo são SEL-2488, com uma ou duas antenas independentes. PTP depende do perfil/firmware; SNTP e IRIG-B são distinguidos.
- Nós sem PRP cadastrado recebem RedBox explícita, inclusive o cordão local de serviço. Modelo, certificação e alimentação da RedBox permanecem pendentes. Duas NICs comuns não são tratadas como PRP.
- Cada enlace óptico adota inicialmente cabo 4F OM3, um par ativo e um par reserva, com fibras terminadas nas duas pontas. DIOs são agrupados por local/LAN em módulos de 24F e recebem reserva de capacidade. Metros de cabo não são multiplicados pelo número de fibras. SFPs são contados apenas nas pontas de switch com cages ópticos, separando acesso 100BASE-FX de backbone 1000BASE-SX. A óptica fixa do relé não é contada como SFP.
- O orçamento óptico por direção usa quatro conexões, duas fusões, atenuação por comprimento e margem. Todos os valores são premissas editáveis; confrontar Tx mínimo/Rx sensível nas duas direções, alcance, saturação e tipo de fibra.
- Cabos entre locais diferentes entram em interligações/bandejamento, usando as posições compartilhadas dos painéis/racks. Cordões internos entram nos materiais e no mapa de enlaces. As rotas A/B são identificadas, mas a independência física não é certificada pelo desenho.

Os comprimentos incluem o percurso conceitual, subidas, percentual e laços. Diâmetros e pesos são envelopes de orçamento. Cadastros manuais existentes permanecem; revisar possíveis duplicidades de escopo. A carga SAE é estimada separadamente e não altera silenciosamente margens de energia, bateria, dissipação ou dimensões de racks existentes.

## Referências e limites

A matriz dentro do aplicativo contém links oficiais SEL, Petrobras, ONS e ANEEL e identifica as revisões consultadas em 19/10/2026. Elas não são apresentadas como confirmação da última revisão vigente. A ET Petrobras offshore não é aplicada como obrigação universal a toda instalação industrial. O escopo do ONS é avaliado separadamente de PRODIST/concessionária. Normas internas N-2933/N-2779 dependem do texto e da revisão contratual; não houve declaração de conformidade integral.

Escopo implementado: rede de estação MMS/GOOSE e estimativas convencionais de proteção/controle. Não dimensiona process bus/SV/merging units, teleproteção/distância de linhas, reatores ou capacitores. Não calcula ajustes, seletividade, saturação de TC, carga de TP, latência por enlace ou desempenho real sob falha. O simulador verifica conectividade ao RTAC; não substitui FAT/SAT.

Entregas: folhas SVG por switch; mapa de portas; lista de IEDs, pontos propostos, cabos, DIOs e materiais; matriz normativa; pendências; CSV completo e impressão/PDF. Pontos detalhados só são renderizados ao expandir o registro. A impressão inclui o conjunto inteiro, independentemente da página em tela.

## Validação

`node tests/automation.cjs` cobre os cinco portes nas quatro topologias, seleção/rejeição, canais, reservas, conectividade, isolamento A/B, limites de portas, RedBox, DIOs, rotas e preservação da engenharia elétrica/arranjo.

`tests/automation-dom.mjs` usa linkedom (via instalação disponível ou variável `SE_DOM_MODULE`) e carrega os scripts reais. Exercita navegação, edição, reset, exclusão/reinclusão, falha de switch, rollback, salvamento/restauração e exportações nos cinco portes. `tests/performance-dom.mjs`, paginação, armazenamento e alinhamento cobrem o fluxo existente. A inspeção visual foi feita sobre SVG rasterizado; não foi realizado ensaio em navegador completo nesta sessão.

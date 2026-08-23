# /// script
# requires-python = ">=3.10"
# ///
"""Ciclo 1 da marca fitness: R$ 40k mercadoria + R$ 20k midia.

Separa RESULTADO (P&L) de CAIXA. A margem bruta ja desconta custo do
produto e taxa de canal — nao subtrair a producao de novo.

Benchmarks pesquisados 23/08/2026: ROAS Meta moda 3-6 em contas maduras;
conversao moda BR 1,9%; ticket medio e-commerce BR R$ 269,46.
Marca nova entra abaixo da media: pixel sem dados, sem prova social.
"""
MIDIA, MERCADORIA = 20_000.00, 40_000.00
LOTE_CUSTO    = 33_851.50    # producao das 416 pecas
LOTE_RECEITA  = 82_638.40    # receita bruta se vender tudo
LOTE_MARGEM   = 34_722.06    # margem bruta apos taxas E custo (mix ML Classico)
TAXAS         = LOTE_RECEITA - LOTE_CUSTO - LOTE_MARGEM

def brl(v): return f"R$ {v:,.2f}".replace(",","X").replace(".",",").replace("X",".")
CEN=[("Pessimista",1.5),("Provável",2.5),("Otimista",4.0)]

print(f"Lote 416 peças · produção {brl(LOTE_CUSTO)} · receita cheia {brl(LOTE_RECEITA)}")
print(f"Taxas de canal no lote cheio: {brl(TAXAS)} · margem bruta cheia: {brl(LOTE_MARGEM)}")
print(f"Mídia: {brl(MIDIA)}\n")
print(f"{'Cenário':<12}{'ROAS':>5}{'Receita':>13}{'%lote':>7}{'Margem':>13}{'RESULTADO':>14}{'CAIXA fim c1':>15}{'Estoque':>12}")
print("-"*91)
linhas=[]
for nome,roas in CEN:
    receita=min(MIDIA*roas, LOTE_RECEITA)
    pct=receita/LOTE_RECEITA
    margem=LOTE_MARGEM*pct
    liquida=receita-TAXAS*pct
    resultado=margem-MIDIA                      # P&L do ciclo
    caixa=liquida-LOTE_CUSTO-MIDIA              # desembolso real
    estoque=LOTE_CUSTO*(1-pct)
    linhas.append((nome,pct,margem,resultado,caixa,estoque))
    print(f"{nome:<12}{roas:>5.1f}{brl(receita):>13}{pct*100:>6.0f}%{brl(margem):>13}{brl(resultado):>14}{brl(caixa):>15}{brl(estoque):>12}")

print("\nRESULTADO = margem bruta − mídia (já descontados produto e taxas).")
print("CAIXA = o que voltou menos os R$ 53.851 desembolsados. Negativo aqui é normal:")
print("a produção é paga inteira no início e o estoque restante ainda não virou dinheiro.\n")

print("CICLO 2 — vender o estoque restante, sem novo gasto de produção:")
print(f"{'Cenário':<12}{'Estoque a custo':>17}{'Receita do saldo':>18}{'Margem do saldo':>17}{'ACUMULADO 2 ciclos':>21}")
print("-"*86)
for nome,pct,margem,resultado,caixa,estoque in linhas:
    receita2=LOTE_RECEITA*(1-pct)
    margem2=LOTE_MARGEM*(1-pct)
    print(f"{nome:<12}{brl(estoque):>17}{brl(receita2):>18}{brl(margem2):>17}{brl(margem+margem2-MIDIA):>21}")
print("\nAcumulado supõe mídia só no ciclo 1 e o saldo escoando organicamente ou em liquidação.")

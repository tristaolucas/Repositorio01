# /// script
# requires-python = ">=3.10"
# ///
"""Lote inicial com curva de tamanho 4/4/3/2 (P/M/G/GG)."""
CURVA = {"P": 4, "M": 4, "G": 3, "GG": 2}
POR_COMBO = sum(CURVA.values())
CORES = 4
FAMILIAS = [  # (nome, qtd_modelos, consumo_m, costura)
    ("Conjunto (legging + top)", 3, 1.85, 15.00),
    ("Macacão",                  2, 1.55, 15.00),
    ("Short",                    2, 0.60,  8.00),
    ("Calça flare",              1, 1.55, 10.00),
]
PERDA, AVIAM, REND = 0.12, 5.00, 1.75
MALHAS = {"econômica": 58.90, "intermediária": 69.90, "premium": 89.90}
def brl(v): return f"R$ {v:,.2f}".replace(",","X").replace(".",",").replace("X",".")

print(f"Curva por cor/modelo: P={CURVA['P']} M={CURVA['M']} G={CURVA['G']} GG={CURVA['GG']} = {POR_COMBO} peças\n")
total_pecas = 0
for nome, q, _, _ in FAMILIAS:
    combos = q * CORES
    pecas = combos * POR_COMBO
    total_pecas += pecas
    print(f"  {nome:26} {q} modelos x {CORES} cores x {POR_COMBO} = {pecas:>3} peças")
print(f"  {'TOTAL':26} {'':>24} {total_pecas:>3} peças\n")

print(f"{'malha':>16} {'investimento':>15}")
for faixa, kg in MALHAS.items():
    pm = kg / REND
    tot = sum((q*CORES*POR_COMBO) * (cons*(1+PERDA)*pm + cost + AVIAM) for _, q, cons, cost in FAMILIAS)
    print(f"{faixa:>16} {brl(tot):>15}")

ANTES_PECAS, ANTES_VALOR = 384, 31247.54
pm = MALHAS["intermediária"] / REND
agora = sum((q*CORES*POR_COMBO) * (cons*(1+PERDA)*pm + cost + AVIAM) for _, q, cons, cost in FAMILIAS)
print(f"\nCOMPARAÇÃO (malha intermediária)")
print(f"  grade anterior, 3 por tamanho: {ANTES_PECAS} peças · {brl(ANTES_VALOR)}")
print(f"  curva nova 4/4/3/2:            {total_pecas} peças · {brl(agora)}")
d = agora - ANTES_VALOR
print(f"  diferença:                     {total_pecas-ANTES_PECAS:+} peças · {brl(d)} ({d/ANTES_VALOR*100:+.1f}%)")

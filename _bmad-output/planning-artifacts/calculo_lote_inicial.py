# /// script
# requires-python = ">=3.10"
# ///
"""Investimento inicial de produção — marca fitness (Anchieta/ES).
Só produção das peças. Custos de venda, marketing e canal ficam fora, a pedido.
"""
CORES, TAMANHOS = 4, 4

# consumo em metros lineares de malha 1,60m de largura, ANTES da perda de encaixe
MODELOS = [
    # (familia, qtd_modelos, consumo_m, costura_R$, costura_confirmada?)
    ("Conjunto (legging + top)", 3, 1.85, 15.00, True),
    ("Macacão",                  2, 1.55, 15.00, False),
    ("Short",                    2, 0.60,  8.00, False),
    ("Calça flare",              1, 1.55, 10.00, False),
]
PERDA_ENCAIXE = 0.12      # sobra de corte; faixa usual 10-15%
AVIAMENTOS = 5.00         # elástico, linha, etiqueta, tag, embalagem — por unidade

# R$/kg pesquisados; rendimento confirmado de 1,75 m/kg (88% poliamida / 12% elastano)
RENDIMENTO_M_POR_KG = 1.75
MALHAS = {"econômico": 58.90, "intermediário": 69.90, "premium": 89.90}

def brl(v): return f"R$ {v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")

skus = sum(q * CORES * TAMANHOS for _, q, _, _, _ in MODELOS)
print(f"GRADE: 8 modelos x {CORES} cores x {TAMANHOS} tamanhos = {skus} SKUs\n")

print("CUSTO UNITÁRIO POR PEÇA (malha intermediária, R$ 69,90/kg)")
print(f"{'':28} {'tecido':>9} {'costura':>9} {'aviam.':>8} {'TOTAL':>10}")
preco_m = MALHAS["intermediário"] / RENDIMENTO_M_POR_KG
for nome, _, cons, cost, _ in MODELOS:
    tec = cons * (1 + PERDA_ENCAIXE) * preco_m
    print(f"{nome:28} {brl(tec):>9} {brl(cost):>9} {brl(AVIAMENTOS):>8} {brl(tec+cost+AVIAMENTOS):>10}")

print(f"\n{'':>10}INVESTIMENTO TOTAL DO LOTE")
print(f"{'malha':>16} {'2 pç/SKU':>14} {'3 pç/SKU':>14} {'5 pç/SKU':>14}")
for faixa, preco_kg in MALHAS.items():
    pm = preco_kg / RENDIMENTO_M_POR_KG
    linha = f"{faixa:>16}"
    for prof in (2, 3, 5):
        total = sum(
            (q * CORES * TAMANHOS * prof) * (cons * (1 + PERDA_ENCAIXE) * pm + cost + AVIAMENTOS)
            for _, q, cons, cost, _ in MODELOS
        )
        linha += f" {brl(total):>14}"
    print(linha)

print(f"\nPeças no lote: 2/SKU = {skus*2} | 3/SKU = {skus*3} | 5/SKU = {skus*5}")

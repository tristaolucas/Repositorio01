# /// script
# requires-python = ">=3.10"
# ///
"""Retorno do lote 4/4/3/2 e ponto de equilíbrio. Preços na faixa dos especialistas."""
CURVA=13; CORES=4
# (familia, modelos, custo_unit, preco_venda)
FAM=[("Conjunto (legging+top)",3,102.76,249.90),
     ("Macacão",               2, 89.34,219.90),
     ("Calça flare",           1, 84.34,199.90),
     ("Short",                 2, 39.84, 99.90)]
INVEST=33851.50
def ml(p): return p*0.14+6.00          # ML Clássico, categoria Moda
def shopee(p): return p*0.14+(26 if p>=200 else 20)
def proprio(p): return p*0.045+1.50
def brl(v): return f"R$ {v:,.2f}".replace(",","X").replace(".",",").replace("X",".")

for canal,taxa in [("Mercado Livre Clássico",ml),("Shopee",shopee),("E-commerce próprio",proprio)]:
    receita=margem=0; pecas=0
    for _,q,custo,preco in FAM:
        n=q*CORES*CURVA; pecas+=n
        receita+=n*preco
        margem+=n*(preco-taxa(preco)-custo)
    print(f"{canal}")
    print(f"   receita se vender tudo: {brl(receita)}   margem bruta: {brl(margem)}")
    # ponto de equilíbrio: % do lote que paga o investimento
    print(f"   equilíbrio: {INVEST/margem*100:>5.1f}% do lote vendido paga a produção "
          f"(~{int(pecas*INVEST/margem)} de {pecas} peças)\n")

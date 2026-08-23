# /// script
# requires-python = ">=3.10"
# ///
"""Margem real do conjunto legging+top por canal e preço de venda.
Custo de produção: R$ 102,76 (malha intermediária). Taxas pesquisadas em 23/08/2026.
"""
CUSTO = 102.76
PRECOS = [149.90, 179.90, 199.90, 249.90, 299.00]

def ml(p, premium=False):          # Moda: 14% clássico, 19% premium (+ tarifa variável)
    return p * (0.19 if premium else 0.14) + 6.00   # R$6 = estimativa da tarifa variável

def shopee(p):                     # 14% + fixo por faixa; 20% + R$4 até 79,99
    if p < 80:   return p * 0.20 + 4
    if p < 100:  return p * 0.14 + 16
    if p < 200:  return p * 0.14 + 20
    return p * 0.14 + 26

def proprio(p):                    # gateway ~4,5% + antifraude; sem comissão de canal
    return p * 0.045 + 1.50

def brl(v): return f"R$ {v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")

canais = [("Mercado Livre Clássico", lambda p: ml(p)),
          ("Mercado Livre Premium",  lambda p: ml(p, True)),
          ("Shopee",                 shopee),
          ("E-commerce próprio",     proprio)]

print(f"Custo de produção do conjunto: {brl(CUSTO)}\n")
print(f"{'Canal':<24}" + "".join(f"{brl(p):>13}" for p in PRECOS))
print("-" * (24 + 13*len(PRECOS)))
for nome, taxa in canais:
    linha = f"{nome:<24}"
    for p in PRECOS:
        m = p - taxa(p) - CUSTO
        linha += f"{brl(m):>13}"
    print(linha)

print(f"\n{'Canal':<24}" + "".join(f"{str(int(p))+'  %':>13}" for p in PRECOS))
print("-" * (24 + 13*len(PRECOS)))
for nome, taxa in canais:
    linha = f"{nome:<24}"
    for p in PRECOS:
        m = p - taxa(p) - CUSTO
        linha += f"{m/p*100:>12.1f}%"
    print(linha)
print("\nMargem bruta, antes de impostos, embalagem, marketing e devolução.")

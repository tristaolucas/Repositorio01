# /// script
# requires-python = ">=3.10"
# ///
"""Configuracao recomendada: lote piloto + reserva de reposicao + atacado."""
CORES=4
FAM=[("Conjunto (legging+top)",3,102.76,249.90),("Macacão",2,89.34,219.90),
     ("Short",2,39.84,99.90),("Calça flare",1,84.34,199.90)]
def brl(v): return f"R$ {v:,.2f}".replace(",","X").replace(".",",").replace("X",".")
def lote(curva):
    n=sum(curva); pecas=custo=receita=0
    for _,q,c,p in FAM:
        k=q*CORES*n; pecas+=k; custo+=k*c; receita+=k*p
    return pecas,custo,receita

print("OPÇÕES DE CURVA\n")
print(f"{'curva':<16}{'por combo':>11}{'peças':>8}{'custo':>15}{'receita cheia':>16}")
for lbl,c in [("4/4/3/2 (atual)",(4,4,3,2)),("3/3/2/2",(3,3,2,2)),("2/2/1/1 PILOTO",(2,2,1,1))]:
    p,cu,re=lote(c); print(f"{lbl:<16}{sum(c):>11}{p:>8}{brl(cu):>15}{brl(re):>16}")

pecas,custo,receita=lote((2,2,1,1))
MIDIA=7000; CAIXA=60000
print(f"\n{'='*62}\nRECOMENDADO — piloto 2/2/1/1, 8 modelos mantidos\n{'='*62}")
print(f"  Produção piloto ....... {brl(custo)}  ({pecas} peças)")
print(f"  Mídia ................. {brl(MIDIA)}")
print(f"  Reserva de reposição .. {brl(CAIXA-custo-MIDIA)}")
print(f"  {'-'*46}\n  Capital total ......... {brl(CAIXA)}")

print(f"\nATACADO — conjunto, sem taxa de canal e sem mídia")
for pct in (0.55,0.60,0.65):
    pa=249.90*pct; m=pa-102.76
    print(f"  {int(pct*100)}% do varejo = {brl(pa):>9}  margem {brl(m):>8} ({m/pa*100:>4.1f}%)  "
          f"pedido de 10 pç = {brl(pa*10)}")

print(f"\nPONTO DE EQUILÍBRIO DO PILOTO")
marg_var=sum(q*CORES*sum((2,2,1,1))*(p-(p*0.14+6.0)-c) for _,q,c,p in FAM)
print(f"  margem se vender tudo no varejo ML: {brl(marg_var)}")
print(f"  cobre a produção com {custo/marg_var*100:.0f}% do piloto vendido")
print(f"  cobre produção + mídia com {(custo+MIDIA)/marg_var*100:.0f}%")

import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side, numbers
from openpyxl.utils import get_column_letter
from copy import copy

wb = openpyxl.Workbook()

# === STYLES ===
blue_font = Font(name='Arial', color='0000FF', size=11)
blue_font_bold = Font(name='Arial', color='0000FF', size=11, bold=True)
black_font = Font(name='Arial', color='000000', size=11)
black_bold = Font(name='Arial', color='000000', size=11, bold=True)
green_font = Font(name='Arial', color='008000', size=11)
white_bold = Font(name='Arial', color='FFFFFF', size=11, bold=True)
title_font = Font(name='Arial', color='000000', size=14, bold=True)
subtitle_font = Font(name='Arial', color='000000', size=12, bold=True)
small_font = Font(name='Arial', color='666666', size=9, italic=True)

yellow_fill = PatternFill(start_color='FFFF00', end_color='FFFF00', fill_type='solid')
header_fill = PatternFill(start_color='2F5496', end_color='2F5496', fill_type='solid')
light_blue_fill = PatternFill(start_color='D6E4F0', end_color='D6E4F0', fill_type='solid')
light_green_fill = PatternFill(start_color='E2EFDA', end_color='E2EFDA', fill_type='solid')
light_red_fill = PatternFill(start_color='FCE4EC', end_color='FCE4EC', fill_type='solid')
light_yellow_fill = PatternFill(start_color='FFF9C4', end_color='FFF9C4', fill_type='solid')
light_gray_fill = PatternFill(start_color='F2F2F2', end_color='F2F2F2', fill_type='solid')

thin_border = Border(
    left=Side(style='thin'), right=Side(style='thin'),
    top=Side(style='thin'), bottom=Side(style='thin')
)
bottom_border = Border(bottom=Side(style='medium'))
top_bottom_border = Border(top=Side(style='medium'), bottom=Side(style='double'))

brl_fmt = 'R$ #,##0.00;(R$ #,##0.00);-'
brl_fmt_int = 'R$ #,##0;(R$ #,##0);-'
pct_fmt = '0.0%'
int_fmt = '#,##0'

def style_header_row(ws, row, max_col):
    for c in range(1, max_col + 1):
        cell = ws.cell(row=row, column=c)
        cell.font = white_bold
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal='center', wrap_text=True)
        cell.border = thin_border

def style_data_cell(cell, fmt=None, font=None, fill=None):
    cell.font = font or black_font
    cell.border = thin_border
    if fmt:
        cell.number_format = fmt
    if fill:
        cell.fill = fill

def auto_width(ws, min_width=12, max_width=18):
    for col in ws.columns:
        col_letter = get_column_letter(col[0].column)
        ws.column_dimensions[col_letter].width = min_width


# ============================================================
# ABA 1 — PREMISSAS
# ============================================================
ws1 = wb.active
ws1.title = 'Premissas'
ws1.sheet_properties.tabColor = '2F5496'

premissas = [
    # (row, label, value, unit, note, is_input)
    ('', 'PLANO DE NEGÓCIOS — REVENDA DE GÁS E ÁGUA MINERAL', '', '', '', False),
    ('', 'Supermercado Multishow — Anchieta/ES', '', '', '', False),
    ('', 'Data: Agosto/2026', '', '', '', False),
    ('', '', '', '', '', False),
    ('', 'DADOS DO NEGÓCIO', '', '', '', False),
    ('', 'Modelo', 'Revenda independente (bandeira branca)', '', '', False),
    ('', 'Localização', 'Rua de trás do Supermercado Multishow, Anchieta/ES', '', '', False),
    ('', 'Classe de armazenamento', 'Classe II (até 120 botijões P13)', '', '', False),
    ('', 'Imóvel', 'Próprio — custo zero de aluguel', '', '', False),
    ('', '', '', '', '', False),
    ('', 'PREMISSAS DE PREÇO E CUSTO', 'Valor', 'Unidade', 'Fonte / Nota', False),
]

row = 1
# Title
ws1.merge_cells('A1:E1')
ws1.cell(row=1, column=1, value='PLANO DE NEGÓCIOS — REVENDA DE GÁS E ÁGUA MINERAL').font = title_font
row = 2
ws1.merge_cells('A2:E2')
ws1.cell(row=2, column=1, value='Supermercado Multishow — Anchieta/ES').font = subtitle_font
row = 3
ws1.cell(row=3, column=1, value='Data: Agosto/2026').font = small_font
row = 5
ws1.merge_cells('A5:E5')
c = ws1.cell(row=5, column=1, value='DADOS DO NEGÓCIO')
c.font = subtitle_font
c.fill = light_blue_fill

data_info = [
    (6, 'Modelo', 'Revenda independente (bandeira branca)'),
    (7, 'Localização', 'Rua de trás do Supermercado Multishow, Anchieta/ES'),
    (8, 'Classe de armazenamento', 'Classe II (até 120 botijões P13)'),
    (9, 'Imóvel', 'Próprio — custo zero de aluguel'),
    (10, 'População Anchieta (2025)', '~33.000 habitantes / ~10.000 domicílios'),
]
for r, label, val in data_info:
    ws1.cell(row=r, column=1, value=label).font = black_bold
    ws1.cell(row=r, column=2, value=val).font = black_font

# Price premises
row = 12
ws1.merge_cells('A12:E12')
c = ws1.cell(row=12, column=1, value='PREMISSAS DE PREÇO E CUSTO')
c.font = subtitle_font
c.fill = light_blue_fill

headers = ['Item', 'Valor', 'Unidade', 'Fonte / Nota']
row = 13
for i, h in enumerate(headers, 1):
    cell = ws1.cell(row=row, column=i, value=h)
    cell.font = white_bold
    cell.fill = header_fill
    cell.border = thin_border

price_data = [
    (14, 'Preço venda — Gás P13', 106, 'R$/botijão', 'Média ES — Googás/ANP', True),
    (15, 'Custo compra — Gás P13', 80, 'R$/botijão', 'Estimativa negociação bandeira branca', True),
    (16, 'Margem bruta — Gás P13', None, 'R$/botijão', 'Fórmula: Preço - Custo', False),
    (17, '', '', '', '', False),
    (18, 'Preço venda — Água 20L', 11.50, 'R$/galão', 'Média mercado local', True),
    (19, 'Custo compra — Água 20L', 4.50, 'R$/galão', 'Preço atacado ES', True),
    (20, 'Margem bruta — Água 20L', None, 'R$/galão', 'Fórmula: Preço - Custo', False),
    (21, '', '', '', '', False),
    (22, 'Dias de operação/mês', 26, 'dias', 'Seg-Sáb', True),
    (23, 'Alíquota Simples Nacional', 0.06, '%', 'Faixa estimada — comércio', True),
    (24, 'Custo entrega (combustível)', 800, 'R$/mês', 'Moto/utilitário — estimativa', True),
]

for r, label, val, unit, note, is_input in price_data:
    if not label:
        continue
    ws1.cell(row=r, column=1, value=label).font = black_font
    ws1.cell(row=r, column=1).border = thin_border
    cell_val = ws1.cell(row=r, column=2, value=val)
    if is_input:
        cell_val.font = blue_font
        cell_val.fill = yellow_fill
    else:
        cell_val.font = black_font
    cell_val.border = thin_border
    if isinstance(val, float) and val < 1:
        cell_val.number_format = pct_fmt
    elif isinstance(val, (int, float)) and val > 1:
        cell_val.number_format = brl_fmt if '/' in unit and 'R$' in unit else int_fmt
    ws1.cell(row=r, column=3, value=unit).font = black_font
    ws1.cell(row=r, column=3).border = thin_border
    ws1.cell(row=r, column=4, value=note).font = small_font
    ws1.cell(row=r, column=4).border = thin_border

# Formulas for margins
ws1.cell(row=16, column=2).value = '=B14-B15'
ws1.cell(row=16, column=2).font = black_font
ws1.cell(row=16, column=2).number_format = brl_fmt
ws1.cell(row=16, column=2).border = thin_border

ws1.cell(row=20, column=2).value = '=B18-B19'
ws1.cell(row=20, column=2).font = black_font
ws1.cell(row=20, column=2).number_format = brl_fmt
ws1.cell(row=20, column=2).border = thin_border

# Volume premises
row = 26
ws1.merge_cells('A26:E26')
c = ws1.cell(row=26, column=1, value='PREMISSAS DE VOLUME (vendas/dia)')
c.font = subtitle_font
c.fill = light_blue_fill

row = 27
vol_headers = ['Item', 'Pessimista', 'Realista', 'Otimista']
for i, h in enumerate(vol_headers, 1):
    cell = ws1.cell(row=row, column=i, value=h)
    cell.font = white_bold
    cell.fill = header_fill
    cell.border = thin_border

vol_data = [
    (28, 'Gás P13 (botijões/dia)', 8, 15, 25),
    (29, 'Água 20L (galões/dia)', 10, 20, 30),
]
for r, label, pess, real, otim in vol_data:
    ws1.cell(row=r, column=1, value=label).font = black_font
    ws1.cell(row=r, column=1).border = thin_border
    for c_idx, val in [(2, pess), (3, real), (4, otim)]:
        cell = ws1.cell(row=r, column=c_idx, value=val)
        cell.font = blue_font
        cell.fill = yellow_fill
        cell.number_format = int_fmt
        cell.border = thin_border

# Monthly volume formulas
row = 31
ws1.merge_cells('A31:E31')
c = ws1.cell(row=31, column=1, value='VOLUME MENSAL (calculado)')
c.font = subtitle_font
c.fill = light_blue_fill

row = 32
for i, h in enumerate(vol_headers, 1):
    cell = ws1.cell(row=row, column=i, value=h)
    cell.font = white_bold
    cell.fill = header_fill
    cell.border = thin_border

# Gas monthly = daily * days
for r, label, daily_row in [(33, 'Gás P13 (botijões/mês)', 28), (34, 'Água 20L (galões/mês)', 29)]:
    ws1.cell(row=r, column=1, value=label).font = black_font
    ws1.cell(row=r, column=1).border = thin_border
    for c_idx in [2, 3, 4]:
        col_l = get_column_letter(c_idx)
        cell = ws1.cell(row=r, column=c_idx)
        cell.value = f'={col_l}{daily_row}*B22'
        cell.font = black_font
        cell.number_format = int_fmt
        cell.border = thin_border

# Investment premises
row = 36
ws1.merge_cells('A36:E36')
c = ws1.cell(row=36, column=1, value='INVESTIMENTO INICIAL')
c.font = subtitle_font
c.fill = light_blue_fill

row = 37
inv_headers = ['Item', 'Valor (R$)', '', 'Nota']
for i, h in enumerate(inv_headers, 1):
    cell = ws1.cell(row=row, column=i, value=h)
    cell.font = white_bold
    cell.fill = header_fill
    cell.border = thin_border

inv_data = [
    (38, 'Concretagem do piso (~50m²)', 3500, 'Estimativa — piso de concreto'),
    (39, 'Cobertura (telha metálica)', 5000, 'Estrutura metálica simples + telha'),
    (40, 'Sinalização + demarcação', 500, 'Placas obrigatórias + pintura de piso'),
    (41, 'Extintores (2x PQS)', 500, 'Compra + suporte'),
    (42, 'Balança comercial', 400, 'Obrigatória por lei'),
    (43, 'Instalação elétrica (adequação)', 1000, 'Redirecionar pontos fora da zona 3m'),
    (44, 'Licenças e taxas (ANP, Bombeiros, Prefeitura)', 3000, 'Estimativa — pode variar'),
    (45, 'Abertura/alteração CNPJ + CNAE', 2000, 'Contador + taxas'),
    (46, 'Estoque inicial — Gás (80 botijões)', None, 'Fórmula'),
    (47, 'Estoque inicial — Água (150 galões)', None, 'Fórmula'),
    (48, 'Capital de giro', 5000, 'Reserva para os primeiros meses'),
    (49, 'Veículo de entrega (moto carrocinha)', 8000, 'Moto usada + adaptação — ou usa frota existente'),
]

for r, label, val, note in inv_data:
    ws1.cell(row=r, column=1, value=label).font = black_font
    ws1.cell(row=r, column=1).border = thin_border
    cell_val = ws1.cell(row=r, column=2)
    if val is not None:
        cell_val.value = val
        cell_val.font = blue_font
        cell_val.fill = yellow_fill
    cell_val.number_format = brl_fmt_int
    cell_val.border = thin_border
    ws1.cell(row=r, column=4, value=note).font = small_font
    ws1.cell(row=r, column=4).border = thin_border

# Formulas for stock
ws1.cell(row=46, column=2).value = '=80*B15'
ws1.cell(row=46, column=2).font = black_font
ws1.cell(row=46, column=2).number_format = brl_fmt_int
ws1.cell(row=46, column=2).border = thin_border

ws1.cell(row=47, column=2).value = '=150*B19'
ws1.cell(row=47, column=2).font = black_font
ws1.cell(row=47, column=2).number_format = brl_fmt_int
ws1.cell(row=47, column=2).border = thin_border

# Total investment
row = 51
ws1.cell(row=51, column=1, value='TOTAL INVESTIMENTO INICIAL').font = black_bold
ws1.cell(row=51, column=1).border = top_bottom_border
cell_total = ws1.cell(row=51, column=2)
cell_total.value = '=SUM(B38:B49)'
cell_total.font = black_bold
cell_total.number_format = brl_fmt_int
cell_total.border = top_bottom_border

# Fixed costs
row = 53
ws1.merge_cells('A53:E53')
c = ws1.cell(row=53, column=1, value='CUSTOS FIXOS MENSAIS')
c.font = subtitle_font
c.fill = light_blue_fill

row = 54
for i, h in enumerate(['Item', 'Valor (R$/mês)', '', 'Nota'], 1):
    cell = ws1.cell(row=row, column=i, value=h)
    cell.font = white_bold
    cell.fill = header_fill
    cell.border = thin_border

fixed_costs = [
    (55, 'Aluguel', 0, 'Imóvel próprio'),
    (56, 'Funcionário (1) + encargos', 2800, 'Salário + FGTS + férias + 13º proporcional'),
    (57, 'Contador', 500, 'Honorários mensais'),
    (58, 'Energia elétrica', 250, 'Estimativa — iluminação + escritório'),
    (59, 'Água / internet / telefone', 200, 'Estimativa'),
    (60, 'Manutenção (extintores, equipamentos)', 100, 'Proporcional anual'),
    (61, 'IPTU (proporcional)', 0, 'Já pago como parte do imóvel'),
    (62, 'Entrega (combustível + manutenção veículo)', None, 'Referência B24'),
    (63, 'Marketing (material Multishow)', 300, 'Panfletos, cartaz no supermercado'),
]

for r, label, val, note in fixed_costs:
    ws1.cell(row=r, column=1, value=label).font = black_font
    ws1.cell(row=r, column=1).border = thin_border
    cell_val = ws1.cell(row=r, column=2)
    if val is not None:
        cell_val.value = val
        cell_val.font = blue_font
        cell_val.fill = yellow_fill
    cell_val.number_format = brl_fmt_int
    cell_val.border = thin_border
    ws1.cell(row=r, column=4, value=note).font = small_font
    ws1.cell(row=r, column=4).border = thin_border

# Entrega references B24
ws1.cell(row=62, column=2).value = '=B24'
ws1.cell(row=62, column=2).font = green_font
ws1.cell(row=62, column=2).number_format = brl_fmt_int
ws1.cell(row=62, column=2).border = thin_border

# Total fixed costs
row = 65
ws1.cell(row=65, column=1, value='TOTAL CUSTOS FIXOS/MÊS').font = black_bold
ws1.cell(row=65, column=1).border = top_bottom_border
cell_total_fix = ws1.cell(row=65, column=2)
cell_total_fix.value = '=SUM(B55:B63)'
cell_total_fix.font = black_bold
cell_total_fix.number_format = brl_fmt_int
cell_total_fix.border = top_bottom_border

# Widths
ws1.column_dimensions['A'].width = 42
ws1.column_dimensions['B'].width = 18
ws1.column_dimensions['C'].width = 14
ws1.column_dimensions['D'].width = 45
ws1.column_dimensions['E'].width = 12

# ============================================================
# ABA 2 — DRE 12 MESES (Cenário Realista)
# ============================================================
ws2 = wb.create_sheet('DRE 12 Meses')
ws2.sheet_properties.tabColor = '00B050'

ws2.merge_cells('A1:N1')
ws2.cell(row=1, column=1, value='DRE PROJETADA — 12 MESES — CENÁRIO REALISTA').font = title_font

ws2.merge_cells('A2:N2')
ws2.cell(row=2, column=1, value='Revenda Gás e Água — Multishow Anchieta/ES').font = subtitle_font

# Headers
row = 4
headers_dre = ['Item'] + [f'Mês {i}' for i in range(1, 13)] + ['Total 12M']
for i, h in enumerate(headers_dre, 1):
    cell = ws2.cell(row=row, column=i, value=h)
    cell.font = white_bold
    cell.fill = header_fill
    cell.alignment = Alignment(horizontal='center', wrap_text=True)
    cell.border = thin_border

# Ramp-up: months 1-3 at 70%, 4-6 at 85%, 7-12 at 100%
ramp = [0.50, 0.65, 0.80, 0.90, 0.95, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]

row = 5
ws2.cell(row=5, column=1, value='Fator de ramp-up').font = small_font
ws2.cell(row=5, column=1).border = thin_border
for m in range(12):
    cell = ws2.cell(row=5, column=m+2, value=ramp[m])
    cell.font = blue_font
    cell.number_format = pct_fmt
    cell.border = thin_border
    cell.fill = yellow_fill
ws2.cell(row=5, column=14).border = thin_border

# Row definitions (row_num, label, formula_pattern, fmt, is_bold, fill)
dre_rows = [
    (6, '', None, None, False, None),
    (7, 'VOLUME DE VENDAS', None, None, True, light_blue_fill),
    (8, 'Gás P13 (botijões)', 'gas_vol', int_fmt, False, None),
    (9, 'Água 20L (galões)', 'water_vol', int_fmt, False, None),
    (10, '', None, None, False, None),
    (11, 'RECEITA BRUTA', None, None, True, light_blue_fill),
    (12, 'Receita — Gás P13', 'gas_rev', brl_fmt_int, False, None),
    (13, 'Receita — Água 20L', 'water_rev', brl_fmt_int, False, None),
    (14, 'RECEITA BRUTA TOTAL', 'total_rev', brl_fmt_int, True, light_green_fill),
    (15, '', None, None, False, None),
    (16, 'IMPOSTOS (Simples Nacional)', 'tax', brl_fmt_int, False, light_red_fill),
    (17, 'RECEITA LÍQUIDA', 'net_rev', brl_fmt_int, True, None),
    (18, '', None, None, False, None),
    (19, 'CUSTO DAS MERCADORIAS (CMV)', None, None, True, light_blue_fill),
    (20, 'CMV — Gás P13', 'gas_cmv', brl_fmt_int, False, None),
    (21, 'CMV — Água 20L', 'water_cmv', brl_fmt_int, False, None),
    (22, 'CMV TOTAL', 'total_cmv', brl_fmt_int, True, light_red_fill),
    (23, '', None, None, False, None),
    (24, 'LUCRO BRUTO', 'gross_profit', brl_fmt_int, True, light_green_fill),
    (25, 'Margem Bruta %', 'gross_margin', pct_fmt, False, None),
    (26, '', None, None, False, None),
    (27, 'CUSTOS FIXOS', None, None, True, light_blue_fill),
    (28, 'Funcionário + encargos', 'fixed_func', brl_fmt_int, False, None),
    (29, 'Contador', 'fixed_cont', brl_fmt_int, False, None),
    (30, 'Energia + água + internet', 'fixed_util', brl_fmt_int, False, None),
    (31, 'Manutenção', 'fixed_manut', brl_fmt_int, False, None),
    (32, 'Entrega (combustível)', 'fixed_entrega', brl_fmt_int, False, None),
    (33, 'Marketing', 'fixed_mkt', brl_fmt_int, False, None),
    (34, 'TOTAL CUSTOS FIXOS', 'total_fixed', brl_fmt_int, True, light_red_fill),
    (35, '', None, None, False, None),
    (36, 'LUCRO OPERACIONAL (EBITDA)', 'ebitda', brl_fmt_int, True, light_green_fill),
    (37, 'Margem EBITDA %', 'ebitda_margin', pct_fmt, False, None),
    (38, '', None, None, False, None),
    (39, 'LUCRO ACUMULADO', 'cum_profit', brl_fmt_int, True, light_yellow_fill),
]

prem_sheet = "'Premissas'"

for r, label, formula_key, fmt, is_bold, fill in dre_rows:
    cell_label = ws2.cell(row=r, column=1, value=label)
    cell_label.font = black_bold if is_bold else black_font
    cell_label.border = thin_border
    if fill:
        cell_label.fill = fill

    if formula_key is None:
        for m in range(1, 14):
            c = ws2.cell(row=r, column=m+1)
            c.border = thin_border
            if fill:
                c.fill = fill
        continue

    for m in range(1, 13):
        col = m + 1
        cl = get_column_letter(col)
        cell = ws2.cell(row=r, column=col)
        cell.border = thin_border
        if fill:
            cell.fill = fill

        if formula_key == 'gas_vol':
            cell.value = f"={prem_sheet}!C33*{cl}5"
        elif formula_key == 'water_vol':
            cell.value = f"={prem_sheet}!C34*{cl}5"
        elif formula_key == 'gas_rev':
            cell.value = f"={cl}8*{prem_sheet}!B14"
        elif formula_key == 'water_rev':
            cell.value = f"={cl}9*{prem_sheet}!B18"
        elif formula_key == 'total_rev':
            cell.value = f"={cl}12+{cl}13"
        elif formula_key == 'tax':
            cell.value = f"={cl}14*{prem_sheet}!B23"
        elif formula_key == 'net_rev':
            cell.value = f"={cl}14-{cl}16"
        elif formula_key == 'gas_cmv':
            cell.value = f"={cl}8*{prem_sheet}!B15"
        elif formula_key == 'water_cmv':
            cell.value = f"={cl}9*{prem_sheet}!B19"
        elif formula_key == 'total_cmv':
            cell.value = f"={cl}20+{cl}21"
        elif formula_key == 'gross_profit':
            cell.value = f"={cl}17-{cl}22"
        elif formula_key == 'gross_margin':
            cell.value = f"=IF({cl}14=0,0,{cl}24/{cl}14)"
        elif formula_key == 'fixed_func':
            cell.value = f"={prem_sheet}!B56"
        elif formula_key == 'fixed_cont':
            cell.value = f"={prem_sheet}!B57"
        elif formula_key == 'fixed_util':
            cell.value = f"={prem_sheet}!B58+{prem_sheet}!B59"
        elif formula_key == 'fixed_manut':
            cell.value = f"={prem_sheet}!B60"
        elif formula_key == 'fixed_entrega':
            cell.value = f"={prem_sheet}!B62"
        elif formula_key == 'fixed_mkt':
            cell.value = f"={prem_sheet}!B63"
        elif formula_key == 'total_fixed':
            cell.value = f"=SUM({cl}28:{cl}33)"
        elif formula_key == 'ebitda':
            cell.value = f"={cl}24-{cl}34"
        elif formula_key == 'ebitda_margin':
            cell.value = f"=IF({cl}14=0,0,{cl}36/{cl}14)"
        elif formula_key == 'cum_profit':
            if m == 1:
                cell.value = f"={cl}36"
            else:
                prev_cl = get_column_letter(col - 1)
                cell.value = f"={prev_cl}39+{cl}36"

        cell.font = black_bold if is_bold else (green_font if 'fixed_' in (formula_key or '') else black_font)
        if fmt:
            cell.number_format = fmt

    # Total column (N = column 14)
    total_col = 14
    cell_total = ws2.cell(row=r, column=total_col)
    cell_total.border = thin_border
    if fill:
        cell_total.fill = fill
    cell_total.font = black_bold if is_bold else black_font
    if fmt:
        cell_total.number_format = fmt

    if formula_key in ('gas_vol', 'water_vol', 'gas_rev', 'water_rev', 'total_rev',
                        'tax', 'net_rev', 'gas_cmv', 'water_cmv', 'total_cmv',
                        'gross_profit', 'fixed_func', 'fixed_cont', 'fixed_util',
                        'fixed_manut', 'fixed_entrega', 'fixed_mkt', 'total_fixed',
                        'ebitda'):
        cell_total.value = f'=SUM(B{r}:M{r})'
    elif formula_key == 'gross_margin':
        cell_total.value = f'=IF(N14=0,0,N24/N14)'
    elif formula_key == 'ebitda_margin':
        cell_total.value = f'=IF(N14=0,0,N36/N14)'
    elif formula_key == 'cum_profit':
        cell_total.value = f'=M39'

ws2.column_dimensions['A'].width = 32
for c in range(2, 15):
    ws2.column_dimensions[get_column_letter(c)].width = 14


# ============================================================
# ABA 3 — CENÁRIOS COMPARATIVOS
# ============================================================
ws3 = wb.create_sheet('Cenários')
ws3.sheet_properties.tabColor = 'FFC000'

ws3.merge_cells('A1:D1')
ws3.cell(row=1, column=1, value='COMPARATIVO DE CENÁRIOS — RESUMO ANUAL').font = title_font

headers_cen = ['Indicador', 'Pessimista', 'Realista', 'Otimista']
row = 3
for i, h in enumerate(headers_cen, 1):
    cell = ws3.cell(row=row, column=i, value=h)
    cell.font = white_bold
    cell.fill = header_fill
    cell.border = thin_border
    cell.alignment = Alignment(horizontal='center')

# For scenarios we use Premissas columns B (pessimista), C (realista), D (otimista)
# Monthly volumes from Premissas rows 33-34
scenario_rows = [
    (4, 'Gás P13 — vendas/mês (maduro)', int_fmt, [
        f"={prem_sheet}!B33", f"={prem_sheet}!C33", f"={prem_sheet}!D33"]),
    (5, 'Água 20L — vendas/mês (maduro)', int_fmt, [
        f"={prem_sheet}!B34", f"={prem_sheet}!C34", f"={prem_sheet}!D34"]),
    (6, '', None, ['', '', '']),
    (7, 'Receita mensal — Gás (madura)', brl_fmt_int, [
        f"={prem_sheet}!B33*{prem_sheet}!B14",
        f"={prem_sheet}!C33*{prem_sheet}!B14",
        f"={prem_sheet}!D33*{prem_sheet}!B14"]),
    (8, 'Receita mensal — Água (madura)', brl_fmt_int, [
        f"={prem_sheet}!B34*{prem_sheet}!B18",
        f"={prem_sheet}!C34*{prem_sheet}!B18",
        f"={prem_sheet}!D34*{prem_sheet}!B18"]),
    (9, 'RECEITA MENSAL TOTAL', brl_fmt_int, ['=B7+B8', '=C7+C8', '=D7+D8']),
    (10, '', None, ['', '', '']),
    (11, 'CMV mensal — Gás', brl_fmt_int, [
        f"={prem_sheet}!B33*{prem_sheet}!B15",
        f"={prem_sheet}!C33*{prem_sheet}!B15",
        f"={prem_sheet}!D33*{prem_sheet}!B15"]),
    (12, 'CMV mensal — Água', brl_fmt_int, [
        f"={prem_sheet}!B34*{prem_sheet}!B19",
        f"={prem_sheet}!C34*{prem_sheet}!B19",
        f"={prem_sheet}!D34*{prem_sheet}!B19"]),
    (13, 'CMV MENSAL TOTAL', brl_fmt_int, ['=B11+B12', '=C11+C12', '=D11+D12']),
    (14, '', None, ['', '', '']),
    (15, 'Impostos (Simples)', brl_fmt_int, [
        f"=B9*{prem_sheet}!B23", f"=C9*{prem_sheet}!B23", f"=D9*{prem_sheet}!B23"]),
    (16, 'Custos fixos mensais', brl_fmt_int, [
        f"={prem_sheet}!B65", f"={prem_sheet}!B65", f"={prem_sheet}!B65"]),
    (17, '', None, ['', '', '']),
    (18, 'LUCRO OPERACIONAL/MÊS', brl_fmt_int, [
        '=B9-B13-B15-B16', '=C9-C13-C15-C16', '=D9-D13-D15-D16']),
    (19, 'Margem operacional %', pct_fmt, [
        '=IF(B9=0,0,B18/B9)', '=IF(C9=0,0,C18/C9)', '=IF(D9=0,0,D18/D9)']),
    (20, '', None, ['', '', '']),
    (21, 'LUCRO ANUAL (12 meses)', brl_fmt_int, ['=B18*12', '=C18*12', '=D18*12']),
    (22, 'Investimento inicial', brl_fmt_int, [
        f"={prem_sheet}!B51", f"={prem_sheet}!B51", f"={prem_sheet}!B51"]),
    (23, 'Payback (meses)', '#,##0.0', [
        '=IF(B18<=0,"N/A",B22/B18)', '=IF(C18<=0,"N/A",C22/C18)', '=IF(D18<=0,"N/A",D22/D18)']),
    (24, 'ROI anual', pct_fmt, [
        '=IF(B22=0,0,B21/B22)', '=IF(C22=0,0,C21/C22)', '=IF(D22=0,0,D21/D22)']),
]

fills_cen = [None, light_red_fill, light_yellow_fill, light_green_fill]

for r, label, fmt, formulas in scenario_rows:
    ws3.cell(row=r, column=1, value=label).font = black_bold if r in (9, 13, 18, 21, 23, 24) else black_font
    ws3.cell(row=r, column=1).border = thin_border
    if r in (9, 18, 21):
        ws3.cell(row=r, column=1).fill = light_green_fill
    for ci, f in enumerate(formulas, 2):
        cell = ws3.cell(row=r, column=ci)
        if f:
            cell.value = f
        cell.font = black_bold if r in (9, 13, 18, 21, 23, 24) else black_font
        cell.border = thin_border
        if fmt:
            cell.number_format = fmt
        if r in (9, 18, 21):
            cell.fill = fills_cen[ci-1] if ci <= 3 else light_green_fill

ws3.column_dimensions['A'].width = 35
for c in range(2, 5):
    ws3.column_dimensions[get_column_letter(c)].width = 18


# ============================================================
# ABA 4 — FLUXO DE CAIXA
# ============================================================
ws4 = wb.create_sheet('Fluxo de Caixa')
ws4.sheet_properties.tabColor = 'FF0000'

ws4.merge_cells('A1:N1')
ws4.cell(row=1, column=1, value='FLUXO DE CAIXA — 12 MESES — CENÁRIO REALISTA').font = title_font

row = 3
headers_fc = ['Item'] + ['Mês 0\n(Investimento)'] + [f'Mês {i}' for i in range(1, 13)]
for i, h in enumerate(headers_fc, 1):
    cell = ws4.cell(row=row, column=i, value=h)
    cell.font = white_bold
    cell.fill = header_fill
    cell.alignment = Alignment(horizontal='center', wrap_text=True)
    cell.border = thin_border

fc_rows = [
    (4, 'ENTRADAS', None, True, light_green_fill),
    (5, 'Receita bruta', 'fc_receita', False, None),
    (6, '', None, False, None),
    (7, 'SAÍDAS', None, True, light_red_fill),
    (8, 'Investimento inicial', 'fc_invest', False, None),
    (9, 'CMV (compra de mercadoria)', 'fc_cmv', False, None),
    (10, 'Impostos', 'fc_tax', False, None),
    (11, 'Custos fixos', 'fc_fixed', False, None),
    (12, 'Total saídas', 'fc_total_out', True, light_red_fill),
    (13, '', None, False, None),
    (14, 'SALDO DO MÊS', 'fc_saldo', True, None),
    (15, 'SALDO ACUMULADO', 'fc_acum', True, light_yellow_fill),
]

dre_sheet = "'DRE 12 Meses'"

for r, label, fk, is_bold, fill in fc_rows:
    ws4.cell(row=r, column=1, value=label).font = black_bold if is_bold else black_font
    ws4.cell(row=r, column=1).border = thin_border
    if fill:
        ws4.cell(row=r, column=1).fill = fill

    # Month 0 (column 2)
    cell_m0 = ws4.cell(row=r, column=2)
    cell_m0.border = thin_border
    cell_m0.number_format = brl_fmt_int
    if fill:
        cell_m0.fill = fill

    if fk == 'fc_invest':
        cell_m0.value = f"={prem_sheet}!B51"
        cell_m0.font = black_font
    elif fk == 'fc_total_out':
        cell_m0.value = '=SUM(B8:B11)'
        cell_m0.font = black_bold
    elif fk == 'fc_saldo':
        cell_m0.value = '=B4-B12'
        cell_m0.font = black_bold
    elif fk == 'fc_acum':
        cell_m0.value = '=B14'
        cell_m0.font = black_bold

    # Months 1-12 (columns 3-14)
    for m in range(1, 13):
        col = m + 2
        cl = get_column_letter(col)
        cell = ws4.cell(row=r, column=col)
        cell.border = thin_border
        cell.number_format = brl_fmt_int
        if fill:
            cell.fill = fill

        dre_col = get_column_letter(m + 1)  # DRE months are columns B-M

        if fk == 'fc_receita':
            cell.value = f"={dre_sheet}!{dre_col}14"
            cell.font = green_font
        elif fk == 'fc_invest':
            cell.value = 0
            cell.font = black_font
        elif fk == 'fc_cmv':
            cell.value = f"={dre_sheet}!{dre_col}22"
            cell.font = green_font
        elif fk == 'fc_tax':
            cell.value = f"={dre_sheet}!{dre_col}16"
            cell.font = green_font
        elif fk == 'fc_fixed':
            cell.value = f"={dre_sheet}!{dre_col}34"
            cell.font = green_font
        elif fk == 'fc_total_out':
            cell.value = f"=SUM({cl}8:{cl}11)"
            cell.font = black_bold
        elif fk == 'fc_saldo':
            cell.value = f"={cl}5-{cl}12"
            cell.font = black_bold
        elif fk == 'fc_acum':
            prev_cl = get_column_letter(col - 1)
            cell.value = f"={prev_cl}15+{cl}14"
            cell.font = black_bold

ws4.column_dimensions['A'].width = 30
for c in range(2, 15):
    ws4.column_dimensions[get_column_letter(c)].width = 14


# ============================================================
# ABA 5 — BREAKEVEN
# ============================================================
ws5 = wb.create_sheet('Breakeven')
ws5.sheet_properties.tabColor = '7030A0'

ws5.merge_cells('A1:D1')
ws5.cell(row=1, column=1, value='ANÁLISE DE BREAKEVEN (Ponto de Equilíbrio)').font = title_font

ws5.merge_cells('A3:D3')
ws5.cell(row=3, column=1, value='BREAKEVEN MENSAL — Quantas unidades preciso vender para cobrir custos fixos?').font = subtitle_font

row = 5
for i, h in enumerate(['Indicador', 'Gás P13', 'Água 20L', 'Nota'], 1):
    cell = ws5.cell(row=row, column=i, value=h)
    cell.font = white_bold
    cell.fill = header_fill
    cell.border = thin_border

be_data = [
    (6, 'Preço de venda unitário', f"={prem_sheet}!B14", f"={prem_sheet}!B18", brl_fmt),
    (7, 'Custo unitário (CMV)', f"={prem_sheet}!B15", f"={prem_sheet}!B19", brl_fmt),
    (8, 'Imposto unitário (Simples)', f"=B6*{prem_sheet}!B23", f"=C6*{prem_sheet}!B23", brl_fmt),
    (9, 'Margem de contribuição unitária', '=B6-B7-B8', '=C6-C7-C8', brl_fmt),
    (10, '', '', '', None),
    (11, 'Custos fixos totais/mês', f"={prem_sheet}!B65", '', brl_fmt_int),
    (12, '', '', '', None),
    (13, 'Breakeven — só gás (unidades/mês)', '=IF(B9=0,0,B11/B9)', '', '#,##0'),
    (14, 'Breakeven — só gás (unidades/dia)', '=IF(B9=0,0,B13/26)', '', '#,##0.0'),
    (15, '', '', '', None),
    (16, 'Breakeven — só água (unidades/mês)', '', '=IF(C9=0,0,B11/C9)', '#,##0'),
    (17, 'Breakeven — só água (unidades/dia)', '', '=IF(C9=0,0,C16/26)', '#,##0.0'),
    (18, '', '', '', None),
    (19, 'Breakeven — MIX (premissa: 60% receita gás, 40% água)', '', '', None),
    (20, 'Margem contribuição ponderada', '=B9*0.6+C9*0.4', '', brl_fmt),
    (21, 'Breakeven mix (unidades totais/mês)', '=IF(B20=0,0,B11/B20)', '', '#,##0'),
    (22, 'Breakeven mix (unidades totais/dia)', '=IF(B20=0,0,B21/26)', '', '#,##0.0'),
]

notes_be = {
    9: 'Quanto sobra por unidade vendida após CMV e imposto',
    13: 'Se vendesse APENAS gás',
    16: 'Se vendesse APENAS água',
    20: 'Média ponderada considerando mix de produtos',
    21: 'Combinando gás + água',
}

for r, label, gas_f, water_f, fmt in be_data:
    ws5.cell(row=r, column=1, value=label).font = black_bold if r in (9, 11, 13, 16, 19, 21) else black_font
    ws5.cell(row=r, column=1).border = thin_border
    if r in (9, 13, 16, 21):
        ws5.cell(row=r, column=1).fill = light_green_fill

    cell_g = ws5.cell(row=r, column=2)
    if gas_f:
        cell_g.value = gas_f
    cell_g.font = black_font
    cell_g.border = thin_border
    if fmt:
        cell_g.number_format = fmt

    cell_w = ws5.cell(row=r, column=3)
    if water_f:
        cell_w.value = water_f
    cell_w.font = black_font
    cell_w.border = thin_border
    if fmt:
        cell_w.number_format = fmt

    note = notes_be.get(r, '')
    ws5.cell(row=r, column=4, value=note).font = small_font
    ws5.cell(row=r, column=4).border = thin_border

ws5.column_dimensions['A'].width = 48
ws5.column_dimensions['B'].width = 18
ws5.column_dimensions['C'].width = 18
ws5.column_dimensions['D'].width = 48


# ============================================================
# ABA 6 — ANÁLISE DE SENSIBILIDADE
# ============================================================
ws6 = wb.create_sheet('Sensibilidade')
ws6.sheet_properties.tabColor = 'ED7D31'

ws6.merge_cells('A1:F1')
ws6.cell(row=1, column=1, value='ANÁLISE DE SENSIBILIDADE — O QUE ACONTECE SE...').font = title_font

ws6.merge_cells('A3:F3')
ws6.cell(row=3, column=1, value='Impacto no lucro operacional mensal (cenário realista maduro) quando uma variável muda').font = subtitle_font

row = 5
for i, h in enumerate(['Variável', 'Valor base', '-20%', '-10%', '+10%', '+20%'], 1):
    cell = ws6.cell(row=row, column=i, value=h)
    cell.font = white_bold
    cell.fill = header_fill
    cell.border = thin_border
    cell.alignment = Alignment(horizontal='center')

# Base profit formula (realistic, mature month)
# Revenue = gas_vol*price_gas + water_vol*price_water
# CMV = gas_vol*cost_gas + water_vol*cost_water
# Tax = Revenue * tax_rate
# Profit = Revenue - CMV - Tax - Fixed

# Let's define base values referencing premissas
# Base monthly profit = Cenarios!C18

sens_vars = [
    (6, 'Preço do gás (R$/botijão)', f"={prem_sheet}!B14",
     'gas_price'),
    (7, 'Custo do gás (R$/botijão)', f"={prem_sheet}!B15",
     'gas_cost'),
    (8, 'Volume gás (botijões/mês)', f"={prem_sheet}!C33",
     'gas_vol'),
    (9, 'Preço da água (R$/galão)', f"={prem_sheet}!B18",
     'water_price'),
    (10, 'Custo da água (R$/galão)', f"={prem_sheet}!B19",
     'water_cost'),
    (11, 'Volume água (galões/mês)', f"={prem_sheet}!C34",
     'water_vol'),
    (12, 'Custos fixos (R$/mês)', f"={prem_sheet}!B65",
     'fixed'),
]

# For sensitivity we calculate the profit with each variation
# Base profit = (gas_vol*(gas_price-gas_cost) + water_vol*(water_price-water_cost))*(1-tax) - fixed
# We vary one at a time

for r, label, base_ref, var_type in sens_vars:
    ws6.cell(row=r, column=1, value=label).font = black_font
    ws6.cell(row=r, column=1).border = thin_border

    cell_base = ws6.cell(row=r, column=2, value=base_ref)
    cell_base.font = blue_font
    cell_base.border = thin_border
    cell_base.number_format = brl_fmt if 'preço' in label.lower() or 'custo' in label.lower() or 'fixo' in label.lower() else int_fmt

    # For each variation (-20%, -10%, +10%, +20%), calculate profit
    variations = [0.8, 0.9, 1.1, 1.2]
    for vi, var_mult in enumerate(variations):
        col = vi + 3
        cell = ws6.cell(row=r, column=col)
        cell.border = thin_border
        cell.number_format = brl_fmt_int

        # Build profit formula varying only this variable
        # Components: gas_rev, water_rev, gas_cmv, water_cmv, tax, fixed
        p = prem_sheet
        gv = f"{p}!C33"  # gas volume realista
        gp = f"{p}!B14"  # gas price
        gc = f"{p}!B15"  # gas cost
        wv = f"{p}!C34"  # water volume realista
        wp = f"{p}!B18"  # water price
        wc = f"{p}!B19"  # water cost
        tx = f"{p}!B23"  # tax rate
        fx = f"{p}!B65"  # fixed costs

        if var_type == 'gas_price':
            gp = f"({p}!B14*{var_mult})"
        elif var_type == 'gas_cost':
            gc = f"({p}!B15*{var_mult})"
        elif var_type == 'gas_vol':
            gv = f"({p}!C33*{var_mult})"
        elif var_type == 'water_price':
            wp = f"({p}!B18*{var_mult})"
        elif var_type == 'water_cost':
            wc = f"({p}!B19*{var_mult})"
        elif var_type == 'water_vol':
            wv = f"({p}!C34*{var_mult})"
        elif var_type == 'fixed':
            fx = f"({p}!B65*{var_mult})"

        formula = (f"=({gv}*({gp}-{gc})+{wv}*({wp}-{wc}))"
                   f"*(1-{tx})-{fx}")
        cell.value = formula
        cell.font = black_font

        # Color code: red if negative, green if positive relative to base
        # We'll add conditional formatting logic via fill later

# Base profit row
row = 14
ws6.cell(row=14, column=1, value='LUCRO BASE (referência)').font = black_bold
ws6.cell(row=14, column=1).border = thin_border
ws6.cell(row=14, column=1).fill = light_green_fill
for ci in range(2, 7):
    cell = ws6.cell(row=14, column=ci)
    p = prem_sheet
    cell.value = (f"=({p}!C33*({p}!B14-{p}!B15)+{p}!C34*({p}!B18-{p}!B19))"
                  f"*(1-{p}!B23)-{p}!B65")
    cell.font = black_bold
    cell.number_format = brl_fmt_int
    cell.border = thin_border
    cell.fill = light_green_fill

# Legend
row = 16
ws6.cell(row=16, column=1, value='LEGENDA:').font = black_bold
ws6.cell(row=17, column=1, value='Cada célula mostra o lucro operacional mensal quando APENAS aquela variável muda.').font = small_font
ws6.cell(row=18, column=1, value='Compare com a linha "Lucro Base" para ver o impacto de cada variação.').font = small_font
ws6.cell(row=19, column=1, value='As variáveis mais sensíveis são as que mais mudam o lucro quando variam ±10-20%.').font = small_font

ws6.column_dimensions['A'].width = 35
for c in range(2, 7):
    ws6.column_dimensions[get_column_letter(c)].width = 16


# ============================================================
# ABA 7 — KILL CRITERIA
# ============================================================
ws7 = wb.create_sheet('Kill Criteria')
ws7.sheet_properties.tabColor = 'C00000'

ws7.merge_cells('A1:C1')
ws7.cell(row=1, column=1, value='KILL CRITERIA — QUANDO ENCERRAR O PROJETO').font = title_font

row = 3
for i, h in enumerate(['Critério', 'Limite', 'Ação'], 1):
    cell = ws7.cell(row=row, column=i, value=h)
    cell.font = white_bold
    cell.fill = header_fill
    cell.border = thin_border

kills = [
    ('Zoneamento negado pela Prefeitura', 'Parecer negativo', 'ENCERRAR — não há alternativa no mesmo local'),
    ('Nenhuma distribuidora atende Anchieta', 'Todas recusam', 'ENCERRAR — sem fornecedor, sem negócio'),
    ('Vendas < breakeven por 3 meses consecutivos (após ramp-up)', 'Mês 6 em diante', 'AVALIAR: reduzir custos, intensificar marketing, ou ENCERRAR'),
    ('Prejuízo acumulado > R$ 15.000 (excluindo investimento)', 'A qualquer momento', 'ENCERRAR — vender estoque e recuperar capital'),
    ('Concorrente abre revenda no mesmo quarteirão', 'A qualquer momento', 'AVALIAR: diferenciar por entrega rápida ou ENCERRAR se inviável'),
    ('Regulamentação nova da ANP inviabiliza operação', 'A qualquer momento', 'ENCERRAR — adaptar se possível, encerrar se não'),
    ('Custo de adequação > R$ 30.000', 'Antes de iniciar obra', 'REAVALIAR — a conta pode não fechar'),
]

for i, (crit, limite, acao) in enumerate(kills, 4):
    ws7.cell(row=i, column=1, value=crit).font = black_font
    ws7.cell(row=i, column=1).border = thin_border
    ws7.cell(row=i, column=2, value=limite).font = black_font
    ws7.cell(row=i, column=2).border = thin_border
    ws7.cell(row=i, column=3, value=acao).font = black_font
    ws7.cell(row=i, column=3).border = thin_border

ws7.column_dimensions['A'].width = 55
ws7.column_dimensions['B'].width = 25
ws7.column_dimensions['C'].width = 55


# ============================================================
# SAVE
# ============================================================
output_path = '/home/user/Repositorio01/Plano_Financeiro_Gas_Agua_Multishow.xlsx'
wb.save(output_path)
print(f'Planilha salva em: {output_path}')

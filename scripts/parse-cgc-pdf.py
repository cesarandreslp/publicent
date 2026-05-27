"""
Parsea el PDF oficial del CGC (Catálogo General de Cuentas) de la CGN
y emite TypeScript con la lista completa para src/lib/seeders/cgc-cuentas.ts.

Estructura del CGC: código de 1, 2, 4 ó 6 dígitos.
  1 dígito → Clase   (nivel 1)
  2 dígitos → Grupo   (nivel 2)
  4 dígitos → Cuenta  (nivel 3)
  6 dígitos → Subcuenta (nivel 4) — hoja

Naturaleza y tipo se deriva de la clase + flags (CR)/(DB) en el nombre.
"""
import re
import sys
import PyPDF2

PDF_PATH = "../../docs/cgc colombia actualizado.pdf"
OUT_PATH = "../src/lib/seeders/cgc-cuentas.generated.ts"

# Páginas con la estructura (1-indexed). El cap 1 va de la 4 a la 142
START_PAGE = 7   # primera página con código contable (vimos pp. 7..)
END_PAGE   = 142

CLASE_INFO = {
    "1": ("DEBITO",  "BALANCE",   "ACTIVOS"),
    "2": ("CREDITO", "BALANCE",   "PASIVOS"),
    "3": ("CREDITO", "BALANCE",   "PATRIMONIO"),
    "4": ("CREDITO", "RESULTADO", "INGRESOS"),
    "5": ("DEBITO",  "RESULTADO", "GASTOS"),
    "6": ("DEBITO",  "RESULTADO", "COSTOS DE VENTAS"),
    "7": ("DEBITO",  "RESULTADO", "COSTOS DE TRANSFORMACIÓN"),
    "8": ("DEBITO",  "ORDEN",     "CUENTAS DE ORDEN DEUDORAS"),
    "9": ("CREDITO", "ORDEN",     "CUENTAS DE ORDEN ACREEDORAS"),
}

# Grupos "por contra" en cuentas de orden invierten naturaleza
INVERSE_GROUPS = {"89", "99"}

LINE_RE = re.compile(r"^\s*(\d{1,6})\s+(.+?)\s*$")

def parse():
    r = PyPDF2.PdfReader(open(PDF_PATH, "rb"))
    cuentas = {}  # codigo -> (nombre, has_cr_flag)
    seen_order = []

    for pidx in range(START_PAGE - 1, min(END_PAGE, len(r.pages))):
        text = r.pages[pidx].extract_text()
        if not text:
            continue
        for raw_line in text.split("\n"):
            line = raw_line.strip()
            if not line or len(line) < 2:
                continue
            m = LINE_RE.match(line)
            if not m:
                continue
            codigo, nombre = m.group(1), m.group(2).strip()
            # Filtros básicos
            if codigo in CLASE_INFO and len(codigo) == 1:
                pass  # clase
            elif len(codigo) not in (1, 2, 4, 6):
                continue
            # Saltar números de página tipo "7", "8" sueltos sin nombre largo
            if len(nombre) < 3:
                continue
            # Saltar headers tipo "MARCO NORMATIVO..." que casualmente empiecen con número
            if "MARCO NORMATIVO" in nombre.upper() or "CATÁLOGO" in nombre.upper():
                continue
            # Idempotente: si ya lo vimos con texto más largo, conservar el más largo
            prev = cuentas.get(codigo)
            if prev is None or len(nombre) > len(prev[0]):
                cuentas[codigo] = (nombre, "(CR)" in nombre.upper() or "(DB)" in nombre.upper())
                if codigo not in seen_order:
                    seen_order.append(codigo)

    # Ordenar por código numérico-asc
    def sortkey(c):
        # 1 -> "1", 11 -> "11", 1105 -> "1105", 110501 -> "110501"
        return (c[0], len(c), c)
    seen_order.sort(key=sortkey)

    # Determinar parent y nivel
    rows = []
    parents = {}  # codigo -> parent
    for codigo in seen_order:
        nombre, has_cr = cuentas[codigo]
        if len(codigo) == 1:
            nivel = 1; parent = None
        elif len(codigo) == 2:
            nivel = 2; parent = codigo[0]
        elif len(codigo) == 4:
            nivel = 3; parent = codigo[:2]
        elif len(codigo) == 6:
            nivel = 4; parent = codigo[:4]
        else:
            continue

        clase = codigo[0]
        if clase not in CLASE_INFO:
            continue
        nat, tipo, _ = CLASE_INFO[clase]
        # Inverso por grupo "por contra"
        if len(codigo) >= 2 and codigo[:2] in INVERSE_GROUPS:
            nat = "CREDITO" if nat == "DEBITO" else "DEBITO"
        # Flag (CR)/(DB) en el nombre — también invierte respecto al default
        # PERO sólo si esa flag aparece literal. Asumimos el PDF ya incluye flag
        # en grupos como 89/99 — no doble-invertimos.
        rows.append((codigo, nombre, nivel, nat, tipo, parent, has_cr))

    # Marcar permiteMovimientos: por defecto sólo subcuentas (nivel 4).
    # Adicionalmente, cualquier cuenta de nivel 3 SIN hijos también es hoja.
    tiene_hijos = set(p for (_, _, _, _, _, p, _) in rows if p)
    out_lines = []
    for (codigo, nombre, nivel, nat, tipo, parent, has_cr) in rows:
        permite = (nivel == 4) or (nivel == 3 and codigo not in tiene_hijos) or (nivel == 2 and codigo not in tiene_hijos)
        # Limpiar nombre: quitar saltos, escapar comillas
        nm = re.sub(r"\s+", " ", nombre).replace('"', "'")
        parent_field = f', parent: "{parent}"' if parent else ""
        out_lines.append(
            f'  {{ codigo: "{codigo}", nombre: "{nm}", nivel: {nivel}, naturaleza: "{nat}", tipo: "{tipo}", permiteMovimientos: {"true" if permite else "false"}{parent_field} }},'
        )

    header = '''/* eslint-disable */
/**
 * cgc-cuentas.generated.ts — GENERADO automáticamente desde el PDF oficial
 * de la CGN (Catálogo General de Cuentas, Marco Normativo para Empresas que
 * no Cotizan en el Mercado de Valores y que no Captan ni Administran Ahorro
 * del Público — Resolución 414/2014 y modificatorias 334/2025 y 343/2025).
 *
 * Fuente: docs/cgc colombia actualizado.pdf
 * Parser: scripts/parse-cgc-pdf.py
 *
 * NO EDITAR A MANO. Volver a generar corriendo el parser.
 *
 * El array se declara como `any[]` y se castea al tipo final en `cgc-cuentas.ts`
 * para evitar que TypeScript infiera una unión literal de 3.700+ elementos
 * (error TS2590 "Expression produces a union type that is too complex").
 */
import type { CuentaCgc } from "./cgc-cuentas"

const _CGC_RAW: any[] = [
'''
    out = header + "\n".join(out_lines) + "\n]\n\nexport const CGC_CUENTAS_OFICIAL: CuentaCgc[] = _CGC_RAW as CuentaCgc[]\n"
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        f.write(out)
    print(f"OK — {len(rows)} cuentas escritas en {OUT_PATH}")

if __name__ == "__main__":
    parse()

"""
Parsea los anexos oficiales del CCPET (MinHacienda - Dirección de Apoyo
Fiscal Territorial, Resolución 3832/2019 actualizada por 2662/2023 +
modificatorias) y emite TypeScript con la lista completa para el seeder.

Estructura del XLSX:
  Col B (2): Código completo (ej. "1", "1.1", "1.1.01.01.01.001")
  Col C (3): Nivel (1..N)
  Col D (4): Tipo (A=Agregado, etc.)
  Col E..O (5..15): Nombre staircased por nivel — el texto aparece en la
                    columna (4 + nivel).
  Col P (16): Definición
  Col Q (17): Soporte legal
  Col R (18): Novedad

Genera: src/lib/seeders/ccp-rubros.generated.ts
"""
import sys
import re
import openpyxl
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT.parent / "docs" / "ccpet"
OUT  = ROOT / "src" / "lib" / "seeders" / "ccp-rubros.generated.ts"

INPUTS = [
    # (archivo, tipo_default)
    ("ccpet_ingresos_territoriales.xlsx", "INGRESO"),
    ("ccpet_gastos_territoriales.xlsx",   "GASTO"),
]

def parse_sheet(path: Path, tipo_default: str):
    if not path.exists():
        print(f"  ! no existe: {path.name} — saltando", file=sys.stderr)
        return []
    wb = openpyxl.load_workbook(path, data_only=True)
    ws = wb.active
    rows = []
    for row in ws.iter_rows(min_row=4, values_only=True):
        if not row or len(row) < 5:
            continue
        codigo = row[1]
        nivel  = row[2]
        if codigo is None or nivel is None:
            continue
        codigo = str(codigo).strip()
        if not codigo or codigo.lower() in ("código completo","codigo completo"):
            continue
        try:
            nivel = int(nivel)
        except (ValueError, TypeError):
            continue
        # Nombre: columna (4 + nivel) ó la primera no vacía a la derecha de D
        nombre = None
        for ci in range(4, min(len(row), 15)):
            v = row[ci]
            if v is not None and str(v).strip():
                nombre = str(v).strip()
                break
        if not nombre:
            continue
        # Limpiar
        nombre = re.sub(r"\s+", " ", nombre).replace('"', "'")
        # Parent: quitar último segmento separado por "."
        parent = None
        if "." in codigo:
            parent = codigo.rsplit(".", 1)[0]
        rows.append({
            "codigo": codigo,
            "nombre": nombre,
            "nivel": nivel,
            "tipo": tipo_default,
            "parent": parent,
        })
    print(f"  ✓ {path.name}: {len(rows)} filas", file=sys.stderr)
    return rows

def main():
    todas = []
    for archivo, tipo in INPUTS:
        todas.extend(parse_sheet(DOCS / archivo, tipo))
    if not todas:
        print("Sin datos — abortando", file=sys.stderr)
        sys.exit(1)

    # Determinar permiteMovimientos: sólo hojas (sin hijos)
    parents = set(r["parent"] for r in todas if r["parent"])
    codigos = set(r["codigo"] for r in todas)

    out_lines = []
    for r in todas:
        permite = r["codigo"] not in parents
        parent_field = f', parent: "{r["parent"]}"' if r["parent"] else ""
        # Validar parent existe; si no, lo seteamos null para no romper el seeder
        if r["parent"] and r["parent"] not in codigos:
            parent_field = ""
        out_lines.append(
            f'  {{ codigo: "{r["codigo"]}", nombre: "{r["nombre"]}", tipo: "{r["tipo"]}", nivel: {r["nivel"]}, permiteMovimientos: {"true" if permite else "false"}{parent_field} }},'
        )

    header = '''/* eslint-disable */
/**
 * ccp-rubros.generated.ts — GENERADO automáticamente desde los anexos oficiales
 * del CCPET (Catálogo de Clasificación Presupuestal para Entidades Territoriales
 * y sus Descentralizadas) — Ministerio de Hacienda y Crédito Público,
 * Dirección General de Apoyo Fiscal Territorial.
 *
 * Resoluciones: 3832/2019, 2662/2023 y modificatorias. Versión 8 (vigente).
 *
 * Fuentes:
 *   - docs/ccpet/ccpet_ingresos_territoriales.xlsx (Anexo 1A v8)
 *   - docs/ccpet/ccpet_gastos_territoriales.xlsx   (Anexo 2A v8)
 *
 * Parser: scripts/parse-ccpet-xlsx.py
 * NO EDITAR A MANO. Regenerar con `python scripts/parse-ccpet-xlsx.py`.
 *
 * Se usa `any[]` + cast para evitar TS2590 con uniones literales grandes.
 */
import type { RubroCcp } from "./ccp-rubros"

const _CCP_RAW: any[] = [
'''
    out = header + "\n".join(out_lines) + "\n]\n\nexport const CCP_RUBROS_OFICIAL: RubroCcp[] = _CCP_RAW as RubroCcp[]\n"
    OUT.write_text(out, encoding="utf-8")
    print(f"OK — {len(todas)} rubros escritos en {OUT.relative_to(ROOT.parent)}")

if __name__ == "__main__":
    main()

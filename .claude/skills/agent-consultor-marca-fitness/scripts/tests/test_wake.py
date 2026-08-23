# /// script
# requires-python = ">=3.10"
# dependencies = ["pytest>=8.0"]
# ///
"""Testes do wake.py.

Rodar: uv run scripts/tests/test-wake.py
   ou: uv run --with pytest -m pytest scripts/tests/test-wake.py
"""
import subprocess
import sys
from pathlib import Path

import pytest

SKILL_ROOT = Path(__file__).resolve().parent.parent.parent
WAKE = SKILL_ROOT / "scripts" / "wake.py"
SKILL_NAME = "agent-consultor-marca-fitness"


def run_wake(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(
        [sys.executable, str(WAKE), *args], capture_output=True, text=True,
    )


@pytest.fixture
def santuario(tmp_path: Path) -> Path:
    s = tmp_path / "_bmad" / "memory" / SKILL_NAME
    s.mkdir(parents=True)
    (s / "INDEX.md").write_text("# Índice", encoding="utf-8")
    (s / "PERSONA.md").write_text("# Persona\nNome: Vector", encoding="utf-8")
    (s / "CREED.md").write_text("# Credo\nViabilidade antes de ambição.", encoding="utf-8")
    (s / "BOND.md").write_text("# Vínculo\nFase atual: 2", encoding="utf-8")
    (s / "MEMORY.md").write_text("# Memória\nNicho: athleisure", encoding="utf-8")
    (s / "CAPABILITIES.md").write_text("# Capacidades\nreuniao", encoding="utf-8")
    return tmp_path


def test_sem_argumento_e_erro_de_uso():
    r = run_wake()
    assert r.returncode == 2
    assert "Usage" in r.stderr


def test_sem_santuario_roteia_para_primeiro_sopro(tmp_path: Path):
    r = run_wake(str(tmp_path))
    assert r.returncode == 0
    assert "MODE: FIRST_BREATH" in r.stdout
    assert "first-breath.md" in r.stdout


def test_santuario_incompleto_ainda_e_primeiro_sopro(tmp_path: Path):
    """Pasta existir não basta: sem CREED e MEMORY o agente não tem de onde voltar."""
    (tmp_path / "_bmad" / "memory" / SKILL_NAME).mkdir(parents=True)
    r = run_wake(str(tmp_path))
    assert r.returncode == 0
    assert "MODE: FIRST_BREATH" in r.stdout


def test_com_santuario_acorda_e_carrega_a_identidade(santuario: Path):
    r = run_wake(str(santuario))
    assert r.returncode == 0
    assert "MODE: WAKING" in r.stdout
    # A identidade inteira vem numa passada só — é o ponto do wake.
    assert "Vector" in r.stdout
    assert "Viabilidade antes de ambição" in r.stdout
    assert "Fase atual: 2" in r.stdout
    assert "athleisure" in r.stdout


def test_arquivo_ausente_nao_derruba_o_despertar(santuario: Path):
    (santuario / "_bmad" / "memory" / SKILL_NAME / "INDEX.md").unlink()
    r = run_wake(str(santuario))
    assert r.returncode == 0
    assert "MODE: WAKING" in r.stdout
    assert "missing: INDEX.md" in r.stdout


if __name__ == "__main__":
    raise SystemExit(pytest.main([__file__, "-v"]))

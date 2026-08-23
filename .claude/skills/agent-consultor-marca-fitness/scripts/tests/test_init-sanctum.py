# /// script
# requires-python = ">=3.10"
# dependencies = ["pytest>=8.0"]
# ///
"""Testes do init-sanctum.py.

Rodar: uv run scripts/tests/test-init-sanctum.py
   ou: uv run --with pytest -m pytest scripts/tests/test-init-sanctum.py
"""
import subprocess
import sys
from pathlib import Path

import pytest

SKILL_ROOT = Path(__file__).resolve().parent.parent.parent
INIT = SKILL_ROOT / "scripts" / "init-sanctum.py"
SKILL_NAME = "agent-consultor-marca-fitness"

CONFIG = """user_name: Lucas
communication_language: Português (Brasil)
document_output_language: Português (Brasil)
"""


def run_init(project_root: Path) -> subprocess.CompletedProcess:
    return subprocess.run(
        [sys.executable, str(INIT), str(project_root), str(SKILL_ROOT)],
        capture_output=True, text=True,
    )


@pytest.fixture
def project(tmp_path: Path) -> Path:
    """Projeto temporário com o config no lugar em que ESTA instalação o mantém."""
    core = tmp_path / "_bmad" / "core"
    core.mkdir(parents=True)
    (core / "config.yaml").write_text(CONFIG, encoding="utf-8")
    return tmp_path


def sanctum_of(project_root: Path) -> Path:
    return project_root / "_bmad" / "memory" / SKILL_NAME


def test_cria_os_seis_arquivos_do_santuario(project: Path):
    assert run_init(project).returncode == 0
    s = sanctum_of(project)
    for name in ("INDEX.md", "PERSONA.md", "CREED.md",
                 "BOND.md", "MEMORY.md", "CAPABILITIES.md"):
        assert (s / name).is_file(), f"faltou {name}"
    assert (s / "sessions").is_dir()


def test_le_config_de_core_e_nao_cai_no_default(project: Path):
    """A regressão que importa: _bmad/config.yaml não existe nesta instalação,
    então sem o fallback para core/ o agente nasceria chamando Lucas de 'friend'."""
    assert run_init(project).returncode == 0
    bond = (sanctum_of(project) / "BOND.md").read_text(encoding="utf-8")
    assert "Lucas" in bond
    assert "friend" not in bond
    assert "Português (Brasil)" in bond


def test_persona_recebe_data_de_nascimento(project: Path):
    assert run_init(project).returncode == 0
    persona = (sanctum_of(project) / "PERSONA.md").read_text(encoding="utf-8")
    assert "{birth_date}" not in persona
    assert "{user_name}" not in persona


def test_creed_resolve_caminhos_do_dominio(project: Path):
    assert run_init(project).returncode == 0
    creed = (sanctum_of(project) / "CREED.md").read_text(encoding="utf-8")
    assert "{sanctum_path}" not in creed
    assert "{project_root}" not in creed


def test_capabilities_lista_as_cinco_capacidades(project: Path):
    assert run_init(project).returncode == 0
    caps = (sanctum_of(project) / "CAPABILITIES.md").read_text(encoding="utf-8")
    for code in ("reuniao", "viabilidade", "pesquisa", "colecao", "entregavel"):
        assert code in caps, f"capacidade {code} não registrada"


def test_nao_registra_arquivos_de_apoio_como_capacidade(project: Path):
    """first-breath, memory-guidance e o cânone são material da skill, não capacidades."""
    assert run_init(project).returncode == 0
    caps = (sanctum_of(project) / "CAPABILITIES.md").read_text(encoding="utf-8")
    for name in ("first-breath", "memory-guidance", "prompt-quality-canon"):
        assert name not in caps


def test_e_idempotente(project: Path):
    assert run_init(project).returncode == 0
    (sanctum_of(project) / "MEMORY.md").write_text("conteúdo real", encoding="utf-8")
    segunda = run_init(project)
    assert segunda.returncode == 0
    assert "already exists" in segunda.stdout
    assert (sanctum_of(project) / "MEMORY.md").read_text(encoding="utf-8") == "conteúdo real"


if __name__ == "__main__":
    raise SystemExit(pytest.main([__file__, "-v"]))

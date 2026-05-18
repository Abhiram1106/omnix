# Python Standards

## Version & tooling

- Python 3.12+ unless constrained otherwise.
- Package manager: `uv` (preferred) or Poetry.
- Lint/format: `ruff` (rules: E, F, I, B, UP, SIM, RUF). `ruff format` over Black.
- Type check: `mypy --strict` or `pyright` in strict mode.

## Types

- Type every function signature. Internal helpers can rely on inference for locals.
- `from __future__ import annotations` at file top.
- `TypedDict` / `dataclass` / Pydantic models for structured data.
- No `Any` without a comment justifying it.

## Project layout

```
src/<package_name>/
  __init__.py
  domain/
  application/
  infrastructure/
  interface/
tests/
pyproject.toml
```

## Errors

- Custom exception base per package. Don't raise built-ins for domain errors.
- Translate exceptions at the boundary (FastAPI exception handlers, CLI error renderers).

## Async

- FastAPI/Starlette/AnyIO async stack. Don't mix `requests` with async handlers; use `httpx`.
- Connection pools sized to workload, not defaults.

## Testing

- `pytest` + `pytest-asyncio`.
- Fixtures for shared setup; avoid `unittest.TestCase` style.
- Coverage target: meaningful, not a number.

## Logging

- `structlog` or stdlib `logging` with JSON formatter.
- No `print` in shipped code.

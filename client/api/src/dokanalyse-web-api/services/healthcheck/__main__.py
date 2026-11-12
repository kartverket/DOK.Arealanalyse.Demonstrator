import sys
import asyncio
import argparse
from collections import Counter
from .models import RunSummary, Status
from .runner import run_and_store, run_checks

_SYMBOLS = {
    Status.OK: 'OK  ',
    Status.SLOW: 'TREG',
    Status.DEGRADED: 'AVVIK',
    Status.DOWN: 'NEDE'
}


def main() -> int:
    parser = argparse.ArgumentParser(
        prog='healthcheck', description='Sjekker tjenestene som DOK-analysen er avhengig av')
    parser.add_argument('--ref', help='Branch/tag i konfigurasjonsrepoet (standard: HEALTHCHECK_CONFIG_REF eller main)')
    parser.add_argument('--no-store', action='store_true', help='Ikke lagre resultatet i databasen')
    parser.add_argument('--json', action='store_true', help='Skriv hele resultatet som JSON')
    parser.add_argument('--only-problems', action='store_true', help='Vis bare mål med avvik')
    args = parser.parse_args()

    if args.no_store:
        summary = asyncio.run(run_checks(args.ref))
    else:
        summary = asyncio.run(run_and_store('cli', args.ref))

    if summary is None:
        return 1

    if args.json:
        print(summary.model_dump_json(indent=2))
    else:
        _print_summary(summary, args.only_problems)

    return 0 if all(result.status != Status.DOWN for result in summary.results) else 2


def _print_summary(summary: RunSummary, only_problems: bool) -> None:
    for result in sorted(summary.results, key=lambda result: (result.target.kind, result.target.name)):
        if only_problems and result.status in (Status.OK, Status.SLOW):
            continue

        http = str(result.http_status) if result.http_status else '-'
        ms = f'{result.response_ms} ms' if result.response_ms is not None else '-'
        message = f'  {result.message}' if result.message else ''

        print(f'{_SYMBOLS[result.status]:5} {result.target.kind:8} {http:>4} {ms:>9}  {result.target.name}{message}')

    counts = Counter(result.status for result in summary.results)
    duration = (summary.finished_at - summary.started_at).total_seconds()

    print()
    print(f'Konfigurasjon: {summary.config_ref} ({summary.config_commit or "ukjent commit"}, kilde: {summary.config_source})')
    print(f'{len(summary.results)} mål på {duration:.1f} s: ' +
          ', '.join(f'{_SYMBOLS[status].strip()} {counts.get(status, 0)}' for status in Status))


if __name__ == '__main__':
    sys.exit(main())

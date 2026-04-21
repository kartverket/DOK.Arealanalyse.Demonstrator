import math
import locale
from os import getenv

locale.setlocale(locale.LC_ALL, 'nb_NO.UTF-8')


def is_development() -> bool:
    environment = getenv('ENVIRONMENT', '').strip().lower()

    return environment == 'dev' or environment == 'development'


def format_bytes(size_bytes: int | float) -> str:
    if size_bytes == 0:
        return '0B'

    size_name = ('B', 'KB', 'MB', 'GB', 'TB')
    idx = int(math.floor(math.log(size_bytes, 1024)))
    pow = math.pow(1024, idx)
    size = round(size_bytes / pow, 2)

    return f'{format_no(size)} {size_name[idx]}'


def format_no(value: int | float) -> str:
    if abs(value - round(value)) < 1e-9:
        return locale.format_string('%d', int(round(value)), grouping=True)
    else:
        return locale.format_string('%.15g', value, grouping=True)


__all__ = ['is_development', 'format_bytes', 'format_no']

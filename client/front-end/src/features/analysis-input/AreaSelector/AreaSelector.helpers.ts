import type { OmrådeProperties, SampleProperties } from '@/types/api.types';

export function getFileTitle(
    file: File,
    { kommunenummer, kommunenavn }: OmrådeProperties,
): string[] {
    return ['Fil', file.name, ...getKommuneTitle(kommunenavn, kommunenummer)];
}

export function getSampleTitle({
    navn,
    kommunenummer,
    kommunenavn,
}: SampleProperties): string[] {
    return ['Eksempel', navn, ...getKommuneTitle(kommunenavn, kommunenummer)];
}

export function getDrawnTitle(
    name: string | null,
    { kommunenummer, kommunenavn }: OmrådeProperties,
): string[] {
    const kommune = getKommuneTitle(kommunenavn, kommunenummer);
    return name !== null
        ? ['Redigert', name, ...kommune]
        : ['Tegnet område', ...kommune];
}

export function getKommuneTitle(
    kommunenavn: string | null,
    kommunenummer: string | null,
): string[] {
    return kommunenavn !== null && kommunenummer !== null
        ? [`${kommunenavn} (${kommunenummer})`]
        : [];
}

import type { AreaInfo } from '@/app/appSlice';
import type {
    AnalysisAreaType,
    OmrådeProperties,
    SampleProperties,
} from '@/types/api.types';

export type AreaDescription = Pick<AreaInfo, 'title' | 'metadata'>;

interface AreaParts {
    type: AnalysisAreaType;
    label: string;
    name: string | null;

    // Vises i parentes i beskrivelsen, f.eks. adressen til en eiendom
    detail?: string | null;
    kommunenummer: string | null;
    kommunenavn: string | null;
}

// Tittelen og beskrivelsen i jobblisten lages av de samme delene, så de ikke kan skille lag
export function describeArea({
    type,
    label,
    name,
    detail = null,
    kommunenummer,
    kommunenavn,
}: AreaParts): AreaDescription {
    const parts = [label, name, detail].filter((part) => part !== null);
    let description = name !== null ? `${label}: ${name}` : label;
    if (detail !== null) {
        description += ` (${detail})`;
    }

    return {
        title: [...parts, ...getKommuneTitle(kommunenavn, kommunenummer)],
        metadata: {
            areaType: type,
            description,
            kommunenummer,
            kommunenavn,
        },
    };
}

export function describeFileArea(
    file: File,
    { kommunenummer, kommunenavn }: OmrådeProperties,
): AreaDescription {
    return describeArea({
        type: 'file',
        label: 'Fil',
        name: file.name,
        kommunenummer,
        kommunenavn,
    });
}

export function describeSampleArea({
    navn,
    kommunenummer,
    kommunenavn,
}: SampleProperties): AreaDescription {
    return describeArea({
        type: 'sample',
        label: 'Eksempel',
        name: navn,
        kommunenummer,
        kommunenavn,
    });
}

export function describeDrawnArea(
    name: string | null,
    { kommunenummer, kommunenavn }: OmrådeProperties,
): AreaDescription {
    return name !== null
        ? describeArea({
              type: 'edited',
              label: 'Redigert',
              name,
              kommunenummer,
              kommunenavn,
          })
        : describeArea({
              type: 'drawn',
              label: 'Tegnet område',
              name: null,
              kommunenummer,
              kommunenavn,
          });
}

function getKommuneTitle(
    kommunenavn: string | null,
    kommunenummer: string | null,
): string[] {
    return kommunenavn !== null && kommunenummer !== null
        ? [`${kommunenavn} (${kommunenummer})`]
        : [];
}

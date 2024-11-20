from typing import List
from . import get_threshold_values
from ..dok_status import get_dok_status_for_dataset
from ...utils.helpers.common import evaluate_condition
from ...models.quality_measurement import QualityMeasurement


async def get_dataset_quality(dataset_id, config: List[dict], **kwargs) -> tuple[List[QualityMeasurement], List[str]]:
    quality_data = await __get_dataset_quality_data(dataset_id, config, kwargs)
    measurements: List[QualityMeasurement] = []
    warnings: List[str] = []

    for entry in quality_data:
        value: dict

        for value in entry.get('values'):
            measurements.append(QualityMeasurement(entry.get('id'), entry.get(
                'name'), value.get('value'), value.get('comment')))

        warning = entry.get('warning_text')

        if warning is not None:
            warnings.append(warning)

    return measurements, warnings


async def __get_dataset_quality_data(dataset_id, config: List[dict], data: dict[str, any]) -> List[dict]:
    quality_measurements = await __get_dataset_quality_measurements(dataset_id)

    quality_indicators: List[dict] = [
        entry for entry in config if entry['type'] == 'dataset']

    measurements: List[dict] = []

    for qm in quality_measurements:
        id = qm['quality_dimension_id']
        name = qm['quality_dimension_name']
        value = qm['value']

        measurement = {
            'id': id,
            'name': name,
            'values': [{
                'value': value,
                'comment': qm['comment']
            }],
            'warning_text': None
        }

        qi = next(
            (qi for qi in quality_indicators if qi['quality_dimension_id'] == id), None)

        if qi is not None:
            measurement['warning_text'] = __get_dataset_quality_warning_text(
                value, qi, data)

        measurements.append(measurement)

    return measurements


async def __get_dataset_quality_measurements(dataset_id: str) -> List[dict]:
    qms: List[dict] = []

    dok_status = await get_dok_status_for_dataset(dataset_id)

    if dok_status is not None:
        qms.extend(dok_status.get('suitability'))

    return qms


def __get_dataset_quality_warning_text(value: any, quality_indicator: dict, data: dict[str, any]) -> str:
    input_filter = quality_indicator.get('input_filter')

    if input_filter:
        result = evaluate_condition(input_filter, data)

        if not result:
            return None

    threshold_values = get_threshold_values(quality_indicator)
    should_warn = value in threshold_values

    return quality_indicator.get('quality_warning_text') if should_warn else None

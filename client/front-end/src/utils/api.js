import axios from 'axios';
import store from 'store';
import { addStep } from 'store/slices/datasetSlice';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function convert(file, fileType) {
    const url = `${API_BASE_URL}/convert/${fileType}/outline`;
    const formData = new FormData();

    formData.append('file', file);
    formData.append('destEpsg', 25833);

    try {
        const response = await axios.post(url, formData);
        return response.data;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export async function validate(geoJson) {
    const url = `${API_BASE_URL}/validate`;
    const formData = new FormData();
    const blob = new Blob([JSON.stringify(geoJson)], { type: 'application/json' });

    formData.append('file', blob);

    try {
        const response = await axios.post(url, formData);
        return response.data;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export async function analyze(payload, correlationId) {
    const url = `${API_BASE_URL}/pygeoapi`;
    const headers = { 'x-correlation-id': correlationId };
    const response = await axios.post(url, payload, { headers });

    await addLastStep()

    return response.data;
}

async function addLastStep() {
    return new Promise((resolve) => {
        store.dispatch(addStep())

        setTimeout(() => {            
            resolve();
        }, 1000)
    }); 
}

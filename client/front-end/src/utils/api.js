import store from 'store';
import { setToast } from 'store/slices/appSlice';
import { DEFAULT_EPSG } from './constants';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetcher = async url => {
    const apiUrl = API_BASE_URL + url;
    const response = await fetch(apiUrl);

    return await response.json();
}

export async function getArea(file) {
    const url = `${API_BASE_URL}/omrade`;
    const formData = new FormData();

    formData.append('file', file);
    formData.append('out_epsg', DEFAULT_EPSG);

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        return await response.json();
    } catch (error) {
        showError(error);
        return null;
    }
}

export async function getPlanIds(municipalityNumber) {
    const url = `${API_BASE_URL}/reguleringsplaner/planids/${municipalityNumber}`;

    try {
        const response = await fetch(url);

        const b = await response.json();
        console.log(b);
        return b;
    } catch (error) {
        showError(error);
        return null;
    }
}

export async function analyze(payload) {
    const url = `${API_BASE_URL}/pygeoapi`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        return await response.json()
    } catch (error) {
        showError(error);
        throw error;
    }
}

function showError(error) {
    const message = error.response.data.detail;
    store.dispatch(setToast({ message }));
}
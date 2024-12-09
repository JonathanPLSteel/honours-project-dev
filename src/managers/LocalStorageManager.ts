export class LocalStorageManager {
    static saveData(key: string, data: any): void {
        try {
            const serializedData = JSON.stringify(data); // Convert to JSON
            localStorage.setItem(key, serializedData);
        } catch (error) {
            console.error('Error saving to Local Storage', error);
        }
    }

    static loadData<T>(key: string): T | null {
        try {
            const serializedData = localStorage.getItem(key);
            if (serializedData === null) {
                return null; // No data found
            }
            return JSON.parse(serializedData) as T; // Convert back to object
        } catch (error) {
            console.error('Error loading from Local Storage', error);
            return null;
        }
    }

    static removeData(key: string): void {
        localStorage.removeItem(key);
    }

    static clearAllData(): void {
        localStorage.clear();
    }
}
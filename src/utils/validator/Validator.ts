export interface Validator {
    validate(value: string): boolean;
}

export class IPValidator implements Validator{
    validate(value: string): boolean {
        return /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/.test(value);
    }
}

export class FileNameValidator implements Validator{
    validate(value: string): boolean {
        return /^[^<>:"/\\|?*]+$/.test(value);
    }
}

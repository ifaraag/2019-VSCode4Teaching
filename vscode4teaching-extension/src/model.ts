export interface User {
    id: number;
    username: string;
    courses?: Course[];
}

export interface Course {
    name: string;
}
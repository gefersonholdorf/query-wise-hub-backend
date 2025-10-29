export interface User {
    id: number
    email: string
    cpf: string
    username: string
    passwordHash: string
    fileName?: string | null
    fullName?: string | null
    role: "COMMON" | "ADMIN" | "EMPLOYEE"
    createdAt: Date
    updatedAt: Date
    isActive: boolean
    lastLogin?: Date | null
}

export interface CreateUserDTO {
    email: string;
	cpf: string;
    username: string;
    passwordHash: string;
	fullName?: string;
	role: 'COMMON' | 'ADMIN' | 'EMPLOYEE'
}
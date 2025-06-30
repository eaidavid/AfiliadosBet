import * as schema from "@shared/schema";

// Fallback data structure for when database is unavailable
interface FallbackUser {
  id: number;
  username: string;
  email: string;
  password: string;
  fullName: string;
  cpf: string;
  birthDate: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory fallback storage
let fallbackUsers: FallbackUser[] = [
  {
    id: 1,
    username: "admin",
    email: "admin@afiliadosbet.com.br",
    password: "$2b$10$qQln/cA8O1T2FK531gdvPuqgmlKWpF8cQEUaUq7Kpptq1S/6yf50m", // senha: admin123
    fullName: "Administrador do Sistema",
    cpf: "00000000000",
    birthDate: "1990-01-01",
    role: "admin",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    username: "afiliado1",
    email: "afiliado@afiliadosbet.com.br",
    password: "$2b$10$qQln/cA8O1T2FK531gdvPuqgmlKWpF8cQEUaUq7Kpptq1S/6yf50m", // senha: admin123
    fullName: "Afiliado Teste",
    cpf: "11111111111",
    birthDate: "1995-05-15",
    role: "affiliate",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export class DatabaseFallback {
  static async findUserByEmailOrUsername(emailOrUsername: string): Promise<FallbackUser | null> {
    const user = fallbackUsers.find(u => 
      u.email === emailOrUsername || u.username === emailOrUsername
    );
    return user || null;
  }

  static async findUserById(id: number): Promise<FallbackUser | null> {
    const user = fallbackUsers.find(u => u.id === id);
    return user || null;
  }

  static async createUser(userData: Partial<FallbackUser>): Promise<FallbackUser> {
    const newUser: FallbackUser = {
      id: Math.max(...fallbackUsers.map(u => u.id), 0) + 1,
      username: userData.username || '',
      email: userData.email || '',
      password: userData.password || '',
      fullName: userData.fullName || '',
      cpf: userData.cpf || '',
      birthDate: userData.birthDate || '',
      role: userData.role || 'affiliate',
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    fallbackUsers.push(newUser);
    return newUser;
  }

  static async getAllUsers(): Promise<FallbackUser[]> {
    return [...fallbackUsers];
  }

  static getFallbackMessage(): string {
    return "Sistema funcionando em modo offline. Dados serão sincronizados quando a conexão for restaurada.";
  }
}
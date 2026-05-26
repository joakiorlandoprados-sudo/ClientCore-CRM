import bcrypt from "bcrypt";
import { badRequest, notFound } from "../../utils/http-error";
import { CreateUserDto, UpdateUserDto } from "./users.dtos";
import { usersRepository } from "./users.repository";

export const usersService = {
  list() {
    return usersRepository.findMany();
  },

  async get(id: string) {
    const user = await usersRepository.findById(id);
    if (!user) {
      throw notFound("User not found");
    }
    return user;
  },

  async create(dto: CreateUserDto) {
    const existing = await usersRepository.findByEmail(dto.email.toLowerCase());
    if (existing) {
      throw badRequest("Email is already registered");
    }

    return usersRepository.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      role: dto.role,
      passwordHash: await bcrypt.hash(dto.password, 12)
    });
  },

  async update(id: string, dto: UpdateUserDto) {
    await this.get(id);
    if (dto.email) {
      const existing = await usersRepository.findByEmail(dto.email.toLowerCase());
      if (existing && existing.id !== id) {
        throw badRequest("Email is already registered");
      }
    }

    const passwordHash = dto.password ? await bcrypt.hash(dto.password, 12) : undefined;
    return usersRepository.update(id, {
      name: dto.name,
      email: dto.email?.toLowerCase(),
      role: dto.role,
      isActive: dto.isActive,
      passwordHash
    });
  },

  async deactivate(id: string) {
    await this.get(id);
    return usersRepository.update(id, { isActive: false });
  }
};

import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async create(dto: CreateUserDto) {
        const userExists = await this.userRepository.findOne({
            where: { email: dto.email },
        });

        if (userExists) {
            throw new ConflictException('Este email ja está em uso');
        }

        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

        const user = this.userRepository.create({
            name: dto.name,
            email: dto.email,
            password: hashedPassword,
        });

        const savedUser = await this.userRepository.save(user);

        const { password, ...userWithoutPassword } = savedUser;

        return userWithoutPassword;
    }
}
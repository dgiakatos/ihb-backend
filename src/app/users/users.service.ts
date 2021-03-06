import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { hash, compare } from 'bcrypt';
import { ApplicationService } from '../application/application.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private applicationService: ApplicationService
    ) {}

    async assertExists(id: string) {
        if(!(await this.usersRepository.findOne({ id }))) {
            throw new NotFoundException();
        }
    }

    async findOneById(id: string): Promise<User | undefined> {
        return this.usersRepository.findOne({ id });
    }

    async findOneByEmail(email: string): Promise<User | undefined> {
        return this.usersRepository.findOne({ email });
    }

    async create(email: string, password: string): Promise<User> {
        const newUser = this.usersRepository.create({
            email,
            password: await hash(password, 10)
        });

        return this.usersRepository.save(newUser);
    }

    async delete(user: User) {
        await this.applicationService.deleteFile(user.id);
        await this.usersRepository.remove(user);
    }

    async changePassword(user: User, password: string) {
        user.password = await hash(password, 10);
        await this.usersRepository.save(user);
    }

    async changePasswordWithOldPassword(userId: string, oldPassword: string, newPassword: string) {
        const existing = await this.findOneById(userId);
        if (!existing) {
            throw new NotFoundException();
        } else if (await compare(oldPassword, existing.password)) {
            await this.changePassword(existing, newPassword)
        } else {
            throw new UnauthorizedException();
        }
    }

    async verify(user: User) {
        user.verified = true;
        await this.usersRepository.save(user);
    }
}

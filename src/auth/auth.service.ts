import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { compare }  from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';
import { Claims } from './models/claims.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './models/role.entity';
import { Role as RoleEnum } from './models/claims.interface';
import { Token } from './models/tokens.entity';
import { Token as TokenEnum } from './models/token.interface';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        @InjectRepository(Role) private rolesRepository: Repository<Role>,
        @InjectRepository(Token) private tokenRepository: Repository<Token>
    ) { }

    async verifyCredentialsAndGenerateJWT(email: string, password: string): Promise<string> {
        const user = await this.usersService.findOneByEmail(email);
        await this.verifyCredentials(user, password);
        return this.generateJWT({
            id: user!.id,
            roles: user!.roles.map(role => role.role)
        });
    }

    async setUserRole(user: User, role: RoleEnum): Promise<void> {
        const userRole = this.rolesRepository.create({
            user,
            role
        });

        await this.rolesRepository.save(userRole);
    }

    private async verifyCredentials(user: User | undefined, password: string) {
        if (user && await compare(password, user.password)) {
            return;
        }
        throw new UnauthorizedException();
    }

    private generateJWT(claims: Claims) {
        return this.jwtService.signAsync(claims);
    }

    async generateForgotPasswordToken(userEmail: string): Promise<void> {
        const type = TokenEnum.forgotPassword;
        const userId = (await this.usersService.findOneByEmail(userEmail)).id;
        const oldToken = await this.tokenRepository.findOne({ userId });
        if (!oldToken)
        {
            const token = this.generateToken();
            const temp = this.tokenRepository.create({
                tokenType: type,
                isActive: true,
                token: token,
                userId: userId
            });
            console.log(token);

            await this.tokenRepository.save(temp);
        }
        else if (!oldToken.isActive && oldToken.tokenType == type)
        {
            await this.tokenRepository.remove(oldToken);
            const token = this.generateToken();
            const temp = this.tokenRepository.create({
                tokenType: type,
                isActive: true,
                token: token,
                userId: userId
            });
            console.log(token);

            await this.tokenRepository.save(temp);

        }
        else{
            console.log('user has already an active token');
        }
        
    }

    generateToken(): string {
        return randomBytes(90).toString('hex').toString();
    }

    async checkValidityOfToken(userId: string, token: string)
    {
        const tok = await this.tokenRepository.findOne({ userId, token });
        console.log(tok);
        
    }
}

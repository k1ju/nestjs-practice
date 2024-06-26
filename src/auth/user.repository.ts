import { DataSource, Repository } from "typeorm";
import { User } from "./User.entity";
import { ConflictException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { AuthCredentialDto } from "./dto/authCredentialDto";
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserRepository extends Repository<User>{
    constructor(private dataSource: DataSource){
        super(User, dataSource.createEntityManager())
    }

    async createUser(authCredentialDto: AuthCredentialDto): Promise<User>{
        const {username, password} = authCredentialDto;
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = this.create({username, password:hashedPassword});
        try{
            await this.save(user);
        } catch(error){
            if(error.code === '23505'){
                throw new ConflictException;
            } else{
                throw new InternalServerErrorException;
            }
        }
        return user;
    }
    
}
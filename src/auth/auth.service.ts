/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';

import * as bcryptjs from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { log } from 'console';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  //inyectamos en el constructor
  constructor(@InjectModel(User.name) 
  private userModel: Model<User>,
  private jwtService:JwtService
  ) {}
  
  //Función Crear usuario
  async create(createUserDto: CreateUserDto): Promise<User> {
    
    try {
    //desestructurar en 2 datos
 const {password,...userData} = createUserDto;
    //1.Encrypt password
const newUser = new this.userModel({
  password:bcryptjs.hashSync(password,10),
  ...userData
});
await newUser.save();
// user contendrá todas las propiedades del objeto resultante de newUser.toJSON(),
// excepto password, que se ignorará y no se almacenará en la variable user.
// _ (es una convención para indicar que esta variable no se va a utilizar)
const {password:_,...user} = newUser.toJSON();
return user;
    //2.Guardar usuario
    //3.Generar JWT
      
    } catch (error) {
      if(error.code===11000){
        throw new BadRequestException('user already exists');
      }
      throw new InternalServerErrorException('Bad error');
    }

  }

  //función register
  async register(registerDto:RegisterUserDto):Promise<LoginResponse>{
    const user = await this.create( registerDto);

    return {
      user:user,
      token:this.getJwtToken( {id: user._id}),
    }
  }

  //función login
async login(loginDto:LoginDto):Promise<LoginResponse>{
  const {email,password} = loginDto;

  const user = await this.userModel.findOne({email});
  if(!user) {
    throw new UnauthorizedException('NOt valid credentials - email')
  }

  if(!bcryptjs.compareSync(password,user.password)) {
    throw new UnauthorizedException('Not valid credentials - password')
  }

  const { password:_, ...rest } = user.toJSON();

  return {
    user:rest,
    token: this.getJwtToken({id: user.id}),
  }
  
}

  findAll():Promise<User[]> {
    return this.userModel.find();
  }

  //creamos metodo para buscar id y devolver usuario menos password
  async findUserById(id:string){
    const user = await this.userModel.findById(id);
    const { password, ...rest } = user.toJSON();
    return rest;
  }

  findOne(id: number) {
    return "This actions returns a id auth";
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  //creamos funcion para JWT
  getJwtToken(payload:JwtPayload){
    const token = this.jwtService.sign(payload);
    return token;
  }




}

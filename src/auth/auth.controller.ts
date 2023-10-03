import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CreateUserDto,
  UpdateAuthDto,
  LoginDto,
  RegisterUserDto,
} from './dto/';
import { AuthGuard } from './guards/Auth.guard';
import { LoginResponse } from './interfaces/login-response';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }
  //creamos para Login
  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
  //creamos para register
  @Post('/register')
  register(@Body() registerDto: RegisterUserDto) {
    return this.authService.register(registerDto);
  }
  //Obtener todos los usuarios
  //decorador para usar guards
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    //const user = req['user'];
    // return user;
    return this.authService.findAll();
  }
  //Comprobamos y Generamos nuevo token
  @UseGuards(AuthGuard)
  @Get('/check-token')
  checkToken(@Request() req: Request): LoginResponse {
    const user = req['user'];
    return {
      user,
      token: this.authService.getJwtToken({ id: user._id }),
    };
  }

  // @Get(':id')
  // findOne(@Param('id') id: number) {
  //   return this.authService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.authService.remove(+id);
  // }
}

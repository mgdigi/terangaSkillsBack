import { Controller, Post, Body, HttpCode, HttpStatus, Get, Req, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../../core/common/decorators/public.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto);
    return this.authService.login(user);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new citizen' })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get current logged in user' })
  getProfile(@Req() req) {
    return req.user;
  }

  @ApiBearerAuth()
  @Post('logout')
  @ApiOperation({ summary: 'Logout current user' })
  logout(@Req() req) {
    return this.authService.logout(req.user.id);
  }

  @ApiBearerAuth()
  @Patch('change-password')
  @ApiOperation({ summary: 'Change current user password' })
  changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, dto);
  }
}

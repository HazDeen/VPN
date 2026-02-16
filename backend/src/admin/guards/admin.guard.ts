import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Находим пользователя по токену (упрощённо)
    const user = await this.prisma.user.findFirst({
      where: { authToken: token },
    });

    if (!user || !user.isAdmin) {
      throw new UnauthorizedException('Admin access required');
    }

    request.user = user;
    return true;
  }
}
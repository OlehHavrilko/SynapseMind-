import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { User } from '../../domain/entities/user.entity';
import { UserGoal } from '../../domain/entities/user-goal.entity';
import { UserProject } from '../../domain/entities/user-project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserGoal, UserProject])],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}

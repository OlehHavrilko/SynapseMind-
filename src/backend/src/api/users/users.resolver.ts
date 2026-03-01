import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../../domain/entities/user.entity';
import { UserGoal } from '../../domain/entities/user-goal.entity';
import { UserProject } from '../../domain/entities/user-project.entity';
import { UpdateProfileInput, UpdatePreferencesInput, CreateGoalInput, CreateProjectInput } from './dto/users.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => User)
@UseGuards(GqlAuthGuard)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User)
  async user(@Args('id', { type: () => ID }) id: string): Promise<User> {
    return this.usersService.findById(id);
  }

  @Mutation(() => User)
  async updateProfile(
    @CurrentUser() user: User,
    @Args('input') input: UpdateProfileInput,
  ): Promise<User> {
    return this.usersService.updateProfile(user.id, input);
  }

  @Mutation(() => User)
  async updatePreferences(
    @CurrentUser() user: User,
    @Args('input') input: UpdatePreferencesInput,
  ): Promise<User> {
    return this.usersService.updatePreferences(user.id, input);
  }

  @Mutation(() => UserGoal)
  async addGoal(
    @CurrentUser() user: User,
    @Args('input') input: CreateGoalInput,
  ): Promise<UserGoal> {
    return this.usersService.addGoal(user.id, input);
  }

  @Mutation(() => UserGoal)
  async deleteGoal(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.usersService.deleteGoal(id, user.id);
  }

  @Mutation(() => UserProject)
  async addProject(
    @CurrentUser() user: User,
    @Args('input') input: CreateProjectInput,
  ): Promise<UserProject> {
    return this.usersService.addProject(user.id, input);
  }

  @Mutation(() => UserProject)
  async deleteProject(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.usersService.deleteProject(id, user.id);
  }
}

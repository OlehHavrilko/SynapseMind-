import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { Team, TeamMember } from './entities/team.entity';
import { TeamRole } from './entities/team.entity';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../domain/entities/user.entity';

@Resolver()
@UseGuards(GqlAuthGuard)
export class TeamsResolver {
  constructor(private readonly teamsService: TeamsService) {}

  @Query(() => [Team])
  async myTeams(@CurrentUser() user: User): Promise<Team[]> {
    return this.teamsService.getMyTeams(user.id);
  }

  @Query(() => Team)
  async team(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Team> {
    return this.teamsService.getTeamById(id, user.id);
  }

  @Mutation(() => Team)
  async createTeam(
    @CurrentUser() user: User,
    @Args('name') name: string,
  ): Promise<Team> {
    return this.teamsService.createTeam(user.id, name);
  }

  @Mutation(() => TeamMember)
  async inviteToTeam(
    @CurrentUser() user: User,
    @Args('teamId', { type: () => ID }) teamId: string,
    @Args('email') email: string,
    @Args('role', { type: () => TeamRole }) role: TeamRole,
  ): Promise<TeamMember> {
    return this.teamsService.inviteToTeam(teamId, user.id, email, role);
  }

  @Mutation(() => Boolean)
  async removeFromTeam(
    @CurrentUser() user: User,
    @Args('teamId', { type: () => ID }) teamId: string,
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<boolean> {
    return this.teamsService.removeFromTeam(teamId, user.id, userId);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team, TeamMember, TeamRole } from './entities/team.entity';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(TeamMember)
    private readonly memberRepository: Repository<TeamMember>,
  ) {}

  async createTeam(ownerId: string, name: string, description?: string): Promise<Team> {
    const team = this.teamRepository.create({ name, description, ownerId });
    const savedTeam = await this.teamRepository.save(team);
    
    await this.memberRepository.save({
      teamId: savedTeam.id,
      userId: ownerId,
      role: TeamRole.OWNER,
      expertise: [],
    });
    
    return savedTeam;
  }

  async getMyTeams(userId: string): Promise<Team[]> {
    const members = await this.memberRepository.find({
      where: { userId },
      relations: ['team'],
    });
    return members.map(m => m.team);
  }

  async getTeamById(teamId: string, userId: string): Promise<Team> {
    const member = await this.memberRepository.findOne({
      where: { teamId, userId },
      relations: ['team', 'team.members', 'team.members.user'],
    });
    
    if (!member) {
      throw new NotFoundException('Team not found or access denied');
    }
    
    return member.team;
  }

  async inviteToTeam(teamId: string, ownerId: string, email: string, role: TeamRole): Promise<TeamMember> {
    const team = await this.teamRepository.findOne({ where: { id: teamId } });
    if (!team || team.ownerId !== ownerId) {
      throw new NotFoundException('Team not found or access denied');
    }

    return this.memberRepository.create({
      teamId,
      userId: email,
      role,
      expertise: [],
    });
  }

  async removeFromTeam(teamId: string, ownerId: string, userId: string): Promise<boolean> {
    const team = await this.teamRepository.findOne({ where: { id: teamId } });
    if (!team || team.ownerId !== ownerId) {
      throw new NotFoundException('Team not found or access denied');
    }

    await this.memberRepository.delete({ teamId, userId });
    return true;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Profession, LearningStyle, Theme } from '../../domain/entities/user.entity';
import { UserGoal } from '../../domain/entities/user-goal.entity';
import { UserProject } from '../../domain/entities/user-project.entity';
import { CreateUserInput, UpdateProfileInput, UpdatePreferencesInput } from './dto/users.input';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserGoal)
    private readonly goalRepository: Repository<UserGoal>,
    @InjectRepository(UserProject)
    private readonly projectRepository: Repository<UserProject>,
  ) {}

  async create(input: CreateUserInput): Promise<User> {
    const user = this.userRepository.create(input);
    return this.userRepository.save(user);
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['goals', 'projects'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<User> {
    const user = await this.findById(userId);
    Object.assign(user, input);
    return this.userRepository.save(user);
  }

  async updatePreferences(userId: string, input: UpdatePreferencesInput): Promise<User> {
    const user = await this.findById(userId);
    if (input.learningStyle) user.learningStyle = input.learningStyle;
    if (input.theme) user.theme = input.theme;
    if (input.dailyTimeBudget) user.dailyTimeBudget = input.dailyTimeBudget;
    if (input.language) user.language = input.language;
    return this.userRepository.save(user);
  }

  async addGoal(userId: string, input: Partial<UserGoal>): Promise<UserGoal> {
    const goal = this.goalRepository.create({ ...input, userId });
    return this.goalRepository.save(goal);
  }

  async addProject(userId: string, input: Partial<UserProject>): Promise<UserProject> {
    const project = this.projectRepository.create({ ...input, userId });
    return this.projectRepository.save(project);
  }

  async deleteGoal(goalId: string, userId: string): Promise<boolean> {
    const result = await this.goalRepository.delete({ id: goalId, userId });
    return (result.affected || 0) > 0;
  }

  async deleteProject(projectId: string, userId: string): Promise<boolean> {
    const result = await this.projectRepository.delete({ id: projectId, userId });
    return (result.affected || 0) > 0;
  }
}

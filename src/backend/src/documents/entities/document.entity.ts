import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { User } from '../../domain/entities/user.entity';

export enum DocumentSource {
  WEB = 'web',
  YOUTUBE = 'youtube',
  PODCAST = 'podcast',
  PDF = 'pdf',
  EBOOK = 'ebook',
  NOTION = 'notion',
  OBSIDIAN = 'obsidian',
  TWITTER = 'twitter',
  KINDLE = 'kindle',
  MANUAL = 'manual',
}

export enum DocumentType {
  ARTICLE = 'article',
  VIDEO = 'video',
  AUDIO = 'audio',
  NOTE = 'note',
  BOOK = 'book',
}

registerEnumType(DocumentSource, { name: 'DocumentSource' });
registerEnumType(DocumentType, { name: 'DocumentType' });

@ObjectType()
@Entity('documents')
export class Document {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  title: string;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'text' })
  content: string;

  @Field(() => DocumentSource)
  @Column({ type: 'enum', enum: DocumentSource })
  source: DocumentSource;

  @Field({ nullable: true })
  @Column({ nullable: true })
  sourceUrl: string;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'text' })
  summary: string;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'jsonb' })
  metadata: Record<string, any>;

  @Field(() => DocumentType)
  @Column({ type: 'enum', enum: DocumentType, default: DocumentType.ARTICLE })
  type: DocumentType;

  @Field()
  @Column({ default: false })
  isProcessed: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  thumbnail: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  wordCount: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  readingTime: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  language: string;

  @Field(() => [String])
  @Column('text', { array: true, default: [] })
  tags: string[];

  @Field(() => User)
  @ManyToOne(() => User, user => user.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}

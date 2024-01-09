import { Expose } from 'class-transformer';
import {
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export const ticketConstraints = {
  title: {
    min: 3,
    max: 56,
  },
  price: {
    min: 0,
  },
};

export enum TicketStatus {
  WaitingModeration = 'waiting_moderation',
  Approved = 'approved',
  Rejected = 'rejected',
}

export class Ticket {
  @Expose()
  @IsMongoId()
  id: string;

  @Expose()
  @IsString({ message: 'title must be a string' })
  @Length(ticketConstraints.title.min, ticketConstraints.title.max)
  title: string;

  @Expose()
  @IsNumber()
  @Min(ticketConstraints.price.min)
  price: number;

  @Expose()
  @IsEnum(TicketStatus)
  status: TicketStatus = TicketStatus.WaitingModeration;

  @Expose()
  @IsNumber()
  version: number;

  @Expose()
  @IsMongoId()
  userId: string;

  @Expose()
  @IsOptional()
  @IsMongoId()
  orderId?: string;
}
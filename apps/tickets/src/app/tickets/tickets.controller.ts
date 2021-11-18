import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '@ticketing/microservices/shared/decorators';
import { JwtAuthGuard } from '@ticketing/microservices/shared/guards';
import {
  CreateTicketDto,
  TicketDto,
} from '@ticketing/microservices/shared/models';
import { ParseObjectId } from '@ticketing/microservices/shared/pipes';
import { Actions, Resources } from '@ticketing/shared/constants';
import { requestValidationErrorFactory } from '@ticketing/shared/errors';
import { CreateTicket, Ticket, User } from '@ticketing/shared/models';

import { TicketsService } from './tickets.service';

@Controller(Resources.TICKETS)
@ApiTags(Resources.TICKETS)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @UseGuards(JwtAuthGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: requestValidationErrorFactory,
      forbidUnknownValues: true,
      whitelist: true,
    })
  )
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Request creation of a ticket',
    summary: `Create a ticket - Scope : ${Resources.TICKETS}:${Actions.CREATE_ONE}`,
  })
  @ApiBody({ type: CreateTicketDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Ticket created',
    type: TicketDto,
  })
  @Post('')
  createTicket(
    @Body() ticket: CreateTicket,
    @CurrentUser() currentUser: User
  ): Promise<Ticket> {
    return this.ticketsService.create(ticket, currentUser);
  }

  @ApiOperation({
    description: 'Request tickets',
    summary: `Find tickets - Scope : ${Resources.TICKETS}:${Actions.READ_MANY}`,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tickets found',
    type: TicketDto,
    isArray: true,
  })
  @Get('')
  findTickets(): Promise<Ticket[]> {
    return this.ticketsService.find();
  }

  @ApiOperation({
    description: 'Request a ticket by id',
    summary: `Find a ticket - Scope : ${Resources.TICKETS}:${Actions.READ_ONE}`,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ticket found',
    type: TicketDto,
  })
  @Get(':id')
  findTicketById(@Param('id', ParseObjectId) id: string): Promise<Ticket> {
    return this.ticketsService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: requestValidationErrorFactory,
      forbidUnknownValues: true,
      whitelist: true,
    })
  )
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Request a ticket by id',
    summary: `Find a ticket - Scope : ${Resources.TICKETS}:${Actions.UPDATED_ONE}`,
  })
  @ApiBody({ type: CreateTicketDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ticket updated',
    type: TicketDto,
  })
  @Put(':id')
  updateTicketById(
    @Param('id', ParseObjectId) id: string,
    @Body() ticket: CreateTicket,
    @CurrentUser() user: User
  ): Promise<Ticket> {
    return this.ticketsService.updateById(id, ticket, user);
  }
}

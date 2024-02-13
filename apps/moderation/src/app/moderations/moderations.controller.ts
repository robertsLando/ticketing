import {
  OryAuthorizationGuard,
  OryPermissionChecks,
} from '@getlarge/keto-client-wrapper';
import { relationTupleToString } from '@getlarge/keto-relations-parser';
import { OryAuthenticationGuard } from '@getlarge/kratos-client-wrapper';
import {
  Body,
  CanActivate,
  Controller,
  ExecutionContext,
  Get,
  Param,
  Patch,
  Query,
  Type,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { PermissionNamespaces } from '@ticketing/microservices/shared/models';
import { ParseObjectId } from '@ticketing/microservices/shared/pipes';
import { CURRENT_USER_KEY, Resources } from '@ticketing/shared/constants';
import { GenericError } from '@ticketing/shared/errors';
import type { FastifyRequest } from 'fastify';
import { get } from 'lodash-es';

import { GenericExceptionFilter } from '../filters/exception.filter';
import {
  FilterModerationsDto,
  ModerationDto,
  RejectModerationDto,
} from './models';
import { ModerationsService } from './moderations.service';

const adminPermission = (ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest<FastifyRequest>();
  const currentUserId = get(req, `${CURRENT_USER_KEY}.id`);
  return relationTupleToString({
    namespace: PermissionNamespaces[Resources.GROUPS],
    object: 'admin',
    relation: 'members',
    subjectIdOrSet: {
      namespace: PermissionNamespaces[Resources.USERS],
      object: currentUserId,
    },
  });
};

const moderationPermission = (ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest<FastifyRequest>();
  const currentUserId = get(req, `${CURRENT_USER_KEY}.id`);
  const moderationId = get(req.params, 'id');
  return relationTupleToString({
    namespace: PermissionNamespaces[Resources.MODERATIONS],
    object: moderationId,
    relation: 'editors',
    subjectIdOrSet: {
      namespace: PermissionNamespaces[Resources.USERS],
      object: currentUserId,
    },
  });
};

const AuthenticationGuard = (): Type<CanActivate> =>
  OryAuthenticationGuard({
    cookieResolver: (ctx) =>
      ctx.switchToHttp().getRequest<FastifyRequest>().headers.cookie,
    isValidSession: (x) => {
      return (
        !!x?.identity &&
        typeof x.identity.traits === 'object' &&
        !!x.identity.traits &&
        'email' in x.identity.traits &&
        typeof x.identity.metadata_public === 'object' &&
        !!x.identity.metadata_public &&
        'id' in x.identity.metadata_public &&
        typeof x.identity.metadata_public.id === 'string'
      );
    },
    sessionTokenResolver: (ctx) =>
      ctx
        .switchToHttp()
        .getRequest<FastifyRequest>()
        .headers?.authorization?.replace('Bearer ', ''),
    postValidationHook: (ctx, session) => {
      ctx.switchToHttp().getRequest().session = session;
      ctx.switchToHttp().getRequest()[CURRENT_USER_KEY] = {
        id: session.identity.metadata_public['id'],
        email: session.identity.traits.email,
        identityId: session.identity.id,
      };
    },
    unauthorizedFactory(ctx) {
      return new GenericError(
        'Unauthorized',
        401,
        ctx.switchToHttp().getRequest().url,
      );
    },
  });

const AuthorizationGuard = (): Type<CanActivate> =>
  OryAuthorizationGuard({
    unauthorizedFactory(ctx) {
      return new GenericError(
        'Forbidden',
        403,
        ctx.switchToHttp().getRequest().url,
      );
    },
  });

@Controller(Resources.MODERATIONS)
@UseFilters(GenericExceptionFilter)
export class ModerationsController {
  constructor(private readonly moderationService: ModerationsService) {}

  @OryPermissionChecks(adminPermission)
  @UseGuards(AuthenticationGuard(), AuthorizationGuard())
  @Get()
  find(@Query() params: FilterModerationsDto): Promise<ModerationDto[]> {
    return this.moderationService.find(params);
  }

  @OryPermissionChecks(moderationPermission)
  @UseGuards(AuthenticationGuard(), AuthorizationGuard())
  @Get(':id')
  findById(@Param('id', ParseObjectId) id: string): Promise<ModerationDto> {
    return this.moderationService.findById(id);
  }

  @OryPermissionChecks(moderationPermission)
  @UseGuards(AuthenticationGuard(), AuthorizationGuard())
  @Patch(':id/approve')
  approveById(@Param('id', ParseObjectId) id: string): Promise<ModerationDto> {
    return this.moderationService.approveById(id);
  }

  @OryPermissionChecks(moderationPermission)
  @UseGuards(AuthenticationGuard(), AuthorizationGuard())
  @Patch(':id/reject')
  rejectById(
    @Param('id', ParseObjectId) id: string,
    @Body() { rejectionReason }: RejectModerationDto = {},
  ): Promise<ModerationDto> {
    return this.moderationService.rejectById(id, rejectionReason);
  }
}

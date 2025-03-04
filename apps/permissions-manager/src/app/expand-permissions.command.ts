import { Logger } from '@nestjs/common';
import { OryPermissionsService } from '@ticketing/microservices/ory-client';
import {
  type RelationTuple,
  parseRelationTupleString,
} from '@ticketing/microservices/shared/relation-tuple-parser';
import { Command, CommandRunner, Option } from 'nest-commander';

interface CommandOptions {
  tuple: Pick<RelationTuple, 'namespace' | 'object' | 'relation'>;
  depth: number;
}

@Command({ name: 'expand', description: 'Expand permissions on Ory Keto' })
export class ExpandPermissionsCommand extends CommandRunner {
  readonly logger = new Logger(ExpandPermissionsCommand.name);

  constructor(private readonly oryPermissionsService: OryPermissionsService) {
    super();
  }

  async run(passedParams: string[], options: CommandOptions): Promise<void> {
    const { depth, tuple } = options;
    const tree = await this.oryPermissionsService.expandPermissions(
      tuple,
      depth,
    );
    this.logger.log(tree);
  }

  @Option({
    flags: '-t, --tuple [string]',
    description:
      'Relationship tuple to expand from, using Zanzibar notation (without subject)',
    required: true,
  })
  parseRelationTuple(
    val: string,
  ): Pick<RelationTuple, 'namespace' | 'object' | 'relation'> {
    const res = parseRelationTupleString(val);
    if (res.hasError()) {
      throw res.error;
    }
    const tuple = res.unwrapOrThrow();
    delete tuple.subjectIdOrSet;
    return tuple;
  }

  @Option({
    flags: '-d, --depth [string]',
    description: 'Max depth of the tree',
    required: false,
  })
  parseDepth(val: string): number {
    return val ? parseInt(val, 10) : 3;
  }
}

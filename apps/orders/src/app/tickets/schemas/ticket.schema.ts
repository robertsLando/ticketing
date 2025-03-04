import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { omit } from 'lodash-es';
import { Document, Model } from 'mongoose';

import { OrderStatus } from '../../orders/models';
import { Order, OrderDocument } from '../../orders/schemas';
import { Ticket as TicketAttrs } from '../models';

@Schema({
  toJSON: {
    transform(doc: TicketDocument, ret: TicketAttrs) {
      ret.id = doc._id.toString();
      return omit(ret, ['_id', '__v']);
    },
  },
})
export class Ticket implements TicketAttrs {
  @Prop({ type: String, virtual: true })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  id: any;

  @Prop({
    type: String,
    required: true,
  })
  title: string;

  @Prop({ type: Number, required: true, min: 0 })
  price: number;

  @Prop({ type: Number, required: true, default: 0 })
  version: number;

  isReserved: () => Promise<boolean>;
}

export type TicketDocument = Ticket & Document;

export const TicketSchema = SchemaFactory.createForClass(Ticket);

export type TicketModel = Model<TicketDocument>;

TicketSchema.methods.isReserved = async function (): Promise<boolean> {
  const orderModel = this.db.model(Order.name) as Model<OrderDocument>;
  const existingOrder = await orderModel.findOne({
    ticket: this as TicketDocument,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });
  return !!existingOrder;
};

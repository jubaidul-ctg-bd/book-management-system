import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import * as uniqueValidator from 'mongoose-unique-validator';

export type AuthorDocument = Author & Document;

@Schema({ timestamps: true })
export class Author {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop()
  bio?: string;

  @Prop()
  birthDate?: Date;
}
const schema = SchemaFactory.createForClass(Author);
schema.plugin(uniqueValidator, {
  message: '{PATH} already exists!',
});
schema.plugin(mongoosePaginate);
export const PackSchema = schema;

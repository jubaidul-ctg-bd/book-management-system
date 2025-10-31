import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import * as uniqueValidator from 'mongoose-unique-validator';
import { Author } from 'src/authors/schemas/author.schema';

export type BookDocument = Book & Document;

@Schema({ timestamps: true, versionKey: false })
export class Book {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  isbn: string;

  @Prop()
  publishedDate?: Date;

  @Prop()
  genre?: string;

  @Prop({ type: Types.ObjectId, ref: 'Author', required: true })
  author: Author;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

const schema = SchemaFactory.createForClass(Book);
schema.plugin(uniqueValidator, {
  message: '{PATH} already exists!',
});
schema.plugin(mongoosePaginate);
export const PackSchema = schema;

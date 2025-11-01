import {
  IsDateString,
  IsISBN,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsISBN()
  @IsNotEmpty()
  isbn: string;

  @IsDateString()
  @IsOptional()
  publishedDate?: Date;

  @IsString()
  @IsOptional()
  genre?: string;

  @IsMongoId()
  @IsNotEmpty()
  authorId: string;
}

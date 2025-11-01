import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel, PaginateResult, Types } from 'mongoose';
import { AuthorsService } from '../authors/authors.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book, BookDocument } from './schemas/book.schema';

@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book.name) private bookModel: PaginateModel<BookDocument>,
    private authorsService: AuthorsService,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    await this.authorsService.findOne(createBookDto.authorId);

    const bookData = {
      ...createBookDto,
      author: new Types.ObjectId(createBookDto.authorId),
    };

    const createdBook = new this.bookModel(bookData);
    const savedBook = await createdBook.save();
    return this.findOne(savedBook.id);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    authorId?: string,
  ): Promise<PaginateResult<BookDocument>> {
    const query: Record<string, any> = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } },
      ];
    }

    if (authorId) {
      query.author = authorId;
    }

    return this.bookModel.paginate(query, {
      page,
      limit,
    });
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.bookModel.findById(id).populate('author').exec();
    if (!book) {
      throw new NotFoundException(`Book not found`);
    }
    return book;
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    if (updateBookDto.authorId) {
      await this.authorsService.findOne(updateBookDto.authorId);
      const updateData: any = {
        ...updateBookDto,
        author: new Types.ObjectId(updateBookDto.authorId),
      };
      delete updateData.authorId;
      updateBookDto = updateData;
    }

    const updatedBook = await this.bookModel
      .findByIdAndUpdate(id, updateBookDto, { new: true })
      .populate('author')
      .exec();

    if (!updatedBook) {
      throw new NotFoundException(`Book not found`);
    }

    return updatedBook;
  }

  async remove(id: string): Promise<void> {
    const result = await this.bookModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Book not found`);
    }
  }
}

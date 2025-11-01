import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel, PaginateResult } from 'mongoose';
import { Book, BookDocument } from 'src/books/schemas/book.schema';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { Author, AuthorDocument } from './schemas/author.schema';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectModel(Author.name)
    private authorModel: PaginateModel<AuthorDocument>,
    @InjectModel(Book.name) private bookModel: PaginateModel<BookDocument>,
  ) {}

  async create(createAuthorDto: CreateAuthorDto): Promise<Author> {
    const createdAuthor = new this.authorModel(createAuthorDto);
    return createdAuthor.save();
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<PaginateResult<AuthorDocument>> {
    let query = {};

    if (search) {
      query = {
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
        ],
      };
    }

    return this.authorModel.paginate(query, {
      page,
      limit,
    });
  }

  async findOne(id: string): Promise<Author> {
    const author = await this.authorModel.findById(id).exec();
    if (!author) {
      throw new NotFoundException(`Author not found`);
    }
    return author;
  }

  async update(id: string, updateAuthorDto: UpdateAuthorDto): Promise<Author> {
    const updatedAuthor = await this.authorModel
      .findByIdAndUpdate(id, updateAuthorDto, { new: true })
      .exec();

    if (!updatedAuthor) {
      throw new NotFoundException(`Author not found`);
    }

    return updatedAuthor;
  }

  async remove(id: string): Promise<void> {
    const author = await this.authorModel.findById(id);
    if (!author) {
      throw new NotFoundException('Author not found');
    }

    const booksCount = await this.bookModel.countDocuments({
      author: author._id,
    });
    if (booksCount > 0) {
      throw new ConflictException('Cannot delete author with existing books');
    }
    await this.authorModel.deleteOne({ _id: author._id });
    return;
  }
}

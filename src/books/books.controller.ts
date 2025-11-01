import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  async create(@Body(new ValidationPipe()) createBookDto: CreateBookDto) {
    return {
      message: 'Book created successfully',
      result: await this.booksService.create(createBookDto),
    };
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('authorId') authorId?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return {
      message: 'Books retrieved successfully',
      result: await this.booksService.findAll(
        pageNum,
        limitNum,
        search,
        authorId,
      ),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return {
      message: 'Book retrieved successfully',
      result: await this.booksService.findOne(id),
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateBookDto: UpdateBookDto,
  ) {
    return {
      message: 'Author updated successfully',
      result: await this.booksService.update(id, updateBookDto),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return {
      message: 'Book deleted successfully',
      result: await this.booksService.remove(id),
    };
  }
}

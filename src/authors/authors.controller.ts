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
} from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Post()
  async create(@Body() createAuthorDto: CreateAuthorDto) {
    return {
      message: 'Author created successfully',
      result: await this.authorsService.create(createAuthorDto),
    };
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return {
      message: 'Authors retrieved successfully',
      result: await this.authorsService.findAll(pageNum, limitNum, search),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return {
      message: 'Author retrieved successfully',
      result: await this.authorsService.findOne(id),
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAuthorDto: UpdateAuthorDto,
  ) {
    return {
      message: 'Author updated successfully',
      result: await this.authorsService.update(id, updateAuthorDto),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return {
      message: 'Author deleted successfully',
      result: await this.authorsService.remove(id),
    };
  }
}

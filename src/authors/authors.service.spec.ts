import { ConflictException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Book } from '../books/schemas/book.schema';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { Author } from './schemas/author.schema';

describe('AuthorsService', () => {
  let authorsService: AuthorsService;
  let authorModel: any;
  let bookModel: any;

  const mockAuthor = {
    _id: '507f1f77bcf86cd799439011',
    firstName: 'John',
    lastName: 'Doe',
    bio: 'A great author',
    birthDate: new Date('1980-01-01'),
    save: jest.fn(),
  };

  const mockCreateAuthorDto: CreateAuthorDto = {
    firstName: 'John',
    lastName: 'Doe',
    bio: 'A great author',
    birthDate: new Date('1980-01-01'),
  };

  const mockUpdateAuthorDto: UpdateAuthorDto = {
    firstName: 'Jane',
    bio: 'An amazing author',
  };

  const mockPaginateResult = {
    docs: [mockAuthor],
    totalDocs: 1,
    limit: 10,
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: null,
    prevPage: null,
    pagingCounter: 1,
  };

  beforeEach(async () => {
    const mockAuthorModel = {
      new: jest.fn().mockResolvedValue(mockAuthor),
      constructor: jest.fn().mockResolvedValue(mockAuthor),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      deleteOne: jest.fn(),
      paginate: jest.fn(),
      exec: jest.fn(),
    };

    const mockBookModel = {
      countDocuments: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorsService,
        {
          provide: getModelToken(Author.name),
          useValue: mockAuthorModel,
        },
        {
          provide: getModelToken(Book.name),
          useValue: mockBookModel,
        },
      ],
    }).compile();

    authorsService = module.get<AuthorsService>(AuthorsService);
    authorModel = module.get(getModelToken(Author.name));
    bookModel = module.get(getModelToken(Book.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authorsService).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a new author', async () => {
      // Arrange
      const mockSave = jest.fn().mockResolvedValue(mockAuthor);
      authorModel = jest.fn().mockImplementation(() => ({
        save: mockSave,
      }));
      authorsService['authorModel'] = authorModel;

      // Act
      const result = await authorsService.create(mockCreateAuthorDto);

      // Assert
      expect(authorModel).toHaveBeenCalledWith(mockCreateAuthorDto);
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(mockAuthor);
    });

    it('should throw an error if save fails', async () => {
      // Arrange
      const error = new Error('Database error');
      const mockSave = jest.fn().mockRejectedValue(error);
      authorModel = jest.fn().mockImplementation(() => ({
        save: mockSave,
      }));
      authorsService['authorModel'] = authorModel;

      // Act & Assert
      await expect(authorsService.create(mockCreateAuthorDto)).rejects.toThrow(
        error,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated authors without search', async () => {
      // Arrange
      authorModel.paginate = jest.fn().mockResolvedValue(mockPaginateResult);

      // Act
      const result = await authorsService.findAll(1, 10);

      // Assert
      expect(authorModel.paginate).toHaveBeenCalledWith(
        {},
        { page: 1, limit: 10 },
      );
      expect(result).toEqual(mockPaginateResult);
    });

    it('should return paginated authors with search query', async () => {
      // Arrange
      const searchTerm = 'John';
      const expectedQuery = {
        $or: [
          { firstName: { $regex: searchTerm, $options: 'i' } },
          { lastName: { $regex: searchTerm, $options: 'i' } },
        ],
      };
      authorModel.paginate = jest.fn().mockResolvedValue(mockPaginateResult);

      // Act
      const result = await authorsService.findAll(1, 10, searchTerm);

      // Assert
      expect(authorModel.paginate).toHaveBeenCalledWith(expectedQuery, {
        page: 1,
        limit: 10,
      });
      expect(result).toEqual(mockPaginateResult);
    });

    it('should use default pagination values', async () => {
      // Arrange
      authorModel.paginate = jest.fn().mockResolvedValue(mockPaginateResult);

      // Act
      const result = await authorsService.findAll();

      // Assert
      expect(authorModel.paginate).toHaveBeenCalledWith(
        {},
        { page: 1, limit: 10 },
      );
      expect(result).toEqual(mockPaginateResult);
    });
  });

  describe('findOne', () => {
    it('should return an author by id', async () => {
      // Arrange
      const authorId = '507f1f77bcf86cd799439011';
      const mockExec = jest.fn().mockResolvedValue(mockAuthor);
      authorModel.findById = jest.fn().mockReturnValue({ exec: mockExec });

      // Act
      const result = await authorsService.findOne(authorId);

      // Assert
      expect(authorModel.findById).toHaveBeenCalledWith(authorId);
      expect(mockExec).toHaveBeenCalled();
      expect(result).toEqual(mockAuthor);
    });

    it('should throw NotFoundException when author is not found', async () => {
      // Arrange
      const authorId = '507f1f77bcf86cd799439011';
      const mockExec = jest.fn().mockResolvedValue(null);
      authorModel.findById = jest.fn().mockReturnValue({ exec: mockExec });

      // Act & Assert
      await expect(authorsService.findOne(authorId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(authorsService.findOne(authorId)).rejects.toThrow(
        'Author not found',
      );
    });
  });

  describe('update', () => {
    it('should update and return the updated author', async () => {
      // Arrange
      const authorId = '507f1f77bcf86cd799439011';
      const updatedAuthor = { ...mockAuthor, ...mockUpdateAuthorDto };
      const mockExec = jest.fn().mockResolvedValue(updatedAuthor);
      authorModel.findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({ exec: mockExec });

      // Act
      const result = await authorsService.update(authorId, mockUpdateAuthorDto);

      // Assert
      expect(authorModel.findByIdAndUpdate).toHaveBeenCalledWith(
        authorId,
        mockUpdateAuthorDto,
        { new: true },
      );
      expect(mockExec).toHaveBeenCalled();
      expect(result).toEqual(updatedAuthor);
    });

    it('should throw NotFoundException when author to update is not found', async () => {
      // Arrange
      const authorId = '507f1f77bcf86cd799439011';
      const mockExec = jest.fn().mockResolvedValue(null);
      authorModel.findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({ exec: mockExec });

      // Act & Assert
      await expect(
        authorsService.update(authorId, mockUpdateAuthorDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        authorsService.update(authorId, mockUpdateAuthorDto),
      ).rejects.toThrow('Author not found');
    });
  });

  describe('remove', () => {
    it('should successfully delete an author with no books', async () => {
      // Arrange
      const authorId = '507f1f77bcf86cd799439011';
      authorModel.findById = jest.fn().mockResolvedValue(mockAuthor);
      bookModel.countDocuments = jest.fn().mockResolvedValue(0);
      authorModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });

      // Act
      const result = await authorsService.remove(authorId);

      // Assert
      expect(authorModel.findById).toHaveBeenCalledWith(authorId);
      expect(bookModel.countDocuments).toHaveBeenCalledWith({
        author: mockAuthor._id,
      });
      expect(authorModel.deleteOne).toHaveBeenCalledWith({
        _id: mockAuthor._id,
      });
      expect(result).toBeUndefined();
    });

    it('should throw NotFoundException when author to delete is not found', async () => {
      // Arrange
      const authorId = '507f1f77bcf86cd799439011';
      authorModel.findById = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(authorsService.remove(authorId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(authorsService.remove(authorId)).rejects.toThrow(
        'Author not found',
      );
      expect(bookModel.countDocuments).not.toHaveBeenCalled();
      expect(authorModel.deleteOne).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when author has existing books', async () => {
      // Arrange
      const authorId = '507f1f77bcf86cd799439011';
      authorModel.findById = jest.fn().mockResolvedValue(mockAuthor);
      bookModel.countDocuments = jest.fn().mockResolvedValue(3); // Author has 3 books

      // Act & Assert
      await expect(authorsService.remove(authorId)).rejects.toThrow(
        ConflictException,
      );
      await expect(authorsService.remove(authorId)).rejects.toThrow(
        'Cannot delete author with existing books',
      );
      expect(authorModel.deleteOne).not.toHaveBeenCalled();
    });
  });
});

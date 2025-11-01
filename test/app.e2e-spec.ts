import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Authors API (e2e)', () => {
  let app: INestApplication<App>;
  let mongod: MongoMemoryServer;
  let createdAuthorId: string;

  beforeAll(async () => {
    // Start in-memory MongoDB instance
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(MongooseModule)
      .useModule(MongooseModule.forRoot(uri))
      .compile();

    app = moduleFixture.createNestApplication();

    // Apply same global configuration as main app
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    if (mongod) {
      await mongod.stop();
    }
  });

  describe('/authors (POST)', () => {
    it('should create a new author successfully', async () => {
      const createAuthorDto = {
        firstName: 'John',
        lastName: 'Doe',
        bio: 'A renowned author of fiction novels',
        birthDate: '1980-05-15',
      };

      const response = await request(app.getHttpServer())
        .post('/authors')
        .send(createAuthorDto)
        .expect(201);

      expect(response.body).toMatchObject({
        statusCode: 201,
        message: 'Author created successfully',
        data: expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          bio: 'A renowned author of fiction novels',
          _id: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      });

      // Store the created author ID for subsequent tests
      createdAuthorId = response.body.data._id;
    });

    it('should return 400 for invalid author data', async () => {
      const invalidAuthorDto = {
        firstName: '', // Invalid: empty string
        lastName: 'Doe',
        bio: 'A great author',
      };

      const response = await request(app.getHttpServer())
        .post('/authors')
        .send(invalidAuthorDto)
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('firstName should not be empty'),
        error: 'Bad Request',
      });
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteAuthorDto = {
        bio: 'Missing required fields',
      };

      const response = await request(app.getHttpServer())
        .post('/authors')
        .send(incompleteAuthorDto)
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: expect.stringMatching(/(firstName|lastName)/),
        error: 'Bad Request',
      });
    });
  });

  describe('/authors (GET)', () => {
    it('should retrieve all authors with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/authors')
        .expect(200);

      expect(response.body).toMatchObject({
        statusCode: 200,
        message: 'Authors retrieved successfully',
        data: expect.objectContaining({
          docs: expect.any(Array),
          totalDocs: expect.any(Number),
          limit: 10,
          page: 1,
          totalPages: expect.any(Number),
          hasNextPage: expect.any(Boolean),
          hasPrevPage: expect.any(Boolean),
        }),
      });

      expect(response.body.data.docs.length).toBeGreaterThan(0);
      expect(response.body.data.docs[0]).toMatchObject({
        firstName: expect.any(String),
        lastName: expect.any(String),
        _id: expect.any(String),
      });
    });

    it('should retrieve authors with custom pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/authors?page=1&limit=5')
        .expect(200);

      expect(response.body.data).toMatchObject({
        limit: 5,
        page: 1,
      });
    });

    it('should search authors by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/authors?search=John')
        .expect(200);

      expect(response.body.data.docs).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            firstName: 'John',
          }),
        ]),
      );
    });

    it('should return empty results for non-matching search', async () => {
      const response = await request(app.getHttpServer())
        .get('/authors?search=NonExistentName')
        .expect(200);

      expect(response.body.data.docs).toHaveLength(0);
    });
  });

  describe('/authors/:id (GET)', () => {
    it('should retrieve a specific author by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/authors/${createdAuthorId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        statusCode: 200,
        message: 'Author retrieved successfully',
        data: expect.objectContaining({
          _id: createdAuthorId,
          firstName: 'John',
          lastName: 'Doe',
          bio: 'A renowned author of fiction novels',
        }),
      });
    });

    it('should return 404 for non-existent author ID', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011'; // Valid ObjectId format

      const response = await request(app.getHttpServer())
        .get(`/authors/${nonExistentId}`)
        .expect(404);

      expect(response.body).toMatchObject({
        statusCode: 404,
        message: 'Author not found',
        error: 'Not Found',
      });
    });

    it('should return 400 for invalid author ID format', async () => {
      const invalidId = 'invalid-id-format';

      const response = await request(app.getHttpServer())
        .get(`/authors/${invalidId}`)
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: 'Invalid ID format',
        error: 'Bad Request',
      });
    });
  });

  describe('/authors/:id (PATCH)', () => {
    it('should update an existing author', async () => {
      const updateAuthorDto = {
        firstName: 'Jane',
        bio: 'An updated biography for the author',
      };

      const response = await request(app.getHttpServer())
        .patch(`/authors/${createdAuthorId}`)
        .send(updateAuthorDto)
        .expect(200);

      expect(response.body).toMatchObject({
        statusCode: 200,
        message: 'Author updated successfully',
        data: expect.objectContaining({
          _id: createdAuthorId,
          firstName: 'Jane', // Updated
          lastName: 'Doe', // Unchanged
          bio: 'An updated biography for the author', // Updated
        }),
      });
    });

    it('should return 404 when updating non-existent author', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const updateAuthorDto = {
        firstName: 'Updated Name',
      };

      const response = await request(app.getHttpServer())
        .patch(`/authors/${nonExistentId}`)
        .send(updateAuthorDto)
        .expect(404);

      expect(response.body).toMatchObject({
        statusCode: 404,
        message: 'Author not found',
        error: 'Not Found',
      });
    });

    it('should return 400 for invalid update data', async () => {
      const invalidUpdateDto = {
        firstName: '', // Invalid: empty string
      };

      const response = await request(app.getHttpServer())
        .patch(`/authors/${createdAuthorId}`)
        .send(invalidUpdateDto)
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('firstName should not be empty'),
      });
    });
  });

  describe('/authors/:id (DELETE)', () => {
    it('should delete an existing author', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/authors/${createdAuthorId}`)
        .expect(204);

      // No content expected for 204 response
      expect(response.body).toEqual({});
    });

    it('should return 404 when deleting non-existent author', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/authors/${createdAuthorId}`) // Already deleted
        .expect(404);

      expect(response.body).toMatchObject({
        statusCode: 404,
        message: 'Author not found',
        error: 'Not Found',
      });
    });

    it('should return 400 for invalid author ID format on delete', async () => {
      const invalidId = 'invalid-id-format';

      const response = await request(app.getHttpServer())
        .delete(`/authors/${invalidId}`)
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: 'Invalid ID format',
      });
    });
  });

  describe('Complete CRUD Flow', () => {
    it('should perform complete CRUD operations in sequence', async () => {
      // 1. CREATE - Create a new author
      const createResponse = await request(app.getHttpServer())
        .post('/authors')
        .send({
          firstName: 'Alice',
          lastName: 'Johnson',
          bio: 'Sci-fi novelist',
          birthDate: '1975-03-20',
        })
        .expect(201);

      const authorId = createResponse.body.data._id;

      // 2. READ - Retrieve the created author
      const getResponse = await request(app.getHttpServer())
        .get(`/authors/${authorId}`)
        .expect(200);

      expect(getResponse.body.data).toMatchObject({
        firstName: 'Alice',
        lastName: 'Johnson',
        bio: 'Sci-fi novelist',
      });

      // 3. UPDATE - Update the author
      const updateResponse = await request(app.getHttpServer())
        .patch(`/authors/${authorId}`)
        .send({
          bio: 'Award-winning sci-fi novelist',
        })
        .expect(200);

      expect(updateResponse.body.data.bio).toBe(
        'Award-winning sci-fi novelist',
      );

      // 4. DELETE - Delete the author
      await request(app.getHttpServer())
        .delete(`/authors/${authorId}`)
        .expect(204);

      // 5. VERIFY DELETION - Confirm author no longer exists
      await request(app.getHttpServer())
        .get(`/authors/${authorId}`)
        .expect(404);
    });
  });

  describe('App Root Endpoint', () => {
    it('/ (GET)', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            statusCode: 200,
            message: 'Request successful',
          });
        });
    });
  });
});

import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    response.status(response.statusCode || HttpStatus.OK);
    return next.handle().pipe(
      map((data) => {
        return {
          statusCode: response.statusCode || HttpStatus.OK,
          message: data.message || 'Request successful',
          data: data.result,
        };
      }),
    );
  }
}

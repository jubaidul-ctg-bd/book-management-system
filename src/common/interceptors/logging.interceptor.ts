import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor() {}

  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const userAgent = request.get('user-agent') || '';
    const { ip, method, path: url } = request;

    const now = Date.now();
    return next.handle().pipe(
      tap(
        () => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;

          this.logger.log(
            `${method} ${statusCode} ${url} ${userAgent} ${ip}: ${
              Date.now() - now
            }ms`,
          );
        },
        (error) => {
          if (typeof error == 'object' && 'response' in error) {
            const { statusCode, message } = error.response;
            this.logger.error(
              `${method} ${statusCode} : ${message}  ${url} ${userAgent} ${ip}: ${
                Date.now() - now
              }ms`,
            );
          } else {
            this.logger.error(
              `Backend Exception: ${method} ${url} ${userAgent}`,
              error.stack,
            );
          }
        },
      ),
    );
  }
}

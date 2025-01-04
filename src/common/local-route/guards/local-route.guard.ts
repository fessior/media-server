import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { commonConfig, CommonConfigType } from '@/common/config';
import { CustomDecoratorKey } from '@/common/custom-decorator-keys';

@Injectable()
export class LocalRouteGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(commonConfig.KEY) private appCommonConfig: CommonConfigType,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const hasLocalRouteDecorator = !!this.reflector.get(
      CustomDecoratorKey.LOCAL_ROUTE,
      context.getHandler(),
    );
    console.log(this.appCommonConfig.nodeEnv);

    return !hasLocalRouteDecorator || this.appCommonConfig.nodeEnv === 'local';
  }
}

import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { CustomDecoratorKey } from '@/common/custom-decorator-keys';

/* Desinate a route as only runnable locally */
export const LocalRoute = (): CustomDecorator =>
  SetMetadata(CustomDecoratorKey.LOCAL_ROUTE, {});

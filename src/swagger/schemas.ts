import { ExplorationSwaggerSchemas, PaginationReqSwaggerSchemas } from '@utils';
import { AuthSwaggerSchemas, SchedulesSwaggerSchemas, UsersSwaggerSchemas } from '@modules';

const schemas = Object.assign(
  { ...ExplorationSwaggerSchemas },
  { ...PaginationReqSwaggerSchemas },
  { ...AuthSwaggerSchemas },
  { ...UsersSwaggerSchemas },
  { ...SchedulesSwaggerSchemas }
);

export default schemas;

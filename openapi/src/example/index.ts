import * as express from 'express';
import {attachControllers, Controller, Get, Put, Response} from "@decorators/express";
import {enableOpenApi, registerSchema} from "../helpers";
import {
  BodyContent, Deprecated,
  OpenApiResponse,
  OpenApiSchema,
  Param, Parameters,
  Property,
  Responses,
  Summary, Tags,
  WithDefinitions
} from "../decorators";

const app = express();

@WithDefinitions({ basePath: '/users' })
@Controller('/users')
class UsersController {
  @Get('/')
  @Summary('this endpoint gets a list of users')
  @Parameters([
    { name: 'id', 'in': 'query' },
    { name: 'created_after', in: 'query' }
  ])
  @OpenApiResponse(200, 'Successful response')
  @OpenApiResponse(200, 'application/json', { $ref: '#/components/schemas/User' })
  public getUsers(@Response() res: express.Response) {
    res.send([]);
  }

  // Defining all responses at once
  @Get('/:id')
  @Param('id', 'path', { required: true })
  @Responses({
    '200': {
      description: 'successful response',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/User',
          }
        }
      }
    },
    '404': {
      description: 'user not found',
      content: {},
    }
  })
  public getUserById(@Response() res: express.Response) {
    res.sendStatus(404);
  }

  // custom tags for one operation
  @Put('/:id')
  @Param('id', 'path', { required: true })
  @BodyContent('application/json', { $ref: '#/components/schemas/User' })
  @Responses({
    '200': {
      description: 'successful response',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/User',
          }
        }
      }
    },
    '400': {
      description: 'bad request',
      content: {},
    }
  })
  @Tags('users', 'upsert functions') // When defining custom tags, the default one is excluded
  public upsertUser(@Response() res: express.Response) {
    res.sendStatus(400);
  }

  // deprecated endpoints
  @Get('/get_by_post_id')
  @Param('post_id', 'query', { required: true })
  @Deprecated()
  public getUserByPostId(@Response() res: express.Response) {
    res.send(new User());
  }

}

@OpenApiSchema()
// @ts-ignore
class User {
  @Property({ type: 'string', format: 'uuid', readOnly: true })
  public id: string;

  @Property({ type: 'array', items: { $ref: '#/components/schemas/Post' } })
  public posts: object[];
}

registerSchema('Post', {
  type: 'object',
  properties: {
    id: { type: 'integer', minimum: 1, readOnly: true },
    content: { type: 'string' }
  },
  required: ['id'],
  example: { id: 1, content: 'lorem ipsum dolor' }
});

// it is also possible to define non-object schemas with registerSchema
registerSchema('uuid', {
  type: "string",
  format: 'uuid',
});
registerSchema('successfulHttpStatus', {
  type: 'integer',
  minimum: 200,
  maximum: 299,
});

attachControllers(app, [UsersController]);
enableOpenApi(app);

app.listen(3000);

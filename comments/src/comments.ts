import {
  FastifyInstance,
  FastifyPluginOptions,
  RouteShorthandOptions,
} from 'fastify';
import { randomBytes } from 'crypto';

interface Comment {
  id: string;
  comment: string;
}

interface AllComments {
  [key: string]: Comment[];
}

interface GetComments {
  Querystring: {
    postId: string;
  };
  Reply: Comment[];
}

interface PostComment {
  Body: {
    postId: string;
    comment: string;
  };
  Reply: {
    result: 'success';
  };
}

const allComments: AllComments = {};

export async function commentRoutes(
  router: FastifyInstance,
  options: FastifyPluginOptions
) {
  const opts: { [keys: string]: RouteShorthandOptions } = {};

  // json schema for data validation
  opts['get-comments'] = {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          postId: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              comment: { type: 'string' },
            },
          },
        },
      },
    },
  };

  router.get<GetComments>(
    '/comments',
    opts['get-comments'],
    async (req, res) => {
      const { postId } = req.query;
      const comments = allComments[postId] || [];

      return comments;
    }
  );

  opts['post-comments'] = {
    schema: {
      body: {
        type: 'object',
        properties: {
          postId: { type: 'string' },
          comment: { type: 'string' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            result: { type: 'string', pattern: 'success' },
          },
        },
      },
    },
  };

  router.post<PostComment>(
    '/comment',
    opts['post-comments'],
    async (req, res) => {
      const id = randomBytes(4).toString('hex');
      const { postId, comment } = req.body;

      const comments = allComments[postId] || [];

      allComments[postId] = [...comments, { id, comment }];

      res.code(201);
      return { result: 'success' };
    }
  );
}
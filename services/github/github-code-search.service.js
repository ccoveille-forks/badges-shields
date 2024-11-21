import Joi from 'joi'
import { queryParams } from '../index.js'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation } from './github-helpers.js'

const schema = Joi.object({ total_count: nonNegativeInteger }).required()

const queryParamSchema = Joi.object({
  query: Joi.string().required(),
}).required()

const codeSearchDocs = `
For a full list of available filters and allowed values,
see GitHub's documentation on
[Searching code](https://docs.github.com/en/search-github/github-code-search/understanding-github-code-search-syntax)

${documentation}`

export class GitHubCodeSearch extends GithubAuthV3Service {
  static category = 'analysis'

  static route = {
    base: 'github',
    pattern: 'code-search',
    queryParamSchema,
  }

  static openApi = {
    '/github/code-search': {
      get: {
        summary: 'GitHub code search count',
        description: codeSearchDocs,
        parameters: queryParams({
          name: 'query',
          example: 'goto language:javascript NOT is:fork NOT is:archived',
          required: true,
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'counter',
  }

  async handle(_routeParams, { query }) {
    const { total_count: totalCount } = await this._requestJson({
      url: '/search/code',
      options: {
        searchParams: {
          q: query,
        },
      },
      schema,
      httpErrors: {
        401: 'auth required for search api',
      },
    })

    return {
      label: `${query} counter`,
      message: metric(totalCount),
      color: 'blue',
    }
  }
}
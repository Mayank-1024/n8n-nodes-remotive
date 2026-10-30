# n8n-nodes-remotive

An n8n community node that searches remote job listings from the free [Remotive](https://remotive.com) public API.

Built with [Claude Code](https://claude.com/claude-code) by Mayank Bhadrasen, as a small declarative-style example.

## Installation

In n8n: **Settings → Community Nodes → Install**, then enter `n8n-nodes-remotive`. See the [community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).

## Operations

**Job → Search**

| Parameter | What it does |
|---|---|
| Search Term | Words to match in the title, company or tags. Empty means all jobs. |
| Category | One Remotive category, or all. |
| Limit | Maximum number of jobs to return. |

Note: on 2026-10-30 the free Remotive API ignored its own search, category and limit parameters and returned its latest 12 jobs, so this node filters and limits the results itself.

Each job comes out as one item with these fields: `id`, `title`, `company`, `category`, `jobType`, `location`, `salary`, `tags`, `publishedAt`, `url`, `source`.

## Credentials

None. The Remotive API is public.

## Usage notes

- Remotive's terms ask you to link back to the job `url` and name Remotive as the source. Every item keeps both.
- Remotive advises calling the API at most 4 times a day, and listings are delayed by 24 hours. Schedule your workflow accordingly.

## Compatibility

Built with `@n8n/node-cli` 0.54.6 and tested on n8n 2.45.7. No runtime dependencies.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Remotive API documentation](https://remotive.com/api-documentation)

## License

[MIT](LICENSE.md)

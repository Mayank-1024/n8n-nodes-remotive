import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

// Remotive's public API needs no key. Their terms ask you to link back to the
// job URL and name Remotive as the source, so every item keeps `url` and
// `source`. They also advise calling it at most 4 times a day.
export class Remotive implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Remotive',
		name: 'remotive',
		icon: { light: 'file:remotive.svg', dark: 'file:remotive.dark.svg' },
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Search remote job listings on Remotive',
		defaults: {
			name: 'Remotive',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		requestDefaults: {
			baseURL: 'https://remotive.com/api',
			headers: {
				Accept: 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [{ name: 'Job', value: 'job' }],
				default: 'job',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['job'] } },
				options: [
					{
						name: 'Search',
						value: 'search',
						action: 'Search jobs',
						description: 'Search remote job listings',
						routing: {
							request: {
								method: 'GET',
								url: '/remote-jobs',
							},
							output: {
								postReceive: [
									// The API returns { "job-count": n, "jobs": [...] }.
									// Turn the jobs array into one n8n item per job.
									{
										type: 'rootProperty',
										properties: { property: 'jobs' },
									},
									// Checked 2026-10-30: the free API ignores search, category
									// and limit and always returns its latest ~12 jobs. So the
									// node still sends them, and also filters and limits here.
									{
										type: 'filter',
										properties: {
											pass: `={{
												(!$parameter.search ||
													[$responseItem.title, $responseItem.company_name, ($responseItem.tags || []).join(' ')]
														.join(' ').toLowerCase().includes($parameter.search.toLowerCase()))
												&& (!$parameter.category || $responseItem.category === $parameter.category)
											}}`,
										},
									},
									{
										type: 'limit',
										properties: { maxResults: '={{$parameter.limit}}' },
									},
									// Keep only clean, renamed fields.
									{
										type: 'setKeyValue',
										properties: {
											id: '={{$responseItem.id}}',
											title: '={{$responseItem.title}}',
											company: '={{$responseItem.company_name}}',
											category: '={{$responseItem.category}}',
											jobType: '={{$responseItem.job_type}}',
											location: '={{$responseItem.candidate_required_location}}',
											salary: '={{$responseItem.salary}}',
											tags: '={{($responseItem.tags || []).join(", ")}}',
											publishedAt: '={{$responseItem.publication_date}}',
											url: '={{$responseItem.url}}',
											source: 'Remotive',
										},
									},
								],
							},
						},
					},
				],
				default: 'search',
			},
			{
				displayName: 'Search Term',
				name: 'search',
				type: 'string',
				default: '',
				placeholder: 'e.g. automation engineer',
				description: 'Words to match in the job title, company or tags. Leave empty for all jobs.',
				displayOptions: { show: { resource: ['job'], operation: ['search'] } },
				routing: {
					send: {
						type: 'query',
						property: 'search',
						// Skip the query parameter when the field is empty.
						value: '={{ $value || undefined }}',
					},
				},
			},
			{
				displayName: 'Category',
				name: 'category',
				type: 'options',
				default: '',
				description: 'Only return jobs in this category',
				displayOptions: { show: { resource: ['job'], operation: ['search'] } },
				// Values are Remotive's category names, matched against each job.
				options: [
					{ name: 'All Categories', value: '' },
					{ name: 'Artificial Intelligence', value: 'Artificial Intelligence' },
					{ name: 'Customer Service', value: 'Customer Service' },
					{ name: 'Data and Analytics', value: 'Data and Analytics' },
					{ name: 'Devops', value: 'Devops' },
					{ name: 'Engineering', value: 'Engineering' },
					{ name: 'Information Technology', value: 'Information Technology' },
					{ name: 'Marketing', value: 'Marketing' },
					{ name: 'Product Management', value: 'Product Management' },
					{ name: 'Sales', value: 'Sales' },
					{ name: 'Software Development', value: 'Software Development' },
				],
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1 },
				default: 50,
				description: 'Max number of results to return',
				displayOptions: { show: { resource: ['job'], operation: ['search'] } },
				routing: {
					send: {
						type: 'query',
						property: 'limit',
					},
				},
			},
		],
	};
}

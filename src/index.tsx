import {Command, flags} from '@oclif/command'
import {Octokit} from '@octokit/rest'
import React from 'react'
import {render, Box, Text} from 'ink'
import Table from 'ink-table'

class OclifTriage extends Command {
  static description = 'Jamie’s OCLIF triage tool'

  static flags = {
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),
  }

  static args = [{name: 'file'}]

  async run() {
    const auth = process.env.OCLIF_TRIAGE_TOKEN
    if (!auth) {
      this.error('Please set OCLIF_TRIAGE_TOKEN in your environment')
    }
    const octokit = new Octokit({auth})
    let {data: repos} = await octokit.repos.listForOrg({
      org: 'oclif',
      public: true,
    })
    let rows = await Promise.all(
      repos.map(async (repo) => {
        const {data: issues} = await octokit.issues.listForRepo({
          repo: repo.name,
          owner: repo.owner.login,
          state: 'open'
        })
        const {data:pulls} = await octokit.pulls.list({
          repo: repo.name,
          owner: repo.owner.login,
          state: 'open'
        })

        return {
          repo: repo.full_name,
          issues: issues.length,
          pulls: pulls.length
        }
      })
    )

    rows = rows.filter(row => row.issues || row.pulls)

    rows.sort((a, b) => (b.issues + b.pulls) - (a.issues + a.pulls))

    rows = rows.slice(0, 10)

    render(<Table data={rows} />)
  }
}

export = OclifTriage

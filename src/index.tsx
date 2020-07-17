import {Command, flags} from '@oclif/command'
import {Octokit} from '@octokit/rest'
import React from 'react'
import {render, Text} from 'ink'

class OclifTriage extends Command {
  static description = 'Jamie’s OCLIF triage tool'

  static flags = {
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),
  }

  static args = [{name: 'file'}]

  async run() {
    const octokit = new Octokit()
    const {data} = await octokit.repos.listForOrg({
      org: 'oclif',
      type: 'public',
    })

    render(
      <Text bold color="green">Repos: {data.length}</Text>
    )
  }
}

export = OclifTriage

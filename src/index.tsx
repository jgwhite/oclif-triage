import {Command, flags} from '@oclif/command'
import {Octokit} from '@octokit/rest'
import React, {useState} from 'react'
import {render, Box, Text, Spacer, useInput, useApp} from 'ink'
import {exec} from 'child_process'

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
    const {data:repos} = await octokit.repos.listForOrg({org: 'oclif'})
    const issuesByRepo = await Promise.all(
      repos.map(async (repo) => {
        const {data:issuesForRepo} = await octokit.issues.listForRepo({
          owner: repo.owner.login,
          repo: repo.name,
          sort: 'updated',
          direction: 'desc',
        })

        return issuesForRepo.map(issue => ({ ...issue, repo }))
      })
    )
    const issues = issuesByRepo.flatMap(_ => _)

    issues.sort((a, b) => b.updated_at.localeCompare(a.updated_at))

    render(<UI issues={issues} />)
  }
}

const UI = ({issues}: {issues: any}) => {
  const {exit} = useApp()
  const [cursor,setCursor] = useState(0)
  const issue = issues[cursor]

  const advance = () => {
    if (cursor < issues.length - 1) {
      setCursor(cursor + 1)
    } else {
      exit()
    }
  }

  useInput((input, key) => {
    if (input === 'o') {
      exec(`open ${issue.html_url}`)
      advance();
    }
    if (input === 'n') {
      advance();
    }
    if (input === 'q') {
      exit()
    }
  })

  return (
    <Box borderStyle="double" paddingX={1} flexDirection="column">
      <Text color="gray">{cursor + 1} of {issues.length}</Text>
      <Text> </Text>
      <Text bold>{issue.repo.full_name}</Text>
      <Text>{issue.title}</Text>
      <Text> </Text>
      <Text>(O)pen (N)ext (Q)uit</Text>
    </Box>
  )
}

export = OclifTriage

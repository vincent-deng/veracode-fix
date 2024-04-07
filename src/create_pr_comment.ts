import * as core from '@actions/core'
import * as github from '@actions/github'


export async function createPRComment(results:any, options:any){

    console.log('Results to work with')
    console.log(results)

    const splitResults1 = results.split('---')
    console.log(splitResults1[0])

    core.info('check if we run on a pull request')
    let pullRequest = process.env.GITHUB_REF
    let isPR:any = pullRequest?.indexOf("pull")

    if ( isPR >= 1 ){
        core.info("This run is part of a PR, should add some PR comment")
        const context = github.context
        const repository:any = process.env.GITHUB_REPOSITORY
        const token = core.getInput("token")
        const repo = repository.split("/");
        const commentID:any = context.payload.pull_request?.number

        const commentBody = '<pre>'+splitResults1[0]+'</pre>'

        try {
            const octokit = github.getOctokit(token);

            const { data: comment } = await octokit.rest.issues.createComment({
                owner: repo[0],
                repo: repo[1],
                issue_number: commentID,
                body: commentBody,
            });
            core.info('Adding scan results as comment to PR #'+commentID)
        } catch (error:any) {
            core.info(error);
        }
    }
    else {
        core.info('We are not running on a pull request')
    }

}
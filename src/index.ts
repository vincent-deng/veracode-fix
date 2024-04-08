import { upload, checkFix } from './requests'
import { createFlawInfo } from './createFlawInfo';
import fs from 'fs';
const fsE = require("fs-extra");
import tarModule from 'tar';
import * as core from '@actions/core'
import { checkCWE } from './check_cwe_support';
import { createPRComment } from './create_pr_comment';

import client from '@actions/artifact';


let credentials: any = {}

const vid = core.getInput('vid', { required: true });
//const vid = process.env.vid
credentials['vid'] = vid

const vkey = core.getInput('vkey', { required: true });
//const vkey = process.env.vkey
credentials['vkey'] = vkey



let options: any = {}

const cwe = core.getInput('cwe', { required: false });
options['cwe'] = cwe

const inputFile = core.getInput('inputFile', { required: true });
//const inputFile = process.env.inputFile
options['file'] = inputFile

const source_base_path_1 = core.getInput('source_base_path_1', { required: false });
//const source_base_path_1 = process.env.source_base_path_1
options['source_base_path_1'] = source_base_path_1

const source_base_path_2 = core.getInput('source_base_path_2', { required: false });
//const source_base_path_2 = process.env.source_base_path_2
options['source_base_path_2'] = source_base_path_2

const source_base_path_3 = core.getInput('source_base_path_3', { required: false });
options['source_base_path_3'] = source_base_path_3

const debugValue = core.getInput('debug', { required: false });
//const debugValue = process.env.debugValue
options['DEBUG'] = debugValue;

const language = core.getInput('language', { required: false });
//const language = process.env.language
options['language'] = language

const prComment = core.getInput('prComment', { required: false });
//const prComment = process.env.prComment
options['prComment'] = prComment



async function selectPlatfrom(creds: any) {
    let requestParameters = {}
    if (creds.vid.startsWith('vera01ei-')) {
        requestParameters = {
            apiUrl: 'api.veracode.eu',
            cleanedID: creds.vid?.replace('vera01ei-', '') ?? '',
            cleanedKEY: creds.vkey?.replace('vera01es-', '') ?? ''
        }
        console.log('Region: EU')
    }
    else {
        requestParameters = {
            apiUrl: 'api.veracode.com',
            cleanedID: creds.vid,
            cleanedKEY: creds.vkey
        }
        console.log('Region: US')
    }
    return requestParameters
}

async function createTar(initialFlawInfo: any, options: any) {
    console.log('Creating tarball')
    const flawInfo = await createFlawInfo(initialFlawInfo, options)

    if (options.DEBUG == 'true') {
        console.log('#######- DEBUG MODE -#######')
        console.log('index.ts')
        console.log('flawInfo on index.ts:')
        console.log(JSON.stringify(flawInfo))
        console.log('#######- DEBUG MODE -#######')
    }

    const filepath = flawInfo.sourceFile

    fs.accessSync(filepath, fs.constants.F_OK);
    console.log('File ' + filepath + ' exists');

    await fsE.writeFileSync('flawInfo', JSON.stringify(flawInfo))

    try {
        const tarball = tarModule.create({
            gzip: true,
            file: 'data.tar.gz'
        }, ['flawInfo', filepath]);
        console.error('Tar is created');

        return tarball
    } catch (err) {
        // File does not exist
        console.error('Tar cannot be created');
    }
}


async function run() {

    //read json file
    const jsonRead = fs.readFileSync(options.file, 'utf8')
    const jsonData = JSON.parse(jsonRead);
    const jsonFindings = jsonData.findings
    const flawCount = jsonFindings.length
    console.log('Number of flaws: ' + flawCount)

    //loop through json file
    let i = 0
    for (i = 0; i <= flawCount; i++) {

        const initialFlawInfo = {
            resultsFile: options.file,
            issuedID: jsonFindings[i].issue_id,
            cweID: parseInt(jsonFindings[i].cwe_id),
            language: options.language,
        }

        if (options.DEBUG == 'true') {
            console.log('#######- DEBUG MODE -#######')
            console.log('index.ts - run()')
            console.log('Initial Flaw Info')
            console.log(initialFlawInfo)
            console.log('#######- DEBUG MODE -#######')
        }


        if (options.cwe != null && jsonFindings[i].cwe_id == options.cwe) {
            console.log('Only run Fix for CWE: ' + options.cwe)
            if (await checkCWE(initialFlawInfo, options) == true) {

                const choosePlatform = await selectPlatfrom(credentials)
                const tar = await createTar(initialFlawInfo, options)
                //const uploadTar = await upload(choosePlatform, tar, options)
                //const checkFixResults = await checkFix(choosePlatform, uploadTar, options)
            }
            else {
                console.log('CWE ' + initialFlawInfo.cweID + ' is not supported ' + options.language)
            }
        }
        else {
            console.log('Run Fix for all CWEs')
            if (await checkCWE(initialFlawInfo, options) == true) {
                console.log('CWE ' + initialFlawInfo.cweID + ' is supported for ' + options.language)
                const choosePlatform = await selectPlatfrom(credentials)
                const tar = await createTar(initialFlawInfo, options)
                await client.uploadArtifact('my-artifact', ['data.tar.gz'], 'my-data');
                const uploadTar = await upload(choosePlatform, tar, options)
                const checkFixResults = await checkFix(choosePlatform, uploadTar, options)

                // const exampleFixResults = [
                //     '--- src/main/java/com/veracode/verademo/controller/UserController.java\n' +
                //     '+++ src/main/java/com/veracode/verademo/controller/UserController.java\n' +
                //     '@@ -50,6 +50,7 @@\n' +
                //     ' import com.veracode.verademo.utils.Constants;\n' +
                //     ' import com.veracode.verademo.utils.User;\n' +
                //     ' import com.veracode.verademo.utils.UserFactory;\n' +
                //     '+import java.util.*;\n' +
                //     ' \n' +
                //     ' /**\n' +
                //     '  * @author johnadmin\n' +
                //     '@@ -249,8 +250,11 @@\n' +
                //     ' \n' +
                //     ` \t\t\tString sql = "SELECT password_hint FROM users WHERE username = '" + username + "'";\n` +
                //     ' \t\t\tlogger.info(sql);\n' +
                //     '+\t\t\tSet<String> whitelistUsername = new HashSet<>(Arrays.asList("item1", "item2", "item3"));\n' +
                //     '+\t\t\tif (!username.matches("\\\\w+(\\\\s*\\\\.\\\\s*\\\\w+)*") && !whitelistUsername.contains(username))\n' +
                //     '+\t\t\t    throw new IllegalArgumentException();\n' +
                //     ' \t\t\tStatement statement = connect.createStatement();\n' +
                //     ' \t\t\tResultSet result = statement.executeQuery(sql);\n' +
                //     ' \t\t\tif (result.first()) {\n' +
                //     ' \t\t\t\tString password= result.getString("password_hint");\n' +
                //     ` \t\t\t\tString formatString = "Username '" + username + "' has password: %.2s%s";\n`,
                //     '--- src/main/java/com/veracode/verademo/controller/UserController.java\n' +
                //     '+++ src/main/java/com/veracode/verademo/controller/UserController.java\n' +
                //     '@@ -50,6 +50,7 @@\n' +
                //     ' import com.veracode.verademo.utils.Constants;\n' +
                //     ' import com.veracode.verademo.utils.User;\n' +
                //     ' import com.veracode.verademo.utils.UserFactory;\n' +
                //     '+import java.util.*;\n' +
                //     ' \n' +
                //     ' /**\n' +
                //     '  * @author johnadmin\n' +
                //     '@@ -249,8 +250,13 @@\n' +
                //     ' \n' +
                //     ` \t\t\tString sql = "SELECT password_hint FROM users WHERE username = '" + username + "'";\n` +
                //     ' \t\t\tlogger.info(sql);\n' +
                //     '-\t\t\tStatement statement = connect.createStatement();\n' +
                //     '-\t\t\tResultSet result = statement.executeQuery(sql);\n' +
                //     '+\t\t\tSet<String> whitelistUsername = new HashSet<>(Arrays.asList("item1", "item2", "item3"));\n' +
                //     '+\t\t\tif (!username.matches("\\\\w+(\\\\s*\\\\.\\\\s*\\\\w+)*") && !whitelistUsername.contains(username))\n' +
                //     '+\t\t\t    throw new IllegalArgumentException();\n' +
                //     '+\n' +
                //     '+\t\t\tPreparedStatement statement = connect.prepareStatement(sql);\n' +
                //     '+\n' +
                //     '+\t\t\tResultSet result = statement.executeQuery();\n' +
                //     ' \t\t\tif (result.first()) {\n' +
                //     ' \t\t\t\tString password= result.getString("password_hint");\n' +
                //     ` \t\t\t\tString formatString = "Username '" + username + "' has password: %.2s%s";\n`
                // ]

                console.log(`Fix results: ${checkFixResults}`)

                if (options.prComment == 'true') {
                    console.log('PR Comment')
                    const prComment = await createPRComment(checkFixResults, options, initialFlawInfo)
                }
            }
            else {
                console.log('CWE ' + initialFlawInfo.cweID + ' is NOT supported for ' + options.language)
            }
        }
        i++
    }

}





run()









function foreach(jsonFindings: any, arg1: (key: any, value: any) => void) {
    throw new Error('Function not implemented.');
}


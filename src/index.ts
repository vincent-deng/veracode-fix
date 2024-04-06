import { upload, checkFix } from './requests'
import { createFlawInfo } from './createFlawInfo';
import fs from 'fs';
import tarModule from 'tar';
import * as core from '@actions/core'
import { checkCWE } from './check_cwe_support';

let credentials:any = {}

const vid = core.getInput('vid', {required: true} );
credentials['vid'] = vid

const vkey = core.getInput('vkey', {required: true} );
credentials['vkey'] = vkey



let options:any = {}

const cwe = core.getInput('cwe', {required: false} );
options['cwe'] = cwe

const file = core.getInput('file', {required: true} );
options['file'] = file

const source_base_path_1 = core.getInput('source_base_path_1', {required: false} );
options['source_base_path_1'] = source_base_path_1

const source_base_path_2 = core.getInput('source_base_path_2', {required: false} );
options['source_base_path_2'] = source_base_path_2

const source_base_path_3 = core.getInput('source_base_path_3', {required: false} );
options['source_base_path_3'] = source_base_path_3

const debugValue = core.getInput('debug', {required: false} );
options['DEBUG'] = debugValue




async function selectPlatfrom(creds:any){
    let requestParameters = {}
    if ( creds.vid.startsWith('vera01ei-') ){
        requestParameters = {
            apiUrl : 'api.veracode.eu',
            cleanedID : creds.vid?.replace('vera01ei-','') ?? '',
            cleanedKEY : creds.vkey?.replace('vera01es-','') ?? ''
        }
        console.log('Region: EU')
    }
    else {
        requestParameters = {
            apiUrl : 'api.veracode.com',
            cleanedID : creds.vid,
            cleanedKEY : creds.vkey
        }
        console.log('Region: US')
    }
    return requestParameters
}

async function createTar(initialFlawInfo:any){
    console.log('Creating tarball')
    const flawInfo = await createFlawInfo(initialFlawInfo,options)

    if (options.DEBUG == true){
        console.log('#######- DEBUG MODE -#######')
        console.log('index.ts')
        console.log('flawInfo on index.ts:')
        console.log(JSON.stringify(flawInfo))
        console.log('#######- DEBUG MODE -#######')
    }
    
    const filepath = flawInfo.sourceFile

    fs.accessSync(filepath, fs.constants.F_OK);
    console.log('File '+filepath+' exists');

    fs.writeFileSync('flawInfo', JSON.stringify(flawInfo))

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

    console.log('JSON data')
    console.log(jsonFindings)

    const flawCount = jsonFindings.length

    //loop through json file
    let i = 0
    for (i = 0; i < flawCount; i++) {
        console.log('Flaw number: '+i)

        const initialFlawInfo = {
            resultsFile: options.file,
            issuedID: jsonFindings[i].issue_id,
            cweID: jsonFindings[i].cwe_id
        }

        if ( options.cwe != null && jsonFindings[i].cwe_id == options.cwe ){
            console.log('Only run Fix for CWE: '+options.cwe)
            if (await checkCWE(initialFlawInfo) == true){

                const choosePlatform = await selectPlatfrom(credentials)
                const tar = await createTar(initialFlawInfo)
                //const uploadTar = await upload(choosePlatform, tar, options)
                //const checkFixResults = await checkFix(choosePlatform, uploadTar, options)
            }
            else {
                console.log('CWE '+options.cwe+' is not supported')
            }
        }
        else {
            console.log('Run Fix for all CWEs')
            if (await checkCWE(initialFlawInfo) == true){

                const choosePlatform = await selectPlatfrom(credentials)
                const tar = await createTar(initialFlawInfo)
                //const uploadTar = await upload(choosePlatform, tar, options)
                //const checkFixResults = await checkFix(choosePlatform, uploadTar, options)
            }
            else {
                console.log('CWE '+options.cwe+' is not supported')
            }
        }
        i++
    }
    
}





run()









function foreach(jsonFindings: any, arg1: (key: any, value: any) => void) {
    throw new Error('Function not implemented.');
}

